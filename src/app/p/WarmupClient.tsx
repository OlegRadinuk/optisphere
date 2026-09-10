'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import styles from './warmup.module.css';

const ADVANCE_MS = 160;

// ─── Реквизиты на аванс (самозанятость, НПД) ─────────────────────────────
const REQUISITES: { label: string; value: string }[] = [
  { label: 'Получатель', value: 'Радинюк Олег Анатольевич' },
  { label: 'Режим', value: 'Самозанятый (НПД)' },
  { label: 'ИНН', value: '910401189210' },
  { label: 'Банк', value: 'АО «ТБАНК»' },
  { label: 'БИК', value: '044525974' },
  { label: 'Корр. счёт', value: '30101810145250000974' },
  { label: 'Расчётный счёт', value: '40817810900114966241' },
];

type NicheKey = 'clinic' | 'construction' | 'hotel' | 'other';

const fmt = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

// ─── Общая ситуация (мультивыбор, все ниши) ───
const SITUATION = [
  'Звонят по телефону',
  'Из соцсетей (VK / Telegram)',
  'По сарафану и рекомендациям',
  'Есть сайт, но записей мало',
  'Сайта нет совсем',
];

// ─── КЛИНИКА: боли (мультивыбор + реакция-отражение) ───
const CLINIC_PAINS: { key: string; label: string; reflect?: string }[] = [
  { key: 'calls', label: 'Администратор завален звонками «сколько стоит / как записаться»', reflect: 'Знакомо — администратор тонет в звонках вместо работы с пациентами в клинике. Снимается онлайн-записью и ассистентом.' },
  { key: 'lost', label: 'Пациенты не доходят — не дозвонились, не нашли инфу', reflect: 'Каждый недозвон — это ушедший к конкуренту пациент. Сайт с записью ловит их 24/7.' },
  { key: 'nobooking', label: 'Нет онлайн-записи, всё вручную' },
  { key: 'trust', label: 'Сайт или соцсети не вызывают доверия до визита', reflect: 'Пациент выбирает клинику глазами до звонка. Врачи, отзывы, аккуратный сайт — это и есть доверие.' },
  { key: 'promo', label: 'Надо продвинуть конкретную услугу или направление' },
  { key: 'competitors', label: 'Конкуренты выглядят солиднее' },
];

// ─── КЛИНИКА: ПРАЙС КОНСТРУКТОРА — все цены здесь ───────────────────────
type BaseKey = 'site' | 'landing';
const CLINIC_BASES: Record<BaseKey, { name: string; chip: string; price: number; desc: string }> = {
  site: {
    name: 'Сайт клиники',
    chip: 'Сайт клиники',
    price: 60000,
    desc: 'Главная, направления и услуги с ценами, врачи с фото и регалиями, отзывы, контакты и карта. Под телефон, заявки сразу в Telegram администратору, юридическая база: лицензия, согласия по 152-ФЗ, политика, cookie.',
  },
  landing: {
    name: 'Лендинг под одно направление',
    chip: 'Лендинг',
    price: 50000,
    desc: 'Одна страница под конкретную услугу или направление — быстрый старт, структура под запись. Та же юридическая база и заявки в Telegram.',
  },
};

interface ClinicModule {
  key: string;
  prio: number; // порядок попадания в этап 1, когда смета выше ориентира
  name: string;
  price: number;
  monthly?: number;
  desc: string;
  proof?: string;
  siteOnly?: boolean;
  hint?: string;
}
const CLINIC_MODULES: ClinicModule[] = [
  { key: 'booking', prio: 1, name: 'Онлайн-запись в расписание врачей', price: 20000, proof: 'Альба-Мед',
    desc: 'Пациент видит свободные окна из вашей МИС (МедФлекс / 1С) и записывается сам — к конкретному врачу прямо с его карточки.',
    hint: 'Это та самая запись, что работает у Альба-Мед: расписание из 1С, пациент выбирает врача и время, запись падает прямо в МИС.' },
  { key: 'seo', prio: 2, name: 'SEO-фундамент под Яндекс', price: 15000,
    desc: 'Тайтлы под запросы вида «гинеколог Симферополь», разметка услуг и врачей, карточки филиалов, Вебмастер и Метрика с целями.' },
  { key: 'price', prio: 3, name: 'Живой прайс из МИС', price: 10000, proof: 'Альба-Мед, 2 500+ услуг',
    desc: 'Цены на сайте обновляются сами из вашей учётной системы, с поиском по услугам. Больше не нужно править прайс руками.',
    hint: 'У Альба-Мед так живёт прайс на 2 500+ услуг — администратор его больше не трогает.' },
  { key: 'assistant', prio: 4, name: 'AI-администратор 24/7', price: 15000, monthly: 7000, proof: 'Альба-Мед, Эстетик',
    desc: 'Отвечает на вопросы о ценах, врачах и адресах, записывает, передаёт заявку администратору. Не ставит диагнозов, согласие на обработку данных — до начала диалога.',
    hint: 'Ассистент снимает с администратора повторяющиеся вопросы «сколько стоит» и «как записаться» — и работает ночью.' },
  { key: 'branches', prio: 5, name: 'Несколько филиалов', price: 10000, proof: 'Альба-Мед, 2 филиала', siteOnly: true,
    desc: 'Адреса, врачи и расписание по каждому филиалу, отдельные карточки для карт и поиска.' },
  { key: 'landings', prio: 6, name: 'Страницы под ключевые направления', price: 10000, siteOnly: true,
    desc: '3 отдельные страницы под направления, которые хотите продвигать — под поиск и рекламу.' },
  { key: 'content', prio: 7, name: 'Тексты под ключ', price: 10000,
    desc: 'Пишем тексты услуг и врачей сами по вашим материалам — вам только согласовать.' },
  { key: 'dashboard', prio: 8, name: 'Кабинет заявок', price: 10000,
    desc: 'Все обращения — с сайта, записи и ассистента — в одном месте, со статистикой по дням.' },
  { key: 'direct', prio: 9, name: 'Запуск Яндекс.Директа', price: 15000,
    desc: 'Семантика, объявления, минус-слова, цели. Рекламный бюджет — отдельно, платите напрямую Яндексу.' },
  { key: 'visual', prio: 10, name: 'Выразительный первый экран', price: 15000,
    desc: 'Видео или анимация на первом экране — клиника запоминается с первой секунды.' },
];
const SYSTEM_MODULES = ['booking', 'price', 'assistant', 'dashboard'];
const moduleOf = (k: string) => CLINIC_MODULES.find((m) => m.key === k);

