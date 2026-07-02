"use client"

import { useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import type { Lead } from "./mock-data"
import LeadStatusBadge from "./LeadStatusBadge"

interface DialogDrawerProps {
  lead: Lead | null
  onClose: () => void
}

function Avatar({ name }: { name: string }) {
  const initial = name.charAt(0)
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
      <span
        style={{
          fontFamily: "var(--op-font-display)",
          fontSize: 14,
          fontWeight: 700,
          color: "var(--op-accent)",
        }}
      >
        {initial}
      </span>
    </div>
  )
}

export default function DialogDrawer({ lead, onClose }: DialogDrawerProps) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    if (lead) window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [lead, onClose])

  return (
    <AnimatePresence>
      {lead && (
        <>
          {/* Overlay */}
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              backdropFilter: "blur(4px)",
              WebkitBackdropFilter: "blur(4px)",
              zIndex: 200,
            }}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            key="drawer"
            role="dialog"
            aria-modal="true"
            aria-label={`Диалог — ${lead.name}`}
            className="saas-dialog-drawer"
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            style={{
              position: "fixed",
              right: 0,
              top: 0,
              bottom: 0,
              width: 420,
              maxWidth: "100vw",
              background: "var(--op-surface)",
              zIndex: 201,
              display: "flex",
              flexDirection: "column",
              boxShadow: "-12px 0 48px rgba(0,0,0,0.5)",
            }}
          >
            {/* Header */}
            <div
              style={{
                height: 60,
                padding: "0 20px",
                display: "flex",
                alignItems: "center",
                gap: 12,
                borderBottom: "1px solid var(--op-border)",
                flexShrink: 0,
              }}
            >
              <Avatar name={lead.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--op-font-display)",
                    fontSize: 15,
                    fontWeight: 700,
                    color: "var(--op-text)",
                  }}
                >
                  {lead.name}
                </div>
                <div
                  style={{
                    fontFamily: "var(--op-font-body)",
                    fontSize: 12,
                    color: "var(--op-text-muted)",
                  }}
                >
                  {lead.dialog.length} сообщений · {lead.timeAgo}
                </div>
              </div>
              <button
                onClick={onClose}
                aria-label="Закрыть"
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid var(--op-border)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--op-text-secondary)",
                  flexShrink: 0,
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <line x1="2" y1="2" x2="10" y2="10" />
                  <line x1="10" y1="2" x2="2" y2="10" />
                </svg>
              </button>
            </div>

            {/* Status row */}
            <div
              style={{
                padding: "12px 20px",
                borderBottom: "1px solid var(--op-border)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                flexShrink: 0,
              }}
            >
              <LeadStatusBadge status={lead.status} />
              <span
                style={{
                  fontFamily: "var(--op-font-body)",
                  fontSize: 12,
                  color: "var(--op-text-muted)",
                }}
              >
                {lead.contact}
              </span>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
                scrollbarWidth: "thin",
              }}
            >
              {lead.dialog.map((msg, i) => {
                const isUser = msg.role === "user"
                return (
                  <div key={i}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: isUser ? "row-reverse" : "row",
                        alignItems: "flex-end",
                        gap: 8,
                      }}
                    >
                      <div
                        style={{
                          maxWidth: "80%",
                          padding: "10px 14px",
                          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                          background: isUser ? "rgba(232,32,32,0.18)" : "rgba(255,255,255,0.04)",
                          border: isUser
                            ? "1px solid rgba(232,32,32,0.35)"
                            : "1px solid rgba(255,255,255,0.08)",
                          color: "var(--op-text)",
                          fontFamily: "var(--op-font-body)",
                          fontSize: "0.875rem",
                          lineHeight: 1.6,
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                    <div
                      style={{
                        textAlign: isUser ? "right" : "left",
                        fontFamily: "var(--op-font-body)",
                        fontSize: 11,
                        color: "var(--op-text-muted)",
                        marginTop: 3,
                      }}
                    >
                      {msg.time}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div
              style={{
                borderTop: "1px solid var(--op-border)",
                padding: "16px 20px",
                display: "flex",
                gap: 10,
                flexShrink: 0,
                paddingBottom: "calc(16px + env(safe-area-inset-bottom))",
              }}
            >
              <button
                onClick={onClose}
                className="btn btn-ghost"
                style={{ flex: 1, justifyContent: "center", height: 40, fontSize: 14 }}
              >
                Закрыть
              </button>
              {lead.contact.startsWith("@") && (
                <a
                  href={`https://t.me/${lead.contact.slice(1)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ flex: 1, justifyContent: "center", height: 40, fontSize: 14 }}
                >
                  Написать в Telegram
                </a>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// Add mobile bottom sheet styles
// (done via CSS class in parent)
