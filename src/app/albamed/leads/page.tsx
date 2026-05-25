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
  statusCounts?: Record<string, number>
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
  const [search, setSearch] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  const limit = 20
  const totalPages = Math.max(1, Math.ceil(total / limit))

  const loadLeads = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const url = `/api/albamed/leads?status=${statusParam}&page=${pageParam}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`
      const r = await fetch(url)
      if (!r.ok) throw new Error("Ошибка загрузки")
      const d: LeadsResponse = await r.json()
      setLeads(d.leads ?? [])
      setTotal(d.total ?? 0)
      if (d.statusCounts) setStatusCounts(d.statusCounts)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки")
    } finally {
      setLoading(false)
    }
  }, [statusParam, pageParam, search])

  useEffect(() => { loadLeads() }, [loadLeads])

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>Лиды</h1>
          <p style={{ fontSize: 14, color: "#999", margin: 0 }}>Заявки от пациентов через бота</p>
        </div>
        {/* Search */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, border: "1px solid #e8e8e8", borderRadius: 8, background: "#fff", overflow: "hidden", minWidth: 240 }}>
          <svg style={{ margin: "0 10px", flexShrink: 0, color: "#bbb" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); router.push(`/albamed/leads?status=${statusParam}&page=1`) } }}
            style={{ flex: 1, border: "none", outline: "none", padding: "8px 12px 8px 0", fontSize: 13, background: "transparent", color: "#1a1a1a", fontFamily: "inherit" }}
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); router.push(`/albamed/leads?status=${statusParam}&page=1`) }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", color: "#bbb", fontSize: 16 }}
            >×</button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_TABS.map((tab) => {
          const active = statusParam === tab.key
          const count = statusCounts[tab.key]
          return (
            <button
              key={tab.key}
              onClick={() => { setSearch(""); setSearchInput(""); router.push(`/albamed/leads?status=${tab.key}&page=1`) }}
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
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,0.25)" : "#f5f5f5",
                  color: active ? "#fff" : "#888",
                  borderRadius: 9999,
                  padding: "1px 7px",
                  fontSize: 11,
                  fontWeight: 700,
                  minWidth: 20,
                  textAlign: "center",
                }}>
                  {count}
                </span>
              )}
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
