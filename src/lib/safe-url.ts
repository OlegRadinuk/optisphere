// Guards server-side fetches of user-supplied URLs against SSRF.
// Blocks non-http(s) schemes and requests to loopback / private / link-local
// addresses (incl. cloud metadata endpoint 169.254.169.254).

const BLOCKED_HOSTNAMES = new Set([
  "localhost", "127.0.0.1", "0.0.0.0", "::1", "169.254.169.254", "metadata.google.internal",
])

function isPrivateIPv4(host: string): boolean {
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const [a, b] = [Number(m[1]), Number(m[2])]
  if (a === 10) return true                       // 10.0.0.0/8
  if (a === 127) return true                      // loopback
  if (a === 172 && b >= 16 && b <= 31) return true // 172.16.0.0/12
  if (a === 192 && b === 168) return true         // 192.168.0.0/16
  if (a === 169 && b === 254) return true         // link-local / metadata
  if (a === 0) return true
  return false
}

export function isSafeFetchUrl(rawUrl: string): boolean {
  let parsed: URL
  try { parsed = new URL(rawUrl) } catch { return false }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false
  const host = parsed.hostname.toLowerCase().replace(/^\[|\]$/g, "")
  if (BLOCKED_HOSTNAMES.has(host)) return false
  if (isPrivateIPv4(host)) return false
  // Block IPv6 loopback/unique-local/link-local
  if (host === "::1" || host.startsWith("fc") || host.startsWith("fd") || host.startsWith("fe80")) return false
  return true
}
