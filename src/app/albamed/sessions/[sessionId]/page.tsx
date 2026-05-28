"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import { StatusSelect } from "@/components/albamed/StatusSelect"

type LeadStatus = "new" | "working" | "closed"

interface Message {
  role: "user" | "assistant"
  content: string
  created_at: string
}

interface LeadInfo {
  id: number
  name: string
  phone: string
  status: LeadStatus
}

interface SessionDetail {
  messages: Message[]
  lead: LeadInfo | null
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

export default function SessionDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
  const { sessionId } = use(params)
  const [data, setData] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leadStatus, setLeadStatus] = useState<LeadStatus | null>(null)

  useEffect(() => {
    fetch(`/api/albamed/sessions/${sessionId}`)
      .then((r) => { if (!r.ok) throw new Error("Ошибка загрузки диалога"); return r.json() })
      .then((d: SessionDetail) => {
        setData(d)
        if (d.lead) setLeadStatus(d.lead.status)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Ошибка загрузки диалога")
        setLoading(false)
      })
  }, [sessionId])

  const firstMessage = data?.messages[0]?.created_at ?? null
  const messageCount = data?.messages.length ?? 0

  return (
    <div>
      <Link
        href="/albamed/sessions"
        style={{ color: "#f47920", fontSize: 13, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4, marginBottom: 16 }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "underline" }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.textDecoration = "none" }}
      >
        ← Все диалоги
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 16px" }}>Диалог</h1>

      {loading ? (
        <>
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "16px 20px", marginBottom: 16, display: "flex", gap: 24 }}>
            {[120, 80, 90].map((w, i) => (
              <div key={i} style={{ width: w, height: 16, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
            ))}
          </div>
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
            {[{ align: "flex-start", w: 220 }, { align: "flex-end", w: 180 }, { align: "flex-start", w: 260 }].map((b, i) => (
              <div key={i} style={{ alignSelf: b.align as "flex-start" | "flex-end", maxWidth: "70%" }}>
                <div style={{ width: b.w, height: 48, background: "#f0f0f0", borderRadius: 12, animation: "pulse 1.5s ease infinite" }} />
              </div>
            ))}
          </div>
        </>
      ) : error ? (
        <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
      ) : (
        <>
          {/* Meta */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "14px 20px", marginBottom: 16, display: "flex", gap: 24, alignItems: "center", flexWrap: "wrap", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div>
              <span style={{ fontSize: 12, color: "#999" }}>Дата: </span>
              <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{firstMessage ? formatDateTime(firstMessage) : "—"}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#999" }}>Сообщений: </span>
              <span style={{ fontSize: 13, color: "#1a1a1a", fontWeight: 500 }}>{messageCount}</span>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#999" }}>Клиент: </span>
              <span style={{ fontSize: 13, color: data?.lead ? "#16a34a" : "#bbb", fontWeight: 500 }}>
                {data?.lead ? "Оставлен" : "Не оставлен"}
              </span>
            </div>
          </div>

          {/* Lead card */}
          {data?.lead && (
            <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: "16px 20px", marginBottom: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#f47920", marginBottom: 12, paddingBottom: 10, borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Клиент из этого диалога
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 16px", alignItems: "center" }}>
                <span style={{ color: "#999", fontSize: 13 }}>Имя:</span>
                <span style={{ color: "#1a1a1a", fontSize: 14, fontWeight: 500 }}>{data.lead.name || "—"}</span>
                <span style={{ color: "#999", fontSize: 13 }}>Телефон:</span>
                <span style={{ color: "#1a1a1a", fontSize: 14, fontWeight: 500 }}>{data.lead.phone}</span>
                <span style={{ color: "#999", fontSize: 13 }}>Статус:</span>
                {leadStatus !== null && (
                  <StatusSelect leadId={data.lead.id} current={leadStatus} onChange={(s) => setLeadStatus(s)} />
                )}
              </div>
            </div>
          )}

          {/* Chat */}
          <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#555", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              Переписка
            </div>

            {data?.messages.length === 0 ? (
              <div style={{ color: "#bbb", textAlign: "center", padding: "40px 0" }}>Сообщений нет</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data?.messages.map((msg, idx) => {
                  const isBot = msg.role !== "user"
                  return (
                    <div key={idx} style={{ alignSelf: isBot ? "flex-end" : "flex-start", maxWidth: "70%", display: "flex", flexDirection: "column" }}>
                      <div style={{
                        background: isBot ? "#f47920" : "#f5f6f8",
                        border: isBot ? "none" : "1px solid #e8e8e8",
                        borderRadius: isBot ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                        padding: "10px 14px",
                        color: isBot ? "#fff" : "#1a1a1a",
                        fontSize: 14,
                        lineHeight: 1.5,
                        wordBreak: "break-word",
                      }}>
                        {msg.content}
                      </div>
                      <span style={{ fontSize: 11, color: "#bbb", marginTop: 4, textAlign: isBot ? "right" : "left" }}>
                        {formatTime(msg.created_at)}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
