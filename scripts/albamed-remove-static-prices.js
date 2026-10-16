#!/usr/bin/env node
/**
 * Вырезает из system_prompt бота albamed устаревший раздел «ПОЛНЫЙ ПРАЙС-ЛИСТ»
 * (живой прайс подставляется чат-роутом из МедФлекса: src/lib/bots/live-context.ts).
 *
 * По умолчанию DRY-RUN: ничего не пишет, печатает размер до/после, первые/последние строки
 * вырезаемого куска и строки раздела, которые СОХРАНЯЮТСЯ (не прайс, например «ОМС: ...»).
 *
 * Использование:
 *   node scripts/albamed-remove-static-prices.js                 # dry-run по БД (DB_PATH или data/bots.db)
 *   node scripts/albamed-remove-static-prices.js --apply         # бэкап + запись в БД (и в bots-seed.json)
 *   node scripts/albamed-remove-static-prices.js --from-json D:\path\bots.json   # dry-run по выгрузке
 *   Опции: --slug albamed  --db <path>  --seed <path>  --backup-dir <dir>
 *
 * ВАЖНО: при каждом старте приложения seedBots() перезаписывает system_prompt и model
 * из data/bots-seed.json. Поэтому --apply правит и seed-файл (если он есть), иначе
 * старый прайс вернётся после рестарта.
 */
const fs = require("fs");
const path = require("path");

const args = process.argv.slice(2);
const opt = (name, def) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : def;
};
const APPLY = args.includes("--apply");
const SLUG = opt("--slug", "albamed");
const FROM_JSON = opt("--from-json", null);
const DB_PATH = opt("--db", process.env.DB_PATH || path.join(process.cwd(), "data", "bots.db"));
const SEED_PATH = opt("--seed", process.env.BOT_SEED_PATH || path.join(process.cwd(), "data", "bots-seed.json"));
const BACKUP_DIR = opt("--backup-dir", path.join(process.cwd(), "data"));

const TITLE = "ПОЛНЫЙ ПРАЙС-ЛИСТ";
const isSep = (l) => /^═{5,}\s*$/.test(l);
const isPriceLine = (l) => /^-\s.*\d+\s*руб\.?\s*$/.test(l);
const isCategoryLine = (l) => /^[^\n-][^\n]*:\s*$/.test(l);

/**
 * Чистая функция. Возвращает { text, removedLines, keptLines, found }.
 * Раздел = от разделителя ═══ перед заголовком до следующего разделителя ═══ (начало следующего раздела).
 * Внутри раздела удаляются: заголовок, пустые строки, строки-категории («Кардиология:»),
 * строки-цены («- ... — 1500 руб.»). ВСЁ остальное (например «ОМС: ...») сохраняется.
 */
function removeStaticPrices(prompt) {
  const lines = prompt.split("\n");
  const t = lines.findIndex((l) => l.trim() === TITLE);
  if (t < 1 || !isSep(lines[t - 1]) || !isSep(lines[t + 1] || "")) {
    return { text: prompt, removedLines: [], keptLines: [], found: false };
  }
  const start = t - 1;
  let end = -1;
  for (let j = t + 2; j < lines.length; j++) {
    if (isSep(lines[j])) { end = j; break; }
  }
  if (end < 0) end = lines.length; // раздел последний
  const body = lines.slice(t + 2, end);
  const kept = [];
  const removed = lines.slice(start, t + 2); // разделитель, заголовок, разделитель
  for (const l of body) {
    if (l.trim() === "" || isPriceLine(l) || isCategoryLine(l)) removed.push(l);
    else kept.push(l);
  }
  const out = [...lines.slice(0, start), ...kept, "", ...lines.slice(end)];
  return { text: out.join("\n"), removedLines: removed, keptLines: kept, found: true };
}

/**
 * Правит data/bots-seed.json (иначе seedBots() вернёт старый прайс при рестарте).
 * @param dbText очищенный промпт из БД — подставляется, если в seed раздел не найден;
 *   null — seed трогаем, только если в нём есть раздел прайса.
 */
