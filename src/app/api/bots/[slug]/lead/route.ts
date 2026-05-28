import { NextRequest, NextResponse } from "next/server"
import { getClientBySlug, saveLead, getMessagesBySession } from "@/lib/db"

const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
})

async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`https://tg-proxy.radinuko.workers.dev/bot${token}/sendMessage`, {
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
    const mskTime = new Date().toLocaleString("ru-RU", {
      timeZone: "Europe/Moscow",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })

    const header = [
      `🔔 <b>Новая заявка — ${client.name}</b>`,
      "",
      `👤 ${name || "—"}`,
      ...(phone ? [`📞 ${phone}`] : []),
      ...(email ? [`✉️ ${email}`] : []),
      ...(message ? [`💬 ${message}`] : []),
    ].join("\n")

    let fullText = header

    // Append last 10 messages from this session
    if (sessionId) {
      const msgs = getMessagesBySession(client.id, sessionId, 10).reverse()
      if (msgs.length > 0) {
        const botName = client.widget_title || client.name
        const history = msgs
          .map((m) => `${m.role === "user" ? "👤 Клиент" : `🤖 ${botName}`}: ${m.content.replace(/\[SAVE_LEAD\]/g, "").trim().slice(0, 500)}`)
          .join("\n\n")
        fullText += `\n\n<b>💬 Переписка:</b>\n${history}`
      }
    }

    fullText += `\n\n⏱️ ${mskTime} МСК`

    const chatIds = client.tg_chat_id.split(",").map((id: string) => id.trim()).filter(Boolean)
    await Promise.all(chatIds.map((chatId: string) => sendTelegram(client.tg_token, chatId, fullText)))
  }

  return NextResponse.json({ ok: true }, { headers: cors })
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, { status: 204, headers: corsHeaders(origin) })
}
