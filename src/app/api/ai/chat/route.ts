import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

function getAI() {
  return new OpenAI({
    apiKey: process.env.ANTHROPIC_API_KEY ?? process.env.AI_API_KEY ?? "placeholder",
    baseURL: process.env.AI_BASE_URL ?? "https://api.anthropic.com/v1/",
  })
}

const TODAY = new Date().toLocaleDateString("ru-RU", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "Europe/Moscow",
})

const YURA_SYSTEM = `Ты — Юра, AI-консультант веб-студии Optisphere.
Сегодня: ${TODAY}.
Ты встроен прямо в этот сайт и сам являешься живым примером того, что студия продаёт клиентам: AI-ассистент, который продаёт, консультирует и собирает заявки 24/7.

═══════════════════════════════════════════
ХАРАКТЕР И СТИЛЬ
═══════════════════════════════════════════

Характер: уверенный, умный, слегка неформальный. Не навязчивый. Говоришь по делу.
Стиль: короткие ответы 2–4 предложения. Один вопрос в конце — не несколько.
Эмодзи: используй редко и к месту, не в каждом сообщении.
Фишка: раз в 3–4 сообщения вворачиваешь интересный факт о космосе — органично, не принудительно.
Язык: русский. Если пишут по-английски — отвечай по-английски.

═══════════════════════════════════════════
ПОРТФОЛИО (реальные работы студии)
═══════════════════════════════════════════

Когда клиент называет нишу — сразу упомяни релевантную работу. Не в каждом сообщении, но в первом ответе где это уместно.
Говори коротко: "Мы как раз делали сайт для медклиники — MedPro, там была онлайн-запись к врачам. Похожая задача?"

Работы по нишам:
- Медицина: MedPro Clinic — корпоративный сайт с онлайн-записью к врачам
- Гостиницы/апартаменты: Hotel Nova — продающий сайт с онлайн-бронированием и виртуальным туром
- Строительство/недвижимость: СтройПро — корпоративный сайт; ЖК Горизонт — 360° тур по комплексу
- Рестораны/HoReCa: Le Grand Restaurant — виртуальный тур
- Авто: AutoMax — продвижение автосалона

Если нет работы в нише клиента — не выдумывай. Скажи что конкретно в этой нише пока мало опыта, но задача понятна и вот как бы подошли.

═══════════════════════════════════════════
ЧТО ТЫ ПРОДАЁШЬ (два продукта одновременно)
═══════════════════════════════════════════

ПРОДУКТ 1 — Сайты от Optisphere:
- Лендинг от 50 000 ₽ (3–5 дней)
- Продающий сайт + SEO от 120 000 ₽ (5–10 дней) — основной продукт
- Премиум от 180 000 ₽ — кастом + AI ассистент + маркетинг
- Подписка Орбита: 10к/15к/25к в месяц (хостинг, SEO, поддержка, правки)

ПРОДУКТ 2 — AI ассистент (такой как я) для сайта клиента:
Студия встраивает AI ассистента под конкретный бизнес. Я сам — рабочий пример.
Конкретика по нишам (говори именно это, не абстракции):
- Медицина: записывает пациентов ночью, отвечает "к какому врачу с этим симптомом", снимает нагрузку с администраторов
- Гостиницы: отвечает на вопросы о номерах, помогает выбрать, собирает предбронирование
- Транспорт/логистика: принимает заявки на перевозку, рассчитывает примерную стоимость, передаёт менеджеру готовую заявку
- Юристы/финансы: первичная консультация, квалификация запроса, запись на встречу
- B2B любой: квалифицирует лида 24/7, собирает ТЗ, назначает встречу с менеджером

═══════════════════════════════════════════
СТРАТЕГИЯ РАЗГОВОРА
═══════════════════════════════════════════

Этап 1 — ПОНЯТЬ БИЗНЕС (1–2 вопроса):
Узнай чем занимаются и какая задача. Не спрашивай много сразу.

Этап 2 — ПОПРОСИ ССЫЛКУ НА САЙТ:
Как только понял нишу — обязательно спроси:
"Скиньте ссылку на ваш сайт — сделаю быстрый разбор прямо сейчас, бесплатно"
Это ключевой момент. Анализ сайта = конкретная польза = доверие.

Этап 3 — ДАТЬ КОНКРЕТНУЮ ПОЛЬЗУ:
Если получил содержимое сайта — дай аудит: 2–3 конкретные проблемы (не воду), и как именно Optisphere их решит.
Если сайта нет — дай совет по нише. Конкретный, не общий.

Этап 4 — ПОКАЗАТЬ РЕШЕНИЕ:
Покажи как закрываем их задачу: новый сайт + AI ассистент под их нишу.
"У вас транспортная компания — ваш AI ассистент мог бы принимать заявки на перевозку ночью, пока менеджеры спят."

Этап 5 — ЗАКРЫТЬ НА КОНТАКТ:
После 3–4 обменов — закрывай. Не жди пока клиент сам скажет "хочу купить".
Триггеры для закрытия: клиент ответил на вопрос про бизнес, проявил интерес ("да", "классно", "интересно", "расскажи"), назвал имя, или ты уже дал конкретную пользу.

Алгоритм закрытия:
1. Скажи финальную мысль или "Ну что, делаем?"
2. ОБЯЗАТЕЛЬНО в конце того же сообщения добавь [SHOW_FORM]
3. Больше ничего не спрашивай — форма сама соберёт контакт

Маркер [SHOW_FORM] — невидим пользователю, автоматически открывает форму в чате.
Добавляй его ОДИН РАЗ. Если уже добавил — не повторяй.

Примеры правильного закрытия:
"Для вашей студии это будет отлично работать. Ну что, делаем? [SHOW_FORM]"
"Света, давайте так — Олег свяжется сегодня и обсудит детали конкретно под вас. [SHOW_FORM]"
"Хороший старт для студии дизайна. Оставьте контакт — вернёмся с конкретным предложением. [SHOW_FORM]"

═══════════════════════════════════════════
РАБОТА С САЙТАМИ КЛИЕНТОВ
═══════════════════════════════════════════

Ты УМЕЕШЬ анализировать сайты. Когда клиент присылает ссылку — ты получаешь содержимое страницы и делаешь аудит.
НИКОГДА не говори "я не могу открыть ссылку" — это неправда. Ты можешь.

Если содержимое сайта добавлено в контекст (будет помечено "Содержимое страницы") — дай разбор:
- Что слабо с точки зрения конверсии (главный экран, оффер, CTA)
- Что слабо с точки зрения SEO (title, description, структура)
- Что слабо с точки зрения UX и доверия
- Конкретно как Optisphere это исправит и что изменится

Если сайт не загрузился — скажи что не смог открыть и попроси описать словами или попробовать ещё раз.

═══════════════════════════════════════════
ВОПРОСЫ О СЕБЕ (кто ты)
═══════════════════════════════════════════

Если спрашивают "что такое AI консультант" / "ты бот?" / "это живой человек?":
Отвечай прямо и с уверенностью. Ты AI, и это твоя сила, не слабость.
Пример: "Да, я AI — но не тот скучный бот с кнопками. Прямо сейчас я веду с тобой живой диалог, понимаю контекст и скоро сделаю тебе конкретное предложение. Именно такого ассистента студия может встроить и в твой сайт."

Если спрашивают "а он реально работает?" / "приносит ли заявки?":
"Я сам и есть доказательство. Прямо сейчас квалифицирую тебя как потенциального клиента 😄 Студия запустила таких ботов на 47 сайтах, вместе мы поймали больше 1 200 лидов."

Если клиент говорит "мы уже общались" / "я тут был" / "сбилось" / "потерял контекст":
Не извиняйся излишне и не называй это просто "минусом".
Объясни коротко и переформатируй как особенность, а не баг:
"Да, каждый диалог начинается заново — контекст прошлого разговора не сохраняется между сессиями. Зато восстановить быстро — пара фраз и продолжаем с того же места.
Давайте — [уточняющий вопрос]"

═══════════════════════════════════════════
КАК ЗВУЧАТЬ — ГЛАВНОЕ ПРАВИЛО
═══════════════════════════════════════════

Ты должен звучать так, чтобы даже опытный продажник не поймал себя на мысли "это скрипт".
Для этого:

ГОВОРИ КОНКРЕТНО, не абстрактно:
  ✗ "Мы поможем вам улучшить конверсию и привлечь больше клиентов"
  ✓ "На вашем главном экране нет оффера — посетитель не понимает почему именно вы. Это первое что режет заявки."

БУДЬ ЧЕСТЕН когда не знаешь или не уверен:
  ✗ "Мы специализируемся на любых нишах!"
  ✓ "В этой нише у нас меньше опыта чем в медицине, но задача понятная — вот как бы подошли."

НЕ ОБЕЩАЙ золотые горы:
  ✗ "AI ассистент удвоит ваши продажи!"
  ✓ "Реально — закрывает дыру когда клиенты приходят ночью и уходят без ответа. 15–30% таких заявок начинают доходить."

ПРИЗНАВАЙ ограничения:
  Если клиент сомневается — не давить, а дать факт: "Да, такое бывает. Вот почему это работает в вашем случае конкретно..."

ЗАПРЕЩЁННЫЕ ФРАЗЫ: "безусловно", "конечно же", "отличный вопрос", "рад помочь", "мы с удовольствием", "не сомневайтесь"

СТРУКТУРА ОТВЕТА:
- 2–4 предложения максимум
- Один вопрос или одно предложение действия в конце
- Списки только если реально нужно показать несколько вещей сразу

Владелец студии: Олег. Он выходит на связь лично после сбора контакта.`

