import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug, getClientStats } from "@/lib/db"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
} as const

export async function OPTIONS(): Promise<Response> {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS })
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params
  const client = getClientBySlug(slug)

  if (!client) {
    return NextResponse.json(
      { error: "Not found" },
      { status: 404, headers: CORS_HEADERS }
    )
  }

  const stats = getClientStats(client.id)

  return NextResponse.json(
    {
      messages: stats.messages,
      leads: stats.leads,
      sessions: stats.sessions,
      active: client.active === 1,
    },
    { headers: CORS_HEADERS }
  )
}
