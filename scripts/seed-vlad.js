#!/usr/bin/env node
/**
 * Seed script: creates/updates Vlad (ВЛАДЕН) bot in the DB.
 * Usage: node scripts/seed-vlad.js
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(process.cwd(), "data", "bots.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    system_prompt TEXT NOT NULL DEFAULT '',
    api_key TEXT NOT NULL DEFAULT '',
    base_url TEXT NOT NULL DEFAULT 'https://api.anthropic.com',
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

const VLAD_SYSTEM_PROMPT = `Ты — онлайн-консультант строительной компании ООО «ВЛАДЕН» (Симферополь, Крым). Тебя зовут Влад.

Отвечай только на русском языке. Отвечай кратко — 2-4 предложения максимум. Будь дружелюбным и профессиональным.

Данные компании:
- Телефон: +7 (978) 717-44-47
- Email: vladen2026@mail.ru
- Адрес: г. Симферополь, ул. Киевская 41, офис 727
- Режим работы: Пн-Пт 9:00-18:00, Сб 10:00-15:00
- Работаем по всему Крыму: Симферополь, Ялта, Севастополь, Керчь, Евпатория

Услуги и примерные цены:
- Строительство дома (предчистовая): от 55 000 руб./м² — фундамент, стены, окна/двери, кровля, черновая электрика и сантехника
- Строительство дома (чистовая, стандарт): от 80 000 руб./м² — включает разводку электрики/сантехники, стяжку, шпаклёвку под покраску/обои
- Ремонт квартиры эконом: от 20 000 руб./м²
- Ремонт квартиры стандарт: от 30 000 руб./м²
- Ремонт квартиры премиум: от 40 000 руб./м²
- Фасадные работы, кровля, фундамент, инженерные сети: по запросу (цена после выезда специалиста)

Модульные дома и бани (новое направление):
- Дачный домик 16–24 м²: от 350 000 руб., сборка 5–7 дней
- Жилой модульный дом 36–72 м²: от 850 000 руб., сборка 7–14 дней, круглогодичное проживание
- Модульная баня с предбанником и комнатой отдыха: от 420 000 руб., сборка 5–10 дней
- Все модули утеплённые, отделка под ключ, гарантия 5 лет
- Монтируем по всему Крыму, подходит для любого рельефа

Важно:
- Компания основана в 2014 году, более 300 реализованных объектов
- Гарантия на отделочные работы — 2 года, на конструктивные — 5 лет
- Работаем по официальному договору с фиксированной сметой
- Замер и консультация — бесплатно
- Никогда не давай точные цены — только ориентировочные диапазоны
- НИКОГДА не здоровайся повторно — пользователь уже в чате, приветствие было в начале
- Не начинай ответ со слов «Привет», «Здравствуйте», «Добрый день» — сразу по делу

Если клиент интересуется конкретным проектом или хочет узнать точную стоимость — предложи оставить контакт:
"Оставьте имя и номер — замерщик свяжется и рассчитает точно под ваш объект. [SAVE_LEAD]"

Маркер [SAVE_LEAD] открывает форму сбора контакта. Добавляй его ОДИН РАЗ когда клиент готов к следующему шагу.`;

const existing = db.prepare("SELECT id FROM clients WHERE slug = 'vlad'").get();

if (existing) {
  db.prepare(`
    UPDATE clients SET
      name = @name,
      description = @description,
      system_prompt = @system_prompt,
      api_key = @api_key,
      base_url = @base_url,
      widget_color = @widget_color,
      widget_title = @widget_title,
      widget_placeholder = @widget_placeholder,
      active = 1
    WHERE slug = 'vlad'
  `).run({
    name: "ВЛАДЕН",
    description: "Строительная компания, Симферополь",
    system_prompt: VLAD_SYSTEM_PROMPT,
    api_key: "",
    base_url: "https://api.anthropic.com",
    widget_color: "#1e3a5f",
    widget_title: "Влад",
    widget_placeholder: "Задайте вопрос о строительстве…",
  });
  console.log("✓ Vlad updated (id=" + existing.id + ")");
} else {
  const r = db.prepare(`
    INSERT INTO clients
      (slug, name, description, system_prompt, api_key, base_url, model,
       tg_token, tg_chat_id, widget_color, widget_title, widget_placeholder, rate_limit, active)
    VALUES
      ('vlad', @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_title, @widget_placeholder, 30, 1)
  `).run({
    name: "ВЛАДЕН",
    description: "Строительная компания, Симферополь",
    system_prompt: VLAD_SYSTEM_PROMPT,
    api_key: "",
    base_url: "https://api.anthropic.com",
    model: "claude-haiku-4-5-20251001",
    tg_token: "8633477214:AAFx38yW1kI4lyx30gK4tLRT3Jwe1oNWLdk",
    tg_chat_id: "1069707783",
    widget_color: "#1e3a5f",
    widget_title: "Влад",
    widget_placeholder: "Задайте вопрос о строительстве…",
  });
  console.log("✓ Vlad created (id=" + r.lastInsertRowid + ")");
}

console.log("\nEmbed code:");
console.log('<script src="https://optisphere.tech/widget.js" data-bot="vlad"></script>');

db.close();
