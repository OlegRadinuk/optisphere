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

  useEffect(() => { loadDoctors() }, [loadDoctors])

  async function handleDayToggle(doctor: Doctor, day: DayKey, checked: boolean) {
    const key = `${doctor.id}-${day}`
    setSaving((s) => new Set(s).add(key))
    setDoctors((prev) => prev.map((d) => d.id === doctor.id ? { ...d, schedule: { ...d.schedule, [day]: checked } } : d))
    try {
      const r = await fetch("/api/albamed/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctor.id, schedule: { ...doctor.schedule, [day]: checked } }),
      })
      if (!r.ok) throw new Error()
      showToast("success", "Расписание обновлено")
    } catch {
      setDoctors((prev) => prev.map((d) => d.id === doctor.id ? { ...d, schedule: { ...d.schedule, [day]: !checked } } : d))
      showToast("error", "Не удалось сохранить")
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(key); return n })
    }
  }

  async function handleActiveToggle(doctor: Doctor, active: boolean) {
    const key = `${doctor.id}-active`
    setSaving((s) => new Set(s).add(key))
    setDoctors((prev) => prev.map((d) => d.id === doctor.id ? { ...d, active } : d))
    try {
      const r = await fetch("/api/albamed/doctors", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctor.id, active }),
      })
      if (!r.ok) throw new Error()
      showToast("success", active ? "Врач активирован" : "Врач деактивирован")
    } catch {
      setDoctors((prev) => prev.map((d) => d.id === doctor.id ? { ...d, active: !active } : d))
      showToast("error", "Не удалось сохранить")
    } finally {
      setSaving((s) => { const n = new Set(s); n.delete(key); return n })
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 6px" }}>Врачи</h1>
      <p style={{ fontSize: 14, color: "#999", margin: "0 0 20px" }}>Расписание и статус активности</p>

      <div style={{ overflowX: "auto" }}>
        <div style={{ background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", minWidth: 800, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          {error ? (
            <div style={{ padding: 20, color: "#ef4444", display: "flex", gap: 12, alignItems: "center" }}>
              <span>{error}</span>
              <button onClick={loadDoctors} style={{ border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "6px 12px", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
                Повторить
              </button>
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#fafafa", borderBottom: "1px solid #e8e8e8" }}>
                  <th style={{ padding: "10px 16px", textAlign: "left", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 180 }}>Врач</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 160 }}>Специальность</th>
                  <th style={{ padding: "10px 16px", textAlign: "left", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 140 }}>Филиал</th>
                  {DAYS.map(({ key, label }) => (
                    <th key={key} style={{ padding: "10px 8px", textAlign: "center", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", width: 44 }}>
                      {label}
                    </th>
                  ))}
                  <th style={{ padding: "10px 16px", textAlign: "center", color: "#999", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 80 }}>Активен</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {[160, 140, 120, 24, 24, 24, 24, 24, 24, 24, 36].map((w, j) => (
                          <td key={j} style={{ padding: "13px 16px", borderBottom: "1px solid #f5f5f5", textAlign: j >= 3 ? "center" : "left" }}>
                            <div style={{ width: w, height: 14, background: "#f0f0f0", borderRadius: 4, animation: "pulse 1.5s ease infinite", margin: j >= 3 ? "0 auto" : undefined }} />
                          </td>
                        ))}
                      </tr>
                    ))
                  : doctors.length === 0
                  ? (
                      <tr>
                        <td colSpan={11} style={{ padding: "50px 16px", textAlign: "center", color: "#bbb" }}>
                          Врачи не найдены
                        </td>
                      </tr>
                    )
                  : doctors.map((doctor, idx) => (
                      <tr
                        key={doctor.id}
                        style={{ transition: "background 150ms", opacity: doctor.active ? 1 : 0.55 }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#fafafa" }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                      >
                        <td style={{ padding: "13px 16px", color: "#1a1a1a", fontWeight: 500, borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {doctor.name}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#555", fontSize: 13, borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {doctor.specialty}
                        </td>
                        <td style={{ padding: "13px 16px", color: "#555", fontSize: 13, borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                          {BRANCHES[doctor.branch] ?? `Филиал ${doctor.branch}`}
                        </td>
                        {DAYS.map(({ key }) => {
                          const savingKey = `${doctor.id}-${key}`
                          const isChecked = doctor.schedule?.[key] ?? false
                          return (
                            <td key={key} style={{ padding: "13px 8px", textAlign: "center", borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                disabled={saving.has(savingKey)}
                                onChange={(e) => handleDayToggle(doctor, key, e.target.checked)}
                                style={{ width: 18, height: 18, accentColor: "#f47920", cursor: saving.has(savingKey) ? "not-allowed" : "pointer", opacity: saving.has(savingKey) ? 0.5 : 1 }}
                              />
                            </td>
                          )
                        })}
                        <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
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
