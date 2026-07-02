"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

// ── Types ──────────────────────────────────────────────────────────────────────

type Role = "user" | "assistant"
interface Message {
  role: Role
  content: string
}

interface BotState {
  step: number
  role: string
  specialty: string
  siteUrl: string
  telegramConnected: boolean
}

// ── Avatar (NEXUS red) ────────────────────────────────────────────────────────

function OptiAvatar({ size = 28 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: "linear-gradient(135deg, #e82020 0%, #ff4a4a 100%)",
        boxShadow: "0 0 10px rgba(232,32,32,0.45)",
        position: "relative",
        flexShrink: 0,
        overflow: "hidden",
        animation: "optiPulse 2.5s ease-in-out infinite",
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          width: "36%",
          height: "36%",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.22)",
          top: "14%",
          left: "17%",
        }}
      />
    </div>
  )
}

// ── Typing dots ───────────────────────────────────────────────────────────────

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
            animation: `optiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
          }}
        />
      ))}
    </div>
  )
}

// ── Message bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: Message }) {
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
      {!isUser && <OptiAvatar size={28} />}
      <div
        style={{
          maxWidth: "85%",
          padding: "10px 14px",
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          background: isUser ? "rgba(232,32,32,0.18)" : "rgba(255,255,255,0.04)",
          border: isUser
            ? "1px solid rgba(232,32,32,0.35)"
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

// ── Quick reply chips ────────────────────────────────────────────────────────

function QuickReplyChips({
  chips,
  onSelect,
}: {
  chips: string[]
  onSelect: (chip: string) => void
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        overflowX: "auto",
        paddingBottom: 4,
        WebkitOverflowScrolling: "touch" as unknown as undefined,
        msOverflowStyle: "none",
        scrollbarWidth: "none",
        flexWrap: "wrap",
      }}
      role="group"
      aria-label="Варианты ответа"
    >
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 14,
            padding: "8px 16px",
            borderRadius: 9999,
            background: "rgba(255,255,255,0.05)",
            border: "1px solid var(--op-border-strong)",
            color: "var(--op-text-secondary)",
            whiteSpace: "nowrap",
            transition: "all 160ms",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "rgba(232,32,32,0.4)"
            e.currentTarget.style.color = "var(--op-text)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "var(--op-border-strong)"
            e.currentTarget.style.color = "var(--op-text-secondary)"
          }}
        >
          {chip}
        </button>
      ))}
    </div>
  )
}

// ── Onboarding progress sidebar ──────────────────────────────────────────────

const STEP_LABELS = [
  { icon: "👤", label: "Выбор роли" },
  { icon: "🏥", label: "Чем занимается клиника" },
  { icon: "📋", label: "Услуги и врачи" },
  { icon: "✉️", label: "Подключение Telegram" },
  { icon: "🚀", label: "Создание ассистента" },
]

function OnboardingProgress({ step }: { step: number }) {
  const pct = Math.round((Math.max(0, step - 1) / 5) * 100)

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 32,
        height: "100%",
      }}
    >
      <div>
        <div
          style={{
            fontFamily: "var(--op-font-mono)",
            fontSize: 11,
            color: "var(--op-text-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: 8,
          }}
        >
          Архитектор · Шаг {Math.max(1, step)} из 6
        </div>
        <h2
          style={{
            fontFamily: "var(--op-font-display)",
            fontSize: 22,
            fontWeight: 700,
            color: "var(--op-text)",
            marginBottom: 8,
          }}
        >
          Настраиваем вашего AI-ассистента
        </h2>
        <p
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 14,
            color: "var(--op-text-secondary)",
            lineHeight: 1.6,
          }}
        >
          Займёт 3–5 минут. По результатам создадим ассистента, который знает вашу клинику.
        </p>
      </div>

      {/* Progress bar */}
      <div>
        <div
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 12,
            color: "var(--op-text-muted)",
            marginBottom: 6,
          }}
        >
          {Math.max(1, step)} из 6 шагов
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "rgba(255,255,255,0.06)",
            overflow: "hidden",
          }}
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height: "100%",
              background: "linear-gradient(90deg, #e82020, #ff4a4a)",
            }}
          />
        </div>
      </div>

      {/* Steps list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {STEP_LABELS.map((s, i) => {
          const stepNum = i + 1
          const isDone = step > stepNum + 1
          const isActive = step === stepNum + 1
          return (
            <div
              key={s.label}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontFamily: "var(--op-font-body)",
                fontSize: 14,
                color: isDone
                  ? "var(--op-text-muted)"
                  : isActive
                  ? "var(--op-text)"
                  : "var(--op-text-faint)",
                fontWeight: isActive ? 600 : 400,
              }}
            >
              <span style={{ width: 20, textAlign: "center", fontSize: 16 }}>
                {isDone ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  s.icon
                )}
              </span>
              {s.label}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Telegram inline instruction ───────────────────────────────────────────────

function TelegramInstruction({ onDone }: { onDone: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        borderRadius: 12,
        background: "var(--op-surface-elevated)",
        border: "1px solid var(--op-border)",
        padding: 16,
        marginTop: 8,
      }}
    >
      <p style={{ fontFamily: "var(--op-font-body)", fontSize: 13, color: "var(--op-text-secondary)", margin: "0 0 10px", lineHeight: 1.6 }}>
        1. Найдите <strong style={{ color: "var(--op-text)" }}>@OptisphereLeadsBot</strong> в Telegram<br />
        2. Нажмите /start<br />
        3. Заявки придут сразу после создания ассистента
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <a
          href="tg://resolve?domain=OptisphereLeadsBot"
          className="btn btn-ghost"
          style={{ height: 36, padding: "0 16px", fontSize: 13 }}
        >
          Открыть бота
        </a>
        <button
          onClick={onDone}
          className="btn btn-primary"
          style={{ height: 36, padding: "0 16px", fontSize: 13 }}
        >
          Готово, подключил
        </button>
      </div>
    </motion.div>
  )
}

// ── Main ArchitectBot ─────────────────────────────────────────────────────────

type UIStep =
  | "welcome"
  | "role"
  | "specialty"
  | "site"
  | "telegram"
  | "summary"
  | "done"

function getChipsForStep(step: UIStep, showTgInstruction: boolean): string[] {
  if (step === "welcome") return ["Да, поехали!", "Расскажи подробнее"]
  if (step === "role") return ["Администратор клиники", "Консультант по услугам", "Свой вариант — напишу"]
  if (step === "specialty") return ["Стоматология", "Многопрофильный медцентр", "Косметология / эстетика", "Своя специализация"]
  if (step === "site") return ["Есть сайт, даю ссылку", "Сайта нет"]
  if (step === "telegram" && !showTgInstruction) return ["Подключу Telegram", "Пока пропущу"]
  return []
}

export default function ArchitectBot() {
  const router = useRouter()
  const shouldReduceMotion = useReducedMotion()

  const [messages, setMessages] = useState<Message[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [currentStep, setCurrentStep] = useState<UIStep>("welcome")
  const [showFreeInput, setShowFreeInput] = useState(false)
  const [showTgInstruction, setShowTgInstruction] = useState(false)
  const [botState, setBotState] = useState<BotState>({
    step: 1,
    role: "",
    specialty: "",
    siteUrl: "",
    telegramConnected: false,
  })
  const [keyboardOffset, setKeyboardOffset] = useState(0)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const hasStarted = useRef(false)

  // visualViewport for iOS keyboard
  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return
    const vv = window.visualViewport
    const updateOffset = () => {
      const offset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      setKeyboardOffset(offset)
    }
    updateOffset()
    vv.addEventListener("resize", updateOffset)
    vv.addEventListener("scroll", updateOffset)
    return () => {
      vv.removeEventListener("resize", updateOffset)
      vv.removeEventListener("scroll", updateOffset)
    }
  }, [])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  // Bot adds message after delay
  const addBotMessage = (text: string, delay = 800) => {
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [...prev, { role: "assistant", content: text }])
    }, delay)
  }

  // Kick off welcome
  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
    addBotMessage(
      "Привет! Я Опти — настрою вашего AI-ассистента для клиники.\n\nЗаймёт 3–5 минут. По итогам вы получите готового ассистента, который будет отвечать вашим пациентам и брать запись — прямо сейчас, без программиста.\n\nНачнём?",
      600,
    )
  }, [])

  const addUserMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "user", content: text }])
  }

  const handleChipSelect = (chip: string) => {
    addUserMessage(chip)

    if (currentStep === "welcome") {
      if (chip === "Расскажи подробнее") {
        addBotMessage(
          "Конечно! Мы настроим AI-администратора специально под вашу клинику: он будет отвечать пациентам, брать запись и отправлять заявки вам в Telegram. Всё бесплатно первый месяц. Поехали?",
        )
        setTimeout(() => setCurrentStep("role"), 1500)
      } else {
        setBotState((s) => ({ ...s, step: 2 }))
        setCurrentStep("role")
        addBotMessage("Отлично! Давайте выберем, какую роль будет выполнять ваш AI-ассистент.")
      }
      return
    }

    if (currentStep === "role") {
      if (chip === "Свой вариант — напишу") {
        setShowFreeInput(true)
        return
      }
      setBotState((s) => ({ ...s, step: 3, role: chip }))
      setCurrentStep("specialty")
      addBotMessage(
        `Хорошо, ${chip}! Что за клиника — расскажите в двух словах.\nЭто нужно, чтобы ассистент говорил правильным языком с пациентами.`,
      )
      return
    }

    if (currentStep === "specialty") {
      if (chip === "Своя специализация") {
        setShowFreeInput(true)
        return
      }
      setBotState((s) => ({ ...s, step: 4, specialty: chip }))
      setCurrentStep("site")
      addBotMessage(
        "Понял. Есть ли у клиники сайт? Если да — дайте ссылку, ассистент сам разберётся с вашими услугами, ценами и врачами.\nЕсли сайта нет — не страшно, перечислим основное вручную.",
      )
      return
    }

    if (currentStep === "site") {
      if (chip === "Есть сайт, даю ссылку") {
        setShowFreeInput(true)
        if (textareaRef.current) {
          textareaRef.current.placeholder = "https://..."
          textareaRef.current.focus()
        }
        return
      }
      // No site
      setBotState((s) => ({ ...s, step: 5, siteUrl: "ручной ввод" }))
      setCurrentStep("telegram")
      addBotMessage(
        "Хорошо. Пожалуйста, перечислите 3–5 основных услуг или специализаций. Например: «Терапевт, педиатр, УЗИ, анализы, стоматология».",
      )
      setShowFreeInput(true)
      return
    }

    if (currentStep === "telegram") {
      if (chip === "Подключу Telegram") {
        setShowTgInstruction(true)
        return
      }
      // Skip telegram
      setBotState((s) => ({ ...s, step: 6, telegramConnected: false }))
      goToSummary({ ...botState, telegramConnected: false })
      return
    }
  }

  const goToSummary = (state: BotState) => {
    setCurrentStep("summary")
    addBotMessage(
      `Отлично! Я собрал всё необходимое. Вот ваш ассистент:\n\n▸ Роль: ${state.role || "Администратор клиники"}\n▸ Клиника: ${state.specialty || "Медицинский центр"}\n▸ Источник данных: ${state.siteUrl || "ручной ввод"}\n▸ Уведомления: ${state.telegramConnected ? "Telegram подключён" : "не подключён"}\n\nГотов создать — займёт около 10 секунд.`,
      1200,
    )
  }

  const handleFreeInput = () => {
    const trimmed = inputValue.trim()
    if (!trimmed) return
    setInputValue("")
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.placeholder = "Напишите ответ..."
    }
    setShowFreeInput(false)
    addUserMessage(trimmed)

    if (currentStep === "role") {
      setBotState((s) => ({ ...s, step: 3, role: trimmed }))
      setCurrentStep("specialty")
      addBotMessage(
        `Хорошо, ${trimmed}! Что за клиника — расскажите в двух словах.\nЭто нужно, чтобы ассистент говорил правильным языком с пациентами.`,
      )
      return
    }

    if (currentStep === "specialty") {
      setBotState((s) => ({ ...s, step: 4, specialty: trimmed }))
      setCurrentStep("site")
      addBotMessage(
        "Понял. Есть ли у клиники сайт? Если да — дайте ссылку, ассистент сам разберётся с вашими услугами, ценами и врачами.\nЕсли сайта нет — не страшно, перечислим основное вручную.",
      )
      return
    }

    if (currentStep === "site") {
      const isUrl = trimmed.startsWith("http")
      if (isUrl) {
        addBotMessage(
          "Отлично! Запомнил ссылку — ассистент будет брать актуальные данные прямо с сайта. Двигаемся дальше.",
        )
        setBotState((s) => ({ ...s, step: 5, siteUrl: trimmed }))
      } else {
        addBotMessage("Сохранил. Используем эти данные для настройки ассистента.")
        setBotState((s) => ({ ...s, step: 5, siteUrl: "ручной ввод" }))
      }
      setCurrentStep("telegram")
      setTimeout(() => {
        addBotMessage(
          "Почти готово. Куда отправлять заявки от пациентов?\nРекомендуем Telegram — уведомление приходит мгновенно, с именем и запросом.",
        )
      }, 1200)
      return
    }

    if (currentStep === "telegram") {
      setBotState((s) => ({ ...s, step: 5, siteUrl: trimmed }))
      setCurrentStep("telegram")
      addBotMessage(
        "Почти готово. Куда отправлять заявки от пациентов?\nРекомендуем Telegram — уведомление приходит мгновенно, с именем и запросом.",
      )
      return
    }
  }

  const handleTelegramDone = () => {
    setShowTgInstruction(false)
    addUserMessage("Готово, подключил")
    const newState = { ...botState, step: 6, telegramConnected: true }
    setBotState(newState)
    goToSummary(newState)
  }

  const handleCreate = () => {
    router.push("/saas/creating")
  }

  const chips = getChipsForStep(currentStep, showTgInstruction)
  const showChips = chips.length > 0 && !showFreeInput
  const showInput =
    showFreeInput ||
    (currentStep !== "summary" && currentStep !== "done" && currentStep !== "welcome" && chips.length === 0)

  const mobileProgressLabel =
    currentStep === "welcome"
      ? "Шаг 1 из 6 · Начало"
      : currentStep === "role"
      ? "Шаг 2 из 6 · Выбор роли"
      : currentStep === "specialty"
      ? "Шаг 3 из 6 · Специализация"
      : currentStep === "site"
      ? "Шаг 4 из 6 · Сайт"
      : currentStep === "telegram"
      ? "Шаг 5 из 6 · Telegram"
      : "Шаг 6 из 6 · Создание"

  const progressPct = Math.round(
    (["welcome", "role", "specialty", "site", "telegram", "summary"].indexOf(currentStep) / 5) * 100,
  )

  return (
    <>
      <style>{`
        @keyframes optiPulse {
          0%, 100% { box-shadow: 0 0 12px rgba(232,32,32,0.5); }
          50%       { box-shadow: 0 0 22px rgba(255,74,74,0.7); }
        }
        @keyframes optiDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>

      <div style={{ display: "flex", minHeight: "100svh", flexDirection: "column" }}>
        {/* Header */}
        <header
          style={{
            height: 57,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 clamp(20px,4vw,48px)",
            borderBottom: "1px solid var(--op-border)",
            flexShrink: 0,
          }}
        >
          <Link
            href="/saas/clinics"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              textDecoration: "none",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="10" stroke="var(--op-accent)" strokeWidth="2" />
              <circle cx="12" cy="12" r="5" fill="var(--op-accent)" />
            </svg>
            <span style={{ fontFamily: "var(--op-font-display)", fontSize: 16, fontWeight: 700, color: "var(--op-text)" }}>
              Optisphere
            </span>
          </Link>

          <Link
            href="/saas/clinics"
            className="btn btn-ghost"
            style={{ height: 36, padding: "0 16px", fontSize: 13 }}
          >
            ← Назад
          </Link>
        </header>

        {/* Mobile progress */}
        <div
          className="saas-mobile-progress"
          style={{
            display: "none",
            position: "sticky",
            top: 57,
            zIndex: 10,
            background: "var(--op-surface)",
            borderBottom: "1px solid var(--op-border)",
            padding: "10px clamp(16px,4vw,24px)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--op-font-body)",
              fontSize: 13,
              color: "var(--op-text-secondary)",
              marginBottom: 6,
            }}
          >
            {mobileProgressLabel}
          </div>
          <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.06)" }}>
            <div
              style={{
                height: "100%",
                background: "linear-gradient(90deg, #e82020, #ff4a4a)",
                width: `${progressPct}%`,
                transition: "width 400ms var(--op-ease)",
              }}
            />
          </div>
        </div>

        {/* Main content */}
        <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
          {/* Sidebar (desktop) */}
          <aside
            className="saas-sidebar"
            style={{
              width: "40%",
              maxWidth: 360,
              borderRight: "1px solid var(--op-border)",
              background: "var(--op-surface)",
              padding: "48px 40px",
              position: "sticky",
              top: 57,
              height: "calc(100svh - 57px)",
              overflowY: "auto",
              flexShrink: 0,
            }}
          >
            <OnboardingProgress step={botState.step} />
          </aside>

          {/* Chat area */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              minWidth: 0,
            }}
          >
            {/* Messages */}
            <div
              ref={messagesContainerRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "clamp(20px,3vw,40px) clamp(16px,3vw,32px)",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                scrollbarWidth: "thin",
              }}
            >
              <AnimatePresence initial={false}>
                {messages.map((msg, i) => (
                  <MessageBubble key={i} msg={msg} />
                ))}
              </AnimatePresence>

              {isTyping && (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
                  <OptiAvatar size={28} />
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

              {/* Summary CTA */}
              {currentStep === "summary" && !isTyping && (
                <motion.div
                  initial={shouldReduceMotion ? {} : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 8,
                    marginTop: 8,
                  }}
                >
                  <button
                    onClick={handleCreate}
                    className="btn btn-primary"
                    style={{
                      width: "100%",
                      maxWidth: 360,
                      height: 56,
                      fontSize: 17,
                      fontWeight: 700,
                      justifyContent: "center",
                      gap: 10,
                    }}
                  >
                    Создать AI-ассистента
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                      <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                    </svg>
                  </button>
                  <p
                    style={{
                      fontFamily: "var(--op-font-body)",
                      fontSize: 12,
                      color: "var(--op-text-muted)",
                      textAlign: "center",
                    }}
                  >
                    Бесплатно · Без карты · Занимает ~10 секунд
                  </p>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            {currentStep !== "summary" && (
              <div
                style={{
                  borderTop: "1px solid var(--op-border)",
                  padding: "12px 16px",
                  background: "rgba(0,0,0,0.12)",
                  backdropFilter: "blur(8px)",
                  position: "sticky",
                  bottom: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                  paddingBottom: `calc(12px + ${keyboardOffset}px + env(safe-area-inset-bottom))`,
                }}
              >
                {showTgInstruction && (
                  <TelegramInstruction onDone={handleTelegramDone} />
                )}

                {showChips && !showTgInstruction && (
                  <QuickReplyChips chips={chips} onSelect={handleChipSelect} />
                )}

                {(showInput || showFreeInput) && (
                  <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                    <textarea
                      ref={textareaRef}
                      value={inputValue}
                      onChange={(e) => {
                        setInputValue(e.target.value)
                        const ta = e.currentTarget
                        ta.style.height = "auto"
                        ta.style.height = `${Math.min(ta.scrollHeight, 80)}px`
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault()
                          handleFreeInput()
                        }
                      }}
                      placeholder="Напишите ответ..."
                      rows={1}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,0.06)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: 12,
                        padding: "10px 14px",
                        color: "var(--op-text)",
                        fontSize: "0.875rem",
                        lineHeight: 1.5,
                        resize: "none",
                        outline: "none",
                        fontFamily: "inherit",
                        maxHeight: 80,
                        overflowY: "auto",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = "rgba(232,32,32,0.5)"
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                      }}
                    />
                    <button
                      onClick={handleFreeInput}
                      disabled={!inputValue.trim()}
                      aria-label="Отправить"
                      style={{
                        width: 44,
                        height: 44,
                        borderRadius: "50%",
                        border: "none",
                        background: inputValue.trim()
                          ? "linear-gradient(135deg, #e82020, #ff4a4a)"
                          : "rgba(255,255,255,0.07)",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        opacity: inputValue.trim() ? 1 : 0.45,
                        transition: "background 0.15s ease, opacity 0.15s ease",
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 767px) {
          .saas-sidebar { display: none !important; }
          .saas-mobile-progress { display: block !important; }
        }
      `}</style>
    </>
  )
}
