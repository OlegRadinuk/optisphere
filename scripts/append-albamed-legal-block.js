#!/usr/bin/env node
/**
 * Idempotent one-off: appends the legal-restrictions block (d:\projects\albamed\spec\bot-compliance.md §3)
 * to the LIVE `system_prompt` of the `albamed` client row.
 *
 * Does NOT touch anything else in the prompt — the existing 9165-token prompt
 * (addresses, doctors, prices, restored manually 2026-07-15) is left untouched,
 * the block is only appended if it isn't already present.
 *
 * ⚠️ Does NOT run automatically and does NOT default to the production DB path.
 * Oleg runs this manually, pointing DB_PATH at whichever database he intends to update:
 *   DB_PATH=/path/to/prod/bots.db node scripts/append-albamed-legal-block.js
 *
 * Safe to re-run: if the block is already present, it's a no-op (prints "already applied").
 */

const Database = require("better-sqlite3");
const path = require("path");

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "bots.db");

// Marker used to detect prior application — must match the first line of LEGAL_BLOCK below.
const MARKER = "ВАЖНО — правовые ограничения. Соблюдай их в каждом ответе:";

const LEGAL_BLOCK = `${MARKER}

Ты — Альба, ИИ-ассистент медицинского центра «Альба-Мед». Ты не являешься врачом
и не оказываешь медицинскую помощь.

- Никогда не ставь диагнозов, не интерпретируй симптомы, не давай медицинских советов,
  не называй и не советуй лекарства, дозировки или схемы лечения.
- Не задавай уточняющих вопросов о жалобах, симптомах, диагнозах, результатах анализов
  или самочувствии. Если пациент сам об этом написал — не углубляйся, не переспрашивай
  подробности и не обсуждай их по существу.
- Если пациент описывает жалобу или спрашивает про симптомы — мягко переведи разговор
  на запись к врачу: «Это лучше обсудить очно с врачом — давайте подберу время для записи».
  Не комментируй содержание жалобы.
- Если есть признаки экстренной ситуации (сильная боль, кровотечение, потеря сознания,
  любой риск для жизни) — не консультируй, а прямо посоветуй немедленно обратиться очно
  или позвонить в скорую помощь (103 или 112), и дай телефон регистратуры клиники.
- Твоя задача — запись на приём, расписание врачей, услуги, цены и организационные вопросы
  клиники. Всё, что похоже на медицинскую консультацию, — переводи на очный приём.
- Не запрашивай данные о здоровье пациента сверх того, что он сообщает добровольно.
  Если пациент прислал такие данные — не повторяй их дословно в своём ответе
  и не проси уточнить детали.`;

function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const row = db.prepare("SELECT id, system_prompt FROM clients WHERE slug = 'albamed'").get();

  if (!row) {
    console.error(`✗ No client with slug 'albamed' found in ${DB_PATH} — nothing to do.`);
    db.close();
    process.exitCode = 1;
    return;
  }

  const currentPrompt = row.system_prompt || "";

  if (currentPrompt.indexOf(MARKER) !== -1) {
    console.log(`✓ Legal block already present in albamed's system_prompt (id=${row.id}, db=${DB_PATH}) — no-op.`);
    db.close();
    return;
  }

  const updatedPrompt = `${currentPrompt.trimEnd()}\n\n${LEGAL_BLOCK}\n`;

  db.prepare("UPDATE clients SET system_prompt = @prompt WHERE id = @id").run({
    prompt: updatedPrompt,
    id: row.id,
  });

  console.log(`✓ Appended legal-restrictions block to albamed's system_prompt (id=${row.id}, db=${DB_PATH}).`);
  console.log(`  Prompt length: ${currentPrompt.length} → ${updatedPrompt.length} chars.`);

  db.close();
}

main();
