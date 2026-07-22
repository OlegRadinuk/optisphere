/**
 * POST /api/booking/albamed/callback
 *
 * Fallback «перезвоните мне» — лид без создания записи в МедФлекс.
 * Принимает только имя + телефон + согласие (honeypot website).
 * Пишет в таблицу leads и уведомляет Telegram через token/chat_id клиента.
 *
 * Защита: honeypot, rate limit 5/мин/IP, Zod-валидация.
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { normalizePhone } from "@/lib/booking/transport"
import { checkRateLimit } from "@/lib/booking/rate-limit"

const CLIENT_ID = 1

/** Экранирование пользовательских полей для Telegram parse_mode:HTML */
function escHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

// ── CORS whitelist ────────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  "https://alba-medcenter.ru",
  "https://www.alba-medcenter.ru",
])

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Content-Type"
  }
  return headers
}

// ── Schema ────────────────────────────────────────────────────────────────────

const CallbackSchema = z.object({
  website: z.string().max(0).optional(), // honeypot
  name: z.string().min(2, "Введите имя (минимум 2 символа)").max(200),
  phone: z
    .string()
    .regex(/^[\d\s\+\(\)\-]{10,18}$/, "Введите корректный телефон")
    .refine(
      (v) => normalizePhone(v) !== null,
      "Введите российский номер телефона (+7 или 8...)"
    ),
  consent: z.literal(true, {
    error: "Необходимо согласие на обработку персональных данных",
  }),
})

// ── Rate limit (SQLite: общий для PM2-воркеров, переживает рестарт) ─────────────

const RATE_LIMIT = 5

// ── Telegram ──────────────────────────────────────────────────────────────────

async function notifyTelegram(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://tg-proxy.radinuko.workers.dev/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
  } catch (err) {
    console.error("[booking/albamed/callback/telegram]", err)
  }
}

// ── POST handler ──────────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRateLimit(ip, RATE_LIMIT)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429, headers: cors }
    )
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Неверный формат запроса" }, { status: 400, headers: cors })
  }

  const parsed = CallbackSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      {
        errors: parsed.error.issues,
        error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
      },
      { status: 400, headers: cors }
    )
  }

  const { website, name, phone } = parsed.data

  // Honeypot
  if (website && website.length > 0) {
    return NextResponse.json({ success: true }, { headers: cors })
  }

  const normalizedPhone = normalizePhone(phone) ?? phone

  try {
    const db = getDb()

    // Пишем лид в leads
    db.prepare(
      `INSERT INTO leads (client_id, session_id, name, phone, email, message, source)
       VALUES (?, '', ?, ?, '', 'Запрос обратного звонка (онлайн-запись)', 'callback')`
    ).run(CLIENT_ID, name, normalizedPhone)

    // Telegram-уведомление через токен клиента (не глобальный бот студии)
    const client = db
      .prepare("SELECT tg_token, tg_chat_id, name AS clinic_name FROM clients WHERE id = ?")
      .get(CLIENT_ID) as { tg_token: string; tg_chat_id: string; clinic_name: string } | undefined

    if (client?.tg_token && client.tg_chat_id) {
      const mskTime = new Date().toLocaleString("ru-RU", {
        timeZone: "Europe/Moscow",
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
      const text = [
        `<b>Запрос обратного звонка — ${escHtml(client.clinic_name)}</b>`,
        "",
        `Имя: ${escHtml(name)}`,
        `Телефон: ${normalizedPhone}`,
        "",
        `${mskTime} МСК`,
      ].join("\n")

      const chatIds = client.tg_chat_id.split(",").map((id) => id.trim()).filter(Boolean)
      await Promise.all(chatIds.map((chatId) => notifyTelegram(client.tg_token, chatId, text)))
    }

    return NextResponse.json({ success: true }, { status: 201, headers: cors })
  } catch (err) {
    console.error("[booking/albamed/callback POST]", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
