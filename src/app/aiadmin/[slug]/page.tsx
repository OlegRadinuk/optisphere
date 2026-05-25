"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"

type Lead = {
  id: number
  name: string
  phone: string
  email: string
  message: string
  created_at: string
}

type SessionSummary = {
  session_id: string
  message_count: number
  last_message_at: string
  has_lead: number
}

type ChatMessage = {
  id: number
  session_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

type ClientData = {
  id: number
  slug: string
  name: string
  description: string
  system_prompt: string
  api_key: string
  base_url: string
  model: string
  tg_token: string
  tg_chat_id: string
  widget_color: string
  widget_title: string
  widget_placeholder: string
  rate_limit: number
  active: number
  context_url: string
  quick_replies: string
}

export default function EditClientPage() {
  const { slug } = useParams<{ slug: string }>()
  const router = useRouter()
  const [form, setForm] = useState<ClientData | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [stats, setStats] = useState({ messages: 0, leads: 0, sessions: 0 })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [err, setErr] = useState("")
  const [tab, setTab] = useState<"settings" | "leads" | "dialogs">("settings")
  const [sessions, setSessions] = useState<SessionSummary[]>([])
  const [expandedSession, setExpandedSession] = useState<string | null>(null)
  const [sessionMessages, setSessionMessages] = useState<Record<string, ChatMessage[]>>({})

  useEffect(() => {
    fetch(`/api/admin/clients?slug=${slug}`)
      .then((r) => {
        if (r.status === 401) { router.push("/aiadmin"); return null }
        if (!r.ok) { router.push("/aiadmin"); return null }
        return r.json()
      })
      .then((d) => {
        if (!d) return
        setForm(d.client)
        setStats(d.stats)
        setLeads(d.leads)
      })
  }, [slug, router])

  useEffect(() => {
    if (tab !== "dialogs") return
    fetch(`/api/admin/clients/${slug}/sessions`)
      .then((r) => r.ok ? r.json() : [])
      .then((d: SessionSummary[]) => setSessions(d))
      .catch(() => {})
  }, [tab, slug])

  async function loadSession(sessionId: string) {
    if (expandedSession === sessionId) {
      setExpandedSession(null)
      return
    }
    setExpandedSession(sessionId)
    if (sessionMessages[sessionId]) return
    const r = await fetch(`/api/admin/clients/${slug}/sessions/${encodeURIComponent(sessionId)}`)
    if (r.ok) {
      const msgs: ChatMessage[] = await r.json()
      setSessionMessages((prev) => ({ ...prev, [sessionId]: msgs }))
    }
  }

  function set(field: string, value: string | number) {
    setForm((f) => f ? { ...f, [field]: value } : f)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    if (!form) return
    setSaving(true)
    setErr("")
    const r = await fetch(`/api/admin/clients?slug=${slug}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    setSaving(false)
    if (!r.ok) { setErr(d.error ?? "Ошибка"); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function del() {
    if (!confirm(`Удалить "${form?.name}"? Все данные будут удалены.`)) return
    await fetch(`/api/admin/clients?slug=${slug}`, { method: "DELETE" })
    router.push("/aiadmin")
  }

  if (!form) return <div style={styles.center}>Загрузка…</div>

  const embedCode = `<script src="https://optisphere.tech/widget.js" data-bot="${slug}"></script>`

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/aiadmin" style={styles.back}>← Ассистенты</Link>
        <span style={styles.title}>{form.name}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <span style={{ ...styles.badge, background: form.active ? "#14532d" : "#450a0a", color: form.active ? "#86efac" : "#fca5a5" }}>
            {form.active ? "Активен" : "Выкл"}
          </span>
          <button onClick={del} style={styles.btnDanger}>Удалить</button>
        </div>
      </header>

      {/* Stats bar */}
      <div style={styles.statsBar}>
        {[
          { label: "Сессий", v: stats.sessions },
          { label: "Сообщений", v: stats.messages },
          { label: "Заявок", v: stats.leads },
        ].map((s) => (
          <div key={s.label} style={styles.statItem}>
            <span style={styles.statNum}>{s.v}</span>
            <span style={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button onClick={() => setTab("settings")} style={{ ...styles.tab, ...(tab === "settings" ? styles.tabActive : {}) }}>Настройки</button>
        <button onClick={() => setTab("leads")} style={{ ...styles.tab, ...(tab === "leads" ? styles.tabActive : {}) }}>Заявки ({stats.leads})</button>
        <button onClick={() => setTab("dialogs")} style={{ ...styles.tab, ...(tab === "dialogs" ? styles.tabActive : {}) }}>Диалоги ({stats.sessions})</button>
      </div>

      <main style={styles.main}>
        {tab === "settings" && (
          <form onSubmit={save} style={styles.form}>

            <Section title="Основное">
              <Field label="Название">
                <input style={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} required />
              </Field>
              <Field label="Описание">
                <input style={styles.input} value={form.description} onChange={(e) => set("description", e.target.value)} />
              </Field>
              <Field label="URL контекста (доступность)">
                <input
                  style={styles.input}
                  value={form.context_url}
                  onChange={(e) => set("context_url", e.target.value)}
                  placeholder="https://example.com/context.txt"
                />
              </Field>
              <Field label="Активен">
                <select style={styles.input} value={form.active} onChange={(e) => set("active", Number(e.target.value))}>
                  <option value={1}>Да</option>
                  <option value={0}>Нет</option>
                </select>
              </Field>
            </Section>

            <Section title="Системный промпт">
              <Field label="Инструкция бота">
                <textarea
                  style={{ ...styles.input, height: 320, resize: "vertical" }}
                  value={form.system_prompt}
                  onChange={(e) => set("system_prompt", e.target.value)}
                />
              </Field>
            </Section>

            <Section title="AI провайдер">
              <Field label="API Key">
                <input style={styles.input} value={form.api_key} onChange={(e) => set("api_key", e.target.value)} placeholder="sk-..." />
              </Field>
              <Field label="Base URL">
                <input style={styles.input} value={form.base_url} onChange={(e) => set("base_url", e.target.value)} />
              </Field>
              <Field label="Модель">
                <select style={styles.input} value={form.model} onChange={(e) => set("model", e.target.value)}>
                  <option value="claude-haiku-4-5-20251001">Claude Haiku 4.5 (быстрый)</option>
                  <option value="claude-sonnet-4-6">Claude Sonnet 4.6 (умный)</option>
                  <option value="claude-opus-4-6">Claude Opus 4.6 (максимум)</option>
                  <option value="gpt-4o-mini">GPT-4o mini</option>
                  <option value="gpt-4o">GPT-4o</option>
                </select>
              </Field>
            </Section>

            <Section title="Telegram">
              <Field label="Bot Token">
                <input style={styles.input} value={form.tg_token} onChange={(e) => set("tg_token", e.target.value)} placeholder="1234567890:AAF..." />
              </Field>
              <Field label="Chat ID">
                <input style={styles.input} value={form.tg_chat_id} onChange={(e) => set("tg_chat_id", e.target.value)} />
              </Field>
            </Section>

            <Section title="Виджет">
              <Field label="Заголовок">
                <input style={styles.input} value={form.widget_title} onChange={(e) => set("widget_title", e.target.value)} />
              </Field>
              <Field label="Placeholder">
                <input style={styles.input} value={form.widget_placeholder} onChange={(e) => set("widget_placeholder", e.target.value)} />
              </Field>
              <Field label="Цвет">
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <input type="color" value={form.widget_color} onChange={(e) => set("widget_color", e.target.value)} style={{ width: 48, height: 38, border: "none", borderRadius: 6, cursor: "pointer" }} />
                  <input style={{ ...styles.input, flex: 1 }} value={form.widget_color} onChange={(e) => set("widget_color", e.target.value)} />
                </div>
              </Field>
              <Field label="Rate limit (сообщ/мин)">
                <input type="number" style={styles.input} value={form.rate_limit} onChange={(e) => set("rate_limit", Number(e.target.value))} min={1} max={200} />
              </Field>
              <Field label="Быстрые ответы (JSON)">
                <textarea
                  style={{ ...styles.input, height: 100, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                  value={form.quick_replies}
                  onChange={(e) => set("quick_replies", e.target.value)}
                  placeholder='[{"label":"Записаться","action":"send"},{"label":"Позвонить","action":"tel","href":"tel:+7..."}]'
                />
              </Field>
            </Section>

            <Section title="Код для вставки">
              <code style={styles.code}>{embedCode}</code>
            </Section>

            {err && <div style={styles.err}>{err}</div>}

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button type="submit" disabled={saving} style={styles.btnPrimary}>
                {saving ? "Сохраняем…" : "Сохранить"}
              </button>
              {saved && <span style={{ color: "#86efac", fontSize: 14 }}>✓ Сохранено</span>}
            </div>
          </form>
        )}

        {tab === "leads" && (
          <div style={styles.leadsTable}>
            {leads.length === 0 ? (
              <div style={styles.empty}>Заявок пока нет</div>
            ) : (
              <table style={styles.table}>
                <thead>
                  <tr>
                    {["Дата", "Имя", "Телефон", "Email", "Сообщение"].map((h) => (
                      <th key={h} style={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} style={styles.tr}>
                      <td style={styles.td}>{new Date(l.created_at).toLocaleString("ru-RU")}</td>
                      <td style={styles.td}>{l.name || "—"}</td>
                      <td style={styles.td}>{l.phone || "—"}</td>
                      <td style={styles.td}>{l.email || "—"}</td>
                      <td style={{ ...styles.td, maxWidth: 300 }}>{l.message || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {tab === "dialogs" && (
          <div>
            {sessions.length === 0 ? (
              <div style={styles.empty}>Диалогов пока нет</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {sessions.map((s) => (
                  <div key={s.session_id} style={styles.sessionCard}>
                    <button
                      onClick={() => loadSession(s.session_id)}
                      style={styles.sessionHeader}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                        <span style={s.has_lead ? styles.leadDot : styles.noLeadDot} title={s.has_lead ? "Есть заявка" : "Без заявки"} />
                        <span style={styles.sessionDate}>
                          {new Date(s.last_message_at).toLocaleString("ru-RU")}
                        </span>
                        <span style={styles.sessionMsgCount}>{s.message_count} сообщ.</span>
                        {s.has_lead ? <span style={styles.leadBadge}>Заявка</span> : null}
                      </div>
                      <span style={{ color: "#64748b", fontSize: 12 }}>
                        {expandedSession === s.session_id ? "▲" : "▼"}
                      </span>
                    </button>

                    {expandedSession === s.session_id && (
                      <div style={styles.messagesThread}>
                        {!sessionMessages[s.session_id] ? (
                          <div style={{ color: "#64748b", fontSize: 13, padding: 12 }}>Загрузка…</div>
                        ) : sessionMessages[s.session_id].length === 0 ? (
                          <div style={{ color: "#64748b", fontSize: 13, padding: 12 }}>Нет сообщений</div>
                        ) : (
                          sessionMessages[s.session_id].map((m) => (
                            <div
                              key={m.id}
                              style={{
                                ...styles.msgBubble,
                                alignSelf: m.role === "user" ? "flex-start" : "flex-end",
                                background: m.role === "user" ? "#1e293b" : "#1e3a5f",
                                borderColor: m.role === "user" ? "#334155" : "#1d4ed8",
                              }}
                            >
                              <div style={styles.msgRole}>{m.role === "user" ? "Гость" : "Ассистент"}</div>
                              <div style={styles.msgContent}>{m.content}</div>
                              <div style={styles.msgTime}>
                                {new Date(m.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={sectionStyle}>
      <div style={sectionTitle}>{title}</div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  )
}

const sectionStyle: React.CSSProperties = { background: "#1e293b", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16, border: "1px solid #334155" }
const sectionTitle: React.CSSProperties = { fontWeight: 700, fontSize: 15, color: "#38bdf8", marginBottom: 4 }
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, color: "#94a3b8", fontWeight: 500 }

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0f172a" },
  center: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0f172a", color: "#94a3b8" },
  header: { display: "flex", alignItems: "center", gap: 16, padding: "14px 32px", borderBottom: "1px solid #1e293b", background: "#0f172a" },
  back: { color: "#64748b", textDecoration: "none", fontSize: 14, whiteSpace: "nowrap" as const },
  title: { fontSize: 18, fontWeight: 700, color: "#f1f5f9", flex: 1 },
  badge: { fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, whiteSpace: "nowrap" as const },
  btnDanger: { padding: "6px 14px", borderRadius: 6, border: "1px solid #7f1d1d", background: "transparent", color: "#f87171", cursor: "pointer", fontSize: 13 },
  statsBar: { display: "flex", gap: 0, borderBottom: "1px solid #1e293b" },
  statItem: { flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "14px 0", borderRight: "1px solid #1e293b" },
  statNum: { fontSize: 24, fontWeight: 700, color: "#38bdf8" },
  statLabel: { fontSize: 11, color: "#64748b", textTransform: "uppercase" as const },
  tabs: { display: "flex", borderBottom: "1px solid #1e293b", padding: "0 32px" },
  tab: { padding: "12px 20px", border: "none", background: "transparent", color: "#64748b", cursor: "pointer", fontSize: 14, borderBottom: "2px solid transparent", marginBottom: -1 },
  tabActive: { color: "#38bdf8", borderBottomColor: "#38bdf8" },
  main: { maxWidth: 740, margin: "0 auto", padding: "28px 24px" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const },
  btnPrimary: { padding: "10px 24px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  err: { color: "#f87171", fontSize: 14, background: "#450a0a", padding: "10px 14px", borderRadius: 8 },
  code: { display: "block", background: "#0f172a", padding: "12px 16px", borderRadius: 8, fontSize: 13, color: "#7dd3fc", overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-all" },
  leadsTable: { overflowX: "auto" as const },
  table: { width: "100%", borderCollapse: "collapse" as const },
  th: { padding: "10px 14px", background: "#1e293b", color: "#64748b", fontSize: 12, textAlign: "left" as const, fontWeight: 600, textTransform: "uppercase" as const, borderBottom: "1px solid #334155" },
  tr: { borderBottom: "1px solid #1e293b" },
  td: { padding: "12px 14px", fontSize: 13, color: "#cbd5e1", verticalAlign: "top" as const },
  empty: { color: "#64748b", padding: "40px 0", textAlign: "center" as const },
  sessionCard: { border: "1px solid #334155", borderRadius: 10, overflow: "hidden" as const, background: "#0f172a" },
  sessionHeader: { width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "12px 16px", background: "transparent", border: "none", cursor: "pointer", color: "#e2e8f0", textAlign: "left" as const },
  sessionDate: { fontSize: 13, color: "#94a3b8" },
  sessionMsgCount: { fontSize: 12, color: "#64748b", marginLeft: 4 },
  leadDot: { width: 8, height: 8, borderRadius: "50%", background: "#22c55e", flexShrink: 0 },
  noLeadDot: { width: 8, height: 8, borderRadius: "50%", background: "#475569", flexShrink: 0 },
  leadBadge: { fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 12, background: "#14532d", color: "#86efac" },
  messagesThread: { display: "flex", flexDirection: "column" as const, gap: 8, padding: "12px 16px", borderTop: "1px solid #1e293b", maxHeight: 500, overflowY: "auto" as const },
  msgBubble: { maxWidth: "80%", padding: "10px 14px", borderRadius: 10, border: "1px solid", display: "flex", flexDirection: "column" as const, gap: 4 },
  msgRole: { fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase" as const },
  msgContent: { fontSize: 13, color: "#e2e8f0", whiteSpace: "pre-wrap" as const, wordBreak: "break-word" as const },
  msgTime: { fontSize: 11, color: "#475569", alignSelf: "flex-end" as const },
}
