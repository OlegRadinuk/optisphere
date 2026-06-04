"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LeadsTrendChart } from "@/components/albamed/LeadsTrendChart"

interface StatsData {
  leadsTotal: number
  leadsNew: number
  leadsUnhandled: number
  leadsClosed: number
  leadsToday: number
  leads30d: number
  trendPct: number
  oldestNewDays: number
  leadsBySource: { source: string; count: number }[]
  chatLeads: number
  chatSessions: number
  chatConversion: number
  leadsByDay: { date: string; count: number }[]
}

interface Lead {
  id: number
  name: string
  phone: string
  message: string
  status: "new" | "working" | "closed"
  created_at: string
  source?: string
}

const SOURCE_LABELS: Record<string, string> = {
  cf7: "Форма сайта", chat: "Чат-бот", booking: "Запись", import: "Импорт", other: "Другое",
}
const SOURCE_COLORS: Record<string, string> = {
  cf7: "#0e7490", chat: "#4f46e5", booking: "#0d9488", import: "#94a3b8", other: "#94a3b8",
}

function ageDays(iso: string): number {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
}
function ageLabel(d: number): string {
  if (d === 0) return "сегодня"
  if (d === 1) return "1 день"
  if (d < 5) return `${d} дня`
  return `${d} дней`
}

// ── Карточка метрики ──────────────────────────────────────────
function StatCard({ label, value, sub, icon, tone, href, loading }: {
  label: string; value: string | number; sub?: React.ReactNode
  icon: React.ReactNode; tone: "danger" | "brand" | "plain"; href?: string; loading: boolean
}) {
  const bg = tone === "danger" ? "#dc2626" : tone === "brand" ? "#f47920" : "#fff"
  const filled = tone !== "plain"
  const inner = (
    <div style={{
      background: bg, border: filled ? "none" : "1px solid #e8e8e8", borderRadius: 12,
      padding: "18px 20px", height: "100%", boxShadow: filled ? "0 4px 16px rgba(0,0,0,0.12)" : "0 1px 4px rgba(0,0,0,0.04)",
      cursor: href ? "pointer" : "default", transition: "transform 150ms",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
          background: filled ? "rgba(255,255,255,0.2)" : "#fff4ec", color: filled ? "#fff" : "#f47920", flexShrink: 0 }}>
          {icon}
        </div>
        <span style={{ fontSize: 12.5, color: filled ? "rgba(255,255,255,0.85)" : "#888", fontWeight: 500 }}>{label}</span>
      </div>
      {loading ? (
        <div style={{ width: 64, height: 30, background: filled ? "rgba(255,255,255,0.3)" : "#f0f0f0", borderRadius: 5, animation: "pulse 1.5s ease infinite" }} />
      ) : (
        <div style={{ fontSize: 30, fontWeight: 800, color: filled ? "#fff" : "#1a1a1a", lineHeight: 1.05 }}>{value}</div>
      )}
      {sub && <div style={{ fontSize: 12, marginTop: 6, color: filled ? "rgba(255,255,255,0.85)" : "#999" }}>{sub}</div>}
    </div>
  )
  return href ? <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>{inner}</Link> : inner
}

