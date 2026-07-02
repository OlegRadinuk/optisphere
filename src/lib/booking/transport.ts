/**
 * Booking Transport — абстракция записи на приём.
 *
 * Три реализации:
 *   LocalTransport   — пишет напрямую в SQLite (дефолт)
 *   MedflexTransport — интеграция с Medflex (заглушка, TODO)
 *   DirectTransport  — интеграция с 1С БИТ УМЦ (заглушка, TODO)
 *
 * Выбор транспорта: env BOOKING_TRANSPORT = 'local' | 'medflex' | 'direct'
 * По умолчанию — 'local'.
 */

import { getDb } from "@/lib/db"

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface SlotQuery {
  doctorId: number
  date: string // YYYY-MM-DD
}

export interface BookingInput {
  doctorId: number
  service: string
  date: string   // YYYY-MM-DD
  time: string   // HH:MM
  durationMin: number
  name: string
  phone: string
  comment?: string
}

export interface BookingResult {
  success: boolean
  appointmentId?: number
  error?: string
}

export interface BookingTransport {
  getSlots(q: SlotQuery): Promise<string[]>
  createBooking(b: BookingInput): Promise<BookingResult>
}

// ── Phone normalisation ──────────────────────────────────────────────────────

/**
 * Нормализует русский телефон к формату 7XXXXXXXXXX (11 цифр, без +).
 * Принимает: +7..., 8..., 7... (с любыми разделителями).
 * Возвращает null если не удалось распарсить.
 */
export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  if (digits.length === 11 && (digits.startsWith("7") || digits.startsWith("8"))) {
    return "7" + digits.slice(1)
  }
  if (digits.length === 10) {
    return "7" + digits
  }
  return null
}

// ── Schedule helpers ─────────────────────────────────────────────────────────

const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const
type DayKey = typeof DAY_KEYS[number]

type DoctorSchedule = Partial<Record<DayKey, boolean>>

function isDayWorking(scheduleJson: string, date: string): boolean {
  const dow = new Date(date + "T12:00:00").getDay() // 0=Sun, 6=Sat — use noon to avoid TZ issues
  const key = DAY_KEYS[dow]
  let sched: DoctorSchedule = {}
  try {
    sched = JSON.parse(scheduleJson) as DoctorSchedule
  } catch {
    return false
  }
  return sched[key] === true
}

/** Генерирует временные слоты с 09:00 до 18:00 с шагом stepMin. */
function generateTimeSlots(stepMin: number): string[] {
  const slots: string[] = []
  const startH = 9
  const endH = 18
  const total = (endH - startH) * 60
  for (let offset = 0; offset + stepMin <= total; offset += stepMin) {
    const h = startH + Math.floor(offset / 60)
    const m = offset % 60
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
  }
  return slots
}

/** Проверяет, прошёл ли слот (для сегодняшней даты). */
function isPastSlot(date: string, time: string): boolean {
  const now = new Date()
  const today = now.toISOString().slice(0, 10)
  if (date !== today) return false
  const [hStr, mStr] = time.split(":")
  const slotMinutes = parseInt(hStr ?? "0", 10) * 60 + parseInt(mStr ?? "0", 10)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()
  return slotMinutes <= nowMinutes
}

// ── LocalTransport ───────────────────────────────────────────────────────────

const ALBAMED_CLIENT_ID = 1

export class LocalTransport implements BookingTransport {
  async getSlots(q: SlotQuery): Promise<string[]> {
    const db = getDb()

    // Загружаем врача (только активный, client_id=1)
    const doctor = db
      .prepare("SELECT * FROM doctors WHERE id = ? AND client_id = ? AND active = 1")
      .get(q.doctorId, ALBAMED_CLIENT_ID) as {
        id: number
        schedule: string
        appointment_price: string | null
      } | undefined

    if (!doctor) return []

    // Проверяем рабочий день по расписанию
    if (!isDayWorking(doctor.schedule, q.date)) return []

    // Определяем шаг слота: берём из appointment_price-колонки duration или 30 мин
    // В данном случае duration_min хранится не в doctors, а в appointments.
    // Дефолт — 30 мин (можно переопределить через параметр в будущем).
    const step = 30

    const allSlots = generateTimeSlots(step)

    // Занятые слоты (исключаем отменённые)
    const bookedRows = db
      .prepare(
        `SELECT appointment_time FROM appointments
         WHERE doctor_id = ? AND appointment_date = ? AND status != 'cancelled'`
      )
      .all(q.doctorId, q.date) as Array<{ appointment_time: string }>
    const booked = new Set(bookedRows.map((r) => r.appointment_time))

    return allSlots.filter(
      (slot) => !booked.has(slot) && !isPastSlot(q.date, slot)
    )
  }

