/**
 * Прайс Альба-Мед — бизнес-логика поверх src/lib/medflex.ts.
 *
 * Отвечает за:
 *  - маппинг понятных имён филиалов (kantar/kievskaya) на lpu_id МедФлекса,
 *  - объединение услуг с категориями, группировку, сортировку, фильтр мусора,
 *  - кэш в памяти процесса (TTL 6 часов) + fallback на последний удачный
 *    ответ (не старше 48ч), если свежий запрос к МедФлексу упал,
 *  - дедупликацию параллельных холодных запросов (thundering herd guard).
 *
 * Кэш — простой Map на уровне модуля (singleton per Node-процесс), как и
 * другие синглтоны в проекте (см. getBookingTransport в lib/booking/transport.ts).
 * Next.js 16 умеет кэшировать через директиву "use cache", но она требует
 * включить cacheComponents в next.config.ts — это глобальный экспериментальный
 * флаг, который затронул бы всё приложение, а не только этот эндпоинт, и его
 * поведение при ошибке фетча ближе к «оставить старое», чем к явному, тестируемому
 * fallback'у, который тут прямо требуется. Поэтому — явный ручной кэш.
 */

import {
  fetchMedflexPrices,
  fetchMedflexCategories,
  MedflexApiError,
  MedflexConfigError,
  type MedflexService,
} from "@/lib/medflex"

export type AlbamedBranch = "kantar" | "kievskaya"

const BRANCH_LPU_IDS: Record<AlbamedBranch, number> = {
  kantar: 71767,
  kievskaya: 60992,
}

export function isAlbamedBranch(value: string): value is AlbamedBranch {
  return value === "kantar" || value === "kievskaya"
}

export interface AlbamedPriceService {
  name: string
  price: number
  duration: number
}

export interface AlbamedPriceCategory {
  category: string
  services: AlbamedPriceService[]
}

export interface AlbamedPricesResponse {
  branch: AlbamedBranch
  updatedAt: string
  categories: AlbamedPriceCategory[]
}


/**
 * Лёгкая версия прайса без списков услуг — только категории и их счётчики.
 * Используется для первичной серверной разметки страницы-витрины
 * (src/app/preview/albamed-price), чтобы не отдавать все 2500+ услуг в HTML
 * до того, как пользователь раскрыл хоть одну категорию. Полные списки
 * услуг подгружаются клиентом лениво через GET /api/albamed/prices.
 */
export interface AlbamedPriceCategorySummary {
  category: string
  count: number
}

export interface AlbamedPricesSummary {
  branch: AlbamedBranch
  updatedAt: string
  categories: AlbamedPriceCategorySummary[]
}

export function toPricesSummary(data: AlbamedPricesResponse): AlbamedPricesSummary {
  return {
    branch: data.branch,
    updatedAt: data.updatedAt,
    categories: data.categories.map((c) => ({ category: c.category, count: c.services.length })),
  }
}

const CACHE_TTL_MS = 6 * 60 * 60 * 1000 // 6 часов

// Потолок устаревания lastGoodCache: прайс в 1С меняется редко, сутки-двое
// простоя МедФлекса пациент переживёт без вреда — но отдавать прайс старше
// этого порога уже не "временная неточность", а прямое вранье о ценах на
// сайте медклиники. Дольше 48 часов честнее сказать "временно недоступно".
const LAST_GOOD_MAX_AGE_MS = 48 * 60 * 60 * 1000

interface CacheEntry {
  data: AlbamedPricesResponse
  fetchedAt: number
}

// Свежий кэш (в пределах TTL) — отдаётся без похода в МедФлекс.
const freshCache = new Map<AlbamedBranch, CacheEntry>()
// Последний удачный ответ (fallback при сбое) — годен, пока не старше LAST_GOOD_MAX_AGE_MS.
const lastGoodCache = new Map<AlbamedBranch, CacheEntry>()
// Запросы "в полёте" — защита от thundering herd на холодном кэше: параллельные
// вызовы для одного филиала ждут один и тот же промис вместо N независимых
// походов в МедФлекс. Запись убирается и при успехе, и при ошибке (.finally),
// иначе один сбой навсегда "заморозит" отклонённый промис для всех последующих.
const inFlight = new Map<AlbamedBranch, Promise<AlbamedPricesResult>>()

