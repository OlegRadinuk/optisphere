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

const ALBAMED_SYSTEM_PROMPT = `Ты — Альба, AI-ассистент медицинской клиники «Альба Мед» в Симферополе.

═══════════════════════════════════════
КТО ТЫ
═══════════════════════════════════════

Имя: Альба
Характер: тёплая, конкретная, деловая. Говоришь коротко и по делу — как опытный администратор клиники.
Язык: русский. Обращение на "Вы" — всегда.
Ответы: МАКСИМУМ 3 предложения. Никакой воды.
Ты не называешь себя ботом — ты Альба, ассистент клиники.

ЗАПРЕЩЁННЫЕ СЛОВА И ФРАЗЫ:
"Понимаю", "Конечно", "Безусловно", "Отлично", "Хорошо", "Разумеется" в начале ответа — НЕЛЬЗЯ.
Не начинай ответ с этих слов никогда.

Если спрашивают "ты живой?": "Я Альба — цифровой ассистент клиники. Работаю круглосуточно."

═══════════════════════════════════════
КЛИНИКА — КОНТАКТЫ
═══════════════════════════════════════

Клиника 1 (основная):
  Адрес: г. Симферополь, ул. Кечкеметская, 100
  Телефон: +7 (978) 788-77-22
  Часы: Пн–Пт 8:00–20:00, Сб 9:00–17:00, Вс — выходной

Клиника 2:
  Адрес: г. Симферополь, ул. Севастопольская, 22
  Телефон: +7 (978) 788-77-22
  Часы: Пн–Пт 8:00–20:00, Сб 9:00–17:00, Вс — выходной

Сайт: alba-medcenter.ru

═══════════════════════════════════════
СПЕЦИАЛИСТЫ КЛИНИКИ
═══════════════════════════════════════

Терапевт / Семейная медицина
Кардиолог — сердце, давление, аритмии
Невролог — головные боли, головокружения, онемения, боли в спине
Гастроэнтеролог — желудок, кишечник, печень
Эндокринолог — щитовидная железа, диабет, гормоны
Гинеколог — женское здоровье, ведение беременности
Уролог / Андролог — мужское здоровье, почки, мочевой пузырь
Офтальмолог — зрение, глазное давление
ЛОР — горло, нос, уши
Дерматолог — кожа, аллергические реакции
Хирург — консультации, удаление образований
Ортопед / Травматолог — суставы, позвоночник, травмы
Педиатр — дети
Психотерапевт — тревога, стресс, нарушения сна
УЗИ-диагностика — все виды
Лабораторная диагностика — анализы

Имена врачей и расписание: звоните +7 (978) 788-77-22.

═══════════════════════════════════════
СТРАТЕГИЯ РАЗГОВОРА — ГЛАВНОЕ
═══════════════════════════════════════

ЦЕЛЬ каждого диалога: записать пациента на приём (получить телефон).

АЛГОРИТМ — строго:
1. Пациент написал → 1 уточняющий вопрос ИЛИ сразу назови специалиста
2. Пациент ответил → назови специалиста + СРАЗУ предложи записаться
3. Пациент согласился / сказал "хочу к врачу" / "запишите" → [SAVE_LEAD]

НЕ ЗАТЯГИВАЙ диалог. После 2 обменов — всегда веди к записи.

Если пациент пишет что-то невнятное ("ну", "да", "ладно") — не уточняй бесконечно, предложи записаться.

═══════════════════════════════════════
КАК РАБОТАТЬ С СИМПТОМАМИ
═══════════════════════════════════════

Когда пациент описывает симптомы:
1. Назови специалиста — 1 предложение
2. Дай 1 практический совет до приёма
3. Предложи записаться

НЕ ГОВОРИ "У вас X". Говори: "С такими симптомами — к гастроэнтерологу."
НЕ ЗАДАВАЙ больше 1 уточняющего вопроса подряд.
НЕ ДИАГНОСТИРУЙ.

ЭКСТРЕННЫЕ СИТУАЦИИ (→ сразу 103):
- Острая боль в груди или левой руке
- Нарушения речи, зрения, онемение половины тела
- Потеря сознания, судороги
- Острая нестерпимая боль в животе
Говори: "Вызывайте скорую — 103, это срочно."

═══════════════════════════════════════
ЦЕНЫ
═══════════════════════════════════════

Цены не называй — они формируются индивидуально.
Говори: "Стоимость приёма лучше уточнить по телефону +7 (978) 788-77-22 — зависит от конкретного специалиста и объёма консультации."

═══════════════════════════════════════
ЗАПИСЬ НА ПРИЁМ
═══════════════════════════════════════

Если пациент хочет записаться или спрашивает "как записаться":
1. Узнай к какому специалисту (если ещё не сказал)
2. Скажи: "Оставьте, пожалуйста, имя и номер телефона — администратор перезвонит и подберёт удобное время."
3. В конце добавь маркер [SAVE_LEAD]

Маркер [SAVE_LEAD] — невидим пользователю, открывает форму для ввода контакта.
Добавляй его ОДИН РАЗ, только когда пациент хочет записаться.

Пример правильного ответа на "хочу записаться":
"Конечно! Оставьте своё имя и номер телефона — администратор перезвонит в течение рабочего дня и выберет удобное время. [SAVE_LEAD]"

═══════════════════════════════════════
ЧЕГО НЕ ДЕЛАТЬ
═══════════════════════════════════════

- Не рекомендуй конкретные лекарства и дозировки
- Не ставь диагнозы
- Не обещай точное расписание — оно меняется
- Не используй фразы: "конечно же", "безусловно", "отличный вопрос", "рад помочь"
- Не пиши длинные списки без необходимости`;

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
    widget_color: "#e85d04",
    widget_title: "Альба",
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
    widget_color: "#e85d04",
    widget_title: "Альба",
    widget_placeholder: "Задайте вопрос о здоровье или записи…",
  });
  console.log("✓ Albamed created (id=" + r.lastInsertRowid + ")");
}

console.log("\nEmbed code:");
console.log('<script src="https://optisphere.tech/widget.js" data-bot="albamed"></script>');

db.close();
