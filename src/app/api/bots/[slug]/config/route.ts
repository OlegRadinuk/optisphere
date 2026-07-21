import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const origin = request.headers.get("origin") ?? "*"
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  }

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Not found" }, { status: 404, headers: corsHeaders })
  }

  let quickReplies: unknown[] = []
  if (client.quick_replies) {
    try { quickReplies = JSON.parse(client.quick_replies) } catch { /* invalid JSON — ignore */ }
  }

  return NextResponse.json(
    {
      title: client.widget_title,
      color: client.widget_color,
      placeholder: client.widget_placeholder,
      quick_replies: quickReplies,
      greeting: client.greeting,
      // Consent gate — per-client, defaults OFF (see d:\projects\albamed\spec\bot-compliance.md).
      // The widget only shows the gate/checkbox when these are present.
      consent_required: client.consent_required === 1,
      consent_text: client.consent_text || "",
      policy_url: client.policy_url || "",
    },
    { headers: corsHeaders }
  )
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
