import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getClientBySlug, getSessionMessages } from "@/lib/db"

// GET /api/admin/clients/[slug]/sessions/[sessionId]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; sessionId: string }> }
): Promise<Response> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug, sessionId } = await params
  const client = getClientBySlug(slug)
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const messages = getSessionMessages(client.id, sessionId)
  return NextResponse.json(messages)
}
