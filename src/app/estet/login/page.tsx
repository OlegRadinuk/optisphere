"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function EstetLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const r = await fetch("/api/estet/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })
      const data = await r.json() as { error?: string }
      if (r.ok) {
        router.replace("/estet")
      } else {
        setError(data.error ?? "Ошибка входа")
      }
    } catch {
      setError("Нет соединения с сервером")
    } finally {
      setLoading(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    border: error ? "1px solid #fca5a5" : "1px solid #d0e8f5",
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 16,
    outline: "none",
    fontFamily: "inherit",
    color: "#1a1a1a",
    background: "#fff",
    boxSizing: "border-box",
    transition: "border-color 150ms",
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #F4F7FA 0%, #EBF5FF 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: "36px 32px",
          width: "100%",
          maxWidth: 380,
          boxShadow: "0 4px 32px rgba(43,143,213,0.12)",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #2B8FD5 0%, #1A78BF 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 16px rgba(43,143,213,0.3)",
          }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5.5C10.5 4 8.5 3.5 7 4.2 5 5 4 7 4.5 10c.4 2.3 1 3.8 1.4 6 .3 1.6.5 4 1.6 4 1 0 1.1-1.7 1.4-3.2.3-1.5.6-2.6 1.1-2.6.5 0 .8 1.1 1.1 2.6.3 1.5.4 3.2 1.4 3.2 1.1 0 1.3-2.4 1.6-4 .4-2.2 1-3.7 1.4-6 .5-3-.5-5-2.5-5.8-1.5-.7-3.5-.2-5 1.3z"/>
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#1a1a1a", lineHeight: 1.2 }}>Эстетик</div>
            <div style={{ fontSize: 12, color: "#999" }}>Стоматологическая клиника</div>
          </div>
        </div>

        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>Вход</h1>
        <p style={{ fontSize: 14, color: "#999", margin: "0 0 24px" }}>Панель управления ботом</p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, color: "#666", marginBottom: 6, display: "block", fontWeight: 500 }}>
              Логин
            </label>
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError("") }}
              autoComplete="username"
              autoFocus
              required
              style={inputStyle}
              onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#2B8FD5" }}
              onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = error ? "#fca5a5" : "#d0e8f5" }}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, color: "#666", marginBottom: 6, display: "block", fontWeight: 500 }}>
              Пароль
            </label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Пароль"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError("") }}
                autoComplete="current-password"
                required
                style={{ ...inputStyle, paddingRight: 44 }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#2B8FD5" }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = error ? "#fca5a5" : "#d0e8f5" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#bbb", padding: 0, display: "flex",
                }}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: "#fff5f5", border: "1px solid #fca5a5", borderRadius: 8,
              padding: "10px 14px", fontSize: 13, color: "#ef4444",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              background: "linear-gradient(135deg, #2B8FD5 0%, #1A78BF 100%)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.75 : 1,
              fontFamily: "inherit",
              marginTop: 4,
              transition: "opacity 150ms",
              boxShadow: "0 4px 12px rgba(43,143,213,0.3)",
            }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
        </form>
      </div>
    </div>
  )
}
