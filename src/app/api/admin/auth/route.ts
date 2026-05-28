import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createSessionToken, verifySessionToken } from "@/lib/session"

const SESSION_COOKIE = "opsph_admin"
const SESSION_SCOPE = "admin"

// ── In-memory rate limiter (5 attempts / 15 min per IP) ───────────────────────
const authAttempts = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000

function checkAuthRateLimit(ip: string): { allowed: boolean; retryAfterMs: number } {
  const now = Date.now()
  const entry = authAttempts.get(ip)

  if (entry) {
    if (now < entry.resetAt) {
      if (entry.count >= RATE_LIMIT_MAX) {
        return { allowed: false, retryAfterMs: entry.resetAt - now }
      }
      entry.count++
    } else {
      // Window expired — reset
      authAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    }
  } else {
    authAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
  }

  return { allowed: true, retryAfterMs: 0 }
}

export async function POST(request: NextRequest): Promise<Response> {
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD
  if (!ADMIN_PASSWORD) {
    console.error("[admin/auth] ADMIN_PASSWORD env variable is not set")
    return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 })
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown"

  const { allowed, retryAfterMs } = checkAuthRateLimit(ip)
  if (!allowed) {
    const retryAfterSec = Math.ceil(retryAfterMs / 1000)
    return NextResponse.json(
      { error: "Too many attempts. Try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(retryAfterSec) },
      }
    )
  }

  let body: { username?: string; password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Credentials are stored as plain text in env vars (env vars are server-side only,
  // never exposed to the client bundle). The real security layer is username + password
  // combined with the rate limiter above.
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME

  const passwordOk = body.password === ADMIN_PASSWORD
  // If ADMIN_USERNAME is set, require username match too; otherwise fall back to password-only.
  const usernameOk = ADMIN_USERNAME ? body.username === ADMIN_USERNAME : true

  if (!passwordOk || !usernameOk) {
    return NextResponse.json({ error: "Wrong credentials" }, { status: 401 })
  }

  // Successful auth — clear the rate limit entry for this IP
  authAttempts.delete(ip)

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, createSessionToken(SESSION_SCOPE), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })

  return NextResponse.json({ ok: true })
}

export async function DELETE(): Promise<Response> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
  return NextResponse.json({ ok: true })
}

// Utility: check auth from server components / route handlers
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(SESSION_SCOPE, cookieStore.get(SESSION_COOKIE)?.value)
}
