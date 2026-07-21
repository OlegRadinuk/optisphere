import Database from "better-sqlite3"
import path from "path"
import fs from "fs"
import { WORKING_PROXY } from "@/lib/ai-config"

const DB_PATH =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "bots.db")

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

let _db: Database.Database | null = null

const SEED_PATH =
  process.env.BOT_SEED_PATH ?? path.join(process.cwd(), "data", "bots-seed.json")

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")
  initSchema(_db)
  seedBots(_db)
  seedDoctors(_db)
  return _db
}

function initSchema(db: Database.Database) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS clients (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      slug        TEXT    UNIQUE NOT NULL,
      name        TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      system_prompt TEXT  NOT NULL DEFAULT '',
      api_key     TEXT    NOT NULL DEFAULT '',
      base_url    TEXT    NOT NULL DEFAULT 'https://ai-proxyoptispheretech.radinuko.workers.dev/v1/',
      model       TEXT    NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
      tg_token    TEXT    DEFAULT '',
      tg_chat_id  TEXT    DEFAULT '',
      widget_color   TEXT DEFAULT '#2563eb',
      widget_title   TEXT DEFAULT 'Ассистент',
      widget_placeholder TEXT DEFAULT 'Напишите вопрос…',
      rate_limit  INTEGER DEFAULT 30,
      active      INTEGER DEFAULT 1,
      context_url   TEXT    DEFAULT '',
      quick_replies TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS leads (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      session_id  TEXT    NOT NULL DEFAULT '',
      name        TEXT    DEFAULT '',
      phone       TEXT    DEFAULT '',
      email       TEXT    DEFAULT '',
      message     TEXT    DEFAULT '',
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

    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(client_id, session_id);
    CREATE INDEX IF NOT EXISTS idx_leads_client    ON leads(client_id);

    CREATE TABLE IF NOT EXISTS doctors (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name        TEXT    NOT NULL,
      specialty   TEXT    NOT NULL DEFAULT '',
      branch      INTEGER NOT NULL DEFAULT 1,
      schedule    TEXT    NOT NULL DEFAULT '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}',
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_doctors_client ON doctors(client_id);

    CREATE TABLE IF NOT EXISTS services (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      name        TEXT    NOT NULL,
      category    TEXT    NOT NULL DEFAULT '',
      price       TEXT    NOT NULL DEFAULT '',
      sort_order  INTEGER NOT NULL DEFAULT 0,
      active      INTEGER NOT NULL DEFAULT 1,
      created_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_services_client ON services(client_id);

    CREATE TABLE IF NOT EXISTS appointments (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id        INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      lead_id          INTEGER REFERENCES leads(id) ON DELETE SET NULL,
      doctor_id        INTEGER REFERENCES doctors(id) ON DELETE SET NULL,
      patient_name     TEXT    NOT NULL DEFAULT '',
      patient_phone    TEXT    NOT NULL DEFAULT '',
      service          TEXT    NOT NULL DEFAULT '',
      notes            TEXT    NOT NULL DEFAULT '',
      appointment_date TEXT    NOT NULL,
      appointment_time TEXT    NOT NULL,
      duration_min     INTEGER NOT NULL DEFAULT 30,
      status           TEXT    NOT NULL DEFAULT 'scheduled',
      source           TEXT    NOT NULL DEFAULT 'admin',
      created_at       TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_appointments_client ON appointments(client_id, appointment_date);
    CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id, appointment_date);
  `)

  // Migrations — safe to run on every start
  try {
    db.exec(`ALTER TABLE clients ADD COLUMN context_url TEXT DEFAULT ''`)
  } catch {
    // Column already exists — ignore
  }
  try {
    db.exec(`ALTER TABLE clients ADD COLUMN quick_replies TEXT DEFAULT ''`)
  } catch {
    // Column already exists — ignore
  }
  try {
    db.exec(`ALTER TABLE leads ADD COLUMN status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new','working','closed'))`)
  } catch {
    // Column already exists — ignore
  }
  // Index on status — must be created after the status column migration above
  try {
    db.exec(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(client_id, status)`)
  } catch {
    // Index already exists — ignore
  }
  try {
    db.exec(`ALTER TABLE leads ADD COLUMN source TEXT NOT NULL DEFAULT 'chat'`)
  } catch {
    // Column already exists — ignore
  }
  try {
    db.exec(`ALTER TABLE clients ADD COLUMN greeting TEXT NOT NULL DEFAULT ''`)
  } catch {
    // Column already exists — ignore
  }
  // ── Booking layer migrations ───────────────────────────────────────────────
  try {
    db.exec(`ALTER TABLE appointments ADD COLUMN source TEXT NOT NULL DEFAULT 'admin'`)
  } catch {
    // Column already exists — ignore
  }
  try {
    db.exec(`ALTER TABLE doctors ADD COLUMN photo_url TEXT`)
  } catch {
    // Column already exists — ignore
  }
  try {
    db.exec(`ALTER TABLE doctors ADD COLUMN appointment_price TEXT`)
  } catch {
    // Column already exists — ignore
  }

  // ── Compliance layer migrations ─────────────────────────────────────────────
  // consent_required defaults to 0 for every existing client — the consent gate
  // stays OFF unless a client is explicitly opted in (see d:\projects\albamed\spec\bot-compliance.md).
  // Uses PRAGMA table_info instead of try/catch-ALTER so a missing column is
  // detected explicitly rather than inferred from a thrown error.
  const clientCols = (
    db.prepare("PRAGMA table_info(clients)").all() as { name: string }[]
  ).map((c) => c.name)
  if (!clientCols.includes("consent_required")) {
    db.exec(`ALTER TABLE clients ADD COLUMN consent_required INTEGER DEFAULT 0`)
  }
  if (!clientCols.includes("consent_text")) {
    db.exec(`ALTER TABLE clients ADD COLUMN consent_text TEXT DEFAULT ''`)
  }
  if (!clientCols.includes("policy_url")) {
    db.exec(`ALTER TABLE clients ADD COLUMN policy_url TEXT DEFAULT ''`)
  }

  // Факт согласия — фиксируется из widget.js (гейт перед чатом и/или чекбокс формы заявки)
  db.exec(`
    CREATE TABLE IF NOT EXISTS consents (
      id             INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
      session_id     TEXT NOT NULL,
      scope          TEXT NOT NULL,        -- 'chat_gate' | 'lead_form'
      policy_version TEXT NOT NULL DEFAULT '',
      ip_hash        TEXT DEFAULT '',      -- ХЕШ IP (sha256 + соль из env), не сырой
      created_at     TEXT DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_consents_client ON consents(client_id, session_id);
  `)

  // Журнал событий по заявкам (смена статуса и т.п.) — основа сервис-тайма
  db.exec(`
    CREATE TABLE IF NOT EXISTS lead_events (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      client_id   INTEGER NOT NULL,
      lead_id     INTEGER NOT NULL,
      type        TEXT    NOT NULL DEFAULT 'status_change',
      from_status TEXT,
      to_status   TEXT,
      actor       TEXT    DEFAULT '',
      created_at  TEXT    DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_lead_events_client ON lead_events(client_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_lead_events_lead   ON lead_events(lead_id);
  `)
}

const DEFAULT_SCHEDULE = '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":false,"sun":false}'

const ALBAMED_DOCTORS: Array<{ name: string; specialty: string; branch: number }> = [
  // Гинекология (branch=1)
  { name: "Мурадасилова Зийде Наримановна",    specialty: "Главврач, акушер-гинеколог",       branch: 1 },
  { name: "Румянцева Зоя Сергеевна",           specialty: "К.м.н., акушер-гинеколог",         branch: 1 },
  { name: "Мощенская Юлия Сергеевна",          specialty: "Акушер-гинеколог",                 branch: 1 },
  { name: "Баталова Динара Тахировна",          specialty: "Акушер-гинеколог, УЗД",            branch: 1 },
  { name: "Литвина Инна Дмитриевна",           specialty: "Гинеколог, акушер, УЗИ",           branch: 1 },
  { name: "Лубенникова Марианна Владимировна", specialty: "Гинеколог (бесплодие)",             branch: 1 },
  { name: "Муртазаева Наджие Юсуфовна",        specialty: "Акушер-гинеколог",                 branch: 1 },
  { name: "Сейдаметова Элина Эрнестовна",      specialty: "Гинеколог, акушер",                branch: 1 },
  // Урология/Андрология (branch=1)
  { name: "Халилов Ваид Садыкович",            specialty: "Уролог, андролог, УЗИ",            branch: 1 },
  { name: "Шведун Александр Александрович",    specialty: "Уролог, андролог",                 branch: 1 },
  // Хирургия (branch=1)
  { name: "Гудкова Мариэтта Андреевна",        specialty: "Хирург-онколог-колопроктолог",     branch: 1 },
  { name: "Турамуратова Мафтунабону Самадовна", specialty: "Детский хирург",                  branch: 1 },
  { name: "Абдулаева Эльвиза Айдеровна",       specialty: "Пластический хирург",              branch: 1 },
  { name: "Безруков Владимир Олегович",         specialty: "Маммолог, хирург, УЗД",            branch: 1 },
  // Гастроэнтерология (branch=1)
  { name: "Оголихина Ирина Сергеевна",         specialty: "Гастроэнтеролог, детский гастроэнтеролог", branch: 1 },
  { name: "Джерад Зиед",                       specialty: "Гастроэнтеролог",                  branch: 1 },
  { name: "Барбанова Айше Анваровна",          specialty: "Детский гастроэнтеролог, педиатр, УЗИ", branch: 1 },
  // Кардиология (branch=1)
  { name: "Джабер Зухаир Т.Х.",               specialty: "Кардиолог",                        branch: 1 },
  { name: "Чистякова Светлана Игоревна",       specialty: "Кардиолог, УЗД, к.м.н.",           branch: 1 },
  { name: "Кузьменко Татьяна Владимировна",    specialty: "Детский кардиолог",                branch: 1 },
  // Неврология (branch=1)
  { name: "Новинская Ольга Вячеславовна",      specialty: "Невролог",                         branch: 1 },
  { name: "Джеппарова Беянслы Гиреевна",       specialty: "Детский невролог",                 branch: 1 },
  // Педиатрия (branch=1)
  { name: "Османова Эльвина Фикретовна",       specialty: "Педиатр",                          branch: 1 },
  { name: "Шаллал Халаф Камел",               specialty: "Педиатр, пульмонолог",             branch: 1 },
  { name: "Решетова Севиль Серверовна",        specialty: "Педиатр, УЗИ",                     branch: 1 },
  // ЛОР (branch=2)
  { name: "Милоярова Эльвиза Курбановна",      specialty: "ЛОР",                              branch: 2 },
  { name: "Сапаева Сабина Равильевна",         specialty: "ЛОР",                              branch: 2 },
  { name: "Акимова Диляра Нуриевна",           specialty: "ЛОР",                              branch: 2 },
  // УЗИ (branch=1)
  { name: "Меликаева Екатерина Игоревна",      specialty: "Врач УЗИ",                         branch: 1 },
  { name: "Покидченко Елена Владимировна",     specialty: "Врач УЗИ",                         branch: 1 },
  { name: "Мамутова Эльвира Вильмуровна",      specialty: "Врач УЗИ",                         branch: 1 },
  // Другие специальности (branch=1)
  { name: "Цветков Владимир Александрович",    specialty: "Эндокринолог, терапевт",           branch: 1 },
  { name: "Мурадасилова Альмира Ахмедовна",    specialty: "Терапевт",                         branch: 1 },
  { name: "Ивашина Ольга Игоревна",            specialty: "Гематолог",                        branch: 1 },
  { name: "Шуваев Виктор Викторович",          specialty: "Ортопед-травматолог, Текар-терапия", branch: 1 },
  { name: "Сосновский Сергей Юрьевич",         specialty: "Ортопед-травматолог",              branch: 1 },
  { name: "Шаталов Тимур Олегович",            specialty: "Эндоскопист",                      branch: 1 },
  { name: "Степанов Владимир Владимирович",    specialty: "Рентгенография",                   branch: 1 },
  { name: "Седикова Наталья Ивановна",         specialty: "Дерматовенеролог",                 branch: 1 },
  { name: "Ощепков Эдуард Евгеньевич",         specialty: "Психиатр, нарколог",               branch: 1 },
  { name: "Королёва Елена Владимировна",       specialty: "Анестезиолог-реаниматолог",        branch: 1 },
]

function seedDoctors(db: Database.Database) {
  const count = (db.prepare("SELECT COUNT(*) as n FROM doctors WHERE client_id = 1").get() as { n: number }).n
  if (count > 0) return

  const insert = db.prepare(`
    INSERT INTO doctors (client_id, name, specialty, branch, schedule, active)
    VALUES (1, @name, @specialty, @branch, @schedule, 1)
  `)
  const insertMany = db.transaction((rows: typeof ALBAMED_DOCTORS) => {
    for (const row of rows) {
      insert.run({ name: row.name, specialty: row.specialty, branch: row.branch, schedule: DEFAULT_SCHEDULE })
    }
  })
  insertMany(ALBAMED_DOCTORS)
}

function seedBots(db: Database.Database) {
  if (!fs.existsSync(SEED_PATH)) return
  let seeds: Partial<Client>[]
  try {
    const raw = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"))
    if (!Array.isArray(raw)) {
      console.error("[db] bots-seed.json is not an array, skip seedBots")
      return
    }
    seeds = raw
  } catch {
    console.error("[db] Failed to parse bots-seed.json")
    return
  }
  for (const seed of seeds) {
    if (!seed.slug) continue
    const existing = db.prepare("SELECT id FROM clients WHERE slug = ?").get(seed.slug) as { id: number } | undefined
    if (existing) {
      const safeFields = ["name","widget_title","widget_color","widget_placeholder","context_url","quick_replies","system_prompt","model","rate_limit","active","greeting","consent_required","consent_text","policy_url"] as const
      const updates: Partial<Client> = {}
      for (const f of safeFields) {
        if (seed[f] !== undefined) (updates as Record<string, unknown>)[f] = seed[f]
      }
      // Restore tg credentials from seed only when seed has non-empty values
      if (seed.tg_token) (updates as Record<string, unknown>).tg_token = seed.tg_token
      if (seed.tg_chat_id) (updates as Record<string, unknown>).tg_chat_id = seed.tg_chat_id
      if (Object.keys(updates).length) {
        const fields = Object.keys(updates).map((k) => `${k} = @${k}`).join(", ")
        db.prepare(`UPDATE clients SET ${fields} WHERE slug = @slug`).run({ ...updates, slug: seed.slug })
      }
    } else {
      // Insert full record from seed — this is the actual "DB recreated from scratch"
      // path (client row doesn't exist yet at all), so consent fields must be seeded
      // here too, not just in the UPDATE-existing branch above.
      db.prepare(`
        INSERT OR IGNORE INTO clients
          (slug,name,description,system_prompt,api_key,base_url,model,tg_token,tg_chat_id,
           widget_color,widget_title,widget_placeholder,rate_limit,active,context_url,quick_replies,greeting,
           consent_required,consent_text,policy_url)
        VALUES
          (@slug,@name,@description,@system_prompt,@api_key,@base_url,@model,@tg_token,@tg_chat_id,
           @widget_color,@widget_title,@widget_placeholder,@rate_limit,@active,@context_url,@quick_replies,@greeting,
           @consent_required,@consent_text,@policy_url)
      `).run({
        slug: seed.slug, name: seed.name ?? seed.slug, description: seed.description ?? "",
        system_prompt: seed.system_prompt ?? "", api_key: seed.api_key ?? "",
        base_url: seed.base_url ?? WORKING_PROXY, model: seed.model ?? "claude-haiku-4-5-20251001",
        tg_token: seed.tg_token ?? "", tg_chat_id: seed.tg_chat_id ?? "",
        widget_color: seed.widget_color ?? "#2563eb", widget_title: seed.widget_title ?? "Ассистент",
        widget_placeholder: seed.widget_placeholder ?? "Напишите вопрос…",
        rate_limit: seed.rate_limit ?? 30, active: seed.active ?? 1,
        context_url: seed.context_url ?? "", quick_replies: seed.quick_replies ?? "",
        greeting: seed.greeting ?? "",
        consent_required: seed.consent_required ?? 0, consent_text: seed.consent_text ?? "",
        policy_url: seed.policy_url ?? "",
      })
    }
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export type Client = {
  id: number
  slug: string
  name: string
  description: string
  system_prompt: string
  api_key: string
  base_url: string
  model: string
  tg_token: string
  tg_chat_id: string
  widget_color: string
  widget_title: string
  widget_placeholder: string
  rate_limit: number
  active: number
  context_url: string
  quick_replies: string
  greeting: string
  consent_required: number
  consent_text: string
  policy_url: string
  created_at: string
}

export type Lead = {
  id: number
  client_id: number
  session_id: string
  name: string
  phone: string
  email: string
  message: string
  status: "new" | "working" | "closed"
  source: string
  created_at: string
}

// Omit status from insert — DB sets DEFAULT 'new'. source optional — DB defaults to 'chat'
export type LeadInsert = Omit<Lead, "id" | "created_at" | "status" | "source"> & { source?: string }

export type Doctor = {
  id: number
  client_id: number
  name: string
  specialty: string
  branch: number
  schedule: string
  active: number
  photo_url: string | null
  appointment_price: string | null
  created_at: string
}

export type Message = {
  id: number
  client_id: number
  session_id: string
  role: "user" | "assistant"
  content: string
  created_at: string
}

// ── Queries ────────────────────────────────────────────────────────────────────

export function getClientBySlug(slug: string): Client | undefined {
  return getDb().prepare("SELECT * FROM clients WHERE slug = ?").get(slug) as
    | Client
    | undefined
}

export function getAllClients(): Client[] {
  return getDb()
    .prepare("SELECT * FROM clients ORDER BY created_at DESC")
    .all() as Client[]
}

export function createClient(
  data: Omit<Client, "id" | "created_at" | "consent_required" | "consent_text" | "policy_url"> &
    Partial<Pick<Client, "consent_required" | "consent_text" | "policy_url">>
): Client {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO clients
      (slug, name, description, system_prompt, api_key, base_url, model,
       tg_token, tg_chat_id, widget_color, widget_title, widget_placeholder,
       rate_limit, active, quick_replies, greeting)
    VALUES
      (@slug, @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_title, @widget_placeholder,
       @rate_limit, @active, @quick_replies, @greeting)
  `)
  const result = stmt.run(data)
  return getDb()
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(result.lastInsertRowid) as Client
}

// Whitelist of updatable columns — prevents SQL injection via attacker-controlled
// object keys being interpolated into the SET clause.
const UPDATABLE_CLIENT_FIELDS = new Set([
  "name", "description", "system_prompt", "api_key", "base_url", "model",
  "tg_token", "tg_chat_id", "widget_color", "widget_title", "widget_placeholder",
  "rate_limit", "active", "context_url", "quick_replies", "greeting",
  "consent_required", "consent_text", "policy_url",
])

export function updateClient(
  slug: string,
  data: Partial<Omit<Client, "id" | "slug" | "created_at">>
): void {
  const keys = Object.keys(data).filter((k) => UPDATABLE_CLIENT_FIELDS.has(k))
  const fields = keys.map((k) => `${k} = @${k}`).join(", ")
  if (!fields) return
  const safeData = Object.fromEntries(keys.map((k) => [k, (data as Record<string, unknown>)[k]]))
  getDb()
    .prepare(`UPDATE clients SET ${fields} WHERE slug = @slug`)
    .run({ ...safeData, slug })
  // Keep seed file in sync — all config changes must survive DB wipe
  syncClientToSeed(slug)
}

function syncClientToSeed(slug: string): void {
  try {
    if (!fs.existsSync(SEED_PATH)) return
    const raw = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"))
    if (!Array.isArray(raw)) {
      console.error("[db] bots-seed.json is not an array, skip syncClientToSeed")
      return
    }
    const seeds: Partial<Client>[] = raw
    const client = getDb().prepare("SELECT * FROM clients WHERE slug = ?").get(slug) as Client | undefined
    if (!client) return
    const idx = seeds.findIndex((s) => s.slug === slug)
    const entry: Partial<Client> = idx >= 0 ? seeds[idx] : { slug }
    // Sync all config fields (no secrets: api_key, base_url excluded)
    // null-coalescing ensures no undefined/null leaks into JSON
    entry.name               = client.name               ?? ""
    entry.widget_title       = client.widget_title       ?? "Ассистент"
    entry.widget_color       = client.widget_color       ?? "#2563eb"
    entry.widget_placeholder = client.widget_placeholder ?? "Напишите вопрос…"
    entry.context_url        = client.context_url        ?? ""
    entry.quick_replies      = client.quick_replies      ?? ""
    entry.system_prompt      = client.system_prompt      ?? ""
    entry.model              = client.model              ?? "claude-haiku-4-5-20251001"
    entry.rate_limit         = client.rate_limit         ?? 30
    entry.active             = client.active             ?? 1
    entry.greeting           = client.greeting           ?? ""
    entry.tg_token           = client.tg_token           ?? ""
    entry.tg_chat_id         = client.tg_chat_id         ?? ""
    entry.consent_required   = client.consent_required   ?? 0
    entry.consent_text       = client.consent_text       ?? ""
    entry.policy_url         = client.policy_url         ?? ""
    if (idx < 0) seeds.push(entry)
    // Атомарная запись: пишем во временный файл, затем переименовываем.
    // Это защищает от обрезанного JSON при краше/PM2 reload в момент записи.
    const tmp = SEED_PATH + ".tmp"
    fs.writeFileSync(tmp, JSON.stringify(seeds, null, 2), "utf-8")
    fs.renameSync(tmp, SEED_PATH)
  } catch (e) {
    console.error("[db] syncClientToSeed failed", e)
  }
}

export function deleteClient(slug: string): void {
  getDb().prepare("DELETE FROM clients WHERE slug = ?").run(slug)
}

export function saveMessage(
  clientId: number,
  sessionId: string,
  role: "user" | "assistant",
  content: string
): void {
  getDb()
    .prepare(
      "INSERT INTO messages (client_id, session_id, role, content) VALUES (?, ?, ?, ?)"
    )
    .run(clientId, sessionId, role, content)
}

export function saveLead(lead: LeadInsert): void {
  getDb()
    .prepare(
      `INSERT INTO leads (client_id, session_id, name, phone, email, message, source)
       VALUES (@client_id, @session_id, @name, @phone, @email, @message, @source)`
    )
    .run({ ...lead, source: lead.source ?? "chat" })
}


export type ConsentInsert = {
  client_id: number
  session_id: string
  scope: "chat_gate" | "lead_form"
  policy_version?: string
  ip_hash?: string
}

export function saveConsent(consent: ConsentInsert): void {
  getDb()
    .prepare(
      `INSERT INTO consents (client_id, session_id, scope, policy_version, ip_hash)
       VALUES (@client_id, @session_id, @scope, @policy_version, @ip_hash)`
    )
    .run({
      client_id: consent.client_id,
      session_id: consent.session_id,
      scope: consent.scope,
      policy_version: consent.policy_version ?? "",
      ip_hash: consent.ip_hash ?? "",
    })
}

export function getClientStats(clientId: number): {
  messages: number
  leads: number
  sessions: number
} {
  const db = getDb()
  const messages = (
    db
      .prepare("SELECT COUNT(*) as n FROM messages WHERE client_id = ?")
      .get(clientId) as { n: number }
  ).n
  const leads = (
    db
      .prepare("SELECT COUNT(*) as n FROM leads WHERE client_id = ?")
      .get(clientId) as { n: number }
  ).n
  const sessions = (
    db
      .prepare(
        "SELECT COUNT(DISTINCT session_id) as n FROM messages WHERE client_id = ?"
      )
      .get(clientId) as { n: number }
  ).n
  return { messages, leads, sessions }
}

export function getLeads(clientId: number): Lead[] {
  return getDb()
    .prepare(
      "SELECT * FROM leads WHERE client_id = ? ORDER BY created_at DESC LIMIT 100"
    )
    .all(clientId) as Lead[]
}

export function getMessagesBySession(clientId: number, sessionId: string, limit = 20): Message[] {
  return getDb()
    .prepare(
      "SELECT * FROM messages WHERE client_id = ? AND session_id = ? ORDER BY created_at DESC LIMIT ?"
    )
    .all(clientId, sessionId, limit) as Message[]
}

export type SessionSummary = {
  session_id: string
  message_count: number
  last_message_at: string
  has_lead: number
}

export function getSessions(clientId: number, limit = 100): SessionSummary[] {
  return getDb()
    .prepare(
      `SELECT
         m.session_id,
         COUNT(m.id)      AS message_count,
         MAX(m.created_at) AS last_message_at,
         CASE WHEN l.session_id IS NOT NULL THEN 1 ELSE 0 END AS has_lead
       FROM messages m
       LEFT JOIN leads l ON l.client_id = m.client_id AND l.session_id = m.session_id
       WHERE m.client_id = ?
       GROUP BY m.session_id
       ORDER BY last_message_at DESC
       LIMIT ?`
    )
    .all(clientId, limit) as SessionSummary[]
}

export function getSessionMessages(clientId: number, sessionId: string): Message[] {
  return getDb()
    .prepare(
      "SELECT * FROM messages WHERE client_id = ? AND session_id = ? ORDER BY created_at ASC"
    )
    .all(clientId, sessionId) as Message[]
}

export function getDoctors(clientId: number): Doctor[] {
  return getDb()
    .prepare(
      "SELECT * FROM doctors WHERE client_id = ? AND active = 1 ORDER BY id ASC"
    )
    .all(clientId) as Doctor[]
}

export function createDoctor(
  clientId: number,
  data: { name: string; specialty?: string; branch?: number; schedule?: string }
): Doctor {
  const result = getDb()
    .prepare(
      "INSERT INTO doctors (client_id, name, specialty, branch, schedule, active) VALUES (?, ?, ?, ?, ?, 1)"
    )
    .run(clientId, data.name, data.specialty ?? "", data.branch ?? 1, data.schedule ?? DEFAULT_SCHEDULE)
  return getDb().prepare("SELECT * FROM doctors WHERE id = ?").get(result.lastInsertRowid) as Doctor
}

export type Appointment = {
  id: number
  client_id: number
  lead_id: number | null
  doctor_id: number | null
  patient_name: string
  patient_phone: string
  service: string
  notes: string
  appointment_date: string
  appointment_time: string
  duration_min: number
  status: string
  source: string
  created_at: string
}

const UPDATABLE_DOCTOR_FIELDS = new Set(["name", "specialty", "branch", "schedule", "active", "photo_url", "appointment_price"])

export function updateDoctor(
  id: number,
  data: Partial<Pick<Doctor, "name" | "specialty" | "branch" | "schedule" | "active" | "photo_url" | "appointment_price">>
): void {
  const keys = Object.keys(data).filter((k) => UPDATABLE_DOCTOR_FIELDS.has(k))
  const fields = keys.map((k) => `${k} = @${k}`).join(", ")
  if (!fields) return
  const safeData = Object.fromEntries(keys.map((k) => [k, (data as Record<string, unknown>)[k]]))
  getDb()
    .prepare(`UPDATE doctors SET ${fields} WHERE id = @id`)
    .run({ ...safeData, id })
}

export function updateLeadStatus(
  id: number,
  status: "new" | "working" | "closed",
  actor = ""
): void {
  const db = getDb()
  const row = db
    .prepare("SELECT status, client_id FROM leads WHERE id = ?")
    .get(id) as { status: string; client_id: number } | undefined
  if (!row) return
  db.prepare("UPDATE leads SET status = ? WHERE id = ?").run(status, id)
  // Логируем только реальное изменение
  if (row.status !== status) {
    db.prepare(
      `INSERT INTO lead_events (client_id, lead_id, type, from_status, to_status, actor)
       VALUES (?, ?, 'status_change', ?, ?, ?)`
    ).run(row.client_id, id, row.status, status, actor)
  }
}

export type LeadEvent = {
  id: number
  lead_id: number
  from_status: string | null
  to_status: string | null
  actor: string
  created_at: string
  name: string
}

// Сервис-тайм: среднее время до первого ответа и до закрытия (минуты)
export function getServiceTimeStats(clientId: number): {
  avgResponseMin: number | null
  avgResolutionMin: number | null
  handledToday: number
  closedToday: number
} {
  const db = getDb()
  const avg = (whereExtra: string): number | null => {
    const r = db
      .prepare(
        `SELECT AVG(m) AS a FROM (
           SELECT (julianday(MIN(e.created_at)) - julianday(l.created_at)) * 1440 AS m
           FROM lead_events e JOIN leads l ON l.id = e.lead_id
           WHERE e.client_id = ? AND e.type = 'status_change' ${whereExtra}
           GROUP BY e.lead_id
         )`
      )
      .get(clientId) as { a: number | null }
    return r.a != null ? Math.max(0, Math.round(r.a)) : null
  }
  const count = (sql: string): number =>
    (db.prepare(sql).get(clientId) as { n: number }).n

  return {
    avgResponseMin: avg("AND e.from_status = 'new'"),
    avgResolutionMin: avg("AND e.to_status = 'closed'"),
    handledToday: count("SELECT COUNT(*) AS n FROM lead_events WHERE client_id = ? AND date(created_at) = date('now')"),
    closedToday: count("SELECT COUNT(*) AS n FROM lead_events WHERE client_id = ? AND to_status = 'closed' AND date(created_at) = date('now')"),
  }
}

export function getRecentLeadEvents(clientId: number, limit = 8): LeadEvent[] {
  return getDb()
    .prepare(
      `SELECT e.id, e.lead_id, e.from_status, e.to_status, e.actor, e.created_at,
              COALESCE(NULLIF(l.name, ''), 'Без имени') AS name
       FROM lead_events e LEFT JOIN leads l ON l.id = e.lead_id
       WHERE e.client_id = ?
       ORDER BY e.created_at DESC
       LIMIT ?`
    )
    .all(clientId, limit) as LeadEvent[]
}

// ── Services (прайс клиники) ───────────────────────────────────────────────
export type Service = {
  id: number
  client_id: number
  name: string
  category: string
  price: string
  sort_order: number
  active: number
  created_at: string
}

export function getServices(clientId: number, search = ""): Service[] {
  const s = search.trim()
  if (s) {
    return getDb()
      .prepare(
        `SELECT * FROM services WHERE client_id = ? AND (name LIKE @q OR category LIKE @q)
         ORDER BY category, sort_order, name`
      )
      .all(clientId, { q: `%${s}%` } as never) as Service[]
  }
  return getDb()
    .prepare("SELECT * FROM services WHERE client_id = ? ORDER BY category, sort_order, name")
    .all(clientId) as Service[]
}

export function createService(
  clientId: number,
  data: { name: string; category?: string; price?: string }
): Service {
  const result = getDb()
    .prepare("INSERT INTO services (client_id, name, category, price, active) VALUES (?, ?, ?, ?, 1)")
    .run(clientId, data.name, data.category ?? "", data.price ?? "")
  return getDb().prepare("SELECT * FROM services WHERE id = ?").get(result.lastInsertRowid) as Service
}

const UPDATABLE_SERVICE_FIELDS = new Set(["name", "category", "price", "active", "sort_order"])

export function updateService(
  id: number,
  data: Partial<Pick<Service, "name" | "category" | "price" | "active" | "sort_order">>
): void {
  const keys = Object.keys(data).filter((k) => UPDATABLE_SERVICE_FIELDS.has(k))
  const fields = keys.map((k) => `${k} = @${k}`).join(", ")
  if (!fields) return
  const safeData = Object.fromEntries(keys.map((k) => [k, (data as Record<string, unknown>)[k]]))
  getDb().prepare(`UPDATE services SET ${fields} WHERE id = @id`).run({ ...safeData, id })
}

export function deleteService(id: number, clientId: number): void {
  getDb().prepare("DELETE FROM services WHERE id = ? AND client_id = ?").run(id, clientId)
}
