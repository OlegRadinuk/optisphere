#!/usr/bin/env node
/**
 * Scrapes individual doctor pages from alba-medcenter.ru.
 * Usage: node scripts/scrape-doctors.js
 */

const DOCTOR_URLS = [
  ['Мурадасилова Зийде Наримановна',        'https://alba-medcenter.ru/doctors/muradasilova-zijde-narimanovna/'],
  ['Шаталов Тимур Олегович',                'https://alba-medcenter.ru/doctors/%d1%88%d0%b0%d1%82%d0%b0%d0%bb%d0%be%d0%b2-%d1%82%d0%b8%d0%bc%d1%83%d1%80-%d0%be%d0%bb%d0%b5%d0%b3%d0%be%d0%b2%d0%b8%d1%87/'],
  ['Степанов Владимир Владимирович',         'https://alba-medcenter.ru/doctors/%d1%81%d1%82%d0%b5%d0%bf%d0%b0%d0%bd%d0%be%d0%b2-%d0%b2%d0%bb%d0%b0%d0%b4%d0%b8%d0%bc%d0%b8%d1%80-%d0%b2%d0%bb%d0%b0%d0%b4%d0%b8%d0%bc%d0%b8%d1%80%d0%be%d0%b2%d0%b8%d1%87/'],
  ['Шуваев Виктор Викторович',              'https://alba-medcenter.ru/doctors/%d1%88%d1%83%d0%b2%d0%b0%d0%b5%d0%b2-%d0%b2%d0%b8%d0%ba%d1%82%d0%be%d1%80-%d0%b2%d0%b8%d0%ba%d1%82%d0%be%d1%80%d0%be%d0%b2%d0%b8%d1%87/'],
  ['Баталова Динара Тахировна',             'https://alba-medcenter.ru/doctors/%d0%b1%d0%b0%d1%82%d0%b0%d0%bb%d0%be%d0%b2%d0%b0-%d0%b4%d0%b8%d0%bd%d0%b0%d1%80%d0%b0-%d1%82%d0%b0%d1%85%d0%b8%d1%80%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Милоярова Эльвиза Курбановна',          'https://alba-medcenter.ru/doctors/%d0%bc%d0%b8%d0%bb%d0%be%d1%8f%d1%80%d0%be%d0%b2%d0%b0-%d1%8d%d0%bb%d1%8c%d0%b2%d0%b8%d0%b7%d0%b0-%d0%ba%d1%83%d1%80%d0%b1%d0%b0%d0%bd%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Оголихина Ирина Сергеевна',             'https://alba-medcenter.ru/doctors/%d0%be%d0%b3%d0%be%d0%bb%d0%b8%d1%85%d0%b8%d0%bd%d0%b0-%d0%b8%d1%80%d0%b8%d0%bd%d0%b0-%d1%81%d0%b5%d1%80%d0%b3%d0%b5%d0%b5%d0%b2%d0%bd%d0%b0/'],
  ['Джеппарова Беянслы Гиреевна',           'https://alba-medcenter.ru/doctors/%d0%b4%d0%b6%d0%b5%d0%bf%d0%bf%d0%b0%d1%80%d0%be%d0%b2%d0%b0-%d0%b1%d0%b5%d1%8f%d0%bd%d1%81%d0%bb%d1%8b-%d0%b3%d0%b8%d1%80%d0%b5%d0%b5%d0%b2%d0%bd%d0%b0/'],
  ['Абдулаева Эльвиза Айдеровна',           'https://alba-medcenter.ru/doctors/%d0%b0%d0%b1%d0%b4%d1%83%d0%bb%d0%b0%d0%b5%d0%b2%d0%b0-%d1%8d%d0%bb%d1%8c%d0%b2%d0%b8%d0%b7%d0%b0-%d0%b0%d0%b9%d0%b4%d0%b5%d1%80%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Халилов Ваид Садыкович',                'https://alba-medcenter.ru/doctors/halilov-vaid-sadykovich/'],
  ['Румянцева Зоя Сергеевна',               'https://alba-medcenter.ru/doctors/rumjanceva-zoja-sergeevna/'],
  ['Кузьменко Татьяна Владимировна',        'https://alba-medcenter.ru/doctors/kuzmenko-tatjana-vladimirovna/'],
  ['Ивашина Ольга Игоревна',                'https://alba-medcenter.ru/doctors/vrach-gematolog-ivashina-olga-igorevn/'],
  ['Шведун Александр Александрович',        'https://alba-medcenter.ru/doctors/shvedun-aleksandr-aleksandrovich/'],
  ['Литвина Инна Дмитриевна',               'https://alba-medcenter.ru/doctors/%d0%bb%d0%b8%d1%82%d0%b2%d0%b8%d0%bd%d0%b0-%d0%b8%d0%bd%d0%bd%d0%b0-%d0%b4%d0%bc%d0%b8%d1%82%d1%80%d0%b8%d0%b5%d0%b2%d0%bd%d0%b0/'],
  ['Лубенникова Марианна Владимировна',     'https://alba-medcenter.ru/doctors/lubennikova-marianna-vladimirovna/'],
  ['Мурадасилова Альмира Ахмедовна',        'https://alba-medcenter.ru/doctors/%d0%bc%d1%83%d1%80%d0%b0%d0%b4%d0%b0%d1%81%d0%b8%d0%bb%d0%be%d0%b2%d0%b0-%d0%b0%d0%bb%d1%8c%d0%bc%d0%b8%d1%80%d0%b0-%d0%b0%d1%85%d0%bc%d0%b5%d0%b4%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Джабер Зухаир Т. Х.',                   'https://alba-medcenter.ru/doctors/%d0%b4%d0%b6%d0%b0%d0%b1%d0%b5%d1%80-%d0%b7%d1%83%d1%85%d0%b0%d0%b8%d1%80-%d1%82-%d1%85/'],
  ['Меликаева Екатерина Игоревна',          'https://alba-medcenter.ru/doctors/melikaeva_e_i/'],
  ['Королёва Елена Владимировна',           'https://alba-medcenter.ru/doctors/%d0%ba%d0%be%d1%80%d0%be%d0%bb%d1%91%d0%b2%d0%b0-%d0%b5%d0%bb%d0%b5%d0%bd%d0%b0-%d0%b2%d0%bb%d0%b0%d0%b4%d0%b8%d0%bc%d0%b8%d1%80%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Турамуратова Мафтунабону Самадовна',    'https://alba-medcenter.ru/doctors/%d1%82%d1%83%d1%80%d0%b0%d0%bc%d1%83%d1%80%d0%b0%d1%82%d0%be%d0%b2%d0%b0-%d0%bc%d0%b0%d1%84%d1%82%d1%83%d0%bd%d0%b0%d0%b1%d0%be%d0%bd%d1%83-%d1%81%d0%b0%d0%bc%d0%b0%d0%b4%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Ощепков Эдуард Евгеньевич',            'https://alba-medcenter.ru/doctors/oshepkov_eduard/'],
  ['Сапаева Сабина Равильевна',             'https://alba-medcenter.ru/doctors/%d1%81%d0%b0%d0%bf%d0%b0%d0%b5%d0%b2%d0%b0-%d1%81%d0%b0%d0%b1%d0%b8%d0%bd%d0%b0-%d1%80%d0%b0%d0%b2%d0%b8%d0%bb%d1%8c%d0%b5%d0%b2%d0%bd%d0%b0/'],
  ['Акимова Диляра Нуриевна',               'https://alba-medcenter.ru/doctors/akimova-diljara-nurievna/'],
  ['Барбанова Айше Анваровна',              'https://alba-medcenter.ru/doctors/barbarova-a-a/'],
  ['Решетова Севиль Серверовна',            'https://alba-medcenter.ru/doctors/%d1%80%d0%b5%d1%88%d0%b5%d1%82%d0%be%d0%b2%d0%b0-%d1%81%d0%b5%d0%b2%d0%b8%d0%bb%d1%8c-%d1%81%d0%b5%d1%80%d0%b2%d0%b5%d1%80%d0%be%d0%b2%d0%bd%d0%b0/'],
  ['Османова Эльвина Фикретовна',           'https://alba-medcenter.ru/doctors/osmanova-jelvina-fikretovna/'],
  ['Гудкова Мариэтта Андреевна',            'https://alba-medcenter.ru/doctors/gudkova-marijetta-andreevna/'],
  ['Сосновский Сергей Юрьевич',             'https://alba-medcenter.ru/doctors/sosnovskij-sergej-jurevich/'],
  ['Джерад Зиед',                           'https://alba-medcenter.ru/doctors/djerardzied/'],
  ['Шаллал Халаф Камел',                    'https://alba-medcenter.ru/doctors/shallal-halaf-kamel/'],
  ['Чистякова Светлана Игоревна',           'https://alba-medcenter.ru/doctors/chistjakova-svetlana-igorevna/'],
  ['Покидченко Елена Владимировна',         'https://alba-medcenter.ru/doctors/pokidchenko-elena-vladimirovna/'],
  ['Мощенская Юлия Сергеевна',              'https://alba-medcenter.ru/doctors/moshhenskaja-julija-sergeevna/'],
  ['Новинская Ольга Вячеславовна',          'https://alba-medcenter.ru/doctors/novinskaja-olga-vjacheslavovna/'],
  ['Безруков Владимир Олегович',            'https://alba-medcenter.ru/doctors/bezrukov-vladimir-olegovich/'],
  ['Цветков Владимир Александрович',        'https://alba-medcenter.ru/doctors/cvetkov-vladimir-aleksandrovich/'],
  ['Муртазаева Наджие Юсуфовна',            'https://alba-medcenter.ru/doctors/murtazaeva-nazhie-jusufovna/'],
  ['Седикова Наталья Ивановна',             'https://alba-medcenter.ru/doctors/sedikova-natalja-ivanovna/'],
  ['Мамутова Эльвира Вильмуровна',          'https://alba-medcenter.ru/doctors/mamutova-jelvira-vilmurovna/'],
  ['Сейдаметова Элина Эрнестовна',          'https://alba-medcenter.ru/doctors/%d1%81%d0%b5%d0%b9%d0%b4%d0%b0%d0%bc%d0%b5%d1%82%d0%be%d0%b2%d0%b0-%d1%8d%d0%bb%d0%b8%d0%bd%d0%b0-%d1%8d%d1%80%d0%bd%d0%b5%d1%81%d1%82%d0%be%d0%b2%d0%bd%d0%b0/'],
];

