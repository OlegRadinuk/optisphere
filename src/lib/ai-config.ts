/**
 * AI routing config — единая точка для URL-констант.
 *
 * WORKING_PROXY — Cloudflare Worker, прозрачно форвардит на api.anthropic.com.
 * Нужен потому что сервер находится в RU, откуда прямой доступ к api.anthropic.com
 * блокируется (403). Все новые боты и дефолты должны использовать этот адрес.
 *
 * REROUTE_HOSTS — список хостов, которые НЕЛЬЗЯ вызывать с RU-сервера напрямую.
 * При совпадении base_url принудительно заменяется на WORKING_PROXY.
 */
export const WORKING_PROXY =
  "https://ai-proxyoptispheretech.radinuko.workers.dev/v1/"

/**
 * Хосты, запросы к которым с RU-сервера заблокированы или не работают.
 * Любой base_url, содержащий один из этих хостов, перенаправляется на WORKING_PROXY.
 */
export const REROUTE_HOSTS = [
  "aiprime.store",
  "aiprimetech.io",
  "api.anthropic.com",
]

/**
 * Возвращает рабочий baseURL с учётом перенаправлений.
 * Стрипает trailing /v1/ — Anthropic SDK сам добавляет /v1/messages.
 */
export function resolveBaseURL(rawBaseURL: string | undefined | null): string {
  const url = rawBaseURL || WORKING_PROXY
  const effective = REROUTE_HOSTS.some((h) => url.includes(h)) ? WORKING_PROXY : url
  return effective.replace(/\/v1\/?$/, "")
}
