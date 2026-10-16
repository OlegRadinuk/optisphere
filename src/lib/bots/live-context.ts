/**
 * Живой контекст для system prompt бота: карта «slug → провайдер».
 * Провайдер возвращает готовый текстовый блок (или null, если данных нет) —
 * чат-роут не знает, что внутри. Чтобы подключить другого бота — добавить запись в карту.
 */

import {
  getAlbamedPrices,
  getAlbamedLastGood,
  type AlbamedBranch,
  type AlbamedPricesResponse,
  type AlbamedPricesResult,
} from "@/lib/albamed/prices"

export interface LiveContextResult {
  /** Текст, дописываемый в system prompt (уже с заголовком и правилами). */
  text: string
  /** Для логов: источник/свежесть. */
  note: string
  /** true — данных нет, text содержит только «временно недоступно». */
  degraded: boolean
}

export type LiveContextProvider = () => Promise<LiveContextResult>

/** Потолок на получение живых данных при холодном кэше. Кэш прогрет почти всегда — это мгновенно. */
export const LIVE_CONTEXT_TIMEOUT_MS = 2500

const BRANCHES: Array<{ id: AlbamedBranch; label: string }> = [
  { id: "kantar", label: "Кантар" },
  { id: "kievskaya", label: "Киевская" },
]

function fmtPrice(n: number): string {
  return String(n)
}

/** Компактный текст прайса: категория → «услуга — цена ₽»; если цены филиалов различаются — обе. */
export function buildAlbamedPriceText(
  results: Array<{ label: string; data: AlbamedPricesResponse }>
): string {
  type Row = { name: string; prices: Map<string, number> }
  const cats = new Map<string, Map<string, Row>>()
  for (const { label, data } of results) {
    for (const c of data.categories) {
      const rows = cats.get(c.category) ?? new Map<string, Row>()
      // Одноимённые услуги в одной категории (с разной ценой) не склеиваем: ключ = имя + порядковый номер.
      const occurrence = new Map<string, number>()
      for (const s of c.services) {
        const n = (occurrence.get(s.name) ?? 0) + 1
        occurrence.set(s.name, n)
        const key = `${s.name}|#${n}`
        const row = rows.get(key) ?? { name: s.name, prices: new Map<string, number>() }
        row.prices.set(label, s.price)
        rows.set(key, row)
      }
      cats.set(c.category, rows)
    }
  }

  const allLabels = results.map((r) => r.label)
  const lines: string[] = []
  const sortedCats = Array.from(cats.keys()).sort((a, b) => a.localeCompare(b, "ru"))
  for (const cat of sortedCats) {
    lines.push(`${cat}:`)
    const rows = Array.from(cats.get(cat)!.values()).sort((a, b) => a.name.localeCompare(b.name, "ru"))
    for (const row of rows) {
      const vals = Array.from(row.prices.values())
      const same = vals.every((v) => v === vals[0])
      if (same && row.prices.size === allLabels.length) {
        lines.push(`- ${row.name} — ${fmtPrice(vals[0])} ₽`)
      } else if (same && row.prices.size === 1) {
        // услуга есть только в одном филиале
        lines.push(`- ${row.name} — ${fmtPrice(vals[0])} ₽ (только ${Array.from(row.prices.keys())[0]})`)
      } else {
        const parts = allLabels
          .filter((l) => row.prices.has(l))
          .map((l) => `${l} ${fmtPrice(row.prices.get(l)!)}`)
        lines.push(`- ${row.name} — ${parts.join(" / ")} ₽`)
      }
    }
    lines.push("")
  }
  return lines.join("\n").trim()
}

const PRICE_RULES = `Правила по ценам: цены называй ТОЛЬКО из этого прайса. Если услуги в прайсе нет — так и скажи и предложи уточнить у администратора. Не придумывай услуги и цены. Если у услуги две цены (Кантар / Киевская) — назови цену того филиала, который выбрал пациент, а если филиал не выбран — обе.`

/**
 * Stale-while-revalidate: ждём свежий/кэшированный прайс не дольше LIVE_CONTEXT_TIMEOUT_MS;
 * при таймауте берём lastGood (моложе 48 ч). Сам запрос не отменяется — он продолжает
 * идти в фоне через inFlight-guard в prices.ts и обновит кэш для следующих сообщений.
 */
