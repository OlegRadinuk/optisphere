"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { WORKING_PROXY } from "@/lib/ai-config"

const DEFAULT_FORM = {
  slug: "",
  name: "",
  description: "",
  system_prompt: "",
  api_key: "",
  base_url: WORKING_PROXY,
  model: "claude-haiku-4-5-20251001",
  tg_token: "",
  tg_chat_id: "",
  widget_color: "#2563eb",
  widget_title: "Ассистент",
  widget_placeholder: "Напишите вопрос…",
  quick_replies: "",
  greeting: "",
  rate_limit: 30,
  active: 1,
}

export default function NewClientPage() {
  const router = useRouter()
  const [form, setForm] = useState(DEFAULT_FORM)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState("")

  function set(field: string, value: string | number) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErr("")
    const r = await fetch("/api/admin/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })
    const d = await r.json()
    if (!r.ok) {
      setErr(d.error ?? "Ошибка")
      setSaving(false)
      return
    }
    router.push("/aiadmin")
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <Link href="/aiadmin" style={styles.back}>← Назад</Link>
        <span style={styles.logo}>Новый ассистент</span>
      </header>

      <main style={styles.main}>
        <form onSubmit={submit} style={styles.form}>

          <Section title="Основное">
            <Field label="Slug (URL-имя)" hint="только a-z 0-9 дефис, напр. albamed">
              <input style={styles.input} value={form.slug} onChange={(e) => set("slug", e.target.value.toLowerCase())} required placeholder="albamed" />
            </Field>
            <Field label="Название">
              <input style={styles.input} value={form.name} onChange={(e) => set("name", e.target.value)} required placeholder="Клиника Альба Мед" />
            </Field>
            <Field label="Описание (внутреннее)">
              <input style={styles.input} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Медклиника, Симферополь" />
            </Field>
          </Section>

          <Section title="Системный промпт">
            <Field label="Инструкция бота">
              <textarea
                style={{ ...styles.input, height: 280, resize: "vertical" }}
                value={form.system_prompt}
                onChange={(e) => set("system_prompt", e.target.value)}
                placeholder="Ты — AI-ассистент клиники. Отвечаешь вежливо, помогаешь записаться к врачу…"
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

          <Section title="Telegram уведомления">
            <Field label="Bot Token" hint="от @BotFather">
              <input style={styles.input} value={form.tg_token} onChange={(e) => set("tg_token", e.target.value)} placeholder="1234567890:AAF..." />
            </Field>
            <Field label="Chat ID" hint="куда слать заявки">
              <input style={styles.input} value={form.tg_chat_id} onChange={(e) => set("tg_chat_id", e.target.value)} placeholder="-100123456789" />
            </Field>
          </Section>

          <Section title="Виджет">
            <Field label="Заголовок чата">
              <input style={styles.input} value={form.widget_title} onChange={(e) => set("widget_title", e.target.value)} />
            </Field>
            <Field label="Placeholder">
              <input style={styles.input} value={form.widget_placeholder} onChange={(e) => set("widget_placeholder", e.target.value)} />
            </Field>
            <Field label="Приветствие (greeting)" hint="первое сообщение виджета клиенту">
              <textarea
                style={{ ...styles.input, height: 80, resize: "vertical" }}
                value={form.greeting}
                onChange={(e) => set("greeting", e.target.value)}
                placeholder="Привет! Чем могу помочь? Расскажите о своём вопросе."
                maxLength={1000}
              />
            </Field>
            <Field label="Цвет">
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <input type="color" value={form.widget_color} onChange={(e) => set("widget_color", e.target.value)} style={{ width: 48, height: 38, border: "none", borderRadius: 6, cursor: "pointer", background: "none" }} />
                <input style={{ ...styles.input, flex: 1 }} value={form.widget_color} onChange={(e) => set("widget_color", e.target.value)} />
              </div>
            </Field>
            <Field label="Лимит сообщений в минуту">
              <input type="number" style={styles.input} value={form.rate_limit} onChange={(e) => set("rate_limit", Number(e.target.value))} min={1} max={200} />
            </Field>
            <Field label="Быстрые ответы (JSON)" hint="оставь пустым чтобы скрыть кнопки">
              <textarea
                style={{ ...styles.input, height: 80, resize: "vertical", fontFamily: "monospace", fontSize: 12 }}
                value={form.quick_replies}
                onChange={(e) => set("quick_replies", e.target.value)}
                placeholder='[{"label":"Записаться","action":"send"},{"label":"Позвонить","action":"tel","href":"tel:+7..."}]'
              />
            </Field>
          </Section>

          {err && <div style={styles.err}>{err}</div>}

          <div style={{ display: "flex", gap: 12 }}>
            <button type="submit" disabled={saving} style={styles.btnPrimary}>
              {saving ? "Создаём…" : "Создать ассистента"}
            </button>
            <Link href="/aiadmin" style={styles.btnGhost}>Отмена</Link>
          </div>
        </form>
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

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>{label}{hint && <span style={hintStyle}> — {hint}</span>}</label>
      {children}
    </div>
  )
}

const sectionStyle: React.CSSProperties = { background: "#1e293b", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 16, border: "1px solid #334155" }
const sectionTitle: React.CSSProperties = { fontWeight: 700, fontSize: 15, color: "#38bdf8", marginBottom: 4 }
const fieldStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 }
const labelStyle: React.CSSProperties = { fontSize: 13, color: "#94a3b8", fontWeight: 500 }
const hintStyle: React.CSSProperties = { color: "#64748b", fontWeight: 400 }

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", background: "#0f172a" },
  header: { display: "flex", alignItems: "center", gap: 16, padding: "16px 32px", borderBottom: "1px solid #1e293b", background: "#0f172a" },
  back: { color: "#64748b", textDecoration: "none", fontSize: 14 },
  logo: { fontSize: 18, fontWeight: 700, color: "#f1f5f9" },
  main: { maxWidth: 740, margin: "0 auto", padding: "32px 24px" },
  form: { display: "flex", flexDirection: "column", gap: 20 },
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#e2e8f0", fontSize: 14, outline: "none", width: "100%", boxSizing: "border-box" as const },
  btnPrimary: { padding: "10px 24px", borderRadius: 8, border: "none", background: "#2563eb", color: "#fff", fontWeight: 600, cursor: "pointer", fontSize: 15 },
  btnGhost: { padding: "10px 20px", borderRadius: 8, border: "1px solid #334155", background: "transparent", color: "#94a3b8", textDecoration: "none", fontSize: 15, display: "flex", alignItems: "center" },
  err: { color: "#f87171", fontSize: 14, background: "#450a0a", padding: "10px 14px", borderRadius: 8 },
}
