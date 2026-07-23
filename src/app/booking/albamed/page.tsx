"use client"

import { useState, useEffect, useCallback } from "react"

// ── Types ──────────────────────────────────────────────────────────────────────

interface PublicDoctor {
  id: number
  name: string
  specialty: string
  branch: number
  photo_url: string | null
  appointment_price: string | null
  speciality_ids?: number[]
}

/** Один доступный слот — объект из /api/booking/albamed/slots. */
interface AvailableSlot {
  time: string          // "HH:MM" для отображения
  dtStart?: string      // "YYYY-MM-DD HH:MM"
  dtEnd?: string        // "YYYY-MM-DD HH:MM"
  specialityId?: number
  price?: number
  lpuId?: number
}

type Step = "doctor" | "date" | "time" | "contact" | "success"

interface BookingState {
  doctor: PublicDoctor | null
  date: string | null
  time: string | null
  slot: AvailableSlot | null
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase()
}

// Deterministic color per doctor name (soft medical palette)
const AVATAR_COLORS = [
  "#0284c7", // blue
  "#0d9488", // teal
  "#7c3aed", // violet
  "#059669", // emerald
  "#0891b2", // cyan
  "#4f46e5", // indigo
  "#0369a1", // dark blue
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getDayLabel(dateStr: string): { dow: string; day: number } {
  const d = new Date(dateStr + "T00:00:00")
  const dow = d.toLocaleDateString("ru-RU", { weekday: "short" })
  return { dow: dow.replace(".", ""), day: d.getDate() }
}

function generate14Days(): string[] {
  const days: string[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 14; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

// Russian phone mask: +7 (XXX) XXX-XX-XX
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "")
  // Normalise leading 8 → 7
  const normalised = digits.startsWith("8")
    ? "7" + digits.slice(1)
    : digits.startsWith("7")
    ? digits
    : digits.length > 0
    ? "7" + digits
    : digits
  const d = normalised.slice(1, 11) // up to 10 digits after country code

  let result = "+7"
  if (d.length > 0) result += " (" + d.slice(0, 3)
  if (d.length >= 3) result += ") " + d.slice(3, 6)
  if (d.length >= 6) result += "-" + d.slice(6, 8)
  if (d.length >= 8) result += "-" + d.slice(8, 10)
  return result
}

function isPhoneValid(phone: string): boolean {
  const digits = phone.replace(/\D/g, "")
  const normalised = digits.startsWith("8")
    ? "7" + digits.slice(1)
    : digits.startsWith("7")
    ? digits
    : "7" + digits
  return normalised.length === 11
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function StepIndicator({
  current,
  canGoTo,
  onNavigate,
}: {
  current: Step
  canGoTo: (step: Step) => boolean
  onNavigate: (step: Step) => void
}) {
  const steps: { key: Step; label: string }[] = [
    { key: "doctor", label: "Врач" },
    { key: "date", label: "Дата" },
    { key: "time", label: "Время" },
    { key: "contact", label: "Контакт" },
  ]

  const currentIndex = steps.findIndex((s) => s.key === current)

  if (current === "success") return null

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "0 0 24px",
        overflowX: "auto",
      }}
    >
      {steps.map((step, idx) => {
        const isDone = idx < currentIndex
        const isActive = step.key === current
        const isClickable = isDone && canGoTo(step.key)

        return (
          <div
            key={step.key}
            style={{ display: "flex", alignItems: "center", flex: idx < steps.length - 1 ? 1 : "none" }}
          >
            <button
              type="button"
              onClick={isClickable ? () => onNavigate(step.key) : undefined}
              disabled={!isClickable && !isActive}
              aria-current={isActive ? "step" : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "none",
                border: "none",
                cursor: isClickable ? "pointer" : "default",
                padding: "4px 2px",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  background: isActive
                    ? "#e0502e"
                    : isDone
                    ? "#0d9488"
                    : "#e5e7eb",
                  color: isActive || isDone ? "#fff" : "#9ca3af",
                  flexShrink: 0,
                  transition: "background 0.2s",
                }}
              >
                {isDone ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  idx + 1
                )}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#e0502e" : isDone ? "#374151" : "#9ca3af",
                  whiteSpace: "nowrap",
                }}
              >
                {step.label}
              </span>
            </button>
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: isDone ? "#0d9488" : "#e5e7eb",
                  margin: "0 6px",
                  borderRadius: 1,
                  minWidth: 16,
                  transition: "background 0.2s",
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

function DoctorAvatar({
  doctor,
  size = 56,
}: {
  doctor: PublicDoctor
  size?: number
}) {
  const [imgError, setImgError] = useState(false)

  if (doctor.photo_url && !imgError) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={doctor.photo_url}
        alt={doctor.name}
        onError={() => setImgError(true)}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    )
  }

  const color = getAvatarColor(doctor.name)
  return (
    <div
      aria-label={`Аватар ${doctor.name}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: size * 0.31,
        fontWeight: 700,
        flexShrink: 0,
        userSelect: "none",
      }}
    >
      {getInitials(doctor.name)}
    </div>
  )
}

// ── Skeleton loaders ───────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div
      style={{
        border: "1.5px solid #e5e7eb",
        borderRadius: 14,
        padding: "16px 14px",
        display: "flex",
        gap: 12,
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#e5e7eb",
          flexShrink: 0,
          animation: "bkPulse 1.4s ease infinite",
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            height: 15,
            background: "#e5e7eb",
            borderRadius: 6,
            marginBottom: 8,
            width: "70%",
            animation: "bkPulse 1.4s ease infinite",
          }}
        />
        <div
          style={{
            height: 13,
            background: "#e5e7eb",
            borderRadius: 6,
            width: "50%",
            animation: "bkPulse 1.4s ease infinite",
          }}
        />
      </div>
    </div>
  )
}

// ── Step 1: Doctor selection ───────────────────────────────────────────────────

function StepDoctor({
  onSelect,
}: {
  onSelect: (doctor: PublicDoctor) => void
}) {
  const [doctors, setDoctors] = useState<PublicDoctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")

  useEffect(() => {
    fetch("/api/booking/albamed/doctors")
      .then((r) => {
        if (!r.ok) throw new Error("Не удалось загрузить список врачей")
        return r.json() as Promise<{ doctors: PublicDoctor[] }>
      })
      .then((d) => {
        setDoctors(d.doctors)
        setLoading(false)
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : "Ошибка загрузки")
        setLoading(false)
      })
  }, [])

  const filtered = query.trim()
    ? doctors.filter(
        (d) =>
          d.name.toLowerCase().includes(query.toLowerCase()) ||
          d.specialty.toLowerCase().includes(query.toLowerCase())
      )
    : doctors

  if (error) {
    return (
      <div
        style={{
          background: "#fef2f2",
          border: "1px solid #fca5a5",
          borderRadius: 10,
          padding: "14px 16px",
          color: "#b91c1c",
          fontSize: 14,
        }}
      >
        {error}
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>
        Выберите врача
      </h2>
      <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 16px" }}>
        Запись онлайн — администратор подтвердит время
      </p>

      {/* Search */}
      <div style={{ position: "relative", marginBottom: 16 }}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#9ca3af"
          strokeWidth="2"
          style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }}
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="search"
          placeholder="Поиск по имени или специальности"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Поиск врача"
          style={{
            width: "100%",
            boxSizing: "border-box",
            padding: "10px 12px 10px 38px",
            border: "1.5px solid #d1d5db",
            borderRadius: 10,
            fontSize: 14,
            outline: "none",
            background: "#fff",
            color: "#111827",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#e0502e"
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db"
          }}
        />
      </div>

      {/* Doctor grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 10,
        }}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : filtered.length === 0
          ? (
            <p style={{ gridColumn: "1 / -1", color: "#6b7280", fontSize: 14, padding: "16px 0", lineHeight: 1.5 }}>
              {query
                ? "Ничего не найдено"
                : "Онлайн-запись сейчас недоступна. Оставьте имя и телефон ниже — администратор перезвонит и запишет вас."}
            </p>
          )
          : filtered.map((doctor) => (
            <button
              key={doctor.id}
              type="button"
              onClick={() => onSelect(doctor)}
              style={{
                display: "flex",
                gap: 12,
                alignItems: "center",
                background: "#fff",
                border: "1.5px solid #e5e7eb",
                borderRadius: 14,
                padding: "14px 14px",
                cursor: "pointer",
                textAlign: "left",
                transition: "border-color 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#e0502e"
                e.currentTarget.style.boxShadow = "0 2px 12px rgba(224,80,46,0.14)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.boxShadow = "none"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#e0502e"
                e.currentTarget.style.outline = "2px solid #f5c4b2"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.outline = "none"
              }}
              aria-label={`Записаться к ${doctor.name}`}
            >
              <DoctorAvatar doctor={doctor} size={52} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#111827",
                    lineHeight: 1.35,
                    marginBottom: 3,
                  }}
                >
                  {doctor.name}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: "#6b7280",
                    lineHeight: 1.3,
                    marginBottom: doctor.appointment_price ? 6 : 0,
                  }}
                >
                  {doctor.specialty}
                </div>
                {doctor.appointment_price && (
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 600,
                      color: "#0d9488",
                    }}
                  >
                    {doctor.appointment_price}
                  </div>
                )}
              </div>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#d1d5db"
                strokeWidth="2"
                style={{ flexShrink: 0 }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ))}
      </div>
    </div>
  )
}

// ── Step 2: Date selection ─────────────────────────────────────────────────────

function StepDate({
  doctor,
  onSelect,
  onBack,
}: {
  doctor: PublicDoctor
  onSelect: (date: string) => void
  onBack: () => void
}) {
  const days = generate14Days()
  const today = days[0]

  const ruMonths: Record<number, string> = {
    0: "января", 1: "февраля", 2: "марта", 3: "апреля",
    4: "мая", 5: "июня", 6: "июля", 7: "августа",
    8: "сентября", 9: "октября", 10: "ноября", 11: "декабря",
  }

  return (
    <div>
      <BackButton onClick={onBack} />
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>
        Выберите дату
      </h2>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <DoctorAvatar doctor={doctor} size={32} />
        <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
          {doctor.name}
        </span>
      </div>

      {/* Horizontal date strip — scrollable on mobile */}
      <div
        style={{
          display: "flex",
          gap: 8,
          overflowX: "auto",
          paddingBottom: 8,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
        role="group"
        aria-label="Выбор даты"
      >
        {days.map((dateStr) => {
          const { dow, day } = getDayLabel(dateStr)
          const d = new Date(dateStr + "T00:00:00")
          const month = ruMonths[d.getMonth()]
          const isToday = dateStr === today

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelect(dateStr)}
              aria-label={`${dow}, ${day} ${month}`}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minWidth: 58,
                height: 72,
                border: "1.5px solid #e5e7eb",
                borderRadius: 12,
                background: "#fff",
                cursor: "pointer",
                padding: "8px 4px",
                flexShrink: 0,
                transition: "border-color 0.15s, background 0.15s",
                position: "relative",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#e0502e"
                e.currentTarget.style.background = "#fdf4f1"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.background = "#fff"
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#e0502e"
                e.currentTarget.style.outline = "2px solid #f5c4b2"
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.outline = "none"
              }}
            >
              {isToday && (
                <span
                  style={{
                    position: "absolute",
                    top: 4,
                    fontSize: 9,
                    fontWeight: 700,
                    color: "#e0502e",
                    textTransform: "uppercase",
                    letterSpacing: 0.4,
                  }}
                >
                  сегодня
                </span>
              )}
              <span style={{ fontSize: 11, color: "#6b7280", marginTop: isToday ? 4 : 0 }}>
                {dow}
              </span>
              <span style={{ fontSize: 20, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                {day}
              </span>
              <span style={{ fontSize: 11, color: "#9ca3af" }}>{month}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Step 3: Time selection ─────────────────────────────────────────────────────

function StepTime({
  doctor,
  date,
  onSelect,
  onBack,
  refreshTrigger,
}: {
  doctor: PublicDoctor
  date: string
  onSelect: (slot: AvailableSlot) => void
  onBack: () => void
  refreshTrigger?: number
}) {
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [noSlotMessage, setNoSlotMessage] = useState<string | null>(null)

  const loadSlots = useCallback(() => {
    setLoading(true)
    setNoSlotMessage(null)
    fetch(
      `/api/booking/albamed/slots?doctor_id=${doctor.id}&date=${date}`
    )
      .then((r) => r.json() as Promise<{ slots: AvailableSlot[]; message?: string }>)
      .then((d) => {
        setSlots(d.slots)
        if (d.slots.length === 0) {
          setNoSlotMessage(d.message ?? "На эту дату нет свободного времени")
        }
        setLoading(false)
      })
      .catch(() => {
        setSlots([])
        setNoSlotMessage("Не удалось загрузить слоты")
        setLoading(false)
      })
  }, [doctor.id, date])

  useEffect(() => {
    loadSlots()
  }, [loadSlots, refreshTrigger])

  return (
    <div>
      <BackButton onClick={onBack} />
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>
        Выберите желаемое время
      </h2>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <DoctorAvatar doctor={doctor} size={28} />
        <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
          {doctor.name}
        </span>
        <span style={{ fontSize: 14, color: "#6b7280" }}>·</span>
        <span style={{ fontSize: 14, color: "#374151" }}>{formatDate(date)}</span>
      </div>

      {loading ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
            gap: 8,
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              style={{
                height: 44,
                background: "#e5e7eb",
                borderRadius: 10,
                animation: "bkPulse 1.4s ease infinite",
              }}
            />
          ))}
        </div>
      ) : noSlotMessage ? (
        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fcd34d",
            borderRadius: 10,
            padding: "14px 16px",
            color: "#92400e",
            fontSize: 14,
          }}
        >
          {noSlotMessage}.{" "}
          <button
            type="button"
            onClick={onBack}
            style={{
              background: "none",
              border: "none",
              color: "#e0502e",
              cursor: "pointer",
              padding: 0,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            Выбрать другой день
          </button>
        </div>
      ) : (
        <>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(76px, 1fr))",
            gap: 8,
          }}
          role="group"
          aria-label="Доступное время"
        >
          {slots.map((slot) => (
            <button
              key={slot.time + (slot.dtStart ?? "")}
              type="button"
              onClick={() => onSelect(slot)}
              aria-label={`Время ${slot.time}${slot.price != null && slot.price > 0 ? `, ${slot.price.toLocaleString("ru-RU")} ₽` : ""}`}
              style={{
                minHeight: 44,
                padding: "6px 4px",
                border: "1.5px solid #e5e7eb",
                borderRadius: 10,
                background: "#fff",
                cursor: "pointer",
                fontSize: 15,
                fontWeight: 600,
                color: "#111827",
                transition: "border-color 0.15s, background 0.15s, color 0.15s",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 2,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#e0502e"
                e.currentTarget.style.background = "#e0502e"
                e.currentTarget.style.color = "#fff"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#e5e7eb"
                e.currentTarget.style.background = "#fff"
                e.currentTarget.style.color = "#111827"
              }}
              onFocus={(e) => {
                e.currentTarget.style.outline = "2px solid #f5c4b2"
                e.currentTarget.style.borderColor = "#e0502e"
              }}
              onBlur={(e) => {
                e.currentTarget.style.outline = "none"
                e.currentTarget.style.borderColor = "#e5e7eb"
              }}
            >
              <span>{slot.time}</span>
              {slot.price != null && slot.price > 0 && (
                <span style={{ fontSize: 11, color: "inherit", fontWeight: 500, opacity: 0.8 }}>
                  {slot.price.toLocaleString("ru-RU")}&nbsp;₽
                </span>
              )}
            </button>
          ))}
        </div>
        <p
          style={{
            marginTop: 12,
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.5,
          }}
        >
          Это предварительная запись. Администратор перезвонит и подтвердит точное время.
        </p>
        </>
      )}
    </div>
  )
}

// ── Step 4: Contact form ───────────────────────────────────────────────────────

interface ContactFormData {
  lastName: string
  firstName: string
  secondName: string  // отчество — необязательно (second_name_is_required: false)
  birthday: string    // YYYY-MM-DD, обязательна для МедФлекс execute/
  phone: string
  comment: string
  consent: boolean
}

interface ContactFormErrors {
  lastName?: string
  firstName?: string
  birthday?: string
  phone?: string
}

function StepContact({
  doctor,
  date,
  time,
  selectedSlot,
  onSubmit,
  onBack,
}: {
  doctor: PublicDoctor
  date: string
  time: string
  selectedSlot: AvailableSlot | null
  onSubmit: (data: ContactFormData) => Promise<void>
  onBack: () => void
}) {
  const [form, setForm] = useState<ContactFormData>({
    lastName: "",
    firstName: "",
    secondName: "",
    birthday: "",
    phone: "",
    comment: "",
    consent: false,
  })
  const [errors, setErrors] = useState<ContactFormErrors>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  function validate(): boolean {
    const newErrors: ContactFormErrors = {}
    if (form.lastName.trim().length < 1) {
      newErrors.lastName = "Введите фамилию"
    }
    if (form.firstName.trim().length < 1) {
      newErrors.firstName = "Введите имя"
    }
    if (!form.birthday) {
      newErrors.birthday = "Укажите дату рождения"
    } else {
      const bd = new Date(form.birthday + "T00:00:00")
      if (isNaN(bd.getTime()) || bd >= new Date()) {
        newErrors.birthday = "Укажите корректную дату рождения"
      }
    }
    if (!isPhoneValid(form.phone)) {
      newErrors.phone = "Введите корректный телефон (+7 или 8, 11 цифр)"
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await onSubmit({
        lastName: form.lastName.trim(),
        firstName: form.firstName.trim(),
        secondName: form.secondName.trim(),
        birthday: form.birthday,
        phone: form.phone,
        comment: form.comment.trim(),
        consent: form.consent,
      })
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Ошибка отправки")
      setSubmitting(false)
    }
  }

  const canSubmit =
    form.consent &&
    form.lastName.trim().length >= 1 &&
    form.firstName.trim().length >= 1 &&
    Boolean(form.birthday) &&
    isPhoneValid(form.phone) &&
    !submitting

  return (
    <div>
      <BackButton onClick={onBack} />
      <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px", color: "#111827" }}>
        Ваши контакты
      </h2>
      <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 16px" }}>
        Администратор позвонит для подтверждения времени
      </p>

      {/* Booking summary */}
      <div
        style={{
          background: "#fdf4f1",
          border: "1px solid #f5c4b2",
          borderRadius: 12,
          padding: "12px 14px",
          marginBottom: 20,
          display: "flex",
          gap: 12,
          alignItems: "flex-start",
        }}
      >
        <DoctorAvatar doctor={doctor} size={40} />
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {doctor.name}
          </div>
          <div style={{ fontSize: 13, color: "#6b7280" }}>{doctor.specialty}</div>
          <div style={{ fontSize: 13, color: "#e0502e", fontWeight: 600, marginTop: 3 }}>
            {formatDate(date)} · {time}
          </div>
          {selectedSlot?.price != null && selectedSlot.price > 0 && (
            <div style={{ fontSize: 13, color: "#0d9488", fontWeight: 600, marginTop: 2 }}>
              {selectedSlot.price.toLocaleString("ru-RU")}&nbsp;₽
            </div>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        {/* ФИО: три отдельных поля */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            {/* Фамилия */}
            <div>
              <label
                htmlFor="bk-last-name"
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}
              >
                Фамилия <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="bk-last-name"
                type="text"
                autoComplete="family-name"
                placeholder="Иванова"
                value={form.lastName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, lastName: e.target.value }))
                  if (errors.lastName) setErrors((er) => ({ ...er, lastName: undefined }))
                }}
                aria-describedby={errors.lastName ? "bk-last-name-error" : undefined}
                aria-invalid={!!errors.lastName}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  border: `1.5px solid ${errors.lastName ? "#f87171" : "#d1d5db"}`,
                  borderRadius: 10,
                  fontSize: 15,
                  color: "#111827",
                  background: "#fff",
                  outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = errors.lastName ? "#f87171" : "#e0502e" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.lastName ? "#f87171" : "#d1d5db" }}
              />
              {errors.lastName && (
                <p id="bk-last-name-error" role="alert" aria-live="polite"
                  style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                  {errors.lastName}
                </p>
              )}
            </div>
            {/* Имя */}
            <div>
              <label
                htmlFor="bk-first-name"
                style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}
              >
                Имя <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                id="bk-first-name"
                type="text"
                autoComplete="given-name"
                placeholder="Мария"
                value={form.firstName}
                onChange={(e) => {
                  setForm((f) => ({ ...f, firstName: e.target.value }))
                  if (errors.firstName) setErrors((er) => ({ ...er, firstName: undefined }))
                }}
                aria-describedby={errors.firstName ? "bk-first-name-error" : undefined}
                aria-invalid={!!errors.firstName}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "10px 12px",
                  border: `1.5px solid ${errors.firstName ? "#f87171" : "#d1d5db"}`,
                  borderRadius: 10,
                  fontSize: 15,
                  color: "#111827",
                  background: "#fff",
                  outline: "none",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = errors.firstName ? "#f87171" : "#e0502e" }}
                onBlur={(e) => { e.currentTarget.style.borderColor = errors.firstName ? "#f87171" : "#d1d5db" }}
              />
              {errors.firstName && (
                <p id="bk-first-name-error" role="alert" aria-live="polite"
                  style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
                  {errors.firstName}
                </p>
              )}
            </div>
          </div>
          {/* Отчество (необязательно) */}
          <div>
            <label
              htmlFor="bk-second-name"
              style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}
            >
              Отчество{" "}
              <span style={{ fontWeight: 400, color: "#9ca3af" }}>(необязательно)</span>
            </label>
            <input
              id="bk-second-name"
              type="text"
              autoComplete="additional-name"
              placeholder="Сергеевна"
              value={form.secondName}
              onChange={(e) => setForm((f) => ({ ...f, secondName: e.target.value }))}
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "10px 12px",
                border: "1.5px solid #d1d5db",
                borderRadius: 10,
                fontSize: 15,
                color: "#111827",
                background: "#fff",
                outline: "none",
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = "#e0502e" }}
              onBlur={(e) => { e.currentTarget.style.borderColor = "#d1d5db" }}
            />
          </div>
        </div>

        {/* Дата рождения — обязательна для МедФлекс */}
        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="bk-birthday"
            style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 5 }}
          >
            Дата рождения <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="bk-birthday"
            type="date"
            autoComplete="bday"
            value={form.birthday}
            max={new Date().toISOString().slice(0, 10)}
            onChange={(e) => {
              setForm((f) => ({ ...f, birthday: e.target.value }))
              if (errors.birthday) setErrors((er) => ({ ...er, birthday: undefined }))
            }}
            aria-describedby={errors.birthday ? "bk-birthday-error" : undefined}
            aria-invalid={!!errors.birthday}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: `1.5px solid ${errors.birthday ? "#f87171" : "#d1d5db"}`,
              borderRadius: 10,
              fontSize: 15,
              color: form.birthday ? "#111827" : "#9ca3af",
              background: "#fff",
              outline: "none",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = errors.birthday ? "#f87171" : "#e0502e" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = errors.birthday ? "#f87171" : "#d1d5db" }}
          />
          {errors.birthday && (
            <p id="bk-birthday-error" role="alert" aria-live="polite"
              style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}>
              {errors.birthday}
            </p>
          )}
        </div>

        {/* Phone */}
        <div style={{ marginBottom: 14 }}>
          <label
            htmlFor="bk-phone"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 5,
            }}
          >
            Телефон <span style={{ color: "#ef4444" }}>*</span>
          </label>
          <input
            id="bk-phone"
            type="tel"
            autoComplete="tel"
            placeholder="+7 (___) ___-__-__"
            value={form.phone}
            onChange={(e) => {
              const masked = formatPhone(e.target.value)
              setForm((f) => ({ ...f, phone: masked }))
              if (errors.phone) setErrors((er) => ({ ...er, phone: undefined }))
            }}
            aria-describedby={errors.phone ? "bk-phone-error" : undefined}
            aria-invalid={!!errors.phone}
            inputMode="tel"
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: `1.5px solid ${errors.phone ? "#f87171" : "#d1d5db"}`,
              borderRadius: 10,
              fontSize: 15,
              color: "#111827",
              background: "#fff",
              outline: "none",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = errors.phone ? "#f87171" : "#e0502e"
              // Auto-fill +7 prefix on focus if empty
              if (!form.phone) {
                setForm((f) => ({ ...f, phone: "+7 (" }))
              }
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = errors.phone ? "#f87171" : "#d1d5db"
              // Clear incomplete prefix
              if (form.phone === "+7 (") {
                setForm((f) => ({ ...f, phone: "" }))
              }
            }}
          />
          {errors.phone && (
            <p
              id="bk-phone-error"
              role="alert"
              aria-live="polite"
              style={{ margin: "4px 0 0", fontSize: 12, color: "#dc2626" }}
            >
              {errors.phone}
            </p>
          )}
        </div>

        {/* Comment */}
        <div style={{ marginBottom: 18 }}>
          <label
            htmlFor="bk-comment"
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: "#374151",
              marginBottom: 5,
            }}
          >
            Комментарий{" "}
            <span style={{ fontWeight: 400, color: "#9ca3af" }}>(необязательно)</span>
          </label>
          <textarea
            id="bk-comment"
            placeholder="Желаемая услуга или уточняющий вопрос"
            value={form.comment}
            onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
            rows={3}
            maxLength={1000}
            style={{
              width: "100%",
              boxSizing: "border-box",
              padding: "10px 12px",
              border: "1.5px solid #d1d5db",
              borderRadius: 10,
              fontSize: 15,
              color: "#111827",
              background: "#fff",
              outline: "none",
              resize: "vertical",
              fontFamily: "inherit",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#e0502e"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#d1d5db"
            }}
          />
        </div>

        {/* Consent */}
        <div style={{ marginBottom: 20, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <input
            id="bk-consent"
            type="checkbox"
            checked={form.consent}
            onChange={(e) => setForm((f) => ({ ...f, consent: e.target.checked }))}
            style={{ width: 18, height: 18, marginTop: 2, cursor: "pointer", accentColor: "#e0502e", flexShrink: 0 }}
          />
          <label
            htmlFor="bk-consent"
            style={{ fontSize: 13, color: "#374151", lineHeight: 1.5, cursor: "pointer" }}
          >
            Даю ООО «Альба-Мед» (ИНН&nbsp;9102040753) согласие на обработку персональных данных, в
            том числе специальных категорий (сведения о записи к врачу как факт обращения за
            медицинской помощью): фамилии, имени, отчества, даты рождения, номера телефона,
            выбранного врача, специальности, даты и времени приёма — в целях записи на приём.
            Данные передаются ООО «МедРокет» (МедФлекс) как обработчику по поручению клиники.
            Ознакомлен(а) с{" "}
            <a
              href="https://alba-medcenter.ru/wp-content/uploads/2025/10/%D0%9F%D0%BE%D0%BB%D0%B8%D1%82%D0%B8%D0%BA%D0%B0-%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B4%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D0%90%D0%BB%D1%8C%D0%B1%D0%B0-%D0%BC%D0%B5%D0%B4.pdf"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#e0502e", textDecoration: "underline" }}
              onClick={(e) => e.stopPropagation()}
            >
              политикой конфиденциальности
            </a>
            .
          </label>
        </div>

        {/* Submit error */}
        {submitError && (
          <div
            role="alert"
            aria-live="polite"
            style={{
              background: "#fef2f2",
              border: "1px solid #fca5a5",
              borderRadius: 10,
              padding: "10px 14px",
              color: "#b91c1c",
              fontSize: 14,
              marginBottom: 14,
            }}
          >
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          style={{
            width: "100%",
            padding: "14px",
            background: canSubmit ? "#e0502e" : "#e5e7eb",
            color: canSubmit ? "#fff" : "#9ca3af",
            border: "none",
            borderRadius: 12,
            fontSize: 16,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "background 0.15s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          {submitting ? (
            <>
              <LoadingSpinner size={18} color="#fff" />
              Отправляем…
            </>
          ) : (
            "Записаться"
          )}
        </button>
      </form>
    </div>
  )
}

// ── Step 5: Success ────────────────────────────────────────────────────────────

function StepSuccess({
  doctor,
  date,
  time,
  onReset,
}: {
  doctor: PublicDoctor
  date: string
  time: string
  onReset: () => void
}) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      {/* Check icon */}
      <div
        style={{
          width: 72,
          height: 72,
          borderRadius: "50%",
          background: "#dcfce7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 20px",
        }}
      >
        <svg
          width="36"
          height="36"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: "#111827",
          margin: "0 0 8px",
        }}
      >
        Заявка принята!
      </h2>
      <p
        style={{
          fontSize: 15,
          color: "#6b7280",
          margin: "0 0 24px",
          maxWidth: 360,
          marginLeft: "auto",
          marginRight: "auto",
          lineHeight: 1.6,
        }}
      >
        Администратор перезвонит для подтверждения времени записи
      </p>

      {/* Booking summary card */}
      <div
        style={{
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 24,
          textAlign: "left",
          display: "inline-block",
          minWidth: 280,
          maxWidth: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <DoctorAvatar doctor={doctor} size={44} />
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
              {doctor.name}
            </div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>{doctor.specialty}</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 12px",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 10,
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#e0502e"
            strokeWidth="2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
            {formatDate(date)}
          </span>
          <span
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#e0502e",
              marginLeft: "auto",
            }}
          >
            {time}
          </span>
        </div>
      </div>

      <div style={{ display: "block" }}>
        <button
          type="button"
          onClick={onReset}
          style={{
            padding: "12px 32px",
            background: "#f1f5f9",
            color: "#374151",
            border: "none",
            borderRadius: 12,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e2e8f0"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9"
          }}
        >
          Записаться ещё раз
        </button>
      </div>
    </div>
  )
}

// ── Shared helpers ─────────────────────────────────────────────────────────────

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "none",
        border: "none",
        cursor: "pointer",
        color: "#6b7280",
        fontSize: 13,
        fontWeight: 500,
        padding: "0 0 16px",
        marginLeft: -2,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#e0502e"
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#6b7280"
      }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
      Назад
    </button>
  )
}

function LoadingSpinner({ size = 20, color = "#e0502e" }: { size?: number; color?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2.5"
      style={{ animation: "bkSpin 0.7s linear infinite", flexShrink: 0 }}
      aria-hidden="true"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  )
}

// ── Callback section: fallback «перезвоните мне» ──────────────────────────────

type CallbackState = "idle" | "submitting" | "success" | "error"

function CallbackSection() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [consent, setConsent] = useState(false)
  const [phoneError, setPhoneError] = useState<string | null>(null)
  const [state, setState] = useState<CallbackState>("idle")
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const canSubmit =
    consent &&
    name.trim().length >= 2 &&
    isPhoneValid(phone) &&
    state === "idle"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isPhoneValid(phone)) {
      setPhoneError("Введите корректный телефон (+7 или 8, 11 цифр)")
      return
    }
    setState("submitting")
    setErrorMsg(null)
    try {
      const res = await fetch("/api/booking/albamed/callback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ website: "", name: name.trim(), phone, consent: true }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error ?? "Ошибка сервера")
      }
      setState("success")
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Ошибка отправки")
      setState("error")
    }
  }

  const POLICY_URL =
    "https://alba-medcenter.ru/wp-content/uploads/2025/10/%D0%9F%D0%BE%D0%BB%D0%B8%D1%82%D0%B8%D0%BA%D0%B0-%D0%BA%D0%BE%D0%BD%D1%84%D0%B8%D0%B4%D0%B5%D0%BD%D1%86%D0%B8%D0%B0%D0%BB%D1%8C%D0%BD%D0%BE%D1%81%D1%82%D0%B8-%D0%90%D0%BB%D1%8C%D0%B1%D0%B0-%D0%BC%D0%B5%D0%B4.pdf"

  if (state === "success") {
    return (
      <div
        style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          borderRadius: 14,
          padding: "20px",
          textAlign: "center",
        }}
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#16a34a"
          strokeWidth="2.5"
          style={{ marginBottom: 8 }}
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <p style={{ fontSize: 15, fontWeight: 600, color: "#15803d", margin: 0 }}>
          Заявка принята!
        </p>
        <p style={{ fontSize: 13, color: "#6b7280", margin: "6px 0 0" }}>
          Администратор перезвонит вам в ближайшее время.
        </p>
      </div>
    )
  }

  return (
    <div
      style={{
        background: "#fff1ed",
        border: "1px solid #fdba74",
        borderRadius: 14,
        padding: "20px",
      }}
    >
      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#9a3412", margin: "0 0 4px" }}>
        Не хотите заполнять форму?
      </h3>
      <p style={{ fontSize: 13, color: "#7c2d12", margin: "0 0 14px", lineHeight: 1.5 }}>
        Оставьте имя и телефон — администратор перезвонит и запишет вас сам.
      </p>
      <form onSubmit={handleSubmit} noValidate>
        {/* Honeypot */}
        <input
          type="text"
          name="website"
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {/* Имя */}
          <input
            type="text"
            autoComplete="given-name"
            placeholder="Ваше имя *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            aria-label="Ваше имя"
            style={{
              padding: "10px 12px",
              border: "1.5px solid #fdba74",
              borderRadius: 10,
              fontSize: 14,
              background: "#fff",
              outline: "none",
              width: "100%",
              boxSizing: "border-box",
              color: "#111827",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "#e0502e" }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "#fdba74" }}
          />
          {/* Телефон */}
          <div>
            <input
              type="tel"
              autoComplete="tel"
              placeholder="+7 (___) ___-__-__"
              value={phone}
              onChange={(e) => {
                const masked = formatPhone(e.target.value)
                setPhone(masked)
                if (phoneError) setPhoneError(null)
              }}
              inputMode="tel"
              required
              aria-label="Телефон"
              aria-describedby={phoneError ? "cb-phone-error" : undefined}
              aria-invalid={!!phoneError}
              style={{
                padding: "10px 12px",
                border: `1.5px solid ${phoneError ? "#f87171" : "#fdba74"}`,
                borderRadius: 10,
                fontSize: 14,
                background: "#fff",
                outline: "none",
                width: "100%",
                boxSizing: "border-box",
                color: "#111827",
              }}
              onFocus={(e) => {
                if (!phone) setPhone("+7 (")
                e.currentTarget.style.borderColor = phoneError ? "#f87171" : "#e0502e"
              }}
              onBlur={(e) => {
                if (phone === "+7 (") setPhone("")
                e.currentTarget.style.borderColor = phoneError ? "#f87171" : "#fdba74"
              }}
            />
            {phoneError && (
              <p
                id="cb-phone-error"
                role="alert"
                aria-live="polite"
                style={{ fontSize: 12, color: "#dc2626", margin: "4px 0 0" }}
              >
                {phoneError}
              </p>
            )}
          </div>
        </div>

        {/* Согласие */}
        <div style={{ display: "flex", gap: 8, alignItems: "flex-start", margin: "12px 0" }}>
          <input
            id="cb-consent"
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            style={{
              width: 16,
              height: 16,
              marginTop: 2,
              cursor: "pointer",
              accentColor: "#e0502e",
              flexShrink: 0,
            }}
          />
          <label
            htmlFor="cb-consent"
            style={{ fontSize: 12, color: "#7c2d12", lineHeight: 1.5, cursor: "pointer" }}
          >
            Даю ООО «Альба-Мед» согласие на обработку персональных данных (имя, телефон) в целях
            обратного звонка. Ознакомлен(а) с{" "}
            <a
              href={POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#9a3412", textDecoration: "underline" }}
              onClick={(e) => e.stopPropagation()}
            >
              политикой конфиденциальности
            </a>
            .
          </label>
        </div>

        {/* Error */}
        {state === "error" && errorMsg && (
          <p
            role="alert"
            aria-live="polite"
            style={{ fontSize: 13, color: "#b91c1c", margin: "0 0 10px" }}
          >
            {errorMsg}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          aria-disabled={!canSubmit}
          style={{
            width: "100%",
            padding: "12px",
            background: canSubmit ? "#e0502e" : "#e5e7eb",
            color: canSubmit ? "#fff" : "#9ca3af",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 700,
            cursor: canSubmit ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            transition: "background 0.15s",
          }}
        >
          {state === "submitting" ? (
            <>
              <LoadingSpinner size={16} color="#fff" />
              Отправляем…
            </>
          ) : (
            "Перезвоните мне"
          )}
        </button>
      </form>
    </div>
  )
}

// ── Main Widget Component ──────────────────────────────────────────────────────

export default function AlbamedBookingPage() {
  const [step, setStep] = useState<Step>("doctor")
  const [booking, setBooking] = useState<BookingState>({
    doctor: null,
    date: null,
    time: null,
    slot: null,
  })
  const [slotRefreshTrigger, setSlotRefreshTrigger] = useState(0)
  // Внутри виджета-iframe своя шапка уже есть (модалка) — прячем дублирующую.
  const [embedded, setEmbedded] = useState(false)
  useEffect(() => {
    try { setEmbedded(window.self !== window.top) } catch { setEmbedded(true) }
  }, [])

  function handleDoctorSelect(doctor: PublicDoctor) {
    setBooking({ doctor, date: null, time: null, slot: null })
    setStep("date")
  }

  function handleDateSelect(date: string) {
    setBooking((b) => ({ ...b, date, time: null, slot: null }))
    setStep("time")
  }

  function handleTimeSelect(slot: AvailableSlot) {
    setBooking((b) => ({ ...b, time: slot.time, slot }))
    setStep("contact")
  }

  async function handleContactSubmit(data: ContactFormData) {
    if (!booking.doctor || !booking.date || !booking.time) return

    const res = await fetch("/api/booking/albamed/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        website: "",
        doctor_id: booking.doctor.id,
        service: "",
        date: booking.date,
        time: booking.time,
        last_name: data.lastName,
        first_name: data.firstName,
        second_name: data.secondName,
        birthday: data.birthday,
        phone: data.phone,
        comment: data.comment,
        consent: data.consent,
        lpu_id: booking.slot?.lpuId,
        speciality_id: booking.slot?.specialityId,
        dt_start: booking.slot?.dtStart,
        dt_end: booking.slot?.dtEnd,
        price: booking.slot?.price,
      }),
    })

    if (res.status === 409) {
      // Slot taken — go back to time, refresh slots
      setStep("time")
      setSlotRefreshTrigger((n) => n + 1)
      throw new Error("Это время уже занято. Пожалуйста, выберите другое.")
    }

    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string }
      throw new Error(body.error ?? "Ошибка сервера")
    }

    setStep("success")
  }

  function handleReset() {
    setBooking({ doctor: null, date: null, time: null, slot: null })
    setStep("doctor")
  }

  function canGoToStep(target: Step): boolean {
    switch (target) {
      case "doctor":
        return true
      case "date":
        return booking.doctor !== null
      case "time":
        return booking.doctor !== null && booking.date !== null
      case "contact":
        return booking.doctor !== null && booking.date !== null && booking.time !== null
      default:
        return false
    }
  }

  // Clicking a completed step navigates back
  function handleStepClick(target: Step): boolean {
    if (!canGoToStep(target)) return false
    const stepOrder: Step[] = ["doctor", "date", "time", "contact"]
    const currentIdx = stepOrder.indexOf(step)
    const targetIdx = stepOrder.indexOf(target)
    if (targetIdx < currentIdx) {
      setStep(target)
    }
    return true
  }

  return (
    <>
      <style>{`
        @keyframes bkPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes bkSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        /* Remove default button tap highlight on mobile */
        button { -webkit-tap-highlight-color: transparent; }
        /* Hide scrollbar visually but keep functionality */
        ::-webkit-scrollbar { width: 0; height: 0; }
        /* Focus visible only for keyboard navigation */
        button:focus:not(:focus-visible) { outline: none; }
        button:focus-visible { outline: 2px solid #f5c4b2; outline-offset: 2px; }
      `}</style>

      <main
        role="main"
        style={{
          minHeight: "100vh",
          background: "#f8fafc",
          padding: "0 0 40px",
        }}
      >
        {/* Header */}
        {step !== "success" && !embedded && (
          <header
            style={{
              background: "#fff",
              borderBottom: "1px solid #e5e7eb",
              padding: "14px 20px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            {/* Medical cross icon */}
            <div
              style={{
                width: 36,
                height: 36,
                background: "#e0502e",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
              aria-hidden="true"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M11 3h2v7h7v2h-7v7h-2v-7H4v-2h7z"
                  fill="#fff"
                />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>
                Запись к врачу
              </div>
              <div style={{ fontSize: 12, color: "#6b7280" }}>Медицинский центр Альбамед</div>
            </div>
          </header>
        )}

        {/* Content */}
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "24px 20px 0",
          }}
        >
          {/* Progress */}
          {step !== "success" && (
            <StepIndicator current={step} canGoTo={canGoToStep} onNavigate={handleStepClick} />
          )}

          {/* Steps */}
          {step === "doctor" && (
            <StepDoctor onSelect={handleDoctorSelect} />
          )}

          {step === "date" && booking.doctor && (
            <StepDate
              doctor={booking.doctor}
              onSelect={handleDateSelect}
              onBack={() => setStep("doctor")}
            />
          )}

          {step === "time" && booking.doctor && booking.date && (
            <StepTime
              doctor={booking.doctor}
              date={booking.date}
              onSelect={handleTimeSelect}
              onBack={() => setStep("date")}
              refreshTrigger={slotRefreshTrigger}
            />
          )}

          {step === "contact" && booking.doctor && booking.date && booking.time && (
            <StepContact
              doctor={booking.doctor}
              date={booking.date}
              time={booking.time}
              selectedSlot={booking.slot}
              onSubmit={handleContactSubmit}
              onBack={() => setStep("time")}
            />
          )}

          {step === "success" && booking.doctor && booking.date && booking.time && (
            <StepSuccess
              doctor={booking.doctor}
              date={booking.date}
              time={booking.time}
              onReset={handleReset}
            />
          )}
        </div>

        {/* Fallback «перезвоните мне» — всегда виден кроме экрана успеха */}
        {step !== "success" && (
          <div
            style={{
              maxWidth: 720,
              margin: "24px auto 0",
              padding: "0 20px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                margin: "0 0 16px",
              }}
            >
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
              <span style={{ fontSize: 13, color: "#9ca3af", whiteSpace: "nowrap" }}>
                или быстрый вариант
              </span>
              <div style={{ flex: 1, height: 1, background: "#e5e7eb" }} />
            </div>
            <CallbackSection />
          </div>
        )}

        {/* Trust-подвал: онлайн-запись работает на платформе ПроДокторов/МедФлекс */}
        <div
          style={{
            maxWidth: 720,
            margin: "28px auto 0",
            padding: "0 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: 12, color: "#9ca3af" }}>
            Онлайн-запись работает на платформе
          </span>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/albamed/prodoctorov-logo.svg"
            alt="ПроДокторов"
            style={{ height: 16, width: "auto", display: "block", opacity: 0.85 }}
          />
        </div>
      </main>
    </>
  )
}
