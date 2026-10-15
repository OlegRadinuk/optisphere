import zlib from "zlib"

// ── Таймауты для Anthropic-запросов через CF Worker ───────────────────────────
//
// Cloudflare с РФ-сервера «душит» часть соединений: запрос либо проходит за
// ~2 сек, либо стопорится наглухо. Середины нет, замерено — 4 успеха из 6.
// Поэтому каждая попытка получает СВОЙ короткий таймаут на ожидание заголовков,
// а не один длинный на весь вызов: зависшую попытку дешевле бросить и повторить,
// чем ждать до конца.

/** Таймаут на получение заголовков (до Response) — в мс. */
export const ATTEMPT_TIMEOUT_MS = 10_000

/** Максимальное число повторных попыток при зависании соединения. */
export const MAX_ATTEMPTS = 3

/**
 * gzipFetch — замена глобального fetch для Anthropic SDK.
 *
 * Что делает:
 *  1. Сжимает тело запроса >8 КБ перед отправкой через CF Worker.
 *     Причина: CF-воркер обрывает входящий поток при теле >~30 КБ;
 *     gzip даёт коэф. ~4× на русском тексте → все промпты под порогом.
 *
 *  2. При зависании соединения (не пришли заголовки за ATTEMPT_TIMEOUT_MS) —
 *     повторяет до MAX_ATTEMPTS раз с паузой 400 мс между попытками.
 *
 * Ключевая деталь: таймаут попытки ограничивает ТОЛЬКО ожидание заголовков.
 * Как только fetch вернул Response — таймер снимается, чтобы не обрывать
 * длинное тело ответа на середине.
 *
 * Внешний сигнал (outer, он же «общий потолок» из route.ts) продолжает
 * действовать на чтение тела через listener: outer.abort() → attemptCtrl.abort()
 * → обрыв соединения. При успехе listener остаётся на outer (нужен для тела).
 * При неудачной попытке listener снимается вручную перед повтором.
 */
export const gzipFetch: typeof fetch = async (input, init) => {
  const raw = init?.body
  let body = raw
  const headers = new Headers(init?.headers)

  // Тело сжимаем один раз, до повторов — русский текст жмётся примерно вчетверо.
  if (typeof raw === "string" && Buffer.byteLength(raw, "utf8") > 8192) {
    body = zlib.gzipSync(Buffer.from(raw, "utf8")) as unknown as BodyInit
    headers.set("content-encoding", "gzip")
    headers.delete("content-length")
  }

  const outer = init?.signal as AbortSignal | null | undefined
  let lastErr: unknown

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    // Отдельный AbortController на каждую попытку.
    const attemptCtrl = new AbortController()

    // Таймер снимается как только fetch вернул Response (заголовки получены).
    // Цель: ограничить только ожидание соединения, а не чтение тела.
    const attemptTimer = setTimeout(
      () => attemptCtrl.abort(new DOMException("attempt timeout", "TimeoutError")),
      ATTEMPT_TIMEOUT_MS
    )

    // Пробрасываем внешний сигнал (общий потолок) в attemptCtrl.
    // Сохраняем ссылку: при неудачной попытке снимаем listener вручную,
    // чтобы он не накапливался на outer при каждом повторе.
    // При успехе listener остаётся — именно он позволяет outer прервать
    // чтение тела уже после того, как таймер попытки снят.
    let outerListener: (() => void) | null = null
    if (outer) {
      if (outer.aborted) {
        clearTimeout(attemptTimer)
        throw outer.reason ?? new DOMException("aborted", "AbortError")
      }
      outerListener = () => attemptCtrl.abort(outer.reason)
      outer.addEventListener("abort", outerListener, { once: true })
    }

    try {
      const response = await fetch(input as RequestInfo | URL, {
        ...init,
        body,
        headers,
        signal: attemptCtrl.signal,
      })
      // Заголовки получены — таймер попытки больше не нужен.
      // outerListener намеренно НЕ снимается: он гарантирует, что
      // общий потолок сможет прервать чтение тела (for await в route.ts).
      clearTimeout(attemptTimer)
      return response
    } catch (err) {
      clearTimeout(attemptTimer)
      // Снимаем listener с outer — попытка не удалась, attemptCtrl уже не нужен.
      if (outerListener && outer) outer.removeEventListener("abort", outerListener)
      lastErr = err
      // Внешний таймаут/отмена — повторять бессмысленно, вызов уже никому не нужен.
      if (outer?.aborted) throw err
      console.warn(
        `[bots/fetch] попытка ${attempt}/${MAX_ATTEMPTS} не прошла: ${(err as Error)?.name ?? "Error"}`
      )
      if (attempt < MAX_ATTEMPTS) await new Promise((r) => setTimeout(r, 400))
    }
  }
  throw lastErr
}
