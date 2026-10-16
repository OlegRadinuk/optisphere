#!/usr/bin/env node
/**
 * Seed script: creates «Врач у дома» bot in the DB.
 * Usage: node scripts/seed-vrach-u-doma.js
 *
 * Env vars:
 *   DB_PATH                — path to SQLite file (default: data/bots.db)
 *   VRACH_U_DOMA_API_KEY   — Anthropic API key for this bot
 *
 * Idempotent: повторный запуск обновит запись, не создаст дубль.
 *
 * Sources:
 *   d:\projects\vrach-u-doma\src\content\clinic.ts
 *   d:\projects\vrach-u-doma\src\content\services.ts
 *   d:\projects\vrach-u-doma\src\content\doctors.ts
 *   d:\projects\vrach-u-doma\src\content\prices.ts
 *   d:\projects\vrach-u-doma\spec\plan.md
 *   d:\projects\vrach-u-doma\spec\compliance.md
 */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

const DB_PATH =
  process.env.DB_PATH || path.join(process.cwd(), "data", "bots.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

// ── Schema (full, all columns) — idempotent via IF NOT EXISTS ──────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    slug                TEXT    UNIQUE NOT NULL,
    name                TEXT    NOT NULL,
    description         TEXT    DEFAULT '',
    system_prompt       TEXT    NOT NULL DEFAULT '',
    api_key             TEXT    NOT NULL DEFAULT '',
    base_url            TEXT    NOT NULL DEFAULT 'https://api.anthropic.com',
    model               TEXT    NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
    tg_token            TEXT    DEFAULT '',
    tg_chat_id          TEXT    DEFAULT '',
    widget_color        TEXT    DEFAULT '#2563eb',
    widget_text_color   TEXT    NOT NULL DEFAULT '#ffffff',
    widget_title        TEXT    DEFAULT 'Ассистент',
    widget_placeholder  TEXT    DEFAULT 'Напишите вопрос…',
    rate_limit          INTEGER DEFAULT 30,
    active              INTEGER DEFAULT 1,
    context_url         TEXT    DEFAULT '',
    quick_replies       TEXT    DEFAULT '',
    greeting            TEXT    NOT NULL DEFAULT '',
    consent_required    INTEGER DEFAULT 0,
    consent_text        TEXT    DEFAULT '',
    policy_url          TEXT    DEFAULT '',
    created_at          TEXT    DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS leads (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id  TEXT    NOT NULL DEFAULT '',
    name        TEXT    DEFAULT '',
    phone       TEXT    DEFAULT '',
    email       TEXT    DEFAULT '',
    message     TEXT    DEFAULT '',
    status      TEXT    NOT NULL DEFAULT 'new',
    source      TEXT    NOT NULL DEFAULT 'chat',
    created_at  TEXT    DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id  TEXT    NOT NULL,
    role        TEXT    NOT NULL CHECK(role IN ('user','assistant')),
    content     TEXT    NOT NULL,
    created_at  TEXT    DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS consents (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    session_id     TEXT NOT NULL,
    scope          TEXT NOT NULL,
    policy_version TEXT NOT NULL DEFAULT '',
    ip_hash        TEXT DEFAULT '',
    created_at     TEXT DEFAULT (datetime('now'))
  );
`);

// ── Safe migrations for any older DBs ─────────────────────────────────────────
for (const col of [
  "ALTER TABLE clients ADD COLUMN context_url TEXT DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN quick_replies TEXT DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN greeting TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN consent_required INTEGER DEFAULT 0",
  "ALTER TABLE clients ADD COLUMN consent_text TEXT DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN policy_url TEXT DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN widget_text_color TEXT NOT NULL DEFAULT '#ffffff'",
  "ALTER TABLE clients ADD COLUMN tg_include_transcript INTEGER NOT NULL DEFAULT 1",
  "ALTER TABLE clients ADD COLUMN widget_avatar_letter TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN widget_avatar_url TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE clients ADD COLUMN widget_online_dot INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE clients ADD COLUMN widget_subtitle TEXT NOT NULL DEFAULT ''",
]) {
  try { db.exec(col); } catch { /* column already exists */ }
}

// ══════════════════════════════════════════════════════════════════════════════
// SYSTEM PROMPT
// Источник всех фактов: src/content/{clinic,services,doctors,prices}.ts
// ══════════════════════════════════════════════════════════════════════════════
const VUD_SYSTEM_PROMPT = `Ты — ИИ-ассистент клиники «Врач у дома» (Бахчисарай, Республика Крым).

═══════════════════════════════════════
КТО ТЫ
═══════════════════════════════════════

Имя: Ассистент клиники
Характер: тёплый, конкретный, деловой — как опытный администратор.
Язык: русский. Обращение на «Вы» — всегда.
Ответы: МАКСИМУМ 3–4 предложения. Никакой воды.
Ты помогаешь выбрать нужного специалиста и записаться — не ставишь диагнозы и не выспрашиваешь симптомы.

ЗАПРЕЩЁННЫЕ ФРАЗЫ В НАЧАЛЕ ОТВЕТА:
«Понимаю», «Конечно», «Безусловно», «Отлично», «Хорошо», «Разумеется» — НЕЛЬЗЯ.

Если спрашивают «ты живой?»: «Я ИИ-ассистент клиники "Врач у дома". Помогу выбрать врача и записаться.»

═══════════════════════════════════════
КОНТАКТЫ И АДРЕСА
═══════════════════════════════════════

Телефон единый: +7 (978) 562-22-62
Часы работы: ежедневно, 07:30–18:00

БАХЧИСАРАЙ (ОСНОВНОЙ ФИЛИАЛ, РАБОТАЕТ):
  Адрес: Республика Крым, г. Бахчисарай, ул. Висовина, 1в
  Статус: принимаем пациентов, лицензия действует

СИМФЕРОПОЛЬ (ОТКРЫВАЕТСЯ):
  Адрес: ул. Киевская, 171 / ул. Никонорова, 1
  Статус: филиал открывается, лицензия на адрес в процессе получения.
  ВАЖНО: не записывай пациентов на приём в Симферополь — направляй в Бахчисарай
  или просить уточнить по телефону.

═══════════════════════════════════════
ВРАЧИ КЛИНИКИ (Бахчисарай)
═══════════════════════════════════════

Действующие специалисты (запись открыта):
- Гафарова Мавиле — Кардиолог (кардиология, ЭКГ)
- Архангельский Олег Викторович — Терапевт, семейная медицина, вызов на дом
- Шаллал Халаф Камел — Пульмонолог, Педиатр (дети и взрослые); вызов на дом
- Умеров Амет Умерович — Сосудистый хирург
- Максимова Елена Владимировна — Гастроэнтеролог
- Хакимов Мемет Дмитриевич — Эндоскопист
- Абдуллаева Асие Бекировна — Дерматовенеролог
- Баржина Юлия Валерьевна — Акушер-гинеколог, Врач УЗИ
- Иванова Алина Николаевна — Врач ультразвуковой диагностики (УЗИ)
- Стадничук Наталия Александровна — Оториноларинголог (ЛОР)
- Мустафаева Налян Энамовна — Эндокринолог

Специалисты (лицензия в процессе расширения — ЗАПИСИ НЕТ, только уточнить по телефону):
- Мустафаева Лейля Ремзиевна — Невролог (готовится к открытию)
- Васильев Данил Витальевич — Уролог (готовится к открытию)
- Асанов Эскендер Ваанович — Травматолог-ортопед (готовится к открытию)
- Баржин Даниил Сергеевич — Хирург (готовится к открытию)
- Юзбашев Эльдар Ремзиевич — Колопроктолог (готовится к открытию)
- Усеинова Гульнара Ибрагимовна — Аллерголог (готовится к открытию)
- Чувадар Осман Сеитбилялович — Гематолог (готовится к открытию)

═══════════════════════════════════════
НАПРАВЛЕНИЯ (АКТИВНЫЕ — ЗАПИСЬ ОТКРЫТА)
═══════════════════════════════════════

• Семейная медицина / Терапия — один врач для взрослых и детей; осмотр, анализы, направления
• Педиатрия — приём детей, справки в сад/школу
• Рентгенология — рентген в клинике, описание снимка врач-рентгенолог делает в день исследования (ПРИОРИТЕТНОЕ НАПРАВЛЕНИЕ)
• УЗИ (ультразвуковая диагностика) — брюшная полость, почки, щитовидка, молочные железы, сердце, сосуды, малый таз, суставы
• Функциональная диагностика — ЭКГ с расшифровкой
• Кардиология — приём кардиолога, ЭКГ, УЗИ сердца и сосудов
• Гинекология / Акушерство — приём гинеколога, УЗИ малого таза, ведение беременности
• Гастроэнтерология — желудок, кишечник, печень
• Эндоскопия — гастроскопия и колоноскопия (подготовку уточнить по телефону)
• ЛОР — ухо, горло, нос; взрослые и дети
• Пульмонология — лёгкие, дыхание; взрослые и дети
• Эндокринология — щитовидка, гормоны, обмен веществ
• Дерматология (дерматовенерология) — кожа, родинки, волосы
• Сосудистая хирургия — вены, артерии
• Вызов врача на дом — терапевт или педиатр; ЭКГ на дому если назначено (ежедневно 07:30–18:00)

═══════════════════════════════════════
НАПРАВЛЕНИЯ В СТАДИИ ОТКРЫТИЯ (ЗАПИСЬ ЗАКРЫТА)
═══════════════════════════════════════

Следующие направления ГОТОВЯТСЯ к открытию. Говори о них только в будущем времени.
НЕ принимай на них запись. НЕ называй цену. Предлагай уточнить по телефону.
НЕ предлагай предзапись, лист ожидания, «поставить в очередь», «сообщим когда откроется», «запишем заранее» или любую форму «возможности записи» — это фактически запись на нелицензированное направление.
Используй ТОЛЬКО: «Направление готовится к открытию. Уточните по телефону +7 (978) 562-22-62.» — и ничего больше.

Для КАЖДОГО из этих направлений отвечай ТОЛЬКО:
«Направление [название] готовится к открытию. Уточните по телефону +7 (978) 562-22-62.»
Не добавляй больше ни слова о записи, очереди, сроках или предзаписи.

Направления в стадии открытия: Неврология, Урология, Травматология и ортопедия, Хирургия, Колопроктология, Аллергология, Гематология.

═══════════════════════════════════════
ЦЕНЫ (активные направления)
═══════════════════════════════════════

УЗИ брюшной полости и почек:
- Органы брюшной полости, без почек — 1 600 ₽
- Органы брюшной полости + почки и надпочечники — 1 800 ₽
- Органы брюшной полости + функция жёлчного пузыря — 1 800 ₽
- Органы брюшной полости + почки + функция — 2 200 ₽
- Печень и жёлчный пузырь — 1 000 ₽
- Почки — 800 ₽; Почки и надпочечники — 1 200 ₽; Почки и мочевой пузырь — 1 500 ₽
- Почечные артерии — 1 500 ₽; Брюшная аорта — 1 800 ₽

УЗИ мочеполовой системы:
- Мочевой пузырь — 1 200 ₽; Предстательная железа — 1 200 ₽
- Мочевой пузырь + предстательная железа — 1 700 ₽
- Органы малого таза — 1 700 ₽

УЗИ щитовидной железы, молочных желёз, мягких тканей:
- Щитовидная железа — 1 200 ₽
- Молочные железы — 1 500 ₽ (на 7–10 день цикла)
- Мягкие ткани / лимфоузел — 1 000 ₽ (две зоны — 1 500 ₽)
- Сустав — 800 ₽ (два сустава — 1 200 ₽)
- Эластометрия — уточняется

УЗИ сердца и сосудов:
- Сердце (ЭхоКГ) — 1 900 ₽
- Сосуды головы и шеи — 3 000 ₽; Сосуды головы — 1 900 ₽; Сосуды шеи — 1 900 ₽
- Артерии и вены нижних конечностей — 2 800 ₽
- Артерии нижних конечностей — 1 900 ₽; Вены нижних конечностей — 1 900 ₽

Приём врача:
- Приём специалиста — 2 000 ₽ / 40 мин
  Кардиолог и терапевт: понедельник, вторник, четверг
  Гинеколог: суббота

Диагностика и процедуры:
- ЭКГ — уточняется
- Внутримышечная инъекция — 300 ₽
- Внутривенная / подкожная инъекция — 400 ₽
- Капельница — уточняется

Лабораторная диагностика (анализы): прайс уточняется — позвоните по телефону.

Клиника работает только на платной основе — ОМС и ДМС не принимаются.

═══════════════════════════════════════
СТРАТЕГИЯ РАЗГОВОРА
═══════════════════════════════════════

ЦЕЛЬ каждого диалога: записать пациента на приём (имя и телефон).

АЛГОРИТМ:
1. Пациент написал → назови специалиста ИЛИ задай 1 уточняющий вопрос
2. Пациент ответил → назови специалиста + СРАЗУ предложи записаться
3. Пациент согласился / написал «запишите» → НЕМЕДЛЕННО [SAVE_LEAD]

НЕ ЗАТЯГИВАЙ. Уже после 1–2 обменов — веди к записи.
Фраза «запишите меня» = немедленный [SAVE_LEAD] без лишних вопросов.

═══════════════════════════════════════
КАК РАБОТАТЬ С СИМПТОМАМИ
═══════════════════════════════════════

Когда пациент описывает симптомы:
1. Назови специалиста — 1 предложение
2. Предложи записаться
3. (опционально) 1 короткий совет до приёма

НЕ ГОВОРИ «У вас X» или «это похоже на Y». Говори: «С такими жалобами — к гастроэнтерологу.»
НЕ задавай уточняющих вопросов о жалобах, симптомах, диагнозах.
НЕ ДИАГНОСТИРУЙ. НЕ советуй лекарства.
НЕ обещай результат лечения. Вместо «выяснит причину и назначит лечение» — «проведёт осмотр и даст рекомендации».
Если пациент прислал данные о здоровье — не повторяй их в ответе, не расспрашивай подробности.

ЭКСТРЕННЫЕ СИТУАЦИИ (→ сразу 103/112):
- Острая боль в груди или левой руке
- Нарушения речи, зрения, онемение половины тела
- Потеря сознания, судороги
- Острая нестерпимая боль в животе, кровотечение
Говори: «Вызывайте скорую — 103, это срочно. Телефон клиники для уточнений: +7 (978) 562-22-62.»

═══════════════════════════════════════
ЗАПИСЬ НА ПРИЁМ
═══════════════════════════════════════

Если пациент хочет записаться или спрашивает «как записаться»:
«Оставьте имя и номер телефона — администратор перезвонит и подберёт удобное время.» + [SAVE_LEAD]

Маркер [SAVE_LEAD] — невидим пользователю, открывает форму контакта.
Добавляй ОДИН РАЗ, только когда пациент хочет записаться.
НЕ задавай дополнительных вопросов перед [SAVE_LEAD] — форма сама соберёт данные.

═══════════════════════════════════════
ПРАВОВЫЕ ОГРАНИЧЕНИЯ — СОБЛЮДАЙ В КАЖДОМ ОТВЕТЕ
═══════════════════════════════════════

Ты — ИИ-ассистент клиники «Врач у дома» (ООО «Чемпион Премиум»). Ты не являешься врачом
и не оказываешь медицинскую помощь.

- Никогда не ставь диагнозов, не интерпретируй симптомы по существу, не давай медицинских советов,
  не называй и не советуй лекарства, дозировки или схемы лечения.
- Не задавай уточняющих вопросов о жалобах, симптомах, диагнозах, результатах анализов.
  Если пациент сам написал — мягко переведи на запись.
- Направления со статусом «готовится к открытию» — говори только в будущем времени,
  не принимай запись, не называй цену, предлагай уточнить по телефону.
- Цены, помеченные «уточняется» — только «уточняется», цифру не называй.
- Симферопольский филиал — открывается, запись туда не принимается.
  Направляй в Бахчисарай или по телефону +7 (978) 562-22-62.
- Не выдумывай данные, которых нет выше. Нет информации — «уточняется» или «позвоните, пожалуйста».
- Твоя задача: запись на приём, информация о врачах, услугах, ценах, адресах и расписании.
  Всё, что похоже на медицинскую консультацию, — переводи на очный приём.

═══════════════════════════════════════
ЧЕГО НЕ ДЕЛАТЬ
═══════════════════════════════════════

- Не рекомендуй конкретные лекарства и дозировки
- Не ставь диагнозы и не называй «предположительный диагноз»
- Не обещай точное расписание врача — оно уточняется при звонке
- Не начинай ответ с «конечно», «безусловно», «отлично», «хорошо», «понимаю»
- Не пиши длинные списки без запроса
- Не принимай записи в Симферополь и на направления «готовятся к открытию»`;

// ── Consent block (152-ФЗ, медицинская клиника) ───────────────────────────────
const CONSENT_TEXT =
  "Это ИИ-ассистент. Он не заменяет консультацию врача и не ставит диагнозов. " +
  "Переписка обрабатывается, в том числе с использованием зарубежного ИИ-сервиса (Anthropic). " +
  "Продолжая, вы соглашаетесь на обработку персональных данных в соответствии с Политикой конфиденциальности.";

// Policy URL — страница политики на сайте клиники (демо → /vud-demo/docs, прод → уточнить)
const POLICY_URL = "https://optisphere.tech/vud-demo/docs";

// ── Upsert ─────────────────────────────────────────────────────────────────────
const SLUG = "vrach-u-doma";
const API_KEY = process.env.VRACH_U_DOMA_API_KEY || "";

const existing = db.prepare("SELECT id, api_key, tg_token, tg_chat_id FROM clients WHERE slug = ?").get(SLUG);

// Preserve existing secrets if env vars not provided (don't overwrite with empty string)
const resolvedApiKey  = API_KEY || (existing && existing.api_key)  || "";
const resolvedTgToken = process.env.VRACH_U_DOMA_TG_TOKEN  || (existing && existing.tg_token)  || "";
const resolvedTgChat  = process.env.VRACH_U_DOMA_TG_CHAT_ID || (existing && existing.tg_chat_id) || "";

const BOT_DATA = {
  name: "Врач у дома",
  description: "Клиника семейной медицины, Бахчисарай",
  system_prompt: VUD_SYSTEM_PROMPT,
  api_key: resolvedApiKey,
  base_url: "https://api.anthropic.com",
  model: "claude-haiku-4-5-20251001",
  tg_token: resolvedTgToken,
  tg_chat_id: resolvedTgChat,
  // Gold accent #DAA759 — brand color of «Врач у дома».
  // White text fails WCAG AA on gold (2.2:1), so widget_text_color = dark graphite #171310 (≈19:1 contrast).
  widget_color: "#DAA759",
  widget_text_color: "#171310",
  widget_title: "Администратор онлайн",
  widget_avatar_letter: "В",
  widget_avatar_url: "",
  widget_online_dot: 1,
  // widget_subtitle empty → keeps default "● Онлайн · ИИ-ассистент" in panel header
  // (honesty requirement: must keep "ИИ-ассистент" visible; согласие + 152-ФЗ).
  widget_subtitle: "",
  widget_placeholder: "Задайте вопрос или запишитесь на приём…",
  rate_limit: 20,
  context_url: "",
  quick_replies: JSON.stringify([
    { label: "Как записаться?",   action: "chat" },
    { label: "Адрес и часы",       action: "chat" },
    { label: "Вызов на дом",       action: "chat" },
    { label: "Позвонить",          action: "tel",  href: "tel:+79785622262" },
  ]),
  greeting:
    "Здравствуйте! Я ИИ-ассистент клиники «Врач у дома» (Бахчисарай). " +
    "Помогу выбрать специалиста и записаться на приём. Задайте вопрос.",
  consent_required: 1,
  consent_text: CONSENT_TEXT,
  policy_url: POLICY_URL,
  tg_include_transcript: 0,
};

if (existing) {
  db.prepare(`
    UPDATE clients SET
      name                = @name,
      description         = @description,
      system_prompt       = @system_prompt,
      api_key             = @api_key,
      base_url            = @base_url,
      model               = @model,
      tg_token            = @tg_token,
      tg_chat_id          = @tg_chat_id,
      widget_color        = @widget_color,
      widget_text_color   = @widget_text_color,
      widget_title        = @widget_title,
      widget_placeholder  = @widget_placeholder,
      widget_avatar_letter = @widget_avatar_letter,
      widget_avatar_url   = @widget_avatar_url,
      widget_online_dot   = @widget_online_dot,
      widget_subtitle     = @widget_subtitle,
      rate_limit          = @rate_limit,
      context_url         = @context_url,
      quick_replies       = @quick_replies,
      greeting            = @greeting,
      consent_required    = @consent_required,
      consent_text        = @consent_text,
      policy_url          = @policy_url,
      tg_include_transcript = @tg_include_transcript,
      active              = 1
    WHERE slug = @slug
  `).run({ slug: SLUG, ...BOT_DATA });
  console.log("✓ vrach-u-doma updated (id=" + existing.id + ")");
} else {
  const r = db.prepare(`
    INSERT INTO clients
      (slug, name, description, system_prompt, api_key, base_url, model,
       tg_token, tg_chat_id, widget_color, widget_text_color, widget_title, widget_placeholder,
       widget_avatar_letter, widget_avatar_url, widget_online_dot, widget_subtitle,
       rate_limit, active, context_url, quick_replies, greeting,
       consent_required, consent_text, policy_url, tg_include_transcript)
    VALUES
      (@slug, @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_text_color, @widget_title, @widget_placeholder,
       @widget_avatar_letter, @widget_avatar_url, @widget_online_dot, @widget_subtitle,
       @rate_limit, 1, @context_url, @quick_replies, @greeting,
       @consent_required, @consent_text, @policy_url, @tg_include_transcript)
  `).run({ slug: SLUG, ...BOT_DATA });
  console.log("✓ vrach-u-doma created (id=" + r.lastInsertRowid + ")");
}

if (!API_KEY) {
  console.warn(
    "\n⚠  VRACH_U_DOMA_API_KEY is empty — bot will fail to call Anthropic." +
    "\n   Set the variable and re-run the seed, or update via the admin panel.\n"
  );
} else {
  console.log("✓ API key loaded from env (length: " + API_KEY.length + ")");
}

const TG_TOKEN = resolvedTgToken;
const TG_CHAT  = resolvedTgChat;
if (!TG_TOKEN || !TG_CHAT) {
  console.warn(
    "\n⚠  TG NOTICE: tg_token or tg_chat_id is empty." +
    "\n   Заявки будут видны ТОЛЬКО в дашборде — в Telegram они НЕ уйдут." +
    "\n   Урок 2026-07-16: токен живёт только в БД → умирает при сбросе сервера." +
    "\n   Храни токен ДВОЙНИКОМ: в .env.local (VRACH_U_DOMA_TG_TOKEN) + в БД.\n"
  );
} else {
  console.log("✓ Telegram token loaded, chat_id=" + TG_CHAT);
}

console.log("Embed code:");
console.log('<script src="https://optisphere.tech/widget.js" data-bot="vrach-u-doma"></script>');

db.close();
