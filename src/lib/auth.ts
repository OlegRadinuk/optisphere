import { cookies } from "next/headers"
import { verifySessionToken } from "@/lib/session"

const SESSION_COOKIE = "opsph_admin"
const SESSION_SCOPE = "admin"

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return verifySessionToken(SESSION_SCOPE, cookieStore.get(SESSION_COOKIE)?.value)
}
