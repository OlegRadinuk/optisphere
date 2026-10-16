/**
 * Next.js instrumentation: прогрев кэша прайса Альба-Мед на старте сервера.
 * Не блокирует старт (fire-and-forget); при ошибке — warn, бот просто возьмёт прайс при первом запросе.
 */
export async function register(): Promise<void> {
  if (process.env.NEXT_RUNTIME !== "nodejs") return
  // next build тоже может вызывать register() в воркерах пререндера — прогрев там не нужен.
  if (process.env.NEXT_PHASE === "phase-production-build") return
  void (async () => {
    try {
      const { getAlbamedPrices } = await import("@/lib/albamed/prices")
      const results = await Promise.allSettled([getAlbamedPrices("kantar"), getAlbamedPrices("kievskaya")])
      const summary = results.map((r, i) => `${i === 0 ? "kantar" : "kievskaya"}:${r.status === "fulfilled" ? "ok" : "FAIL"}`)
      console.info(`[instrumentation] albamed prices warmup: ${summary.join(", ")}`)
    } catch (err) {
      console.warn("[instrumentation] albamed prices warmup failed:", err instanceof Error ? err.message : err)
    }
  })()
}