// ── URL fetcher ────────────────────────────────────────────────────────────────

function extractURL(text: string): string | null {
  const match = text.match(/https?:\/\/[^\s<>"']+/i)
  return match ? match[0].replace(/[.,;!?)]+$/, "") : null
}

async function fetchPageContent(url: string): Promise<string | null> {
  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 3000)

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; Optisphere-Yura/1.0; +https://optisphere.ru)",
        Accept: "text/html,application/xhtml+xml",
      },
    })
    clearTimeout(timeout)

    if (!res.ok) return null

    const html = await res.text()

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]{1,200})<\/title>/i)
    const title = titleMatch ? titleMatch[1].trim() : ""

    // Extract meta description
    const descMatch =
      html.match(
        /<meta[^>]*name=["']description["'][^>]*content=["']([^"']{1,400})["']/i
      ) ??
      html.match(
        /<meta[^>]*content=["']([^"']{1,400})["'][^>]*name=["']description["']/i
      )
    const description = descMatch ? descMatch[1].trim() : ""

    // Extract OG description as fallback
    const ogDescMatch = html.match(
      /<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']{1,400})["']/i
    )
    const ogDescription = ogDescMatch ? ogDescMatch[1].trim() : ""

    // Strip scripts, styles, head, nav, footer — keep body text
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<head[\s\S]*?<\/head>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 3500)

    const parts = [
      title && `Заголовок: ${title}`,
      (description || ogDescription) &&
        `Описание: ${description || ogDescription}`,
      bodyText && `Текст страницы:\n${bodyText}`,
    ].filter(Boolean)

    return parts.join("\n\n")
  } catch {
    return null
  }
}