// ─── Прочие ниши (fallback, single-select как раньше) ───
interface NicheMeta {
  label: string;
  tasks: string[];
  hasAssistant: boolean;
  multiName: string;
  multiDesc: string;
  cases: { title: string; body: string }[];
  faq: { q: string; a: string }[];
}
const OTHER_NICHES: Record<Exclude<NicheKey, 'clinic'>, NicheMeta> = {
  construction: {
    label: 'Стройка / ремонт',
    hasAssistant: false,
    multiName: 'Многостраничник с портфолио',
    multiDesc: 'Страницы под типы работ, портфолио объектов, расчёт заявки — чтобы оставляли заявку с параметрами, без холостых звонков.',
    tasks: ['Заявки с бюджетом, а не нецелевые звонки', 'Показать портфолио и отстроиться', 'Разобрать направления по страницам', 'Охват нескольких городов'],
    cases: [
      { title: 'Владен — ремонт под ключ', body: 'Сайт с портфолио 369+ объектов, отдельные страницы под тип ремонта. Задача — отсечь нецелевые звонки и показать масштаб.' },
      { title: 'Стиль Жизни — ремонт и дизайн', body: 'Сайт для дизайн-студии с акцентом на визуал и кейсы. Доверие до первой встречи.' },
    ],
    faq: [
      { q: 'Много фото, но нет текстов', a: 'Тексты пишу сам по короткому брифу — нужны ваши цифры и факты. Фото присылаете в любом виде.' },
      { q: 'Чем отличается от конкурентов?', a: 'Строю структуру под заявку с параметрами, а не «красивую визитку». Красота — не цель.' },
      { q: 'Работаете в нашем регионе?', a: 'Удалённо по всей России, всё согласуем в переписке и по видео.' },
    ],
  },
  hotel: {
    label: 'Отель / апартаменты',
    hasAssistant: true,
    multiName: 'Многостраничник объекта',
    multiDesc: 'Фото номеров, описание, прямое бронирование — чтобы гость выбрал и написал напрямую, без комиссии агрегаторов.',
    tasks: ['Меньше зависеть от Авито и Суточно', 'Прямые брони без комиссии', 'Показать объект, чтобы выбрали без звонка', 'Продвинуть сезон или акцию'],
    cases: [
      { title: 'Deniz / Версаль — гостиницы', body: 'Сайт объекта: фото, номера, прямое бронирование. Меньше комиссии агрегаторам.' },
      { title: 'LoveLifestyle — апартаменты, Алушта', body: 'Сайт под краткосрочную аренду, упор на атмосферу и прямое бронирование.' },
    ],
    faq: [
      { q: 'Авито и Суточно дают брони — зачем сайт?', a: 'Агрегаторы берут 15–25% комиссии. Свой сайт — прямые брони без неё, окупается за сезон.' },
      { q: 'Нужно продвижение или хватит сайта?', a: 'Сайт убеждает того, кто уже нашёл вас. Трафик — отдельный разговор.' },
      { q: 'Можно встроить онлайн-бронирование?', a: 'Да — форма, виджет сервиса или интеграция с вашей системой, зависит от задачи.' },
    ],
  },
  other: {
    label: 'Другой бизнес',
    hasAssistant: false,
    multiName: 'Многостраничник',
    multiDesc: 'Сначала разбираемся, что должен сделать посетитель, потом строим структуру под это.',
    tasks: ['Первые онлайн-заявки', 'Заменить сарафан на поток', 'Объяснить сложную услугу', 'Выйти в новый город'],
    cases: [{ title: 'Подход под вашу нишу', body: 'Принцип один: сначала — что должен сделать посетитель, потом структура. Покажу на звонке за 15 минут.' }],
    faq: [
      { q: 'Мы небольшие — не дорого?', a: 'Зависит от задачи. Лендинг под одну услугу — от 50 тысяч. Разберёмся, что реально нужно.' },
      { q: 'Хотим «как у конкурента X»', a: 'Покажите — посмотрю. Полезнее понять, почему он работает, и сделать вашу версию.' },
      { q: 'Сами не знаем, что нужно', a: 'Для этого и разговор до старта. Расскажите что продаёте и кому — разберём.' },
    ],
  },
};

const SCALE = [
  { key: 'one', label: 'Одна услуга или направление', hint: 'Судя по ответам — это лендинг.' },
  { key: 'multi', label: 'Несколько направлений', hint: 'Судя по ответам — это многостраничник.' },
  { key: 'unknown', label: 'Не знаю, подберите', hint: 'Разберёмся вместе — в финале покажу варианты.' },
];

const URGENCY = [
  { key: 'asap', label: 'Как можно скорее' },
  { key: 'month', label: 'В течение месяца' },
  { key: 'browsing', label: 'Пока присматриваюсь' },
];
const urgencyLabel = (k?: string) => URGENCY.find((u) => u.key === k)?.label;

const BRIEF_HAVE = ['Фото / материалы', 'Логотип и стиль', 'Тексты или прайс', 'Старый сайт', 'Пока ничего'];

interface Answers {
  niche?: NicheKey;
  otherBiz?: string;
  situation: string[];
  pains: string[];
  base: BaseKey;
  modules: string[];
  task?: string;
  scale?: string;
  assistant?: string;
  urgency?: string;
}

const EMPTY: Answers = { situation: [], pains: [], base: 'site', modules: [] };

