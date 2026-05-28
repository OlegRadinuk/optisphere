import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isEstetAuthenticated } from "@/app/api/estet/auth/route"
import { getDb, getDoctors, updateDoctor, createDoctor } from "@/lib/db"
import type { Doctor } from "@/lib/db"

const CLIENT_ID = 4

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  specialty: z.string().max(200).optional().default(""),
  branch: z.number().int().positive().optional().default(1),
})

const ScheduleSchema = z.object({
  mon: z.boolean().optional(),
  tue: z.boolean().optional(),
  wed: z.boolean().optional(),
  thu: z.boolean().optional(),
  fri: z.boolean().optional(),
  sat: z.boolean().optional(),
  sun: z.boolean().optional(),
})

const PatchSchema = z.object({
  id: z.number().int().positive(),
  schedule: ScheduleSchema.optional(),
  active: z.union([z.literal(0), z.literal(1)]).optional(),
  name: z.string().min(1).max(200).optional(),
  specialty: z.string().max(200).optional(),
  branch: z.number().int().positive().optional(),
})

export async function GET(): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const doctors: Doctor[] = getDoctors(CLIENT_ID)
    return NextResponse.json({ doctors })
  } catch (err) {
    console.error("[estet/doctors GET] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const parsed = CreateSchema.safeParse(await req.json())
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
    }
    const doctor = createDoctor(CLIENT_ID, parsed.data)
    return NextResponse.json({ doctor }, { status: 201 })
  } catch (err) {
    console.error("[estet/doctors POST] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body: unknown = await req.json()
    const parsed = PatchSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ errors: parsed.error.issues }, { status: 400 })
    }

    const { id, schedule, ...rest } = parsed.data
    const db = getDb()
    const doctor = db.prepare("SELECT id FROM doctors WHERE id = ? AND client_id = ?").get(id, CLIENT_ID) as { id: number } | undefined
    if (!doctor) return NextResponse.json({ error: "Doctor not found" }, { status: 404 })

    const updateData: Parameters<typeof updateDoctor>[1] = { ...rest }
    if (schedule !== undefined) {
      updateData.schedule = JSON.stringify(schedule)
    }

    updateDoctor(id, updateData)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[estet/doctors PATCH] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
