"use client"

import { useState, useEffect, useCallback } from "react"
import { InlineToggle } from "@/components/estet/InlineToggle"
import { useToast } from "@/components/estet/Toast"

const PRIMARY = "#0D9488"

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
  1: "Жигулина Роща",
}

// API returns schedule as a JSON string and active as 0/1 — normalize to typed shape
function normalizeDoctor(raw: unknown): Doctor {
  const d = raw as { id: number; name: string; specialty: string; branch: number; schedule: string | Record<DayKey, boolean>; active: number | boolean }
  return {
    id: d.id,
    name: d.name,
    specialty: d.specialty,
    branch: d.branch,
    schedule: typeof d.schedule === "string" ? JSON.parse(d.schedule) : d.schedule,
    active: !!d.active,
  }
}

export default function EstetDoctorsPage() {
  const { showToast } = useToast()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<Set<string>>(new Set())
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({ name: "", specialty: "" })
  const [creating, setCreating] = useState(false)

  async function handleCreate() {
    if (!form.name.trim()) return
    setCreating(true)
    try {
      const r = await fetch("/api/estet/doctors", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), specialty: form.specialty.trim() }),
      })
      if (!r.ok) throw new Error()
      const { doctor } = await r.json() as { doctor: unknown }
      setDoctors((prev) => [...prev, normalizeDoctor(doctor)])
      setForm({ name: "", specialty: "" })
      setAdding(false)
      showToast("success", "Врач добавлен")
    } catch {
      showToast("error", "Не удалось добавить врача")
    } finally {
      setCreating(false)
    }
  }

  const loadDoctors = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const r = await fetch("/api/estet/doctors")
      if (!r.ok) throw new Error("Ошибка загрузки")
      const { doctors: d } = await r.json() as { doctors: unknown[] }
      setDoctors(d.map(normalizeDoctor))
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
      const r = await fetch("/api/estet/doctors", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
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
      const r = await fetch("/api/estet/doctors", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: doctor.id, active: active ? 1 : 0 }),
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

  const errorBlock = error ? (
    <div style={{ padding: 20, color: "#ef4444", display: "flex", gap: 12, alignItems: "center", background: "#fff", borderRadius: 10, border: "1px solid #e8e8e8" }}>
      <span>{error}</span>
      <button onClick={loadDoctors} style={{ border: "1px solid #ef4444", color: "#ef4444", borderRadius: 6, padding: "6px 12px", background: "transparent", cursor: "pointer", fontSize: 13, fontFamily: "inherit" }}>
        Повторить
      </button>
    </div>
  ) : null

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-oxanium)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.3px", color: "#0F172A", margin: "0 0 6px" }}>Врачи</h1>
          <p style={{ fontSize: 14, color: "#94A3B8", margin: 0 }}>Расписание и статус активности</p>
        </div>
        <button onClick={() => setAdding(true)} style={{ background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(13,148,136,0.3)", whiteSpace: "nowrap" }}>+ Врач</button>
      </div>

      {adding && (
        <div onClick={() => !creating && setAdding(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,40,70,0.35)", zIndex: 1000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "16px 16px 0 0", padding: 24, width: "100%", maxWidth: 460, boxShadow: "0 -4px 32px rgba(15,40,70,0.18)" }}>
            <div style={{ width: 36, height: 4, background: "#e0e0e0", borderRadius: 2, margin: "0 auto 18px" }} />
            <h2 style={{ fontFamily: "var(--font-oxanium)", fontSize: 18, fontWeight: 700, color: "#0F172A", margin: "0 0 16px" }}>Новый врач</h2>
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 4 }}>ФИО</label>
            <input autoFocus value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Иванов Иван Иванович"
              style={{ width: "100%", border: "1px solid #CBD5E1", borderRadius: 8, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 12 }} />
            <label style={{ fontSize: 12, color: "#94A3B8", display: "block", marginBottom: 4 }}>Специальность</label>
            <input value={form.specialty} onChange={(e) => setForm((f) => ({ ...f, specialty: e.target.value }))} placeholder="Терапевт-стоматолог"
              style={{ width: "100%", border: "1px solid #CBD5E1", borderRadius: 8, padding: "10px 12px", fontSize: 16, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 18 }} />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={handleCreate} disabled={creating || !form.name.trim()} style={{ flex: 1, padding: "12px 0", background: PRIMARY, color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 600, cursor: creating || !form.name.trim() ? "not-allowed" : "pointer", opacity: creating || !form.name.trim() ? 0.6 : 1, fontFamily: "inherit" }}>
                {creating ? "Сохранение..." : "Добавить"}
              </button>
              <button onClick={() => setAdding(false)} disabled={creating} style={{ padding: "12px 18px", background: "#fff", color: "#475569", border: "1px solid #E2E8F0", borderRadius: 10, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}>Отмена</button>
            </div>
            <p style={{ fontSize: 12, color: "#94A3B8", margin: "12px 0 0", textAlign: "center" }}>График по умолчанию — пн–пт. Настроите после добавления.</p>
          </div>
        </div>
      )}

      {errorBlock}

      {!error && (
        <>
          {/* Desktop table */}
          <div className="es-doctors-table" style={{ overflowX: "auto" }}>
            <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, overflow: "hidden", minWidth: 800, boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#F1F5F9", borderBottom: "1px solid #E2E8F0" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 200 }}>Врач</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 180 }}>Специальность</th>
                    {DAYS.map(({ key, label }) => (
                      <th key={key} style={{ padding: "10px 8px", textAlign: "center", color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", width: 44 }}>{label}</th>
                    ))}
                    <th style={{ padding: "10px 16px", textAlign: "center", color: "#94A3B8", fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em", width: 80 }}>Активен</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          {[180, 160, 24, 24, 24, 24, 24, 24, 24, 36].map((w, j) => (
                            <td key={j} style={{ padding: "13px 16px", borderBottom: "1px solid #f5f5f5", textAlign: j >= 2 ? "center" : "left" }}>
                              <div style={{ width: w, height: 14, background: "#E2E8F0", borderRadius: 4, animation: "pulse 1.5s ease infinite", margin: j >= 2 ? "0 auto" : undefined }} />
                            </td>
                          ))}
                        </tr>
                      ))
                    : doctors.length === 0
                    ? (
                        <tr><td colSpan={10} style={{ padding: "50px 16px", textAlign: "center", color: "#bbb" }}>Врачи не найдены</td></tr>
                      )
                    : doctors.map((doctor, idx) => (
                        <tr key={doctor.id} style={{ transition: "background 150ms", opacity: doctor.active ? 1 : 0.55 }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#F1F5F9" }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent" }}
                        >
                          <td style={{ padding: "13px 16px", color: "#0F172A", fontWeight: 500, borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>{doctor.name}</td>
                          <td style={{ padding: "13px 16px", color: "#475569", fontSize: 13, borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>{doctor.specialty}</td>
                          {DAYS.map(({ key }) => {
                            const savingKey = `${doctor.id}-${key}`
                            const isChecked = doctor.schedule?.[key] ?? false
                            return (
                              <td key={key} style={{ padding: "13px 8px", textAlign: "center", borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                                <input type="checkbox" checked={isChecked} disabled={saving.has(savingKey)}
                                  onChange={(e) => handleDayToggle(doctor, key, e.target.checked)}
                                  style={{ width: 18, height: 18, accentColor: PRIMARY, cursor: saving.has(savingKey) ? "not-allowed" : "pointer", opacity: saving.has(savingKey) ? 0.5 : 1 }}
                                />
                              </td>
                            )
                          })}
                          <td style={{ padding: "13px 16px", textAlign: "center", borderBottom: idx < doctors.length - 1 ? "1px solid #f5f5f5" : "none" }}>
                            <InlineToggle checked={doctor.active} disabled={saving.has(`${doctor.id}-active`)} onChange={(v) => handleActiveToggle(doctor, v)} />
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="es-doctors-cards" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "16px", animation: "pulse 1.5s ease infinite" }}>
                    <div style={{ width: "60%", height: 16, background: "#E2E8F0", borderRadius: 4, marginBottom: 8 }} />
                    <div style={{ width: "40%", height: 12, background: "#E2E8F0", borderRadius: 4 }} />
                  </div>
                ))
              : doctors.length === 0
              ? (
                  <div style={{ textAlign: "center", padding: "40px 16px", color: "#bbb", background: "#fff", borderRadius: 10, border: "1px solid #E2E8F0" }}>Врачи не найдены</div>
                )
              : doctors.map((doctor) => (
                  <div key={doctor.id} style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 10, padding: "16px", boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.05)", opacity: doctor.active ? 1 : 0.6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600, color: "#0F172A", marginBottom: 2 }}>{doctor.name}</div>
                        <div style={{ fontSize: 13, color: "#64748B" }}>{doctor.specialty}</div>
                        <div style={{ fontSize: 12, color: "#aaa", marginTop: 2 }}>{BRANCHES[doctor.branch] ?? `Филиал ${doctor.branch}`}</div>
                      </div>
                      <InlineToggle checked={doctor.active} disabled={saving.has(`${doctor.id}-active`)} onChange={(v) => handleActiveToggle(doctor, v)} />
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#bbb", marginRight: 2 }}>График:</span>
                      {DAYS.map(({ key, label }) => {
                        const savingKey = `${doctor.id}-${key}`
                        const isChecked = doctor.schedule?.[key] ?? false
                        return (
                          <button key={key} disabled={saving.has(savingKey)} onClick={() => handleDayToggle(doctor, key, !isChecked)}
                            style={{
                              width: 34, height: 34, borderRadius: 8, border: "none",
                              background: isChecked ? PRIMARY : "#F1F5F9",
                              color: isChecked ? "#fff" : "#999",
                              fontSize: 11, fontWeight: 600,
                              cursor: saving.has(savingKey) ? "not-allowed" : "pointer",
                              opacity: saving.has(savingKey) ? 0.5 : 1,
                              fontFamily: "inherit", WebkitTapHighlightColor: "transparent",
                            }}>
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .es-doctors-table { display: block; }
        .es-doctors-cards { display: none !important; }
        @media (max-width: 767px) {
          .es-doctors-table { display: none !important; }
          .es-doctors-cards { display: flex !important; }
        }
      `}</style>
    </div>
  )
}
