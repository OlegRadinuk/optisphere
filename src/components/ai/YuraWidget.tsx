"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { useTranslations } from "next-intl"
import { useHeroChat } from "@/components/ai/HeroChatContext"

// ── Types ──────────────────────────────────────────────────────────────────────

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

interface LeadFormData {
  name: string
  phone: string
  time: string
}

const FORM_MARKER = "[SAVE_LEAD]"

// ── Lead form bubble ───────────────────────────────────────────────────────────

function LeadFormBubble({
  onSubmit,
  isSubmitting,
  submitted,
  consentText,
  consentLinkText,
  submittedText,
}: {
  onSubmit: (data: LeadFormData) => void
  isSubmitting: boolean
  submitted: boolean
  consentText: string
  consentLinkText: string
  submittedText: string
}) {
  const [data, setData] = useState<LeadFormData>({ name: "", phone: "", time: "" })
  const [consentChecked, setConsentChecked] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.name.trim() || !data.phone.trim() || !consentChecked) return
    onSubmit(data)
  }

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          margin: "8px 0 8px 12px",
          padding: "14px 16px",
          borderRadius: "16px 16px 16px 4px",
          background: "linear-gradient(135deg, rgba(16,185,129,0.15), rgba(6,182,212,0.1))",
          border: "1px solid rgba(16,185,129,0.3)",
          color: "#6ee7b7",
          fontSize: 14,
          fontWeight: 500,
        }}
      >
        {submittedText}
      </motion.div>
    )
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "9px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.06)",
    color: "#F0F0FF",
    fontSize: 13,
    outline: "none",
    marginBottom: 8,
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        margin: "8px 0 8px 12px",
        padding: "16px",
        borderRadius: "16px 16px 16px 4px",
        background: "rgba(99,102,241,0.08)",
        border: "1px solid rgba(99,102,241,0.2)",
      }}
    >
      <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12, fontWeight: 500 }}>
        Оставьте контакт — Олег свяжется лично:
      </p>
      <form onSubmit={handleSubmit}>
        <input
          style={inputStyle}
          placeholder="Ваше имя *"
          value={data.name}
          onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
          required
        />
        <input
          style={inputStyle}
          placeholder="Телефон или Telegram *"
          value={data.phone}
          onChange={(e) => setData((d) => ({ ...d, phone: e.target.value }))}
          required
        />
        <input
          style={{ ...inputStyle, marginBottom: 12 }}
          placeholder="Удобное время для звонка"
          value={data.time}
          onChange={(e) => setData((d) => ({ ...d, time: e.target.value }))}
        />
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 10,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            required
            checked={consentChecked}
            onChange={(e) => setConsentChecked(e.target.checked)}
            style={{
              marginTop: 2,
              accentColor: "#6366F1",
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: "rgba(240,240,255,0.55)", lineHeight: 1.5 }}>
            {consentText}{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#a5b4fc", textDecoration: "underline" }}
            >
              {consentLinkText}
            </a>
          </span>
        </label>
        <button
          type="submit"
          disabled={isSubmitting || !data.name.trim() || !data.phone.trim() || !consentChecked}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: 10,
            border: "none",
            background:
              isSubmitting || !data.name.trim() || !data.phone.trim() || !consentChecked
                ? "rgba(99,102,241,0.3)"
                : "linear-gradient(135deg, #6366F1, #06B6D4)",
            color: "#fff",
            fontSize: 13,
            fontWeight: 600,
            cursor:
              isSubmitting || !data.name.trim() || !data.phone.trim() || !consentChecked
                ? "not-allowed"
                : "pointer",
            transition: "opacity 0.2s",
          }}
        >
          {isSubmitting ? "Отправляю..." : "Отправить заявку →"}
        </button>
      </form>
    </motion.div>
  )
}

// ── Session ID helper ──────────────────────────────────────────────────────────

