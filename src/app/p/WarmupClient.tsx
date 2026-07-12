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

// ─── КЛИНИКА: что нужно на сайте (мультивыбор → отсюда цена) ───
const CLINIC_NEEDS: { key: string; label: string; heavy?: boolean }[] = [
  { key: 'services', label: 'Услуги и цены' },
  { key: 'doctors', label: 'Врачи — фото, регалии' },
  { key: 'booking', label: 'Онлайн-запись' },
  { key: 'reviews', label: 'Отзывы и доверие' },
  { key: 'blog', label: 'Блог / статьи (SEO)' },
  { key: 'assistant', label: 'AI-ассистент 24/7 — отвечает и записывает', heavy: true },
  { key: 'calc', label: 'Калькулятор стоимости лечения', heavy: true },
  { key: 'branches', label: 'Несколько филиалов', heavy: true },
  { key: 'mis', label: 'Интеграция с МИС / CRM', heavy: true },
];
const CLINIC_BASE = ['services', 'doctors', 'booking', 'reviews', 'blog'];
const CLINIC_HEAVY = ['assistant', 'calc', 'branches', 'mis'];
const needLabel = (k: string) => CLINIC_NEEDS.find((n) => n.key === k)?.label ?? k;

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
  needs: string[];
  task?: string;
  scale?: string;
  assistant?: string;
  urgency?: string;
}

const EMPTY: Answers = { situation: [], pains: [], needs: [] };

// ─── Рекомендация + цена ───
interface Rec { name: string; price: string; desc: string; addon: string | null; note: string | null }
function buildRecommendation(a: Answers): Rec | null {
  if (!a.niche) return null;
  if (a.niche === 'clinic') {
    const heavy = a.needs.some((n) => CLINIC_HEAVY.includes(n));
    const baseCount = a.needs.filter((n) => CLINIC_BASE.includes(n)).length;
    const addon = a.needs.includes('assistant') ? 'AI-ассистент «Опти» — отвечает и записывает пациентов 24/7' : null;
    if (heavy) {
      return { name: 'Сайт клиники + система', price: 'от 120 000 ₽', desc: 'Полноценный сайт плюс то, что вы отметили — ассистент, калькулятор, филиалы, интеграции. Это уже система привлечения и записи, а не просто сайт.', addon, note: null };
    }
    if (baseCount >= 2 || a.needs.length === 0) {
      return { name: 'Сайт клиники', price: 'от 75 000 ₽', desc: 'Главная, услуги с ценами, врачи, онлайн-запись, отзывы. Проектирую от кнопки «Записаться», а не от красоты.', addon, note: a.needs.length === 0 ? 'Точный состав подберём на коротком звонке.' : null };
    }
    return { name: 'Лендинг для клиники', price: 'от 50 000 ₽', desc: 'Одна страница под конкретную услугу или направление. Быстрый старт, структура под запись.', addon, note: null };
  }
  // прочие ниши
  const meta = OTHER_NICHES[a.niche];
  if (a.scale === 'multi') return { name: meta.multiName, price: 'от 75 000 ₽', desc: meta.multiDesc, addon: null, note: null };
  if (a.scale === 'unknown') return { name: meta.multiName, price: 'от 75 000 ₽', desc: meta.multiDesc, addon: null, note: 'На звонке покажу и лендинг, и многостраничник — что выгоднее под задачу.' };
  return { name: 'Лендинг «Старт»', price: 'от 50 000 ₽', desc: 'Одна страница под одну задачу. Структура от заявки, не от красоты.', addon: null, note: null };
}

function scoreLead(a: Answers): 'hot' | 'warm' | 'cold' {
  const clinicScope = a.niche === 'clinic' && (a.needs.some((n) => CLINIC_HEAVY.includes(n)) || a.needs.filter((n) => CLINIC_BASE.includes(n)).length >= 2);
  const otherScope = a.scale === 'multi';
  if (a.urgency === 'asap' && (clinicScope || otherScope || a.niche === 'clinic')) return 'hot';
  if (a.urgency === 'browsing' || a.scale === 'unknown') return 'cold';
  return 'warm';
}

// ─── Клиника: кейс + FAQ ───
const CLINIC_CASE = { title: 'Медцентр Хакимовых, Симферополь', body: 'Многостраничный сайт: главная, 12 направлений, страницы врачей, онлайн-запись. Раньше — только телефон и сарафан. Теперь пациенты приходят подготовленными, зная врача по имени.' };
const CLINIC_FAQ: { q: string; a: string }[] = [
  { q: 'Сколько времени займёт?', a: 'Лендинг — 2–3 недели. Полный сайт клиники с услугами и врачами — 4–6 недель. Сроки фиксирую в договоре до старта.' },
  { q: 'Пробовали сайт — он не давал записей', a: 'Чаще дело не в дизайне, а в структуре: непонятно куда нажать, нет онлайн-записи, грузится долго. Смотрю это в первую очередь — пришлите ссылку, скажу что вижу.' },
  { q: 'Нужна интеграция с МИС / CRM?', a: 'Типовые интеграции с популярными МИС — да. Нетипичные обсуждаем отдельно. Напишите какая система — отвечу сразу.' },
  { q: 'А лицензия и мед. требования на сайте?', a: 'Размещаем сведения о лицензии, реквизиты, нужные разделы — сайт клиники делаю с учётом требований к меддеятельности.' },
  { q: 'Данные пациентов — это безопасно?', a: 'Формы и запись — с согласием на обработку ПД по 152-ФЗ, данные на серверах в РФ. Всё по закону.' },
];

