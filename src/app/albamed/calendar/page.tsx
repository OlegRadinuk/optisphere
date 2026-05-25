"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useToast } from "@/components/albamed/Toast"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ApptStatus = "scheduled" | "confirmed" | "cancelled" | "completed"

interface Doctor {
  id: number
  name: string
  specialty: string
  branch: number
  active: boolean
}

interface Appointment {
  id: number
  patient_name: string
  patient_phone: string
  service: string
  notes: string
  appointment_date: string
  appointment_time: string
  duration_min: number
  status: ApptStatus
  doctor_id: number | null
  lead_id: number | null
  doctor_name?: string
  doctor_specialty?: string
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────
const HOUR_START = 8
const HOUR_END = 20
const HOUR_H = 64 // px per hour
const SLOT_MIN = 30
const DAY_LABELS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"]
const STATUS_LABELS: Record<ApptStatus, string> = {
  scheduled: "Запланирован",
  confirmed: "Подтверждён",
  cancelled: "Отменён",
  completed: "Завершён",
}

const DOCTOR_COLORS = [
  "#f47920", "#2563eb", "#16a34a", "#9333ea", "#dc2626",
  "#0891b2", "#d97706", "#7c3aed", "#059669", "#db2777",
  "#1d4ed8", "#15803d", "#b45309", "#6d28d9", "#0369a1",
  "#047857", "#be123c", "#4338ca", "#0f766e", "#92400e",
  "#7e22ce", "#115e59", "#9f1239",
]

function getDoctorColor(doctorId: number | null): string {
  if (!doctorId) return "#8b96a5"
  return DOCTOR_COLORS[(doctorId - 1) % DOCTOR_COLORS.length]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function getMondayOfWeek(d: Date): Date {
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  const m = new Date(d)
  m.setDate(m.getDate() + diff)
  m.setHours(0, 0, 0, 0)
  return m
}

function formatDateISO(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function parseTime(time: string): number {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

function formatShortDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "short" })
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("ru-RU", { month: "long", year: "numeric" })
}

function isTodayDate(dateStr: string): boolean {
  return dateStr === formatDateISO(new Date())
}

// ─────────────────────────────────────────────
// Modal
// ─────────────────────────────────────────────
interface ModalProps {
  mode: "create" | "edit"
  initial: Partial<Appointment> & { appointment_date: string; appointment_time: string }
  doctors: Doctor[]
  onSave: (data: Partial<Appointment>) => void
  onDelete?: () => void
  onClose: () => void
  saving: boolean
}

const DURATIONS = [15, 30, 45, 60, 90, 120]

function AppointmentModal({ mode, initial, doctors, onSave, onDelete, onClose, saving }: ModalProps) {
  const [form, setForm] = useState({
    patient_name: initial.patient_name ?? "",
    patient_phone: initial.patient_phone ?? "",
    service: initial.service ?? "",
    notes: initial.notes ?? "",
    appointment_date: initial.appointment_date,
    appointment_time: initial.appointment_time,
    duration_min: initial.duration_min ?? 30,
    doctor_id: initial.doctor_id ?? null as number | null,
    status: (initial.status ?? "scheduled") as ApptStatus,
  })

  function set(k: string, v: unknown) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  const inputStyle = {
    width: "100%", border: "1px solid #e8e8e8", borderRadius: 8,
    padding: "8px 12px", fontSize: 14, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box" as const, background: "#fff", color: "#1a1a1a",
  }
  const labelStyle = { fontSize: 12, color: "#999", marginBottom: 4, display: "block" as const }

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={onClose}
    >
      <div
        style={{ background: "#fff", borderRadius: 14, padding: 24, width: "100%", maxWidth: 440, boxShadow: "0 8px 40px rgba(0,0,0,0.18)", maxHeight: "90vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "#1a1a1a", margin: 0 }}>
            {mode === "create" ? "Новая запись" : "Редактировать запись"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#999", padding: 4, lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <label style={labelStyle}>Дата</label>
              <input type="date" value={form.appointment_date} onChange={(e) => set("appointment_date", e.target.value)} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Время</label>
              <input type="time" value={form.appointment_time} onChange={(e) => set("appointment_time", e.target.value)} style={inputStyle} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Врач</label>
            <select
              value={form.doctor_id ?? ""}
              onChange={(e) => set("doctor_id", e.target.value ? Number(e.target.value) : null)}
              style={{ ...inputStyle, cursor: "pointer" }}
            >
              <option value="">— Без врача —</option>
              {doctors.filter((d) => d.active).map((d) => (
                <option key={d.id} value={d.id}>{d.name} ({d.specialty})</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Пациент</label>
            <input
              type="text"
              placeholder="ФИО пациента"
              value={form.patient_name}
              onChange={(e) => set("patient_name", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Телефон</label>
            <input
              type="tel"
              placeholder="+7 (978) 000 00 00"
              value={form.patient_phone}
              onChange={(e) => set("patient_phone", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Услуга / специалист</label>
            <input
              type="text"
              placeholder="УЗИ сердца, консультация терапевта..."
              value={form.service}
              onChange={(e) => set("service", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Длительность</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => set("duration_min", d)}
                  style={{
                    padding: "5px 12px", borderRadius: 6, fontSize: 13, cursor: "pointer",
                    border: form.duration_min === d ? "none" : "1px solid #e8e8e8",
                    background: form.duration_min === d ? "#f47920" : "#fff",
                    color: form.duration_min === d ? "#fff" : "#555",
                    fontFamily: "inherit",
                  }}
                >
                  {d < 60 ? `${d} мин` : `${d / 60} ч`}
                </button>
              ))}
            </div>
          </div>

          {mode === "edit" && (
            <div>
              <label style={labelStyle}>Статус</label>
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value)}
                style={{ ...inputStyle, cursor: "pointer" }}
              >
                {(Object.entries(STATUS_LABELS) as [ApptStatus, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label style={labelStyle}>Заметки</label>
            <textarea
              placeholder="Дополнительная информация..."
              value={form.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={2}
              style={{ ...inputStyle, resize: "vertical" as const }}
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
          <button
            onClick={() => onSave(form)}
            disabled={saving}
            style={{
              flex: 1, padding: "10px 0", background: "#f47920", color: "#fff",
              border: "none", borderRadius: 8, fontSize: 14, fontWeight: 600,
              cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1,
              fontFamily: "inherit",
            }}
          >
            {saving ? "Сохранение..." : mode === "create" ? "Создать запись" : "Сохранить"}
          </button>
          {mode === "edit" && onDelete && (
            <button
              onClick={onDelete}
              disabled={saving}
              style={{
                padding: "10px 16px", background: "#fff", color: "#ef4444",
                border: "1px solid #fca5a5", borderRadius: 8, fontSize: 14,
                cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit",
              }}
            >
              Удалить
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
export default function CalendarPage() {
  const { showToast } = useToast()
  const [weekStart, setWeekStart] = useState<Date>(() => getMondayOfWeek(new Date()))
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Modal state
  type ModalState =
    | { type: "create"; date: string; time: string }
    | { type: "edit"; appt: Appointment }
    | null
  const [modal, setModal] = useState<ModalState>(null)

  // Drag state
  const dragAppt = useRef<Appointment | null>(null)

  // ── Data fetching ──
  const loadWeek = useCallback(async (monday: Date) => {
    setLoading(true)
    try {
      const [apptRes, docRes] = await Promise.all([
        fetch(`/api/albamed/appointments?week=${formatDateISO(monday)}`),
        fetch("/api/albamed/doctors"),
      ])
      if (!apptRes.ok || !docRes.ok) throw new Error()
      const { appointments: a } = await apptRes.json() as { appointments: Appointment[] }
      const { doctors: d } = await docRes.json() as { doctors: Doctor[] }
      setAppointments(a)
      setDoctors(d)
    } catch {
      showToast("error", "Ошибка загрузки календаря")
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { loadWeek(weekStart) }, [weekStart, loadWeek])

  // ── Navigation ──
  function prevWeek() { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d) }
  function nextWeek() { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d) }
  function goToday() { setWeekStart(getMondayOfWeek(new Date())) }

  // ── Week days ──
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return formatDateISO(d)
  })

  // ── CRUD ──
  async function handleCreate(data: Partial<Appointment>) {
    setSaving(true)
    try {
      const r = await fetch("/api/albamed/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!r.ok) throw new Error()
      const { appointment } = await r.json() as { appointment: Appointment }
      setAppointments((prev) => [...prev, appointment])
      setModal(null)
      showToast("success", "Запись создана")
    } catch {
      showToast("error", "Не удалось создать запись")
    } finally {
      setSaving(false)
    }
  }

  async function handleUpdate(id: number, data: Partial<Appointment>) {
    setSaving(true)
    try {
      const r = await fetch("/api/albamed/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...data }),
      })
      if (!r.ok) throw new Error()
      const { appointment } = await r.json() as { appointment: Appointment }
      setAppointments((prev) => prev.map((a) => a.id === id ? appointment : a))
      setModal(null)
      showToast("success", "Запись обновлена")
    } catch {
      showToast("error", "Не удалось обновить запись")
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Удалить запись?")) return
    setSaving(true)
    try {
      const r = await fetch("/api/albamed/appointments", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!r.ok) throw new Error()
      setAppointments((prev) => prev.filter((a) => a.id !== id))
      setModal(null)
      showToast("success", "Запись удалена")
    } catch {
      showToast("error", "Не удалось удалить запись")
    } finally {
      setSaving(false)
    }
  }

  // ── Drag & Drop ──
  function onDragStart(appt: Appointment) {
    dragAppt.current = appt
  }

  async function onDropSlot(date: string, hour: number, quarter: number) {
    const appt = dragAppt.current
    if (!appt) return
    dragAppt.current = null
    const mins = hour * 60 + quarter * 15
    const hh = String(Math.floor(mins / 60)).padStart(2, "0")
    const mm = String(mins % 60).padStart(2, "0")
    const newTime = `${hh}:${mm}`
    if (appt.appointment_date === date && appt.appointment_time === newTime) return
    // Optimistic update
    setAppointments((prev) =>
      prev.map((a) => a.id === appt.id ? { ...a, appointment_date: date, appointment_time: newTime } : a)
    )
    try {
      const r = await fetch("/api/albamed/appointments", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appt.id, appointment_date: date, appointment_time: newTime }),
      })
      if (!r.ok) throw new Error()
    } catch {
      setAppointments((prev) =>
        prev.map((a) => a.id === appt.id ? appt : a)
      )
      showToast("error", "Не удалось перенести запись")
    }
  }

  // ── Render helpers ──
  const hours = Array.from({ length: HOUR_END - HOUR_START }, (_, i) => HOUR_START + i)

  function getApptsByDay(date: string) {
    return appointments.filter((a) => a.appointment_date === date && a.status !== "cancelled")
  }

  function apptTop(time: string): number {
    const totalMins = parseTime(time) - HOUR_START * 60
    return (totalMins / 60) * HOUR_H
  }

  function apptHeight(duration: number): number {
    return Math.max(24, (duration / 60) * HOUR_H - 2)
  }

  const timeLabels = hours.map((h) => `${String(h).padStart(2, "0")}:00`)

  // ── Status dot ──
  const STATUS_DOT: Record<ApptStatus, string> = {
    scheduled: "#f47920",
    confirmed: "#16a34a",
    cancelled: "#ef4444",
    completed: "#9ca3af",
  }

  const totalHoursPx = (HOUR_END - HOUR_START) * HOUR_H

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 80px)", minHeight: 600 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1a1a1a", margin: "0 0 2px" }}>Календарь</h1>
          <p style={{ fontSize: 14, color: "#999", margin: 0 }}>Расписание приёмов</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: 14, color: "#555", fontWeight: 500, minWidth: 180, textAlign: "center" }}>
            {formatMonthYear(weekStart)}
          </span>
          <button onClick={prevWeek} style={navBtnStyle}>← Пред.</button>
          <button onClick={goToday} style={{ ...navBtnStyle, fontWeight: 600, color: "#f47920", borderColor: "#fdd9b5" }}>Сегодня</button>
          <button onClick={nextWeek} style={navBtnStyle}>След. →</button>
          <button
            onClick={() => {
              const today = formatDateISO(new Date())
              const now = new Date()
              const h = String(now.getHours()).padStart(2, "0")
              const m = String(Math.round(now.getMinutes() / 30) * 30 % 60).padStart(2, "0")
              setModal({ type: "create", date: today, time: `${h}:${m}` })
            }}
            style={{
              background: "#f47920", color: "#fff", border: "none",
              borderRadius: 8, padding: "7px 16px", fontSize: 13, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit",
            }}
          >
            + Новая запись
          </button>
        </div>
      </div>

      {/* ── Calendar grid ── */}
      <div style={{ flex: 1, background: "#fff", border: "1px solid #e8e8e8", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column" }}>
        {/* Day headers */}
        <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, 1fr)", borderBottom: "1px solid #e8e8e8", background: "#fafafa", flexShrink: 0 }}>
          <div />
          {weekDays.map((date, i) => (
            <div
              key={date}
              style={{
                padding: "10px 8px",
                textAlign: "center",
                borderLeft: "1px solid #f0f0f0",
                background: isTodayDate(date) ? "#fff4ec" : undefined,
              }}
            >
              <div style={{ fontSize: 11, color: "#999", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>
                {DAY_LABELS[i]}
              </div>
              <div style={{
                fontSize: 15, fontWeight: 600,
                color: isTodayDate(date) ? "#f47920" : "#1a1a1a",
                lineHeight: 1,
              }}>
                {formatShortDate(date)}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable grid body */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "auto" }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 300, color: "#bbb", fontSize: 14 }}>
              <div style={{ width: 24, height: 24, border: "3px solid #f47920", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", marginRight: 10 }} />
              Загрузка...
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "52px repeat(7, minmax(100px, 1fr))", position: "relative" }}>
              {/* Time labels column */}
              <div>
                {hours.map((h) => (
                  <div key={h} style={{ height: HOUR_H, borderBottom: "1px solid #f5f5f5", display: "flex", alignItems: "flex-start", justifyContent: "flex-end", paddingRight: 8, paddingTop: 4 }}>
                    <span style={{ fontSize: 11, color: "#bbb", whiteSpace: "nowrap" }}>{String(h).padStart(2, "0")}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((date) => {
                const dayAppts = getApptsByDay(date)
                return (
                  <div
                    key={date}
                    style={{
                      position: "relative",
                      borderLeft: "1px solid #f0f0f0",
                      background: isTodayDate(date) ? "rgba(244,121,32,0.02)" : undefined,
                    }}
                  >
                    {/* Hour rows with drop targets */}
                    {hours.map((h) =>
                      [0, 1].map((q) => (
                        <div
                          key={`${h}-${q}`}
                          style={{
                            height: HOUR_H / 2,
                            borderBottom: q === 0 ? "1px dashed #f5f5f5" : "1px solid #f5f5f5",
                            cursor: "cell",
                          }}
                          onDragOver={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = "rgba(244,121,32,0.08)" }}
                          onDragLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "" }}
                          onDrop={(e) => { e.preventDefault(); (e.currentTarget as HTMLElement).style.background = ""; onDropSlot(date, h, q * 2) }}
                          onClick={() => setModal({ type: "create", date, time: `${String(h).padStart(2, "0")}:${q === 0 ? "00" : "30"}` })}
                        />
                      ))
                    )}

                    {/* Appointments */}
                    {dayAppts.map((appt) => {
                      const top = apptTop(appt.appointment_time)
                      const height = apptHeight(appt.duration_min)
                      const color = getDoctorColor(appt.doctor_id)
                      const isCancelled = appt.status === "cancelled"
                      const isCompleted = appt.status === "completed"
                      return (
                        <div
                          key={appt.id}
                          draggable
                          onDragStart={() => onDragStart(appt)}
                          onClick={(e) => { e.stopPropagation(); setModal({ type: "edit", appt }) }}
                          style={{
                            position: "absolute",
                            top,
                            left: 2,
                            right: 2,
                            height,
                            background: `${color}18`,
                            border: `1.5px solid ${color}`,
                            borderLeft: `3px solid ${color}`,
                            borderRadius: 6,
                            padding: "3px 6px",
                            cursor: "pointer",
                            overflow: "hidden",
                            boxSizing: "border-box",
                            opacity: isCancelled ? 0.45 : isCompleted ? 0.7 : 1,
                            zIndex: 1,
                            userSelect: "none",
                          }}
                          title={`${appt.appointment_time} ${appt.patient_name || "Без имени"} — ${appt.doctor_name || "Без врача"}`}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: STATUS_DOT[appt.status], flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {appt.appointment_time}
                            </span>
                          </div>
                          {height > 28 && (
                            <div style={{ fontSize: 11, color: "#1a1a1a", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {appt.patient_name || "Без имени"}
                            </div>
                          )}
                          {height > 44 && appt.doctor_name && (
                            <div style={{ fontSize: 10, color: "#888", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {appt.doctor_name}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Legend ── */}
      {doctors.length > 0 && (
        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: 12, color: "#999" }}>Врачи:</span>
          {doctors.filter((d) => d.active).slice(0, 12).map((d) => (
            <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#555" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: getDoctorColor(d.id), flexShrink: 0 }} />
              {d.name.split(" ")[0]}
            </div>
          ))}
        </div>
      )}

      {/* ── Modal ── */}
      {modal && (
        <AppointmentModal
          mode={modal.type === "create" ? "create" : "edit"}
          initial={
            modal.type === "create"
              ? { appointment_date: modal.date, appointment_time: modal.time }
              : modal.appt
          }
          doctors={doctors}
          saving={saving}
          onClose={() => setModal(null)}
          onSave={(data) => {
            if (modal.type === "create") handleCreate(data)
            else handleUpdate(modal.appt.id, data)
          }}
          onDelete={modal.type === "edit" ? () => handleDelete(modal.appt.id) : undefined}
        />
      )}

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

const navBtnStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e8e8e8",
  color: "#555",
  borderRadius: 8,
  padding: "7px 14px",
  fontSize: 13,
  cursor: "pointer",
  fontFamily: "inherit",
}
