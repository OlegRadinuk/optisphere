import { NextRequest, NextResponse } from "next/server"
import { createHash } from "crypto"
import { z } from "zod"
import { getClientBySlug, saveConsent } from "@/lib/db"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

const ConsentSchema = z.object({
  session_id: z.string().min(1).max(200),
  scope: z.enum(["chat_gate", "lead_form"]),
})

// IP is hashed, never stored raw — see d:\projects\albamed\spec\bot-compliance.md §5.
// A salt makes the hash resistant to rainbow-table reversal; without it we still
// hash (never store the raw IP) but warn so the gap gets fixed in production env.
function hashIp(ip: string): string {
  const salt = process.env.CONSENT_IP_SALT
  if (!salt) {
    console.warn("[consent] CONSENT_IP_SALT is not set — hashing without salt. Set it in the server env.")
  }
  return createHash("sha256").update(`${salt ?? ""}:${ip}`).digest("hex")
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const origin = request.headers.get("origin") ?? "*"
  const cors = corsHeaders(origin)

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: cors })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors })
  }

  const parsed = ConsentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ errors: parsed.error.issues }, { status: 400, headers: cors })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  try {
    saveConsent({
      client_id: client.id,
      session_id: parsed.data.session_id,
      scope: parsed.data.scope,
      policy_version: client.policy_url || "",
      ip_hash: hashIp(ip),
    })
  } catch (err) {
    console.error(`[bots/${slug}/consent]`, err)
    return NextResponse.json({ error: "Internal error" }, { status: 500, headers: cors })
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
