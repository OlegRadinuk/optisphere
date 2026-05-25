"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

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

export default function SessionsPage() {
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
      const r = await fetch(`/api/albamed/sessions?page=${pageParam}&limit=${limit}`)
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
        /* ── Desktop defaults ── */
        .ab-sessions-table-wrap { overflow-x: auto; }
        .ab-sessions-mobile-cards { display: none; }

        /* ── Mobile overrides ── */
        @media (max-width: 767px) {
          .ab-sessions-table-wrap table { display: none; }
          .ab-sessions-mobile-cards {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .ab-sess-card {
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 12px;
            padding: 14px 16px;
            cursor: pointer;
            -webkit-tap-highlight-color: transparent;
            box-shadow: 0 1px 4px rgba(0,0,0,0.04);
          }
          .ab-sess-card:active { background: #fafafa; }
          .ab-sess-card-top {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 6px;
          }
          .ab-sess-date {
            font-size: 12px;
            color: #bbb;
            white-space: nowrap;
          }
          .ab-sess-lead-badge {
            font-size: 11px;
            font-weight: 600;
            padding: 3px 9px;
            border-radius: 9999px;
            background: #f0fdf4;
            color: #16a34a;
            border: 1px solid #bbf7d0;
            white-space: nowrap;
          }
          .ab-sess-msg {
            font-size: 14px;
            color: #1a1a1a;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            margin-bottom: 10px;
            line-height: 1.45;
          }
          .ab-sess-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
          }
          .ab-sess-count {
            font-size: 12px;
            color: #f47920;
            font-weight: 500;
          }
          .ab-sess-open-link {
            font-size: 13px;
            font-weight: 500;
            color: #f47920;
            text-decoration: none;
            -webkit-tap-highlight-color: transparent;
            min-height: 44px;
            display: flex;
            align-items: center;
          }
          /* Skeleton cards */
          .ab-sess-skel-card {
            background: #fff;
            border: 1px solid #e8e8e8;
            border-radius: 12px;
            padding: 14px 16px;
          }
          .ab-sess-skel-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 8px;
            margin-bottom: 8px;
          }
          .ab-sess-skel-line {
            height: 14px;
            background: #f0f0f0;
            border-radius: 4px;
            animation: sess-pulse 1.5s ease infinite;
          }
          .ab-sess-skel-line-tall {
            height: 36px;
            background: #f0f0f0;
            border-radius: 4px;
            animation: sess-pulse 1.5s ease infinite;
            margin-bottom: 8px;
          }
        }

        @keyframes sess-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>Диалоги</h1>
      <p style={{ fontSize: 14, color: "#999", margin: "0 0 20px" }}>История переписки пациентов с ботом</p>

      {/* Error state */}
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
        <div className="ab-sessions-table-wrap">
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", minWidth: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
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
                            <div style={{ width: w, height: 14, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sessions.length === 0
                  ? (
                      <tr>
                        <td colSpan={5} style={{ padding: "50px 16px", textAlign: "center", color: "#bbb" }}>
                          Нет данных
                        </td>
                      </tr>
                    )
                  : sessions.map((session, idx) => (
                      <tr
                        key={session.session_id}
                        style={{ cursor: "pointer", transition: "background 150ms" }}
                        onClick={() => router.push(`/albamed/sessions/${session.session_id}`)}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa" }}
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
                          <Link
                            href={`/albamed/sessions/${session.session_id}`}
                            style={{ color: "#f47920", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
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
        <div className="ab-sessions-mobile-cards">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="ab-sess-skel-card">
                  <div className="ab-sess-skel-row">
                    <div className="ab-sess-skel-line" style={{ width: "35%" }} />
                    <div className="ab-sess-skel-line" style={{ width: "20%" }} />
                  </div>
                  <div className="ab-sess-skel-line-tall" style={{ width: "100%" }} />
                  <div className="ab-sess-skel-row" style={{ marginBottom: 0 }}>
                    <div className="ab-sess-skel-line" style={{ width: "25%" }} />
                    <div className="ab-sess-skel-line" style={{ width: "20%" }} />
                  </div>
                </div>
              ))
            : sessions.length === 0
            ? (
                <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                  Нет данных
                </div>
              )
            : sessions.map((session) => (
                <div
                  key={session.session_id}
                  className="ab-sess-card"
                  onClick={() => router.push(`/albamed/sessions/${session.session_id}`)}
                >
                  {/* Top: date + lead badge */}
                  <div className="ab-sess-card-top">
                    <span className="ab-sess-date">{formatDate(session.createdAt)}</span>
                    {session.hasLead && (
                      <span className="ab-sess-lead-badge">Оставлен</span>
                    )}
                  </div>

                  {/* First message (2 lines max) */}
                  <div className="ab-sess-msg">
                    {session.firstMessage || "—"}
                  </div>

                  {/* Footer: message count + open link */}
                  <div className="ab-sess-footer">
                    <span className="ab-sess-count">{session.messageCount} сообщений</span>
                    <Link
                      href={`/albamed/sessions/${session.session_id}`}
                      className="ab-sess-open-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Открыть →
                    </Link>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "center", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button
            onClick={() => router.push(`/albamed/sessions?page=${pageParam - 1}`)}
            disabled={pageParam <= 1}
            style={{ background: "#fff", border: "1px solid #e8e8e8", color: pageParam <= 1 ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44, WebkitTapHighlightColor: "transparent" }}
          >
            ← Пред.
          </button>
          <span style={{ color: "#999", fontSize: 13, padding: "0 8px" }}>{pageParam} / {totalPages}</span>
          <button
            onClick={() => router.push(`/albamed/sessions?page=${pageParam + 1}`)}
            disabled={pageParam >= totalPages}
            style={{ background: "#fff", border: "1px solid #e8e8e8", color: pageParam >= totalPages ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44, WebkitTapHighlightColor: "transparent" }}
          >
            След. →
          </button>
        </div>
      )}
    </div>
  )
}
