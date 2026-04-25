import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

const DB_PATH =
  process.env.DB_PATH ?? path.join(process.cwd(), "data", "bots.db")

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })

let _db: Database.Database | null = null

export function getDb(): Database.Database {
  if (_db) return _db
  _db = new Database(DB_PATH)
  _db.pragma("journal_mode = WAL")
  _db.pragma("foreign_keys = ON")
  initSchema(_db)
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
      base_url    TEXT    NOT NULL DEFAULT 'https://api.anthropic.com',
      model       TEXT    NOT NULL DEFAULT 'claude-haiku-4-5-20251001',
      tg_token    TEXT    DEFAULT '',
      tg_chat_id  TEXT    DEFAULT '',
      widget_color   TEXT DEFAULT '#2563eb',
      widget_title   TEXT DEFAULT 'Ассистент',
      widget_placeholder TEXT DEFAULT 'Напишите вопрос…',
      rate_limit  INTEGER DEFAULT 30,
      active      INTEGER DEFAULT 1,
      context_url TEXT    DEFAULT '',
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
  `)

  // Migrations — safe to run on every start
  try {
    db.exec(`ALTER TABLE clients ADD COLUMN context_url TEXT DEFAULT ''`)
  } catch {
    // Column already exists — ignore
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
       rate_limit, active)
    VALUES
      (@slug, @name, @description, @system_prompt, @api_key, @base_url, @model,
       @tg_token, @tg_chat_id, @widget_color, @widget_title, @widget_placeholder,
       @rate_limit, @active)
  `)
  const result = stmt.run(data)
  return getDb()
    .prepare("SELECT * FROM clients WHERE id = ?")
    .get(result.lastInsertRowid) as Client
}

export function updateClient(
  slug: string,
  data: Partial<Omit<Client, "id" | "slug" | "created_at">>
): void {
  const fields = Object.keys(data)
    .map((k) => `${k} = @${k}`)
    .join(", ")
  if (!fields) return
  getDb()
    .prepare(`UPDATE clients SET ${fields} WHERE slug = @slug`)
    .run({ ...data, slug })
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

export function saveLead(lead: Omit<Lead, "id" | "created_at">): void {
  getDb()
    .prepare(
      `INSERT INTO leads (client_id, session_id, name, phone, email, message)
       VALUES (@client_id, @session_id, @name, @phone, @email, @message)`
    )
    .run(lead)
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
