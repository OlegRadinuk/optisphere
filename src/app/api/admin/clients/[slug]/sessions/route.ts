import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/lib/auth"
import { getClientBySlug, getSessions } from "@/lib/db"

// GET /api/admin/clients/[slug]/sessions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { slug } = await params
  const client = getClientBySlug(slug)
  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const sessions = getSessions(client.id)
  return NextResponse.json(sessions)
}
