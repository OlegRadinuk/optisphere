export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  contentHtml: string;
}

type Locale = 'ru' | 'en';

const POSTS: Record<string, Record<Locale, Omit<BlogPost, 'slug'>>> = {
  'ai-assistant-for-hotel': {
    ru: {
      title: 'AI-ассистент для гостиницы: как мы сократили 70% входящих звонков',
      excerpt: 'Кейс Life Style Crimea: чат-бот Sofia отвечает на вопросы гостей 24/7, синхронизирован с 273 реальными бронированиями и освободил администраторов от рутины.',
      category: 'Кейсы',
      date: '24 апреля 2026',
      readTime: '6 мин',
      contentHtml: `
<p>Когда владелец комплекса апартаментов <strong>Life Style Crimea</strong> обратился к нам, у него была типичная проблема малого бизнеса: телефон звонит не переставая, администраторы тратят 80% времени на одни и те же вопросы — «свободно ли на такие-то даты?», «есть ли парковка?», «можно с животными?».</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Что мы сделали</h2>
<p>За 3 дня мы развернули AI-ассистента <strong>Sofia</strong> на базе Claude AI. Ключевые особенности:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li><strong>Реальная доступность.</strong> Bot подключён к базе данных с 273 бронированиями из Travelline. Когда гость спрашивает «свободно ли с 15 по 20 мая?», бот проверяет реальные данные, а не отвечает «уточните у менеджера».</li>
  <li><strong>40 апартаментов.</strong> Бот знает каждый объект: площадь, этаж, вид из окна, цену в высокий и низкий сезон, правила заезда.</li>
  <li><strong>Парковка и услуги.</strong> Стоимость парковки, правила питомцев, time check-in — всё доступно мгновенно.</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Результаты за первый месяц</h2>
<p>После запуска зафиксировали:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>70% вопросов гостей закрываются ботом без участия человека</li>
  <li>Рост онлайн-броней на <strong>+34%</strong> — гости получают ответ в любое время суток и сразу бронируют</li>
  <li>Администраторы сосредоточились на сложных запросах и живом сервисе</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Сколько стоит и как быстро</h2>
<p>Интеграция заняла <strong>3 рабочих дня</strong>. Стоимость — от 60 000 ₽ единовременно + подписка Orbit 8 000 ₽/мес. Окупаемость по опыту Life Style Crimea — 6–8 недель.</p>

<p>Если у вас отель, гостевой дом или апартаменты — AI-ассистент это не роскошь, а конкурентное преимущество. Гости всё чаще выбирают объекты, где можно получить ответ мгновенно, а не ждать ответа на почту.</p>
`,
    },
    en: {
      title: 'AI Assistant for a Hotel: How We Reduced 70% of Incoming Calls',
      excerpt: 'Life Style Crimea case: chatbot Sofia answers guest questions 24/7, synced with 273 real bookings, freeing administrators from routine.',
      category: 'Cases',
      date: 'April 24, 2026',
      readTime: '6 min',
      contentHtml: `
<p>When the owner of <strong>Life Style Crimea</strong> apartment complex came to us, they had a typical small business problem: the phone never stops ringing, and administrators spend 80% of their time on the same questions — "are you available on these dates?", "is there parking?", "can we bring pets?"</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">What We Did</h2>
<p>In 3 days we deployed AI assistant <strong>Sofia</strong> powered by Claude AI. Key features:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li><strong>Real availability.</strong> The bot connects to the database with 273 bookings from Travelline. When a guest asks "is it available May 15–20?", the bot checks real data instead of saying "please contact the manager".</li>
  <li><strong>40 apartments.</strong> The bot knows each property: area, floor, view, prices in high and low season, check-in rules.</li>
  <li><strong>Parking and services.</strong> Parking cost, pet policies, early check-in — all instantly available.</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Results After the First Month</h2>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>70% of guest questions resolved by the bot without human involvement</li>
  <li>Online bookings grew by <strong>+34%</strong> — guests get answers at any time of day and book immediately</li>
  <li>Administrators focused on complex requests and live service</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Cost and Timeline</h2>
<p>Integration took <strong>3 business days</strong>. Cost — from ₽60,000 one-time + Orbit subscription ₽8,000/month. ROI based on Life Style Crimea experience — 6–8 weeks.</p>
`,
    },
  },

  'yandex-direct-flowers-crimea': {
    ru: {
      title: 'Яндекс.Директ для цветочного магазина: 189 кликов за 9 497 ₽',
      excerpt: 'Разбираем кейс Lilit Flowers Crimea — как мы запустили 4 рекламных кампании, получили 3.2% конверсию и снизили стоимость лида до 1 583 ₽.',
      category: 'Реклама',
      date: '22 апреля 2026',
      readTime: '8 мин',
      contentHtml: `
<p><strong>Lilit Flowers Crimea</strong> — небольшой цветочный магазин в Симферополе. Задача: привлечь клиентов на заказ авторских букетов через Яндекс.Директ с ограниченным бюджетом.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Структура кампаний</h2>
<p>Мы запустили <strong>4 кампании</strong>:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li><strong>Букеты на заказ</strong> — горячие запросы типа «купить букет Симферополь», «цветы на день рождения»</li>
  <li><strong>Авторские букеты</strong> — премиальный сегмент, ЦА с более высоким чеком</li>
  <li><strong>Оптовые закупки</strong> — B2B сегмент, отели и рестораны</li>
  <li><strong>Ретаргетинг</strong> — возврат посетителей, которые не оформили заказ</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Ключевые решения</h2>
<p><strong>Минус-слова.</strong> Добавили 74 минус-слова, включая «искусственные», «шелковые», «своими руками», «фото» — они съедают бюджет без конверсий.</p>
<p><strong>Геотаргетинг.</strong> Настроили повышающие корректировки для Симферополя +20%, исключили нецелевые регионы.</p>
<p><strong>Расписание.</strong> Отключили показы с 23:00 до 7:00 — магазин не принимает заказы, клики только тратят деньги.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Результаты</h2>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Клики</td>
    <td style="padding: 12px 0; color: var(--op-text); font-weight: 700; font-size: 16px;">189</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Бюджет</td>
    <td style="padding: 12px 0; color: var(--op-text); font-weight: 700; font-size: 16px;">9 497 ₽</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Конверсия</td>
    <td style="padding: 12px 0; color: var(--op-text); font-weight: 700; font-size: 16px;">3.2%</td>
  </tr>
  <tr>
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Стоимость лида</td>
    <td style="padding: 12px 0; color: var(--op-accent); font-weight: 700; font-size: 16px;">1 583 ₽</td>
  </tr>
</table>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Что было сломано на сайте</h2>
<p>В ходе аудита обнаружили критическую проблему: кнопка «Заказ в 1 клик» не работала на мобильных устройствах — 67% трафика теряло возможность оставить заявку. После исправления конверсия выросла ещё на 0.8%.</p>

<p><em>Вывод:</em> даже при небольшом бюджете правильная структура кампаний и технический аудит сайта дают измеримый результат.</p>
`,
    },
    en: {
      title: 'Yandex Direct for a Flower Shop: 189 Clicks for ₽9,497',
      excerpt: 'Breaking down the Lilit Flowers Crimea case — how we launched 4 ad campaigns, achieved 3.2% conversion, and reduced lead cost to ₽1,583.',
      category: 'Advertising',
      date: 'April 22, 2026',
      readTime: '8 min',
      contentHtml: `
<p><strong>Lilit Flowers Crimea</strong> — a small flower shop in Simferopol. Goal: attract clients for custom bouquet orders through Yandex Direct with a limited budget.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Campaign Structure</h2>
<p>We launched <strong>4 campaigns</strong>: custom bouquets (hot queries), author bouquets (premium segment), wholesale (B2B), and retargeting.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Results</h2>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Clicks</td>
    <td style="padding: 12px 0; color: var(--op-text); font-weight: 700;">189</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Budget</td>
    <td style="padding: 12px 0; color: var(--op-text); font-weight: 700;">₽9,497</td>
  </tr>
  <tr>
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Lead cost</td>
    <td style="padding: 12px 0; color: var(--op-accent); font-weight: 700;">₽1,583</td>
  </tr>
</table>
`,
    },
  },

  'seo-for-local-business-crimea': {
    ru: {
      title: 'SEO для малого бизнеса в Крыму: с чего начать в 2026 году',
      excerpt: 'Пошаговый гайд: как вывести сайт в топ Яндекса по Крыму без агентских бюджетов. Технический аудит, schema.org, Яндекс.Бизнес и первые шаги.',
      category: 'SEO',
      date: '20 апреля 2026',
      readTime: '10 мин',
      contentHtml: `
<p>Большинство малых бизнесов в Крыму не занимаются SEO совсем. Это означает, что даже базовая работа даёт конкурентное преимущество. В этой статье — практический план на первые 3 месяца.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Шаг 1. Технический аудит (неделя 1)</h2>
<p>Начните с <strong>Яндекс.Вебмастер</strong> и <strong>Google Search Console</strong> — оба бесплатны. Добавьте сайт и проверьте:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>Нет ли страниц с кодом ответа 4xx или 5xx</li>
  <li>Как сайт отображается на мобильных (Mobile-Friendly Test)</li>
  <li>Скорость загрузки (Google PageSpeed Insights — целевые LCP &lt; 2.5с)</li>
  <li>Есть ли дубли страниц (одна страница доступна по нескольким URL)</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Шаг 2. Яндекс.Бизнес (неделя 1-2)</h2>
<p>Это самый быстрый wins для локального SEO. Зарегистрируйтесь на <strong>business.yandex.ru</strong>, укажите:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>Точный адрес и режим работы</li>
  <li>Категории бизнеса (до 10 штук)</li>
  <li>Фотографии объекта (минимум 10 штук)</li>
  <li>Ссылку на сайт</li>
</ul>
<p>Карточка появляется в поиске Яндекса и на Яндекс.Картах. Для туристического бизнеса в Крыму — критично. Также добавьтесь в <strong>2GIS</strong> — для Крыма это второй по важности источник трафика.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Шаг 3. Schema.org LocalBusiness (неделя 2-3)</h2>
<p>Структурированные данные — это JSON-код, который вы добавляете на сайт. Яндекс читает его и отображает дополнительную информацию прямо в поисковой выдаче (адрес, часы, рейтинг).</p>
<p>Минимальный набор для локального бизнеса:</p>
<pre style="background: var(--op-surface); border: 1px solid var(--op-border); border-radius: 12px; padding: 20px; overflow-x: auto; font-size: 13px; line-height: 1.6;"><code>{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Название вашего бизнеса",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "ул. Примерная, 1",
    "addressLocality": "Симферополь",
    "addressRegion": "Республика Крым"
  },
  "telephone": "+7 978 000 00 00",
  "openingHours": "Mo-Su 09:00-21:00"
}</code></pre>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Шаг 4. Семантическое ядро (месяц 1)</h2>
<p>Используйте <strong>Яндекс.Вордстат</strong> (wordstat.yandex.ru) — он показывает реальные запросы пользователей. Для гостиницы в Крыму проверьте:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>«Гостиница Симферополь» — 28 000 показов/мес</li>
  <li>«Апартаменты Ялта снять» — 12 000 показов/мес</li>
  <li>«Отдых в Крыму с детьми» — 45 000 показов/мес</li>
</ul>
<p>Выберите 20-30 запросов, распределите по страницам сайта. Каждой странице — свой основной запрос.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Результаты через 3 месяца</h2>
<p>По опыту наших клиентов, базовая SEO-работа даёт:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>Появление в топ-10 по 10-20 низкочастотным запросам</li>
  <li>Рост органического трафика на 30-50%</li>
  <li>Первые позиции по брендовым запросам</li>
</ul>
<p>SEO — это не магия. Это систематическая работа, результат которой накапливается месяц за месяцем.</p>
`,
    },
    en: {
      title: 'SEO for Small Business in Crimea: Where to Start in 2026',
      excerpt: 'Step-by-step guide: how to rank your website in Yandex for Crimea without agency budgets. Technical audit, schema.org, Yandex Business, and first steps.',
      category: 'SEO',
      date: 'April 20, 2026',
      readTime: '10 min',
      contentHtml: `
<p>Most small businesses in Crimea don't do SEO at all. This means even basic work provides a competitive advantage. Here's a practical 3-month plan.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Step 1. Technical Audit (Week 1)</h2>
<p>Start with Yandex Webmaster and Google Search Console — both are free. Check for 4xx/5xx errors, mobile compatibility, page speed (target LCP &lt; 2.5s), and duplicate pages.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Step 2. Yandex Business (Week 1-2)</h2>
<p>Register at business.yandex.ru with your exact address, business categories, photos (at least 10), and website link. Also add your business to 2GIS — critical for Crimea traffic.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Results After 3 Months</h2>
<p>Based on our client experience: top-10 rankings for 10-20 long-tail queries, 30-50% organic traffic growth, and first positions for branded queries.</p>
`,
    },
  },

  'what-is-ai-assistant-for-business': {
    ru: {
      title: 'Что такое AI-ассистент для бизнеса и кому он нужен',
      excerpt: 'Объясняем простым языком: чем AI-чатбот отличается от обычного бота с кнопками, как он работает и за сколько окупается.',
      category: 'AI',
      date: '18 апреля 2026',
      readTime: '7 мин',
      contentHtml: `
<p>Когда мы говорим «AI-ассистент для бизнеса» — многие думают о роботе с кнопками «Да/Нет» или чат-боте из 2015 года, который не понимает нормальные предложения. Мы говорим о другом.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Чём бот с кнопками отличается от AI</h2>
<table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
  <tr style="border-bottom: 1px solid var(--op-border);">
    <th style="padding: 12px 16px 12px 0; text-align: left; color: var(--op-muted); font-weight: 600; font-size: 14px;">Обычный бот</th>
    <th style="padding: 12px 0; text-align: left; color: var(--op-muted); font-weight: 600; font-size: 14px;">AI-ассистент</th>
  </tr>
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Отвечает только на прописанные варианты</td>
    <td style="padding: 12px 0; color: var(--op-text); font-size: 14px;">Понимает свободную речь</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">«Не понимаю запрос»</td>
    <td style="padding: 12px 0; color: var(--op-text); font-size: 14px;">Уточняет, перефразирует, объясняет</td>
  </tr>
  <tr style="border-bottom: 1px solid var(--op-border);">
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Требует обновления при каждом изменении</td>
    <td style="padding: 12px 0; color: var(--op-text); font-size: 14px;">Получает контекст из базы данных в реальном времени</td>
  </tr>
  <tr>
    <td style="padding: 12px 16px 12px 0; color: var(--op-muted); font-size: 14px;">Подходит для FAQ с 10 вопросами</td>
    <td style="padding: 12px 0; color: var(--op-text); font-size: 14px;">Работает с тысячами сценариев</td>
  </tr>
</table>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Кому нужен AI-ассистент</h2>
<p>Ассистент нужен, если выполняется хотя бы одно из условий:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>Вы получаете <strong>10+ однотипных вопросов в день</strong> (наличие, цены, условия)</li>
  <li>Клиенты пишут <strong>после рабочего времени</strong>, и вы отвечаете с опозданием</li>
  <li>Вы теряете заявки, потому что менеджер не успевает отвечать</li>
  <li>У вас <strong>сезонный бизнес</strong> с пиковой нагрузкой (лето в Крыму — классика)</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Как это работает технически</h2>
<p>Мы используем <strong>Claude AI</strong> от Anthropic — одну из лучших языковых моделей на рынке. Ассистент получает «системный промпт» — описание вашего бизнеса, продуктов, правил общения. Дополнительно подключается контекст из вашей базы данных: наличие товара, расписание, цены.</p>
<p>Каждый разговор уникален, но ассистент всегда действует в рамках вашей бизнес-логики.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Сколько стоит и когда окупается</h2>
<p>Средняя стоимость внедрения для малого бизнеса — <strong>60 000–150 000 ₽</strong> единовременно + подписка 8 000 ₽/мес (наш Orbit). По опыту наших клиентов окупаемость наступает за 6–10 недель за счёт:</p>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>Экономии 2–3 часов работы менеджера в день</li>
  <li>Роста конверсии из-за мгновенных ответов 24/7</li>
  <li>Снижения оттока: клиент не уходит к конкуренту, пока ждёт ответа</li>
</ul>
`,
    },
    en: {
      title: 'What Is an AI Assistant for Business and Who Needs It',
      excerpt: 'Plain language explanation: how an AI chatbot differs from a button bot, how it works, and when it pays off.',
      category: 'AI',
      date: 'April 18, 2026',
      readTime: '7 min',
      contentHtml: `
<p>When we say "AI assistant for business" — many think of a robot with Yes/No buttons or a 2015-era chatbot that doesn't understand normal sentences. We're talking about something different.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Who Needs an AI Assistant</h2>
<p>You need one if at least one condition is true: you get 10+ identical questions per day, clients write after hours, you lose leads because managers can't respond fast enough, or you have a seasonal business with peak loads.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Cost and ROI</h2>
<p>Average implementation cost for small business — ₽60,000–150,000 one-time + ₽8,000/month subscription. Our clients typically see ROI in 6–10 weeks through manager time savings and conversion growth from instant 24/7 responses.</p>
`,
    },
  },

  'website-for-crimea-tourism-business': {
    ru: {
      title: 'Сайт для туристического бизнеса в Крыму: что работает в 2026',
      excerpt: 'Разбираем, какие элементы сайта влияют на бронирование. Фото, форма, AI-ассистент, скорость — что важно для гостиниц, апартаментов и экскурсий.',
      category: 'Сайты',
      date: '15 апреля 2026',
      readTime: '9 мин',
      contentHtml: `
<p>Турбизнес в Крыму — одна из самых конкурентных ниш. Гость делает выбор, просматривая 5-10 сайтов параллельно. Что заставляет его остановиться именно на вашем?</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Что убивает конверсию</h2>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li><strong>Медленная загрузка.</strong> Каждая дополнительная секунда — минус 7% конверсии (исследование Google). На мобильном телефоне с 4G в Крыму это критично.</li>
  <li><strong>Нет актуальных цен.</strong> «Цена по запросу» = «клиент закрыл сайт». Укажите хотя бы диапазон.</li>
  <li><strong>Нет онлайн-бронирования.</strong> Если нельзя забронировать прямо сейчас — многие уходят на агрегатор.</li>
  <li><strong>Плохие фото.</strong> Это туристическая ниша. Темные, мутные фото из 2018 года — антиконверсия.</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Что работает</h2>
<p><strong>1. Первый экран решает всё.</strong> У вас есть 3 секунды. Крупная фотография объекта, название, локация и кнопка «Проверить наличие» — этого достаточно.</p>
<p><strong>2. Фотографии — главный контент.</strong> Для апартаментов или отеля фото важнее текстов. Минимум 15-20 фотографий каждого объекта: интерьер, вид из окна, детали.</p>
<p><strong>3. Социальное доказательство.</strong> Отзывы с фото, оценки с сайтов-агрегаторов (если есть), количество гостей за сезон. Конкретные цифры работают лучше общих фраз.</p>
<p><strong>4. AI-ассистент как конкурентное преимущество.</strong> Гость написал в 23:00: «свободно ли с 10 по 15 июля?» — бот с реальной базой бронирований ответит мгновенно. Конкурент без бота — нет.</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Технические требования для туристического сайта</h2>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>LCP (загрузка главного контента) &lt; 2.5 секунды</li>
  <li>WebP-формат для всех изображений (в 3 раза легче JPEG при том же качестве)</li>
  <li>HTTPS обязателен — Яндекс понижает сайты без SSL</li>
  <li>Мобильная версия = приоритет (60%+ трафика с телефонов)</li>
  <li>Форма бронирования или заявки на каждой странице</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Реальный пример</h2>
<p>Life Style Crimea: до редизайна конверсия сайта была менее 1%. После работы над скоростью, фотографиями и добавления AI-ассистента Sofia — онлайн-бронирования выросли на 34% за первые 6 недель.</p>
<p>Ключевые изменения: сжатие фотографий с WebP, форма заявки на главной странице (раньше была только на отдельной вкладке), AI-ассистент для мгновенных ответов о наличии.</p>
`,
    },
    en: {
      title: 'Website for Tourism Business in Crimea: What Works in 2026',
      excerpt: 'We break down which website elements affect bookings. Photos, forms, AI assistant, speed — what matters for hotels, apartments, and tours.',
      category: 'Websites',
      date: 'April 15, 2026',
      readTime: '9 min',
      contentHtml: `
<p>Tourism in Crimea is one of the most competitive niches. Guests browse 5-10 websites simultaneously. What makes them stop at yours?</p>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">What Kills Conversion</h2>
<ul style="margin: 16px 0 24px; padding-left: 24px; display: flex; flex-direction: column; gap: 10px;">
  <li>Slow loading — each extra second costs 7% conversion</li>
  <li>No current prices — "price on request" means the client left</li>
  <li>No online booking — many go to aggregators instead</li>
  <li>Poor photos — this is the tourism niche, photos matter most</li>
</ul>

<h2 style="font-size: 24px; font-weight: 700; color: var(--op-text); margin: 40px 0 16px;">Real Example</h2>
<p>Life Style Crimea: before redesign, conversion was below 1%. After improving speed, photos, and adding the Sofia AI assistant — online bookings grew +34% in the first 6 weeks.</p>
`,
    },
  },
};

export function getAllPosts(locale: Locale): BlogPost[] {
  return Object.entries(POSTS).map(([slug, localeData]) => ({
    slug,
    ...localeData[locale],
  })).sort((a, b) => {
    const parseDate = (d: string) => new Date(d.replace(/(\d+) (\w+) (\d+)/, '$3-$2-$1')).getTime();
    return parseDate(b.date) - parseDate(a.date);
  });
}

export function getPostBySlug(slug: string, locale: Locale): BlogPost | null {
  const post = POSTS[slug];
  if (!post) return null;
  return { slug, ...post[locale] };
}
