#!/usr/bin/env node
/**
 * Scrapes all service pages from alba-medcenter.ru and extracts prices.
 * Outputs a formatted price list for the system prompt.
 * Usage: node scripts/scrape-prices.js
 */

const SERVICE_URLS = [
  ['Анализы и диагностика',        'https://alba-medcenter.ru/service_direction/tests_and_diagnostics/'],
  ['Анестезиология',               'https://alba-medcenter.ru/service_direction/%d0%b0%d0%bd%d0%b5%d1%81%d1%82%d0%b5%d0%b7%d0%b8%d0%be%d0%bb%d0%be%d0%b3%d0%b8%d1%8f-%d1%80%d0%b5%d0%b0%d0%bd%d0%b8%d0%bc%d0%b0%d1%82%d0%be%d0%bb%d0%be%d0%b3%d0%b8%d1%8f/'],
  ['Гастроэнтерология',            'https://alba-medcenter.ru/service_direction/gastroenterology/'],
  ['Гематология',                  'https://alba-medcenter.ru/service_direction/gematologiya/'],
  ['Гинекология',                  'https://alba-medcenter.ru/service_direction/gynecology/'],
  ['Дерматология',                 'https://alba-medcenter.ru/service_direction/dermatology/'],
  ['Детское отделение',            'https://alba-medcenter.ru/service_direction/%d0%b4%d0%b5%d1%82%d1%81%d0%ba%d0%be%d0%b5-%d0%be%d1%82%d0%b4%d0%b5%d0%bb%d0%b5%d0%bd%d0%b8%d0%b5/'],
  ['Кардиология',                  'https://alba-medcenter.ru/service_direction/cardiology/'],
  ['Колопроктология',              'https://alba-medcenter.ru/service_direction/%d0%ba%d0%be%d0%bb%d0%be%d0%bf%d1%80%d0%be%d0%ba%d1%82%d0%be%d0%bb%d0%be%d0%b3%d0%b8%d1%8f/'],
  ['Маммология',                   'https://alba-medcenter.ru/service_direction/mammologiya/'],
  ['Наркология',                   'https://alba-medcenter.ru/service_direction/narkologiya/'],
  ['Неврология',                   'https://alba-medcenter.ru/service_direction/%d0%bd%d0%b5%d0%b2%d1%80%d0%be%d0%bb%d0%be%d0%b3%d0%b8%d1%8f/'],
  ['Нефрология',                   'https://alba-medcenter.ru/service_direction/nefrologiya/'],
  ['Онкология',                    'https://alba-medcenter.ru/service_direction/onkologiya/'],
  ['Ортопедия-Травматология',      'https://alba-medcenter.ru/service_direction/orto-travm/'],
  ['Отоларингология (ЛОР)',        'https://alba-medcenter.ru/service_direction/%d0%be%d1%82%d0%be%d0%bb%d0%b0%d1%80%d0%b8%d0%bd%d0%b3%d0%be%d0%bb%d0%be%d0%b3%d0%b8%d1%8f/'],
  ['Пластическая хирургия',        'https://alba-medcenter.ru/service_direction/plastik-hirurgiya/'],
  ['Психиатрия/Наркология',        'https://alba-medcenter.ru/service_direction/psiho/'],
  ['Пульмонология',                'https://alba-medcenter.ru/service_direction/%d0%bf%d1%83%d0%bb%d1%8c%d0%bc%d0%be%d0%bd%d0%be%d0%bb%d0%be%d0%b3%d0%b8%d1%8f/'],
  ['Ревматология',                 'https://alba-medcenter.ru/service_direction/revmatologiya/'],
  ['Рентгенография',               'https://alba-medcenter.ru/service_direction/rentgenografiya/'],
  ['Сердечно-сосудистая хирургия', 'https://alba-medcenter.ru/service_direction/serdecho-sosud/'],
  ['Стоматология',                 'https://alba-medcenter.ru/service_direction/dentistry/'],
  ['Текар-терапия',                'https://alba-medcenter.ru/service_direction/tekar/'],
  ['Терапия',                      'https://alba-medcenter.ru/service_direction/terapiya/'],
  ['УЗИ',                          'https://alba-medcenter.ru/service_direction/ultrasound_diagnostics/'],
  ['Урология',                     'https://alba-medcenter.ru/service_direction/urology/'],
  ['Процедурный кабинет',          'https://alba-medcenter.ru/service_direction/%d1%83%d1%81%d0%bb%d1%83%d0%b3%d0%b8-%d0%bf%d1%80%d0%be%d1%86%d0%b5%d0%b4%d1%83%d1%80%d0%bd%d0%be%d0%b3%d0%be-%d0%ba%d0%b0%d0%b1%d0%b8%d0%bd%d0%b5%d1%82%d0%b0/'],
  ['Хирургия',                     'https://alba-medcenter.ru/service_direction/%d1%85%d0%b8%d1%80%d1%83%d1%80%d0%b3%d0%b8%d1%8f/'],
  ['Генетика',                     'https://alba-medcenter.ru/service_direction/genetic_research_center/'],
  ['Эндокринология',               'https://alba-medcenter.ru/service_direction/endocrinology/'],
  ['Эндоскопия',                   'https://alba-medcenter.ru/service_direction/endoskopiya/'],
];

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; scraper/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  return res.text();
}

function extractPrices(html) {
  const items = [];
  // Pattern: <a href="..."><p>Service name</p><p>Price руб.</p></a>
  const linkRe = /<a[^>]*href="https:\/\/alba-medcenter\.ru\/services\/[^"]*"[^>]*>([\s\S]*?)<\/a>/g;
  let match;
  while ((match = linkRe.exec(html)) !== null) {
    const inner = match[1];
    const ps = [];
    const pRe = /<p[^>]*>([\s\S]*?)<\/p>/g;
    let pm;
    while ((pm = pRe.exec(inner)) !== null) {
      const text = pm[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
      if (text) ps.push(text);
    }
    if (ps.length >= 2) {
      const name = ps[0];
      const price = ps[1];
      if (/руб/.test(price)) items.push({ name, price });
    }
  }
  return items;
}

async function main() {
  const allPrices = {};
  let total = 0;

  for (const [section, url] of SERVICE_URLS) {
    process.stdout.write(`Scraping ${section}... `);
    try {
      const html = await fetchPage(url);
      const items = extractPrices(html);
      if (items.length > 0) {
        allPrices[section] = items;
        total += items.length;
        console.log(`${items.length} prices`);
      } else {
        console.log('no prices found');
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
    // Polite delay
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nTotal: ${total} price entries across ${Object.keys(allPrices).length} sections\n`);

  // Output formatted for system prompt
  console.log('═'.repeat(50));
  console.log('ЦЕНЫ — ПОЛНЫЙ ПРАЙС-ЛИСТ');
  console.log('═'.repeat(50));
  console.log('');

  for (const [section, items] of Object.entries(allPrices)) {
    console.log(`${section}:`);
    for (const { name, price } of items) {
      console.log(`- ${name} — ${price}`);
    }
    console.log('');
  }
}

main().catch(console.error);
