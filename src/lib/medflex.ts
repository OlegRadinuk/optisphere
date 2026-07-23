/**
 * Клиент МедФлекса — сырые вызовы к API МедФлекса (обёртка над их 1С-выгрузкой).
 *
 * Авторизация: заголовок `Authorization: Token <MEDFLEX_CLINIC_TOKEN>` (именно
 * `Token`, не `Bearer` — так у МедФлекса).
 *
 * Стоимость вызовов (подтверждено кабинетом, 2026-07-22):
 *   БЕСПЛАТНЫЕ: /schedule/, /services/prices/, /services/categories/, /models/speciality/
 *   💰 ПЛАТНЫЕ:  /direct_appointment/doctor/execute/ — 2 ₽ за запрос
 *               /models/doctor/                       — тарифицируется за каждого врача
 *
 * Только для серверного использования — используется process.env без
 * NEXT_PUBLIC_ префикса, поэтому в клиентский бандл не попадёт при импорте
 * из Route Handler / Server Component.
 */

const DEFAULT_BASE_URL = "https://api.medflex.ru"
const REQUEST_TIMEOUT_MS = 15_000

export interface MedflexService {
  id: string
  category_id: number
  name: string
  duration: number
  price: number
  doctor_ids: number[]
}

export interface MedflexCategory {
  id: number
  name: string
}

interface MedflexPricesResponse {
  links: { next: string | null; previous: string | null }
  count: number
  num_pages: number
  data: { lpu_id: number; services: MedflexService[] }
}

interface MedflexCategoriesResponse {
  links: { next: string | null; previous: string | null }
  count: number
  num_pages: number
  data: { lpu_id: number; categories: MedflexCategory[] }
}

/** Токен не настроен в окружении — интеграция не может работать. */
export class MedflexConfigError extends Error {
  constructor(message: string) {
    super(message)
    this.name = "MedflexConfigError"
  }
}

/** МедФлекс ответил ошибкой, таймаутом или сетевым сбоем. */
export class MedflexApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "MedflexApiError"
    this.status = status
  }
}

function getMedflexToken(): string {
  const token = process.env.MEDFLEX_CLINIC_TOKEN
  if (!token) {
    throw new MedflexConfigError(
      "MEDFLEX_CLINIC_TOKEN не задан в окружении — интеграция с МедФлексом не настроена"
    )
  }
  return token
}

function getMedflexBaseUrl(): string {
  return process.env.MEDFLEX_BASE_URL ?? DEFAULT_BASE_URL
}

async function medflexGet<T>(path: string): Promise<T> {
  const token = getMedflexToken()
  const url = `${getMedflexBaseUrl()}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Token ${token}`,
        Accept: "application/json",
      },
      // Кэшируем на уровне бизнес-логики (src/lib/albamed/prices.ts), а не здесь —
      // тут всегда живой запрос, no-store, чтобы не путать два слоя кэша.
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new MedflexApiError(`МедФлекс недоступен (${path}): ${reason}`)
  }

  if (!res.ok) {
    throw new MedflexApiError(`МедФлекс ответил ${res.status} на ${path}`, res.status)
  }

  return (await res.json()) as T
}

/**
 * Забирает весь прайс филиала — проходит все страницы (по num_pages) и
 * склеивает услуги в один список. Порядок и группировка — не наша забота
 * на этом уровне, это делает src/lib/albamed/prices.ts.
 */
export async function fetchMedflexPrices(lpuId: number): Promise<MedflexService[]> {
  const services: MedflexService[] = []
  let page = 1
  let numPages = 1

  do {
    const res = await medflexGet<MedflexPricesResponse>(
      `/services/prices/?lpu_id=${lpuId}&page=${page}`
    )
    services.push(...res.data.services)
    numPages = res.num_pages
    page += 1
  } while (page <= numPages)

  return services
}

/** Забирает все категории услуг филиала (проходит пагинацию на всякий случай). */
export async function fetchMedflexCategories(lpuId: number): Promise<MedflexCategory[]> {
  const categories: MedflexCategory[] = []
  let page = 1
  let numPages = 1

  do {
    const res = await medflexGet<MedflexCategoriesResponse>(
      `/services/categories/?lpu_id=${lpuId}&page=${page}`
    )
    categories.push(...res.data.categories)
    numPages = res.num_pages
    page += 1
  } while (page <= numPages)

  return categories
}

// ── POST helper ──────────────────────────────────────────────────────────────

/**
 * Выполняет POST-запрос к МедФлекс API.
 * @param path   Путь (например, `/direct_appointment/doctor/execute/`)
 * @param body   JSON-тело запроса
 * @param timeoutMs Таймаут в мс (по умолчанию 15 000; для execute/ передавать 90 000)
 */