function cleanSeed(dbText) {
  if (!fs.existsSync(SEED_PATH)) {
    console.log(`Seed-файл не найден (${SEED_PATH}) — пропускаю.`);
    return;
  }
  const raw = fs.readFileSync(SEED_PATH, "utf8");
  const seed = JSON.parse(raw);
  const entry = Array.isArray(seed) ? seed.find((x) => x.slug === SLUG) : null;
  if (!entry || typeof entry.system_prompt !== "string") {
    console.log(`В seed-файле нет записи ${SLUG} — пропускаю.`);
    return;
  }
  const seedRes = removeStaticPrices(entry.system_prompt);
  if (!seedRes.found && dbText === null) {
    console.log("В seed-файле раздела прайса тоже нет — ничего не меняю.");
    return;
  }
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const seedBackup = path.join(BACKUP_DIR, `bots-seed.backup-${stamp}.json`);
  fs.writeFileSync(seedBackup, raw, "utf8");
  entry.system_prompt = seedRes.found ? seedRes.text : dbText;
  fs.writeFileSync(SEED_PATH + ".tmp", JSON.stringify(seed, null, 2), "utf8");
  fs.renameSync(SEED_PATH + ".tmp", SEED_PATH);
  console.log(`Seed-файл обновлён: ${SEED_PATH} (бэкап ${seedBackup}).`);
}

function main() {
  let prompt;
  let db = null;
  if (FROM_JSON) {
    const arr = JSON.parse(fs.readFileSync(FROM_JSON, "utf8"));
    const row = arr.find((x) => x.slug === SLUG);
    if (!row) throw new Error(`slug ${SLUG} не найден в ${FROM_JSON}`);
    prompt = row.system_prompt;
  } else {
    const Database = require("better-sqlite3");
    db = new Database(DB_PATH, { readonly: !APPLY });
    const row = db.prepare("SELECT system_prompt FROM clients WHERE slug = ?").get(SLUG);
    if (!row) throw new Error(`slug ${SLUG} не найден в ${DB_PATH}`);
    prompt = row.system_prompt;
  }

  const r = removeStaticPrices(prompt);
  const bytes = (s) => Buffer.byteLength(s, "utf8");
  console.log(`[${SLUG}] источник: ${FROM_JSON || DB_PATH}`);
  if (!r.found) {
    console.log(`Раздел «${TITLE}» в БД не найден (уже вырезан?) — БД не трогаю.`);
    // Идемпотентность: БД могла быть очищена прошлым запуском, а seed — нет
    // (seedBots() при рестарте вернул бы старый прайс). Seed проверяем всегда.
    if (APPLY && !FROM_JSON) cleanSeed(null);
    else if (!FROM_JSON && fs.existsSync(SEED_PATH)) {
      const seed = JSON.parse(fs.readFileSync(SEED_PATH, "utf8"));
      const entry = Array.isArray(seed) ? seed.find((x) => x.slug === SLUG) : null;
      if (entry && typeof entry.system_prompt === "string" && removeStaticPrices(entry.system_prompt).found) {
        console.log(`ВНИМАНИЕ: в ${SEED_PATH} раздел прайса ещё есть — запустите с --apply.`);
      }
    }
    return;
  }
  console.log(`Размер до:    ${bytes(prompt)} байт (${prompt.length} символов)`);
  console.log(`Размер после: ${bytes(r.text)} байт (${r.text.length} символов)`);
  console.log(`Вырезано строк: ${r.removedLines.length}, байт: ${bytes(prompt) - bytes(r.text)}`);
  const nonEmpty = r.removedLines.filter((l) => l.trim() !== "");
  console.log("\nПервые строки вырезаемого куска:");
  nonEmpty.slice(0, 6).forEach((l) => console.log("  | " + l));
  console.log("Последние строки вырезаемого куска:");
  nonEmpty.slice(-4).forEach((l) => console.log("  | " + l));
  console.log("\nСтроки раздела, которые СОХРАНЕНЫ (не прайс):");
  r.keptLines.forEach((l) => console.log("  + " + l));

  if (!APPLY) {
    console.log("\nDRY-RUN: ничего не записано. Для применения добавьте --apply.");
    return;
  }
  if (FROM_JSON) throw new Error("--apply несовместим с --from-json");

  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
  const backupPath = path.join(BACKUP_DIR, `${SLUG}-system-prompt.backup-${stamp}.txt`);
  fs.writeFileSync(backupPath, prompt, "utf8");
  console.log(`\nБэкап старого промпта: ${backupPath}`);

  const res = db.prepare("UPDATE clients SET system_prompt = ? WHERE slug = ?").run(r.text, SLUG);
  console.log(`БД обновлена (changes=${res.changes}).`);

  cleanSeed(r.text);
  console.log("Готово. Перезапуск приложения не обязателен для БД (промпт читается на каждый запрос).");
}

if (require.main === module) main();
module.exports = { removeStaticPrices };
