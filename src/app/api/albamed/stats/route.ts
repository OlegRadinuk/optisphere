import { NextResponse } from "next/server"
import { isAuthenticated } from "@/app/api/admin/auth/route"
import { getDb } from "@/lib/db"

const CLIENT_ID = 1

export async function GET(): Promise<Response> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDb()

    const leadsTotal = (
      db
        .prepare("SELECT COUNT(*) as n FROM leads WHERE client_id = ?")
        .get(CLIENT_ID) as { n: number }
    ).n

    const leadsNew = (
      db
        .prepare("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND status = 'new'")
        .get(CLIENT_ID) as { n: number }
    ).n

    const sessionsTotal = (
      db
        .prepare(
          "SELECT COUNT(DISTINCT session_id) as n FROM messages WHERE client_id = ?"
        )
        .get(CLIENT_ID) as { n: number }
    ).n

    const sessionsToday = (
      db
        .prepare(
          "SELECT COUNT(DISTINCT session_id) as n FROM messages WHERE client_id = ? AND date(created_at) = date('now')"
        )
        .get(CLIENT_ID) as { n: number }
    ).n

    const conversionRate =
      sessionsTotal > 0
        ? Math.round((leadsTotal / sessionsTotal) * 1000) / 10
        : 0

    const leadsByDay = db
      .prepare(
        `SELECT date(created_at) as date, COUNT(*) as count
         FROM leads
         WHERE client_id = ?
           AND created_at >= datetime('now', '-14 days')
         GROUP BY date(created_at)
         ORDER BY date ASC`
      )
      .all(CLIENT_ID) as Array<{ date: string; count: number }>

    const topHours = db
      .prepare(
        `SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as count
         FROM messages
         WHERE client_id = ?
           AND created_at >= datetime('now', '-30 days')
         GROUP BY strftime('%H', created_at)
         ORDER BY count DESC
         LIMIT 5`
      )
      .all(CLIENT_ID) as Array<{ hour: number; count: number }>

    return NextResponse.json({
      leadsTotal,
      leadsNew,
      sessionsTotal,
      sessionsToday,
      conversionRate,
      leadsByDay,
      topHours,
    })
  } catch (err) {
    console.error("[albamed/stats] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
