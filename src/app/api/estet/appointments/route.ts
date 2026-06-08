import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isEstetAuthenticated } from "@/app/api/estet/auth/route"
import { getDb } from "@/lib/db"

// estet = client id 3 in БД (slug 'estet'); id 4 не существует (пропущен при чистке)
const CLIENT_ID = 3

const CreateSchema = z.object({
  patient_name: z.string().default(""),
  patient_phone: z.string().default(""),
  service: z.string().default(""),
  notes: z.string().default(""),
  appointment_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  appointment_time: z.string().regex(/^\d{2}:\d{2}$/),
  duration_min: z.number().int().min(15).max(240).default(30),
  doctor_id: z.number().int().positive().nullable().default(null),
  lead_id: z.number().int().positive().nullable().default(null),
  status: z.enum(["scheduled", "confirmed", "cancelled", "completed"]).default("scheduled"),
})

const UpdateSchema = CreateSchema.extend({
  id: z.number().int().positive(),
}).partial().required({ id: true })

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl
    const week = searchParams.get("week")
    const date = searchParams.get("date")
    const db = getDb()

    if (date) {
      const rows = db.prepare(`
        SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty, d.branch as doctor_branch
        FROM appointments a
        LEFT JOIN doctors d ON d.id = a.doctor_id
        WHERE a.client_id = ? AND a.appointment_date = ?
        ORDER BY a.appointment_time
      `).all(CLIENT_ID, date)
      return NextResponse.json({ appointments: rows })
    }

    if (week) {
      const d = new Date(week)
      const dow = d.getDay()
      const diff = dow === 0 ? -6 : 1 - dow
      d.setDate(d.getDate() + diff)
      const monday = d.toISOString().slice(0, 10)
      const sunday = new Date(d.setDate(d.getDate() + 6)).toISOString().slice(0, 10)

      const rows = db.prepare(`
        SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty, d.branch as doctor_branch
        FROM appointments a
        LEFT JOIN doctors d ON d.id = a.doctor_id
        WHERE a.client_id = ? AND a.appointment_date BETWEEN ? AND ?
        ORDER BY a.appointment_date, a.appointment_time
      `).all(CLIENT_ID, monday, sunday)

      return NextResponse.json({ appointments: rows, weekStart: monday, weekEnd: sunday })
    }

    const today = new Date().toISOString().slice(0, 10)
    const future = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10)
    const rows = db.prepare(`
      SELECT a.*, d.name as doctor_name, d.specialty as doctor_specialty
      FROM appointments a
      LEFT JOIN doctors d ON d.id = a.doctor_id
      WHERE a.client_id = ? AND a.appointment_date BETWEEN ? AND ?
      ORDER BY a.appointment_date, a.appointment_time
    `).all(CLIENT_ID, today, future)

    return NextResponse.json({ appointments: rows })
  } catch (e) {
    console.error("[estet/appointments GET]", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = CreateSchema.parse(body)
    const db = getDb()

    const result = db.prepare(`
      INSERT INTO appointments
        (client_id, lead_id, doctor_id, patient_name, patient_phone, service, notes,
         appointment_date, appointment_time, duration_min, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      CLIENT_ID, data.lead_id, data.doctor_id,
      data.patient_name, data.patient_phone,
      data.service, data.notes,
      data.appointment_date, data.appointment_time,
      data.duration_min, data.status
    )

    const row = db.prepare("SELECT * FROM appointments WHERE id = ?").get(result.lastInsertRowid)
    return NextResponse.json({ appointment: row }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 })
    console.error("[estet/appointments POST]", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const data = UpdateSchema.parse(body)
    const db = getDb()

    const existing = db.prepare("SELECT * FROM appointments WHERE id = ? AND client_id = ?").get(data.id, CLIENT_ID)
    if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 })

    const fields = Object.entries(data).filter(([k]) => k !== "id")
    if (fields.length === 0) return NextResponse.json({ error: "Nothing to update" }, { status: 400 })

    const setClauses = fields.map(([k]) => `${k} = ?`).join(", ")
    const values = fields.map(([, v]) => v)

    db.prepare(`UPDATE appointments SET ${setClauses} WHERE id = ?`).run(...values, data.id)
    const row = db.prepare("SELECT * FROM appointments WHERE id = ?").get(data.id)
    return NextResponse.json({ appointment: row })
  } catch (e) {
    if (e instanceof z.ZodError) return NextResponse.json({ error: e.issues }, { status: 400 })
    console.error("[estet/appointments PATCH]", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await req.json() as { id: number }
    if (!id || typeof id !== "number") return NextResponse.json({ error: "Invalid id" }, { status: 400 })

    const db = getDb()
    const result = db.prepare("DELETE FROM appointments WHERE id = ? AND client_id = ?").run(id, CLIENT_ID)
    if (result.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 })
    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error("[estet/appointments DELETE]", e)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
