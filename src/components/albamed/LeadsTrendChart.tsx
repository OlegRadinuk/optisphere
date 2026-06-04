"use client"

import { useState } from "react"

interface DayData { date: string; count: number }

interface Props {
  data: DayData[]
  loading?: boolean
}

// Заявки по дням за последние 30 дней. Заполняет пропуски нулями.
export function LeadsTrendChart({ data, loading }: Props) {
  const [tip, setTip] = useState<{ x: number; y: number; date: string; count: number } | null>(null)

  // Построить непрерывный ряд из 30 дней
  const days: DayData[] = []
  const map = new Map(data.map((d) => [d.date, d.count]))
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    days.push({ date: iso, count: map.get(iso) ?? 0 })
  }

  const svgW = 600, svgH = 140, barArea = 104, pad = 2
  const bw = svgW / days.length
  const max = Math.max(...days.map((d) => d.count), 1)
  const total = days.reduce((s, d) => s + d.count, 0)
  const barH = (c: number) => (c === 0 ? 2 : Math.max(4, (c / max) * barArea))
  const fmt = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
  }

  return (
    <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, padding: 20, marginTop: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 16 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a" }}>Заявки по дням · 30 дней</span>
        <span style={{ fontSize: 12, color: "#999" }}>{total} заявок</span>
      </div>

      {loading ? (
        <div style={{ height: svgH, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite" }} />
      ) : (
        <div style={{ position: "relative" }}>
          <svg viewBox={`0 0 ${svgW} ${svgH}`} width="100%" style={{ height: "auto", display: "block" }}>
            {days.map((d, i) => {
              const h = barH(d.count)
              const x = i * bw + pad
              const y = barArea - h
              const w = bw - pad * 2
              return (
                <rect
                  key={d.date} x={x} y={y} width={w} height={h} rx={2}
                  fill={tip?.date === d.date ? "#e06810" : d.count > 0 ? "#f47920" : "#f0e6dc"}
                  style={{ cursor: d.count > 0 ? "pointer" : "default" }}
                  onMouseEnter={(e) => {
                    const svg = (e.currentTarget as SVGElement).closest("svg")
                    const r = svg?.getBoundingClientRect(); if (!r) return
                    setTip({ x: (x + w / 2) * (r.width / svgW), y: y * (r.height / svgH), date: d.date, count: d.count })
                  }}
                  onMouseLeave={() => setTip(null)}
                />
              )
            })}
            {[0, 7, 14, 21, 29].map((i) => (
              <text key={i} x={i * bw + bw / 2} y={svgH - 2} textAnchor="middle" fill="#bbb" fontSize="10">
                {fmt(days[i].date)}
              </text>
            ))}
          </svg>
          {tip && (
            <div style={{ position: "absolute", left: tip.x, top: Math.max(0, tip.y - 36), transform: "translateX(-50%)", background: "#1a1a1a", borderRadius: 6, padding: "5px 10px", fontSize: 12, color: "#fff", pointerEvents: "none", whiteSpace: "nowrap", zIndex: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.15)" }}>
              {fmt(tip.date)} — {tip.count} {tip.count === 1 ? "заявка" : "заявок"}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
