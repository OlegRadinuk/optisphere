/**
 * POST /api/booking/albamed/create
 *
 * Публичная запись на приём в Альбамед.
 * - Zod-валидация + обязательное согласие на ПД (152-ФЗ)
 * - Rate limit: 5 req / мин / IP
 * - Honeypot поле: website (скрыто в UI)
 * - Делегирует в getBookingTransport().createBooking()
 * - При успехе — дублирует лид в leads + Telegram-уведомление (если настроен токен клиента)
 * - CORS: по origin
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/db"
import { getBookingTransport, normalizePhone } from "@/lib/booking/transport"

const CLIENT_ID = 1

const BookingSchema = z.object({
  // Honeypot: ботозащита — настоящий пользователь не заполняет это поле
  website: z.string().max(0, "Поле не должно быть заполнено").optional(),
  doctor_id: z.number().int().positive("doctor_id должен быть положительным числом"),
  service: z.string().max(500).default(""),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты (YYYY-MM-DD)"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Неверный формат времени (HH:MM)"),
  name: z.string().min(2, "Введите имя (минимум 2 символа)").max(200),
  phone: z
    .string()
    .regex(/^[\d\s\+\(\)\-]{10,18}$/, "Введите корректный телефон")
    .refine(
      (v) => normalizePhone(v) !== null,
      "Введите российский номер телефона (+7 или 8...)"
    ),
  comment: z.string().max(1000).optional(),
  consent: z.literal(true, {
    error: "Необходимо согласие на обработку персональных данных",
  }),
})

// Rate limit: 5 запросов / минуту / IP
const rateMap = new Map<string, number[]>()
const RATE_LIMIT = 5
const RATE_WINDOW_MS = 60_000

function checkRate(ip: string): boolean {
  const now = Date.now()
  const window = now - RATE_WINDOW_MS
  const ts = (rateMap.get(ip) ?? []).filter((t) => t > window)
  if (ts.length >= RATE_LIMIT) return false
  ts.push(now)
  rateMap.set(ip, ts)
  return true
}

// Telegram-уведомление (переиспользуем прокси из проекта)
async function notifyTelegram(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://tg-proxy.radinuko.workers.dev/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
  } catch (err) {
    console.error("[booking/albamed/create/telegram]", err)
  }
}

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

export async function POST(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*"
  const cors = corsHeaders(origin)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRate(ip)) {
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

  const parsed = BookingSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.issues, error: parsed.error.issues[0]?.message ?? "Ошибка валидации" },
      { status: 400, headers: cors }
    )
  }

  const { website, doctor_id, service, date, time, name, phone, comment } = parsed.data

  // Honeypot check — бот заполнил скрытое поле
  if (website && website.length > 0) {
    // Возвращаем 200 чтобы не раскрывать ловушку
    return NextResponse.json({ success: true }, { headers: cors })
  }

  // Нельзя записаться на прошедшее время
  const slotDateTime = new Date(`${date}T${time}:00`)
  if (slotDateTime <= new Date()) {
    return NextResponse.json(
      { error: "Нельзя записаться на прошедшее время" },
      { status: 400, headers: cors }
    )
  }

  // Получаем duration_min из appointments (дефолт 30 мин)
  const durationMin = 30

  try {
    const transport = getBookingTransport()
    const result = await transport.createBooking({
      doctorId: doctor_id,
      service,
      date,
      time,
      durationMin,
      name,
      phone,
      comment,
    })

    if (!result.success) {
      const status = result.error === "Слот уже занят" ? 409 : 400
      return NextResponse.json({ error: result.error }, { status, headers: cors })
    }

    // Дублируем лид в admin-дашборд
    try {
      const db = getDb()
      const doctor = db
        .prepare("SELECT name FROM doctors WHERE id = ? AND client_id = ?")
        .get(doctor_id, CLIENT_ID) as { name: string } | undefined

      const normalizedPhone = normalizePhone(phone) ?? phone
      const message = [
        doctor ? `Запись к ${doctor.name}` : "Онлайн-запись",
        service ? `· ${service}` : "",
        `на ${date} ${time}`,
        comment ? `· ${comment}` : "",
      ].filter(Boolean).join(" ")

      db.prepare(
        `INSERT INTO leads (client_id, session_id, name, phone, email, message, source)
         VALUES (?, '', ?, ?, '', ?, 'booking')`
      ).run(CLIENT_ID, name, normalizedPhone, message)

      // Telegram-уведомление клиента (если токен настроен у client_id=1)
      const client = db
        .prepare("SELECT tg_token, tg_chat_id, name FROM clients WHERE id = ?")
        .get(CLIENT_ID) as { tg_token: string; tg_chat_id: string; name: string } | undefined

      if (client?.tg_token && client.tg_chat_id) {
        const mskTime = new Date().toLocaleString("ru-RU", {
          timeZone: "Europe/Moscow",
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
        const text = [
          `📅 <b>Новая онлайн-запись — ${client.name}</b>`,
          "",
          `👤 ${name}`,
          `📞 ${normalizedPhone}`,
          doctor ? `👨‍⚕️ ${doctor.name}` : "",
          service ? `💊 ${service}` : "",
          `🗓 ${date} ${time}`,
          comment ? `💬 ${comment}` : "",
          "",
          `⏱ ${mskTime} МСК`,
        ].filter(Boolean).join("\n")

        const chatIds = client.tg_chat_id.split(",").map((id) => id.trim()).filter(Boolean)
        await Promise.all(chatIds.map((chatId) => notifyTelegram(client.tg_token, chatId, text)))
      }
    } catch (leadErr) {
      // Лид не критичен — запись уже создана
      console.error("[booking/albamed/create lead/notify]", leadErr)
    }

    return NextResponse.json(
      { success: true, appointmentId: result.appointmentId },
      { status: 201, headers: cors }
    )
  } catch (err) {
    console.error("[booking/albamed/create POST]", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
