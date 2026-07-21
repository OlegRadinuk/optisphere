// Structured Telegram summaries for consent-gated bots (see d:\projects\albamed\spec\bot-compliance.md §4).
// Only used when client.consent_required=1 — quoting a patient's raw chat into Telegram
// risks leaking special-category personal data (health info, ст. 10 152-ФЗ). Instead we
// classify the conversation against the bot's own quick-reply labels (pre-approved,
// non-sensitive service names) and never echo free-text back.

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
