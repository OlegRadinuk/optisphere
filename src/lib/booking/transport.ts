/**
 * Booking Transport — абстракция записи на приём.
 *
 * Три реализации:
 *   LocalTransport   — пишет напрямую в SQLite (дефолт, лиды в дашборд)
 *   MedflexTransport — интеграция с Medflex REST API (env BOOKING_TRANSPORT=medflex)
 *   DirectTransport  — интеграция с 1С БИТ УМЦ (заглушка, TODO)
 *
 * Выбор транспорта: env BOOKING_TRANSPORT = 'local' | 'medflex' | 'direct'
 * По умолчанию — 'local'.
 *
 * ВАЖНО: MedflexTransport для execute/ — синхронный вызов до 60 с (таймаут 90 с),
 * платный (2 ₽/запрос), с идемпотентностью через medflex_booking_log в SQLite.
 * АВТОРЕТРАИ ЗАПРЕЩЕНЫ.
 */

import { getDb } from "@/lib/db"
import {
  fetchMedflexSchedule,
  createMedflexAppointment,
  cancelMedflexAppointment,
  scheduleToIso,
  scheduleToTime,
  scheduleToDate,
  MedflexApiError,
  MedflexConfigError,
  type MedflexScheduleRecord,
} from "@/lib/medflex"

// ── Идентификаторы клиники Альба-Мед (измерено 2026-07-22) ───────────────────

const MEDFLEX_TOWN_ID = 2202           // Симферополь
const MEDFLEX_LPU_IDS = [71767, 60992] // Кантар 9, Киевская 153а
// Маппинг lpu_id → номер филиала для PublicDoctor.branch
const LPU_BRANCH: Record<number, number> = { 71767: 1, 60992: 2 }

// ── Interfaces ───────────────────────────────────────────────────────────────

export interface SlotQuery {
  doctorId: number  // medflex doctor_id (MedflexTransport) или SQLite id (LocalTransport)
  date: string      // YYYY-MM-DD
  lpuId?: number    // опционально: если известен — используется для фильтрации
}

/**
 * Один доступный слот.
 *
 * LocalTransport возвращает только `time`.
 * MedflexTransport возвращает полный объект с данными для execute/.
 */
export interface AvailableSlot {
  time: string           // "HH:MM" для отображения
  dtStart?: string       // "YYYY-MM-DD HH:MM" — из /schedule/ cells.dt_start
  dtEnd?: string         // "YYYY-MM-DD HH:MM" — из /schedule/ cells.dt_end
  specialityId?: number  // для execute/: doctor.speciality_id
  price?: number         // для execute/: appointment.price
  lpuId?: number         // для execute/: doctor.lpu_id
}

/**
 * Входные данные для создания записи.
 *
 * Поля `name` — для LocalTransport (backward compat).
 * Поля `lastName/firstName/secondName/birthday/lpuId/specialityId/dtStart/dtEnd/price`
 * — обязательны для MedflexTransport (приходят из формы + слота).
 *
 * Поле `mobilePhone` — нормализованный телефон 7XXXXXXXXXX; если не передан,
 * транспорт нормализует из `phone` сам.
 */
export interface BookingInput {
  // ── Общие поля (оба транспорта) ────────────────────────────────────────────
  doctorId: number       // medflex doctor_id или SQLite id в зависимости от транспорта
  service: string
  date: string           // YYYY-MM-DD (для LocalTransport и UI)
  time: string           // HH:MM     (для LocalTransport и UI)
  durationMin: number
  phone: string          // сырой ввод пользователя (+7... или 8...)
  comment?: string

  // ── Полное ФИО — для LocalTransport и отображения ─────────────────────────
  name?: string          // "Фамилия Имя Отчество" — legacy поле

  // ── Раздельные поля ФИО — обязательны для MedflexTransport ───────────────
  lastName?: string
  firstName?: string
  secondName?: string    // отчество — "" если нет (second_name_is_required: false у Альбамед)

  // ── Дополнительные поля для MedflexTransport ──────────────────────────────
  birthday?: string      // YYYY-MM-DD — обязательно для execute/
  lpuId?: number         // medflex lpu_id — из слота (/slots)
  specialityId?: number  // medflex speciality_id — из слота (/slots)
  dtStart?: string       // "YYYY-MM-DD HH:MM" — из слота (/slots), для execute/
  dtEnd?: string         // "YYYY-MM-DD HH:MM" — из слота (/slots), для execute/
  price?: number         // из слота (/slots); 0 = бесплатно
  mobilePhone?: string   // нормализованный "7XXXXXXXXXX" (если уже нормализован)
}

