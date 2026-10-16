/**
 * Единая точка параметров модели для всех Anthropic-вызовов (боты, ассистент сайта, саммари).
 *
 * Haiku 5.5: размышление включено по умолчанию и его токены входят в max_tokens,
 * управление — output_config.effort. Выбрано effort "low", thinking НЕ отключаем
 * (с thinking disabled модель выдумывала медицинские услуги — проверено замером).
 * Для Haiku 5.5 нельзя: temperature/top_p/top_k, assistant prefill, budget_tokens, fallbacks.
 *
 * Откат на Haiku 4.5: сменить модель в админке (/aiadmin/<slug>): PATCH → updateClient()
 * синхронизирует data/bots-seed.json. Голый UPDATE clients SET model=... откатится при
 * рестарте: seedBots() перезаписывает model из bots-seed.json. Для 4.5 параметры прежние
 * (без output_config, max_tokens 1024).
 */

export const DEFAULT_BOT_MODEL = "claude-haiku-5-5"
export const LEGACY_BOT_MODEL = "claude-haiku-4-5-20251001"

export interface ModelRequestParams {
  max_tokens: number
  output_config?: { effort: "low" }
}

/** Семейства, у которых есть effort и размышление по умолчанию (токены размышления входят в max_tokens). */
const EFFORT_MODEL_RE = /^claude-haiku-5(-|$)/

export function modelUsesEffort(model: string): boolean {
  return EFFORT_MODEL_RE.test(model)
}

/**
 * Доп. параметры запроса для модели.
 * @param opts.minTokens нижняя граница max_tokens для моделей с размышлением
 *   (для коротких задач вроде саммари: ответ короткий, но размышление входит в лимит).
 */
export function getModelRequestParams(
  model: string,
  opts: { legacyMaxTokens?: number; minTokens?: number } = {}
): ModelRequestParams {
  if (modelUsesEffort(model)) {
    return {
      max_tokens: Math.max(2048, opts.minTokens ?? 0),
      output_config: { effort: "low" },
    }
  }
  return { max_tokens: opts.legacyMaxTokens ?? 1024 }
}
