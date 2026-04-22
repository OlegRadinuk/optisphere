import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
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

  try {
    const client = createClient({
      slug: data.slug,
      name: data.name,
      description: data.description ?? "",
      system_prompt: data.system_prompt ?? "",
      api_key: data.api_key ?? "",
      base_url: data.base_url ?? "https://api.anthropic.com",
      model: data.model ?? "claude-haiku-4-5-20251001",
      tg_token: data.tg_token ?? "",
      tg_chat_id: data.tg_chat_id ?? "",
      widget_color: data.widget_color ?? "#2563eb",
      widget_title: data.widget_title ?? "Ассистент",
      widget_placeholder: data.widget_placeholder ?? "Напишите вопрос…",
      rate_limit: data.rate_limit ?? 30,
      active: data.active ?? 1,
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
