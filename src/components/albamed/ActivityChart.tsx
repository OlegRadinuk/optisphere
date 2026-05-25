"use client"

import { useState } from "react"

interface HourData {
  hour: number
  count: number
}

interface ActivityChartProps {
  data: HourData[]
  loading?: boolean
}

export function ActivityChart({ data, loading }: ActivityChartProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; hour: number; count: number } | null>(null)

  const svgWidth = 600
  const svgHeight = 120
  const barAreaHeight = 90
  const barCount = 24
  const barWidth = svgWidth / barCount
  const padding = 3

  const maxCount = Math.max(...data.map((d) => d.count), 1)

  const getBarHeight = (count: number) =>
    count === 0 ? 2 : Math.max(4, (count / maxCount) * barAreaHeight)

  const isEmpty = data.every((d) => d.count === 0)

  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: 20,
        marginTop: 16,
        position: "relative",
      }}
    >
      <div style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0", marginBottom: 16 }}>
        Активность за сегодня
      </div>

      {loading ? (
        <div
          style={{
            height: svgHeight,
            background: "#334155",
            borderRadius: 4,
            animation: "pulse 1.5s ease infinite",
          }}
        />
      ) : (
        <div style={{ position: "relative" }}>
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            width="100%"
            style={{ height: "auto", display: "block" }}
          >
            {isEmpty ? (
              <text
                x={svgWidth / 2}
                y={svgHeight / 2}
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="13"
              >
                Нет активности за сегодня
              </text>
            ) : (
              <>
                {data.map((d) => {
                  const barH = getBarHeight(d.count)
                  const x = d.hour * barWidth + padding
                  const y = barAreaHeight - barH
                  const w = barWidth - padding * 2
                  return (
                    <rect
                      key={d.hour}
                      x={x}
                      y={y}
                      width={w}
                      height={barH}
                      rx={2}
                      fill={tooltip?.hour === d.hour ? "#60a5fa" : "#3b82f6"}
                      style={{ cursor: d.count > 0 ? "pointer" : "default" }}
                      onMouseEnter={(e) => {
                        if (d.count === 0) return
                        const rect = (e.currentTarget as SVGElement)
                          .closest("div")
                          ?.getBoundingClientRect()
                        const svgEl = (e.currentTarget as SVGElement).closest("svg")
                        const svgRect = svgEl?.getBoundingClientRect()
                        if (!svgRect) return
                        const svgScaleX = svgRect.width / svgWidth
                        const barCenterX = (x + w / 2) * svgScaleX
                        const barTopY = y * (svgRect.height / svgHeight)
                        setTooltip({
                          x: barCenterX,
                          y: barTopY,
                          hour: d.hour,
                          count: d.count,
                        })
                        void rect
                      }}
                      onMouseLeave={() => setTooltip(null)}
                    />
                  )
                })}
                {/* X axis labels for even hours */}
                {[0, 4, 8, 12, 16, 20].map((h) => (
                  <text
                    key={h}
                    x={h * barWidth + barWidth / 2}
                    y={svgHeight - 2}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="10"
                  >
                    {String(h).padStart(2, "0")}
                  </text>
                ))}
              </>
            )}
          </svg>

          {tooltip !== null && (
            <div
              style={{
                position: "absolute",
                left: tooltip.x,
                top: Math.max(0, tooltip.y - 36),
                transform: "translateX(-50%)",
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: 6,
                padding: "4px 8px",
                fontSize: 12,
                color: "#e2e8f0",
                pointerEvents: "none",
                whiteSpace: "nowrap",
                zIndex: 10,
              }}
            >
              {String(tooltip.hour).padStart(2, "0")}:00 — {tooltip.count} диалогов
            </div>
          )}
        </div>
      )}
    </div>
  )
}