// ─── Клиника: смета из основы и модулей ───
interface ClinicEstimate {
  base: (typeof CLINIC_BASES)[BaseKey];
  mods: ClinicModule[];
  total: number;
  monthly: number;
  budget: number | null;
  stages: { s1: ClinicModule[]; s1Sum: number; s2: ClinicModule[]; s2Sum: number } | null;
}
function clinicEstimate(a: Answers, budget: number | null): ClinicEstimate {
  const base = CLINIC_BASES[a.base];
  const mods = CLINIC_MODULES.filter((m) => a.modules.includes(m.key) && (!m.siteOnly || a.base === 'site'));
  const total = base.price + mods.reduce((s, m) => s + m.price, 0);
  const monthly = mods.reduce((s, m) => s + (m.monthly ?? 0), 0);
  let stages: ClinicEstimate['stages'] = null;
  if (budget && total > budget) {
    // Этап 1 — основа + модули по приоритету, пока влезают в ориентир
    let left = budget - base.price;
    const s1: ClinicModule[] = [];
    const s2: ClinicModule[] = [];
    for (const m of [...mods].sort((x, y) => x.prio - y.prio)) {
      if (m.price <= left) { s1.push(m); left -= m.price; } else s2.push(m);
    }
    const s1Sum = base.price + s1.reduce((s, m) => s + m.price, 0);
    const s2Sum = s2.reduce((s, m) => s + m.price, 0);
    // Разбивка имеет смысл, только когда этап 1 уместился в ориентир И в этапе 2 что-то осталось;
    // иначе (напр. основа > ориентира или все модули поместились) просто показываем одну смету.
    if (s2.length > 0 && s1Sum <= budget) {
      stages = { s1, s1Sum, s2, s2Sum };
    }
  }
  return { base, mods, total, monthly, budget, stages };
}

// ─── Рекомендация + цена ───
interface Rec { name: string; price: string; desc: string; addon: string | null; note: string | null }
function buildRecommendation(a: Answers, est: ClinicEstimate | null): Rec | null {
  if (!a.niche) return null;
  if (a.niche === 'clinic' && est) {
    const name = a.base === 'landing'
      ? 'Лендинг для клиники'
      : est.mods.some((m) => SYSTEM_MODULES.includes(m.key)) ? 'Сайт клиники + система записи' : 'Сайт клиники';
    return { name, price: `≈ ${fmt(est.total)}`, desc: '', addon: null, note: null };
  }
  if (a.niche === 'clinic') return null;
  // прочие ниши
  const meta = OTHER_NICHES[a.niche];
  if (a.scale === 'multi') return { name: meta.multiName, price: 'от 75 000 ₽', desc: meta.multiDesc, addon: null, note: null };
  if (a.scale === 'unknown') return { name: meta.multiName, price: 'от 75 000 ₽', desc: meta.multiDesc, addon: null, note: 'На звонке покажу и лендинг, и многостраничник — что выгоднее под задачу.' };
  return { name: 'Лендинг «Старт»', price: 'от 50 000 ₽', desc: 'Одна страница под одну задачу. Структура от заявки, не от красоты.', addon: null, note: null };
}

function scoreLead(a: Answers): 'hot' | 'warm' | 'cold' {
  const otherScope = a.scale === 'multi';
  if (a.urgency === 'asap' && (otherScope || a.niche === 'clinic')) return 'hot';
  if (a.urgency === 'browsing' || a.scale === 'unknown') return 'cold';
  return 'warm';
}

// ─── Клиника: кейсы + FAQ ───
type Case = { title: string; body: string };
const CASE_ALBAMED: Case = { title: 'Альба-Мед, Симферополь', body: 'Многопрофильный медцентр, два филиала. Подключили онлайн-запись прямо в расписание 1С через МедФлекс — пациент выбирает врача и время сам, в том числе с карточки врача. Прайс на 2 500+ услуг подтягивается из учётной системы автоматически. AI-администратор отвечает и записывает круглосуточно.' };
const CASE_HAKIMOV: Case = { title: 'Медцентр Хакимовых, Симферополь', body: 'Многостраничный сайт: главная, 12 направлений, страницы врачей, онлайн-запись. Раньше — только телефон и сарафан. Теперь пациенты приходят подготовленными, зная врача по имени.' };
const CASE_ESTET: Case = { title: 'Стоматология «Эстетик», Симферополь', body: 'AI-администратор на сайте: отвечает на вопросы пациентов и передаёт заявки администратору в Telegram.' };
function clinicCases(modules: string[]): Case[] {
  const has = (k: string) => modules.includes(k);
  if (has('booking') || has('price') || has('branches')) return [CASE_ALBAMED, CASE_HAKIMOV];
  if (has('assistant')) return [CASE_ALBAMED, CASE_ESTET];
  return [CASE_HAKIMOV, CASE_ALBAMED];
}
const CLINIC_FAQ: { q: string; a: string }[] = [
  { q: 'Сколько времени займёт?', a: 'Лендинг — 2–3 недели. Сайт клиники — 4–6 недель, интеграция с МИС добавляет 1–2 недели. Сроки фиксирую в договоре до старта.' },
  { q: 'Бюджет ограничен — что делать?', a: 'Запускаемся этапами: сначала основа и запись, остальное подключаем, когда сайт уже приносит пациентов. Ничего не переделывается — модули добавляются к готовому сайту.' },
  { q: 'У нас МИС — подружите с сайтом?', a: 'С 1С и МедФлексом — да, уже работает у Альба-Мед: расписание, запись и прайс живые. Другую систему — напишите название, скажу сразу, есть ли у неё открытый доступ.' },
  { q: 'Кто будет обновлять сайт?', a: 'Мы. Новый врач, акция, смена цен — пишете в Telegram, мы обновляем. В админку ходить не нужно.' },
  { q: 'AI-ассистент не наговорит пациенту лишнего?', a: 'Он не ставит диагнозов и не выспрашивает симптомы — отвечает про услуги, цены, врачей и записывает. До начала диалога пациент даёт согласие на обработку данных.' },
  { q: 'А лицензия, 152-ФЗ и мед. требования?', a: 'Сведения о лицензии, реквизиты, согласия и политика — входят в основу. Данные — на серверах в РФ, юридические формулировки готовит наш юрист.' },
];

