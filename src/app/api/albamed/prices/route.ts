/**
 * GET /api/albamed/prices?branch=kantar|kievskaya
 *
 * Публичный прайс клиники Альба-Мед, забираемый из МедФлекса (1С клиники).
 * Кросс-доменно дёргается с WordPress-сайта alba-medcenter.ru — токен
 * МедФлекса остаётся на нашей стороне (см. src/lib/medflex.ts, src/lib/albamed/prices.ts).
 *
 * Ответ группирован по категориям, категории и услуги внутри — по алфавиту,
 * услуги с price === 0 (незаполненные позиции) исключены.
 *
 * Кэш: см. src/lib/albamed/prices.ts — свежий кэш в памяти процесса на 6 часов,
 * fallback на последний удачный ответ при сбое МедФлекса.
 */
import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { getAlbamedPrices, type AlbamedPricesResponse } from "@/lib/albamed/prices"
import { MedflexApiError, MedflexConfigError } from "@/lib/medflex"

// ── CORS: явный whitelist, никаких "*" ──────────────────────────────────────

const ALLOWED_ORIGINS = new Set([
  "https://alba-medcenter.ru",
  "https://www.alba-medcenter.ru",
])

function corsHeaders(origin: string | null): HeadersInit {
  const headers: Record<string, string> = { Vary: "Origin" }
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    headers["Access-Control-Allow-Origin"] = origin
    headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    headers["Access-Control-Allow-Headers"] = "Content-Type"
  }
  return headers
}

// ── Query validation ─────────────────────────────────────────────────────────

const QuerySchema = z.object({
  branch: z.enum(["kantar", "kievskaya"]).default("kantar"),
})

export async function GET(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  const cors = corsHeaders(origin)

  const parsed = QuerySchema.safeParse({
    branch: req.nextUrl.searchParams.get("branch") ?? undefined,
  })

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid branch" },
      { status: 400, headers: cors }
    )
  }

  const { branch } = parsed.data

  try {
    const result = await getAlbamedPrices(branch)
    const body: AlbamedPricesResponse = result.data

    const cacheControl = result.stale
      ? "public, max-age=60" // сбой у МедФлекса — просим клиента перепроверить скоро
      : "public, max-age=21600" // 6 часов — совпадает с TTL внутреннего кэша

    return NextResponse.json(body, {
      status: 200,
      headers: {
        ...cors,
        "Cache-Control": cacheControl,
        "X-Prices-Cache": result.fromCache ? "HIT" : "MISS",
        "X-Prices-Stale": String(result.stale),
      },
    })
  } catch (err) {
    if (err instanceof MedflexConfigError) {
      console.error("[albamed/prices GET] config error:", err.message)
      return NextResponse.json(
        { error: "Прайс временно недоступен (не настроена интеграция)" },
        { status: 500, headers: cors }
      )
    }

    if (err instanceof MedflexApiError) {
      console.error("[albamed/prices GET] Medflex API error:", err.message)
      return NextResponse.json(
        { error: "Прайс временно недоступен, попробуйте позже" },
        { status: 502, headers: cors }
      )
    }

    console.error("[albamed/prices GET] unexpected error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers: cors })
  }
}

export async function OPTIONS(req: NextRequest): Promise<Response> {
  const origin = req.headers.get("origin")
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
