"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

interface EstetSidebarProps {
  newLeadsCount: number
  onClose?: () => void
}

export function EstetSidebar({ newLeadsCount, onClose }: EstetSidebarProps) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/estet" ? pathname === "/estet" : pathname.startsWith(href)

  async function handleLogout() {
    await fetch("/api/estet/auth", { method: "DELETE" })
    window.location.replace("/estet/login")
  }

  const navItems = [
    {
      href: "/estet",
      label: "Обзор",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
    },
    {
      href: "/estet/leads",
      label: "Лиды",
      badge: newLeadsCount > 0 ? newLeadsCount : null,
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      ),
    },
    {
      href: "/estet/calendar",
      label: "Запись",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      href: "/estet/sessions",
      label: "Диалоги",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: "/estet/doctors",
      label: "Врачи",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 0h4m-4 0H8" />
        </svg>
      ),
    },
  ]

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        width: 220,
        background: "#ffffff",
        borderRight: "1px solid #E2E8F0",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        boxShadow: "2px 0 8px rgba(13,148,136,0.08)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #F1F5F9",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: "linear-gradient(135deg, #0D9488 0%, #0F766E 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(13,148,136,0.35)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5.5C10.5 4 8.5 3.5 7 4.2 5 5 4 7 4.5 10c.4 2.3 1 3.8 1.4 6 .3 1.6.5 4 1.6 4 1 0 1.1-1.7 1.4-3.2.3-1.5.6-2.6 1.1-2.6.5 0 .8 1.1 1.1 2.6.3 1.5.4 3.2 1.4 3.2 1.1 0 1.3-2.4 1.6-4 .4-2.2 1-3.7 1.4-6 .5-3-.5-5-2.5-5.8-1.5-.7-3.5-.2-5 1.3z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>Эстетик</div>
            <div style={{ fontSize: 11, color: "#94A3B8", lineHeight: 1.2 }}>Дашборд</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#94A3B8", cursor: "pointer", padding: 4 }}
            aria-label="Закрыть меню"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Nav items */}
      <div style={{ flex: 1, padding: "12px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 10px",
                borderRadius: 8,
                color: active ? "#0D9488" : "#555",
                background: active ? "#F0FDFA" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                transition: "background 150ms, color 150ms",
                position: "relative",
                borderLeft: active ? "3px solid #0D9488" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "#F1F5F9"
                  ;(e.currentTarget as HTMLElement).style.color = "#0F172A"
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent"
                  ;(e.currentTarget as HTMLElement).style.color = "#555"
                }
              }}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge !== null && item.badge !== undefined && (
                <span style={{
                  background: "#0D9488",
                  color: "#fff",
                  borderRadius: 9999,
                  padding: "1px 7px",
                  fontSize: 11,
                  fontWeight: 700,
                }}>
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: "0 8px 20px", borderTop: "1px solid #F1F5F9", paddingTop: 12 }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 10px",
            borderRadius: 8,
            color: "#94A3B8",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            fontSize: 14,
            transition: "background 150ms, color 150ms",
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = "#fff0f0"
            ;(e.currentTarget as HTMLElement).style.color = "#e53e3e"
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLElement).style.background = "transparent"
            ;(e.currentTarget as HTMLElement).style.color = "#999"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Выйти
        </button>
      </div>
    </nav>
  )
}
