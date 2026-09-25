import { NextRequest, NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import zlib from "zlib"
import { getClientBySlug, saveMessage, getMessagesBySession, getDb } from "@/lib/db"
import { isSafeFetchUrl } from "@/lib/safe-url"
import { resolveBaseURL } from "@/lib/ai-config"
import { guessService } from "@/lib/bot-summary"

// ── Telegram helper (same proxy as lead route) ────────────────────────────────
async function sendTelegram(token: string, chatId: string, text: string) {
  try {
    await fetch(`https://tg-proxy.radinuko.workers.dev/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
    })
  } catch (err) {
    console.error("[chat/telegram]", err)
  }
}

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

// ── GZIP fetch wrapper ─────────────────────────────────────────────────────────
// Сжимает тело запроса >8 КБ перед отправкой через CF Worker.
// Причина: CF-воркер обрывает входящий поток при теле >~30 КБ;
// gzip даёт коэф. ~4× на русском тексте → все промпты под порогом.
const gzipFetch: typeof fetch = async (input, init) => {
  const b = init?.body
  if (typeof b === "string" && Buffer.byteLength(b, "utf8") > 8192) {
    const gz = zlib.gzipSync(Buffer.from(b, "utf8"))
    const h = new Headers(init?.headers)
    h.set("content-encoding", "gzip")
    h.delete("content-length")
    return fetch(input, { ...init, body: gz, headers: h })
  }
  return fetch(input as RequestInfo | URL, init)
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

// ── Context cleaner ────────────────────────────────────────────────────────────
// Если context_url вернул HTML — снять теги. Обрезать до maxBytes.
function cleanContextText(raw: string, maxBytes: number): string {
  const prefix = raw.slice(0, 500).toLowerCase()
  let text = raw
  if (prefix.includes("<html") || prefix.includes("<!doctype")) {
    text = raw
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()
  }
  const buf = Buffer.from(text, "utf8")
  if (buf.length <= maxBytes) return text
  // Срезаем по байтам; последний символ может быть битым — убираем с конца
  return buf.slice(0, maxBytes).toString("utf8").replace(/[\uFFFD\u0080-\u00BF]+$/u, "")
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

  // Build system prompt with pre-calculated dates (don't let the model do calendar math)
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Europe/Moscow" }))
  const todayStr = now.toLocaleDateString("ru-RU", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  })
  const dayOfWeek = now.getDay() // 0=Sun, 6=Sat

  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const fmt = (d: Date) => d.toLocaleDateString("ru-RU", { weekday: "short", day: "numeric", month: "long" })

  const tomorrow = addDays(now, 1)
  // This Saturday (0 days ahead if today is Sat, else find next Sat)
  const daysToThisSat = dayOfWeek === 6 ? 0 : (6 - dayOfWeek + 7) % 7
  const thisSat = addDays(now, daysToThisSat)
  const thisSun = addDays(thisSat, 1)
  const nextSat = addDays(thisSat, 7)
  const nextSun = addDays(nextSat, 1)

  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })

  // Universal, business-neutral time context. Every bot gets a clean "now" and
  // reasons about its OWN working hours from its system prompt — no clinic-specific
  // text leaks into apartment/construction bots.
  const calendarCtx = `\n\n━━━ ТЕКУЩИЕ ДАТА И ВРЕМЯ (Москва) ━━━
Сейчас: ${timeStr}, ${todayStr}.
Завтра — ${fmt(tomorrow)}. Ближайшие выходные: ${fmt(thisSat)} – ${fmt(thisSun)}; следующие: ${fmt(nextSat)} – ${fmt(nextSun)}.
Это РЕАЛЬНОЕ текущее время. Считай его «сейчас» и «сегодня». Сам даты не вычисляй — бери только отсюда. На слова клиента «сегодня», «завтра», «на выходные» опирайся на эти числа.`

  let systemPrompt = client.system_prompt + calendarCtx

  // Fetch external context (availability, hot deals, etc.)
  // HTML-страницы очищаем от тегов, обрезаем до 12 КБ чтобы не раздувать тело запроса.
  if (client.context_url) {
    try {
      const ctxRes = await fetch(client.context_url, {
        signal: AbortSignal.timeout(3000),
        headers: { "User-Agent": "Optisphere-Bot/1.0", "Accept-Encoding": "gzip, deflate" },
      })
      if (ctxRes.ok) {
        const ctxRaw = await ctxRes.text()
        if (ctxRaw.trim()) {
          const ctxCleaned = cleanContextText(ctxRaw.trim(), 12_000)
          const rawBytes = Buffer.byteLength(ctxRaw, "utf8")
          const cleanedBytes = Buffer.byteLength(ctxCleaned, "utf8")
          console.info(`[bots/${slug}/context] raw=${rawBytes}b → cleaned=${cleanedBytes}b`)
          systemPrompt += "\n\n" + ctxCleaned
        }
      }
    } catch {
      // Silent fail — bot works without context
    }
  }

  // URL detection
  let urlFetchPromise: Promise<string | null> = Promise.resolve(null)
  let detectedUrl: string | null = null
  if (lastUserMsg?.role === "user") {
    detectedUrl = extractURL(lastUserMsg.content)
    if (detectedUrl && !isSafeFetchUrl(detectedUrl)) detectedUrl = null
    if (detectedUrl) urlFetchPromise = fetchPage(detectedUrl)
  }

  const baseURL = resolveBaseURL(client.base_url || process.env.AI_BASE_URL)

  const ai = new Anthropic({
    apiKey: client.api_key || process.env.ANTHROPIC_API_KEY || "",
    baseURL,
    fetch: gzipFetch as unknown as typeof fetch,
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

        // ── System prompt size audit ───────────────────────────────────────────
        const promptBytes = Buffer.byteLength(systemPrompt, "utf8")
        console.info(`[bots/${slug}/prompt] systemPrompt=${promptBytes}b`)
        if (promptBytes > 60_000) {
          console.warn(`[bots/${slug}/prompt] TRUNCATED: ${promptBytes}b > 60000b limit`)
          // Срезаем системный промпт: оставляем первые 60 КБ
          systemPrompt = Buffer.from(systemPrompt, "utf8").slice(0, 60_000).toString("utf8")
            .replace(/[\uFFFD\u0080-\u00BF]+$/u, "")
        }

        // ── 20-second timeout via AbortController ─────────────────────────────
        const abortCtrl = new AbortController()
        const timeoutId = setTimeout(() => abortCtrl.abort(), 20_000)

        let timedOut = false
        try {
          const response = await ai.messages.stream(
            {
              model: client.model,
              max_tokens: 1024,
              system: systemPrompt,
              messages: body.messages,
            },
            { signal: abortCtrl.signal }
          )
          clearTimeout(timeoutId)

          for await (const chunk of response) {
            if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
              const text = chunk.delta.text
              if (text) {
                assistantReply += text
                controller.enqueue(encoder.encode(text))
              }
            }
          }
        } catch (aiErr: unknown) {
          clearTimeout(timeoutId)
          if (abortCtrl.signal.aborted) {
            timedOut = true
            console.warn(`[bots/${slug}/chat] timeout after 20s`)
            controller.enqueue(
              encoder.encode("Извините, запрос занял слишком долго. Пожалуйста, попробуйте ещё раз.")
            )
          } else {
            throw aiErr
          }
        }

        if (timedOut) return

        // Persist assistant reply
        if (assistantReply) {
          try { saveMessage(client.id, sessionId, "assistant", assistantReply) } catch {}
        }

        // Engaged session notification — send once when session reaches exactly 6 messages
        // (3 user + 3 assistant exchanges) and no lead was captured yet
        if (assistantReply && client.tg_token && client.tg_chat_id) {
          try {
            const db = getDb()
            const totalMessages = (db
              .prepare("SELECT COUNT(*) as n FROM messages WHERE client_id = ? AND session_id = ?")
              .get(client.id, sessionId) as { n: number }).n

            if (totalMessages === 6) {
              const hasLead = (db
                .prepare("SELECT COUNT(*) as n FROM leads WHERE client_id = ? AND session_id = ?")
                .get(client.id, sessionId) as { n: number }).n > 0

              if (!hasLead) {
                // consent_required clients (medical, per d:\projects\albamed\spec\bot-compliance.md §4) never get
                // raw dialog quotes in Telegram — chat content may be special-category PD
                // (health data). Other bots (vlad, lifestyle-crimea) keep the full quote,
                // it's a useful ops tool there and nothing sensitive.
                let text: string
                if (client.consent_required) {
                  const userMsgs = getMessagesBySession(client.id, sessionId, 6)
                    .filter((m) => m.role === "user")
                    .map((m) => m.content)
                  const service = guessService(userMsgs, client.quick_replies)
                  text = [
                    `Активный диалог — ${client.name}`,
                    `Интересуется: ${service}`,
                    `Контакт: не оставлен`,
                  ].join("\n")
                } else {
                  const recentMsgs = getMessagesBySession(client.id, sessionId, 4).reverse()
                  const history = recentMsgs
                    .map((m) => `${m.role === "user" ? "Клиент" : "Ассистент"}: ${m.content.replace(/\[SAVE_LEAD\]/g, "").replace(/\[SHOW_FORM\]/g, "").trim().slice(0, 300)}`)
                    .join("\n")

                  text = [
                    `💬 <b>Активный диалог — ${client.name}</b>`,
                    "",
                    history,
                    "",
                    "Контакт пока не оставил",
                  ].join("\n")
                }

                const chatIds = client.tg_chat_id.split(",").map((id: string) => id.trim()).filter(Boolean)
                await Promise.all(chatIds.map((chatId: string) => sendTelegram(client.tg_token, chatId, text)))
              }
            }
          } catch (notifyErr) {
            console.error("[chat/engaged-notify]", notifyErr)
          }
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
    },
  })
}
