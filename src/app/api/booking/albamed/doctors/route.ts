/**
 * GET /api/booking/albamed/doctors
 *
 * Список врачей для формы записи.
 *
 * Режим LOCAL (BOOKING_TRANSPORT=local):
 *   Читает из SQLite (doctors WHERE client_id=1 AND active=1).
 *
 * Режим MEDFLEX (BOOKING_TRANSPORT=medflex):
 *   Список формируется из живого /schedule/ МедФлекса — только врачи
 *   у которых есть свободные слоты. Имена резолвятся из medflex_doctors_cache
 *   (lazy-init при первом запросе — разовый платный вызов /models/doctor/).
 *
 * CORS: только alba-medcenter.ru (как /api/albamed/prices).
 */
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { fetchMedflexSchedule, MedflexApiError, MedflexConfigError } from "@/lib/medflex"
import {
  ensureDoctorsCache,
  ensureSpecialitiesCache,
  getDoctorFullName,
  getSpecialityName,
} from "@/lib/albamed/medflex-cache"
import doctorPhotos from "@/lib/albamed/doctor-photos.json"

// ── Фото врачей (с сайта alba-medcenter.ru) ────────────────────────────────
// МедФлекс фото не отдаёт — подставляем по ФИО из статической карты.
function photoNameKey(full: string): string {
  const p = (full || "").replace(/\s+/g, " ").trim().split(" ")
  const sn = (p[0] ?? "") + (p[1] ?? "") // фамилия+имя, без отчества
  return sn.toLowerCase().replace(/ё/g, "е").replace(/[^а-яa-z]+/g, "")
}
const PHOTO_MAP: Map<string, string> = new Map(
  (doctorPhotos as Array<{ name: string; photo: string }>).map((d) => [
    photoNameKey(d.name),
    d.photo,
  ])
)
function resolvePhoto(fullName: string): string | null {
  return PHOTO_MAP.get(photoNameKey(fullName)) ?? null
}

// ── CORS whitelist ─────────────────────────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  "https://alba-medcenter.ru",
  "https://www.alba-medcenter.ru",
])

function corsHeaders(origin: string | null): Record<string, string> {
  const headers: Record<string, string> = { Vary: "Origin" }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Content-Type"
  }
  return headers
}

// ── Константы Альба-Мед ────────────────────────────────────────────────────

const CLIENT_ID = 1
const MEDFLEX_TOWN_ID = 2202
const MEDFLEX_LPU_IDS = [71767, 60992]
const LPU_BRANCH: Record<number, number> = { 71767: 1, 60992: 2 }

// ── Типы ───────────────────────────────────────────────────────────────────

export type PublicDoctor = {
  id: number
  name: string
  specialty: string
  branch: number
  photo_url: string | null
  appointment_price: string | null
  /** Только в MedFlex-режиме: список speciality_id у врача (нужен для выбора слота) */
  speciality_ids?: number[]
}

// ── Handlers ──────────────────────────────────────────────────────────────

export async function GET(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin)

  const mode = process.env.BOOKING_TRANSPORT ?? "local"

  try {
    if (mode === "medflex") {
      return await getMedflexDoctors(cors)
    }
    return getLocalDoctors(cors)
  } catch (err) {
    console.error("[booking/albamed/doctors GET]", err)
    if (err instanceof MedflexConfigError) {
      return NextResponse.json(
        { error: "Список врачей временно недоступен (конфигурация)" },
        { status: 500, headers: cors }
      )
    }
    if (err instanceof MedflexApiError) {
      return NextResponse.json(
        { error: "Список врачей временно недоступен, попробуйте позже" },
        { status: 502, headers: cors }
      )
    }
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}

// ── LOCAL: из SQLite ───────────────────────────────────────────────────────

function getLocalDoctors(cors: Record<string, string>): Response {
  const db = getDb()
  const rows = db
    .prepare(
      `SELECT id, name, specialty, branch, photo_url, appointment_price
       FROM doctors
       WHERE client_id = ? AND active = 1
       ORDER BY id ASC`
    )
    .all(CLIENT_ID) as PublicDoctor[]

  return NextResponse.json({ doctors: rows }, { headers: cors })
}

// ── MEDFLEX: из /schedule/ + doctor cache ─────────────────────────────────

async function getMedflexDoctors(cors: Record<string, string>): Promise<Response> {
  // Lazy-init кэша врачей и специальностей (разовый платный вызов при первом запросе)
  await ensureDoctorsCache()
  await ensureSpecialitiesCache()

  // Живое расписание — только врачи с доступными слотами
  const records = await fetchMedflexSchedule(MEDFLEX_LPU_IDS, MEDFLEX_TOWN_ID)

  // Дедупликация: один врач может быть в нескольких филиалах или нескольких специальностях
  // Для UI берём первую встреченную запись, агрегируем специальности
  const doctorMap = new Map<number, {
    record: typeof records[0]
    allSpecialities: Set<number>
    minPrice: number | null
  }>()

  for (const record of records) {
    if (record.cells.length === 0) continue  // нет слотов — не показываем

    if (!doctorMap.has(record.doctor_id)) {
      doctorMap.set(record.doctor_id, {
        record,
        allSpecialities: new Set(record.specialities),
        minPrice: null,
      })
    } else {
      const entry = doctorMap.get(record.doctor_id)!
      record.specialities.forEach((s) => entry.allSpecialities.add(s))
    }

    // Собираем минимальную цену
    const entry = doctorMap.get(record.doctor_id)!
    for (const p of record.prices) {
      if (p.price > 0 && (entry.minPrice === null || p.price < entry.minPrice)) {
        entry.minPrice = p.price
      }
    }
  }

  const doctors: PublicDoctor[] = []

  for (const [doctorId, { record, allSpecialities, minPrice }] of doctorMap) {
    const fullName = getDoctorFullName(doctorId)

    // Получаем название первой специальности
    const primarySpecialityId = record.specialities[0]
    const specialty = primarySpecialityId
      ? getSpecialityName(primarySpecialityId)
      : ""

    // Форматируем цену
    let appointmentPrice: string | null = null
    if (minPrice != null && minPrice > 0) {
      appointmentPrice = new Intl.NumberFormat("ru-RU").format(minPrice) + " ₽"
    }

    // branch: маппим lpu_id → 1|2
    const branch = LPU_BRANCH[record.lpu_id] ?? 1

    doctors.push({
      id: doctorId,
      name: fullName,
      specialty,
      branch,
      photo_url: resolvePhoto(fullName),   // МедФлекс фото не отдаёт — из карты по ФИО
      appointment_price: appointmentPrice,
      speciality_ids: Array.from(allSpecialities),
    })
  }

  // Сортируем по фамилии
  doctors.sort((a, b) => a.name.localeCompare(b.name, "ru"))

  return NextResponse.json(
    { doctors },
    {
      headers: {
        ...cors,
        "Cache-Control": "no-store",  // расписание меняется
      },
    }
  )
}
