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
    CREATE INDEX IF NOT EXISTS idx_leads_status   ON leads(client_id, status);

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
  try {
    db.exec(`ALTER TABLE leads ADD COLUMN source TEXT NOT NULL DEFAULT 'chat'`)
  } catch {
    // Column already exists — ignore
  }
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
    seeds = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"))
  } catch {
    console.error("[db] Failed to parse bots-seed.json")
    return
  }
  for (const seed of seeds) {
    if (!seed.slug) continue
    const existing = db.prepare("SELECT id FROM clients WHERE slug = ?").get(seed.slug) as { id: number } | undefined
    if (existing) {
      const safeFields = ["name","widget_title","widget_color","widget_placeholder","context_url","quick_replies","system_prompt","model","rate_limit","active"] as const
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
      // Insert full record from seed
      db.prepare(`
        INSERT OR IGNORE INTO clients
          (slug,name,description,system_prompt,api_key,base_url,model,tg_token,tg_chat_id,
           widget_color,widget_title,widget_placeholder,rate_limit,active,context_url,quick_replies)
        VALUES
          (@slug,@name,@description,@system_prompt,@api_key,@base_url,@model,@tg_token,@tg_chat_id,
           @widget_color,@widget_title,@widget_placeholder,@rate_limit,@active,@context_url,@quick_replies)
      `).run({
        slug: seed.slug, name: seed.name ?? seed.slug, description: seed.description ?? "",
        system_prompt: seed.system_prompt ?? "", api_key: seed.api_key ?? "",
        base_url: seed.base_url ?? WORKING_PROXY, model: seed.model ?? "claude-haiku-4-5-20251001",
        tg_token: seed.tg_token ?? "", tg_chat_id: seed.tg_chat_id ?? "",
        widget_color: seed.widget_color ?? "#2563eb", widget_title: seed.widget_title ?? "Ассистент",
        widget_placeholder: seed.widget_placeholder ?? "Напишите вопрос…",
        rate_limit: seed.rate_limit ?? 30, active: seed.active ?? 1,
        context_url: seed.context_url ?? "", quick_replies: seed.quick_replies ?? "",
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
  data: Omit<Client, "id" | "created_at">
): Client {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO clients
      (slug, name, description, system_prompt, api_key, base_url, model,
       tg_token, tg_chat_id, widget_color, widget_title, widget_placeholder,
       rate_limit, active, quick_replies)
    VALUES
      (@slug, @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_title, @widget_placeholder,
       @rate_limit, @active, @quick_replies)
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
  "rate_limit", "active", "context_url", "quick_replies",
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
  // Keep seed file in sync so credentials survive DB wipe
  if (data.tg_token !== undefined || data.tg_chat_id !== undefined) {
    syncClientToSeed(slug)
  }
}

function syncClientToSeed(slug: string): void {
  try {
    if (!fs.existsSync(SEED_PATH)) return
    const seeds: Partial<Client>[] = JSON.parse(fs.readFileSync(SEED_PATH, "utf-8"))
    const client = getDb().prepare("SELECT * FROM clients WHERE slug = ?").get(slug) as Client | undefined
    if (!client) return
    const idx = seeds.findIndex((s) => s.slug === slug)
    const entry = idx >= 0 ? seeds[idx] : { slug }
    entry.tg_token = client.tg_token
    entry.tg_chat_id = client.tg_chat_id
    if (idx < 0) seeds.push(entry)
    fs.writeFileSync(SEED_PATH, JSON.stringify(seeds, null, 2), "utf-8")
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

const UPDATABLE_DOCTOR_FIELDS = new Set(["name", "specialty", "branch", "schedule", "active"])

export function updateDoctor(
  id: number,
  data: Partial<Pick<Doctor, "name" | "specialty" | "branch" | "schedule" | "active">>
): void {
  const keys = Object.keys(data).filter((k) => UPDATABLE_DOCTOR_FIELDS.has(k))
  const fields = keys.map((k) => `${k} = @${k}`).join(", ")
  if (!fields) return
  const safeData = Object.fromEntries(keys.map((k) => [k, (data as Record<string, unknown>)[k]]))
  getDb()
    .prepare(`UPDATE doctors SET ${fields} WHERE id = @id`)
    .run({ ...safeData, id })
}

export function updateLeadStatus(id: number, status: "new" | "working" | "closed"): void {
  getDb()
    .prepare("UPDATE leads SET status = ? WHERE id = ?")
    .run(status, id)
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
