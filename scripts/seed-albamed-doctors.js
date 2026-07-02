/**
 * One-time seed script: insert 39 Albamed doctors from c:\tmp\alba\doctors.json
 * into the local SQLite database (data/bots.db).
 *
 * Idempotent: clears previous albamed doctors (client_id=1) before inserting.
 * Ensures client albamed (client_id=1) exists.
 *
 * Run: node scripts/seed-albamed-doctors.js
 */
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "..", "data", "bots.db");
const DOCTORS_JSON = path.join("C:", "tmp", "alba", "doctors.json");

const DEFAULT_SCHEDULE = JSON.stringify({
  mon: true,
  tue: true,
  wed: true,
  thu: true,
  fri: true,
  sat: false,
  sun: false,
});

console.log("Opening DB:", DB_PATH);
const db = new Database(DB_PATH);

// Ensure schema exists (mirrors initSchema in src/lib/db.ts)
db.exec(`
  CREATE TABLE IF NOT EXISTS clients (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    slug        TEXT    UNIQUE NOT NULL,
    name        TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    system_prompt TEXT  NOT NULL DEFAULT '',
    api_key     TEXT    NOT NULL DEFAULT '',
    base_url    TEXT    NOT NULL DEFAULT '',
    model       TEXT    NOT NULL DEFAULT '',
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

  CREATE TABLE IF NOT EXISTS doctors (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    client_id   INTEGER NOT NULL,
    name        TEXT    NOT NULL,
    specialty   TEXT    NOT NULL DEFAULT '',
    branch      INTEGER NOT NULL DEFAULT 1,
    schedule    TEXT    NOT NULL DEFAULT '{}',
    active      INTEGER NOT NULL DEFAULT 1,
    created_at  TEXT    DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_doctors_client ON doctors(client_id);
`);

// Migrations to add photo_url / appointment_price columns if not present
try { db.exec("ALTER TABLE doctors ADD COLUMN photo_url TEXT"); } catch {}
try { db.exec("ALTER TABLE doctors ADD COLUMN appointment_price TEXT"); } catch {}
try { db.exec("ALTER TABLE clients ADD COLUMN greeting TEXT NOT NULL DEFAULT ''"); } catch {}

// Ensure albamed client exists (client_id = 1)
const existing = db
  .prepare("SELECT id FROM clients WHERE id = 1")
  .get();

if (!existing) {
  console.log("Client albamed not found — creating...");
  db.prepare(`
    INSERT INTO clients (id, slug, name, active)
    VALUES (1, 'albamed', 'Альба Мед', 1)
  `).run();
  console.log("Created client albamed (id=1)");
} else {
  console.log("Client albamed (id=1) already exists — OK");
}

// Load doctors from JSON
const doctors = JSON.parse(fs.readFileSync(DOCTORS_JSON, "utf-8"));
console.log(`Loaded ${doctors.length} doctors from JSON`);

// Remove previous albamed doctors to avoid duplicates
const deleted = db.prepare("DELETE FROM doctors WHERE client_id = 1").run();
console.log(`Deleted ${deleted.changes} previous albamed doctors`);

// Insert all 39 doctors
const insert = db.prepare(`
  INSERT INTO doctors (client_id, name, specialty, branch, schedule, active, photo_url, appointment_price)
  VALUES (1, @name, @specialty, 1, @schedule, 1, @photo_url, NULL)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) {
    const fullName = [row.surname, row.name, row.lastname]
      .filter(Boolean)
      .join(" ");
    insert.run({
      name: fullName,
      specialty: row.specialization || "",
      schedule: DEFAULT_SCHEDULE,
      photo_url: row.photo_url || null,
    });
  }
});

insertMany(doctors);

// Verify
const count = db
  .prepare("SELECT COUNT(*) as n FROM doctors WHERE client_id = 1")
  .get();
console.log(`Inserted ${count.n} doctors for client_id=1`);

// Show first 5 as sanity check
const sample = db
  .prepare("SELECT id, name, specialty FROM doctors WHERE client_id = 1 LIMIT 5")
  .all();
console.log("Sample doctors:");
sample.forEach((d) => console.log(`  [${d.id}] ${d.name} — ${d.specialty}`));

db.close();
console.log("Done.");
