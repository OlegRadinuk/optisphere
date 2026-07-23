/**
 * Кэш справочников МедФлекса в SQLite.
 *
 * ВРАЧИ (/models/doctor/) — 💰 ПЛАТНЫЙ за каждого врача.
 * Стратегия: дёрнуть ОДИН РАЗ при первом запросе (lazy init), сохранить в SQLite,
 * обновлять только по вебхуку `doctors` → /api/booking/albamed/medflex/webhook.
 * НИКАКОГО периодического цикла синхронизации.
 *
 * СПЕЦИАЛЬНОСТИ (/models/speciality/) — предположительно бесплатные.
 * Кэшируются аналогично — один раз и по вебхуку.
 *
 * Публичный API:
 *   syncDoctorsToCache()      — разово скачать и сохранить всех врачей
 *   syncSpecialitiesToCache() — разово скачать и сохранить специальности
 *   ensureDoctorsCache()      — lazy-init: вызывать перед чтением из кэша
 *   ensureSpecialitiesCache() — lazy-init для специальностей
 *   getDoctorFromCache(id)    — ФИО + специальности по medflex doctor_id
 *   getDoctorName(id)         — "Фамилия И.О." для UI
 *   getSpecialityName(id)     — название специальности по id
 *   getAllDoctorsFromCache()   — все врачи из кэша
 */

import { getDb } from "@/lib/db"
import {
  fetchMedflexDoctors,
  fetchMedflexSpecialities,
  type MedflexDoctorModel,
  type MedflexSpecialityModel,
} from "@/lib/medflex"

// ── Типы кэша ────────────────────────────────────────────────────────────────

export interface CachedDoctor {
  doctorId: number
  lastName: string
  firstName: string
  secondName: string
  /** JSON-массив [{id: number, name?: string}] */
  specialities: Array<{ id: number; name?: string }>
  updatedAt: string
}

export interface CachedSpeciality {
  specialityId: number
  name: string
}

// ── Внутренние флаги anti-thundering-herd ────────────────────────────────────

// Простой in-process флаг: в Next.js один процесс = один сервер.
// При PM2 cluster — каждый worker синхронизирует независимо (INSERT OR REPLACE).
// Это допустимо: в худшем случае /models/doctor/ вызывается дважды при холодном старте.
let _doctorSyncInProgress = false
let _specialitySyncInProgress = false

// ── syncDoctorsToCache ────────────────────────────────────────────────────────

/**
 * Скачивает ВСЕХ врачей из МедФлекса и сохраняет в SQLite.
 * 💰 Каждый вызов этой функции тарифицируется за каждого врача.
 * Вызывать ТОЛЬКО один раз (через ensureDoctorsCache или webhook).
 */
/**
 * МедФлекс `/models/doctor/` обычно отдаёт ФИО одной строкой `efio`
 * ("Фамилия Имя Отчество"), а раздельных last_name/first_name может не быть.
 * Берём раздельные поля, если пришли; иначе разбираем `efio` по пробелам.
 */
function resolveDoctorName(d: MedflexDoctorModel): { last: string; first: string; second: string } {
  if (d.last_name || d.first_name) {
    return { last: d.last_name ?? "", first: d.first_name ?? "", second: d.second_name ?? "" }
  }
  const parts = (d.efio ?? "").trim().split(/\s+/).filter(Boolean)
  return {
    last: parts[0] ?? "",
    first: parts[1] ?? "",
    second: parts.slice(2).join(" "),
  }
}

export async function syncDoctorsToCache(): Promise<number> {
  if (_doctorSyncInProgress) {
    console.warn("[medflex-cache] syncDoctorsToCache: already in progress, skip")
    return 0
  }
  _doctorSyncInProgress = true

  try {
    const doctors = await fetchMedflexDoctors()
    const db = getDb()

    const upsert = db.prepare(`
      INSERT OR REPLACE INTO medflex_doctors_cache
        (doctor_id, last_name, first_name, second_name, specialities, raw_json, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `)

    const batchInsert = db.transaction((rows: MedflexDoctorModel[]) => {
      for (const d of rows) {
        const { last, first, second } = resolveDoctorName(d)
        upsert.run(
          d.id,
          last,
          first,
          second,
          JSON.stringify(d.specialities ?? []),
          JSON.stringify(d)
        )
      }
    })

    batchInsert(doctors)
    console.info(`[medflex-cache] syncDoctorsToCache: cached ${doctors.length} doctors`)
    return doctors.length
  } finally {
    _doctorSyncInProgress = false
  }
}

// ── syncSpecialitiesToCache ───────────────────────────────────────────────────

/**
 * Скачивает все специальности из МедФлекса и сохраняет в SQLite.
 * Предположительно бесплатный метод — проверить по балансу.
 */
