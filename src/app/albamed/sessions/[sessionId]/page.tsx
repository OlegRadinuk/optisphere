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
  createdAt?: string
  messageCount?: number
}

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })
}

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function SessionDetailPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  const { sessionId } = use(params)
  const [data, setData] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [leadStatus, setLeadStatus] = useState<LeadStatus | null>(null)

  useEffect(() => {
    fetch(`/api/albamed/sessions/${sessionId}`)
      .then((r) => {
        if (!r.ok) throw new Error("Ошибка загрузки диалога")
        return r.json()
      })
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
      {/* Back link */}
      <Link
        href="/albamed/sessions"
        style={{
          color: "#94a3b8",
          fontSize: 13,
          textDecoration: "none",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          marginBottom: 16,
          transition: "color 150ms",
        }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = "#e2e8f0"
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLElement).style.color = "#94a3b8"
        }}
      >
        ← Все диалоги
      </Link>

      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 16px" }}>
        Диалог
      </h1>

      {loading ? (
        <>
          {/* Skeleton meta card */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 16,
              display: "flex",
              gap: 24,
            }}
          >
            {[120, 80, 90].map((w, i) => (
              <div
                key={i}
                style={{
                  width: w,
                  height: 16,
                  background: "#334155",
                  borderRadius: 4,
                  animation: "pulse 1.5s ease infinite",
                }}
              />
            ))}
          </div>
          {/* Skeleton chat */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: 16,
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {[{ align: "flex-start", w: 220 }, { align: "flex-end", w: 180 }, { align: "flex-start", w: 260 }].map(
              (b, i) => (
                <div
                  key={i}
                  style={{ alignSelf: b.align as "flex-start" | "flex-end", maxWidth: "70%" }}
                >
                  <div
                    style={{
                      width: b.w,
                      height: 48,
                      background: "#334155",
                      borderRadius: 12,
                      animation: "pulse 1.5s ease infinite",
                    }}
                  />
                </div>
              )
            )}
          </div>
        </>
      ) : error ? (
        <div style={{ color: "#ef4444", padding: 20 }}>{error}</div>
      ) : (
        <>
          {/* Session metadata */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: "16px 20px",
              marginBottom: 16,
              display: "flex",
              gap: 24,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Дата: </span>
              <span style={{ fontSize: 13, color: "#e2e8f0" }}>
                {firstMessage ? formatDateTime(firstMessage) : "—"}
              </span>
            </div>
            <div>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Сообщений: </span>
              <span style={{ fontSize: 13, color: "#e2e8f0" }}>{messageCount}</span>
            </div>
            <div>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Лид: </span>
              <span
                style={{
                  fontSize: 13,
                  color: data?.lead ? "#22c55e" : "#94a3b8",
                }}
              >
                {data?.lead ? "Оставлен" : "Не оставлен"}
              </span>
            </div>
          </div>

          {/* Lead card */}
          {data?.lead && (
            <div
              style={{
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: 8,
                padding: "16px 20px",
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#e2e8f0",
                  marginBottom: 12,
                  paddingBottom: 10,
                  borderBottom: "1px solid #334155",
                }}
              >
                Лид из этого диалога
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "auto 1fr",
                  gap: "8px 16px",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Имя:</span>
                <span style={{ color: "#e2e8f0", fontSize: 14 }}>{data.lead.name || "—"}</span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Телефон:</span>
                <span style={{ color: "#e2e8f0", fontSize: 14 }}>{data.lead.phone}</span>
                <span style={{ color: "#94a3b8", fontSize: 13 }}>Статус:</span>
                {leadStatus !== null && (
                  <StatusSelect
                    leadId={data.lead.id}
                    current={leadStatus}
                    onChange={(s) => setLeadStatus(s)}
                  />
                )}
              </div>
            </div>
          )}

          {/* Chat */}
          <div
            style={{
              background: "#1e293b",
              border: "1px solid #334155",
              borderRadius: 8,
              padding: 16,
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: "#94a3b8",
                marginBottom: 12,
              }}
            >
              Переписка
            </div>

            {data?.messages.length === 0 ? (
              <div
                style={{
                  color: "#94a3b8",
                  textAlign: "center",
                  padding: "40px 0",
                }}
              >
                Сообщений нет
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {data?.messages.map((msg, idx) => {
                  const isUser = msg.role === "user"
                  return (
                    <div
                      key={idx}
                      style={{
                        alignSelf: isUser ? "flex-end" : "flex-start",
                        maxWidth: "70%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          background: isUser ? "#1d3461" : "#293548",
                          border: isUser ? "1px solid #3b82f6" : "1px solid #334155",
                          borderRadius: isUser ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                          padding: "10px 14px",
                          color: "#e2e8f0",
                          fontSize: 14,
                          lineHeight: 1.5,
                          wordBreak: "break-word",
                        }}
                      >
                        {msg.content}
                      </div>
                      <span
                        style={{
                          fontSize: 11,
                          color: "#94a3b8",
                          marginTop: 4,
                          textAlign: isUser ? "right" : "left",
                        }}
                      >
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