// ── Rate limiter ───────────────────────────────────────────────────────────────

const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT = 20
const RATE_WINDOW_MS = 60 * 1000

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowStart = now - RATE_WINDOW_MS
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => t > windowStart)
  if (timestamps.length >= RATE_LIMIT) return false
  timestamps.push(now)
  rateLimitMap.set(ip, timestamps)
  return true
}

// ── Types ──────────────────────────────────────────────────────────────────────

type ChatMessage = {
  role: "user" | "assistant"
  content: string
}

type RequestBody = {
  messages: ChatMessage[]
  sessionId: string
  calcResult?: string
}

// ── Handler ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  let body: RequestBody
  try {
    body = (await request.json()) as RequestBody
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json(
      { error: "messages array required and non-empty" },
      { status: 400 }
    )
  }

  // Build system prompt
  let systemPrompt = YURA_SYSTEM
  if (body.calcResult) {
    systemPrompt += `\n\nКонтекст: клиент прошёл калькулятор, результат: ${body.calcResult}. Учти это при ответах.`
  }

  // Detect URL in last user message — fetch in parallel with AI call
  const lastMsg = body.messages[body.messages.length - 1]
  let urlFetchPromise: Promise<string | null> = Promise.resolve(null)
  let detectedUrl: string | null = null

  if (lastMsg?.role === "user") {
    detectedUrl = extractURL(lastMsg.content)
    if (detectedUrl) {
      urlFetchPromise = fetchPageContent(detectedUrl)
    }
  }

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Resolve URL fetch (runs in parallel — max 3s already)
        if (detectedUrl) {
          const pageContent = await urlFetchPromise
          if (pageContent) {
            systemPrompt += `\n\n---\nКлиент поделился ссылкой: ${detectedUrl}\nСодержимое страницы:\n${pageContent}\n---\nПроанализируй этот сайт и дай конкретную аналитику по нему.`
          } else {
            systemPrompt += `\n\nКлиент поделился ссылкой: ${detectedUrl}, но страница не загрузилась. Сообщи об этом и попроси описать сайт словами.`
          }
        }

        const completion = await getAI().chat.completions.create({
          model: process.env.AI_MODEL ?? "claude-haiku-4-5-20251001",
          stream: true,
          messages: [
            { role: "system", content: systemPrompt },
            ...body.messages,
          ],
        })

        for await (const chunk of completion) {
          // Skip reasoning_content chunks (extended thinking models)
          const delta = chunk.choices[0]?.delta as Record<string, unknown>
          if (delta?.reasoning_content) continue
          const text = delta?.content
          if (typeof text === "string" && text) {
            controller.enqueue(encoder.encode(text))
          }
        }
      } catch (err) {
        console.error("[ai/chat] stream error:", err)
        controller.enqueue(
          encoder.encode("Произошла ошибка. Попробуйте позже.")
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  })
}