export async function syncSpecialitiesToCache(): Promise<number> {
  if (_specialitySyncInProgress) {
    console.warn("[medflex-cache] syncSpecialitiesToCache: already in progress, skip")
    return 0
  }
  _specialitySyncInProgress = true

  try {
    const specialities = await fetchMedflexSpecialities()
    const db = getDb()

    const upsert = db.prepare(`
      INSERT OR REPLACE INTO medflex_specialities_cache (speciality_id, name, updated_at)
      VALUES (?, ?, datetime('now'))
    `)

    const batchInsert = db.transaction((rows: MedflexSpecialityModel[]) => {
      for (const s of rows) {
        upsert.run(s.id, s.name ?? "")
      }
    })

    batchInsert(specialities)
    console.info(`[medflex-cache] syncSpecialitiesToCache: cached ${specialities.length} specialities`)
    return specialities.length
  } finally {
    _specialitySyncInProgress = false
  }
}

// ── ensureDoctorsCache ────────────────────────────────────────────────────────

/**
 * Lazy-init: если кэш врачей пуст — синхронизирует автоматически.
 * Вызывается перед любым чтением из medflex_doctors_cache.
 * Возвращает true если синхронизация была запущена.
 */
export async function ensureDoctorsCache(): Promise<boolean> {
  const db = getDb()
  const { n } = db
    .prepare("SELECT COUNT(*) AS n FROM medflex_doctors_cache")
    .get() as { n: number }

  if (n > 0) return false

  // Первый запрос → синхронизируем
  console.info("[medflex-cache] ensureDoctorsCache: cache empty, syncing from MedFlex...")
  await syncDoctorsToCache()
  return true
}

/**
 * Lazy-init для специальностей.
 */
export async function ensureSpecialitiesCache(): Promise<boolean> {
  const db = getDb()
  const { n } = db
    .prepare("SELECT COUNT(*) AS n FROM medflex_specialities_cache")
    .get() as { n: number }

  if (n > 0) return false

  console.info("[medflex-cache] ensureSpecialitiesCache: cache empty, syncing...")
  await syncSpecialitiesToCache()
  return true
}

// ── Чтение из кэша ────────────────────────────────────────────────────────────

/**
 * Возвращает запись врача по medflex doctor_id, или null если не найдено.
 */
export function getDoctorFromCache(doctorId: number): CachedDoctor | null {
  const db = getDb()
  const row = db
    .prepare(
      "SELECT doctor_id, last_name, first_name, second_name, specialities, updated_at FROM medflex_doctors_cache WHERE doctor_id = ?"
    )
    .get(doctorId) as {
      doctor_id: number
      last_name: string
      first_name: string
      second_name: string
      specialities: string
      updated_at: string
    } | undefined

  if (!row) return null

  let specialities: Array<{ id: number; name?: string }> = []
  try {
    specialities = JSON.parse(row.specialities) as typeof specialities
  } catch { /* ignore */ }

  return {
    doctorId: row.doctor_id,
    lastName: row.last_name,
    firstName: row.first_name,
    secondName: row.second_name,
    specialities,
    updatedAt: row.updated_at,
  }
}

/**
 * Возвращает "Фамилия И.О." для отображения в UI.
 * Если врача нет в кэше — возвращает "Врач #<id>".
 */
export function getDoctorName(doctorId: number): string {
  const d = getDoctorFromCache(doctorId)
  if (!d) return `Врач #${doctorId}`

  const parts = [d.lastName]
  if (d.firstName) parts.push(d.firstName[0] + ".")
  if (d.secondName) parts.push(d.secondName[0] + ".")
  return parts.join(" ")
}

/**
 * Возвращает "Фамилия Имя Отчество" (полное ФИО) — для отображения на карточке.
 */
export function getDoctorFullName(doctorId: number): string {
  const d = getDoctorFromCache(doctorId)
  if (!d) return `Врач #${doctorId}`
  return [d.lastName, d.firstName, d.secondName].filter(Boolean).join(" ")
}

/**
 * Возвращает название специальности по id, или "Специальность #<id>" если нет в кэше.
 */
export function getSpecialityName(specialityId: number): string {
  const db = getDb()
  const row = db
    .prepare("SELECT name FROM medflex_specialities_cache WHERE speciality_id = ?")
    .get(specialityId) as { name: string } | undefined
  return row?.name ?? `Специальность #${specialityId}`
}

/**
 * Возвращает все врачи из кэша (отсортировано по фамилии).
 */
export function getAllDoctorsFromCache(): CachedDoctor[] {
  const db = getDb()
  const rows = db
    .prepare(
      "SELECT doctor_id, last_name, first_name, second_name, specialities, updated_at FROM medflex_doctors_cache ORDER BY last_name, first_name"
    )
    .all() as Array<{
      doctor_id: number
      last_name: string
      first_name: string
      second_name: string
      specialities: string
      updated_at: string
    }>

  return rows.map((row) => {
    let specialities: Array<{ id: number; name?: string }> = []
    try {
      specialities = JSON.parse(row.specialities) as typeof specialities
    } catch { /* ignore */ }
    return {
      doctorId: row.doctor_id,
      lastName: row.last_name,
      firstName: row.first_name,
      secondName: row.second_name,
      specialities,
      updatedAt: row.updated_at,
    }
  })
}
