import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { WORKING_PROXY } from "@/lib/ai-config"
import { DEFAULT_BOT_MODEL } from "@/lib/bots/model"

const HEX_RE = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
function validateHex(v: unknown, field: string): { error: string } | null {
  if (v !== undefined && (typeof v !== "string" || !HEX_RE.test(v))) {
    return { error: `${field}: must be a valid CSS hex color (#rgb or #rrggbb)` }
  }
  return null
}
// Validates widget appearance fields for POST and PATCH.
// Returns an error object or null.
function validateWidgetAppearance(data: Partial<{ widget_avatar_letter: string; widget_avatar_url: string; widget_online_dot: number; widget_subtitle: string }>): { error: string } | null {
  if (data.widget_avatar_letter !== undefined) {
    if (typeof data.widget_avatar_letter !== "string") return { error: "widget_avatar_letter: must be a string" }
    const v = data.widget_avatar_letter
    // Unicode-aware: allows Cyrillic, Latin, digits (e.g. "В", "A", "1")
    if (v !== "" && (!/^\S{1,2}$/u.test(v) || /[\u0000-\u001f]/.test(v))) {
      return { error: "widget_avatar_letter: must be empty or 1–2 non-whitespace characters" }
    }
  }
  if (data.widget_avatar_url !== undefined) {
    if (typeof data.widget_avatar_url !== "string") return { error: "widget_avatar_url: must be a string" }
    const v = data.widget_avatar_url
    if (v !== "" && (!v.startsWith("https://") || v.length > 500)) {
      return { error: "widget_avatar_url: must be empty or an https:// URL up to 500 characters" }
    }
  }
  if (data.widget_online_dot !== undefined) {
    const v = Number(data.widget_online_dot)
    if (v !== 0 && v !== 1) return { error: "widget_online_dot: must be 0 or 1" }
  }
  if (data.widget_subtitle !== undefined) {
    if (typeof data.widget_subtitle !== "string") return { error: "widget_subtitle: must be a string" }
    if (data.widget_subtitle.length > 60) return { error: "widget_subtitle: max 60 characters" }
  }
  return null
}
import {
  getAllClients,
  createClient,
  updateClient,
  deleteClient,
  getClientBySlug,
  getClientStats,
  getLeads,
  type Client,
} from "@/lib/db"

async function auth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return null
}

// GET /api/admin/clients — list all with stats
// GET /api/admin/clients?slug=X — single client with stats + leads
export async function GET(request: NextRequest): Promise<Response> {
  const deny = await auth()
  if (deny) return deny

  const slug = request.nextUrl.searchParams.get("slug")

  if (slug) {
    const client = getClientBySlug(slug)
    if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 })
    const stats = getClientStats(client.id)
    const leads = getLeads(client.id)
    return NextResponse.json({ client, stats, leads })
  }

  const clients = getAllClients()
  const result = clients.map((c) => ({
    ...c,
    stats: getClientStats(c.id),
  }))
  return NextResponse.json(result)
}

// POST /api/admin/clients — create
export async function POST(request: NextRequest): Promise<Response> {
  const deny = await auth()
  if (deny) return deny

  let data: Partial<Client>
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!data.slug || !data.name) {
    return NextResponse.json({ error: "slug and name required" }, { status: 400 })
  }

  // Validate slug
  if (!/^[a-z0-9-]+$/.test(data.slug)) {
    return NextResponse.json(
      { error: "slug: only lowercase letters, numbers, hyphens" },
      { status: 400 }
    )
  }

  // Validate hex colors
  const colorErr = validateHex(data.widget_color, "widget_color") ?? validateHex(data.widget_text_color, "widget_text_color")
  if (colorErr) return NextResponse.json(colorErr, { status: 400 })

  // Validate widget appearance fields
  const appearErr = validateWidgetAppearance(data)
  if (appearErr) return NextResponse.json(appearErr, { status: 400 })

  // Normalise widget_online_dot to integer
  if (data.widget_online_dot !== undefined) {
    data.widget_online_dot = Number(data.widget_online_dot) as 0 | 1
  }

  try {
    const client = createClient({
      slug: data.slug,
      name: data.name,
      description: data.description ?? "",
      system_prompt: data.system_prompt ?? "",
      api_key: data.api_key ?? "",
      base_url: data.base_url ?? WORKING_PROXY,
      model: data.model ?? DEFAULT_BOT_MODEL,
      tg_token: data.tg_token ?? "",
      tg_chat_id: data.tg_chat_id ?? "",
      widget_color: data.widget_color ?? "#2563eb",
      widget_text_color: data.widget_text_color ?? "#ffffff",
      widget_title: data.widget_title ?? "Ассистент",
      widget_placeholder: data.widget_placeholder ?? "Напишите вопрос…",
      widget_avatar_letter: data.widget_avatar_letter ?? "",
      widget_avatar_url: data.widget_avatar_url ?? "",
      widget_online_dot: data.widget_online_dot ?? 0,
      widget_subtitle: (data.widget_subtitle ?? "").slice(0, 60),
      rate_limit: data.rate_limit ?? 30,
      active: data.active ?? 1,
      context_url: data.context_url ?? "",
      quick_replies: data.quick_replies ?? "",
      greeting: (data.greeting ?? "").slice(0, 1000),
    })
    return NextResponse.json(client, { status: 201 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error"
    if (msg.includes("UNIQUE")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 })
    }
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

// PATCH /api/admin/clients?slug=X — update
export async function PATCH(request: NextRequest): Promise<Response> {
  const deny = await auth()
  if (deny) return deny

  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  let data: Partial<Client>
  try {
    data = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Серверная страховка: ограничиваем длину greeting независимо от клиента
  if (typeof data.greeting === "string") {
    data.greeting = data.greeting.slice(0, 1000)
  }

  // Validate hex colors
  const patchColorErr = validateHex(data.widget_color, "widget_color") ?? validateHex(data.widget_text_color, "widget_text_color")
  if (patchColorErr) return NextResponse.json(patchColorErr, { status: 400 })

  // Validate widget appearance fields
  const patchAppearErr = validateWidgetAppearance(data)
  if (patchAppearErr) return NextResponse.json(patchAppearErr, { status: 400 })

  // tg_include_transcript must be exactly 0 or 1
  if (data.tg_include_transcript !== undefined) {
    const v = Number(data.tg_include_transcript)
    if (v !== 0 && v !== 1) {
      return NextResponse.json({ error: "tg_include_transcript: must be 0 or 1" }, { status: 400 })
    }
    data.tg_include_transcript = v
  }

  // Normalise widget_online_dot to integer
  if (data.widget_online_dot !== undefined) {
    data.widget_online_dot = Number(data.widget_online_dot) as 0 | 1
  }

  // Clamp widget_subtitle to max 60 chars (already validated above, guard for edge cases)
  if (typeof data.widget_subtitle === "string") {
    data.widget_subtitle = data.widget_subtitle.slice(0, 60)
  }

  updateClient(slug, data)
  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/clients?slug=X — delete
export async function DELETE(request: NextRequest): Promise<Response> {
  const deny = await auth()
  if (deny) return deny

  const slug = request.nextUrl.searchParams.get("slug")
  if (!slug) return NextResponse.json({ error: "slug required" }, { status: 400 })

  deleteClient(slug)
  return NextResponse.json({ ok: true })
}
