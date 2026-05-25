"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

interface AlbamedSidebarProps {
  newLeadsCount: number
  onClose?: () => void
}

export function AlbamedSidebar({ newLeadsCount, onClose }: AlbamedSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const isActive = (href: string) =>
    href === "/albamed" ? pathname === "/albamed" : pathname.startsWith(href)

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" })
    router.push("/aiadmin")
  }

  const navItems = [
    {
      href: "/albamed",
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
      href: "/albamed/leads",
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
      href: "/albamed/sessions",
      label: "Диалоги",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      href: "/albamed/calendar",
      label: "Календарь",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      href: "/albamed/doctors",
      label: "Врачи",
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4m0 0h4m-4 0H8" />
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
        borderRight: "1px solid #e8e8e8",
        display: "flex",
        flexDirection: "column",
        zIndex: 100,
        boxShadow: "2px 0 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Logo */}
      <div
        style={{
          padding: "20px 16px",
          borderBottom: "1px solid #f0f0f0",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "#f47920",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Альба-Мед</div>
            <div style={{ fontSize: 11, color: "#999", lineHeight: 1.2 }}>Дашборд</div>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", color: "#999", cursor: "pointer", padding: 4 }}
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
                color: active ? "#f47920" : "#555",
                background: active ? "#fff4ec" : "transparent",
                textDecoration: "none",
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                transition: "background 150ms, color 150ms",
                position: "relative",
                borderLeft: active ? "3px solid #f47920" : "3px solid transparent",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "#fafafa"
                  ;(e.currentTarget as HTMLElement).style.color = "#1a1a1a"
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
                <span
                  style={{
                    background: "#f47920",
                    color: "#fff",
                    borderRadius: 9999,
                    padding: "1px 7px",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Logout */}
      <div style={{ padding: "0 8px 20px", borderTop: "1px solid #f0f0f0", paddingTop: 12 }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 10px",
            borderRadius: 8,
            color: "#999",
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
