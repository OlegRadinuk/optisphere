import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { isEstetAuthenticated } from "@/app/api/estet/auth/route"
import { getDb, updateLeadStatus } from "@/lib/db"
import type { Lead } from "@/lib/db"

const CLIENT_ID = 4

const VALID_STATUSES = ["new", "working", "closed", "all"] as const
type StatusFilter = (typeof VALID_STATUSES)[number]

type LeadWithChat = Lead & { hasChat: boolean }

const PatchSchema = z.object({
  id: z.number().int().positive(),
  status: z.enum(["new", "working", "closed"]),
})

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl
    const statusParam = (searchParams.get("status") ?? "all") as StatusFilter
    const status: StatusFilter = VALID_STATUSES.includes(statusParam) ? statusParam : "all"
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20))
    const offset = (page - 1) * limit
    const db = getDb()
    const search = (searchParams.get("search") ?? "").trim()
    const whereStatus = status !== "all" ? "AND l.status = @status" : ""
    const whereSearch = search ? "AND (l.name LIKE @search OR l.phone LIKE @search)" : ""
    const searchLike = `%${search}%`

    const counts = db.prepare(
      `SELECT status, COUNT(*) as n FROM leads WHERE client_id = @clientId GROUP BY status`
    ).all({ clientId: CLIENT_ID }) as Array<{ status: string; n: number }>
    const statusCounts: Record<string, number> = { all: 0 }
    counts.forEach(({ status: s, n }) => { statusCounts[s] = n; statusCounts.all = (statusCounts.all ?? 0) + n })

    const countRow = db.prepare(
      `SELECT COUNT(*) as n FROM leads l WHERE l.client_id = @clientId ${whereStatus} ${whereSearch}`
    ).get({ clientId: CLIENT_ID, status, search: searchLike }) as { n: number }
    const total = countRow.n

    const rows = db.prepare(
      `SELECT l.id, l.name, l.phone, l.message, l.status, l.created_at, l.session_id,
         CASE WHEN EXISTS (
           SELECT 1 FROM messages m WHERE m.client_id = l.client_id AND m.session_id = l.session_id
         ) THEN 1 ELSE 0 END as has_chat
       FROM leads l
       WHERE l.client_id = @clientId ${whereStatus} ${whereSearch}
       ORDER BY l.created_at DESC LIMIT @limit OFFSET @offset`
    ).all({ clientId: CLIENT_ID, status, search: searchLike, limit, offset }) as Array<Lead & { has_chat: number }>

    const leads: LeadWithChat[] = rows.map((r) => ({ ...r, hasChat: r.has_chat === 1 }))
    return NextResponse.json({ leads, total, page, statusCounts })
  } catch (err) {
    console.error("[estet/leads GET] Error:", err)
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
    const { id, status } = parsed.data
    const db = getDb()
    const lead = db.prepare("SELECT id FROM leads WHERE id = ? AND client_id = ?").get(id, CLIENT_ID) as { id: number } | undefined
    if (!lead) return NextResponse.json({ error: "Lead not found" }, { status: 404 })
    updateLeadStatus(id, status)
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error("[estet/leads PATCH] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
