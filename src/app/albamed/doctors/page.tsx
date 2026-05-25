"use client"

import { useState, useEffect, useCallback } from "react"
import { InlineToggle } from "@/components/albamed/InlineToggle"
import { useToast } from "@/components/albamed/Toast"

type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun"

interface Doctor {
  id: number
  name: string
  specialty: string
  branch: number
  schedule: Record<DayKey, boolean>
  active: boolean
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: "mon", label: "Пн" },
  { key: "tue", label: "Вт" },
  { key: "wed", label: "Ср" },
  { key: "thu", label: "Чт" },
  { key: "fri", label: "Пт" },
  { key: "sat", label: "Сб" },
  { key: "sun", label: "Вс" },
]

const BRANCHES: Record<number, string> = {
  1: "ул. Кантар 9",
  2: "ул. Киевская 153А",
}

export default function DoctorsPage() {
  const { showToast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // track which cells are currently saving: key = `${id}-${day}` or `${id}-active`
  const [saving, setSaving] = useState<Set<string>>(new Set())

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/albamed/doctors")
      if (!r.ok) throw new Error("Ошибка загрузки")
      const { doctors: d } = await r.json() as { doctors: Doctor[] }
      setDoctors(d)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ошибка загрузки. Обновите страницу.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDoctors()
  }, [loadDoctors])

  async function handleDayToggle(doctor: Doctor, day: DayKey, checked: boolean) {
    const key = `${doctor.id}-${day}`
    setSaving((s) => new Set(s).add(key))

    // Optimistic update
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === doctor.id
          ? { ...d, schedule: { ...d.schedule, [day]: checked } }
          : d
      )
    )

    try {
      const r = await fetch("/api/albamed/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctor.id, schedule: { ...doctor.schedule, [day]: checked } }),
      })
      if (!r.ok) throw new Error("Не удалось сохранить")
      showToast("success", "Расписание обновлено")
    } catch {
      // Rollback
      setDoctors((prev) =>
        prev.map((d) =>
          d.id === doctor.id
            ? { ...d, schedule: { ...d.schedule, [day]: !checked } }
            : d
        )
      )
      showToast("error", "Не удалось сохранить")
    } finally {
      setSaving((s) => {
        const next = new Set(s)
        next.delete(key)
        return next
      })
    }
  }

  async function handleActiveToggle(doctor: Doctor, active: boolean) {
    const key = `${doctor.id}-active`
    setSaving((s) => new Set(s).add(key))

    // Optimistic update
    setDoctors((prev) =>
      prev.map((d) => (d.id === doctor.id ? { ...d, active } : d))
    )

    try {
      const r = await fetch("/api/albamed/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctor.id, active }),
      })
      if (!r.ok) throw new Error("Не удалось сохранить")
      showToast("success", active ? "Врач активирован" : "Врач деактивирован")
    } catch {
      // Rollback
      setDoctors((prev) =>
        prev.map((d) => (d.id === doctor.id ? { ...d, active: !active } : d))
      )
      showToast("error", "Не удалось сохранить")
    } finally {
      setSaving((s) => {
        const next = new Set(s)
        next.delete(key)
        return next
      })
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: "0 0 20px" }}>
        Расписание врачей
      </h1>

      <div style={{ overflowX: "auto" }}>
        <div
          style={{
            background: "#1e293b",
            border: "1px solid #334155",
            borderRadius: 8,
            overflow: "hidden",
            minWidth: 800,
          }}
        >
          {error ? (
            <div
              style={{
                padding: 20,
                color: "#ef4444",
                display: "flex",
                gap: 12,
                alignItems: "center",
              }}
            >
              <span>{error}</span>
              <button
                onClick={loadDoctors}
                style={{
                  border: "1px solid #ef4444",
                  color: "#ef4444",
                  borderRadius: 6,
                  padding: "6px 12px",
                  background: "transparent",
                  cursor: "pointer",
                  fontSize: 13,
                  fontFamily: "inherit",
                }}
              >
                Повторить
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0f172a" }}>
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #334155",
                      color: "#94a3b8",
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: 500,
                      width: 180,
                    }}
                  >
                    Врач
                  </th>
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #334155",
                      color: "#94a3b8",
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: 500,
                      width: 160,
                    }}
                  >
                    Специальность
                  </th>
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "left",
                      borderBottom: "1px solid #334155",
                      color: "#94a3b8",
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: 500,
                      width: 140,
                    }}
                  >
                    Филиал
                  </th>
                  {DAYS.map(({ key, label }) => (
                    <th
                      key={key}
                      style={{
                        padding: "10px 8px",
                        textAlign: "center",
                        borderBottom: "1px solid #334155",
                        color: "#94a3b8",
                        fontSize: 12,
                        textTransform: "uppercase",
                        fontWeight: 500,
                        width: 44,
                      }}
                    >
                      {label}
                    </th>
                  ))}
                  <th
                    style={{
                      padding: "10px 16px",
                      textAlign: "center",
                      borderBottom: "1px solid #334155",
                      color: "#94a3b8",
                      fontSize: 12,
                      textTransform: "uppercase",
                      fontWeight: 500,
                      width: 80,
                    }}
                  >
                    Активен
                  </th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[160, 140, 120, 24, 24, 24, 24, 24, 24, 24, 36].map((w, j) => (
                          <td
                            key={j}
                            style={{
                              padding: "12px 16px",
                              borderBottom: "1px solid #334155",
                              textAlign: j >= 3 ? "center" : "left",
                            }}
                          >
                            <div
                              style={{
                                width: w,
                                height: 14,
                                background: "#334155",
                                borderRadius: 4,
                                animation: "pulse 1.5s ease infinite",
                                margin: j >= 3 ? "0 auto" : undefined,
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  : doctors.length === 0
                  ? (
                      <tr>
                        <td
                          colSpan={11}
                          style={{
                            padding: "40px 16px",
                            textAlign: "center",
                            color: "#94a3b8",
                          }}
                        >
                          Врачи не найдены
                        </td>
                      </tr>
                    )
                  : doctors.map((doctor, idx) => (
                      <tr
                        key={doctor.id}
                        style={{
                          transition: "background 150ms",
                          opacity: doctor.active ? 1 : 0.6,
                        }}
                        onMouseEnter={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = "#293548"
                        }}
                        onMouseLeave={(e) => {
                          ;(e.currentTarget as HTMLElement).style.background = "transparent"
                        }}
                      >
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#e2e8f0",
                            borderBottom: idx < doctors.length - 1 ? "1px solid #334155" : "none",
                            fontWeight: 500,
                          }}
                        >
                          {doctor.name}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#94a3b8",
                            borderBottom: idx < doctors.length - 1 ? "1px solid #334155" : "none",
                            fontSize: 13,
                          }}
                        >
                          {doctor.specialty}
                        </td>
                        <td
                          style={{
                            padding: "12px 16px",
                            color: "#94a3b8",
                            borderBottom: idx < doctors.length - 1 ? "1px solid #334155" : "none",
                            fontSize: 13,
                          }}
                        >
                          {BRANCHES[doctor.branch] ?? `Филиал ${doctor.branch}`}
                        </td>
                        {DAYS.map(({ key }) => {
                          const savingKey = `${doctor.id}-${key}`
                          const isChecked = doctor.schedule?.[key] ?? false
                          const isSaving = saving.has(savingKey)
                          return (
                            <td
                              key={key}
                              style={{
                                padding: "12px 8px",
                                textAlign: "center",
                                borderBottom: idx < doctors.length - 1 ? "1px solid #334155" : "none",
                              }}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={isSaving}
                                onChange={(e) =>
                                  handleDayToggle(doctor, key, e.target.checked)
                                }
                                style={{
                                  width: 18,
                                  height: 18,
                                  accentColor: "#3b82f6",
                                  cursor: isSaving ? "not-allowed" : "pointer",
                                  opacity: isSaving ? 0.5 : 1,
                                }}
                              />
                            </td>
                          )
                        })}
                        <td
                          style={{
                            padding: "12px 16px",
                            textAlign: "center",
                            borderBottom: idx < doctors.length - 1 ? "1px solid #334155" : "none",
                          }}
                        >
                          <InlineToggle
                            checked={doctor.active}
                            disabled={saving.has(`${doctor.id}-active`)}
                            onChange={(v) => handleActiveToggle(doctor, v)}
                          />
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
