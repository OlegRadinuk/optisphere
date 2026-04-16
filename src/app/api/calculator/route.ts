import { NextRequest, NextResponse } from "next/server"

type RequestBody = {
  business: string
  type: string
  features: string[]
  timeline: string
}

type Tier = "start" | "pro" | "premium"

type CalculatorResponse = {
  min: number
  max: number
  tier: Tier
  days: string
  currency: "₽"
}

const BASE_PRICES: Record<string, [number, number]> = {
  лендинг: [50_000, 120_000],
  landing: [50_000, 120_000],
  сайт: [120_000, 180_000],
  site: [120_000, 180_000],
  магазин: [180_000, 300_000],
  store: [180_000, 300_000],
}

function resolveBase(type: string): [number, number] {
  const key = type.toLowerCase()
  // exact match
  if (BASE_PRICES[key]) return BASE_PRICES[key]
  // fuzzy: содержит ключевое слово
  if (key.includes("лендинг") || key.includes("landing") || key.includes("1 страниц") || key.includes("1 page"))
    return BASE_PRICES["лендинг"]
  if (key.includes("магазин") || key.includes("store") || key.includes("ecommerce"))
    return BASE_PRICES["магазин"]
  // default to сайт
  return BASE_PRICES["сайт"]
}

function resolveDays(timeline: string): string {
  const t = timeline.toLowerCase()
  if (t.includes("срочно") || t.includes("urgent") || t.includes("5")) return "3–5"
  if (t.includes("не горит") || t.includes("no rush") || t.includes("30")) return "14–30"
  return "7–14"
}

export async function POST(
  request: NextRequest
): Promise<NextResponse<CalculatorResponse | { error: string }>> {
  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const { type, features, timeline } = body

  if (!type) {
    return NextResponse.json({ error: "type is required" }, { status: 400 })
  }

  let [min, max] = resolveBase(type)

  // Feature add-ons
  const featureList = Array.isArray(features) ? features : []
  for (const f of featureList) {
    const fl = f.toLowerCase()
    if (fl.includes("ai") || fl.includes("юра") || fl.includes("yura")) {
      min += 20_000
      max += 20_000
    }
    if (fl.includes("каталог") || fl.includes("catalogue") || fl.includes("catalog")) {
      min += 15_000
      max += 15_000
    }
  }

  // Timeline urgency surcharge
  const tl = (timeline ?? "").toLowerCase()
  if (tl.includes("срочно") || tl.includes("urgent")) {
    min = Math.round(min * 1.3)
    max = Math.round(max * 1.3)
  }

  const tier: Tier = min < 100_000 ? "start" : min < 160_000 ? "pro" : "premium"
  const days = resolveDays(timeline ?? "")

  return NextResponse.json({ min, max, tier, days, currency: "₽" })
}
