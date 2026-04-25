#!/usr/bin/env node
/**
 * Weekly SEO report: Google Search Console → Telegram
 * Cron: every Monday at 09:00
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// Load .env.local from project root
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

// ── Config ────────────────────────────────────────────────────────────────────
const GSC_SITE        = 'sc-domain:optisphere.tech';
const CLIENT_ID       = process.env.GSC_CLIENT_ID;
const CLIENT_SECRET   = process.env.GSC_CLIENT_SECRET;
const REFRESH_TOKEN   = process.env.GSC_REFRESH_TOKEN;
const TG_BOT_TOKEN    = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID      = process.env.TG_CHAT_ID;
const TG_API_BASE     = 'tg-proxy.radinuko.workers.dev';

// ── HTTP helpers ──────────────────────────────────────────────────────────────
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

// ── Auth ──────────────────────────────────────────────────────────────────────
async function getAccessToken() {
  const body = new URLSearchParams({
    client_id:     CLIENT_ID,
    client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type:    'refresh_token',
  }).toString();

  const res = await request({
    hostname: 'oauth2.googleapis.com',
    path:     '/token',
    method:   'POST',
    headers: {
      'Content-Type':   'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);

  if (!res.access_token) throw new Error('Token error: ' + JSON.stringify(res));
  return res.access_token;
}

// ── GSC ───────────────────────────────────────────────────────────────────────
function dateRange(daysAgo, span) {
  const end = new Date();
  end.setDate(end.getDate() - daysAgo);
  const start = new Date(end);
  start.setDate(start.getDate() - span + 1);
  return {
    startDate: start.toISOString().slice(0, 10),
    endDate:   end.toISOString().slice(0, 10),
  };
}

async function queryGSC(token, dateRange, dimensions = ['query'], rowLimit = 20) {
  const body = JSON.stringify({
    ...dateRange,
    dimensions,
    rowLimit,
    dataState: 'final',
  });

  const siteEncoded = encodeURIComponent(GSC_SITE);
  return request({
    hostname: 'www.googleapis.com',
    path:     `/webmasters/v3/sites/${siteEncoded}/searchAnalytics/query`,
    method:   'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(text) {
  const body = JSON.stringify({
    chat_id:    TG_CHAT_ID,
    text,
    parse_mode: 'HTML',
  });

  return request({
    hostname: TG_API_BASE,
    path:     `/bot${TG_BOT_TOKEN}/sendMessage`,
    method:   'POST',
    headers: {
      'Content-Type':   'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);
}

// ── Format ────────────────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  return Number(n).toLocaleString('ru-RU', { maximumFractionDigits: dec });
}

function delta(curr, prev) {
  if (!prev) return '';
  const d = curr - prev;
  const pct = Math.round((d / prev) * 100);
  return d >= 0 ? ` <i>(+${pct}%)</i>` : ` <i>(${pct}%)</i>`;
}

function buildReport(curr, prev, currRows, lowCtr) {
  const cCtr  = curr.ctr  * 100;
  const pCtr  = prev.ctr  * 100;

  const lines = [
    `📊 <b>SEO-отчёт Optisphere</b>`,
    `📅 ${curr.startDate} — ${curr.endDate}`,
    ``,
    `🖱 Клики: <b>${fmt(curr.clicks)}</b>${delta(curr.clicks, prev.clicks)}`,
    `👁 Показы: <b>${fmt(curr.impressions)}</b>${delta(curr.impressions, prev.impressions)}`,
    `📈 CTR: <b>${cCtr.toFixed(1)}%</b>${delta(cCtr, pCtr)}`,
    `📍 Позиция: <b>${curr.position.toFixed(1)}</b>`,
    ``,
    `🔥 <b>Топ-10 запросов:</b>`,
    ...currRows.slice(0, 10).map((r, i) =>
      `${i + 1}. ${r.keys[0]} — ${fmt(r.clicks)} кл, поз. ${r.position.toFixed(1)}`
    ),
  ];

  if (lowCtr.length > 0) {
    lines.push(``, `⚠️ <b>Низкий CTR (&gt;300 показов, &lt;2%):</b>`);
    lowCtr.slice(0, 5).forEach(r => {
      lines.push(`• ${r.keys[0]} — ${fmt(r.impressions)} показов, ${(r.ctr * 100).toFixed(1)}% CTR`);
    });
    lines.push(``, `💡 Возможно стоит улучшить title/description для этих страниц.`);
  }

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Получаю access token...');
  const token = await getAccessToken();

  const currRange = dateRange(1, 7);   // последние 7 дней
  const prevRange = dateRange(8, 7);   // предыдущие 7 дней

  console.log(`Запрашиваю GSC: ${currRange.startDate} — ${currRange.endDate}`);

  const [currTotal, prevTotal, currQueries, pageData] = await Promise.all([
    queryGSC(token, currRange, []),
    queryGSC(token, prevRange, []),
    queryGSC(token, currRange, ['query'], 20),
    queryGSC(token, currRange, ['page'], 50),
  ]);

  const curr = currTotal.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  const prev = prevTotal.rows?.[0] || { clicks: 0, impressions: 0, ctr: 0, position: 0 };
  curr.startDate = currRange.startDate;
  curr.endDate   = currRange.endDate;

  const lowCtr = (pageData.rows || [])
    .filter(r => r.impressions > 300 && r.ctr < 0.02)
    .sort((a, b) => b.impressions - a.impressions);

  const message = buildReport(curr, prev, currQueries.rows || [], lowCtr);

  console.log('Отправляю в Telegram...');
  const tgRes = await sendTelegram(message);

  if (tgRes.ok) {
    console.log('✅ Отчёт отправлен');
  } else {
    console.error('❌ Ошибка Telegram:', JSON.stringify(tgRes));
    process.exit(1);
  }
}

main().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