async function medflexPost<T>(
  path: string,
  body: unknown,
  timeoutMs = REQUEST_TIMEOUT_MS
): Promise<T> {
  const token = getMedflexToken()
  const url = `${getMedflexBaseUrl()}${path}`

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Token ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(timeoutMs),
    })
  } catch (err) {
    const reason = err instanceof Error ? err.message : String(err)
    throw new MedflexApiError(`МедФлекс недоступен (${path}): ${reason}`)
  }

  if (!res.ok) {
    let detail = ""
    try {
      detail = ` — ${JSON.stringify(await res.json())}`
    } catch { /* игнорируем ошибки парсинга */ }
    throw new MedflexApiError(`МедФлекс ответил ${res.status} на ${path}${detail}`, res.status)
  }

  return (await res.json()) as T
}

// ── Schedule ─────────────────────────────────────────────────────────────────

/** Один свободный слот врача из /schedule/ */
export interface MedflexScheduleCell {
  dt_start: string  // "YYYY-MM-DD HH:MM" — локальное время клиники
  dt_end: string    // "YYYY-MM-DD HH:MM"
}

/** Цена приёма врача по специальности */
export interface MedflexSchedulePrice {
  speciality_id: number
  price: number
}

/**
 * Один врач в расписании — измеренный формат ответа /schedule/.
 * В /schedule/ НЕТ имён врачей и названий специальностей — только id.
 */
export interface MedflexScheduleRecord {
  lpu_id: number
  doctor_id: number
  specialities: number[]    // id специальностей врача
  cells: MedflexScheduleCell[]
  prices: MedflexSchedulePrice[]
  allowed_age: Array<{ speciality_id: number; min: number; max: number }>
}

interface MedflexScheduleResponse {
  links: { next: string | null; previous: string | null }
  count: number
  num_pages: number
  data: MedflexScheduleRecord[]   // МАССИВ, не объект (в отличие от prices/categories)
}

/**
 * Забирает всё расписание по указанным филиалам (проходит пагинацию через links.next).
 * Возвращает сырой массив записей — один элемент на врача.
 * Бесплатный метод.
 *
 * @param lpuIds  Массив lpu_id (у Альба-Мед: [71767, 60992])
 * @param townId  town_id города — ОБЯЗАТЕЛЬНЫЙ параметр (Симферополь: 2202)
 */
export async function fetchMedflexSchedule(
  lpuIds: number[],
  townId: number
): Promise<MedflexScheduleRecord[]> {
  const records: MedflexScheduleRecord[] = []
  const lpuParam = lpuIds.join(",")
  let page = 1
  let numPages = 1

  do {
    const res = await medflexGet<MedflexScheduleResponse>(
      `/schedule/?town_id=${townId}&lpu_ids=${lpuParam}&page=${page}`
    )
    records.push(...res.data)
    numPages = res.num_pages
    page += 1
  } while (page <= numPages)

  return records
}

// ── Direct appointment: execute / cancel ─────────────────────────────────────

/** Тело запроса к /direct_appointment/doctor/execute/ */
export interface MedflexExecutePayload {
  doctor: {
    id: number
    lpu_id: number
    speciality_id: number
  }
  appointment: {
    dt_start: string   // "YYYY-MM-DDTHH:MM:SS" — ISO без зоны
    dt_end: string     // "YYYY-MM-DDTHH:MM:SS"
    price: number      // 0 = бесплатно
    comment: string
  }
  client: {
    last_name: string
    first_name: string
    second_name: string     // пустая строка если нет отчества
    mobile_phone: string    // "79000000000" — строго этот формат
    birthday: string        // "YYYY-MM-DD"
  }
  call_trackings: null
}

/** Ответ /direct_appointment/doctor/execute/ */
export interface MedflexExecuteResponse {
  claim_id: string   // uuid4 — идентификатор созданной записи
}

/** Тело запроса к /direct_appointment/doctor/cancel/ */
export interface MedflexCancelPayload {
  uuid: string   // МедФлекс использует uuid, не claim_id (измерено 2026-07-23)
}

/**
 * Создаёт запись на приём к врачу.
 *
 * 🔴 КРИТИЧЕСКИЕ ТРЕБОВАНИЯ:
 *   - Синхронный вызов, который МИС клиники выполняет до 60 с.
 *     Таймаут здесь — 90 с (с запасом).
 *   - ТАРИФИЦИРУЕТСЯ ЗА КАЖДЫЙ ЗАПРОС (2 ₽). Авторетраи ЗАПРЕЩЕНЫ.
 *   - Идемпотентность обеспечивается на уровне transport.ts (medflex_booking_log).
 *
 * НЕ ВЫЗЫВАЙ ЭТУ ФУНКЦИЮ напрямую — только через MedflexTransport.createBooking,
 * который добавляет защиту от дублей.
 */
