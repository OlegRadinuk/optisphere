/**
 * POST /api/booking/albamed/medflex/webhook
 *
 * Приёмник вебхуков от МедФлекса.
 * Документированные типы событий: `services`, `doctors`.
 *
 * При событии `doctors`:
 *   → синхронизирует medflex_doctors_cache из /models/doctor/
 *   ТАРИФИЦИРУЕТСЯ за каждого врача
 *
 * Авторизация: заголовок X-Medflex-Secret = env MEDFLEX_WEBHOOK_SECRET
 * Если секрет не задан в env — вебхуки отклоняются с 403
 * (защита по умолчанию — чтобы не вызвать случайный платный запрос).
 *
 * Троттлинг: повторный sync doctors/services не чаще раза в 5 минут
 * (последний updated_at берётся из medflex_doctors_cache).
 *
 * Регистрация вебхука в кабинете МедФлекса:
 *   URL: https://<host>/api/booking/albamed/medflex/webhook
 *   Добавь заголовок: X-Medflex-Secret: <MEDFLEX_WEBHOOK_SECRET>
 *   (или узнай, как МедФлекс подписывает вебхуки — возможно hmac-подпись)
 *
 * ВАЖНО: МедФлекс может слать вебхуки с телом разного формата — логгируем
 * всё что пришло для отладки при первом подключении.
 */
import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { syncDoctorsToCache, syncSpecialitiesToCache } from "@/lib/albamed/medflex-cache"
import { MedflexApiError, MedflexConfigError } from "@/lib/medflex"
import { checkRateLimit } from "@/lib/booking/rate-limit"

// Троттл-интервал: не чаще одного полного sync в 5 минут (300 000 мс)
const SYNC_THROTTLE_MS = 5 * 60 * 1000

/** Проверяет, прошло ли достаточно времени с последнего sync врачей */
function isDoctorSyncThrottled(): boolean {
  const db = getDb()
  const row = db
    .prepare("SELECT MAX(updated_at) AS last_sync FROM medflex_doctors_cache")
    .get() as { last_sync: string | null } | undefined

  if (!row?.last_sync) return false // кэш пуст → sync разрешён

  const lastSyncMs = new Date(row.last_sync).getTime()
  return Date.now() - lastSyncMs < SYNC_THROTTLE_MS
}

/** Проверяет, прошло ли достаточно времени с последнего sync специальностей */
function isSpecialitySyncThrottled(): boolean {
  const db = getDb()
  const row = db
    .prepare("SELECT MAX(updated_at) AS last_sync FROM medflex_specialities_cache")
    .get() as { last_sync: string | null } | undefined

  if (!row?.last_sync) return false

  const lastSyncMs = new Date(row.last_sync).getTime()
  return Date.now() - lastSyncMs < SYNC_THROTTLE_MS
}

export async function POST(req: NextRequest): Promise<Response> {
  // Rate limit: max 3 запроса/мин с одного IP (защита от brute-force секрета)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(ip, 3)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    )
  }

  const webhookSecret = process.env.MEDFLEX_WEBHOOK_SECRET

  if (!webhookSecret) {
    // Секрет не настроен → не принимаем вебхуки во избежание нежелательных платных вызовов
    console.warn("[medflex/webhook] MEDFLEX_WEBHOOK_SECRET не задан, отклоняем вебхук")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 403 })
  }

  const providedSecret = req.headers.get("x-medflex-secret") ?? ""

  // Constant-time compare — предотвращает timing-атаки на brute-force секрета
  let secretsMatch = false
  try {
    const a = Buffer.from(providedSecret)
    const b = Buffer.from(webhookSecret)
    secretsMatch = a.length === b.length && timingSafeEqual(a, b)
  } catch {
    secretsMatch = false
  }

  if (!secretsMatch) {
    console.warn("[medflex/webhook] Invalid or missing X-Medflex-Secret")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // Парсим тело (МедФлекс может слать JSON или form-urlencoded — сначала пробуем JSON)
  let payload: Record<string, unknown> = {}
  try {
    const text = await req.text()
    if (text) {
      payload = JSON.parse(text) as Record<string, unknown>
    }
  } catch {
    // Тело не JSON или пустое — логгируем и продолжаем
    console.info("[medflex/webhook] Non-JSON body received (or empty)")
  }

  const event = (payload.event as string | undefined) ?? ""
  console.info("[medflex/webhook] Received:", { event, payload })

  try {
    if (event === "doctors") {
      // Платный вызов — только по явному webhook от МедФлекса + троттл 5 мин
      if (isDoctorSyncThrottled()) {
        console.info("[medflex/webhook] doctors sync throttled (< 5 min since last)")
        return NextResponse.json({ success: true, message: "sync throttled, skipped" })
      }
      const count = await syncDoctorsToCache()
      console.info(`[medflex/webhook] doctors sync: ${count} records`)
      return NextResponse.json({ success: true, synced_doctors: count })
    }

    if (event === "services") {
      if (isSpecialitySyncThrottled()) {
        console.info("[medflex/webhook] services sync throttled (< 5 min since last)")
        return NextResponse.json({ success: true, message: "sync throttled, skipped" })
      }
      const count = await syncSpecialitiesToCache()
      console.info(`[medflex/webhook] services sync: ${count} specialities`)
      return NextResponse.json({ success: true, synced_specialities: count })
    }

    // Неизвестное событие — возвращаем 200 чтобы МедФлекс не повторял
    console.info("[medflex/webhook] Unknown event, ignoring:", event)
    return NextResponse.json({ success: true, message: `unknown event: ${event}` })
  } catch (err) {
    console.error("[medflex/webhook] Sync error:", err)

    if (err instanceof MedflexConfigError) {
      return NextResponse.json({ error: "Ошибка конфигурации" }, { status: 500 })
    }
    if (err instanceof MedflexApiError) {
      return NextResponse.json(
        { error: `МедФлекс API error: ${err.message}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
