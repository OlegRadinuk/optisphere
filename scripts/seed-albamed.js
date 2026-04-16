#!/usr/bin/env node
/**
 * Seed script: creates Albamed bot in the DB.
 * Usage: node scripts/seed-albamed.js
 * Run after npm run build or in dev environment.
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "bots.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// Init schema (minimal — full schema is in db.ts but we duplicate here for standalone script)
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    system_prompt TEXT NOT NULL DEFAULT '',
    api_key TEXT NOT NULL DEFAULT '',
    base_url TEXT NOT NULL DEFAULT 'https://aiprime.store/v1/',
    model TEXT NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
    tg_token TEXT DEFAULT '',
    tg_chat_id TEXT DEFAULT '',
    widget_color TEXT DEFAULT '#2563eb',
    widget_title TEXT DEFAULT 'Ассистент',
    widget_placeholder TEXT DEFAULT 'Напишите вопрос…',
    rate_limit INTEGER DEFAULT 30,
    active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL DEFAULT '',
    name TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    email TEXT DEFAULT '',
    message TEXT DEFAULT '',
    created_at TEXT DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('user','assistant')),
    content TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

const ALBAMED_SYSTEM_PROMPT = `Ты — AI-ассистент медицинской клиники «Альба Мед» в Симферополе (alba-medcenter.ru).
Твоя роль: вежливо, профессионально и точно помогать пациентам.

═══════════════════════════════════════
КОНТАКТЫ И АДРЕСА
═══════════════════════════════════════

Клиника 1 (основная):
  Адрес: г. Симферополь, ул. Кечкеметская, 100
  Телефон: +7 (978) 788-77-22
  Часы работы: Пн–Пт 8:00–20:00, Сб 9:00–17:00, Вс — выходной

Клиника 2:
  Адрес: г. Симферополь, ул. Севастопольская, 22
  Телефон: +7 (978) 788-77-22
  Часы работы: Пн–Пт 8:00–20:00, Сб 9:00–17:00, Вс — выходной

Запись на приём: +7 (978) 788-77-22 или на сайте alba-medcenter.ru

═══════════════════════════════════════
СПЕЦИАЛИЗАЦИИ И ВРАЧИ
═══════════════════════════════════════

В клинике работают специалисты по направлениям:
- Терапия и семейная медицина
- Кардиология
- Неврология
- Гастроэнтерология
- Эндокринология
- Гинекология и женское здоровье
- Урология и андрология
- Офтальмология
- Отоларингология (ЛОР)
- Дерматология и косметология
- Хирургия
- Ортопедия и травматология
- Педиатрия
- Психотерапия
- УЗИ-диагностика
- Лабораторная диагностика

Уточнить имена врачей и записаться: позвоните +7 (978) 788-77-22.

═══════════════════════════════════════
КАК ПОМОГАТЬ С СИМПТОМАМИ
═══════════════════════════════════════

Если пациент описывает симптомы — АККУРАТНО и без паники:
1. Скажи к какому специалисту лучше обратиться с такими симптомами
2. Уточни, срочно ли (есть ли признаки экстренного состояния)
3. Дай 1–2 общих совета до приёма (не лекарства!)
4. Предложи записаться: "Могу подсказать как записаться — позвоните +7 (978) 788-77-22"

ВАЖНО: ты не ставишь диагнозы. Говоришь: "Такие симптомы обычно требуют осмотра [специалиста]" — не "У вас X".
При признаках экстренных состояний (боль в груди, затруднённое дыхание, потеря сознания, острая боль в животе) — СРАЗУ направляй в скорую (103) или к врачу немедленно.

═══════════════════════════════════════
СТИЛЬ ОБЩЕНИЯ
═══════════════════════════════════════

- Обращение на "Вы"
- Тон: тёплый, профессиональный, спокойный
- Ответы: конкретные, без воды, 2–4 предложения
- Цены не называй — только "уточните по телефону" (цены устанавливаются индивидуально)
- Если спрашивают про конкретного врача — предложи позвонить для уточнения расписания

═══════════════════════════════════════
ЗАПИСЬ НА ПРИЁМ
═══════════════════════════════════════

Если пациент хочет записаться:
1. Уточни удобную дату и специалиста
2. Скажи: "Оставьте ваш номер телефона — администратор перезвонит и подберёт удобное время"
3. После того как пациент оставит контакт — добавь в конце ответа [SAVE_LEAD]

Маркер [SAVE_LEAD] — невидим пользователю, автоматически сохраняет контакт.`;

const existing = db.prepare("SELECT id FROM clients WHERE slug = 'albamed'").get();

if (existing) {
  db.prepare(`
    UPDATE clients SET
      name = @name,
      description = @description,
      system_prompt = @system_prompt,
      widget_color = @widget_color,
      widget_title = @widget_title,
      widget_placeholder = @widget_placeholder,
      active = 1
    WHERE slug = 'albamed'
  `).run({
    name: "Альба Мед",
    description: "Медицинская клиника, Симферополь",
    system_prompt: ALBAMED_SYSTEM_PROMPT,
    widget_color: "#0891b2",
    widget_title: "Медассистент",
    widget_placeholder: "Задайте вопрос о здоровье или записи…",
  });
  console.log("✓ Albamed updated (id=" + existing.id + ")");
} else {
  const r = db.prepare(`
    INSERT INTO clients
      (slug, name, description, system_prompt, api_key, base_url, model,
       tg_token, tg_chat_id, widget_color, widget_title, widget_placeholder, rate_limit, active)
    VALUES
      ('albamed', @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_title, @widget_placeholder, 30, 1)
  `).run({
    name: "Альба Мед",
    description: "Медицинская клиника, Симферополь",
    system_prompt: ALBAMED_SYSTEM_PROMPT,
    api_key: process.env.ANTHROPIC_API_KEY || "",
    base_url: "https://aiprime.store/v1/",
    model: "claude-haiku-4-5-20251001",
    tg_token: process.env.ALBAMED_TG_TOKEN || "",
    tg_chat_id: process.env.ALBAMED_TG_CHAT_ID || "",
    widget_color: "#0891b2",
    widget_title: "Медассистент",
    widget_placeholder: "Задайте вопрос о здоровье или записи…",
  });
  console.log("✓ Albamed created (id=" + r.lastInsertRowid + ")");
}

console.log("\nEmbed code:");
console.log('<script src="https://optisphere.tech/widget.js" data-bot="albamed"></script>');

db.close();