export interface BookingResult {
  success: boolean
  appointmentId?: number    // SQLite id (LocalTransport)
  claimId?: string          // uuid4 (MedflexTransport)
  error?: string
}

/** Результат отмены записи */
export interface CancelResult {
  success: boolean
  error?: string
}

export interface BookingTransport {
  getSlots(q: SlotQuery): Promise<AvailableSlot[]>
  createBooking(b: BookingInput): Promise<BookingResult>
  /** Опционально — не все транспорты поддерживают отмену */
  cancelBooking?(claimId: string): Promise<CancelResult>
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
  async getSlots(q: SlotQuery): Promise<AvailableSlot[]> {
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

    return allSlots
      .filter((slot) => !booked.has(slot) && !isPastSlot(q.date, slot))
      .map((time) => ({ time }))
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

    // Собираем имя пациента: поддерживаем как старое единое поле, так и split-поля
    const patientName =
      b.name ??
      [b.lastName, b.firstName, b.secondName].filter(Boolean).join(" ") ??
      ""

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
        patientName,
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
 * In-process кэш расписания — 5 минут TTL.
 * Исключает множественные запросы к /schedule/ в рамках одного процесса
 * (например, при последовательных запросах /doctors → /slots → /slots).
 */
interface ScheduleCacheEntry {
  records: MedflexScheduleRecord[]
  expiresAt: number
}
let _scheduleCache: ScheduleCacheEntry | null = null
// 60 с — компромисс для PM2-кластера: только что занятый слот не будет «свободным»
// дольше минуты в соседнем воркере. Полный SQLite-busy-tracking — задача devops.
const SCHEDULE_CACHE_TTL_MS = 60 * 1000

async function getScheduleRecords(): Promise<MedflexScheduleRecord[]> {
  const now = Date.now()
  if (_scheduleCache && now < _scheduleCache.expiresAt) {
    return _scheduleCache.records
  }

  const records = await fetchMedflexSchedule(MEDFLEX_LPU_IDS, MEDFLEX_TOWN_ID)
  _scheduleCache = { records, expiresAt: now + SCHEDULE_CACHE_TTL_MS }
  return records
}

/** Принудительно сбрасывает кэш расписания (после создания записи, по вебхуку). */
export function invalidateScheduleCache(): void {
  _scheduleCache = null
}

/**
 * Проверяет/создаёт запись в medflex_booking_log для идемпотентности.
 *
 * Возвращает:
 *   { action: 'proceed' }               — нет дублей, можно вызывать execute/
 *   { action: 'duplicate', claimId }    — уже успешно создано, отдаём тот же claim_id
 *   { action: 'pending' }               — запрос обрабатывается (< 5 мин с начала)
 *
 * Race-condition защита: вся логика обёрнута в db.transaction (BEGIN IMMEDIATE).
 * При коллизии PRIMARY KEY (два воркера одновременно) INSERT OR IGNORE возвращает
 * changes=0 → трактуем как pending, не бросаем исключение.
 *
 * Stale pending: если процесс умер между pending и success/error — запись
 * застревает навсегда. Признак: age_min > 5. В этом случае удаляем и разрешаем повтор.
 */
type IdempotencyCheck =
  | { action: "proceed" }
  | { action: "duplicate"; claimId: string }
  | { action: "pending" }

function checkIdempotency(
  key: string,
  doctorId: number,
  lpuId: number,
  specialityId: number,
  dtStart: string,
  phone: string,
  patientName: string
): IdempotencyCheck {
  const db = getDb()

  // BEGIN IMMEDIATE — предотвращает read-race между SELECT и INSERT
  const doCheck = db.transaction((): IdempotencyCheck => {
    const existing = db
      .prepare(`
        SELECT status, claim_id,
          CAST((julianday('now') - julianday(created_at)) * 24 * 60 AS INTEGER) AS age_min
        FROM medflex_booking_log WHERE idempotency_key = ?
      `)
      .get(key) as { status: string; claim_id: string; age_min: number } | undefined

    if (existing) {
      if (existing.status === "success") {
        return { action: "duplicate", claimId: existing.claim_id }
      }
      if (existing.status === "pending" && existing.age_min <= 5) {
        // Живой pending — процесс ещё обрабатывает запрос
        return { action: "pending" }
      }
      // status === 'error' или stale pending (> 5 мин) → удаляем, разрешаем повтор
      db.prepare("DELETE FROM medflex_booking_log WHERE idempotency_key = ?").run(key)
    }

    // INSERT OR IGNORE — если другой воркер вставил одновременно, changes=0
    const info = db.prepare(`
      INSERT OR IGNORE INTO medflex_booking_log
        (idempotency_key, status, doctor_id, lpu_id, speciality_id, dt_start, phone, patient_name)
      VALUES (?, 'pending', ?, ?, ?, ?, ?, ?)
    `).run(key, doctorId, lpuId, specialityId, dtStart, phone, patientName)

    if (info.changes === 0) {
      // Конкурентная вставка — трактуем как pending, не падаем в 500
      return { action: "pending" }
    }

    return { action: "proceed" }
  })

  return doCheck()
}

function markIdempotencySuccess(key: string, claimId: string): void {
  getDb()
    .prepare(
      "UPDATE medflex_booking_log SET status='success', claim_id=?, finished_at=datetime('now') WHERE idempotency_key=?"
    )
    .run(claimId, key)
}

function markIdempotencyError(key: string, errorMsg: string): void {
  // Обрезаем до 500 символов — ответ МедФлекса может содержать HTML/JSON любой длины
  getDb()
    .prepare(
      "UPDATE medflex_booking_log SET status='error', error_msg=?, finished_at=datetime('now') WHERE idempotency_key=?"
    )
    .run(errorMsg.slice(0, 500), key)
}

/**
 * Полная реализация MedflexTransport через /schedule/ + /direct_appointment/doctor/execute/.
 *
 * Ключевые свойства:
 *   - getSlots: живой /schedule/ с 5-мин кэшем; фильтрует по doctor_id + дате
 *   - createBooking: идемпотентность через SQLite; 90-с таймаут; NO auto-retry
 *   - cancelBooking: POST /direct_appointment/doctor/cancel/
 *
 * Переменные окружения: MEDFLEX_CLINIC_TOKEN, MEDFLEX_BASE_URL (опционально).
 */
export class MedflexTransport implements BookingTransport {

  async getSlots(q: SlotQuery): Promise<AvailableSlot[]> {
    let records: MedflexScheduleRecord[]
    try {
      records = await getScheduleRecords()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      throw new Error(`Не удалось получить расписание: ${msg}`)
    }

    // Фильтруем записи по doctor_id (и опционально по lpu_id)
    const doctorRecords = records.filter(
      (r) =>
        r.doctor_id === q.doctorId &&
        (q.lpuId == null || r.lpu_id === q.lpuId)
    )

    if (doctorRecords.length === 0) return []

    // Собираем слоты из всех филиалов, относящихся к этому врачу на указанную дату
    const slots: AvailableSlot[] = []

    for (const record of doctorRecords) {
      // Находим первую специальность и цену (приоритет по первой специальности врача)
      const primarySpecialityId = record.specialities[0]
      const priceEntry = record.prices.find((p) => p.speciality_id === primarySpecialityId)
      const price = priceEntry?.price ?? 0

      for (const cell of record.cells) {
        if (scheduleToDate(cell.dt_start) !== q.date) continue

        const time = scheduleToTime(cell.dt_start)

        // Исключаем прошедшие слоты
        if (isPastSlot(q.date, time)) continue

        slots.push({
          time,
          dtStart: cell.dt_start,
          dtEnd: cell.dt_end,
          specialityId: primarySpecialityId,
          price,
          lpuId: record.lpu_id,
        })
      }
    }

    // Сортируем по времени
    slots.sort((a, b) => a.time.localeCompare(b.time))

    return slots
  }

  async createBooking(b: BookingInput): Promise<BookingResult> {
    // ── Валидация MedFlex-специфичных полей ───────────────────────────────────
    if (!b.lastName || !b.firstName) {
      return {
        success: false,
        error: "Для онлайн-записи необходимо указать Фамилию и Имя раздельно",
      }
    }
    if (!b.birthday) {
      return {
        success: false,
        error: "Для онлайн-записи необходима дата рождения",
      }
    }
    if (!b.lpuId || !b.specialityId) {
      return {
        success: false,
        error: "Выберите врача и специальность для записи",
      }
    }
    if (!b.dtStart || !b.dtEnd) {
      return {
        success: false,
        error: "Выберите время записи (dtStart/dtEnd не переданы)",
      }
    }

    // ── Нормализация телефона ─────────────────────────────────────────────────
    const mobilePhone =
      b.mobilePhone ?? normalizePhone(b.phone) ?? ""
    if (!mobilePhone) {
      return { success: false, error: "Не удалось нормализовать номер телефона" }
    }

    // ── Верификация слота по расписанию (бесплатно, защита от griefing) ─────────
    // Проверяем наличие ячейки в живом расписании ДО записи в idempotency-log
    // и ДО вызова execute/. Fake dtStart → бесплатный 400 вместо платного execute/.
    // price и specialityId берём ИЗ расписания — клиентским значениям не доверяем.
    let verifiedSpecialityId: number
    let verifiedPrice: number
    let verifiedDtEnd: string

    try {
      const scheduleRecords = await getScheduleRecords()

      // Ищем запись этого врача в указанном филиале
      const record = scheduleRecords.find(
        (r) => r.doctor_id === b.doctorId && r.lpu_id === b.lpuId
      )
      if (!record) {
        return { success: false, error: "Выбранный слот больше недоступен" }
      }

      // Ищем ячейку с точным совпадением dt_start
      const cell = record.cells.find((c) => c.dt_start === b.dtStart)
      if (!cell) {
        return { success: false, error: "Выбранный слот больше недоступен" }
      }

      // Берём speciality_id из расписания (первая специальность врача)
      const rawSpecialityId = record.specialities[0]
      if (rawSpecialityId === undefined) {
        return { success: false, error: "Специальность врача не определена в расписании" }
      }
      verifiedSpecialityId = rawSpecialityId

      // Берём цену из расписания по специальности — игнорируем клиентский price
      const priceEntry = record.prices.find((p) => p.speciality_id === verifiedSpecialityId)
      if (!priceEntry) {
        // Цена не определена — не отправляем 0₽ молча (клиника недоберёт)
        return { success: false, error: "Не удалось определить стоимость приёма — запишитесь по телефону" }
      }
      verifiedPrice = priceEntry.price

      // dt_end тоже из расписания
      verifiedDtEnd = cell.dt_end
    } catch (err) {
      // Расписание недоступно — не рискуем вызывать execute/
      const msg = err instanceof Error ? err.message : String(err)
      console.error("[MedflexTransport.createBooking] schedule verification failed:", msg)
      return { success: false, error: "Не удалось проверить доступность слота. Попробуйте позже." }
    }

    // ── Идемпотентность ───────────────────────────────────────────────────────
    const patientName = [b.lastName, b.firstName, b.secondName]
      .filter(Boolean)
      .join(" ")
    const idempotencyKey = `${b.doctorId}_${b.dtStart}_${mobilePhone}`

    const idem = checkIdempotency(
      idempotencyKey,
      b.doctorId,
      b.lpuId,
      verifiedSpecialityId,
      b.dtStart,
      mobilePhone,
      patientName
    )

    if (idem.action === "duplicate") {
      // Уже успешно создано — возвращаем тот же claim_id
      return { success: true, claimId: idem.claimId }
    }

    if (idem.action === "pending") {
      return {
        success: false,
        error: "Запись уже обрабатывается. Пожалуйста, подождите.",
      }
    }

    // action === 'proceed' (или 'error' — уже удалён старый, создан новый pending)

    // ── Построение payload execute/ (только верифицированные значения) ─────────
    const payload = {
      doctor: {
        id: b.doctorId,
        lpu_id: b.lpuId,
        speciality_id: verifiedSpecialityId,   // из расписания, не от клиента
      },
      appointment: {
        dt_start: scheduleToIso(b.dtStart),
        dt_end: scheduleToIso(verifiedDtEnd),  // из расписания, не от клиента
        price: verifiedPrice,                   // из расписания, не от клиента
        comment: b.comment ?? "",
      },
      client: {
        last_name: b.lastName,
        first_name: b.firstName,
        second_name: b.secondName ?? "",
        mobile_phone: mobilePhone,
        birthday: b.birthday,
      },
      call_trackings: null,
    }

    // ── Вызов execute/ (90 с таймаут, АВТОРЕТРАИ ЗАПРЕЩЕНЫ) ──────────────────
    try {
      const result = await createMedflexAppointment(payload)
      markIdempotencySuccess(idempotencyKey, result.claim_id)
      // Сбрасываем кэш расписания — слот занят
      invalidateScheduleCache()
      return { success: true, claimId: result.claim_id }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err)
      markIdempotencyError(idempotencyKey, errorMsg)

      if (err instanceof MedflexConfigError) {
        return { success: false, error: "Онлайн-запись временно недоступна (конфигурация)" }
      }
      if (err instanceof MedflexApiError) {
        if (err.status === 400) {
          return { success: false, error: "Слот недоступен или данные пациента некорректны" }
        }
        if (err.status === 409) {
          return { success: false, error: "Этот слот уже занят. Выберите другое время." }
        }
        return {
          success: false,
          error: "Сервис записи временно недоступен. Попробуйте позже.",
        }
      }
      return { success: false, error: "Ошибка при создании записи" }
    }
  }

  async cancelBooking(claimId: string): Promise<CancelResult> {
    try {
      await cancelMedflexAppointment(claimId)
      invalidateScheduleCache()
      return { success: true }
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err)
      return { success: false, error }
    }
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

  async getSlots(q: SlotQuery): Promise<AvailableSlot[]> {
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
