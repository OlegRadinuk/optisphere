/**
 * GET /api/booking/albamed/slots?doctor_id=&date=&lpu_id=
 *
 * Список свободных слотов врача на дату.
 *
 * Параметры:
 *   doctor_id — medflex doctor_id (MedFlex) или SQLite id (local)
 *   date      — YYYY-MM-DD
 *   lpu_id    — опционально: фильтр по филиалу (только MedFlex)
 *
 * Ответ:
 *   { slots: AvailableSlot[] }
 *   где AvailableSlot = { time, dtStart?, dtEnd?, specialityId?, price?, lpuId? }
 *
 * В LOCAL-режиме slots[i] = { time: "HH:MM" }
 * В MEDFLEX-режиме slots[i] содержит все поля для последующего вызова /create
 * (dtStart, dtEnd, specialityId, price, lpuId передаются обратно в теле POST /create).
 *
 * CORS: только alba-medcenter.ru.
 */
import { NextRequest, NextResponse } from "next/server"
import { getBookingTransport, type AvailableSlot } from "@/lib/booking/transport"

// ── CORS whitelist ─────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  "https://alba-medcenter.ru",
  "https://www.alba-medcenter.ru",
])

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Content-Type"
  }
  return headers
}

// ── Handler ────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin)

  const { searchParams } = req.nextUrl
  const doctorIdStr = searchParams.get("doctor_id")
  const date = searchParams.get("date")
  const lpuIdStr = searchParams.get("lpu_id")

  if (!doctorIdStr || !date) {
    return NextResponse.json(
      { error: "doctor_id and date are required" },
      { status: 400, headers: cors }
    )
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400, headers: cors }
    )
  }

  const doctorId = parseInt(doctorIdStr, 10)
  if (isNaN(doctorId) || doctorId <= 0) {
    return NextResponse.json(
      { error: "doctor_id must be a positive integer" },
      { status: 400, headers: cors }
    )
  }

  // Не отдаём слоты для прошедших дат
  const today = new Date().toISOString().slice(0, 10)
  if (date < today) {
    return NextResponse.json(
      { slots: [] as AvailableSlot[] },
      { headers: { ...cors, "Cache-Control": "no-store" } }
    )
  }

  const lpuId = lpuIdStr ? parseInt(lpuIdStr, 10) : undefined

  try {
    const transport = getBookingTransport()
    const slots = await transport.getSlots({ doctorId, date, lpuId })

    return NextResponse.json(
      { slots },
      {
        headers: {
          ...cors,
          "Cache-Control": "no-store",  // расписание меняется — не кэшировать на клиенте
        },
      }
    )
  } catch (err) {
    console.error("[booking/albamed/slots GET]", err)
    return NextResponse.json({ error: "Не удалось получить расписание" }, { status: 502, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
