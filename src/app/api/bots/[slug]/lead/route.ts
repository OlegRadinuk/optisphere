import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug, saveLead } from "@/lib/db"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Access-Control-Allow-Credentials": "true",
})

async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
      }),
    })
  } catch (err) {
    console.error("[lead/telegram]", err)
  }
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

  let body: { name?: string; phone?: string; email?: string; message?: string; sessionId?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: cors })
  }

  const { name = "", phone = "", email = "", message = "", sessionId = "" } = body

  if (!phone && !email) {
    return NextResponse.json({ error: "phone or email required" }, { status: 400, headers: cors })
  }

  saveLead({
    client_id: client.id,
    session_id: sessionId,
    name,
    phone,
    email,
    message,
  })

  // Telegram notification
  if (client.tg_token && client.tg_chat_id) {
    const lines = [
      `🤖 <b>Новая заявка — ${client.name}</b>`,
      name && `👤 Имя: ${name}`,
      phone && `📞 Телефон: ${phone}`,
      email && `✉️ Email: ${email}`,
      message && `💬 ${message}`,
    ]
      .filter(Boolean)
      .join("\n")

    await sendTelegram(client.tg_token, client.tg_chat_id, lines)
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