export async function createMedflexAppointment(
  payload: MedflexExecutePayload
): Promise<MedflexExecuteResponse> {
  // Таймаут 90 с — МедФлекс сам говорит "до минуты"
  return medflexPost<MedflexExecuteResponse>(
    "/direct_appointment/doctor/execute/",
    payload,
    90_000
  )
}

/**
 * Отменяет запись на приём по claim_id, возвращённому execute/.
 * Таймаут стандартный 15 с.
 */
export async function cancelMedflexAppointment(claimId: string): Promise<void> {
  const payload: MedflexCancelPayload = { uuid: claimId }
  await medflexPost<unknown>("/direct_appointment/doctor/cancel/", payload)
}

// ── Справочники: врачи, специальности ───────────────────────────────────────

/**
 * Модель врача из /models/doctor/.
 * Exact field names не подтверждены живым запросом — исходим из контракта execute/
 * (там client.{last_name, first_name, second_name}) и документации МедФлекс.
 * При расхождении с реальным ответом — скорректировать и обновить medflex-cache.ts.
 */
export interface MedflexDoctorModel {
  id: number
  last_name: string
  first_name: string
  second_name: string
  efio?: string            // МедФлекс часто отдаёт ФИО склеенной строкой вместо раздельных полей
  specialities: Array<{ id: number; name?: string }>
  lpu_ids?: number[]       // может присутствовать, может нет
  [key: string]: unknown   // другие поля, которые нас не касаются
}

interface MedflexDoctorsResponse {
  links: { next: string | null; previous: string | null }
  count: number
  num_pages: number
  data: MedflexDoctorModel[]
}

/** Модель специальности из /models/speciality/ */
export interface MedflexSpecialityModel {
  id: number
  name: string
  [key: string]: unknown
}

interface MedflexSpecialitiesResponse {
  links: { next: string | null; previous: string | null }
  count: number
  num_pages: number
  data: MedflexSpecialityModel[]
}

/**
 * Забирает все записи врачей.
 *
 * 🔴 ПЛАТНЫЙ за каждого врача. Вызывать ОДИН РАЗ, сохранять в кэш.
 * Не использовать в циклах или с TTL-таймером — молча жжёт баланс.
 * Обновление кэша — только по вебхуку `doctors` (/api/booking/albamed/medflex/webhook).
 *
 * Пробуем /models/doctor/all/ (без пагинации), fallback на /models/doctor/ с пагинацией.
 */
export async function fetchMedflexDoctors(): Promise<MedflexDoctorModel[]> {
  // Попытка через /all/ (если поддерживается — возвращает все сразу без пагинации)
  try {
    const res = await medflexGet<MedflexDoctorsResponse>("/models/doctor/all/")
    if (Array.isArray(res.data) && res.data.length > 0) {
      return res.data
    }
  } catch {
    // /all/ не поддерживается — пробуем paginated
  }

  // Paginated fallback
  const doctors: MedflexDoctorModel[] = []
  let page = 1
  let numPages = 1

  do {
    const res = await medflexGet<MedflexDoctorsResponse>(`/models/doctor/?page=${page}`)
    doctors.push(...res.data)
    numPages = res.num_pages
    page += 1
  } while (page <= numPages)

  return doctors
}

/**
 * Забирает все специальности.
 * Предположительно бесплатный метод — проверить по балансу после первого вызова.
 */
export async function fetchMedflexSpecialities(): Promise<MedflexSpecialityModel[]> {
  const specialities: MedflexSpecialityModel[] = []
  let page = 1
  let numPages = 1

  do {
    const res = await medflexGet<MedflexSpecialitiesResponse>(`/models/speciality/?page=${page}`)
    specialities.push(...res.data)
    numPages = res.num_pages
    page += 1
  } while (page <= numPages)

  return specialities
}

// ── Вспомогательные конвертеры для форматов дат ─────────────────────────────

/**
 * Возвращает дату-время в формате, принимаемом /direct_appointment/doctor/execute/.
 * МедФлекс принимает "YYYY-MM-DD HH:MM" (формат cells в /schedule/) —
 * ISO-формат "YYYY-MM-DDTHH:MM:SS" API отклоняет с ошибкой 400.
 * Измерено: 2026-07-23, execute/ вернул {"dt_start":["Неправильный формат datetime.
 * Используйте один из этих форматов: YYYY-MM-DD hh:mm."]}.
 */
export function scheduleToIso(dt: string): string {
  // Принимаем "YYYY-MM-DD HH:MM" как есть — МедФлекс хочет именно этот формат
  return dt
}

/**
 * Извлекает "HH:MM" из "YYYY-MM-DD HH:MM" для отображения в UI.
 */
export function scheduleToTime(dt: string): string {
  return dt.slice(11, 16)
}

/**
 * Извлекает "YYYY-MM-DD" из "YYYY-MM-DD HH:MM".
 */
export function scheduleToDate(dt: string): string {
  return dt.slice(0, 10)
}
