/**
 * POST /api/booking/albamed/create
 *
 * Публичная запись на приём в Альбамед.
 *
 * Поддерживает оба режима транспорта (BOOKING_TRANSPORT=local|medflex):
 *   LOCAL:    name + phone + doctor_id + date + time
 *   MEDFLEX:  last_name + first_name + second_name? + birthday + phone
 *             + doctor_id + lpu_id + speciality_id + dt_start + dt_end + price
 *
 * Схема принимает ОБА набора полей — определяет актуальность поля транспорт.
 * При consent: false (или отсутствии) — 400.
 *
 * Защита:
 *   - Zod-валидация всех входящих данных
 *   - Honeypot: поле `website` (скрыто в UI)
 *   - Rate limit: 5 req / мин / IP (in-process Map)
 *   - CORS: только alba-medcenter.ru
 *
 * 🔴 MedFlex-специфика:
 *   - Таймаут execute/ = 90 с — клиент должен показать статус "Записываемся..."
 *   - Идемпотентность реализована в MedflexTransport (medflex_booking_log)
 *   - Авторетраи клиентом ЗАПРЕЩЕНЫ при MedFlex-транспорте
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getDb } from "@/lib/db"
import {
  getBookingTransport,
  normalizePhone,
  type BookingInput,
} from "@/lib/booking/transport"
import { checkRateLimit } from "@/lib/booking/rate-limit"

const CLIENT_ID = 1

// ── CORS whitelist ─────────────────────────────────────────────────────────

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

// ── Zod-схема (единая для обоих транспортов) ──────────────────────────────

const BookingSchema = z
  .object({
    // Honeypot: ботозащита — настоящий пользователь не заполняет это поле
    website: z.string().max(0, "Поле не должно быть заполнено").optional(),

    // Идентификатор врача (medflex doctor_id в MedFlex-режиме, SQLite id в local)
    doctor_id: z.number().int().positive("doctor_id должен быть положительным числом"),

    // Оба транспорта: дата и время для UI и LocalTransport
    service: z.string().max(500).default(""),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Неверный формат даты (YYYY-MM-DD)"),
    time: z.string().regex(/^\d{2}:\d{2}$/, "Неверный формат времени (HH:MM)"),

    // ── ФИО: legacy (LocalTransport) — одно поле ──────────────────────────
    name: z.string().min(2, "Введите ФИО (минимум 2 символа)").max(200).optional(),

    // ── ФИО: MedFlex — раздельные поля ────────────────────────────────────
    last_name: z.string().min(1).max(100).optional(),
    first_name: z.string().min(1).max(100).optional(),
    second_name: z.string().max(100).default(""),  // отчество не обязательно у Альбамед

    // Дата рождения — обязательна для execute/ МедФлекса
    birthday: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Формат даты рождения: YYYY-MM-DD")
      .optional(),

    // ── Данные слота из /slots (возвращаются frontend и передаются обратно) ─
    // Эти поля нужны для execute/ — frontend берёт их из ответа /slots и передаёт сюда
    lpu_id: z.number().int().positive().optional(),
    speciality_id: z.number().int().positive().optional(),
    // Defense-in-depth: формат проверяется ещё раз в слот-верификации транспорта
    dt_start: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "Формат dt_start: YYYY-MM-DD HH:MM").optional(),
    dt_end: z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/, "Формат dt_end: YYYY-MM-DD HH:MM").optional(),
    price: z.number().min(0).optional(),

    // Телефон (оба транспорта)
    phone: z
      .string()
      .regex(/^[\d\s\+\(\)\-]{10,18}$/, "Введите корректный телефон")
      .refine(
        (v) => normalizePhone(v) !== null,
        "Введите российский номер телефона (+7 или 8...)"
      ),

    comment: z.string().max(1000).optional(),

    // Согласие на обработку ПД (ст. 10 152-ФЗ — спецкатегория: врач + дата)
    consent: z.literal(true, {
      error: "Необходимо согласие на обработку персональных данных",
    }),
  })
  .superRefine((data, ctx) => {
    const hasSplitName = Boolean(data.last_name && data.first_name)
    const hasFullName = Boolean(data.name && data.name.trim().length >= 2)

    if (!hasSplitName && !hasFullName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Укажите имя пациента (ФИО одним полем или Фамилию + Имя раздельно)",
        path: ["name"],
      })
    }
  })

// Rate limit: 5 req/min/IP через SQLite (общий для воркеров PM2, переживает рестарт)
const BOOKING_RATE_LIMIT = 5

// ── Telegram-уведомление ──────────────────────────────────────────────────

/** Экранирует спецсимволы HTML для Telegram parse_mode=HTML */
function escHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

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

