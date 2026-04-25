#!/usr/bin/env node
/**
 * SEO meta-tag suggestions: finds low-CTR pages → Claude suggests improvements → Telegram
 * Run manually or add to cron after seo-report.js
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// Load .env.local
const envFile = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m && !process.env[m[1].trim()]) {
      process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
    }
  });
}

const GSC_SITE      = 'sc-domain:optisphere.tech';
const SITE_URL      = 'https://optisphere.tech';
const CLIENT_ID     = process.env.GSC_CLIENT_ID;
const CLIENT_SECRET = process.env.GSC_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GSC_REFRESH_TOKEN;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;
const TG_BOT_TOKEN  = process.env.TG_BOT_TOKEN;
const TG_CHAT_ID    = process.env.TG_CHAT_ID;
const TG_API_BASE   = 'tg-proxy.radinuko.workers.dev';

// ── HTTP ──────────────────────────────────────────────────────────────────────
function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); } catch { resolve(data); }
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
    client_id: CLIENT_ID, client_secret: CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN, grant_type: 'refresh_token',
  }).toString();

  const res = await request({
    hostname: 'oauth2.googleapis.com', path: '/token', method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'Content-Length': Buffer.byteLength(body) },
  }, body);

  if (!res.access_token) throw new Error('Token error: ' + JSON.stringify(res));
  return res.access_token;
}

// ── GSC ───────────────────────────────────────────────────────────────────────
async function getLowCtrPages(token) {
  const end = new Date(); end.setDate(end.getDate() - 1);
  const start = new Date(end); start.setDate(start.getDate() - 27); // 28 дней

  const body = JSON.stringify({
    startDate:  start.toISOString().slice(0, 10),
    endDate:    end.toISOString().slice(0, 10),
    dimensions: ['page'],
    rowLimit:   100,
    dataState:  'final',
  });

  const siteEncoded = encodeURIComponent(GSC_SITE);
  const res = await request({
    hostname: 'www.googleapis.com',
    path: `/webmasters/v3/sites/${siteEncoded}/searchAnalytics/query`,
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);

  return (res.rows || [])
    .filter(r => r.impressions >= 200 && r.ctr < 0.03)
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, 5);
}

// ── Fetch page title/description ──────────────────────────────────────────────
async function fetchPageMeta(url) {
  return new Promise(resolve => {
    const parsed = new URL(url);
    https.get({ hostname: parsed.hostname, path: parsed.pathname || '/', headers: { 'User-Agent': 'SEO-Bot/1.0' } }, res => {
      let html = '';
      res.on('data', chunk => { html += chunk; if (html.length > 8000) res.destroy(); });
      res.on('close', () => {
        const title = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || '';
        const desc  = html.match(/name=["']description["'][^>]*content=["']([^"']+)/i)?.[1]?.trim()
                   || html.match(/content=["']([^"']+)["'][^>]*name=["']description["']/i)?.[1]?.trim()
                   || '';
        resolve({ title, description: desc });
      });
      res.on('error', () => resolve({ title: '', description: '' }));
    }).on('error', () => resolve({ title: '', description: '' }));
  });
}

// ── Claude ────────────────────────────────────────────────────────────────────
async function getSuggestion(page, meta, stats) {
  const prompt = `Ты SEO-специалист. Проанализируй мета-теги страницы и предложи улучшение.

URL: ${page}
Текущий title: ${meta.title || '(не найден)'}
Текущий description: ${meta.description || '(не найден)'}

Статистика за 28 дней:
- Показов: ${stats.impressions}
- Кликов: ${stats.clicks}
- CTR: ${(stats.ctr * 100).toFixed(1)}%
- Позиция: ${stats.position.toFixed(1)}

Сайт: веб-студия Optisphere (Крым), делает сайты + AI-ассистентов для бизнеса.

Задача: CTR низкий — значит title или description не цепляют в поисковой выдаче.
Напиши:
1. Новый title (до 60 символов, с ключом и УТП)
2. Новый description (до 155 символов, с выгодой и призывом)

Отвечай коротко, только title и description, без объяснений.`;

  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    messages: [{ role: 'user', content: prompt }],
  });

  const res = await request({
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    },
  }, body);

  return res.content?.[0]?.text || 'Не удалось получить подсказку';
}

// ── Telegram ──────────────────────────────────────────────────────────────────
async function sendTelegram(text) {
  const body = JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: 'HTML' });
  return request({
    hostname: TG_API_BASE,
    path: `/bot${TG_BOT_TOKEN}/sendMessage`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
  }, body);
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log('Получаю access token...');
  const token = await getAccessToken();

  console.log('Ищу страницы с низким CTR...');
  const pages = await getLowCtrPages(token);

  if (pages.length === 0) {
    console.log('Нет страниц с низким CTR — всё хорошо!');
    await sendTelegram('✅ <b>SEO-подсказки:</b> страниц с низким CTR не найдено. Всё в порядке.');
    return;
  }

  await sendTelegram(`🔍 <b>SEO-подсказки по мета-тегам</b>\nНайдено ${pages.length} страниц с низким CTR — анализирую...`);

  for (const page of pages) {
    const url  = page.keys[0];
    const slug = url.replace(SITE_URL, '') || '/';

    console.log(`Анализирую: ${slug}`);
    const meta = await fetchPageMeta(url);
    const suggestion = await getSuggestion(url, meta, page);

    const msg = [
      `📄 <b>${slug}</b>`,
      `👁 ${page.impressions} показов · 🖱 ${page.clicks} кликов · CTR ${(page.ctr * 100).toFixed(1)}%`,
      ``,
      `<b>Сейчас:</b>`,
      `Title: <i>${meta.title || '—'}</i>`,
      `Desc: <i>${meta.description || '—'}</i>`,
      ``,
      `<b>Предлагаю:</b>`,
      suggestion,
    ].join('\n');

    await sendTelegram(msg);
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('✅ Готово');
}

main().catch(e => { console.error('Fatal:', e.message); process.exit(1); });
