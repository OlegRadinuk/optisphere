import { NextRequest, NextResponse } from "next/server";

type Score = "hot" | "warm" | "cold";

type Brief = {
  have?: string[];
  pace?: string;
  deadline?: string;
  owner?: string;
  note?: string;
};

type RequestBody = {
  name?: string;
  company?: string;
  niche: string;
  situation?: string;
  task?: string;
  scale?: string;
  assistant?: string;
  urgency?: string;
  recommendation?: string;
  brief?: Brief;
  score: Score;
  source?: string;
};

// Rate limit: 20 событий в час на IP (страница персональная, у каждого клиента свой заход)
const rateLimitMap = new Map<string, number[]>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_WINDOW_MS;
  const timestamps = (rateLimitMap.get(ip) ?? []).filter((t) => t > windowStart);
  if (timestamps.length >= RATE_LIMIT) return false;
  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  return true;
}

const scoreLabel: Record<Score, string> = {
  hot: "🔥 ГОРЯЧИЙ",
  warm: "🟡 ТЁПЛЫЙ",
  cold: "❄️ ХОЛОДНЫЙ",
};

const esc = (s: string): string =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests", code: "RATE_LIMIT" },
      { status: 429 }
    );
  }

  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  if (!body.niche || typeof body.niche !== "string") {
    return NextResponse.json(
      { error: "niche is required", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }
  if (!body.score || !["hot", "warm", "cold"].includes(body.score)) {
    return NextResponse.json(
      { error: "score must be hot | warm | cold", code: "VALIDATION_ERROR" },
      { status: 400 }
    );
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    console.error("[leads/warmup] Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID");
    return NextResponse.json(
      { error: "Service unavailable", code: "CONFIG_ERROR" },
      { status: 503 }
    );
  }

  const timestamp = new Date().toLocaleString("ru-RU", {
    timeZone: "Europe/Moscow",
  });

  const b = body.brief ?? {};
  const briefLines = [
    b.have?.length ? `• Есть: ${b.have.join(", ")}` : "",
    b.pace ? `• Темп: ${b.pace}` : "",
    b.deadline ? `• Дедлайн: ${b.deadline}` : "",
    b.owner ? `• Ведение: ${b.owner}` : "",
    b.note ? `• Коммент: ${b.note}` : "",
  ].filter(Boolean);

  const lines: string[] = [
    `${scoreLabel[body.score]} — заявка с подбора /p`,
    "",
    body.name ? `👤 <b>Имя:</b> ${esc(body.name)}` : "",
    body.company ? `🏢 <b>Компания:</b> ${esc(body.company)}` : "",
    `🎯 <b>Ниша:</b> ${esc(body.niche)}`,
    body.situation ? `📞 <b>Сейчас клиенты:</b> ${esc(body.situation)}` : "",
    body.task ? `📌 <b>Задача:</b> ${esc(body.task)}` : "",
    body.scale ? `📐 <b>Масштаб:</b> ${esc(body.scale)}` : "",
    body.assistant ? `🤖 <b>Ассистент:</b> ${esc(body.assistant)}` : "",
    body.urgency ? `⏱ <b>Срочность:</b> ${esc(body.urgency)}` : "",
    body.recommendation ? `\n💡 <b>Рекомендация:</b> ${esc(body.recommendation)}` : "",
    briefLines.length ? `\n📝 <b>Бриф:</b>\n${esc(briefLines.join("\n"))}` : "",
    `\n🔗 <b>Источник:</b> ${esc(body.source || "прямой")}`,
    `⏰ ${timestamp} МСК`,
  ].filter(Boolean);

  const text = lines.join("\n");

  try {
    const response = await fetch(
      `https://tg-proxy.radinuko.workers.dev/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      }
    );
    if (!response.ok) {
      const errorBody = await response.text();
      console.error("[leads/warmup] Telegram API error:", response.status, errorBody);
      return NextResponse.json(
        { error: "Failed to send message", code: "SEND_ERROR" },
        { status: 502 }
      );
    }
  } catch (err) {
    console.error("[leads/warmup] Network error:", err);
    return NextResponse.json(
      { error: "Service unavailable", code: "NETWORK_ERROR" },
      { status: 503 }
    );
  }

  return NextResponse.json({ success: true });
}
