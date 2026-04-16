import { cookies } from "next/headers"

const SESSION_COOKIE = "opsph_admin"
const SESSION_VALUE = "authenticated"

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  return cookieStore.get(SESSION_COOKIE)?.value === SESSION_VALUE
}
