// Structured Telegram summaries for privacy-gated bots (see d:\projects\albamed\spec\bot-compliance.md §4).
// Used when client.tg_include_transcript=0 — quoting a patient's raw chat into Telegram
// risks leaking special-category personal data (health info, ст. 10 152-ФЗ). Instead we
// classify the conversation against the bot's own quick-reply labels (pre-approved,
// non-sensitive service names) and extract facts only from assistant messages.

/** Extracts the quick-reply labels configured for a client (its own service menu). */
function quickReplyLabels(quickRepliesJson: string): string[] {
  try {
    const parsed: unknown = JSON.parse(quickRepliesJson || "[]")
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) =>
        item && typeof item === "object" && "label" in item
          ? String((item as { label: unknown }).label)
          : ""
      )
      .filter((label) => label.length > 0)
  } catch {
    return []
  }
}

/**
 * Classifies the visitor's interest against the client's own quick-reply labels
 * (a pre-approved, non-sensitive service list) without ever quoting free text back.
 * Falls back to "уточняется" when nothing matches.
 */
export function guessService(userTexts: string[], quickRepliesJson: string): string {
  const labels = quickReplyLabels(quickRepliesJson)
  if (labels.length === 0) return "уточняется"
  const haystack = userTexts.join(" ").toLowerCase()
  for (const label of labels) {
    if (haystack.includes(label.toLowerCase())) return label
  }
  return "уточняется"
}

export interface TgSummary {
  /** Matched quick-reply label or "уточняется" */
  service: string
  /** Russian name extracted from assistant messages only; empty string if not found */
  doctor: string
  /** Time/date extracted from assistant messages only; empty string if not found */
  time: string
}

/**
 * Builds a privacy-safe Telegram notification summary from a chat session.
 *
 * Rules (152-ФЗ / врачебная тайна):
 *   - Service is matched ONLY against pre-approved quick-reply label strings (not free text).
 *   - Doctor and time are extracted ONLY from ASSISTANT messages — never from user messages,
 *     because patient free text may contain health data (ст. 10 152-ФЗ).
 *   - No verbatim patient phrase ever appears in the returned object.
 */
export function buildTgSummary(
  messages: Array<{ role: string; content: string }>,
  quickRepliesJson: string
): TgSummary {
  const labels = quickReplyLabels(quickRepliesJson)

  const assistantTexts = messages
    .filter((m) => m.role === "assistant")
    .map((m) =>
      m.content
        .replace(/\[SAVE_LEAD\]/g, "")
        .replace(/\[SHOW_FORM\]/g, "")
        .trim()
    )

  const userTexts = messages
    .filter((m) => m.role === "user")
    .map((m) => m.content.trim())

  // ── Service: assistant messages first; user messages only as fallback (labels only) ──
  let service = "уточняется"
  if (labels.length > 0) {
    const assistantHaystack = assistantTexts.join(" ").toLowerCase()
    for (const label of labels) {
      if (assistantHaystack.includes(label.toLowerCase())) {
        service = label
        break
      }
    }
    if (service === "уточняется") {
      const userHaystack = userTexts.join(" ").toLowerCase()
      for (const label of labels) {
        if (userHaystack.includes(label.toLowerCase())) {
          service = label
          break
        }
      }
    }
  }

  // ── Doctor: only from assistant messages — the bot echoes the confirmed name ──
  // Pattern: "к/у [доктору/специалисту] ФамилияИмяОтчество" — limited to 3 word parts,
  // no dots in character class to avoid over-matching into the next sentence.
  let doctor = ""
  const doctorRe =
    /(?:к|у)\s+(?:доктору?\s+|специалисту?\s+|врачу?\s+)?([А-ЯЁ][а-яё]+(?:\s+[А-ЯЁ][а-яё]+){0,2})/
  for (const text of assistantTexts) {
    const match = doctorRe.exec(text)
    if (match) {
      doctor = match[1].trim()
      break
    }
  }

  // ── Time/date: only from assistant messages ──
  let time = ""
  const timeRe =
    /(\d{1,2}[.:]\d{2}(?:\s*[-–]\s*\d{1,2}[.:]\d{2})?|\d{1,2}\s+(?:января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)(?:\s+\d{4})?|\b(?:завтра|послезавтра|сегодня)\b)/i
  for (const text of assistantTexts) {
    const match = timeRe.exec(text)
    if (match) {
      time = match[1]
      break
    }
  }

  return { service, doctor, time }
}
