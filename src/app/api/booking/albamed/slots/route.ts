/**
 * GET /api/booking/albamed/slots?doctor_id=&date=
 *
 * Публичный список свободных слотов врача на дату.
 * CORS: по origin (как в bots/[slug]).
 * Делегирует логику в getBookingTransport().getSlots().
 */
import { NextRequest, NextResponse } from "next/server"
import { getBookingTransport } from "@/lib/booking/transport"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

export async function GET(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*"
  const cors = corsHeaders(origin)

  const { searchParams } = req.nextUrl
  const doctorIdStr = searchParams.get("doctor_id")
  const date = searchParams.get("date")

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
    return NextResponse.json({ slots: [] }, { headers: cors })
  }

  try {
    const transport = getBookingTransport()
    const slots = await transport.getSlots({ doctorId, date })
    return NextResponse.json({ slots }, { headers: { ...cors, "Cache-Control": "no-store" } })
  } catch (err) {
    console.error("[booking/albamed/slots GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