async function fetchPage(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; scraper/1.0)' },
    signal: AbortSignal.timeout(10000),
  });
  return res.text();
}

function extractText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractDoctorInfo(html) {
  const info = {};

  // Specialty from subtitle/description
  const specMatch = html.match(/<p[^>]*class="[^"]*specialist[^"]*"[^>]*>(.*?)<\/p>/i)
    || html.match(/<div[^>]*class="[^"]*spec[^"]*"[^>]*>(.*?)<\/div>/i);
  if (specMatch) info.specialty = extractText(specMatch[1]);

  // Experience years — look for "лет стажа", "стаж", "опыт"
  const expMatch = html.match(/(\d+)\s*(?:лет?|год[а-я]*)\s*(?:стажа?|опыта?|клинического)/i)
    || html.match(/стаж[^:]*[:—]\s*(\d+)/i);
  if (expMatch) info.experience = expMatch[0].replace(/<[^>]+>/g, '').trim();

  // Academic degree
  const degreeMatch = html.match(/кандидат\s+медицинских\s+наук/i)
    || html.match(/к\.м\.н/i);
  if (degreeMatch) info.degree = 'к.м.н.';
  const docMatch = html.match(/доктор\s+медицинских\s+наук/i) || html.match(/д\.м\.н/i);
  if (docMatch) info.degree = 'д.м.н.';
  const docentMatch = html.match(/доцент/i);
  if (docentMatch) info.dotsent = true;

  // Extract main content block — look for description paragraphs
  // Remove scripts, styles, nav, header, footer
  let body = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '');

  // Find the main content section with doctor info
  const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (mainMatch) body = mainMatch[1];

  // Extract all paragraphs
  const paragraphs = [];
  const pRe = /<p[^>]*>([\s\S]*?)<\/p>/gi;
  let m;
  while ((m = pRe.exec(body)) !== null) {
    const text = extractText(m[1]);
    if (text.length > 30 && text.length < 600 && !/cookie|реклам|©|разработ/i.test(text)) {
      paragraphs.push(text);
    }
  }

  // Extract list items (specializations)
  const listItems = [];
  const liRe = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  while ((m = liRe.exec(body)) !== null) {
    const text = extractText(m[1]);
    if (text.length > 10 && text.length < 200 && !/cookie|навигац/i.test(text)) {
      listItems.push(text);
    }
  }

  info.paragraphs = paragraphs.slice(0, 5);
  info.listItems = listItems.slice(0, 10);

  return info;
}

async function main() {
  const doctors = [];

  for (const [name, url] of DOCTOR_URLS) {
    process.stdout.write(`Scraping ${name}... `);
    try {
      const html = await fetchPage(url);
      const info = extractDoctorInfo(html);
      doctors.push({ name, ...info });
      console.log('OK');
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      doctors.push({ name, error: e.message });
    }
    await new Promise(r => setTimeout(r, 250));
  }

  console.log('\n' + '═'.repeat(50));
  console.log('ВРАЧИ — ДЕТАЛЬНАЯ ИНФОРМАЦИЯ');
  console.log('═'.repeat(50) + '\n');

  for (const d of doctors) {
    const parts = [d.name];
    if (d.degree) parts.push(d.degree);
    if (d.dotsent) parts.push('доцент');
    if (d.specialty) parts.push(d.specialty);
    if (d.experience) parts.push(d.experience);
    console.log('\n' + parts.join(' | '));
    if (d.paragraphs?.length) {
      d.paragraphs.forEach(p => console.log('  ' + p));
    }
    if (d.listItems?.length) {
      d.listItems.forEach(li => console.log('  • ' + li));
    }
  }
}

main().catch(console.error);
