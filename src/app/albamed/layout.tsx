"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlbamedSidebar } from "@/components/albamed/AlbamedSidebar"
import { ToastProvider } from "@/components/albamed/Toast"

export default function AlbamedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch("/api/albamed/stats")
      .then((r) => {
        if (r.status === 401) {
          router.push("/aiadmin")
          return null
        }
        setAuthed(true)
        return r.json()
      })
      .then((d: { leadsNew?: number } | null) => {
        if (d?.leadsNew !== undefined) setNewLeadsCount(d.leadsNew)
      })
      .catch(() => {
        router.push("/aiadmin")
      })
  }, [router])

  if (authed === null) {
    return (
      <html lang="ru">
        <body
          style={{
            margin: 0,
            background: "#0f172a",
            color: "#e2e8f0",
            fontFamily: "system-ui, -apple-system, sans-serif",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
          }}
        >
          <span style={{ color: "#94a3b8", fontSize: 14 }}>Загрузка...</span>
        </body>
      </html>
    )
  }

  return (
    <html lang="ru">
      <body
        style={{
          margin: 0,
          background: "#0f172a",
          color: "#e2e8f0",
          fontFamily: "system-ui, -apple-system, sans-serif",
          fontSize: 14,
        }}
      >
        <ToastProvider>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Открыть меню"
            style={{
              display: "none",
              position: "fixed",
              top: 12,
              left: 12,
              zIndex: 200,
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "8px",
              cursor: "pointer",
              color: "#e2e8f0",
            }}
            className="albamed-hamburger"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Mobile backdrop */}
          {sidebarOpen && (
            <div
              onClick={() => setSidebarOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.6)",
                zIndex: 99,
              }}
            />
          )}

          {/* Sidebar — always rendered, hidden on mobile via CSS unless open */}
          <div
            style={{
              transform: sidebarOpen ? "translateX(0)" : undefined,
            }}
            className={`albamed-sidebar-wrapper${sidebarOpen ? " open" : ""}`}
          >
            <AlbamedSidebar
              newLeadsCount={newLeadsCount}
              onClose={() => setSidebarOpen(false)}
            />
          </div>

          {/* Main content */}
          <main
            className="albamed-main"
            style={{
              marginLeft: 220,
              minHeight: "100vh",
              background: "#0f172a",
              padding: 24,
            }}
          >
            {children}
          </main>

          <style>{`
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.4; }
            }
            @media (max-width: 767px) {
              .albamed-hamburger { display: flex !important; align-items: center; justify-content: center; }
              .albamed-main { margin-left: 0 !important; padding-top: 60px !important; }
              .albamed-sidebar-wrapper { display: none; }
              .albamed-sidebar-wrapper.open { display: block; }
            }
          `}</style>
        </ToastProvider>
      </body>
    </html>
  )
}
