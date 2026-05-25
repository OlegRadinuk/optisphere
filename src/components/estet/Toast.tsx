"use client"

import { createContext, useContext, useState, useCallback, useRef } from "react"

interface ToastItem {
  id: number
  type: "success" | "error"
  message: string
}

interface ToastContextValue {
  showToast: (type: "success" | "error", message: string) => void
}

const ToastContext = createContext<ToastContextValue>({ showToast: () => undefined })

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const counterRef = useRef(0)

  const showToast = useCallback((type: "success" | "error", message: string) => {
    const id = ++counterRef.current
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: "calc(24px + env(safe-area-inset-bottom))",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
          width: "max-content",
          maxWidth: "calc(100vw - 32px)",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: "#fff",
              border: `1px solid ${t.type === "success" ? "#22c55e" : "#ef4444"}`,
              borderLeft: `4px solid ${t.type === "success" ? "#22c55e" : "#ef4444"}`,
              color: t.type === "success" ? "#15803d" : "#dc2626",
              borderRadius: 10,
              padding: "11px 18px",
              fontSize: 13,
              fontWeight: 500,
              pointerEvents: "auto",
              boxShadow: "0 6px 24px rgba(0,0,0,0.12)",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              {t.type === "success"
                ? <><circle cx="12" cy="12" r="10"/><path d="M9 12l2 2 4-4"/></>
                : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></>}
            </svg>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
