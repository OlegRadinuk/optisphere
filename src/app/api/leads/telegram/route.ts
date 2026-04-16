import { NextRequest, NextResponse } from "next/server"

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type Intent = "hot" | "warm" | "cold"

type RequestBody = {
  contact: string
  name?: string
  callTime?: string
  intent: Intent
  summary: string
  dialog: ChatMessage[]
  calcResult?: string
}

// Rate limit: 5 leads per hour per IP
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60 * 60 * 1000 // 1 hour

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_WINDOW_MS
  const timestamps = (rateLimitMap.get(ip) ?? []).filter(
    (t) => t > windowStart
  )
  if (timestamps.length >= RATE_LIMIT) return false
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return true
}

const intentEmoji: Record<Intent, string> = {
  hot: "🔥",
  warm: "⚡",
  cold: "❄️",
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests", code: "RATE_LIMIT" },
      { status: 429 }
    )
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  const { contact, name, callTime, intent, summary, dialog, calcResult } = body

  if (!contact || contact.trim().length < 3) {
    return NextResponse.json(
      { error: "contact is required", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  if (!intent || !["hot", "warm", "cold"].includes(intent)) {
    return NextResponse.json(
      { error: "intent must be hot | warm | cold", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  if (!summary || summary.trim().length < 3) {
    return NextResponse.json(
      { error: "summary is required", code: "VALIDATION_ERROR" },
      { status: 400 }
    )
  }

  const token = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!token || !chatId) {
    console.error(
      "[leads/telegram] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID"
    )
    return NextResponse.json(
      { error: "Service unavailable", code: "CONFIG_ERROR" },
      { status: 503 }
    )
  }

  const emoji = intentEmoji[intent]
  const dialogLines = Array.isArray(dialog)
    ? dialog
        .slice(-6)
        .map((m) => `${m.role === "user" ? "👤" : "🤖"} ${m.content}`)
        .join("\n\n")
    : ""

  const timestamp = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  })

  const text =
    `${emoji} <b>Новая заявка — Optisphere</b>\n\n` +
    (name ? `👤 <b>Имя:</b> ${name}\n` : "") +
    `📞 <b>Контакт:</b> ${contact}\n` +
    (callTime ? `🕐 <b>Удобное время:</b> ${callTime}\n` : "") +
    `\n🎯 <b>Интерес:</b> ${intent === "hot" ? "Горячий" : intent === "warm" ? "Тёплый" : "Холодный"}\n` +
    `📋 <b>Суть запроса:</b> ${summary}\n` +
    (calcResult ? `🧮 <b>Калькулятор:</b> ${calcResult}\n` : "") +
    (dialogLines
      ? `\n💬 <b>Диалог:</b>\n${dialogLines}\n`
      : "") +
    `\n⏰ ${timestamp} МСК`

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "HTML",
        }),
      }
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(
        "[leads/telegram] Telegram API error:",
        response.status,
        errorBody
      )
      return NextResponse.json(
        { error: "Failed to send message", code: "SEND_ERROR" },
        { status: 502 }
      )
    }
  } catch (err) {
    console.error("[leads/telegram] Network error:", err)
    return NextResponse.json(
      { error: "Service unavailable", code: "NETWORK_ERROR" },
      { status: 503 }
    )
  }

  return NextResponse.json({ success: true })
}