export default function AlbamedOverviewPage() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [hot, setHot] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/albamed/stats")
      .then((r) => { if (!r.ok) throw new Error("Ошибка загрузки"); return r.json() })
      .then((d: StatsData) => { setStats(d); setLoading(false) })
      .catch((e: unknown) => { setError(e instanceof Error ? e.message : "Ошибка"); setLoading(false) })

    // Горящие = самые старые необработанные
    fetch("/api/albamed/leads?status=new&sort=oldest&limit=6")
      .then((r) => r.json())
      .then((d: { leads: Lead[] }) => setHot(d.leads ?? []))
      .catch(() => {})
  }, [])

  if (error) return <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>

  const sources = stats?.leadsBySource ?? []
  const srcTotal = sources.reduce((s, x) => s + x.count, 0) || 1
  const trend = stats?.trendPct ?? 0

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 4px" }}>Обзор</h1>
      <p style={{ fontSize: 14, color: "#999", margin: "0 0 22px" }}>Заявки, источники и что требует внимания</p>

      {/* Карточки */}
      <div className="ab-stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        <StatCard
          label="Не обработано" loading={loading} tone={stats && stats.leadsUnhandled > 0 ? "danger" : "plain"}
          value={stats?.leadsUnhandled ?? 0}
          sub={stats && stats.oldestNewDays > 0 ? `самая старая ждёт ${ageLabel(stats.oldestNewDays)}` : "всё разобрано 👌"}
          href="/albamed/leads?status=new"
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
        />
        <StatCard
          label="Заявок за 30 дней" loading={loading} tone="plain"
          value={stats?.leads30d ?? 0}
          sub={<span style={{ color: trend >= 0 ? "#16a34a" : "#dc2626", fontWeight: 600 }}>{trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}% к прошлым 30 дням</span>}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>}
        />
        <StatCard
          label="Конверсия чат-бота" loading={loading} tone="brand"
          value={stats ? `${stats.chatConversion}%` : "0%"}
          sub={stats ? `${stats.chatLeads} заявок из ${stats.chatSessions} диалогов` : ""}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>}
        />
        <StatCard
          label="Всего заявок" loading={loading} tone="plain"
          value={stats?.leadsTotal ?? 0}
          sub={stats ? `${stats.leadsClosed} закрыто · ${stats.leadsToday} сегодня` : ""}
          icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
        />
      </div>

      {/* Тренд */}
      <LeadsTrendChart data={stats?.leadsByDay ?? []} loading={loading} />

      {/* Источники + Горящие */}
      <div className="ab-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 1.3fr", gap: 16, marginTop: 16 }}>
        {/* Источники */}
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 16 }}>Откуда приходят заявки</div>
          {loading ? (
            <div style={{ height: 120, background: "#f0f0f0", borderRadius: 6, animation: "pulse 1.5s ease infinite" }} />
          ) : sources.length === 0 ? (
            <div style={{ color: "#bbb", fontSize: 13 }}>Нет данных</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {sources.map((s) => {
                const pct = Math.round((s.count / srcTotal) * 100)
                const color = SOURCE_COLORS[s.source] ?? "#94a3b8"
                return (
                  <div key={s.source}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, fontSize: 13 }}>
                      <span style={{ color: "#444", fontWeight: 500 }}>{SOURCE_LABELS[s.source] ?? s.source}</span>
                      <span style={{ color: "#999" }}>{s.count} · {pct}%</span>
                    </div>
                    <div style={{ height: 8, background: "#f1f1f1", borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 4 }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Горящие заявки */}
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>🔥 Требуют звонка</span>
            <Link href="/albamed/leads?status=new" style={{ fontSize: 13, color: "#f47920", textDecoration: "none", fontWeight: 500 }}>Все →</Link>
          </div>
          {loading ? (
            <div style={{ height: 120, background: "#f0f0f0", borderRadius: 6, animation: "pulse 1.5s ease infinite" }} />
          ) : hot.length === 0 ? (
            <div style={{ color: "#16a34a", fontSize: 13, padding: "20px 0", textAlign: "center" }}>Все заявки обработаны 👌</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {hot.map((l) => {
                const d = ageDays(l.created_at)
                const hotColor = d >= 3 ? "#dc2626" : d >= 1 ? "#c2410c" : "#16a34a"
                return (
                  <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", border: "1px solid #f0f0f0", borderRadius: 9, background: d >= 3 ? "#fef2f2" : "#fff" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: "#1a1a1a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.name || "Без имени"}</div>
                      <div style={{ fontSize: 12, color: hotColor, fontWeight: 500 }}>ждёт {ageLabel(d)}</div>
                    </div>
                    <a href={`tel:${l.phone}`} onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 5, background: "#fff4ec", border: "1px solid #fdd9b5", color: "#f47920", borderRadius: 8, padding: "7px 12px", fontSize: 13, fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.97.36 1.91.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                      Позвонить
                    </a>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @media (max-width: 900px) { .ab-two-col { grid-template-columns: 1fr !important; } }
        @media (max-width: 767px) { .ab-stat-grid { grid-template-columns: repeat(2, 1fr) !important; } }
      `}</style>
    </div>
  )
}
