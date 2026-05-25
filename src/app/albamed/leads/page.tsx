"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { StatusSelect } from "@/components/albamed/StatusSelect"

type LeadStatus = "new" | "working" | "closed"

interface Lead {
  id: number
  name: string
  phone: string
  message: string
  status: LeadStatus
  created_at: string
  session_id: string | null
  hasChat: boolean
}

interface LeadsResponse {
  leads: Lead[]
  total: number
  page: number
}

const STATUS_TABS: { key: string; label: string }[] = [
  { key: "all", label: "Все" },
  { key: "new", label: "Новые" },
  { key: "working", label: "В работе" },
  { key: "closed", label: "Закрытые" },
]

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

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const statusParam = (searchParams.get("status") ?? "all") as string
  const pageParam = parseInt(searchParams.get("page") ?? "1", 10)

  const [leads, setLeads] = useState<Lead[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const limit = 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch(
        `/api/albamed/leads?status=${statusParam}&page=${pageParam}&limit=${limit}`
      )
      if (!r.ok) throw new Error("Ошибка загрузки")
      const d: LeadsResponse = await r.json()
      setLeads(d.leads ?? [])
      setTotal(d.total ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки. Попробуйте обновить страницу.")
    } finally {
      setLoading(false)
    }
  }, [statusParam, pageParam])

  useEffect(() => {
    loadLeads()
  }, [loadLeads])

  function setStatus(newStatus: string) {
    router.push(`/albamed/leads?status=${newStatus}&page=1`)
  }

  function setPage(p: number) {
    router.push(`/albamed/leads?status=${statusParam}&page=${p}`)
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 20px" }}>
        Лиды
      </h1>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_TABS.map((tab) => {
          const active = statusParam === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setStatus(tab.key)}
              style={{
                padding: "7px 14px",
                borderRadius: 6,
                fontSize: 13,
                cursor: "pointer",
                border: "none",
                background: active ? "#3b82f6" : "#1e293b",
                color: active ? "#fff" : "#94a3b8",
                transition: "background 150ms, color 150ms",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = "#293548"
                  ;(e.currentTarget as HTMLElement).style.color = "#e2e8f0"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  ;(e.currentTarget as HTMLElement).style.background = "#1e293b"
                  ;(e.currentTarget as HTMLElement).style.color = "#94a3b8"
                }
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            overflow: "hidden",
            minWidth: 700,
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
                onClick={loadLeads}
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
                  {[
                    { label: "Дата", width: 140 },
                    { label: "Имя", width: 160 },
                    { label: "Телефон", width: 140 },
                    { label: "Сообщение", width: undefined },
                    { label: "Статус", width: 140 },
                    { label: "Переписка", width: 100 },
                  ].map(({ label, width }) => (
                    <th
                      key={label}
                      style={{
                        padding: "10px 16px",
                        textAlign: "left",
                        borderBottom: "1px solid #334155",
                        color: "#94a3b8",
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 500,
                        width: width ?? undefined,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {[100, 120, 110, 200, 100, 80].map((w, j) => (
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
                  : leads.length === 0
                  ? (
                      <tr>
                        <td
                          colSpan={6}
                          style={{
                            padding: "40px 16px",
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          Лидов нет
                        </td>
                      </tr>
                    )
                  : leads.map((lead, idx) => (
                      <tr
                        key={lead.id}
                        style={{ transition: "background 150ms" }}
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
                            borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {formatDate(lead.created_at)}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#e2e8f0",
                            borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                          }}
                        >
                          {lead.name || "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#e2e8f0",
                            borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {lead.phone}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#94a3b8",
                            borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                            maxWidth: 280,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                          title={lead.message}
                        >
                          {lead.message
                            ? lead.message.length > 80
                              ? lead.message.slice(0, 80) + "…"
                              : lead.message
                            : "—"}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                          }}
                        >
                          <StatusSelect
                            leadId={lead.id}
                            current={lead.status}
                          />
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                          }}
                        >
                          {lead.session_id ? (
                            <Link
                              href={`/albamed/sessions/${lead.session_id}`}
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
                          ) : (
                            <span style={{ color: "#334155", fontSize: 13 }}>—</span>
                          )}
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
