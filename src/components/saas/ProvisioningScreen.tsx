"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

// ── WidgetSnippet ──────────────────────────────────────────────────────────────

const WIDGET_CODE = `<script src="https://optisphere.ru/widget.js" data-bot="demo-clinic-xk9m"></script>`

function WidgetSnippet() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(WIDGET_CODE)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select text
    }
  }

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          display: "block",
          background: "var(--op-base)",
          border: "1px solid var(--op-border)",
          borderRadius: 8,
          padding: "12px 52px 12px 16px",
          fontFamily: "var(--op-font-mono)",
          fontSize: 13,
          color: "var(--op-text)",
          overflowX: "auto",
          whiteSpace: "nowrap",
          WebkitOverflowScrolling: "touch" as unknown as undefined,
        }}
      >
        {WIDGET_CODE}
      </div>
      <button
        onClick={handleCopy}
        aria-label="Копировать код"
        style={{
          position: "absolute",
          top: 8,
          right: 8,
          background: "var(--op-surface-overlay)",
          border: "1px solid var(--op-border)",
          borderRadius: 6,
          padding: "4px 10px",
          fontFamily: "var(--op-font-body)",
          fontSize: 12,
          color: copied ? "#22c55e" : "var(--op-text-secondary)",
          transition: "color 0.2s",
          whiteSpace: "nowrap",
        }}
      >
        {copied ? "Скопировано ✓" : "Копировать"}
      </button>
    </div>
  )
}

// ── BuildStepItem ──────────────────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "done"

