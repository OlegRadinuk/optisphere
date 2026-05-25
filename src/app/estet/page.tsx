"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

const PRIMARY = "#0D9488"
const PRIMARY_LIGHT = "#F0FDFA"
const PRIMARY_SHADOW = "rgba(13,148,136,0.25)"

interface StatsData {
  leadsTotal: number
  leadsNew: number
  sessionsTotal: number
  sessionsToday: number
  conversionRate: number
  leadsByDay: { date: string; count: number }[]
  topHours: { hour: number; count: number }[]
}

interface Lead {
  id: number
  name: string
  phone: string
  message: string
  status: "new" | "working" | "closed"
  created_at: string
  session_id: string | null
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function StatusBadge({ status }: { status: "new" | "working" | "closed" }) {
  const map = {
    new:     { label: "Новый",    bg: PRIMARY_LIGHT, color: PRIMARY, border: "#99F6E4" },
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

function StatCard({ label, value, icon, loading, accent }: {
  label: string; value: string | number; icon: React.ReactNode; loading: boolean; accent?: boolean
}) {
  return (
    <div style={{
      background: accent ? PRIMARY : "#ffffff",
      border: accent ? "none" : "1px solid #E2E8F0",
      borderRadius: 10,
      padding: "20px 24px",
      display: "flex",
      alignItems: "center",
      gap: 16,
      boxShadow: accent ? `0 4px 16px ${PRIMARY_SHADOW}` : "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)",
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10,
        background: accent ? "rgba(255,255,255,0.2)" : PRIMARY_LIGHT,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: accent ? "#fff" : PRIMARY, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.75)" : "#999", marginBottom: 4 }}>
          {label}
        </div>
        {loading ? (
          <div style={{ width: 56, height: 24, background: accent ? "rgba(255,255,255,0.3)" : "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
        ) : (
          <div style={{ fontFamily: "var(--font-oxanium)", fontSize: 30, fontWeight: 700, letterSpacing: "-0.8px", color: accent ? "#fff" : "#0F172A", lineHeight: 1.1 }}>
            {value}
          </div>
        )}
      </div>
    </div>
  )
}

export default function EstetOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingLeads, setLoadingLeads] = useState(true)

  useEffect(() => {
    fetch("/api/estet/stats")
      .then((r) => r.json())
      .then((d: StatsData) => { setStats(d); setLoadingStats(false) })
      .catch(() => setLoadingStats(false))

    fetch("/api/estet/leads?limit=5&status=all")
      .then((r) => r.json())
      .then((d: { leads: Lead[] }) => { setRecentLeads(d.leads ?? []); setLoadingLeads(false) })
      .catch(() => setLoadingLeads(false))
  }, [])

  const maxLeadDay = stats ? Math.max(...stats.leadsByDay.map((d) => d.count), 1) : 1

  return (
    <div>
      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .es-overview-table-wrap { overflow-x: auto; }
        .es-overview-cards { display: none; }
        @media (max-width: 767px) {
          .es-overview-table-wrap table { display: none; }
          .es-overview-cards {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .es-stat-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: 10px !important;
          }
        }
      `}</style>

      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--font-oxanium)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: "#0F172A", margin: "0 0 4px" }}>Обзор</h1>
        <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Статистика бота Эля — стоматология Эстетик</p>
      </div>

      {/* Stats grid */}
      <div className="es-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        <StatCard
          label="Новых лидов"
          value={stats?.leadsNew ?? 0}
          loading={loadingStats}
          accent
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
            </svg>
          }
        />
        <StatCard
          label="Всего лидов"
          value={stats?.leadsTotal ?? 0}
          loading={loadingStats}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
        <StatCard
          label="Диалогов сегодня"
          value={stats?.sessionsToday ?? 0}
          loading={loadingStats}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          }
        />
        <StatCard
          label="Конверсия"
          value={`${stats?.conversionRate ?? 0}%`}
          loading={loadingStats}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
      </div>

      {/* Activity chart */}
      {stats && stats.leadsByDay.length > 0 && (
        <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "20px 24px", marginBottom: 24, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 16 }}>Активность за 14 дней</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
            {stats.leadsByDay.map((d) => (
              <div key={d.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div
                  style={{
                    width: "100%",
                    height: Math.max(4, Math.round((d.count / maxLeadDay) * 64)),
                    background: PRIMARY,
                    borderRadius: "3px 3px 0 0",
                    opacity: 0.85,
                  }}
                  title={`${d.date}: ${d.count} лидов`}
                />
                <span style={{ fontSize: 9, color: "#bbb", whiteSpace: "nowrap" }}>
                  {new Date(d.date).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent leads */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Последние лиды</span>
          <Link href="/estet/leads" style={{ fontSize: 13, color: PRIMARY, textDecoration: "none", fontWeight: 500 }}>
            Все лиды →
          </Link>
        </div>

        {/* Desktop table */}
        <div className="es-overview-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                {["Дата", "Имя", "Телефон", "Статус"].map((col) => (
                  <th key={col} style={{ padding: "10px 16px", textAlign: "left", color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingLeads
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[100, 120, 110, 90].map((w, j) => (
                        <td key={j} style={{ padding: "13px 16px", borderBottom: "1px solid #f5f5f5" }}>
                          <div style={{ width: w, height: 14, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : recentLeads.length === 0
                ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb" }}>
                        Лидов пока нет
                      </td>
                    </tr>
                  )
                : recentLeads.map((lead, idx) => (
                    <tr key={lead.id}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9" }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      style={{ transition: "background 150ms" }}
                    >
                      <td style={{ padding: "13px 16px", color: "#94A3B8", fontSize: 13, borderBottom: idx < recentLeads.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                        {formatDate(lead.created_at)}
                      </td>
                      <td style={{ padding: "13px 16px", fontWeight: 500, borderBottom: idx < recentLeads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        {lead.name || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#475569", borderBottom: idx < recentLeads.length - 1 ? "1px solid #f5f5f5" : "none", whiteSpace: "nowrap" }}>
                        {lead.phone}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: idx < recentLeads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <StatusBadge status={lead.status} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="es-overview-cards" style={{ padding: "12px 16px" }}>
          {loadingLeads
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: "#F1F5F9", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ width: "55%", height: 14, background: "#E2E8F0", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s ease infinite" }} />
                  <div style={{ width: "40%", height: 14, background: "#E2E8F0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                </div>
              ))
            : recentLeads.map((lead) => (
                <div key={lead.id} style={{ background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 10, padding: "14px 16px", marginBottom: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontWeight: 600, color: "#0F172A", fontSize: 15 }}>{lead.name || "—"}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div style={{ fontSize: 12, color: "#bbb", marginBottom: 4 }}>{formatDate(lead.created_at)}</div>
                  <a href={`tel:${lead.phone}`} style={{ color: PRIMARY, fontSize: 14, textDecoration: "none", fontWeight: 500 }}>{lead.phone}</a>
                </div>
              ))
          }
        </div>
      </div>
    </div>
  )
}
