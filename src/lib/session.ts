import { createHmac, timingSafeEqual } from "crypto"

// Signed, stateless session tokens (HMAC-SHA256). No DB/Redis needed and
// survives process restarts (unlike an in-memory token store). A token cannot
// be forged without the server secret, which fixes the previous static-cookie
// bypass where the cookie value was a constant ("authenticated").

const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function getSecret(): string {
  // Prefer a dedicated secret; fall back to the admin password so the app still
  // works if SESSION_SECRET isn't set. Set SESSION_SECRET in ecosystem.config.js
  // for a proper independent secret.
  const s = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD
  if (!s) throw new Error("SESSION_SECRET / ADMIN_PASSWORD not set")
  return s
}

function sign(scope: string, issuedAt: number): string {
  return createHmac("sha256", getSecret())
    .update(`${scope}.${issuedAt}`)
    .digest("base64url")
}

// scope = which dashboard ("admin" | "estet" | "albamed"), so a token minted
// for one area can't be replayed against another.
export function createSessionToken(scope: string): string {
  const issuedAt = Date.now()
  return `${issuedAt}.${sign(scope, issuedAt)}`
}

export function verifySessionToken(scope: string, token: string | undefined): boolean {
  if (!token) return false
  const dot = token.indexOf(".")
  if (dot <= 0) return false

  const issuedAtStr = token.slice(0, dot)
  const sig = token.slice(dot + 1)
  const issuedAt = Number(issuedAtStr)
  if (!Number.isFinite(issuedAt)) return false
  if (Date.now() - issuedAt > MAX_AGE_MS) return false

  const expected = sign(scope, issuedAt)
  if (sig.length !== expected.length) return false
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected))
  } catch {
    return false
  }
}
