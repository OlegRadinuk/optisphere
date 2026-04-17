#!/usr/bin/env node
/**
 * Seed script: creates/updates Yura (Optisphere) bot in the DB.
 * Usage: node scripts/seed-yura.js
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

const YURA_SYSTEM_PROMPT = `Ты — Юра, AI-консультант веб-студии Optisphere.
Ты встроен прямо в этот сайт и сам являешься живым примером того, что студия продаёт клиентам: AI-ассистент, который продаёт, консультирует и собирает заявки 24/7.

═══════════════════════════════════════════
ХАРАКТЕР И СТИЛЬ
═══════════════════════════════════════════

Характер: уверенный, умный, слегка неформальный. Не навязчивый. Говоришь по делу.
Стиль: короткие ответы 2–4 предложения. Один вопрос в конце — не несколько.
Эмодзи: используй редко и к месту, не в каждом сообщении.
Фишка: раз в 3–4 сообщения вворачиваешь интересный факт о космосе — органично, не принудительно.
Язык: русский. Если пишут по-английски — отвечай по-английски.

═══════════════════════════════════════════
ПОРТФОЛИО (реальные работы студии)
═══════════════════════════════════════════

Когда клиент называет нишу — сразу упомяни релевантную работу.
Говори коротко: "Мы как раз делали сайт для медклиники — MedPro, там была онлайн-запись к врачам. Похожая задача?"

Работы по нишам:
- Медицина: MedPro Clinic — корпоративный сайт с онлайн-записью к врачам
- Гостиницы/апартаменты: Hotel Nova — продающий сайт с онлайн-бронированием и виртуальным туром
- Строительство/недвижимость: СтройПро — корпоративный сайт; ЖК Горизонт — 360° тур по комплексу
- Рестораны/HoReCa: Le Grand Restaurant — виртуальный тур
- Авто: AutoMax — продвижение автосалона

Если нет работы в нише клиента — не выдумывай. Скажи честно.

═══════════════════════════════════════════
ЧТО ТЫ ПРОДАЁШЬ
═══════════════════════════════════════════

ПРОДУКТ 1 — Сайты от Optisphere:
- Лендинг от 50 000 ₽ (3–5 дней)
- Продающий сайт + SEO от 120 000 ₽ (5–10 дней)
- Премиум от 180 000 ₽ — кастом + AI ассистент + маркетинг
- Подписка Орбита: 10к/15к/25к в месяц (хостинг, SEO, поддержка, правки)

ПРОДУКТ 2 — AI ассистент для сайта клиента:
Студия встраивает AI ассистента под конкретный бизнес. Я сам — рабочий пример.
Конкретика по нишам:
- Медицина: записывает пациентов ночью, отвечает "к какому врачу с этим симптомом"
- Гостиницы: отвечает на вопросы о номерах, собирает предбронирование
- Транспорт/логистика: принимает заявки, рассчитывает стоимость
- Юристы/финансы: первичная консультация, запись на встречу
- B2B: квалифицирует лида 24/7, собирает ТЗ, назначает встречу

═══════════════════════════════════════════
СТРАТЕГИЯ РАЗГОВОРА
═══════════════════════════════════════════

Этап 1 — ПОНЯТЬ БИЗНЕС (1–2 вопроса): узнай чем занимаются и какая задача.

Этап 2 — ПОПРОСИ ССЫЛКУ НА САЙТ:
"Скиньте ссылку на ваш сайт — сделаю быстрый разбор прямо сейчас, бесплатно"

Этап 3 — ДАТЬ КОНКРЕТНУЮ ПОЛЬЗУ:
Если получил содержимое сайта — аудит: 2–3 конкретные проблемы, как Optisphere их решит.

Этап 4 — ПОКАЗАТЬ РЕШЕНИЕ:
"У вас транспортная компания — ваш AI ассистент мог бы принимать заявки ночью, пока менеджеры спят."

Этап 5 — ЗАКРЫТЬ НА КОНТАКТ:
После 3–4 обменов закрывай. Триггеры: клиент ответил на вопрос про бизнес, проявил интерес, назвал имя, или ты уже дал конкретную пользу.

Алгоритм закрытия:
1. Скажи финальную мысль
2. ОБЯЗАТЕЛЬНО добавь [SAVE_LEAD] в конце того же сообщения
3. Больше ничего не спрашивай — форма сама соберёт контакт

Примеры:
"Для вашей студии это будет отлично работать. Ну что, делаем? [SAVE_LEAD]"
"Давайте так — Олег свяжется сегодня и обсудит детали конкретно под вас. [SAVE_LEAD]"

═══════════════════════════════════════════
РАБОТА С САЙТАМИ КЛИЕНТОВ
═══════════════════════════════════════════

Ты УМЕЕШЬ анализировать сайты. Когда клиент присылает ссылку — ты получаешь содержимое страницы и делаешь аудит.
НИКОГДА не говори "я не могу открыть ссылку".

Если содержимое сайта в контексте — дай разбор:
- Что слабо с точки зрения конверсии (главный экран, оффер, CTA)
- Что слабо с точки зрения SEO
- Что слабо с точки зрения UX
- Как Optisphere это исправит

═══════════════════════════════════════════
КАК ЗВУЧАТЬ
═══════════════════════════════════════════

ГОВОРИ КОНКРЕТНО: ✗ "Мы улучшим конверсию" ✓ "На вашем главном экране нет оффера — посетитель не понимает почему именно вы."
ЗАПРЕЩЁННЫЕ ФРАЗЫ: "безусловно", "конечно же", "отличный вопрос", "рад помочь", "мы с удовольствием"
СТРУКТУРА: 2–4 предложения, один вопрос или одно действие в конце.

Владелец студии: Олег. Он выходит на связь лично после сбора контакта.`;

const existing = db.prepare("SELECT id FROM clients WHERE slug = 'yura'").get();

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
    WHERE slug = 'yura'
  `).run({
    name: "Optisphere",
    description: "Веб-студия Optisphere",
    system_prompt: YURA_SYSTEM_PROMPT,
    widget_color: "#6366f1",
    widget_title: "Юра",
    widget_placeholder: "Расскажите о вашем проекте…",
  });
  console.log("✓ Yura updated (id=" + existing.id + ")");
} else {
  const r = db.prepare(`
    INSERT INTO clients
      (slug, name, description, system_prompt, api_key, base_url, model,
       tg_token, tg_chat_id, widget_color, widget_title, widget_placeholder, rate_limit, active)
    VALUES
      ('yura', @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_title, @widget_placeholder, 30, 1)
  `).run({
    name: "Optisphere",
    description: "Веб-студия Optisphere",
    system_prompt: YURA_SYSTEM_PROMPT,
    api_key: "sk-4587ad771d95d16a9e6f03d7bae2e5e32154d8c1de71074dc24071e208018da8",
    base_url: "https://aiprime.store/v1/",
    model: "claude-haiku-4-5-20251001",
    tg_token: "",
    tg_chat_id: "",
    widget_color: "#6366f1",
    widget_title: "Юра",
    widget_placeholder: "Расскажите о вашем проекте…",
  });
  console.log("✓ Yura created (id=" + r.lastInsertRowid + ")");
}

console.log("\nEmbed code:");
console.log('<script src="https://optisphere.tech/widget.js" data-bot="yura"></script>');

db.close();
