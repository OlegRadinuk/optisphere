"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import DarkStatCard from "./DarkStatCard"
import LeadStatusBadge from "./LeadStatusBadge"
import DialogDrawer from "./DialogDrawer"
import AnalyticsBlock from "./AnalyticsBlock"
import { MOCK_LEADS, MOCK_STATS, type Lead, type LeadStatus } from "./mock-data"

// ── Icons ─────────────────────────────────────────────────────────────────────

const IconChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
  </svg>
)
const IconUsers = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
)
const IconBarChart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M7 14l4-4 4 4 4-4" />
  </svg>
)
const IconSettings = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const NAV_ITEMS = [
  { label: "Обзор", href: "/saas/dashboard", icon: <IconChart /> },
  { label: "Лиды", href: "/saas/dashboard/leads", icon: <IconUsers /> },
  { label: "Аналитика", href: "/saas/dashboard/analytics", icon: <IconBarChart /> },
  { label: "Настройки", href: "/saas/dashboard/settings", icon: <IconSettings />, disabled: true },
]

// ── Avatar ────────────────────────────────────────────────────────────────────

function Avatar({ name }: { name: string }) {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        background: "rgba(232,32,32,0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
      }}
      aria-hidden="true"
    >
      <span style={{ fontFamily: "var(--op-font-display)", fontSize: 14, fontWeight: 700, color: "var(--op-accent)" }}>
        {name.charAt(0)}
      </span>
    </div>
  )
}

// ── Lead row (compact) ────────────────────────────────────────────────────────