function BuildStepItem({
  label,
  detail,
  status,
}: {
  label: string
  detail: string
  status: StepStatus
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      style={{
        background: "var(--op-surface)",
        border: `1px solid ${status === "active" ? "rgba(232,32,32,0.4)" : "var(--op-border)"}`,
        borderRadius: 10,
        padding: "14px 18px",
        display: "flex",
        alignItems: "center",
        gap: 14,
        transition: "border-color 300ms",
      }}
    >
      {/* Status icon */}
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            status === "done"
              ? "rgba(34,197,94,0.1)"
              : status === "active"
              ? "rgba(232,32,32,0.1)"
              : "rgba(255,255,255,0.06)",
          animation: status === "active" ? "stepRing 1.2s ease-in-out infinite" : "none",
        }}
      >
        {status === "done" ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : status === "active" ? (
          <div style={{ display: "flex", gap: 3 }}>
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "var(--op-accent)",
                  animation: `optiDot 1.2s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        ) : (
          <span
            style={{
              display: "block",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
            }}
          />
        )}
      </div>

      <div>
        <div
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 15,
            color:
              status === "done"
                ? "var(--op-text-secondary)"
                : status === "active"
                ? "var(--op-text)"
                : "var(--op-text-muted)",
            fontWeight: status === "active" ? 600 : 400,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 12,
            color: "var(--op-text-muted)",
            marginTop: 2,
          }}
        >
          {status === "done" ? "Готово" : detail}
        </div>
      </div>
    </motion.div>
  )
}

// ── Build steps config ─────────────────────────────────────────────────────────

const BUILD_STEPS = [
  { label: "Создаю проект", detail: "Регистрирую ваш ассистент в системе", startAt: 0 },
  { label: "Пишу промпт", detail: "Настраиваю личность и знания о клинике", startAt: 2500 },
  { label: "Подключаю виджет", detail: "Генерирую код для вашего сайта", startAt: 5500 },
  { label: "Финальная проверка", detail: "Тестирую ответы ассистента", startAt: 8000 },
]

const DONE_AT = 10000

// ── Main ─────────────────────────────────────────────────────────────────────

export default function ProvisioningScreen() {
  const shouldReduceMotion = useReducedMotion()

  const [stepStatuses, setStepStatuses] = useState<StepStatus[]>(["pending", "pending", "pending", "pending"])
  const [isDone, setIsDone] = useState(false)
  const [progressWidth, setProgressWidth] = useState(0)

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (shouldReduceMotion) {
      // Skip animation on reduced motion
      setStepStatuses(["done", "done", "done", "done"])
      setTimeout(() => setIsDone(true), 500)
      return
    }

    // Progress bar animation via rAF
    const startTime = Date.now()
    let rafId: number
    const tick = () => {
      const elapsed = Date.now() - startTime
      const pct = Math.min(100, (elapsed / DONE_AT) * 100)
      setProgressWidth(pct)
      if (pct < 100) rafId = requestAnimationFrame(tick)
    }
    rafId = requestAnimationFrame(tick)

    // Step activations
    BUILD_STEPS.forEach((step, i) => {
      const t1 = setTimeout(() => {
        setStepStatuses((prev) => {
          const next = [...prev] as StepStatus[]
          next[i] = "active"
          return next
        })
      }, step.startAt)
      timersRef.current.push(t1)

      if (i < BUILD_STEPS.length - 1) {
        const doneAt = BUILD_STEPS[i + 1].startAt - 100
        const t2 = setTimeout(() => {
          setStepStatuses((prev) => {
            const next = [...prev] as StepStatus[]
            next[i] = "done"
            return next
          })
        }, doneAt)
        timersRef.current.push(t2)
      }
    })

    // Final done
    const finalTimer = setTimeout(() => {
      setStepStatuses(["done", "done", "done", "done"])
      setTimeout(() => setIsDone(true), 400)
    }, DONE_AT)
    timersRef.current.push(finalTimer)

    return () => {
      cancelAnimationFrame(rafId)
      timersRef.current.forEach(clearTimeout)
    }
  }, [shouldReduceMotion])

  return (
    <>
      <style>{`
        @keyframes optiDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes stepRing {
          0%, 100% { box-shadow: 0 0 0 0 rgba(232,32,32,0.4); }
          50%      { box-shadow: 0 0 0 4px rgba(232,32,32,0); }
        }
        @keyframes buildPulse {
          0%, 100% { box-shadow: 0 0 48px rgba(232,32,32,0.4); }
          50%      { box-shadow: 0 0 64px rgba(255,74,74,0.6); }
        }
        @keyframes drawCheck {
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      {/* Grid bg */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div
        style={{
          minHeight: "100svh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 1,
          padding: "40px clamp(20px,4vw,48px)",
        }}
      >
        <div style={{ width: "100%", maxWidth: 560 }}>
          <AnimatePresence mode="wait">
            {!isDone ? (
              <motion.div
                key="building"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32 }}
              >
                {/* Pulsing sphere */}
                <div
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #e82020, #ff4a4a)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                    animation: "buildPulse 1.5s ease-in-out infinite",
                  }}
                  aria-hidden="true"
                >
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                    <path d="M7 8h.01M12 8h.01M17 8h.01M7 11h10" />
                  </svg>
                </div>

                <h1
                  style={{
                    fontFamily: "var(--op-font-display)",
                    fontSize: 24,
                    fontWeight: 700,
                    color: "var(--op-text)",
                    textAlign: "center",
                  }}
                >
                  Создаём вашего ассистента...
                </h1>

                {/* Steps */}
                <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
                  {BUILD_STEPS.map((step, i) =>
                    stepStatuses[i] !== "pending" ? (
                      <BuildStepItem
                        key={step.label}
                        label={step.label}
                        detail={step.detail}
                        status={stepStatuses[i]}
                      />
                    ) : (
                      <div
                        key={step.label}
                        style={{
                          background: "var(--op-surface)",
                          border: "1px solid var(--op-border)",
                          borderRadius: 10,
                          padding: "14px 18px",
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          opacity: 0.4,
                        }}
                      >
                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.06)", flexShrink: 0 }} />
                        <div>
                          <div style={{ fontFamily: "var(--op-font-body)", fontSize: 15, color: "var(--op-text-muted)" }}>{step.label}</div>
                          <div style={{ fontFamily: "var(--op-font-body)", fontSize: 12, color: "var(--op-text-faint)", marginTop: 2 }}>{step.detail}</div>
                        </div>
                      </div>
                    )
                  )}
                </div>

                {/* Progress bar */}
                <div style={{ width: "100%", height: 2, background: "rgba(255,255,255,0.06)", borderRadius: 1 }}>
                  <div
                    style={{
                      height: "100%",
                      background: "linear-gradient(90deg, #e82020, #ff4a4a)",
                      borderRadius: 1,
                      width: `${progressWidth}%`,
                      transition: "width 200ms linear",
                    }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24, width: "100%" }}
              >
                {/* Animated checkmark */}
                <svg width="72" height="72" viewBox="0 0 72 72" fill="none" aria-label="Готово">
                  <circle cx="36" cy="36" r="34" stroke="rgba(34,197,94,0.25)" strokeWidth="2" />
                  <circle cx="36" cy="36" r="34" stroke="#22c55e" strokeWidth="2" strokeDasharray="213" strokeDashoffset="213" style={{ animation: "drawCheck 0.6s ease forwards 0.1s" }} />
                  <path d="M20 36l12 12 20-22" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="50" strokeDashoffset="50" style={{ animation: "drawCheck 0.4s ease forwards 0.5s" }} />
                </svg>

                <div style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      fontFamily: "var(--op-font-display)",
                      fontSize: 28,
                      fontWeight: 700,
                      color: "var(--op-text)",
                    }}
                  >
                    Ваш ассистент готов!
                  </h1>
                  <p
                    style={{
                      fontFamily: "var(--op-font-body)",
                      fontSize: 15,
                      color: "var(--op-text-secondary)",
                      marginTop: 8,
                    }}
                  >
                    Проверьте демо и добавьте виджет на сайт.
                  </p>
                </div>

                {/* Demo link */}
                <div
                  style={{
                    background: "var(--op-surface)",
                    border: "1px solid var(--op-border)",
                    borderRadius: 12,
                    padding: 20,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--op-font-mono)",
                      fontSize: 11,
                      color: "var(--op-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                    }}
                  >
                    Ваша демо-ссылка
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--op-font-body)",
                      fontSize: 14,
                      color: "var(--op-accent)",
                      background: "var(--op-surface-elevated)",
                      padding: "10px 14px",
                      borderRadius: 8,
                      marginBottom: 12,
                    }}
                  >
                    optisphere.ru/bot/demo-clinic-xk9m
                  </div>
                  <a
                    href="#"
                    className="btn btn-primary"
                    style={{ width: "100%", justifyContent: "center", height: 44 }}
                    onClick={(e) => e.preventDefault()}
                  >
                    Открыть демо
                  </a>
                </div>

                {/* Widget snippet */}
                <div
                  style={{
                    background: "var(--op-surface)",
                    border: "1px solid var(--op-border)",
                    borderRadius: 12,
                    padding: 20,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--op-font-mono)",
                      fontSize: 11,
                      color: "var(--op-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                    }}
                  >
                    Код виджета для вашего сайта
                  </div>
                  <WidgetSnippet />
                  <p
                    style={{
                      fontFamily: "var(--op-font-body)",
                      fontSize: 12,
                      color: "var(--op-text-muted)",
                      marginTop: 10,
                      lineHeight: 1.5,
                    }}
                  >
                    Вставьте перед &lt;/body&gt; на вашем сайте. Подходит для Tilda, WordPress, любого конструктора.
                  </p>
                </div>

                {/* Telegram block */}
                <div
                  style={{
                    background: "var(--op-surface)",
                    border: "1px solid var(--op-border)",
                    borderRadius: 12,
                    padding: 20,
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      fontFamily: "var(--op-font-mono)",
                      fontSize: 11,
                      color: "var(--op-text-muted)",
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginBottom: 10,
                    }}
                  >
                    Уведомления в Telegram
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--op-font-body)",
                      fontSize: 14,
                      color: "var(--op-text-secondary)",
                      marginBottom: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    Подключите Telegram — заявки будут приходить мгновенно.
                  </p>
                  <a
                    href="tg://resolve?domain=OptisphereLeadsBot"
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "center", height: 40 }}
                  >
                    Подключить Telegram
                  </a>
                </div>

                {/* Dashboard link */}
                <Link
                  href="/saas/dashboard"
                  style={{
                    fontFamily: "var(--op-font-body)",
                    fontSize: 14,
                    color: "var(--op-text-muted)",
                    textDecoration: "underline",
                    textAlign: "center",
                  }}
                >
                  Перейти в кабинет →
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  )
}
