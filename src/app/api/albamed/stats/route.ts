import { NextResponse } from "next/server"
import { isAlbamedAuthenticated } from "@/app/api/albamed/auth/route"
import { getDb, getServiceTimeStats, getRecentLeadEvents } from "@/lib/db"

const CLIENT_ID = 1

export async function GET(): Promise<Response> {
  if (!(await isAlbamedAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDb()
    const count = (sql: string): number =>
      (db.prepare(sql).get(CLIENT_ID) as { n: number }).n

    // ── Заявки ────────────────────────────────────────────────
    const leadsTotal = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ?")
    const leadsNew = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND status = 'new'")
    const leadsClosed = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND status = 'closed'")
    const leadsToday = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND date(created_at) = date('now')")

    // Поток за 30 дней + тренд к предыдущим 30 дням
    const leads30d = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND created_at >= datetime('now','-30 days')")
    const leads30dPrev = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND created_at >= datetime('now','-60 days') AND created_at < datetime('now','-30 days')")
    const trendPct = leads30dPrev > 0
      ? Math.round(((leads30d - leads30dPrev) / leads30dPrev) * 100)
      : (leads30d > 0 ? 100 : 0)

    // Возраст самой старой необработанной заявки (дни)
    const oldestNewRow = db
      .prepare("SELECT MIN(created_at) as oldest FROM leads WHERE client_id = ? AND status = 'new'")
      .get(CLIENT_ID) as { oldest: string | null }
    const oldestNewDays = oldestNewRow.oldest
      ? Math.floor((Date.now() - new Date(oldestNewRow.oldest).getTime()) / 86400000)
      : 0

    // ── Источники ─────────────────────────────────────────────
    const leadsBySource = db
      .prepare(`SELECT COALESCE(NULLIF(source,''),'other') as source, COUNT(*) as count
                FROM leads WHERE client_id = ? GROUP BY source ORDER BY count DESC`)
      .all(CLIENT_ID) as Array<{ source: string; count: number }>

    // ── Чат-конверсия (честная: заявки из чата / чат-сессии) ──
    const chatLeads = count("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND source = 'chat'")
    const chatSessions = (
      db.prepare("SELECT COUNT(DISTINCT session_id) as n FROM messages WHERE client_id = ?").get(CLIENT_ID) as { n: number }
    ).n
    const chatConversion = chatSessions > 0
      ? Math.round((chatLeads / chatSessions) * 1000) / 10
      : 0

    const sessionsToday = (
      db.prepare("SELECT COUNT(DISTINCT session_id) as n FROM messages WHERE client_id = ? AND date(created_at) = date('now')").get(CLIENT_ID) as { n: number }
    ).n

    // ── Заявки по дням за 30 дней (тренд) ─────────────────────
    const leadsByDay = db
      .prepare(
        `SELECT date(created_at) as date, COUNT(*) as count
         FROM leads
         WHERE client_id = ? AND created_at >= datetime('now','-30 days')
         GROUP BY date(created_at) ORDER BY date ASC`
      )
      .all(CLIENT_ID) as Array<{ date: string; count: number }>

    // ── Сервис-тайм + журнал действий ────────────────────────
    const serviceTime = getServiceTimeStats(CLIENT_ID)
    const recentEvents = getRecentLeadEvents(CLIENT_ID, 8)

    return NextResponse.json({
      // сервис-тайм
      serviceTime,
      recentEvents,
      // заявки
      leadsTotal,
      leadsNew,            // нужен шеллу для бейджа
      leadsUnhandled: leadsNew,
      leadsClosed,
      leadsToday,
      leads30d,
      leads30dPrev,
      trendPct,
      oldestNewDays,
      // источники
      leadsBySource,
      // чат
      chatLeads,
      chatSessions,
      chatConversion,
      sessionsToday,
      // тренд-график
      leadsByDay,
    })
  } catch (err) {
    console.error("[albamed/stats] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
