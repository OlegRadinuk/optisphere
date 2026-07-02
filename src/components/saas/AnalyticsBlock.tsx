"use client"

import { useEffect, useRef, useState } from "react"
import { MOCK_ANALYTICS } from "./mock-data"

type PeriodTab = "7 дней" | "30 дней" | "3 месяца"

export default function AnalyticsBlock() {
  const [period, setPeriod] = useState<PeriodTab>("7 дней")
  const [barsVisible, setBarsVisible] = useState(false)
  const barsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setBarsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 },
    )
    if (barsRef.current) observer.observe(barsRef.current)
    return () => observer.disconnect()
  }, [])

  const periods: PeriodTab[] = ["7 дней", "30 дней", "3 месяца"]

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <h1 style={{ fontFamily: "var(--op-font-display)", fontSize: 22, fontWeight: 700, color: "var(--op-text)", marginBottom: 4 }}>Аналитика</h1>
        <p style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)" }}>
          Эффективность AI-ассистента
        </p>
      </div>

      {/* Period tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--op-border)", gap: 0 }}>
        {periods.map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: "8px 16px",
              background: "transparent",
              border: "none",
              borderBottom: period === p ? "2px solid var(--op-accent)" : "2px solid transparent",
              fontFamily: "var(--op-font-body)",
              fontSize: 14,
              color: period === p ? "var(--op-text)" : "var(--op-text-secondary)",
              fontWeight: period === p ? 600 : 400,
              marginBottom: -1,
              transition: "color 160ms, border-color 160ms",
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Leads block */}
      <div
        style={{
          background: "var(--op-surface)",
          border: "1px solid var(--op-border)",
          borderRadius: 12,
          padding: "24px",
        }}
      >
        <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Заявки · {period}
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 48, fontWeight: 700, color: "var(--op-text)", lineHeight: 1 }}>
            {MOCK_ANALYTICS.totalLeads}
          </div>
          <div style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "#4ade80" }}>
            ↑ {MOCK_ANALYTICS.trend} к прошлой неделе
          </div>
        </div>

        {/* CSS bars chart */}
        <div
          ref={barsRef}
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 6,
            height: 80,
            marginTop: 16,
          }}
          aria-label="График заявок за неделю"
        >
          {MOCK_ANALYTICS.chartHeights.map((h, i) => (
            <div
              key={i}
              style={{
                flex: 1,
                background: "var(--op-accent)",
                borderRadius: "3px 3px 0 0",
                height: barsVisible ? `${h}%` : "0%",
                transition: `height 0.6s cubic-bezier(0.22,1,0.36,1) ${i * 60}ms`,
                minHeight: 4,
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
          {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
            <div key={d} style={{ flex: 1, textAlign: "center", fontFamily: "var(--op-font-body)", fontSize: 11, color: "var(--op-text-muted)" }}>
              {d}
            </div>
          ))}
        </div>
      </div>

      {/* Service time */}
      <div
        style={{
          background: "var(--op-surface)",
          border: "1px solid var(--op-border)",
          borderRadius: 12,
          padding: "24px",
        }}
      >
        <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Скорость обработки
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
          <div>
            <div style={{ fontFamily: "var(--op-font-body)", fontSize: 13, color: "var(--op-text-muted)", marginBottom: 6 }}>
              Среднее время ответа AI
            </div>
            <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 28, fontWeight: 700, color: "var(--op-text)" }}>
              {MOCK_ANALYTICS.avgAiResponseTime}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--op-font-body)", fontSize: 13, color: "var(--op-text-muted)", marginBottom: 6 }}>
              Время до закрытия заявки
            </div>
            <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 28, fontWeight: 700, color: "var(--op-text)" }}>
              {MOCK_ANALYTICS.avgCloseTime}
            </div>
          </div>
        </div>
      </div>

      {/* Conversion */}
      <div
        style={{
          background: "var(--op-surface)",
          border: "1px solid var(--op-border)",
          borderRadius: 12,
          padding: "24px",
        }}
      >
        <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 11, color: "var(--op-text-muted)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 16 }}>
          Конверсия
        </div>
        <div style={{ fontFamily: "var(--op-font-mono)", fontSize: 40, fontWeight: 700, color: "var(--op-accent)", marginBottom: 6 }}>
          {MOCK_ANALYTICS.conversionRate}%
        </div>
        <div style={{ fontFamily: "var(--op-font-body)", fontSize: 14, color: "var(--op-text-secondary)", marginBottom: 4 }}>
          {MOCK_ANALYTICS.totalLeads} заявки из {MOCK_ANALYTICS.totalDialogs} диалогов
        </div>
        <div style={{ fontFamily: "var(--op-font-body)", fontSize: 13, color: "var(--op-text-muted)" }}>
          Пациент написал → оставил контакт
        </div>
      </div>

      {/* Upsell */}
      <div
        style={{
          background: "linear-gradient(135deg, rgba(232,32,32,0.1), rgba(255,74,74,0.05))",
          border: "1px solid rgba(232,32,32,0.25)",
          borderRadius: 12,
          padding: "20px 24px",
        }}
      >
        <h3
          style={{
            fontFamily: "var(--op-font-display)",
            fontSize: 18,
            fontWeight: 700,
            color: "var(--op-text)",
            marginBottom: 8,
          }}
        >
          Хотите запись прямо в вашу МИС?
        </h3>
        <p
          style={{
            fontFamily: "var(--op-font-body)",
            fontSize: 14,
            color: "var(--op-text-secondary)",
            lineHeight: 1.6,
            marginBottom: 16,
          }}
        >
          Интеграция с МедФлекс / 1С — данные уходят в вашу систему автоматически.
          Настраивается вместе с нами.
        </p>
        <a
          href="https://t.me/optisphere"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
          style={{ height: 44, padding: "0 24px", fontSize: 14 }}
        >
          Обсудить интеграцию
        </a>
      </div>
    </div>
  )
}
