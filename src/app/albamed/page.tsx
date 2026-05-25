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
  const d = new Date(iso)
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "2-digit" })
}

function StatCard({
  label,
  value,
  loading,
}: {
  label: string
  value: string | number
  loading: boolean
}) {
  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: 20,
      }}
    >
      <div
        style={{
          fontSize: 12,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      {loading ? (
        <div
          style={{
            width: 60,
            height: 28,
            background: "#334155",
            borderRadius: 4,
            marginTop: 8,
            animation: "pulse 1.5s ease infinite",
          }}
        />
      ) : (
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#e2e8f0",
            marginTop: 8,
          }}
        >
          {value}
        </div>
      )}
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
      .then((r) => {
        if (!r.ok) throw new Error("Ошибка загрузки статистики")
        return r.json()
      })
      .then((d: StatsData) => {
        setStats(d)
        setLoadingStats(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Ошибка загрузки")
        setLoadingStats(false)
      })

    fetch("/api/albamed/leads?limit=5&page=1")
      .then((r) => r.json())
      .then((d: { leads: Lead[] }) => {
        setLeads(d.leads ?? [])
        setLoadingLeads(false)
      })
      .catch(() => setLoadingLeads(false))
  }, [])

  // Build 24-hour chart data from topHours
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: stats?.topHours.find((h) => h.hour === hour)?.count ?? 0,
  }))

  if (error) {
    return (
      <div style={{ color: "#ef4444", padding: 20 }}>
        {error}
      </div>
    )
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 20px" }}>
        Обзор
      </h1>

      {/* Stat cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}
        className="albamed-stat-grid"
      >
        <StatCard
          label="Лидов сегодня"
          value={stats?.leadsToday ?? 0}
          loading={loadingStats}
        />
        <StatCard
          label="Всего лидов"
          value={stats?.leadsTotal ?? 0}
          loading={loadingStats}
        />
        <StatCard
          label="Диалогов сегодня"
          value={stats?.sessionsToday ?? 0}
          loading={loadingStats}
        />
        <StatCard
          label="Конверсия"
          value={stats ? `${stats.conversionRate}%` : "0%"}
          loading={loadingStats}
        />
      </div>

      {/* Activity chart */}
      <ActivityChart data={chartData} loading={loadingStats} />

      {/* Recent leads */}
      <div style={{ marginTop: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Последние лиды</span>
          <Link
            href="/albamed/leads"
            style={{
              background: "transparent",
              border: "1px solid #334155",
              color: "#94a3b8",
              borderRadius: 6,
              padding: "6px 12px",
              fontSize: 13,
              textDecoration: "none",
              transition: "border-color 150ms, color 150ms",
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "#3b82f6"
              ;(e.currentTarget as HTMLElement).style.color = "#3b82f6"
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLElement).style.borderColor = "#334155"
              ;(e.currentTarget as HTMLElement).style.color = "#94a3b8"
            }}
          >
            Все лиды →
          </Link>
        </div>

        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f172a" }}>
                {["Дата", "Имя", "Телефон", "Статус"].map((col) => (
                  <th
                    key={col}
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #334155",
                      color: "#94a3b8",
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: 500,
                    }}
                  >
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
                        <td key={j} style={{ padding: "12px 16px", borderBottom: "1px solid #334155" }}>
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
                        colSpan={4}
                        style={{
                          padding: "32px 16px",
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: 14,
                        }}
                      >
                        Лидов пока нет
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
                        }}
                      >
                        {lead.phone}
                      </td>
                      <td
                        style={{
                          padding: "12px 16px",
                          borderBottom: idx < leads.length - 1 ? "1px solid #334155" : "none",
                        }}
                      >
                        <StatusBadge status={lead.status} />
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .albamed-stat-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
      `}</style>
    </div>
  )
}