export default function WarmupClient() {
  const sp = useSearchParams();

  const to = sp.get('to')?.trim() || null;
  const company = (sp.get('company') || sp.get('clinic'))?.trim() || null;
  // Дефолт — личный TG Олега; параметром ?tg= можно переопределить (или ?tg=off убрать)
  const tgParam = sp.get('tg')?.trim();
  const tg = tgParam === 'off' ? null : tgParam || 'https://t.me/aleg_rad';
  const phone = sp.get('phone')?.trim() || null;
  const mode = sp.get('mode')?.trim() || 'warm';

  const [a, setA] = useState<Answers>(EMPTY);
  const [pace, setPace] = useState('');
  const [note, setNote] = useState('');
  const [haveItems, setHaveItems] = useState<string[]>([]);

  const isClinic = a.niche === 'clinic';

  const flow = useMemo(() => {
    const f: string[] = ['niche', 'situation'];
    if (a.niche === 'clinic') f.push('pains', 'needs');
    else if (a.niche) { f.push('task', 'scale'); if (OTHER_NICHES[a.niche].hasAssistant) f.push('assistant'); }
    if (a.niche) f.push('urgency', 'brief', 'final');
    return f;
  }, [a.niche]);

  const questionIds = flow.filter((s) => !['brief', 'final'].includes(s));
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
  const toggleMulti = (field: 'situation' | 'pains' | 'needs', value: string) => {
    setA((p) => {
      const arr = p[field];
      return { ...p, [field]: arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value] };
    });
  };

  const niche = a.niche ?? null;
  const rec = useMemo(() => buildRecommendation(a), [a]);
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
    const payload = {
      name: to || undefined,
      company: company || (a.niche === 'other' ? a.otherBiz : undefined) || undefined,
      niche: a.niche === 'clinic' ? 'Медицина / клиника' : OTHER_NICHES[a.niche].label,
      situation: a.situation.length ? a.situation.join(', ') : undefined,
      task: isClinic
        ? (a.pains.length ? a.pains.map((k) => CLINIC_PAINS.find((p) => p.key === k)?.label ?? k).join('; ') : undefined)
        : a.task,
      scale: isClinic
        ? (a.needs.length ? a.needs.map(needLabel).join(', ') : undefined)
        : (a.scale ? SCALE.find((s) => s.key === a.scale)?.label : undefined),
      urgency: urgencyLabel(a.urgency),
      recommendation: rec ? `${rec.name} — ${rec.price}${rec.addon ? ' + ассистент' : ''}` : undefined,
      brief: { have: haveItems.length ? haveItems : undefined, pace: pace || undefined, note: note.trim() || undefined },
      score: scoreLead(a),
      source,
    };
    fetch('/api/leads/warmup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), keepalive: true }).catch(() => {});
  }, [current, a, rec, to, company, sp, haveItems, pace, note, isClinic, mode]);

  // «Дальше» нужен на мультивыборах, шкале, ассистенте, брифе и при выборе «другой бизнес»
  const manualNext = ['situation', 'pains', 'needs', 'scale', 'assistant', 'brief'].includes(current)
    || (current === 'niche' && a.niche === 'other');
  const nextDisabled =
    (current === 'situation' && a.situation.length === 0) ||
    (current === 'pains' && a.pains.length === 0) ||
    (current === 'needs' && a.needs.length === 0) ||
    (current === 'scale' && !a.scale) ||
    (current === 'assistant' && !a.assistant) ||
    (current === 'niche' && a.niche === 'other' && !a.otherBiz?.trim());

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

      <main className={styles.content}>
        <div key={idx} className={dir === 1 ? styles.slideIn : styles.slideInBack}>

          {/* ── Ниша ── */}
          {current === 'niche' && (
            <div className={styles.center}>
              {mode === 'cold' ? (
                <>
                  <span className={styles.eyebrow}>Персональный подбор · 1 минута</span>
                  <h1 className={styles.h1}>Подберём сайт под ваш бизнес <span className={styles.accent}>за минуту</span></h1>
                  <p className={styles.lede}>Без звонков и менеджеров. Если вы решаете по сайту{company ? <> в «{company}»</> : null} — ответьте на пару вопросов, покажу вариант и ориентир по бюджету.</p>
                </>
              ) : (
                <>
                  {to && <span className={styles.eyebrow}>{to}, это лично для вас</span>}
                  <h1 className={styles.h1}>Продолжаю наш разговор — собрал <span className={styles.accent}>под вас</span></h1>
                  <p className={styles.lede}>{company ? <>Для «{company}» — </> : null}5 вопросов, и увидите рекомендацию с ориентиром по бюджету. Это уже мини-бриф: чем точнее ответите, тем точнее предложение.</p>
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
              <h2 className={styles.h2}>Как сейчас приходят клиенты?</h2>
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

          {/* ── Клиника: что нужно (мультивыбор → цена) ── */}
          {current === 'needs' && (
            <div>
              <h2 className={styles.h2}>Что важно, чтобы было на сайте?</h2>
              <p className={styles.sub}>Отметьте нужное — из этого соберу рекомендацию и бюджет</p>
              <div className={styles.answers}>
                {CLINIC_NEEDS.map((n) => (
                  <button key={n.key} aria-pressed={a.needs.includes(n.key)} className={`${styles.answer} ${a.needs.includes(n.key) ? styles.answerOn : ''}`} onClick={() => toggleMulti('needs', n.key)}>{n.label}</button>
                ))}
              </div>
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
              a={a} isClinic={isClinic} rec={rec} tg={tg} phone={phone}
              buildMessage={() => buildContactMessage({ to, company, a, rec, isClinic })}
            />
          )}
        </div>
      </main>

      {/* НАВИГАЦИЯ */}
      {current !== 'final' && (
        <footer className={styles.navbar}>
          {idx > 0 && <button className={styles.back} onClick={back} aria-label="Назад">←</button>}
          {manualNext ? (
            <button className={styles.next} onClick={next} disabled={nextDisabled}>
              {current === 'brief' ? 'Показать рекомендацию' : 'Дальше'} <span aria-hidden>→</span>
            </button>
          ) : (
            <div className={styles.navHintFull}>{current === 'niche' ? 'Выберите вариант' : 'Выберите ответ'}</div>
          )}
        </footer>
      )}

      {/* ПЛАВАЮЩАЯ КНОПКА СВЯЗИ */}
      {idx >= 1 && current !== 'final' && (tg || phone) && (
        <a className={styles.fab} href={tg || `tel:${(phone || '').replace(/[^\d+]/g, '')}`} target={tg ? '_blank' : undefined} rel="noopener noreferrer">Написать Олегу</a>
      )}
    </div>
  );
}

function FinalScreen({ a, isClinic, rec, tg, phone, buildMessage }: {
  a: Answers; isClinic: boolean; rec: Rec | null; tg: string | null; phone: string | null; buildMessage: () => string;
}) {
  const browsing = a.urgency === 'browsing';
  const caseItem = isClinic ? CLINIC_CASE : (a.niche && a.niche !== 'clinic' ? OTHER_NICHES[a.niche].cases[0] : CLINIC_CASE);
  const faq = isClinic ? CLINIC_FAQ : (a.niche && a.niche !== 'clinic' ? OTHER_NICHES[a.niche].faq : CLINIC_FAQ);

  return (
    <div>
      <div className={styles.kicker}><span className={styles.kickerN}>✓</span>Подбор готов</div>
      <h2 className={styles.h2}>{browsing ? 'Собрал смету — вернётесь, когда будет время' : 'Вот что подходит под ваш запрос'}</h2>

      {rec && (
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
        <div className={styles.recCaseLabel}>Похожий проект</div>
        <div className={styles.recCaseTitle}>{caseItem.title}</div>
        <div className={styles.recCaseBody}>{caseItem.body}</div>
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

function buildContactMessage(d: { to: string | null; company: string | null; a: Answers; rec: Rec | null; isClinic: boolean }): string {
  const L: string[] = ['Здравствуйте, Олег! Прошёл подбор на персональной странице.'];
  if (d.company) L.push(`Компания: ${d.company}`);
  else if (d.a.niche === 'other' && d.a.otherBiz) L.push(`Бизнес: ${d.a.otherBiz}`);
  L.push(`Ниша: ${d.isClinic ? 'Клиника' : (d.a.niche && d.a.niche !== 'clinic' ? OTHER_NICHES[d.a.niche].label : '')}`);
  if (d.a.situation.length) L.push(`Сейчас клиенты: ${d.a.situation.join(', ')}`);
  if (d.isClinic && d.a.needs.length) L.push(`Нужно на сайте: ${d.a.needs.map(needLabel).join(', ')}`);
  if (d.rec) L.push(`Рекомендация: ${d.rec.name} (${d.rec.price})`);
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
      {copied && <div className={styles.sendHint}>Смета скопирована — пришлите её мне в чат, ничего не пропадёт ✓</div>}
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
      <span className={styles.reqCopy}>{copied ? 'скопировано ✓' : 'копировать'}</span>
    </button>
  );
}
