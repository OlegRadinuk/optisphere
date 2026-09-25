#!/usr/bin/env node
/**
 * Проверка живости чат-ботов.
 *
 * ЗАЧЕМ: 2026-08 боты albamed и vlad замолчали и молчали СЕМЬ НЕДЕЛЬ — заметили случайно.
 * Причина была транспортная (Cloudflare душит крупные запросы с РФ-сервера), но суть
 * не в ней: у нас не было ничего, что заметит молчание раньше клиента.
 *
 * КАК: дёргает БОЕВОЙ роут /api/bots/<slug>/chat — именно так, как это делает пациент.
 * Проверять /config бесполезно: он отдавался мгновенно и когда боты лежали.
 *
 * АЛЕРТЫ: пишет в Telegram только на СМЕНЕ состояния (упал / поднялся) плюс напоминание
 * раз в сутки, пока лежит. Иначе канал превращается в шум и его перестают читать.
 *
 * ЗАПУСК: node scripts/bots-healthcheck.mjs   (из /var/www/optisphere, по крону)
 */
import fs from "fs"
import path from "path"
import Database from "better-sqlite3"

const BASE = process.env.HEALTHCHECK_BASE ?? "https://optisphere.tech"
const DB_PATH = process.env.DB_PATH ?? "/var/www/optisphere/data/bots.db"
const STATE_PATH = process.env.HEALTHCHECK_STATE ?? "/var/www/optisphere/data/bots-health.json"
const TG_RELAY = "https://tg-proxy.radinuko.workers.dev"
const REQUEST_TIMEOUT_MS = 60_000
const REMIND_AFTER_MS = 24 * 60 * 60 * 1000

// Текст, которым роут отвечает при сбое — по нему и отличаем «ответил» от «отписался ошибкой»
const FAILURE_MARKERS = ["Произошла ошибка", "слишком долго", "Извините, запрос"]

function loadEnv() {
  // На проде переменные лежат в .env.local рядом с приложением
  for (const f of [".env.local", "/var/www/optisphere/.env.local"]) {
    try {
      for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
        const t = line.trim()
        if (!t || t.startsWith("#") || !t.includes("=")) continue
        const i = t.indexOf("=")
        const k = t.slice(0, i).trim()
        if (!process.env[k]) process.env[k] = t.slice(i + 1).trim().replace(/^["']|["']$/g, "")
      }
      break
    } catch {}
  }
}

async function tg(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const chat = process.env.TELEGRAM_CHAT_ID
  if (!token || !chat) {
    console.error("[healthcheck] нет TELEGRAM_BOT_TOKEN/CHAT_ID — уведомление не отправлено")
    return
  }
  try {
    // Telegram с РФ-сервера заблокирован, шлём через своё реле на Cloudflare
    await fetch(`${TG_RELAY}/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(15_000),
    })
  } catch (e) {
    console.error("[healthcheck] не смог отправить в Telegram:", e?.name)
  }
}

async function probe(slug) {
  const t0 = Date.now()
  try {
    const r = await fetch(`${BASE}/api/bots/${slug}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId: `healthcheck-${new Date().toISOString().slice(0, 10)}`,
        messages: [{ role: "user", content: "здравствуйте" }],
      }),
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
    const body = await r.text()
    const ms = Date.now() - t0
    if (r.status !== 200) return { ok: false, ms, why: `HTTP ${r.status}` }
    if (FAILURE_MARKERS.some((m) => body.includes(m))) return { ok: false, ms, why: "бот вернул ошибку" }
    if (body.trim().length < 10) return { ok: false, ms, why: "пустой ответ" }
    return { ok: true, ms, sample: body.trim().slice(0, 60) }
  } catch (e) {
    return { ok: false, ms: Date.now() - t0, why: e?.name === "TimeoutError" ? "таймаут" : `обрыв (${e?.name})` }
  }
}

function readState() {
  try { return JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) } catch { return {} }
}
function writeState(s) {
  try {
    fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true })
    fs.writeFileSync(STATE_PATH, JSON.stringify(s, null, 1))
  } catch (e) {
    console.error("[healthcheck] не смог записать состояние:", e?.message)
  }
}

async function main() {
  loadEnv()

  let bots = []
  try {
    const db = new Database(DB_PATH, { readonly: true })
    bots = db.prepare("select slug, name from clients where active = 1 order by slug").all()
    db.close()
  } catch (e) {
    await tg(`🔴 Проверка ботов не смогла открыть базу\n<code>${DB_PATH}</code>\n${e?.message ?? e}`)
    process.exit(0)
  }

  if (!bots.length) {
    console.log("[healthcheck] активных ботов нет")
    return
  }

  const state = readState()
  const now = Date.now()
  const lines = []

  for (const b of bots) {
    let res = await probe(b.slug)
    // Один повтор — чтобы разовый сетевой чих не поднимал тревогу
    if (!res.ok) {
      await new Promise((r) => setTimeout(r, 4000))
      res = await probe(b.slug)
    }

    const prev = state[b.slug] ?? { ok: true, since: now, notified: 0 }
    const mark = res.ok ? "OK  " : "СБОЙ"
    console.log(`${mark} ${b.slug.padEnd(20)} ${res.ms} мс ${res.ok ? "" : "— " + res.why}`)
    lines.push(`${res.ok ? "✅" : "🔴"} <b>${b.name}</b> (${b.slug}) — ${res.ok ? `${(res.ms / 1000).toFixed(1)} с` : res.why}`)

    if (!res.ok && prev.ok) {
      await tg(`🔴 <b>Бот замолчал</b>\n\n${b.name} (<code>${b.slug}</code>)\nПричина: ${res.why}\n\nПроверить: ${BASE}/api/bots/${b.slug}/chat`)
      state[b.slug] = { ok: false, since: now, notified: now }
    } else if (!res.ok && !prev.ok) {
      const down = Math.round((now - prev.since) / 3600000)
      if (now - (prev.notified ?? 0) > REMIND_AFTER_MS) {
        await tg(`🔴 <b>Бот всё ещё молчит</b>\n\n${b.name} (<code>${b.slug}</code>)\nНе отвечает уже ${down} ч\nПричина: ${res.why}`)
        state[b.slug] = { ok: false, since: prev.since, notified: now }
      } else {
        state[b.slug] = { ok: false, since: prev.since, notified: prev.notified }
      }
    } else if (res.ok && !prev.ok) {
      const down = Math.round((now - prev.since) / 3600000)
      await tg(`✅ <b>Бот снова отвечает</b>\n\n${b.name} (<code>${b.slug}</code>)\nМолчал ${down} ч\nОтвет за ${(res.ms / 1000).toFixed(1)} с`)
      state[b.slug] = { ok: true, since: now, notified: 0 }
    } else {
      state[b.slug] = { ok: true, since: prev.since ?? now, notified: 0 }
    }
  }

  writeState(state)

  if (process.argv.includes("--report")) {
    await tg(`📊 <b>Состояние ботов</b>\n\n${lines.join("\n")}`)
  }
}

main().catch(async (e) => {
  console.error(e)
  await tg(`🔴 Проверка ботов упала с ошибкой\n<code>${String(e?.message ?? e).slice(0, 300)}</code>`)
  process.exit(0)
})
