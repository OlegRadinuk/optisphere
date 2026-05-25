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
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function LeadsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const statusParam = searchParams.get("status") ?? "all"
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
      const r = await fetch(`/api/albamed/leads?status=${statusParam}&page=${pageParam}&limit=${limit}`)
      if (!r.ok) throw new Error("Ошибка загрузки")
      const d: LeadsResponse = await r.json()
      setLeads(d.leads ?? [])
      setTotal(d.total ?? 0)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [statusParam, pageParam])

  useEffect(() => { loadLeads() }, [loadLeads])

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>Лиды</h1>
      <p style={{ fontSize: 14, color: "#999", margin: "0 0 20px" }}>Заявки от пациентов через бота</p>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_TABS.map((tab) => {
          const active = statusParam === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => router.push(`/albamed/leads?status=${tab.key}&page=1`)}
              style={{
                padding: "7px 16px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                border: active ? "none" : "1px solid #e8e8e8",
                background: active ? "#f47920" : "#fff",
                color: active ? "#fff" : "#555",
                fontFamily: "inherit",
                transition: "all 150ms",
                boxShadow: active ? "0 2px 8px rgba(244,121,32,0.3)" : "none",
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Table */}
      <div style={{ overflowX: "auto" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", minWidth: 700, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {error ? (
            <div style={{ padding: 20, color: "#ef4444", display: "flex", gap: 12, alignItems: "center" }}>
              <span>{error}</span>
              <button
                onClick={loadLeads}
                style={{ border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "6px 12px", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}
              >
                Повторить
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                  {["Дата", "Имя", "Телефон", "Сообщение", "Статус", "Переписка"].map((col) => (
                    <th key={col} style={{ padding: "10px 16px", textAlign: "left", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 10 }).map((_, i) => (
                      <tr key={i}>
                        {[100, 120, 110, 200, 100, 80].map((w, j) => (
                          <td key={j} style={{ padding: "13px 16px", borderBottom: "1px solid #f5f5f5" }}>
                            <div style={{ width: w, height: 14, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : leads.length === 0
                  ? (
                      <tr>
                        <td colSpan={6} style={{ padding: "50px 16px", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                          Лидов нет
                        </td>
                      </tr>
                    )
                  : leads.map((lead, idx) => (
                      <tr
                        key={lead.id}
                        style={{ transition: "background 150ms" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <td style={{ padding: "13px 16px", color: "#999", fontSize: 13, borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                          {formatDate(lead.created_at)}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#1a1a1a", fontWeight: 500, borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {lead.name || "—"}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#555", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                          {lead.phone}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#999", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={lead.message}>
                          {lead.message ? (lead.message.length > 80 ? lead.message.slice(0, 80) + "…" : lead.message) : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          <StatusSelect leadId={lead.id} current={lead.status} />
                        </td>
                        <td style={{ padding: "13px 16px", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {lead.session_id ? (
                            <Link
                              href={`/albamed/sessions/${lead.session_id}`}
                              style={{ color: "#f47920", fontSize: 13, fontWeight: 500, textDecoration: "none" }}
                              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline" }}
                              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none" }}
                            >
                              Открыть →
                            </Link>
                          ) : (
                            <span style={{ color: "#ccc", fontSize: 13 }}>—</span>
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
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "center" }}>
          <button
            onClick={() => router.push(`/albamed/leads?status=${statusParam}&page=${pageParam - 1}`)}
            disabled={pageParam <= 1}
            style={{ background: "#fff", border: "1px solid #e8e8e8", color: pageParam <= 1 ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            ← Пред.
          </button>
          <span style={{ color: "#999", fontSize: 13, padding: "0 8px" }}>
            {pageParam} / {totalPages}
          </span>
          <button
            onClick={() => router.push(`/albamed/leads?status=${statusParam}&page=${pageParam + 1}`)}
            disabled={pageParam >= totalPages}
            style={{ background: "#fff", border: "1px solid #e8e8e8", color: pageParam >= totalPages ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}
          >
            След. →
          </button>
        </div>
      )}
    </div>
  )
}