function LeadRowCompact({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  return (
    <div
      style={{
        padding: "14px 0",
        borderBottom: "1px solid var(--op-divider)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Avatar name={lead.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text)", fontWeight: 500 }}>
          {lead.name}
        </div>
        <div
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 13,
            color: "var(--op-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {lead.request}
        </div>
      </div>
      <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
        <span style={{ fontFamily: "var(--op-font-body)", fontSize: 12, color: "var(--op-text-muted)" }}>{lead.timeAgo}</span>
        <LeadStatusBadge status={lead.status} />
      </div>
      <button
        onClick={onClick}
        className="btn btn-ghost"
        style={{ height: 32, padding: "0 12px", fontSize: 13, flexShrink: 0 }}
      >
        Открыть
      </button>
    </div>
  )
}

// ── Lead row (full) ───────────────────────────────────────────────────────────

type FilterTab = "all" | "new" | "working" | "closed"

function LeadsPage({ onOpenLead }: { onOpenLead: (lead: Lead) => void }) {
  const [filter, setFilter] = useState<FilterTab>("all")
  const [search, setSearch] = useState("")

  const filtered = MOCK_LEADS.filter((l) => {
    if (filter !== "all" && l.status !== filter) return false
    if (search && !l.name.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const tabs: { key: FilterTab; label: string }[] = [
    { key: "all", label: "Все" },
    { key: "new", label: "Новые" },
    { key: "working", label: "В работе" },
    { key: "closed", label: "Закрытые" },
  ]

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontFamily: "var(--op-font-display)", fontSize: 22, fontWeight: 700, color: "var(--op-text)", marginBottom: 4 }}>
          Лиды
        </h1>
        <p style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)" }}>
          Все обращения пациентов через AI-ассистента
        </p>
      </div>

      {/* Filter bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        <div style={{ display: "flex", gap: 0, borderBottom: "1px solid var(--op-border)" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                padding: "8px 16px",
                background: "transparent",
                border: "none",
                borderBottom: filter === tab.key ? "2px solid var(--op-accent)" : "2px solid transparent",
                fontFamily: "var(--op-font-body)",
                fontSize: 14,
                color: filter === tab.key ? "var(--op-text)" : "var(--op-text-secondary)",
                fontWeight: filter === tab.key ? 600 : 400,
                marginBottom: -1,
                transition: "color 160ms, border-color 160ms",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="search"
          placeholder="Поиск по имени..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Поиск по имени"
          style={{
            background: "var(--op-surface)",
            border: "1px solid var(--op-border)",
            borderRadius: 8,
            padding: "8px 12px",
            fontFamily: "var(--op-font-body)",
            fontSize: 14,
            color: "var(--op-text)",
            outline: "none",
            width: 200,
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(232,32,32,0.4)" }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--op-border)" }}
        />
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 0" }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="var(--op-text-faint)" strokeWidth="1.5" strokeLinecap="round" style={{ display: "block", margin: "0 auto 16px" }} aria-hidden="true">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{ fontFamily: "var(--op-font-display)", fontSize: 18, color: "var(--op-text-secondary)", marginBottom: 8 }}>
            Пока нет заявок
          </h3>
          <p style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-muted)" }}>
            Когда пациент напишет ассистенту — заявка появится здесь
          </p>
        </div>
      ) : (
        <div className="saas-leads-container">
          {/* Desktop table */}
          <div className="saas-leads-table">
            <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0 6px" }}>
              <thead>
                <tr>
                  {["Пациент", "Запрос", "Статус", "Время", ""].map((h) => (
                    <th
                      key={h}
                      style={{
                        fontFamily: "var(--op-font-body)",
                        fontSize: 12,
                        color: "var(--op-text-muted)",
                        fontWeight: 500,
                        padding: "0 12px 10px",
                        textAlign: "left",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((lead) => (
                  <tr
                    key={lead.id}
                    style={{ transition: "background 160ms" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.02)" }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
                  >
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-divider)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar name={lead.name} />
                        <div>
                          <div style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text)", fontWeight: 500 }}>{lead.name}</div>
                          <div style={{ fontFamily: "var(--op-font-body)", fontSize: 12, color: "var(--op-text-muted)" }}>{lead.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-divider)", maxWidth: 240 }}>
                      <div style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {lead.request}
                      </div>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-divider)" }}>
                      <LeadStatusBadge status={lead.status} />
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-divider)" }}>
                      <span style={{ fontFamily: "var(--op-font-body)", fontSize: 12, color: "var(--op-text-muted)", whiteSpace: "nowrap" }}>{lead.timeAgo}</span>
                    </td>
                    <td style={{ padding: "14px 12px", borderBottom: "1px solid var(--op-divider)" }}>
                      <button onClick={() => onOpenLead(lead)} className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 13 }}>
                        Открыть
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="saas-leads-cards" style={{ display: "none", flexDirection: "column", gap: 10 }}>
            {filtered.map((lead) => (
              <div
                key={lead.id}
                style={{
                  background: "var(--op-surface)",
                  border: "1px solid var(--op-border)",
                  borderRadius: 10,
                  padding: 16,
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
                  <Avatar name={lead.name} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text)", fontWeight: 500 }}>{lead.name}</div>
                    <div style={{ fontFamily: "var(--op-font-body)", fontSize: 12, color: "var(--op-text-muted)" }}>{lead.contact}</div>
                  </div>
                  <LeadStatusBadge status={lead.status} />
                </div>
                <p style={{ fontFamily: "var(--op-font-body)", fontSize: 13, color: "var(--op-text-secondary)", marginBottom: 12, lineHeight: 1.4 }}>{lead.request}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontFamily: "var(--op-font-body)", fontSize: 12, color: "var(--op-text-muted)" }}>{lead.timeAgo}</span>
                  <button onClick={() => onOpenLead(lead)} className="btn btn-ghost" style={{ height: 32, padding: "0 12px", fontSize: 13 }}>
                    Открыть
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 767px) {
          .saas-leads-table { display: none !important; }
          .saas-leads-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}

// ── Overview page ─────────────────────────────────────────────────────────────

function OverviewPage({ onOpenLead }: { onOpenLead: (lead: Lead) => void }) {
  const hotLeads = MOCK_LEADS.filter((l) => l.status === "new").slice(0, 3)

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontFamily: "var(--op-font-display)", fontSize: 22, fontWeight: 700, color: "var(--op-text)", marginBottom: 4 }}>Обзор</h1>
          <p style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)" }}>
            Клиника «Ромашка» · AI-администратор активен
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "block", width: 7, height: 7, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34,197,94,0.7)" }} aria-hidden="true" />
          <span style={{ fontFamily: "var(--op-font-mono)", fontSize: 11, color: "#22c55e" }}>ОНЛАЙН</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="saas-stat-cards" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        <DarkStatCard
          accent
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>}
          label="Лидов за 7 дней"
          value={String(MOCK_STATS.leadsWeek)}
          sub={`+${MOCK_STATS.leadsToday} сегодня`}
        />
        <DarkStatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>}
          label="Среднее время ответа"
          value={MOCK_STATS.avgResponseTime}
          sub="все ответы AI"
        />
        <DarkStatCard
          icon={<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--op-accent)" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>}
          label="Конверсия в заявку"
          value={MOCK_STATS.conversionRate}
          sub="из 68 диалогов"
        />
      </div>

      {/* Hot leads */}
      {hotLeads.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "var(--op-font-display)", fontSize: 16, fontWeight: 600, color: "var(--op-text)" }}>
              Требуют обработки
            </h2>
            <span
              style={{
                width: 20,
                height: 20,
                borderRadius: "50%",
                background: "var(--op-accent)",
                color: "#fff",
                fontFamily: "var(--op-font-body)",
                fontSize: 11,
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              aria-label={`${hotLeads.length} заявок`}
            >
              {hotLeads.length}
            </span>
          </div>
          <div>
            {hotLeads.map((lead) => (
              <LeadRowCompact key={lead.id} lead={lead} onClick={() => onOpenLead(lead)} />
            ))}
          </div>
          <Link
            href="/saas/dashboard/leads"
            style={{
              display: "inline-block",
              marginTop: 16,
              fontFamily: "var(--op-font-body)",
              fontSize: 14,
              color: "var(--op-accent)",
              textDecoration: "none",
            }}
          >
            Все лиды →
          </Link>
        </div>
      )}

      <style>{`
        .saas-stat-cards {
          grid-template-columns: repeat(3, 1fr) !important;
        }
        @media (max-width: 767px) {
          .saas-stat-cards {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  )
}

// ── Sidebar nav item ──────────────────────────────────────────────────────────

function SidebarNavItem({
  item,
  active,
}: {
  item: (typeof NAV_ITEMS)[0]
  active: boolean
}) {
  if (item.disabled) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 24px",
          opacity: 0.4,
        }}
        aria-disabled="true"
      >
        {item.icon}
        <span style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)" }}>
          {item.label}
        </span>
      </div>
    )
  }

  return (
    <Link
      href={item.href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 24px",
        borderRadius: "0 8px 8px 0",
        background: active ? "rgba(232,32,32,0.08)" : "transparent",
        borderLeft: active ? "2px solid var(--op-accent)" : "2px solid transparent",
        textDecoration: "none",
        transition: "background 160ms",
        marginRight: 8,
      }}
    >
      {item.icon}
      <span
        style={{
          fontFamily: "var(--op-font-body)",
          fontSize: 14,
          color: active ? "var(--op-text)" : "var(--op-text-secondary)",
          fontWeight: active ? 600 : 400,
        }}
      >
        {item.label}
      </span>
    </Link>
  )
}

// ── Bottom nav (mobile) ───────────────────────────────────────────────────────

function BottomNav({ activePath }: { activePath: string }) {
  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: "var(--op-surface)",
        borderTop: "1px solid var(--op-border)",
        height: 60,
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        zIndex: 50,
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Навигация"
    >
      {NAV_ITEMS.map((item) => {
        const active = activePath === item.href
        return item.disabled ? (
          <div
            key={item.label}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              opacity: 0.3,
              padding: "4px 12px",
            }}
          >
            {item.icon}
            <span style={{ fontFamily: "var(--op-font-body)", fontSize: 10, color: "var(--op-text-muted)" }}>{item.label}</span>
          </div>
        ) : (
          <Link
            key={item.label}
            href={item.href}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 12px",
              textDecoration: "none",
              opacity: active ? 1 : 0.55,
            }}
          >
            {item.icon}
            <span
              style={{
                fontFamily: "var(--op-font-body)",
                fontSize: 10,
                color: active ? "var(--op-accent)" : "var(--op-text-secondary)",
                fontWeight: active ? 600 : 400,
              }}
            >
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Main dashboard ─────────────────────────────────────────────────────────────

type DashView = "overview" | "leads" | "analytics"

interface OwnerDashboardProps {
  view: DashView
}

export default function OwnerDashboard({ view }: OwnerDashboardProps) {
  const pathname = usePathname()
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  return (
    <>
      <style>{`
        @keyframes optiGreenPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1); }
        }
        .saas-sidebar-desktop { display: flex !important; }
        .saas-bottom-nav { display: none !important; }
        @media (max-width: 767px) {
          .saas-sidebar-desktop { display: none !important; }
          .saas-bottom-nav { display: flex !important; }
          .saas-main-content { margin-left: 0 !important; padding-bottom: 80px !important; }
        }
        @media (max-width: 640px) {
          .saas-dialog-drawer {
            width: 100vw !important;
          }
        }
      `}</style>

      {/* Trial banner */}
      <div
        style={{
          background: "rgba(232,32,32,0.08)",
          borderBottom: "1px solid rgba(232,32,32,0.2)",
          padding: "8px clamp(20px,3vw,40px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ fontFamily: "var(--op-font-body)", fontSize: 13, color: "var(--op-text-secondary)" }}>
          Пробный период · осталось {MOCK_STATS.trialDaysLeft} дней
        </span>
        <a
          href="#"
          className="btn btn-ghost"
          style={{
            height: 28,
            padding: "0 12px",
            fontSize: 12,
            borderColor: "rgba(232,32,32,0.4)",
            color: "var(--op-accent)",
          }}
          onClick={(e) => e.preventDefault()}
        >
          Апгрейд
        </a>
      </div>

      <div style={{ display: "flex", minHeight: "calc(100svh - 33px)" }}>
        {/* Sidebar */}
        <aside
          className="saas-sidebar-desktop"
          style={{
            width: 240,
            background: "var(--op-surface)",
            borderRight: "1px solid var(--op-border)",
            position: "sticky",
            top: 0,
            height: "calc(100svh - 33px)",
            overflowY: "auto",
            flexDirection: "column",
            flexShrink: 0,
            padding: "24px 0",
          }}
        >
          {/* Logo */}
          <Link
            href="/saas/clinics"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "0 24px",
              marginBottom: 32,
              textDecoration: "none",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="var(--op-accent)" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" fill="var(--op-accent)" />
            </svg>
            <span style={{ fontFamily: "var(--op-font-display)", fontSize: 16, fontWeight: 700, color: "var(--op-text)" }}>
              Optisphere
            </span>
          </Link>

          {/* Nav */}
          <nav style={{ flex: 1 }}>
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem key={item.href} item={item} active={pathname === item.href} />
            ))}
          </nav>

          {/* Bottom */}
          <div style={{ padding: "24px 16px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                padding: "8px 16px",
                background: "rgba(232,32,32,0.1)",
                border: "1px solid rgba(232,32,32,0.25)",
                borderRadius: 8,
                fontFamily: "var(--op-font-body)",
                fontSize: 12,
                color: "var(--op-accent)",
                textAlign: "center",
              }}
            >
              Trial · {MOCK_STATS.trialDaysLeft} дней
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", height: 40, fontSize: 13 }}
              onClick={() => {}}
            >
              Апгрейд с интеграцией
            </button>
          </div>
        </aside>

        {/* Content */}
        <main
          className="saas-main-content"
          style={{
            flex: 1,
            padding: "32px clamp(20px,3vw,40px)",
            overflowX: "hidden",
            minWidth: 0,
          }}
        >
          {view === "overview" && <OverviewPage onOpenLead={setSelectedLead} />}
          {view === "leads" && <LeadsPage onOpenLead={setSelectedLead} />}
          {view === "analytics" && <AnalyticsBlock />}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <div className="saas-bottom-nav">
        <BottomNav activePath={pathname} />
      </div>

      {/* Dialog drawer */}
      <DialogDrawer lead={selectedLead} onClose={() => setSelectedLead(null)} />
    </>
  )
}