const CLINIC_FACTS = [
  'Онлайн-запись в расписание из МИС — работает у Альба-Мед',
  'AI-администратор, который записывает пациентов 24/7',
  'Живой прайс из 1С — без ручных правок',
];

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M3.5 8.2l2.9 2.9 6.1-6.3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function WarmupClient() {
  const sp = useSearchParams();

  const to = sp.get('to')?.trim() || null;
  const company = (sp.get('company') || sp.get('clinic'))?.trim() || null;
  // Дефолт — личный TG Олега; параметром ?tg= можно переопределить (или ?tg=off убрать)
  const tgParam = sp.get('tg')?.trim();
  const tg = tgParam === 'off' ? null : tgParam || 'https://t.me/aleg_rad';
  const phone = sp.get('phone')?.trim() || null;
  const mode = sp.get('mode')?.trim() || 'warm';
  // ?preset=clinic — сразу медицина, без вопроса о нише; ?budget=100000 — ориентир бюджета в конструкторе
  const preset = sp.get('preset')?.trim() === 'clinic' ? 'clinic' : null;
  const budgetRaw = Number((sp.get('budget') || '').replace(/\D/g, ''));
  const budget = budgetRaw >= 30000 && budgetRaw <= 2000000 ? budgetRaw : null;

  const [a, setA] = useState<Answers>(() => (preset ? { ...EMPTY, niche: 'clinic' } : EMPTY));
  const [pace, setPace] = useState('');
  const [note, setNote] = useState('');
  const [haveItems, setHaveItems] = useState<string[]>([]);
  const [lastMod, setLastMod] = useState<string | null>(null);

  const isClinic = a.niche === 'clinic';

  const flow = useMemo(() => {
    const f: string[] = ['niche', 'situation'];
    if (a.niche === 'clinic') f.push('pains', 'modules');
    else if (a.niche) { f.push('task', 'scale'); if (OTHER_NICHES[a.niche].hasAssistant) f.push('assistant'); }
    if (a.niche) f.push('urgency', 'brief', 'final');
    return f;
  }, [a.niche]);

  const questionIds = flow.filter((s) => !['niche', 'brief', 'final'].includes(s) || (s === 'niche' && !preset));
  const totalQuestions = questionIds.length;

  const [idx, setIdx] = useState(0);
  const [dir, setDir] = useState<1 | -1>(1);
  useEffect(() => { if (idx > flow.length - 1) setIdx(flow.length - 1); }, [flow, idx]);
  const current = flow[idx];

  const goTo = (n: number) => { setDir(n > idx ? 1 : -1); setIdx(n); requestAnimationFrame(() => window.scrollTo({ top: 0 })); };
  const next = () => goTo(Math.min(idx + 1, flow.length - 1));
  const back = () => goTo(Math.max(idx - 1, 0));

  const advanceTimer = useRef<number | null>(null);
  useEffect(() => () => { if (advanceTimer.current) window.clearTimeout(advanceTimer.current); }, []);
  const pickSingle = (field: keyof Answers, value: string, advance: boolean) => {
    if (advanceTimer.current) window.clearTimeout(advanceTimer.current);
    setA((p) => ({ ...p, [field]: value }));
    if (advance) advanceTimer.current = window.setTimeout(next, ADVANCE_MS);
  };
  const toggleMulti = (field: 'situation' | 'pains' | 'modules', value: string) => {
    setA((p) => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };
  const toggleModule = (key: string) => {
    const on = a.modules.includes(key);
    toggleMulti('modules', key);
    if (!on && moduleOf(key)?.hint) setLastMod(key);
    else if (on && lastMod === key) setLastMod(null);
  };
  const setBase = (b: BaseKey) => {
    setA((p) => ({ ...p, base: b, modules: b === 'landing' ? p.modules.filter((k) => !moduleOf(k)?.siteOnly) : p.modules }));
    if (b === 'landing' && lastMod && moduleOf(lastMod)?.siteOnly) setLastMod(null);
  };

  const niche = a.niche ?? null;
  const est = useMemo(() => (a.niche === 'clinic' ? clinicEstimate(a, budget) : null), [a, budget]);
  const rec = useMemo(() => buildRecommendation(a, est), [a, est]);
  const qNum = (id: string) => questionIds.indexOf(id) + 1;

  // Реакция-отражение на боли клиники
  const painReflect = useMemo(() => {
    for (const p of CLINIC_PAINS) if (a.pains.includes(p.key) && p.reflect) return p.reflect;
    return null;
  }, [a.pains]);

  // ── Отправка заявки в Telegram при достижении финала ──
  const leadSent = useRef(false);
  useEffect(() => {
    if (current !== 'final' || leadSent.current || !a.niche) return;
    leadSent.current = true;
    const source = sp.get('ref') || sp.get('utm_source') || mode;
    let clinicScale: string | undefined;
    let clinicRec: string | undefined;
    if (isClinic && est && rec) {
      clinicScale = `Основа: ${est.base.name}; модули: ${est.mods.length ? est.mods.map((m) => m.name).join(', ') : 'нет'}`;
      const budgetPart = est.budget
        ? ` (ориентир ${fmt(est.budget)}${est.stages ? `, этап 1: ${fmt(est.stages.s1Sum)}` : ''})`
        : '';
      clinicRec = `${rec.name} — ${rec.price}${budgetPart}${est.monthly ? ` + ${fmt(est.monthly)}/мес` : ''}`;
    }
    const payload = {
      name: to || undefined,
      company: company || (a.niche === 'other' ? a.otherBiz : undefined) || undefined,
      niche: a.niche === 'clinic' ? 'Медицина / клиника' : OTHER_NICHES[a.niche].label,
      situation: a.situation.length ? a.situation.join(', ') : undefined,
      task: isClinic
        ? (a.pains.length ? a.pains.map((k) => CLINIC_PAINS.find((p) => p.key === k)?.label ?? k).join('; ') : undefined)
        : a.task,
      scale: isClinic ? clinicScale : (a.scale ? SCALE.find((s) => s.key === a.scale)?.label : undefined),
      urgency: urgencyLabel(a.urgency),
      recommendation: isClinic ? clinicRec : (rec ? `${rec.name} — ${rec.price}${rec.addon ? ' + ассистент' : ''}` : undefined),
      brief: { have: haveItems.length ? haveItems : undefined, pace: pace || undefined, note: note.trim() || undefined },
      score: scoreLead(a),
      source,
    };
    fetch('/api/leads/warmup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  }, [current, a, rec, est, to, company, sp, haveItems, pace, note, isClinic, mode]);

  // «Дальше» нужен на мультивыборах, шкале, ассистенте, брифе, интро пресета и при выборе «другой бизнес»
  const manualNext = ['situation', 'pains', 'modules', 'scale', 'assistant', 'brief'].includes(current)
    || (current === 'niche' && (a.niche === 'other' || !!preset));
  const nextDisabled =
    (current === 'situation' && a.situation.length === 0) ||
    (current === 'pains' && a.pains.length === 0) ||
    (current === 'scale' && !a.scale) ||
    (current === 'assistant' && !a.assistant) ||
    (current === 'niche' && a.niche === 'other' && !a.otherBiz?.trim());

  const greeting = to ? `${to}, здравствуйте!` : 'Здравствуйте!';
  const visibleModules = CLINIC_MODULES.filter((m) => !m.siteOnly || a.base === 'site');
  const modHint = lastMod ? moduleOf(lastMod)?.hint : null;

  return (
    <div className={styles.shell}>
      {/* TOPBAR + ЛОГО + ПРОГРЕСС */}
      <header className={styles.topbar}>
        <div className={styles.brandRow}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/optisphere-logo-light.png" alt="Optisphere" className={styles.brandLogo} />
        </div>
        {current !== 'niche' && current !== 'final' && (
          <>
            <div className={styles.progressMeta}>
              <span>{questionIds.includes(current)
                ? (current === questionIds[totalQuestions - 1] ? 'Последний вопрос — дальше рекомендация' : `Вопрос ${qNum(current)} из ${totalQuestions}`)
                : 'Пара уточнений — почти готово'}</span>
            </div>
            <div className={styles.progress} aria-hidden>
              {flow.slice(0, -1).map((_, i) => <span key={i} className={`${styles.tick} ${i <= idx ? styles.tickOn : ''}`} />)}
            </div>
          </>
        )}
      </header>

      <main className={`${styles.content} ${current === 'modules' ? styles.contentTall : ''}`}>
        <div key={idx} className={dir === 1 ? styles.slideIn : styles.slideInBack}>

          {/* ── Интро пресета «клиника» ── */}
          {current === 'niche' && preset && (
            <div className={styles.center}>
              {mode === 'cold' && <span className={styles.eyebrow}>Подбор сайта · 2 минуты</span>}
              <h1 className={styles.h1}>Сайт для {company ? <>«{company}»</> : 'вашего медцентра'}</h1>
              <p className={styles.lede}>
                {greeting} Ответьте на пару вопросов о клинике, потом отметите, что нужно на сайте, — и сразу увидите смету.
                {budget ? <> Ориентир — около {fmt(budget)}.</> : null}
              </p>
              <div className={styles.factsLabel}>Что уже делаем для клиник</div>
              <ul className={styles.facts}>
                {CLINIC_FACTS.map((f) => (
                  <li key={f} className={styles.fact}><span className={styles.factIcon}><CheckIcon /></span>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {/* ── Ниша ── */}
          {current === 'niche' && !preset && (
            <div className={styles.center}>
              {mode === 'cold' ? (
                <>
                  <span className={styles.eyebrow}>Подбор сайта · 1 минута</span>
                  <h1 className={styles.h1}>Подберём сайт под ваш бизнес <span className={styles.accent}>за минуту</span></h1>
                  <p className={styles.lede}>Без звонков и менеджеров. Если вы решаете по сайту{company ? <> в «{company}»</> : null} — ответьте на пару вопросов, покажу вариант и ориентир по бюджету.</p>
                </>
              ) : (
                <>
                  <h1 className={styles.h1}>Подберём сайт <span className={styles.accent}>под вашу задачу</span></h1>
                  <p className={styles.lede}>{greeting} {company ? <>Для «{company}» — </> : null}5 вопросов, и увидите рекомендацию с ориентиром по бюджету.</p>
                </>
              )}
              <div className={styles.answers}>
                {(['clinic', 'construction', 'hotel', 'other'] as NicheKey[]).map((k) => {
                  const label = k === 'clinic' ? 'Медицина / клиника' : OTHER_NICHES[k].label;
                  const on = a.niche === k;
                  return (
                    <button key={k} aria-pressed={on} className={`${styles.answer} ${on ? styles.answerOn : ''}`}
                      onClick={() => pickSingle('niche', k, k !== 'other')}>
                      {label}
                    </button>
                  );
                })}
              </div>
              {a.niche === 'other' && (
                <input className={styles.input} autoFocus placeholder="А какой у вас бизнес? Напишите пару слов"
                  value={a.otherBiz ?? ''} onChange={(e) => setA((p) => ({ ...p, otherBiz: e.target.value }))} />
              )}
            </div>
          )}

          {/* ── Ситуация (мультивыбор) ── */}
          {current === 'situation' && (
            <div>
              <h2 className={styles.h2}>{isClinic ? 'Как сейчас приходят пациенты?' : 'Как сейчас приходят клиенты?'}</h2>
              <p className={styles.sub}>Можно выбрать несколько</p>
              <div className={styles.answers}>
                {SITUATION.map((s) => (
                  <button key={s} aria-pressed={a.situation.includes(s)} className={`${styles.answer} ${a.situation.includes(s) ? styles.answerOn : ''}`} onClick={() => toggleMulti('situation', s)}>{s}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Клиника: боли (мультивыбор) ── */}
          {current === 'pains' && (
            <div>
              <h2 className={styles.h2}>Что сейчас больше всего мешает или теряет пациентов?</h2>
              <p className={styles.sub}>Отметьте всё, что откликается</p>
              <div className={styles.answers}>
                {CLINIC_PAINS.map((p) => (
                  <button key={p.key} aria-pressed={a.pains.includes(p.key)} className={`${styles.answer} ${a.pains.includes(p.key) ? styles.answerOn : ''}`} onClick={() => toggleMulti('pains', p.key)}>{p.label}</button>
                ))}
              </div>
              {painReflect && <div className={styles.hint}>{painReflect}</div>}
            </div>
          )}

          {/* ── Клиника: конструктор (основа + модули → смета) ── */}
          {current === 'modules' && (
            <div>
              <h2 className={styles.h2}>Соберите сайт под свою клинику</h2>
              <p className={styles.sub}>
                {budget
                  ? 'Основа уже в смете. Отметьте, что ещё важно — шкала внизу покажет, что входит в ориентир.'
                  : 'Основа уже в смете. Отметьте, что ещё важно — сумма посчитается сразу.'}
              </p>

              <div className={styles.briefLabel}>Основа</div>
              <div className={styles.chips}>
                {(Object.keys(CLINIC_BASES) as BaseKey[]).map((b) => (
                  <button key={b} aria-pressed={a.base === b} className={`${styles.chip} ${a.base === b ? styles.chipOn : ''}`} onClick={() => setBase(b)}>
                    {CLINIC_BASES[b].chip} · {fmt(CLINIC_BASES[b].price)}
                  </button>
                ))}
              </div>
              <p className={styles.baseDesc}>{CLINIC_BASES[a.base].desc}</p>

              <div className={styles.briefLabel}>Что добавить</div>
              <div className={styles.answers}>
                {visibleModules.map((m) => {
                  const on = a.modules.includes(m.key);
                  return (
                    <button key={m.key} aria-pressed={on} className={`${styles.answer} ${styles.mod} ${on ? `${styles.answerOn} ${styles.modOn}` : ''}`} onClick={() => toggleModule(m.key)}>
                      <span className={styles.modCheck}>{on && <CheckIcon size={14} />}</span>
                      <span className={styles.modBody}>
                        <span className={styles.modName}>{m.name}</span>
                        <span className={styles.modDesc}>{m.desc}</span>
                        {m.proof && <span className={styles.modTag}>Работает у: {m.proof}</span>}
                      </span>
                      <span className={styles.modPrice}>
                        +{fmt(m.price)}
                        {m.monthly ? <span className={styles.modPriceSub}>+{fmt(m.monthly)}/мес</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
              {modHint && <div className={styles.hint}>{modHint}</div>}
            </div>
          )}

          {/* ── Прочие ниши: задача ── */}
          {current === 'task' && niche && niche !== 'clinic' && (
            <div>
              <h2 className={styles.h2}>Что сейчас важнее всего решить?</h2>
              <div className={styles.answers}>
                {OTHER_NICHES[niche].tasks.map((t) => (
                  <button key={t} aria-pressed={a.task === t} className={`${styles.answer} ${a.task === t ? styles.answerOn : ''}`} onClick={() => pickSingle('task', t, true)}>{t}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Прочие ниши: масштаб ── */}
          {current === 'scale' && (
            <div>
              <h2 className={styles.h2}>Сколько направлений нужно охватить?</h2>
              <div className={styles.answers}>
                {SCALE.map((s) => (
                  <button key={s.key} aria-pressed={a.scale === s.key} className={`${styles.answer} ${a.scale === s.key ? styles.answerOn : ''}`} onClick={() => pickSingle('scale', s.key, false)}>{s.label}</button>
                ))}
              </div>
              {a.scale && <div className={styles.hint}>{SCALE.find((s) => s.key === a.scale)?.hint}</div>}
            </div>
          )}

          {/* ── Отель: ассистент ── */}
          {current === 'assistant' && (
            <div>
              <h2 className={styles.h2}>Хотите, чтобы сайт сам отвечал гостям и принимал заявки — без ресепшена?</h2>
              <p className={styles.sub}>AI-ассистент: отвечает на вопросы, помогает выбрать, отправляет бронь.</p>
              <div className={styles.answers}>
                <button aria-pressed={a.assistant === 'yes'} className={`${styles.answer} ${a.assistant === 'yes' ? styles.answerOn : ''}`} onClick={() => pickSingle('assistant', 'yes', true)}>Да, было бы удобно</button>
                <button aria-pressed={a.assistant === 'no'} className={`${styles.answer} ${a.assistant === 'no' ? styles.answerOn : ''}`} onClick={() => pickSingle('assistant', 'no', true)}>Пока не нужно</button>
              </div>
            </div>
          )}

          {/* ── Срочность ── */}
          {current === 'urgency' && (
            <div>
              <h2 className={styles.h2}>Когда планируете стартовать?</h2>
              <div className={styles.answers}>
                {URGENCY.map((u) => (
                  <button key={u.key} aria-pressed={a.urgency === u.key} className={`${styles.answer} ${a.urgency === u.key ? styles.answerOn : ''}`} onClick={() => pickSingle('urgency', u.key, true)}>{u.label}</button>
                ))}
              </div>
            </div>
          )}

          {/* ── Бриф ── */}
          {current === 'brief' && (
            <div>
              <h2 className={styles.h2}>Пара уточнений — чтобы рекомендация была точнее</h2>
              <p className={styles.sub}>Тапните — займёт 30 секунд. Всё необязательно.</p>
              <div className={styles.briefBlock}>
                <div className={styles.briefLabel}>Что уже есть из материалов?</div>
                <div className={styles.chips}>
                  {BRIEF_HAVE.map((o) => (
                    <button key={o} aria-pressed={haveItems.includes(o)} className={`${styles.chip} ${haveItems.includes(o) ? styles.chipOn : ''}`} onClick={() => setHaveItems((p) => (p.includes(o) ? p.filter((x) => x !== o) : [...p, o]))}>{o}</button>
                  ))}
                </div>
              </div>
              <div className={styles.briefBlock}>
                <div className={styles.briefLabel}>Что важнее?</div>
                <div className={styles.chips}>
                  {['Запуститься быстро', 'Сделать основательно', 'Не знаю, обсудим'].map((o) => (
                    <button key={o} aria-pressed={pace === o} className={`${styles.chip} ${pace === o ? styles.chipOn : ''}`} onClick={() => setPace((p) => (p === o ? '' : o))}>{o}</button>
                  ))}
                </div>
              </div>
              <div className={styles.briefBlock}>
                <div className={styles.briefLabel}>Хотите добавить что-то важное?</div>
                <textarea className={styles.textarea} rows={3} placeholder="Напишите что важно — прочитаю до звонка" value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          )}

          {/* ── ФИНАЛ ── */}
          {current === 'final' && niche && (
            <FinalScreen
              a={a} isClinic={isClinic} rec={rec} est={est} tg={tg} phone={phone}
              buildMessage={() => buildContactMessage({ to, company, a, rec, est, isClinic })}
            />
          )}
        </div>
      </main>

      {/* НАВИГАЦИЯ */}
      {current !== 'final' && (
        <footer className={styles.navbar}>
          {current === 'modules' && est && <EstimateBar est={est} />}
          {idx > 0 && <button className={styles.back} onClick={back} aria-label="Назад">←</button>}
          {manualNext ? (
            <button className={styles.next} onClick={next} disabled={nextDisabled}>
              {current === 'brief' ? 'Показать рекомендацию' : current === 'niche' && preset ? 'Начать' : 'Дальше'} <span aria-hidden>→</span>
            </button>
          ) : (
            <div className={styles.navHintFull}>{current === 'niche' ? 'Выберите вариант' : 'Выберите ответ'}</div>
          )}
        </footer>
      )}

      {/* ПЛАВАЮЩАЯ КНОПКА СВЯЗИ */}
      {idx >= 1 && current !== 'final' && current !== 'modules' && (tg || phone) && (
        <a className={styles.fab} href={tg || `tel:${(phone || '').replace(/[^\d+]/g, '')}`} target={tg ? '_blank' : undefined} rel="noopener noreferrer">Написать Олегу</a>
      )}
    </div>
  );
}

// Итог конструктора в нижней панели: сумма и (если задан ориентир) шкала бюджета
function EstimateBar({ est }: { est: ClinicEstimate }) {
  const over = est.budget ? est.total - est.budget : 0;
  const fill = est.budget ? Math.min(100, Math.round((est.total / est.budget) * 100)) : 0;
  return (
    <div className={styles.navSummary} aria-live="polite">
      <div className={styles.sumRow}>
        <span className={styles.sumTotal}>
          {fmt(est.total)}
          {est.monthly ? <span className={styles.sumMonthly}> +{fmt(est.monthly)}/мес</span> : null}
        </span>
        <span className={styles.sumMeta}>
          {est.budget
            ? (over > 0 ? `на ${fmt(over)} выше ориентира` : `из ${fmt(est.budget)}`)
            : 'смета'}
        </span>
      </div>
      {est.budget && (
        <div className={styles.meter} aria-hidden>
          <div className={`${styles.meterFill} ${over > 0 ? styles.meterOver : ''}`} style={{ width: `${fill}%` }} />
        </div>
      )}
    </div>
  );
}

function EstimateList({ items }: { items: { name: string; price: number }[] }) {
  return (
    <ul className={styles.recList}>
      {items.map((it) => (
        <li key={it.name} className={styles.recItem}>
          <span className={styles.recItemIcon}><CheckIcon /></span>
          <span className={styles.recItemName}>{it.name}</span>
          <span className={styles.recItemPrice}>{fmt(it.price)}</span>
        </li>
      ))}
    </ul>
  );
}

function ClinicRecCard({ rec, est }: { rec: Rec; est: ClinicEstimate }) {
  const baseItem = { name: est.base.name, price: est.base.price };
  const spare = est.budget && !est.stages ? est.budget - est.total : 0;
  return (
    <div className={styles.recCard}>
      <div className={styles.recName}>{rec.name}</div>
      {est.stages ? (
        <>
          <div className={styles.stageTitle}>Этап 1 — в ориентир {fmt(est.budget!)}</div>
          <EstimateList items={[baseItem, ...est.stages.s1]} />
          <div className={styles.stageSum}><span>Этап 1</span><span>{fmt(est.stages.s1Sum)}</span></div>
          <div className={styles.stageTitle}>Этап 2 — когда будете готовы</div>
          <EstimateList items={est.stages.s2} />
          <div className={styles.stageSum}><span>Этап 2</span><span>{fmt(est.stages.s2Sum)}</span></div>
          <div className={styles.recNote}>Можно и одним проектом — тогда ≈ {fmt(est.total)}.</div>
        </>
      ) : (
        <>
          <div className={styles.stageTitle}>Что входит</div>
          <EstimateList items={[baseItem, ...est.mods]} />
          <div className={styles.recPrice}>{rec.price}</div>
          {est.budget && (
            <div className={styles.recNote}>
              {est.total <= est.budget
                ? <>Укладывается в ориентир {fmt(est.budget)}{spare >= 10000 ? `, ещё ${fmt(spare)} в запасе — можно добавить модуль` : ''}.</>
                : <>Выше ориентира {fmt(est.budget)} на {fmt(est.total - est.budget)} — на звонке разберём, что можно упростить или отложить.</>}
            </div>
          )}
        </>
      )}
      {est.monthly > 0 && <div className={styles.recAddon}>+ {fmt(est.monthly)}/мес — AI-администратор (обслуживание и работа модели)</div>}
      <div className={styles.recFrom}>Ориентир. Точную сумму зафиксирую в договоре после короткого разговора.</div>
    </div>
  );
}

function FinalScreen({ a, isClinic, rec, est, tg, phone, buildMessage }: {
  a: Answers; isClinic: boolean; rec: Rec | null; est: ClinicEstimate | null; tg: string | null; phone: string | null; buildMessage: () => string;
}) {
  const browsing = a.urgency === 'browsing';
  const cases: Case[] = isClinic ? clinicCases(a.modules) : (a.niche && a.niche !== 'clinic' ? [OTHER_NICHES[a.niche].cases[0]] : [CASE_HAKIMOV]);
  const faq = isClinic ? CLINIC_FAQ : (a.niche && a.niche !== 'clinic' ? OTHER_NICHES[a.niche].faq : CLINIC_FAQ);

  return (
    <div>
      <div className={styles.kicker}><span className={styles.kickerN}><CheckIcon size={13} /></span>Подбор готов</div>
      <h2 className={styles.h2}>{browsing ? 'Собрал смету — вернётесь, когда будет время' : 'Вот что подходит под ваш запрос'}</h2>

      {rec && isClinic && est && <ClinicRecCard rec={rec} est={est} />}
      {rec && !isClinic && (
        <div className={styles.recCard}>
          <div className={styles.recName}>{rec.name}</div>
          <div className={styles.recDesc}>{rec.desc}</div>
          <div className={styles.recPrice}>{rec.price}</div>
          <div className={styles.recFrom}>Точную сумму назову после короткого разговора — зависит от объёма.</div>
          {rec.note && <div className={styles.recNote}>{rec.note}</div>}
          {rec.addon && <div className={styles.recAddon}>+ {rec.addon}</div>}
        </div>
      )}

      <div className={styles.recCase}>
        <div className={styles.recCaseLabel}>{cases.length > 1 ? 'Похожие проекты' : 'Похожий проект'}</div>
        {cases.map((c, i) => (
          <div key={c.title} className={i > 0 ? styles.recCaseNext : undefined}>
            <div className={styles.recCaseTitle}>{c.title}</div>
            <div className={styles.recCaseBody}>{c.body}</div>
          </div>
        ))}
      </div>

      {!browsing && (
        <div className={styles.avail}>Беру 2–3 проекта одновременно. Сейчас один слот свободен — если всё совпадает, могу взять вас следующим.</div>
      )}

      <div className={styles.faq}>
        {faq.map((f) => (
          <details key={f.q} className={styles.faqItem}>
            <summary className={styles.faqQ}>{f.q}</summary>
            <div className={styles.faqA}>{f.a}</div>
          </details>
        ))}
      </div>

      <div className={styles.work}>
        <div className={styles.workTitle}>Как устроена работа</div>
        <p className={styles.workText}>Работаю как самозанятый — Радинюк Олег Анатольевич, режим НПД. После согласования выставляю счёт через «Мой налог» — официальный чек, принимается к учёту. Аванс 50% — до старта, остаток — при сдаче.</p>
        <details className={styles.faqItem} id="req">
          <summary className={styles.faqQ}>Реквизиты на аванс</summary>
          <div className={styles.faqA}>
            <div className={styles.reqHead}><span className={styles.reqMode}>самозанятый · чек «Мой налог»</span></div>
            <div className={styles.reqGrid}>{REQUISITES.map((r) => <CopyRow key={r.label} label={r.label} value={r.value} />)}</div>
          </div>
        </details>
      </div>

      <SendBlock tg={tg} phone={phone} buildMessage={buildMessage} browsing={browsing} />
      <p className={styles.footNote}>Optisphere · Радинюк Олег. Отвечу в течение нескольких часов.</p>
    </div>
  );
}

function buildContactMessage(d: { to: string | null; company: string | null; a: Answers; rec: Rec | null; est: ClinicEstimate | null; isClinic: boolean }): string {
  const L: string[] = ['Здравствуйте, Олег! Прошёл подбор на персональной странице.'];
  if (d.company) L.push(`Компания: ${d.company}`);
  else if (d.a.niche === 'other' && d.a.otherBiz) L.push(`Бизнес: ${d.a.otherBiz}`);
  L.push(`Ниша: ${d.isClinic ? 'Клиника' : (d.a.niche && d.a.niche !== 'clinic' ? OTHER_NICHES[d.a.niche].label : '')}`);
  if (d.a.situation.length) L.push(`Сейчас клиенты: ${d.a.situation.join(', ')}`);
  if (d.isClinic && d.est) {
    L.push(`Основа: ${d.est.base.name}`);
    if (d.est.mods.length) L.push(`Модули: ${d.est.mods.map((m) => m.name).join(', ')}`);
    L.push(`Смета: ≈ ${fmt(d.est.total)}${d.est.monthly ? ` + ${fmt(d.est.monthly)}/мес` : ''}`);
    if (d.est.stages) L.push(`Этап 1: ${fmt(d.est.stages.s1Sum)}, этап 2: ${fmt(d.est.stages.s2Sum)}`);
  } else if (d.rec) L.push(`Рекомендация: ${d.rec.name} (${d.rec.price})`);
  if (d.a.urgency) L.push(`Старт: ${urgencyLabel(d.a.urgency)}`);
  return L.join('\n');
}

function SendBlock({ tg, phone, buildMessage, browsing }: { tg: string | null; phone: string | null; buildMessage: () => string; browsing: boolean }) {
  const [copied, setCopied] = useState(false);
  const waHref = phone ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(buildMessage())}` : null;
  const primaryHref = tg || waHref;
  const discuss = async () => {
    try { await navigator.clipboard.writeText(buildMessage()); } catch {}
    if (primaryHref) window.open(primaryHref, '_blank', 'noopener'); else { setCopied(true); setTimeout(() => setCopied(false), 2200); }
  };
  const save = async () => { try { await navigator.clipboard.writeText(buildMessage()); setCopied(true); setTimeout(() => setCopied(false), 2200); } catch {} };
  const discussBtn = <button className={styles.ctaPrimary} onClick={discuss}>{browsing ? 'Всё-таки обсудить сейчас' : 'Обсудить и забрать слот'}</button>;
  const saveBtn = <button className={browsing ? styles.ctaPrimary : styles.ctaSecondary} onClick={save}>Сохранить смету</button>;
  return (
    <div className={styles.send}>
      {browsing ? <>{saveBtn}{discussBtn}</> : <>{discussBtn}{saveBtn}</>}
      {phone && <a className={styles.ctaGhost} href={`tel:${phone.replace(/[^\d+]/g, '')}`}>Позвонить {phone}</a>}
      {copied && <div className={styles.sendHint}>Смета скопирована — пришлите её мне в чат, ничего не пропадёт</div>}
      {!copied && <div className={styles.sendHint}>{browsing ? 'Смета останется по этой ссылке' : 'Напишу в Telegram — обсудим детали и согласуем старт'}</div>}
    </div>
  );
}

function CopyRow({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button className={styles.reqRow} onClick={async () => { try { await navigator.clipboard.writeText(value); setCopied(true); setTimeout(() => setCopied(false), 1400); } catch {} }}>
      <span className={styles.reqLabel}>{label}</span>
      <span className={styles.reqValue}>{value}</span>
      <span className={styles.reqCopy}>{copied ? 'скопировано' : 'копировать'}</span>
    </button>
  );
}