// ── POST handler ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRateLimit(ip, BOOKING_RATE_LIMIT)) {
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
      {
        errors: parsed.error.issues,
        error: parsed.error.issues[0]?.message ?? "Ошибка валидации",
      },
      { status: 400, headers: cors }
    )
  }

  const {
    website,
    doctor_id,
    service,
    date,
    time,
    name,
    last_name,
    first_name,
    second_name,
    birthday,
    lpu_id,
    speciality_id,
    dt_start,
    dt_end,
    price,
    phone,
    comment,
  } = parsed.data

  // Honeypot check
  if (website && website.length > 0) {
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

  // Собираем имя для локальных целей (лид, уведомление)
  const patientName =
    name ??
    [last_name, first_name, second_name].filter(Boolean).join(" ")

  const normalizedPhone = normalizePhone(phone) ?? phone

  // Формируем BookingInput с полным набором полей
  const bookingInput: BookingInput = {
    doctorId: doctor_id,
    service,
    date,
    time,
    durationMin: 30,
    phone,
    comment,
    // ФИО — и legacy, и split
    name: patientName,
    lastName: last_name,
    firstName: first_name,
    secondName: second_name,
    // MedFlex-специфика
    birthday,
    lpuId: lpu_id,
    specialityId: speciality_id,
    dtStart: dt_start,
    dtEnd: dt_end,
    price,
    mobilePhone: normalizedPhone !== phone ? normalizedPhone : undefined,
  }

  try {
    const transport = getBookingTransport()
    const result = await transport.createBooking(bookingInput)

    if (!result.success) {
      const status = result.error?.includes("уже занят") ? 409 : 400
      return NextResponse.json({ error: result.error }, { status, headers: cors })
    }

    // ── Дублируем лид в admin-дашборд для уведомления и трекинга ─────────────
    try {
      const db = getDb()

      // Пытаемся получить имя врача из локального кэша или SQLite
      let doctorDisplayName = `Врач #${doctor_id}`
      try {
        // Для MedFlex-режима: имя из medflex_doctors_cache
        const mfDoctor = db
          .prepare("SELECT last_name, first_name FROM medflex_doctors_cache WHERE doctor_id = ?")
          .get(doctor_id) as { last_name: string; first_name: string } | undefined
        if (mfDoctor) {
          doctorDisplayName = [mfDoctor.last_name, mfDoctor.first_name].filter(Boolean).join(" ")
        } else {
          // Fallback: local SQLite doctors
          const localDoctor = db
            .prepare("SELECT name FROM doctors WHERE id = ? AND client_id = ?")
            .get(doctor_id, CLIENT_ID) as { name: string } | undefined
          if (localDoctor) doctorDisplayName = localDoctor.name
        }
      } catch { /* не критично */ }

      const message = [
        `Запись к ${doctorDisplayName}`,
        service ? `· ${service}` : "",
        `на ${dt_start ?? `${date} ${time}`}`,
        comment ? `· ${comment}` : "",
        result.claimId ? `[claim: ${result.claimId}]` : "",
      ].filter(Boolean).join(" ")

      db.prepare(
        `INSERT INTO leads (client_id, session_id, name, phone, email, message, source)
         VALUES (?, '', ?, ?, '', ?, 'booking')`
      ).run(CLIENT_ID, patientName, normalizedPhone, message)

      // Telegram-уведомление
      const client = db
        .prepare("SELECT tg_token, tg_chat_id, name FROM clients WHERE id = ?")
        .get(CLIENT_ID) as { tg_token: string; tg_chat_id: string; name: string } | undefined

      if (client?.tg_token && client.tg_chat_id) {
        const mskTime = new Date().toLocaleString("ru-RU", {
          timeZone: "Europe/Moscow",
          day: "2-digit", month: "2-digit", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        })
        const slotStr = dt_start ?? `${date} ${time}`
        const text = [
          `<b>Онлайн-запись — ${escHtml(client.name)}</b>`,
          "",
          `Пациент: ${escHtml(patientName)}`,
          `Телефон: ${escHtml(normalizedPhone)}`,
          birthday ? `Д.р.: ${escHtml(birthday)}` : "",
          `Врач: ${escHtml(doctorDisplayName)}`,
          service ? `Услуга: ${escHtml(service)}` : "",
          `Время: ${escHtml(slotStr)}`,
          comment ? `Комментарий: ${escHtml(comment)}` : "",
          result.claimId ? `МедФлекс ID: ${escHtml(String(result.claimId))}` : "",
          "",
          `${mskTime} МСК`,
        ].filter(Boolean).join("\n")

        const chatIds = client.tg_chat_id.split(",").map((id) => id.trim()).filter(Boolean)
        await Promise.all(chatIds.map((chatId) => notifyTelegram(client.tg_token, chatId, text)))
      }
    } catch (leadErr) {
      // Лид не критичен — запись уже создана
      console.error("[booking/albamed/create lead/notify]", leadErr)
    }

    return NextResponse.json(
      {
        success: true,
        appointmentId: result.appointmentId,
        claimId: result.claimId,
      },
      { status: 201, headers: cors }
    )
  } catch (err) {
    console.error("[booking/albamed/create POST]", err)
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
