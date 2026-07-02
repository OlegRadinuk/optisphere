/**
 * GET /api/booking/albamed/doctors
 *
 * Публичный список активных врачей Альбамед (client_id=1).
 * Возвращает только безопасные поля — без schedule, active, client_id и created_at.
 * CORS: по origin (как в bots/[slug]/lead и chat).
 */
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"

const CLIENT_ID = 1

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

type PublicDoctor = {
  id: number
  name: string
  specialty: string
  branch: number
  photo_url: string | null
  appointment_price: string | null
}

export async function GET(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*"
  const cors = corsHeaders(origin)

  try {
    const db = getDb()
    const rows = db
      .prepare(
        `SELECT id, name, specialty, branch, photo_url, appointment_price
         FROM doctors
         WHERE client_id = ? AND active = 1
         ORDER BY id ASC`
      )
      .all(CLIENT_ID) as PublicDoctor[]

    return NextResponse.json({ doctors: rows }, { headers: cors })
  } catch (err) {
    console.error("[booking/albamed/doctors GET]", err)
    return NextResponse.json({ error: "Server error" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
