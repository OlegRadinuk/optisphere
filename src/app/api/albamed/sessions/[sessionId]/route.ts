import { NextRequest, NextResponse } from "next/server"
import { isAuthenticated } from "@/app/api/admin/auth/route"
import { getDb, getSessionMessages } from "@/lib/db"
import type { Lead, Message } from "@/lib/db"

const CLIENT_ID = 1

type SessionDetailResponse = {
  messages: Pick<Message, "role" | "content" | "created_at">[]
  lead: Pick<Lead, "name" | "phone" | "status"> | null
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<Response> {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { sessionId } = await params

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "Invalid session ID" }, { status: 400 })
    }

    const db = getDb()

    // Verify the session belongs to this client
    const sessionExists = db
      .prepare(
        "SELECT 1 as ok FROM messages WHERE client_id = ? AND session_id = ? LIMIT 1"
      )
      .get(CLIENT_ID, sessionId) as { ok: number } | undefined

    if (!sessionExists) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const rawMessages = getSessionMessages(CLIENT_ID, sessionId)
    const messages = rawMessages.map((m) => ({
      role: m.role,
      content: m.content,
      created_at: m.created_at,
    }))

    const rawLead = db
      .prepare(
        "SELECT name, phone, status FROM leads WHERE client_id = ? AND session_id = ? LIMIT 1"
      )
      .get(CLIENT_ID, sessionId) as
      | Pick<Lead, "name" | "phone" | "status">
      | undefined

    const response: SessionDetailResponse = {
      messages,
      lead: rawLead ?? null,
    }

    return NextResponse.json(response)
  } catch (err) {
    console.error("[albamed/sessions/[sessionId] GET] Error:", err)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
