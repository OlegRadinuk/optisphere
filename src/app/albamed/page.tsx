"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ActivityChart } from "@/components/albamed/ActivityChart"
import { StatusBadge } from "@/components/albamed/StatusBadge"

interface StatsData {
  leadsToday: number
  leadsTotal: number
  leadsNew: number
  sessionsToday: number
  sessionsTotal: number
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
  hasChat: boolean
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function StatCard({ label, value, icon, loading, accent }: {
  label: string
  value: string | number
  icon: React.ReactNode
  loading: boolean
  accent?: boolean
}) {
  return (
    <div
      style={{
        background: accent ? "#f47920" : "#ffffff",
        border: accent ? "none" : "1px solid #e8e8e8",
        borderRadius: 10,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        gap: 16,
        boxShadow: accent ? "0 4px 16px rgba(244,121,32,0.25)" : "0 1px 4px rgba(0,0,0,0.04)",
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 10,
          background: accent ? "rgba(255,255,255,0.2)" : "#fff4ec",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: accent ? "#fff" : "#f47920",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 12, color: accent ? "rgba(255,255,255,0.75)" : "#999", marginBottom: 4 }}>
          {label}
        </div>
        {loading ? (
          <div
            style={{
              width: 56,
              height: 24,
              background: accent ? "rgba(255,255,255,0.3)" : "#f0f0f0",
              borderRadius: 4,
              animation: "pulse 1.5s ease infinite",
            }}
          />
        ) : (
          <div style={{ fontSize: 26, fontWeight: 700, color: accent ? "#fff" : "#1a1a1a", lineHeight: 1 }}>
            {value}
          </div>
        )}
      </div>
    </div>
  )
}

export default function AlbamedOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [loadingStats, setLoadingStats] = useState(true)
  const [loadingLeads, setLoadingLeads] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/albamed/stats")
      .then((r) => { if (!r.ok) throw new Error("Ошибка загрузки"); return r.json() })
      .then((d: StatsData) => { setStats(d); setLoadingStats(false) })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : "Ошибка"); setLoadingStats(false) })

    fetch("/api/albamed/leads?limit=5&page=1")
      .then((r) => r.json())
      .then((d: { leads: Lead[] }) => { setLeads(d.leads ?? []); setLoadingLeads(false) })
      .catch(() => setLoadingLeads(false))
  }, [])

  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: stats?.topHours.find((h) => h.hour === hour)?.count ?? 0,
  }))

  if (error) return <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>Обзор</h1>
      <p style={{ fontSize: 14, color: "#999", margin: "0 0 24px" }}>Сводка по активности бота Альбамед</p>

      {/* Stat cards */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16 }}
        className="albamed-stat-grid"
      >
        <StatCard
          label="Новых лидов"
          value={stats?.leadsNew ?? 0}
          loading={loadingStats}
          accent={true}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
        />
        <StatCard
          label="Всего лидов"
          value={stats?.leadsTotal ?? 0}
          loading={loadingStats}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
        <StatCard
          label="Диалогов сегодня"
          value={stats?.sessionsToday ?? 0}
          loading={loadingStats}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        />
        <StatCard
          label="Конверсия"
          value={stats ? `${stats.conversionRate}%` : "0%"}
          loading={loadingStats}
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
        />
      </div>

      {/* Activity chart */}
      <ActivityChart data={chartData} loading={loadingStats} />

      {/* Recent leads */}
      <div style={{ marginTop: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>Последние лиды</span>
          <Link
            href="/albamed/leads"
            style={{
              background: "#fff4ec",
              border: "1px solid #fdd9b5",
              color: "#f47920",
              borderRadius: 6,
              padding: "6px 14px",
              fontSize: 13,
              fontWeight: 500,
              textDecoration: "none",
            }}
          >
            Все лиды →
          </Link>
        </div>

        {/* Desktop table */}
        <div className="ab-overview-table-wrap" style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                {["Дата", "Имя", "Телефон", "Статус"].map((col) => (
                  <th key={col} style={{ padding: "10px 16px", textAlign: "left", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loadingLeads
                ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {[140, 160, 140, 100].map((w, j) => (
                        <td key={j} style={{ padding: "13px 16px", borderBottom: "1px solid #f5f5f5" }}>
                          <div style={{ width: w, height: 14, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
                        </td>
                      ))}
                    </tr>
                  ))
                : leads.length === 0
                ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "40px 16px", textAlign: "center", color: "#bbb", fontSize: 14 }}>
                        Лидов пока нет
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
                      <td style={{ padding: "13px 16px", color: "#999", fontSize: 13, borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        {formatDate(lead.created_at)}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#1a1a1a", fontWeight: 500, borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        {lead.name || "—"}
                      </td>
                      <td style={{ padding: "13px 16px", color: "#555", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        {lead.phone}
                      </td>
                      <td style={{ padding: "13px 16px", borderBottom: idx < leads.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                        <StatusBadge status={lead.status} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="ab-overview-cards">
          {loadingLeads
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 16px", animation: "pulse 1.5s ease infinite" }}>
                  <div style={{ width: "60%", height: 14, background: "#f0f0f0", borderRadius: 4, marginBottom: 8 }} />
                  <div style={{ width: "40%", height: 12, background: "#f0f0f0", borderRadius: 4 }} />
                </div>
              ))
            : leads.length === 0
            ? (
                <div style={{ textAlign: "center", padding: "32px 16px", color: "#bbb", fontSize: 14, background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8" }}>
                  Лидов пока нет
                </div>
              )
            : leads.map((lead) => (
                <div key={lead.id} style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "#1a1a1a" }}>{lead.name || "—"}</span>
                    <StatusBadge status={lead.status} />
                  </div>
                  <div style={{ fontSize: 13, color: "#999", marginBottom: 4 }}>{formatDate(lead.created_at)}</div>
                  {lead.phone && (
                    <a href={`tel:${lead.phone}`} style={{ fontSize: 14, color: "#f47920", fontWeight: 500, textDecoration: "none" }}>
                      {lead.phone}
                    </a>
                  )}
                </div>
              ))
          }
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .ab-overview-table-wrap { display: block; }
        .ab-overview-cards      { display: none; flex-direction: column; gap: 10px; }
        @media (max-width: 767px) {
          .albamed-stat-grid      { grid-template-columns: repeat(2, 1fr) !important; }
          .ab-overview-table-wrap { display: none !important; }
          .ab-overview-cards      { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
