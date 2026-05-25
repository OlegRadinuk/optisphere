"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

const PRIMARY = "#2B8FD5"

interface Session {
  session_id: string
  messageCount: number
  firstMessage: string
  lastMessage: string
  createdAt: string
  hasLead: boolean
}

interface SessionsResponse {
  sessions: Session[]
  total: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function EstetSessionsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10)
  const limit = 20

  const [sessions, setSessions] = useState<Session[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const loadSessions = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(`/api/estet/sessions?page=${pageParam}&limit=${limit}`)
      if (!r.ok) throw new Error("Ошибка загрузки")
      const d: SessionsResponse = await r.json()
      setSessions(d.sessions ?? [])
      setTotal(d.total ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [pageParam])

  useEffect(() => { loadSessions() }, [loadSessions])

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .es-sessions-table-wrap { overflow-x:auto; }
        .es-sessions-mobile-cards { display:none; }
        @media (max-width: 767px) {
          .es-sessions-table-wrap table { display:none; }
          .es-sessions-mobile-cards { display:flex; flex-direction:column; gap:10px; }
          .es-sess-card { background:#fff; border:1px solid #e0ecf7; border-radius:12px; padding:14px 16px; cursor:pointer; -webkit-tap-highlight-color:transparent; box-shadow:0 1px 4px rgba(43,143,213,0.06); }
          .es-sess-card:active { background:#f8fbfe; }
          .es-sess-card-top { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
          .es-sess-date { font-size:12px; color:#bbb; white-space:nowrap; }
          .es-sess-lead-badge { font-size:11px; font-weight:600; padding:3px 9px; border-radius:9999px; background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0; white-space:nowrap; }
          .es-sess-msg { font-size:14px; color:#1a1a1a; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; margin-bottom:10px; line-height:1.45; }
          .es-sess-footer { display:flex; align-items:center; justify-content:space-between; gap:8px; }
          .es-sess-count { font-size:12px; color:${PRIMARY}; font-weight:500; }
          .es-sess-open-link { font-size:13px; font-weight:500; color:${PRIMARY}; text-decoration:none; -webkit-tap-highlight-color:transparent; min-height:44px; display:flex; align-items:center; }
          .es-sess-skel-card { background:#fff; border:1px solid #e0ecf7; border-radius:12px; padding:14px 16px; }
          .es-sess-skel-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
          .es-sess-skel-line { height:14px; background:#e8f3fb; border-radius:4px; animation:pulse 1.5s ease infinite; }
          .es-sess-skel-line-tall { height:36px; background:#e8f3fb; border-radius:4px; animation:pulse 1.5s ease infinite; margin-bottom:8px; }
        }
      `}</style>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>Диалоги</h1>
      <p style={{ fontSize: 14, color: "#999", margin: "0 0 20px" }}>История переписки пациентов с Элей</p>

      {error && (
        <div style={{ padding: 20, color: "#ef4444", display: "flex", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, marginBottom: 12 }}>
          <span>{error}</span>
          <button onClick={loadSessions} style={{ border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "6px 12px", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            Повторить
          </button>
        </div>
      )}

      {/* Desktop table */}
      {!error && (
        <div className="es-sessions-table-wrap">
          <div style={{ background: "#fff", border: "1px solid #e0ecf7", borderRadius: 10, overflow: "hidden", minWidth: 600, boxShadow: "0 1px 4px rgba(43,143,213,0.06)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8fbfe", borderBottom: "1px solid #e0ecf7" }}>
                  {["Дата", "Первое сообщение", "Сообщений", "Лид", ""].map((col, i) => (
                    <th key={i} style={{ padding: "10px 16px", textAlign: "left", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {[110, 260, 80, 80, 70].map((w, j) => (
                          <td key={j} style={{ padding: "13px 16px", borderBottom: "1px solid #f5f5f5" }}>
                            <div style={{ width: w, height: 14, background: "#e8f3fb", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sessions.length === 0
                  ? (
                      <tr><td colSpan={5} style={{ padding: "50px 16px", textAlign: "center", color: "#bbb" }}>Нет данных</td></tr>
                    )
                  : sessions.map((session, idx) => (
                      <tr key={session.session_id} style={{ cursor: "pointer", transition: "background 150ms" }}
                        onClick={() => router.push(`/estet/sessions/${session.session_id}`)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#f8fbfe" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <td style={{ padding: "13px 16px", color: "#999", fontSize: 13, borderBottom: idx < sessions.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                          {formatDate(session.createdAt)}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#1a1a1a", borderBottom: idx < sessions.length - 1 ? "1px solid #f5f5f5" : "none", maxWidth: 300, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {session.firstMessage ? (session.firstMessage.length > 60 ? session.firstMessage.slice(0, 60) + "…" : session.firstMessage) : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#999", borderBottom: idx < sessions.length - 1 ? "1px solid #f5f5f5" : "none", textAlign: "center" }}>
                          {session.messageCount}
                        </td>
                        <td style={{ padding: "13px 16px", borderBottom: idx < sessions.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {session.hasLead ? (
                            <span style={{ color: "#16a34a", fontSize: 12, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 9999, padding: "3px 10px", fontWeight: 600 }}>
                              Оставлен
                            </span>
                          ) : (
                            <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td style={{ padding: "13px 16px", borderBottom: idx < sessions.length - 1 ? "1px solid #f5f5f5" : "none" }} onClick={(e) => e.stopPropagation()}>
                          <Link href={`/estet/sessions/${session.session_id}`} style={{ color: PRIMARY, fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline" }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none" }}
                          >
                            Открыть →
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {!error && (
        <div className="es-sessions-mobile-cards">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="es-sess-skel-card">
                  <div className="es-sess-skel-row">
                    <div className="es-sess-skel-line" style={{ width: "35%" }} />
                    <div className="es-sess-skel-line" style={{ width: "20%" }} />
                  </div>
                  <div className="es-sess-skel-line-tall" style={{ width: "100%" }} />
                  <div className="es-sess-skel-row" style={{ marginBottom: 0 }}>
                    <div className="es-sess-skel-line" style={{ width: "25%" }} />
                    <div className="es-sess-skel-line" style={{ width: "20%" }} />
                  </div>
                </div>
              ))
            : sessions.length === 0
            ? <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb", fontSize: 14 }}>Нет данных</div>
            : sessions.map((session) => (
                <div key={session.session_id} className="es-sess-card"
                  onClick={() => router.push(`/estet/sessions/${session.session_id}`)}
                >
                  <div className="es-sess-card-top">
                    <span className="es-sess-date">{formatDate(session.createdAt)}</span>
                    {session.hasLead && <span className="es-sess-lead-badge">Оставлен</span>}
                  </div>
                  <div className="es-sess-msg">{session.firstMessage || "—"}</div>
                  <div className="es-sess-footer">
                    <span className="es-sess-count">{session.messageCount} сообщений</span>
                    <Link href={`/estet/sessions/${session.session_id}`} className="es-sess-open-link" onClick={(e) => e.stopPropagation()}>
                      Открыть →
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "center", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button onClick={() => router.push(`/estet/sessions?page=${pageParam - 1}`)} disabled={pageParam <= 1}
            style={{ background: "#fff", border: "1px solid #d0e8f5", color: pageParam <= 1 ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44, WebkitTapHighlightColor: "transparent" }}>
            ← Пред.
          </button>
          <span style={{ color: "#999", fontSize: 13, padding: "0 8px" }}>{pageParam} / {totalPages}</span>
          <button onClick={() => router.push(`/estet/sessions?page=${pageParam + 1}`)} disabled={pageParam >= totalPages}
            style={{ background: "#fff", border: "1px solid #d0e8f5", color: pageParam >= totalPages ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44, WebkitTapHighlightColor: "transparent" }}>
            След. →
          </button>
        </div>
      )}
    </div>
  )
}