function genUUID(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

function getSessionId(): string {
  if (typeof window === "undefined") return genUUID()
  const key = "yura_session_id"
  const stored = sessionStorage.getItem(key)
  if (stored) return stored
  const id = genUUID()
  sessionStorage.setItem(key, id)
  return id
}

// ── Typing indicator ───────────────────────────────────────────────────────────

function TypingDots() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "12px 16px" }}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          style={{
            display: "block",
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: "var(--op-text-muted)",
            animation: `yuraDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Avatar sphere ──────────────────────────────────────────────────────────────

function YuraAvatar({ size = 36 }: { size?: number }) {
  const ringSize = Math.round(size * 1.45)
  return (
    <div
      style={{
        width: size,
        height: size,
        position: "relative",
        flexShrink: 0,
      }}
    >
      {/* Orbit ring */}
      <div
        style={{
          position: "absolute",
          width: ringSize,
          height: ringSize,
          top: "50%",
          left: "50%",
          borderRadius: "50%",
          border: "1px solid rgba(6,182,212,0.32)",
          animation: "yuraOrbit 5s linear infinite",
          pointerEvents: "none",
        }}
      />
      {/* Sphere */}
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #6366F1 0%, #06B6D4 100%)",
          boxShadow: "0 0 12px rgba(99,102,241,0.5)",
          animation: "yuraPulse 2.5s ease-in-out infinite",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Inner highlight */}
        <div
          style={{
            position: "absolute",
            width: "36%",
            height: "36%",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.38)",
            top: "14%",
            left: "17%",
          }}
        />
      </div>
    </div>
  )
}

// ── Message bubble ─────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: ChatMessage }) {
  const isUser = msg.role === "user"
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      style={{
        display: "flex",
        gap: 8,
        flexDirection: isUser ? "row-reverse" : "row",
        alignItems: "flex-end",
      }}
    >
      {!isUser && <YuraAvatar size={28} />}
      <div
        style={{
          maxWidth: "78%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser
            ? "rgba(99,102,241,0.18)"
            : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(99,102,241,0.35)"
            : "1px solid rgba(255,255,255,0.08)",
          color: "var(--op-text)",
          fontSize: "0.875rem",
          lineHeight: 1.6,
          wordBreak: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {msg.content}
      </div>
    </motion.div>
  )
}

// ── Main widget ────────────────────────────────────────────────────────────────

export default function YuraWidget() {
  const t = useTranslations("ai")
  const { heroChatOpen } = useHeroChat()

  const hints = t.raw("bubble_hints") as string[]
  const [bubbleHint] = useState<string>(() => hints[Math.floor(Math.random() * hints.length)])

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [calcResult, setCalcResult] = useState<string | undefined>(undefined)
  const [showBubble, setShowBubble] = useState(false)
  const [leadSent, setLeadSent] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [showLeadForm, setShowLeadForm] = useState(false)
  const [leadFormSubmitting, setLeadFormSubmitting] = useState(false)
  const [leadFormSubmitted, setLeadFormSubmitted] = useState(false)
  const [scrolledPastHero, setScrolledPastHero] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const sessionId = useRef<string>("")
  const isAtBottom = useRef(true)

  // Init session ID once on client
  useEffect(() => {
    sessionId.current = getSessionId()
  }, [])

  // Track whether user is at the bottom of messages
  const handleMessagesScroll = () => {
    const el = messagesContainerRef.current
    if (!el) return
    isAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60
  }

  // Auto-scroll only if user is already at bottom
  useEffect(() => {
    if (isAtBottom.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages, isTyping])

  // Force scroll to bottom when user sends a message or chat opens
  const scrollToBottom = () => {
    isAtBottom.current = true
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // Greeting on first open — calc-aware if opened from calculator
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setIsTyping(true)
      const timer = setTimeout(() => {
        setIsTyping(false)
        const greeting = calcResult
          ? `Отлично, вижу вы прошли калькулятор! Результат: ${calcResult}. Это хороший ориентир — расскажите подробнее: что за бизнес и какие задачи должен решать сайт?`
          : t("greeting")
        setMessages([{ role: "assistant", content: greeting }])
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [isOpen, messages.length, t, calcResult])

  // Track scroll past hero (threshold: 0.8 * innerHeight for widget visibility,
  // full innerHeight for bubble trigger)
  useEffect(() => {
    let bubbleShown = false
    let bubbleTimer: ReturnType<typeof setTimeout> | null = null

    const handleScroll = () => {
      const y = window.scrollY
      const h = window.innerHeight
      setScrolledPastHero(y > h * 0.8)

      // Trigger bubble after passing full hero height, with 2s delay
      if (!bubbleShown && y > h) {
        bubbleShown = true
        bubbleTimer = setTimeout(() => {
          setShowBubble(true)
          setHasUnread(true)
        }, 2000)
        window.removeEventListener("scroll", handleScroll)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => {
      if (bubbleTimer) clearTimeout(bubbleTimer)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Listen for yura-open custom event (from CalcSection)
  useEffect(() => {
    type RawCalcResult = { min: number; max: number; tier: string; days: string }
    const handler = (e: Event) => {
      const customE = e as CustomEvent<{ calcResult?: RawCalcResult | string }>
      const raw = customE.detail?.calcResult
      if (raw) {
        // CalcSection sends an object — serialize to a readable string for the API
        if (typeof raw === "object") {
          const cr = raw as RawCalcResult
          const serialized =
            `тариф ${cr.tier.toUpperCase()}, бюджет от ${cr.min.toLocaleString("ru-RU")} до ${cr.max.toLocaleString("ru-RU")} ₽, срок ${cr.days}`
          setCalcResult(serialized)
        } else {
          setCalcResult(raw)
        }
      }
      setIsOpen(true)
      setShowBubble(false)
      setHasUnread(false)
    }
    window.addEventListener("yura-open", handler)
    return () => window.removeEventListener("yura-open", handler)
  }, [])

  // Hide unread dot when chat opens
  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setShowBubble(false)
    }
  }, [isOpen])

  // Auto-grow textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    const ta = textareaRef.current
    if (ta) {
      ta.style.height = "auto"
      ta.style.height = `${Math.min(ta.scrollHeight, 96)}px`
    }
  }

  // Detect contact in message (Telegram handle or phone)
  const detectContact = (text: string): string | null => {
    const tgMatch = text.match(/@[\w]{3,}/u)
    const phoneMatch = text.match(/[+\d][\d\s\-()]{6,}/u)
    if (tgMatch) return tgMatch[0]
    if (phoneMatch) return phoneMatch[0].trim()
    return null
  }

  // Classify intent from last user message
  const detectIntent = (msgList: ChatMessage[]): "hot" | "warm" | "cold" => {
    const lastUser = [...msgList].reverse().find((m) => m.role === "user")?.content ?? ""
    const lower = lastUser.toLowerCase()
    if (
      lower.includes("делаем") ||
      lower.includes("готов") ||
      lower.includes("хочу заказ") ||
      lower.includes("let's do") ||
      lower.includes("yes let's")
    )
      return "hot"
    if (
      lower.includes("интересует") ||
      lower.includes("расскажите") ||
      lower.includes("сколько") ||
      lower.includes("how much") ||
      lower.includes("interested")
    )
      return "warm"
    return "cold"
  }

  const sendLead = useCallback(
    async (contact: string, msgList: ChatMessage[], name?: string, time?: string) => {
      if (leadSent) return
      setLeadSent(true)
      const intent = detectIntent(msgList)
      const summary = msgList
        .filter((m) => m.role === "user")
        .map((m) => m.content)
        .slice(-3)
        .join(" | ")

      try {
        await fetch("/api/leads/telegram", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contact,
            name: name || undefined,
            callTime: time || undefined,
            intent,
            summary: summary || "Нет данных",
            dialog: msgList,
            calcResult,
          }),
        })
      } catch (err) {
        console.error("[YuraWidget] lead send error:", err)
      }
    },
    [leadSent, calcResult]
  )

  const handleLeadFormSubmit = useCallback(
    async (data: LeadFormData) => {
      setLeadFormSubmitting(true)
      const allMessages: ChatMessage[] = [
        ...messages,
        { role: "user", content: `Имя: ${data.name}, контакт: ${data.phone}${data.time ? `, время: ${data.time}` : ""}` },
      ]
      await sendLead(data.phone, allMessages, data.name, data.time)
      setLeadFormSubmitting(false)
      setLeadFormSubmitted(true)
    },
    [messages, sendLead]
  )

  const sendMessage = async (userText: string) => {
    const trimmed = userText.trim()
    if (!trimmed || isTyping) return

    const newMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmed },
    ]
    setMessages(newMessages)
    setInput("")
    if (textareaRef.current) textareaRef.current.style.height = "auto"
    setIsTyping(true)
    scrollToBottom()

    const contact = detectContact(trimmed)

    try {
      const res = await fetch("/api/bots/yura/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          sessionId: sessionId.current,
          calcResult,
        }),
      })

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`)
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let assistantText = ""
      let firstContent = true

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantText += chunk

        // Strip [SHOW_FORM] marker before displaying
        const displayText = assistantText.replace(FORM_MARKER, "").trim()

        if (firstContent && displayText) {
          firstContent = false
          setIsTyping(false)
          setMessages((prev) => [...prev, { role: "assistant", content: displayText }])
        } else if (!firstContent) {
          setMessages((prev) => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: "assistant", content: displayText }
            return updated
          })
        }
      }

      // Stream ended with no content (pure reasoning)
      if (firstContent) setIsTyping(false)

      // Detect [SHOW_FORM] marker in full response
      if (assistantText.includes(FORM_MARKER)) {
        setShowLeadForm(true)
      }

      // If contact detected in user text — send lead silently
      if (contact) {
        const finalMessages: ChatMessage[] = [
          ...newMessages,
          { role: "assistant", content: assistantText.replace(FORM_MARKER, "").trim() },
        ]
        sendLead(contact, finalMessages).catch((err) =>
          console.error("[YuraWidget] sendLead error:", err)
        )
      }
    } catch (err) {
      console.error("[YuraWidget] sendMessage error:", err)
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("error") },
      ])
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const toggleOpen = () => {
    setIsOpen((v) => !v)
    setShowBubble(false)
    setHasUnread(false)
  }

  return (
    <>
      {/* Keyframe styles */}
      <style>{`
        @keyframes yuraPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(99,102,241,0.5); }
          50%       { box-shadow: 0 0 22px rgba(6,182,212,0.7); }
        }
        @keyframes yuraDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes yuraRing {
          0%   { transform: scale(1);   opacity: 0.55; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes yuraOrbit {
          from { transform: translate(-50%, -50%) rotate(0deg); }
          to   { transform: translate(-50%, -50%) rotate(360deg); }
        }
        @keyframes yuraGreenPulse {
          0%, 100% { opacity: 0.6; transform: scale(0.85); }
          50%      { opacity: 1;   transform: scale(1); }
        }
      `}</style>

      {/* Fixed container — hidden until user scrolls past hero, or when hero
           inline chat is open (unless widget is already open by the user) */}
      <div
        style={{
          position: "fixed",
          bottom: "1.5rem",
          right: "1.5rem",
          zIndex: 9000,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          gap: "0.75rem",
          pointerEvents: isOpen || (scrolledPastHero && !heroChatOpen) ? "auto" : "none",
          opacity: isOpen || (scrolledPastHero && !heroChatOpen) ? 1 : 0,
          transform:
            isOpen || (scrolledPastHero && !heroChatOpen) ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.3s ease, transform 0.3s ease",
        }}
      >
        {/* ── Chat panel ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="yura-panel"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={{
                width: "min(380px, calc(100vw - 3rem))",
                height: "clamp(420px, 60vh, 560px)",
                borderRadius: "20px",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                background: "rgba(13,13,26,0.96)",
                border: "1px solid rgba(255,255,255,0.1)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                boxShadow:
                  "0 8px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.12), inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {/* Gradient accent top strip */}
              <div
                style={{
                  height: 2,
                  background: "linear-gradient(90deg, #6366F1, #06B6D4)",
                  flexShrink: 0,
                }}
              />

              {/* Header */}
              <div
                style={{
                  padding: "0.875rem 1.25rem",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  flexShrink: 0,
                }}
              >
                <YuraAvatar size={40} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "0.9375rem",
                      color: "var(--op-text)",
                      lineHeight: 1.2,
                    }}
                  >
                    {t("name")}
                  </div>
                  <div
                    style={{
                      fontSize: "0.7rem",
                      color: "var(--op-text-muted)",
                      marginTop: 2,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("subtitle")}
                  </div>
                </div>

                {/* Online indicator */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.35rem",
                    marginRight: "0.5rem",
                    flexShrink: 0,
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "#22C55E",
                      display: "block",
                      boxShadow: "0 0 6px rgba(34,197,94,0.8)",
                      animation: "yuraGreenPulse 2s ease-in-out infinite",
                    }}
                  />
                  <span style={{ fontSize: "0.7rem", color: "#22C55E" }}>
                    {t("online")}
                  </span>
                </div>

                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  aria-label={t("close")}
                  style={{
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    cursor: "pointer",
                    color: "var(--op-text-muted)",
                    lineHeight: 1,
                    borderRadius: "50%",
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s ease, color 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.12)"
                    e.currentTarget.style.color = "var(--op-text)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)"
                    e.currentTarget.style.color = "var(--op-text-muted)"
                  }}
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="2" y1="2" x2="10" y2="10" />
                    <line x1="10" y1="2" x2="2" y2="10" />
                  </svg>
                </button>
              </div>

              {/* Messages */}
              <div
                ref={messagesContainerRef}
                onScroll={handleMessagesScroll}
                style={{
                  flex: 1,
                  overflowY: "auto",
                  padding: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  scrollbarWidth: "thin",
                  scrollbarColor: "rgba(255,255,255,0.1) transparent",
                }}
              >
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
                {isTyping && (
                  <div style={{ display: "flex", alignItems: "end", gap: 8 }}>
                    <YuraAvatar size={28} />
                    <div
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.08)",
                        borderRadius: "16px 16px 16px 4px",
                      }}
                    >
                      <TypingDots />
                    </div>
                  </div>
                )}
                {showLeadForm && (
                  <LeadFormBubble
                    onSubmit={handleLeadFormSubmit}
                    isSubmitting={leadFormSubmitting}
                    submitted={leadFormSubmitted}
                    consentText={t("lead_form.consent")}
                    consentLinkText={t("lead_form.consent_link")}
                    submittedText={t("lead_submitted")}
                  />
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.07)",
                  padding: "0.75rem 1rem",
                  display: "flex",
                  gap: "0.5rem",
                  alignItems: "flex-end",
                  flexShrink: 0,
                  background: "rgba(0,0,0,0.12)",
                }}
              >
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  placeholder={t("placeholder")}
                  rows={1}
                  style={{
                    flex: 1,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "0.625rem 0.875rem",
                    color: "var(--op-text)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                    resize: "none",
                    outline: "none",
                    fontFamily: "inherit",
                    maxHeight: 96,
                    overflowY: "auto",
                    transition: "border-color 0.15s ease",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(99,102,241,0.5)"
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  }}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  aria-label={t("send")}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    border: "none",
                    cursor: input.trim() && !isTyping ? "pointer" : "default",
                    background:
                      input.trim() && !isTyping
                        ? "linear-gradient(135deg, #6366F1, #06B6D4)"
                        : "rgba(255,255,255,0.07)",
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    opacity: input.trim() && !isTyping ? 1 : 0.45,
                    transition: "background 0.15s ease, opacity 0.15s ease",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Bubble hint (clickable) ── */}
        <AnimatePresence>
          {showBubble && !isOpen && (
            <motion.button
              key="yura-bubble"
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, y: 4 }}
              transition={{ duration: 0.22 }}
              onClick={toggleOpen}
              style={{
                background: "rgba(13,13,26,0.96)",
                border: "1px solid rgba(99,102,241,0.35)",
                borderRadius: "12px 12px 4px 12px",
                padding: "0.625rem 1rem",
                fontSize: "0.8125rem",
                color: "var(--op-text)",
                whiteSpace: "nowrap",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                boxShadow:
                  "0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(99,102,241,0.08)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
              {bubbleHint}
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── FAB trigger button ── */}
        <div style={{ position: "relative" }}>
          {/* Pulse ring (only when closed) */}
          {!isOpen && (
            <span
              style={{
                position: "absolute",
                inset: -3,
                borderRadius: "50%",
                border: "2px solid rgba(99,102,241,0.45)",
                animation: "yuraRing 2.2s ease-out infinite",
                pointerEvents: "none",
              }}
            />
          )}

          {/* Unread badge */}
          <AnimatePresence>
            {hasUnread && !isOpen && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                style={{
                  position: "absolute",
                  top: -2,
                  right: -2,
                  width: 16,
                  height: 16,
                  borderRadius: "50%",
                  background: "#EF4444",
                  border: "2px solid #07070F",
                  zIndex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "0.6rem",
                  color: "#fff",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                1
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={toggleOpen}
            aria-label={t("trigger")}
            title={t("trigger")}
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              border: "none",
              cursor: "pointer",
              background: "linear-gradient(135deg, #6366F1, #06B6D4)",
              boxShadow: isOpen
                ? "0 4px 16px rgba(99,102,241,0.3)"
                : "0 4px 24px rgba(99,102,241,0.52)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
              position: "relative",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.08)"
              e.currentTarget.style.boxShadow =
                "0 6px 32px rgba(99,102,241,0.72)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)"
              e.currentTarget.style.boxShadow = isOpen
                ? "0 4px 16px rgba(99,102,241,0.3)"
                : "0 4px 24px rgba(99,102,241,0.52)"
            }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? (
                <motion.span
                  key="close-icon"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  >
                    <line x1="4" y1="4" x2="16" y2="16" />
                    <line x1="16" y1="4" x2="4" y2="16" />
                  </svg>
                </motion.span>
              ) : (
                <motion.span
                  key="chat-icon"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <svg
                    width="22"
                    height="22"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>
    </>
  )
}
