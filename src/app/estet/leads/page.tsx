"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { EstetStatusSelect } from "@/components/estet/EstetStatusSelect"

const PRIMARY = "#0D9488"

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

const STATUS_TABS = [
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

function StatusBadge({ status }: { status: LeadStatus }) {
  const map: Record<LeadStatus, { label: string; bg: string; color: string; border: string }> = {
    new:     { label: "Новый",    bg: "#F0FDFA", color: PRIMARY, border: "#99F6E4" },
    working: { label: "В работе", bg: "#eff6ff", color: "#2563eb", border: "#bfdbfe" },
    closed:  { label: "Закрыт",  bg: "#f0fdf4", color: "#16a34a", border: "#bbf7d0" },
  }
  const s = map[status] ?? map.new
  return (
    <span style={{
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 9999,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`, whiteSpace: "nowrap",
    }}>
      {s.label}
    </span>
  )
}

export default function EstetLeadsPage() {
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
      const url = `/api/estet/leads?status=${statusParam}&page=${pageParam}&limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`
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
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .es-leads-search-wrap { display:flex; align-items:flex-start; justify-content:space-between; flex-wrap:wrap; gap:12px; margin-bottom:16px; }
        .es-leads-search-box { display:flex; align-items:center; border:1px solid #CBD5E1; border-radius:8px; background:#fff; overflow:hidden; min-width:240px; }
        .es-leads-search-input { flex:1; border:none; outline:none; padding:8px 12px 8px 0; font-size:13px; background:transparent; color:#0F172A; font-family:inherit; }
        .es-leads-tabs { display:flex; gap:6px; margin-bottom:16px; flex-wrap:nowrap; overflow-x:auto; -webkit-overflow-scrolling:touch; scrollbar-width:none; -ms-overflow-style:none; padding-bottom:2px; }
        .es-leads-tabs::-webkit-scrollbar { display:none; }
        .es-leads-tab { -webkit-tap-highlight-color:transparent; flex-shrink:0; white-space:nowrap; }
        .es-table-wrap { overflow-x:auto; }
        .es-mobile-cards { display:none; }
        .es-skel-card { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:14px 16px; }
        .es-skel-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
        .es-skel-line { height:14px; background:#E2E8F0; border-radius:4px; animation:pulse 1.5s ease infinite; }

        @media (max-width: 767px) {
          .es-leads-search-wrap { flex-direction:column; align-items:stretch; }
          .es-leads-search-box { min-width:0; width:100%; }
          .es-leads-search-input { font-size:16px; }
          .es-table-wrap table { display:none; }
          .es-mobile-cards { display:flex; flex-direction:column; gap:10px; }
          .es-card { background:#fff; border:1px solid #E2E8F0; border-radius:12px; padding:14px 16px; cursor:pointer; -webkit-tap-highlight-color:transparent; min-height:44px; box-shadow:0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05); }
          .es-card:active { background:#F1F5F9; }
          .es-card-row1 { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
          .es-card-name { font-size:15px; font-weight:600; color:#0F172A; flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
          .es-card-row2 { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:6px; }
          .es-card-phone { font-size:15px; font-weight:500; color:${PRIMARY}; text-decoration:none; -webkit-tap-highlight-color:transparent; min-height:44px; display:flex; align-items:center; }
          .es-card-date { font-size:12px; color:#bbb; white-space:nowrap; }
          .es-card-msg { font-size:13px; color:#999; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; margin-bottom:8px; }
          .es-card-footer { display:flex; align-items:center; justify-content:flex-end; margin-top:2px; }
          .es-card-chat-link { font-size:13px; font-weight:500; color:${PRIMARY}; text-decoration:none; -webkit-tap-highlight-color:transparent; min-height:44px; display:flex; align-items:center; }
        }
      `}</style>

      <div className="es-leads-search-wrap">
        <div>
          <h1 style={{ fontFamily: "var(--font-oxanium)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: "#0F172A", margin: "0 0 4px" }}>Клиенты</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Заявки от пациентов через бота Элю</p>
        </div>
        <div className="es-leads-search-box">
          <svg style={{ margin: "0 10px", flexShrink: 0, color: "#bbb" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Поиск по имени или телефону..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setSearch(searchInput); router.push(`/estet/leads?status=${statusParam}&page=1`) } }}
            className="es-leads-search-input"
          />
          {searchInput && (
            <button
              onClick={() => { setSearchInput(""); setSearch(""); router.push(`/estet/leads?status=${statusParam}&page=1`) }}
              style={{ background: "none", border: "none", cursor: "pointer", padding: "0 10px", color: "#bbb", fontSize: 16, minHeight: 44, WebkitTapHighlightColor: "transparent" }}
            >×</button>
          )}
        </div>
      </div>

      <div className="es-leads-tabs">
        {STATUS_TABS.map((tab) => {
          const active = statusParam === tab.key
          const count = statusCounts[tab.key]
          return (
            <button
              key={tab.key}
              className="es-leads-tab"
              onClick={() => { setSearch(""); setSearchInput(""); router.push(`/estet/leads?status=${tab.key}&page=1`) }}
              style={{
                padding: "7px 16px", borderRadius: 8, fontSize: 13, fontWeight: active ? 600 : 400,
                cursor: "pointer", border: active ? "none" : "1px solid #CBD5E1",
                background: active ? PRIMARY : "#fff",
                color: active ? "#fff" : "#555",
                fontFamily: "inherit", transition: "all 150ms",
                boxShadow: active ? `0 2px 8px ${PRIMARY}4D` : "none",
                display: "flex", alignItems: "center", gap: 6, minHeight: 44,
              }}
            >
              {tab.label}
              {count !== undefined && count > 0 && (
                <span style={{
                  background: active ? "rgba(255,255,255,0.25)" : "#F0FDFA",
                  color: active ? "#fff" : PRIMARY,
                  borderRadius: 9999, padding: "1px 7px", fontSize: 11, fontWeight: 700,
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {error && (
        <div style={{ padding: 20, color: "#ef4444", display: "flex", gap: 12, alignItems: "center", background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10 }}>
          <span>{error}</span>
          <button onClick={loadLeads} style={{ border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "6px 12px", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
            Повторить
          </button>
        </div>
      )}

      {/* Desktop table */}
      {!error && (
        <div className="es-table-wrap">
          <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden", minWidth: 700, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                  {["Дата", "Имя", "Телефон", "Сообщение", "Статус", "Переписка"].map((col) => (
                    <th key={col} style={{ padding: "10px 16px", textAlign: "left", color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
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
                            <div style={{ width: w, height: 14, background: "#E2E8F0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : leads.length === 0
                  ? (
                      <tr><td colSpan={6} style={{ padding: "50px 16px", textAlign: "center", color: "#bbb", fontSize: 14 }}>Клиентов нет</td></tr>
                    )
                  : leads.map((lead, idx) => (
                      <tr key={lead.id} style={{ transition: "background 150ms" }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <td style={{ padding: "13px 16px", color: "#94A3B8", fontSize: 13, borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                          {formatDate(lead.created_at)}
                        </td>
                        <td style={{ padding: "13px 16px", fontWeight: 500, borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {lead.name || "—"}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#475569", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                          {lead.phone}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#94A3B8", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none", maxWidth: 260, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={lead.message}>
                          {lead.message ? (lead.message.length > 80 ? lead.message.slice(0, 80) + "…" : lead.message) : "—"}
                        </td>
                        <td style={{ padding: "13px 16px", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          <EstetStatusSelect leadId={lead.id} current={lead.status} />
                        </td>
                        <td style={{ padding: "13px 16px", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {lead.session_id ? (
                            <Link href={`/estet/sessions/${lead.session_id}`} style={{ color: PRIMARY, fontSize: 13, fontWeight: 500, textDecoration: "none" }}
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
          </div>
        </div>
      )}

      {/* Mobile cards */}
      {!error && (
        <div className="es-mobile-cards">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="es-skel-card">
                  <div className="es-skel-row">
                    <div className="es-skel-line" style={{ width: "55%" }} />
                    <div className="es-skel-line" style={{ width: "22%" }} />
                  </div>
                  <div className="es-skel-row">
                    <div className="es-skel-line" style={{ width: "40%" }} />
                    <div className="es-skel-line" style={{ width: "30%" }} />
                  </div>
                  <div className="es-skel-line" style={{ width: "80%" }} />
                </div>
              ))
            : leads.length === 0
            ? <div style={{ padding: "40px 0", textAlign: "center", color: "#bbb", fontSize: 14 }}>Клиентов нет</div>
            : leads.map((lead) => (
                <div key={lead.id} className="es-card"
                  onClick={() => { if (lead.session_id) router.push(`/estet/sessions/${lead.session_id}`) }}
                >
                  <div className="es-card-row1">
                    <span className="es-card-name">{lead.name || "—"}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div className="es-card-row2">
                    <a href={`tel:${lead.phone}`} className="es-card-phone" onClick={(e) => e.stopPropagation()}>
                      {lead.phone}
                    </a>
                    <span className="es-card-date">{formatDate(lead.created_at)}</span>
                  </div>
                  {lead.message && <div className="es-card-msg">{lead.message}</div>}
                  {lead.session_id && (
                    <div className="es-card-footer">
                      <Link href={`/estet/sessions/${lead.session_id}`} className="es-card-chat-link" onClick={(e) => e.stopPropagation()}>
                        Открыть чат →
                      </Link>
                    </div>
                  )}
                </div>
              ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, justifyContent: "center", paddingBottom: "env(safe-area-inset-bottom)" }}>
          <button onClick={() => router.push(`/estet/leads?status=${statusParam}&page=${pageParam - 1}`)} disabled={pageParam <= 1}
            style={{ background: "#fff", border: "1px solid #CBD5E1", color: pageParam <= 1 ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44, WebkitTapHighlightColor: "transparent" }}>
            ← Пред.
          </button>
          <span style={{ color: "#94A3B8", fontSize: 13, padding: "0 8px" }}>{pageParam} / {totalPages}</span>
          <button onClick={() => router.push(`/estet/leads?status=${statusParam}&page=${pageParam + 1}`)} disabled={pageParam >= totalPages}
            style={{ background: "#fff", border: "1px solid #CBD5E1", color: pageParam >= totalPages ? "#ccc" : "#555", borderRadius: 8, padding: "7px 14px", fontSize: 13, cursor: pageParam >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit", minHeight: 44, WebkitTapHighlightColor: "transparent" }}>
            След. →
          </button>
        </div>
      )}
    </div>
  )
}