  async createBooking(b: BookingInput): Promise<BookingResult> {
    const db = getDb()

    // Проверяем врача
    const doctor = db
      .prepare("SELECT * FROM doctors WHERE id = ? AND client_id = ? AND active = 1")
      .get(b.doctorId, ALBAMED_CLIENT_ID) as { id: number } | undefined
    if (!doctor) {
      return { success: false, error: "Врач не найден" }
    }

    // Antidouble: атомарная проверка занятости слота
    const conflict = db
      .prepare(
        `SELECT id FROM appointments
         WHERE doctor_id = ? AND appointment_date = ? AND appointment_time = ?
         AND status != 'cancelled'`
      )
      .get(b.doctorId, b.date, b.time) as { id: number } | undefined

    if (conflict) {
      return { success: false, error: "Слот уже занят" }
    }

    // Нормализуем телефон
    const normalizedPhone = normalizePhone(b.phone)
    const phoneToStore = normalizedPhone ?? b.phone

    // INSERT
    const result = db
      .prepare(
        `INSERT INTO appointments
           (client_id, lead_id, doctor_id, patient_name, patient_phone, service, notes,
            appointment_date, appointment_time, duration_min, status, source)
         VALUES (?, NULL, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'site')`
      )
      .run(
        ALBAMED_CLIENT_ID,
        b.doctorId,
        b.name,
        phoneToStore,
        b.service,
        b.comment ?? "",
        b.date,
        b.time,
        b.durationMin
      )

    return { success: true, appointmentId: Number(result.lastInsertRowid) }
  }
}

// ── MedflexTransport ─────────────────────────────────────────────────────────

/**
 * TODO: Medflex API integration.
 *
 * Формат запроса (по документации Medflex):
 *   GET /api/v1/schedule?doctor_id=&date= — список слотов
 *   POST /api/v1/appointment — создание записи
 *   Body: { doctor_id, service_id, date, time, patient: { name, phone } }
 *   Auth: Bearer MEDFLEX_API_KEY
 *
 * Получить доступ: https://medflex.ru/developers
 */
export class MedflexTransport implements BookingTransport {
  private readonly apiKey: string
  private readonly baseUrl: string
  private readonly fallback: LocalTransport

  constructor() {
    this.apiKey = process.env.MEDFLEX_API_KEY ?? ""
    this.baseUrl = process.env.MEDFLEX_BASE_URL ?? "https://api.medflex.ru"
    this.fallback = new LocalTransport()
  }

  async getSlots(q: SlotQuery): Promise<string[]> {
    if (!this.apiKey) {
      // Fallback to local when not configured
      return this.fallback.getSlots(q)
    }
    // TODO: implement Medflex GET /api/v1/schedule
    throw new Error("MedflexTransport: getSlots not implemented yet")
  }

  async createBooking(b: BookingInput): Promise<BookingResult> {
    if (!this.apiKey) {
      return this.fallback.createBooking(b)
    }
    // TODO: implement Medflex POST /api/v1/appointment
    throw new Error("MedflexTransport: createBooking not implemented yet")
  }
}

// ── DirectTransport (1С БИТ УМЦ) ────────────────────────────────────────────

/**
 * Прямая запись в 1С БИТ УМЦ через HTTP-сервис.
 *
 * Известный контракт (из аудита):
 *   Метод:   POST http://<host>/<база>/hs/<сервис>
 *   Аутент.: HTTP Basic (DIRECT_1C_USER / DIRECT_1C_PASSWORD)
 *   Body (JSON):
 *     {
 *       dt_start:   "2024-03-15T09:00:00Z",  // ISO с Z
 *       dt_end:     "2024-03-15T09:30:00Z",
 *       doctor_id:  "string-guid-из-1С",
 *       specialty:  "string",
 *       filial_id:  "string",
 *       name:       "Имя пациента",
 *       phone:      "79XXXXXXXXX",
 *       comment:    "string"
 *     }
 *   Ответ:
 *     { success: true/false, error?: "string" }
 *
 * Слоты берутся из расписания 1С — отдельный endpoint (уточнить у разработчика 1С).
 *
 * Env: DIRECT_1C_URL, DIRECT_1C_USER, DIRECT_1C_PASSWORD, DIRECT_1C_FILIAL_ID
 */
export class DirectTransport implements BookingTransport {
  private readonly baseUrl: string
  private readonly user: string
  private readonly password: string
  private readonly fallback: LocalTransport

  constructor() {
    this.baseUrl = process.env.DIRECT_1C_URL ?? ""
    this.user = process.env.DIRECT_1C_USER ?? ""
    this.password = process.env.DIRECT_1C_PASSWORD ?? ""
    this.fallback = new LocalTransport()
  }

  async getSlots(q: SlotQuery): Promise<string[]> {
    if (!this.baseUrl || !this.user || !this.password) {
      return this.fallback.getSlots(q)
    }
    // TODO: запрос к /hs/<сервис>/slots?doctor_id=&date=
    throw new Error("DirectTransport: getSlots not configured yet")
  }

  async createBooking(b: BookingInput): Promise<BookingResult> {
    if (!this.baseUrl || !this.user || !this.password) {
      return this.fallback.createBooking(b)
    }
    // TODO: POST к /hs/<сервис>
    throw new Error("DirectTransport: createBooking not configured yet")
  }
}

// ── Factory ──────────────────────────────────────────────────────────────────

let _transport: BookingTransport | null = null

/**
 * Фабрика транспорта — выбирается по env BOOKING_TRANSPORT.
 * Синглтон — один экземпляр на процесс.
 */
export function getBookingTransport(): BookingTransport {
  if (_transport) return _transport

  const mode = process.env.BOOKING_TRANSPORT ?? "local"

  switch (mode) {
    case "medflex":
      _transport = new MedflexTransport()
      break
    case "direct":
      _transport = new DirectTransport()
      break
    default:
      _transport = new LocalTransport()
  }

  return _transport
}
