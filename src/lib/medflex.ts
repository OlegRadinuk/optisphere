/**
 * Клиент МедФлекса — сырые вызовы к API МедФлекса (обёртка над их 1С-выгрузкой).
 *
 * Авторизация: заголовок `Authorization: Token <MEDFLEX_CLINIC_TOKEN>` (именно
 * `Token`, не `Bearer` — так у МедФлекса).
 *
 * Прайс и категории — БЕСПЛАТНЫЕ методы по тарифу нашего сервисного токена
 * (см. комментарий у MEDFLEX_CLINIC_TOKEN в .env.local). Тарифицируются только
 * создание записи и /models/doctor/ — их этот файл не вызывает.
 *
 * Формат ответа у обоих list-эндпоинтов одинаковый конверт:
 *   { links: { next, previous }, count, num_pages, data: { lpu_id, <items> } }
 * Проверено живым запросом 2026-07-19, не по документации из головы.
 *
 * Только для серверного использования — используется process.env без
 * NEXT_PUBLIC_ префикса, поэтому в клиентский бандл не попадёт при импорте
 * из Route Handler / Server Component. Пакет `server-only` в проекте не
 * установлен, поэтому явной защиты от случайного клиентского импорта нет —
 * не импортируй этот файл из `"use client"` компонентов.
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
