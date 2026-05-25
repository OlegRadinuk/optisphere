"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { EstetSidebar } from "@/components/estet/EstetSidebar"

const NAV_ITEMS = [
  {
    href: "/estet",
    label: "Обзор",
    exact: true,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    exact: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    href: "/estet/sessions",
    label: "Чаты",
    exact: false,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
]

function EstetShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch("/api/estet/stats")
      .then((r) => {
        if (r.status === 401) { window.location.replace("/estet/login"); return null }
        setAuthed(true)
        return r.json()
      })
      .then((d: { leadsNew?: number } | null) => {
        if (d?.leadsNew !== undefined) setNewLeadsCount(d.leadsNew)
      })
      .catch(() => { window.location.replace("/estet/login") })
  }, [])

  const isActive = (item: typeof NAV_ITEMS[0]) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href)

  if (authed === null) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", background: "#F4F7FA" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, border: "3px solid #e0ecf7", borderTopColor: "#2B8FD5", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
          <span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <div className="es-sidebar-wrap">
        <EstetSidebar newLeadsCount={newLeadsCount} onClose={() => setSidebarOpen(false)} />
      </div>

      {/* ── Mobile: top header ── */}
      <header className="es-topbar">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #2B8FD5 0%, #1A78BF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: "#1a1a1a" }}>Эстетик</span>
        </div>
        {newLeadsCount > 0 && (
          <span style={{ background: "#2B8FD5", color: "#fff", borderRadius: 9999, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>
            {newLeadsCount} новых
          </span>
        )}
      </header>

      {/* ── Mobile: sidebar overlay ── */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 199 }} />
      )}

      {/* ── Main ── */}
      <main className="es-main">
        {children}
      </main>

      {/* ── Mobile: bottom navigation ── */}
      <nav className="es-bottomnav" aria-label="Навигация">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item)
          const isLeads = item.href === "/estet/leads"
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                flex: 1,
                padding: "8px 4px",
                textDecoration: "none",
                color: active ? "#2B8FD5" : "#8b96a5",
                position: "relative",
                WebkitTapHighlightColor: "transparent",
              }}
            >
              <div style={{ position: "relative" }}>
                {item.icon}
                {isLeads && newLeadsCount > 0 && (
                  <span style={{
                    position: "absolute", top: -4, right: -8,
                    background: "#2B8FD5", color: "#fff",
                    borderRadius: 9999, fontSize: 10, fontWeight: 700,
                    padding: "1px 5px", minWidth: 16, textAlign: "center", lineHeight: "14px",
                  }}>
                    {newLeadsCount > 99 ? "99+" : newLeadsCount}
                  </span>
                )}
              </div>
              <span style={{ fontSize: 10, fontWeight: active ? 600 : 400, letterSpacing: "0.01em" }}>
                {item.label}
              </span>
              {active && (
                <span style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 32, height: 2, background: "#2B8FD5", borderRadius: 2 }} />
              )}
            </Link>
          )
        })}
      </nav>

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }

        .es-sidebar-wrap { display: block; }
        .es-topbar       { display: none; }
        .es-bottomnav    { display: none; }
        .es-main {
          margin-left: 220px;
          min-height: 100vh;
          background: #F4F7FA;
          padding: 28px;
        }

        @media (max-width: 767px) {
          .es-sidebar-wrap { display: none !important; }

          .es-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: fixed;
            top: 0; left: 0; right: 0;
            height: 52px;
            background: #fff;
            border-bottom: 1px solid #e0ecf7;
            padding: 0 16px;
            z-index: 100;
            padding-top: env(safe-area-inset-top);
            height: calc(52px + env(safe-area-inset-top));
          }

          .es-main {
            margin-left: 0 !important;
            padding: 16px 16px 80px !important;
            margin-top: calc(52px + env(safe-area-inset-top));
            min-height: calc(100vh - 52px - env(safe-area-inset-top));
          }

          .es-bottomnav {
            display: flex;
            position: fixed;
            bottom: 0; left: 0; right: 0;
            background: #fff;
            border-top: 1px solid #e0ecf7;
            z-index: 100;
            padding-bottom: env(safe-area-inset-bottom);
          }
        }
      `}</style>
    </>
  )
}

export function EstetShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname === "/estet/login") {
    return <>{children}</>
  }

  return <EstetShellInner>{children}</EstetShellInner>
}