async function getBranchPrices(id: AlbamedBranch): Promise<AlbamedPricesResult> {
  const pending = getAlbamedPrices(id)
  pending.catch(() => {}) // фоновый запрос после таймаута не должен давать unhandled rejection
  let timer: ReturnType<typeof setTimeout> | undefined
  const TIMEOUT = Symbol("timeout")
  try {
    const r = await Promise.race([
      pending,
      new Promise<typeof TIMEOUT>((resolve) => {
        timer = setTimeout(() => resolve(TIMEOUT), LIVE_CONTEXT_TIMEOUT_MS)
      }),
    ])
    if (r !== TIMEOUT) return r
    const stale = getAlbamedLastGood(id)
    if (stale) return stale
    throw new Error(`timeout ${LIVE_CONTEXT_TIMEOUT_MS}ms, no lastGood`)
  } finally {
    if (timer) clearTimeout(timer)
  }
}

async function albamedPriceProvider(): Promise<LiveContextResult> {
  const settled = await Promise.allSettled(BRANCHES.map((b) => getBranchPrices(b.id)))
  const ok: Array<{ label: string; data: AlbamedPricesResponse }> = []
  const notes: string[] = []
  settled.forEach((r, i) => {
    const b = BRANCHES[i]
    if (r.status === "fulfilled") {
      ok.push({ label: b.label, data: r.value.data })
      notes.push(`${b.id}:${r.value.fromCache ? "cache" : "live"}${r.value.stale ? "(stale)" : ""}`)
    } else if (r.status === "rejected") {
      notes.push(`${b.id}:FAIL ${r.reason instanceof Error ? r.reason.message : String(r.reason)}`)
    }
  })

  if (ok.length === 0) {
    return {
      text: "ПРАЙС ВРЕМЕННО НЕДОСТУПЕН — по ценам предлагай уточнить у администратора, цены не называй.",
      note: notes.join(", "),
      degraded: true,
    }
  }

  const updated = ok
    .map((o) => o.data.updatedAt)
    .sort()[0]
  const dateStr = new Date(updated).toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  const missing = BRANCHES.filter((b) => !ok.some((o) => o.label === b.label)).map((b) => b.label)
  const missingNote = missing.length
    ? `\nВНИМАНИЕ: прайс филиала ${missing.join(", ")} сейчас недоступен — по нему цены не называй, предложи уточнить у администратора.`
    : ""

  const text = `━━━ АКТУАЛЬНЫЙ ПРАЙС (из системы клиники, обновлено ${dateStr}) ━━━
${PRICE_RULES}${missingNote}

${buildAlbamedPriceText(ok)}`
  return { text, note: notes.join(", "), degraded: false }
}

/** slug бота → провайдер живого контекста. */
export const LIVE_CONTEXT_PROVIDERS: Record<string, LiveContextProvider> = {
  albamed: albamedPriceProvider,
}

/**
 * Возвращает живой контекст для бота или null, если для slug провайдера нет.
 * Не бросает: при таймауте/ошибке — degraded-результат (бот работает без данных).
 */
export async function getLiveContext(slug: string): Promise<LiveContextResult | null> {
  const provider = LIVE_CONTEXT_PROVIDERS[slug]
  if (!provider) return null
  const unavailable: LiveContextResult = {
    text: "ПРАЙС ВРЕМЕННО НЕДОСТУПЕН — по ценам предлагай уточнить у администратора, цены не называй.",
    note: "timeout/error",
    degraded: true,
  }
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await Promise.race([
      provider(),
      new Promise<LiveContextResult>((resolve) => {
        timer = setTimeout(() => resolve({ ...unavailable, note: `outer timeout` }), LIVE_CONTEXT_TIMEOUT_MS + 1000)
      }),
    ])
  } catch (err) {
    console.warn(`[bots/${slug}/live-context] provider failed:`, err instanceof Error ? err.message : err)
    return { ...unavailable, note: "error" }
  } finally {
    if (timer) clearTimeout(timer)
  }
}
