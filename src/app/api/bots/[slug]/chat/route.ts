import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"
import { getClientBySlug, saveMessage } from "@/lib/db"

// ── Rate limiter (per ip+slug) ─────────────────────────────────────────────────
const rateLimitMap = new Map<string, number[]>()

function checkRateLimit(key: string, limit: number): boolean {
  const now = Date.now()
  const window = now - 60_000
  const ts = (rateLimitMap.get(key) ?? []).filter((t) => t > window)
  if (ts.length >= limit) return false
  ts.push(now)
  rateLimitMap.set(key, ts)
  return true
}

// ── URL fetcher ────────────────────────────────────────────────────────────────
function extractURL(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s<>"']+/i)
  return m ? m[0].replace(/[.,;!?)]+$/, "") : null
}

async function fetchPage(url: string): Promise<string | null> {
  try {
    const ctrl = new AbortController()
    const timer = setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BotAssistant/1.0)" },
    })
    clearTimeout(timer)
    if (!res.ok) return null
    const html = await res.text()
    const title = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)?.[1]?.trim() ?? ""
    const desc =
      html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']{1,400})["']/i)?.[1]?.trim() ?? ""
    const body = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 3000)
    return [title && `Заголовок: ${title}`, desc && `Описание: ${desc}`, body && `Содержимое: ${body}`]
      .filter(Boolean)
      .join("\n\n")
  } catch {
    return null
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────
type ChatMsg = { role: "user" | "assistant"; content: string }
type Body = { messages: ChatMsg[]; sessionId?: string }

// ── Handler ────────────────────────────────────────────────────────────────────
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
): Promise<Response> {
  const { slug } = await params

  // CORS — widget runs on external sites
  const origin = request.headers.get("origin") ?? "*"
  const corsHeaders = {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  }

  const client = getClientBySlug(slug)
  if (!client || !client.active) {
    return NextResponse.json({ error: "Bot not found" }, { status: 404, headers: corsHeaders })
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  if (!checkRateLimit(`${ip}:${slug}`, client.rate_limit)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: corsHeaders })
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400, headers: corsHeaders })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "messages required" }, { status: 400, headers: corsHeaders })
  }

  const sessionId = body.sessionId ?? `anon-${Date.now()}`

  // Save user message
  const lastUserMsg = body.messages[body.messages.length - 1]
  if (lastUserMsg?.role === "user") {
    try { saveMessage(client.id, sessionId, "user", lastUserMsg.content) } catch {}
  }

  // Build system prompt with today's date
  const today = new Date().toLocaleDateString("ru-RU", {
    day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Moscow",
  })
  let systemPrompt = client.system_prompt + `\n\nСегодня: ${today}.`

  // URL detection
  let urlFetchPromise: Promise<string | null> = Promise.resolve(null)
  let detectedUrl: string | null = null
  if (lastUserMsg?.role === "user") {
    detectedUrl = extractURL(lastUserMsg.content)
    if (detectedUrl) urlFetchPromise = fetchPage(detectedUrl)
  }

  const ai = new OpenAI({
    apiKey: client.api_key || process.env.ANTHROPIC_API_KEY,
    baseURL: client.base_url || process.env.AI_BASE_URL,
  })

  const encoder = new TextEncoder()
  let assistantReply = ""

  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (detectedUrl) {
          const content = await urlFetchPromise
          if (content) {
            systemPrompt += `\n\n---\nПользователь поделился ссылкой: ${detectedUrl}\n${content}\n---`
          }
        }

        // Inject system prompt into first user message — some proxies ignore the system role
        const apiMessages = body.messages.map((m, i) => {
          if (i === 0 && m.role === "user") {
            return { ...m, content: `${systemPrompt}\n\n---\n${m.content}` }
          }
          return m
        })

        const completion = await ai.chat.completions.create({
          model: client.model,
          stream: true,
          messages: apiMessages,
        })

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta as Record<string, unknown>
          if (delta?.reasoning_content) continue
          const text = delta?.content
          if (typeof text === "string" && text) {
            assistantReply += text
            controller.enqueue(encoder.encode(text))
          }
        }

        // Persist assistant reply
        if (assistantReply) {
          try { saveMessage(client.id, sessionId, "assistant", assistantReply) } catch {}
        }
      } catch (err) {
        console.error(`[bots/${slug}/chat]`, err)
        controller.enqueue(encoder.encode("Произошла ошибка. Попробуйте позже."))
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}

export async function OPTIONS(request: NextRequest): Promise<Response> {
  const origin = request.headers.get("origin") ?? "*"
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Credentials": "true",
    },
  })
}
