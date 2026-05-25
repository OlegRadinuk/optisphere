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
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              background: t.type === "success" ? "#0f2a1a" : "#2a0f0f",
              border: `1px solid ${t.type === "success" ? "#22c55e" : "#ef4444"}`,
              color: t.type === "success" ? "#22c55e" : "#ef4444",
              borderRadius: 8,
              padding: "10px 16px",
              fontSize: 13,
              pointerEvents: "auto",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
