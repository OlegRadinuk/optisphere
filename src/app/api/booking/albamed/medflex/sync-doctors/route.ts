/**
 * POST /api/booking/albamed/medflex/sync-doctors
 *
 * Защищённый эндпоинт для однократной (ручной) синхронизации кэша врачей
 * из МедФлекса /models/doctor/ → medflex_doctors_cache в SQLite.
 *
 * КАЖДЫЙ ВЫЗОВ ТАРИФИЦИРУЕТСЯ за каждого врача.
 * Вызывать только один раз при первоначальном подключении или при явной
 * инвалидации кэша. Плановые обновления — через вебхук /medflex/webhook.
 *
 * Авторизация: заголовок X-Sync-Secret = env MEDFLEX_SYNC_SECRET
 * Если MEDFLEX_SYNC_SECRET не задан — эндпоинт возвращает 503 (защита по умолчанию).
 *
 * Ответ:
 *   200 { synced_doctors: N, synced_specialities: M, took_ms: T }
 *
 * Пример использования (из терминала):
 *   curl -X POST https://<host>/api/booking/albamed/medflex/sync-doctors \
 *        -H "X-Sync-Secret: <MEDFLEX_SYNC_SECRET>"
 */
import { timingSafeEqual } from "crypto"
import { NextRequest, NextResponse } from "next/server"
import {
  syncDoctorsToCache,
  syncSpecialitiesToCache,
} from "@/lib/albamed/medflex-cache"
import { MedflexApiError, MedflexConfigError } from "@/lib/medflex"
import { checkRateLimit } from "@/lib/booking/rate-limit"

export async function POST(req: NextRequest): Promise<Response> {
  // Rate limit: max 3 попытки/мин с одного IP (защита от brute-force секрета)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(ip, 3)) {
    return NextResponse.json(
      { error: "Слишком много запросов. Попробуйте позже." },
      { status: 429 }
    )
  }

  const secret = process.env.MEDFLEX_SYNC_SECRET
  if (!secret) {
    return NextResponse.json(
      { error: "Синхронизация не настроена (MEDFLEX_SYNC_SECRET не задан)" },
      { status: 503 }
    )
  }

  const provided = req.headers.get("x-sync-secret") ?? ""

  // Constant-time compare — предотвращает timing-атаки на brute-force секрета
  let secretsMatch = false
  try {
    const a = Buffer.from(provided)
    const b = Buffer.from(secret)
    secretsMatch = a.length === b.length && timingSafeEqual(a, b)
  } catch {
    secretsMatch = false
  }

  if (!secretsMatch) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const start = Date.now()

  try {
    const [syncedDoctors, syncedSpecialities] = await Promise.all([
      syncDoctorsToCache(),
      syncSpecialitiesToCache(),
    ])

    const tookMs = Date.now() - start
    console.info(`[sync-doctors] Done: ${syncedDoctors} doctors, ${syncedSpecialities} specialities in ${tookMs}ms`)

    return NextResponse.json({
      success: true,
      synced_doctors: syncedDoctors,
      synced_specialities: syncedSpecialities,
      took_ms: tookMs,
    })
  } catch (err) {
    console.error("[sync-doctors] Error:", err)

    if (err instanceof MedflexConfigError) {
      return NextResponse.json(
        { error: "Не настроен MEDFLEX_CLINIC_TOKEN" },
        { status: 500 }
      )
    }
    if (err instanceof MedflexApiError) {
      return NextResponse.json(
        { error: `МедФлекс вернул ошибку: ${err.message}` },
        { status: 502 }
      )
    }

    return NextResponse.json({ error: "Ошибка синхронизации" }, { status: 500 })
  }
}