function buildPricesResponse(
  branch: AlbamedBranch,
  services: MedflexService[],
  categoryNames: Map<number, string>
): AlbamedPricesResponse {
  const byCategory = new Map<string, AlbamedPriceService[]>()

  for (const svc of services) {
    if (svc.price === 0) continue // незаполненные позиции, не бесплатные услуги

    const categoryName = categoryNames.get(svc.category_id) ?? "Без категории"
    const list = byCategory.get(categoryName) ?? []
    list.push({ name: svc.name, price: svc.price, duration: svc.duration })
    byCategory.set(categoryName, list)
  }

  const categories: AlbamedPriceCategory[] = Array.from(byCategory.entries())
    .map(([category, categoryServices]) => ({
      category,
      services: categoryServices.sort((a, b) => a.name.localeCompare(b.name, "ru")),
    }))
    .sort((a, b) => a.category.localeCompare(b.category, "ru"))

  return {
    branch,
    updatedAt: new Date().toISOString(),
    categories,
  }
}

async function fetchFreshPrices(branch: AlbamedBranch): Promise<AlbamedPricesResponse> {
  const lpuId = BRANCH_LPU_IDS[branch]

  const [services, categories] = await Promise.all([
    fetchMedflexPrices(lpuId),
    fetchMedflexCategories(lpuId),
  ])

  const categoryNames = new Map(categories.map((c) => [c.id, c.name]))
  return buildPricesResponse(branch, services, categoryNames)
}

export interface AlbamedPricesResult {
  data: AlbamedPricesResponse
  /** true, если это кэш из памяти процесса (в пределах TTL), а не живой поход в МедФлекс. */
  fromCache: boolean
  /** true, если МедФлекс сейчас недоступен и отдан последний удачный ответ. */
  stale: boolean
}

/**
 * Отдаёт прайс филиала. Порядок:
 *  1. Свежий кэш (< 6 часов) — сразу, без сети.
 *  2. Если для филиала уже есть запрос "в полёте" — ждём тот же промис
 *     (thundering herd guard), а не запускаем ещё один поход в МедФлекс.
 *  3. Живой запрос к МедФлексу — если успех, обновляет оба кэша.
 *  4. При сбое живого запроса — последний удачный ответ (stale: true), если
 *     он есть и не старше LAST_GOOD_MAX_AGE_MS.
 *  5. Иначе — бросает ошибку (роут превращает её в понятный код ответа).
 */
export async function getAlbamedPrices(branch: AlbamedBranch): Promise<AlbamedPricesResult> {
  const cached = freshCache.get(branch)
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { data: cached.data, fromCache: true, stale: false }
  }

  const pending = inFlight.get(branch)
  if (pending) return pending

  const promise = loadAlbamedPrices(branch).finally(() => {
    inFlight.delete(branch)
  })
  inFlight.set(branch, promise)
  return promise
}

async function loadAlbamedPrices(branch: AlbamedBranch): Promise<AlbamedPricesResult> {
  try {
    const data = await fetchFreshPrices(branch)
    const entry: CacheEntry = { data, fetchedAt: Date.now() }
    freshCache.set(branch, entry)
    lastGoodCache.set(branch, entry)
    return { data, fromCache: false, stale: false }
  } catch (err) {
    const lastGood = lastGoodCache.get(branch)
    const lastGoodAgeMs = lastGood ? Date.now() - lastGood.fetchedAt : Infinity

    if (lastGood && lastGoodAgeMs < LAST_GOOD_MAX_AGE_MS) {
      console.error(
        `[albamed/prices] МедФлекс недоступен для филиала ${branch}, отдаю последний удачный ответ от ${lastGood.data.updatedAt}:`,
        err instanceof Error ? err.message : err
      )
      return { data: lastGood.data, fromCache: false, stale: true }
    }

    if (lastGood) {
      console.error(
        `[albamed/prices] МедФлекс недоступен для филиала ${branch}, последний удачный ответ от ${lastGood.data.updatedAt} старше ${LAST_GOOD_MAX_AGE_MS / 3_600_000}ч — не отдаю его, возвращаю ошибку`
      )
    }

    if (err instanceof MedflexConfigError) throw err
    if (err instanceof MedflexApiError) throw err
    throw new MedflexApiError(
      `Не удалось получить прайс МедФлекса для филиала ${branch}: ${
        err instanceof Error ? err.message : String(err)
      }`
    )
  }
}
