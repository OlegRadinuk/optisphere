"use client"

import { useState, useEffect } from "react"
import { AlbamedSidebar } from "@/components/albamed/AlbamedSidebar"
import { ToastProvider } from "@/components/albamed/Toast"

export function AlbamedShell({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [newLeadsCount, setNewLeadsCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetch("/api/albamed/stats")
      .then((r) => {
        if (r.status === 401) {
          window.location.replace("/aiadmin")
          return null
        }
        setAuthed(true)
        return r.json()
      })
      .then((d: { leadsNew?: number } | null) => {
        if (d?.leadsNew !== undefined) setNewLeadsCount(d.leadsNew)
      })
      .catch(() => {
        window.location.replace("/aiadmin")
      })
  }, [])

  if (authed === null) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "#f5f6f8",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 36,
              height: 36,
              border: "3px solid #f0f0f0",
              borderTopColor: "#f47920",
              borderRadius: "50%",
              animation: "spin 0.7s linear infinite",
            }}
          />
          <span style={{ color: "#999", fontSize: 14 }}>Загрузка...</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
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
          background: "#fff",
          border: "1px solid #e8e8e8",
          borderRadius: 8,
          padding: "8px",
          cursor: "pointer",
          color: "#555",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
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
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 }}
        />
      )}

      <div
        style={{ transform: sidebarOpen ? "translateX(0)" : undefined }}
        className={`albamed-sidebar-wrapper${sidebarOpen ? " open" : ""}`}
      >
        <AlbamedSidebar newLeadsCount={newLeadsCount} onClose={() => setSidebarOpen(false)} />
      </div>

      <main
        className="albamed-main"
        style={{
          marginLeft: 220,
          minHeight: "100vh",
          background: "#f5f6f8",
          padding: 28,
        }}
      >
        {children}
      </main>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        @media (max-width: 767px) {
          .albamed-hamburger { display: flex !important; align-items: center; justify-content: center; }
          .albamed-main { margin-left: 0 !important; padding-top: 60px !important; }
          .albamed-sidebar-wrapper { display: none; }
          .albamed-sidebar-wrapper.open { display: block; }
        }
      `}</style>
    </ToastProvider>
  )
}
