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
  const d = new Date(iso)
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
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

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  function setPage(p: number) {
    router.push(`/albamed/sessions?page=${p}`)
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 20px" }}>
        Диалоги
      </h1>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            overflow: "hidden",
            minWidth: 600,
          }}
        >
          {error ? (
            <div
              style={{
                padding: 20,
                color: "#ef4444",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span>{error}</span>
              <button
                onClick={loadSessions}
                style={{
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  borderRadius: 6,
                  padding: "6px 12px",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                Повторить
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  {["Дата", "Первое сообщение", "Сообщений", "Лид", ""].map((col, i) => (
                    <th
                      key={i}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        borderBottom: "1px solid #334155",
                        color: "#94a3b8",
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}
                    >
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
                          <td
                            key={j}
                            style={{ padding: "12px 16px", borderBottom: "1px solid #334155" }}
                          >
                            <div
                              style={{
                                width: w,
                                height: 14,
                                background: "#334155",
                                borderRadius: 4,
                                animation: "pulse 1.5s ease infinite",
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : sessions.length === 0
                  ? (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            padding: "40px 16px",
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          Нет данных
                        </td>
                      </tr>
                    )
                  : sessions.map((session, idx) => (
                      <tr
                        key={session.session_id}
                        style={{ cursor: "pointer", transition: "background 150ms" }}
                        onClick={() =>
                          router.push(`/albamed/sessions/${session.session_id}`)
                        }
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = "#293548"
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = "transparent"
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#94a3b8",
                            fontSize: 13,
                            borderBottom: idx < sessions.length - 1 ? "1px solid #334155" : "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(session.createdAt)}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#e2e8f0",
                            borderBottom: idx < sessions.length - 1 ? "1px solid #334155" : "none",
                            maxWidth: 300,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {session.firstMessage
                            ? session.firstMessage.length > 60
                              ? session.firstMessage.slice(0, 60) + "…"
                              : session.firstMessage
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#94a3b8",
                            borderBottom: idx < sessions.length - 1 ? "1px solid #334155" : "none",
                            textAlign: "center",
                          }}
                        >
                          {session.messageCount}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: idx < sessions.length - 1 ? "1px solid #334155" : "none",
                          }}
                        >
                          {session.hasLead ? (
                            <span
                              style={{
                                color: "#22c55e",
                                fontSize: 12,
                                background: "#0f2a1a",
                                borderRadius: 9999,
                                padding: "2px 8px",
                              }}
                            >
                              Оставлен
                            </span>
                          ) : (
                            <span style={{ color: "#334155", fontSize: 13 }}>—</span>
                          )}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: idx < sessions.length - 1 ? "1px solid #334155" : "none",
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link
                            href={`/albamed/sessions/${session.session_id}`}
                            style={{
                              color: "#3b82f6",
                              fontSize: 13,
                              textDecoration: "none",
                            }}
                            onMouseEnter={(e) => {
                              ;(e.currentTarget as HTMLElement).style.textDecoration = "underline"
                            }}
                            onMouseLeave={(e) => {
                              ;(e.currentTarget as HTMLElement).style.textDecoration = "none"
                            }}
                          >
                            Открыть →
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Pagination */}
      {!loading && !error && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 16,
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => setPage(pageParam - 1)}
            disabled={pageParam <= 1}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: pageParam <= 1 ? "#334155" : "#94a3b8",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
              cursor: pageParam <= 1 ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            ← Пред.
          </button>
          <span style={{ color: "#94a3b8", fontSize: 13 }}>
            Страница {pageParam} из {totalPages}
          </span>
          <button
            onClick={() => setPage(pageParam + 1)}
            disabled={pageParam >= totalPages}
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              color: pageParam >= totalPages ? "#334155" : "#94a3b8",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
              cursor: pageParam >= totalPages ? "not-allowed" : "pointer",
              fontFamily: "inherit",
            }}
          >
            След. →
          </button>
        </div>
      )}
    </div>
  )
}
