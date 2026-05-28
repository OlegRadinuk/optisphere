import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSessionToken, verifySessionToken } from "@/lib/session"

export const SESSION_COOKIE = "estet_session"
const SESSION_SCOPE = "estet"

const authAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

function checkRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = authAttempts.get(ip)
  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT_MAX) return { allowed: false, retryAfterMs: entry.resetAt - now }
      entry.count++
    } else {
      authAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    }
  } else {
    authAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
  }
  return { allowed: true, retryAfterMs: 0 }
}

export async function POST(req: NextRequest): Promise<Response> {
  const USERNAME = process.env.ESTET_USERNAME
  const PASSWORD = process.env.ESTET_PASSWORD
  // Master admin always retains access (in addition to the per-clinic account)
  const MASTER_USERNAME = process.env.ADMIN_USERNAME
  const MASTER_PASSWORD = process.env.ADMIN_PASSWORD
  if (!USERNAME || !PASSWORD) {
    console.error("[estet/auth] ESTET_USERNAME / ESTET_PASSWORD not set")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"
  const { allowed, retryAfterMs } = checkRateLimit(ip)
  if (!allowed) {
    return NextResponse.json(
      { error: "Слишком много попыток. Попробуйте позже." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(retryAfterMs / 1000)) } }
    )
  }

  let body: { username?: string; password?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }) }

  const matchesClinic = body.username === USERNAME && body.password === PASSWORD
  const matchesMaster =
    !!MASTER_USERNAME && !!MASTER_PASSWORD &&
    body.username === MASTER_USERNAME && body.password === MASTER_PASSWORD
  if (!matchesClinic && !matchesMaster) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 })
  }

  authAttempts.delete(ip)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, createSessionToken(SESSION_SCOPE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(): Promise<Response> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}

export async function isEstetAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(SESSION_SCOPE, cookieStore.get(SESSION_COOKIE)?.value)
}
