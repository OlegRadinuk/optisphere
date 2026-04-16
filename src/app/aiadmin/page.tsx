"use client"

import { useState, useEffect } from "react"
import Link from "next/link"

type ClientWithStats = {
  id: number
  slug: string
  name: string
  description: string
  active: number
  widget_color: string
  created_at: string
  stats: { messages: number; leads: number; sessions: number }
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [loginErr, setLoginErr] = useState("")
  const [clients, setClients] = useState<ClientWithStats[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch("/api/admin/clients")
      .then((r) => {
        if (r.status === 401) { setAuthed(false); return null }
        setAuthed(true)
        return r.json()
      })
      .then((d) => d && setClients(d))
  }, [])

  async function login() {
    setLoginErr("")
    const r = await fetch("/api/admin/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    })
    if (r.ok) {
      setAuthed(true)
      loadClients()
    } else {
      setLoginErr("Неверный пароль")
    }
  }

  async function logout() {
    await fetch("/api/admin/auth", { method: "DELETE" })
    setAuthed(false)
    setClients([])
  }

  async function loadClients() {
    setLoading(true)
    const r = await fetch("/api/admin/clients")
    const d = await r.json()
    setClients(d)
    setLoading(false)
  }

  async function toggleActive(slug: string, current: number) {
    await fetch(`/api/admin/clients?slug=${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: current ? 0 : 1 }),
    })
    loadClients()
  }

  async function deleteClient(slug: string, name: string) {
    if (!confirm(`Удалить бота "${name}"? Это удалит все сообщения и заявки.`)) return
    await fetch(`/api/admin/clients?slug=${slug}`, { method: "DELETE" })
    loadClients()
  }

  // Loading state
  if (authed === null) {
    return <div style={styles.center}>Загрузка…</div>
  }

  // Login screen
  if (!authed) {
    return (
      <div style={styles.center}>
        <div style={styles.loginBox}>
          <div style={styles.logo}>⬡ Optisphere Admin</div>
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && login()}
            style={styles.input}
            autoFocus
          />
          {loginErr && <div style={styles.err}>{loginErr}</div>}
          <button onClick={login} style={styles.btn}>Войти</button>
        </div>
      </div>
    )
  }

  // Dashboard
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <span style={styles.logo}>⬡ Optisphere Admin</span>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link href="/aiadmin/new" style={styles.btnPrimary}>+ Новый бот</Link>
          <button onClick={logout} style={styles.btnGhost}>Выйти</button>
        </div>
      </header>

      <main style={styles.main}>
        <h1 style={styles.h1}>AI Ассистенты</h1>

        {loading && <div style={{ color: "#94a3b8" }}>Загрузка…</div>}

        {clients.length === 0 && !loading && (
          <div style={styles.empty}>
            <p>Ботов пока нет.</p>
            <Link href="/aiadmin/new" style={styles.btnPrimary}>Создать первого</Link>
          </div>
        )}

        <div style={styles.grid}>
          {clients.map((c) => (
            <div key={c.slug} style={styles.card}>
              {/* Color indicator */}
              <div style={{ ...styles.colorBar, background: c.widget_color }} />

              <div style={styles.cardBody}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={styles.cardName}>{c.name}</div>
                    <div style={styles.cardSlug}>/{c.slug}</div>
                    {c.description && <div style={styles.cardDesc}>{c.description}</div>}
                  </div>
                  <span style={{ ...styles.badge, background: c.active ? "#14532d" : "#450a0a", color: c.active ? "#86efac" : "#fca5a5" }}>
                    {c.active ? "Активен" : "Выкл"}
                  </span>
                </div>

                {/* Stats */}
                <div style={styles.stats}>
                  <div style={styles.stat}><span style={styles.statNum}>{c.stats.sessions}</span><span style={styles.statLabel}>сессий</span></div>
                  <div style={styles.stat}><span style={styles.statNum}>{c.stats.messages}</span><span style={styles.statLabel}>сообщ</span></div>
                  <div style={styles.stat}><span style={styles.statNum}>{c.stats.leads}</span><span style={styles.statLabel}>заявок</span></div>
                </div>

                {/* Embed snippet */}
                <details style={styles.details}>
                  <summary style={styles.summary}>Код для вставки</summary>
                  <code style={styles.code}>
                    {`<script src="https://optisphere.tech/widget.js" data-bot="${c.slug}"></script>`}
                  </code>
                </details>

                {/* Actions */}
                <div style={styles.actions}>
                  <Link href={`/aiadmin/${c.slug}`} style={styles.btnSm}>Настройки</Link>
                  <button
                    onClick={() => toggleActive(c.slug, c.active)}
                    style={{ ...styles.btnSm, color: c.active ? "#fca5a5" : "#86efac" }}
                  >
                    {c.active ? "Выключить" : "Включить"}
                  </button>
                  <button
                    onClick={() => deleteClient(c.slug, c.name)}
                    style={{ ...styles.btnSm, color: "#f87171" }}
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0f172a" },
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a" },
  loginBox: { background: "#1e293b", borderRadius: 12, padding: 32, width: 320, display: "flex", flexDirection: "column", gap: 16 },
  logo: { fontSize: 20, fontWeight: 700, color: "#38bdf8" },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 15, outline: "none" },
  btn: { padding: "10px 20px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  btnPrimary: { padding: "8px 18px", borderRadius: 8, background: "#2563eb", color: "#fff", fontWeight: 600, textDecoration: "none", fontSize: 14 },
  btnGhost: { padding: "8px 18px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 14 },
  btnSm: { padding: "5px 12px", borderRadius: 6, border: "1px solid #334155", background: "transparent", color: "#94a3b8", cursor: "pointer", fontSize: 13, textDecoration: "none" },
  err: { color: "#f87171", fontSize: 14 },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 32px", borderBottom: "1px solid #1e293b", position: "sticky", top: 0, background: "#0f172a", zIndex: 10 },
  main: { maxWidth: 1100, margin: "0 auto", padding: "32px 24px" },
  h1: { fontSize: 26, fontWeight: 700, marginBottom: 24, color: "#f1f5f9" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: 20 },
  card: { background: "#1e293b", borderRadius: 12, overflow: "hidden", border: "1px solid #334155" },
  colorBar: { height: 4 },
  cardBody: { padding: 20, display: "flex", flexDirection: "column", gap: 14 },
  cardName: { fontSize: 18, fontWeight: 700, color: "#f1f5f9" },
  cardSlug: { fontSize: 13, color: "#64748b", marginTop: 2 },
  cardDesc: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  badge: { fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20 },
  stats: { display: "flex", gap: 20 },
  stat: { display: "flex", flexDirection: "column", alignItems: "center" },
  statNum: { fontSize: 22, fontWeight: 700, color: "#38bdf8" },
  statLabel: { fontSize: 11, color: "#64748b", textTransform: "uppercase" },
  details: { cursor: "pointer" },
  summary: { fontSize: 13, color: "#64748b", userSelect: "none" },
  code: { display: "block", background: "#0f172a", padding: "10px 12px", borderRadius: 6, fontSize: 12, color: "#7dd3fc", marginTop: 8, overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" },
  actions: { display: "flex", gap: 8, flexWrap: "wrap" },
  empty: { textAlign: "center", padding: "60px 0", color: "#64748b", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 },
}
