import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug, saveLead, getMessagesBySession } from "@/lib/db"
import { buildTgSummary } from "@/lib/bot-summary"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`https://tg-proxy.radinuko.workers.dev/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    })
  } catch (err) {
    console.error("[lead/telegram]", err)
  }
}

// ── Rate limiter ──────────────────────────────────────────────────────────────
// In-memory Map — works because PM2 runs in fork mode (1 Node process per bot
// instance); counters reset on pm2 reload, which is acceptable for this use-case.
//
// Per-IP limits (all sources):
//   chat/booking — 5 / 10 min  (browser users)
//   cf7          — 20 / 10 min (WordPress S2S; softer until devops sets exempt IP)
//   import       — 5 / 10 min
// IPs in LEAD_RATE_EXEMPT_IPS (comma-separated env var) bypass per-IP checks entirely
// (devops sets this to the WordPress server IP for alba-medcenter.ru).
// Soft per-slug flood cap: 60 / 10 min (catches spoofed sources and bulk abuse).
const leadRateLimitMap = new Map<string, number[]>()
const RATE_WINDOW_MS = 10 * 60_000

const EXEMPT_IPS: Set<string> = new Set(
  (process.env.LEAD_RATE_EXEMPT_IPS ?? "").split(",").map((s) => s.trim()).filter(Boolean)
)

function checkRateCount(key: string, limit: number): boolean {
  const now = Date.now()
  const cutoff = now - RATE_WINDOW_MS
  const ts = (leadRateLimitMap.get(key) ?? []).filter((t) => t > cutoff)
  if (ts.length >= limit) return false
  ts.push(now)
  leadRateLimitMap.set(key, ts)
  return true
}

function perIpLimit(source: string): number {
  if (source === "cf7") return 20
  return 5
}

// ── Input validation ──────────────────────────────────────────────────────────
// Requires 7–20 chars from allowed set AND at least 7 digit characters.
const PHONE_RE = /^(?=(?:[^0-9]*[0-9]){7})[+\d()[\]\-\s]{7,20}$/
const ALLOWED_SOURCES = ["chat", "cf7", "booking", "import"] as const
type AllowedSource = typeof ALLOWED_SOURCES[number]

function validateLeadBody(body: unknown): {
  ok: true
  data: { name: string; phone: string; email: string; message: string; sessionId: string; source: AllowedSource }
} | { ok: false; error: string } {
  if (!body || typeof body !== "object") return { ok: false, error: "Invalid body" }
  const b = body as Record<string, unknown>

  const name      = typeof b.name      === "string" ? b.name.trim()      : ""
  const phone     = typeof b.phone     === "string" ? b.phone.trim()     : ""
  const email     = typeof b.email     === "string" ? b.email.trim()     : ""
  const message   = typeof b.message   === "string" ? b.message.trim()   : ""
  const sessionId = typeof b.sessionId === "string" ? b.sessionId.trim() : ""
  const source    = typeof b.source    === "string" ? b.source           : "chat"
  // Honeypot: bots fill hidden `website` field; legitimate users leave it empty
  const website   = typeof b.website   === "string" ? b.website          : ""

  if (!phone && !email)                    return { ok: false, error: "phone or email required" }
  if (phone && !PHONE_RE.test(phone))      return { ok: false, error: "invalid phone format" }
  if (name.length > 100)             return { ok: false, error: "name too long" }
  if (message.length > 1000)         return { ok: false, error: "message too long" }
  if (!ALLOWED_SOURCES.includes(source as AllowedSource)) {
    return { ok: false, error: "invalid source" }
  }
  if (website) return { ok: false, error: "rejected" } // honeypot triggered

  return { ok: true, data: { name, phone, email, message, sessionId, source: source as AllowedSource } }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const origin = request.headers.get("origin") ?? "*"
  const cors = corsHeaders(origin)

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: cors })
  }

  let rawBody: unknown
  try {
    rawBody = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors })
  }

  const validated = validateLeadBody(rawBody)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400, headers: cors })
  }
  const { name, phone, email, message, sessionId, source } = validated.data

  // Rate limit — applied after validation so we know the source.
  // Per-IP check skipped for IPs in LEAD_RATE_EXEMPT_IPS (e.g. WordPress server).
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
          ?? request.headers.get("x-real-ip")
          ?? "unknown"
  const ipExempt = EXEMPT_IPS.has(ip)
  const rateLimitExceeded =
    (!ipExempt && !checkRateCount(`ip:${ip}:${slug}`, perIpLimit(source))) ||
    !checkRateCount(`slug:${slug}`, 60)
  if (rateLimitExceeded) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: cors }
    )
  }

  saveLead({
    client_id: client.id,
    session_id: sessionId,
    name,
    phone,
    email,
    message,
    source,
  })

  // Telegram notification
  if (client.tg_token && client.tg_chat_id) {
    const mskTime = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    let fullText: string

    if (!client.tg_include_transcript || client.consent_required) {
      // Privacy guard: send structured summary, NEVER raw chat text.
      // Triggers when tg_include_transcript=0 OR consent_required=1 (medical bots).
      // Double condition prevents a deploy-window regression where the column was just
      // added with DEFAULT 1 but the UPDATE hasn't propagated yet (ст. 10 152-ФЗ / врачебная тайна).
      // `message` is deliberately IGNORED even when non-empty: /lead also accepts
      // source=cf7/booking/import, and a CF7 form could map a "жалоба"/"вопрос" field to
      // `message` — that raw text must never reach Telegram unfiltered.
      const sourceLabelPlain: Record<string, string> = {
        chat: "из чата",
        cf7: "с формы сайта",
        booking: "запись с сайта",
        import: "импорт",
      }
      let summary = { service: "уточняется", doctor: "", time: "" }
      if (sessionId) {
        const msgs = getMessagesBySession(client.id, sessionId, 10)
        summary = buildTgSummary(msgs, client.quick_replies)
      }
      const lines = [
        `Новая заявка — ${client.name} (${sourceLabelPlain[source] ?? source})`,
        `Имя: ${name || "—"}`,
        `Телефон: ${phone || "—"}`,
        `Услуга/повод: ${summary.service}`,
      ]
      if (summary.doctor) lines.push(`Врач: ${summary.doctor}`)
      if (summary.time) lines.push(`Желаемое время: ${summary.time}`)
      lines.push("Переписка доступна в кабинете")
      fullText = lines.join("\n")
    } else {
      const sourceLabel: Record<string, string> = {
        chat: "💬 из чата",
        cf7: "📝 с формы сайта",
        booking: "📅 запись с сайта",
        import: "📥 импорт",
      }
      fullText = [
        `🔔 <b>Новая заявка — ${client.name}</b> (${sourceLabel[source] ?? source})`,
        "",
        `👤 ${name || "—"}`,
        ...(phone ? [`📞 ${phone}`] : []),
        ...(email ? [`✉️ ${email}`] : []),
        ...(message ? [`💬 ${message}`] : []),
      ].join("\n")

      // Append last 10 messages from this session
      if (sessionId) {
        const msgs = getMessagesBySession(client.id, sessionId, 10).reverse()
        if (msgs.length > 0) {
          const botName = client.widget_title || client.name
          const history = msgs
            .map((m) => `${m.role === "user" ? "👤 Клиент" : `🤖 ${botName}`}: ${m.content.replace(/\[SAVE_LEAD\]/g, "").replace(/\[SHOW_FORM\]/g, "").trim().slice(0, 500)}`)
            .join("\n\n")
          fullText += `\n\n<b>💬 Переписка:</b>\n${history}`
        }
      }
    }

    fullText += `\n\n⏱️ ${mskTime} МСК`

    const chatIds = client.tg_chat_id.split(",").map((id: string) => id.trim()).filter(Boolean)
    await Promise.all(chatIds.map((chatId: string) => sendTelegram(client.tg_token, chatId, fullText)))
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
