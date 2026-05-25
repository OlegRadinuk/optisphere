import { NextRequest, NextResponse } from "next/server"
import { isEstetAuthenticated } from "@/app/api/estet/auth/route"
import { getDb } from "@/lib/db"

const CLIENT_ID = 4

type SessionRow = {
  session_id: string
  messageCount: number
  firstMessage: string
  lastMessage: string
  createdAt: string
  has_lead: number
}

type SessionResponse = Omit<SessionRow, "has_lead"> & { hasLead: boolean }

export async function GET(req: NextRequest): Promise<Response> {
  if (!(await isEstetAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = req.nextUrl
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1)
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "20", 10) || 20))
    const offset = (page - 1) * limit
    const db = getDb()

    const countRow = db.prepare(
      "SELECT COUNT(DISTINCT session_id) as n FROM messages WHERE client_id = ?"
    ).get(CLIENT_ID) as { n: number }
    const total = countRow.n

    const rows = db.prepare(
      `SELECT m.session_id,
         COUNT(m.id) AS messageCount,
         MIN(m.content) AS firstMessage,
         (SELECT content FROM messages WHERE client_id = m.client_id AND session_id = m.session_id ORDER BY created_at DESC LIMIT 1) AS lastMessage,
         MIN(m.created_at) AS createdAt,
         CASE WHEN l.session_id IS NOT NULL THEN 1 ELSE 0 END AS has_lead
       FROM messages m
       LEFT JOIN leads l ON l.client_id = m.client_id AND l.session_id = m.session_id
       WHERE m.client_id = ?
       GROUP BY m.session_id
       ORDER BY MAX(m.created_at) DESC
       LIMIT ? OFFSET ?`
    ).all(CLIENT_ID, limit, offset) as SessionRow[]

    const sessions: SessionResponse[] = rows.map((r) => ({
      session_id: r.session_id,
      messageCount: r.messageCount,
      firstMessage: r.firstMessage,
      lastMessage: r.lastMessage,
      createdAt: r.createdAt,
      hasLead: r.has_lead === 1,
    }))

    return NextResponse.json({ sessions, total })
  } catch (err) {
    console.error("[estet/sessions GET] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
