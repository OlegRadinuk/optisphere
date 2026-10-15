#!/usr/bin/env node
// Wrapper: loads .env.local and runs seed-vrach-u-doma.js
// Usage: node scripts/run-seed-vud.js
// For production: DB_PATH=/var/www/optisphere/data/bots.db node scripts/run-seed-vud.js

const fs = require("fs");
const path = require("path");

// Load .env.local if exists
const envFile = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envFile)) {
  const lines = fs.readFileSync(envFile, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!process.env[key]) process.env[key] = val;
  }
}

require("./seed-vrach-u-doma.js");
