const BASE_URL = 'https://optisphere.tech'

// ─── Websites service ────────────────────────────────────────────────────────

export const websitesServiceSchema = (locale: string): object => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name: locale === 'ru' ? 'Создание сайтов под ключ' : 'Custom Website Development',
  description:
    locale === 'ru'
      ? 'Разрабатываем продающие сайты для малого бизнеса. Лендинги, многостраничники, сайты с AI-ассистентом. Симферополь, Крым, вся Россия.'
      : 'We build conversion-focused websites for small businesses. Landing pages, multi-page sites with built-in AI assistant.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Optisphere',
    url: BASE_URL,
  },
  areaServed: locale === 'ru' ? ['Крым', 'Россия'] : ['Crimea', 'Russia'],
  inLanguage: locale === 'ru' ? 'ru-RU' : 'en-US',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '50000',
    highPrice: '500000',
    priceCurrency: 'RUB',
    offerCount: '4',
  },
})

// ─── AI Assistants service ────────────────────────────────────────────────────

export const aiAssistantsServiceSchema = (locale: string): object => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name:
    locale === 'ru'
      ? 'AI-ассистент для бизнеса'
      : 'AI Assistant for Business',
  description:
    locale === 'ru'
      ? 'Создаём AI-ассистентов для сайтов: отвечают на вопросы, принимают заявки, работают 24/7. Интеграция с любым сайтом за 1 день.'
      : 'We build AI assistants for websites: answer questions, capture leads, work 24/7. Integration with any website in 1 day.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Optisphere',
    url: BASE_URL,
  },
  areaServed: locale === 'ru' ? ['Крым', 'Россия'] : ['Crimea', 'Russia'],
  inLanguage: locale === 'ru' ? 'ru-RU' : 'en-US',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '15000',
    highPrice: '80000',
    priceCurrency: 'RUB',
    offerCount: '3',
  },
})

// ─── SEO service ──────────────────────────────────────────────────────────────

export const seoServiceSchema = (locale: string): object => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name:
    locale === 'ru'
      ? 'SEO-продвижение сайта'
      : 'SEO Promotion',
  description:
    locale === 'ru'
      ? 'Продвигаем сайты в Яндексе и Google. Семантика, мета-теги, Schema.org, технический SEO-аудит. Крым, Симферополь.'
      : 'We promote websites in Yandex and Google. Semantics, meta tags, Schema.org, technical SEO audit.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Optisphere',
    url: BASE_URL,
  },
  areaServed: locale === 'ru' ? ['Крым', 'Россия'] : ['Crimea', 'Russia'],
  inLanguage: locale === 'ru' ? 'ru-RU' : 'en-US',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '20000',
    highPrice: '60000',
    priceCurrency: 'RUB',
    offerCount: '3',
  },
})

// ─── Yandex Direct service ────────────────────────────────────────────────────

export const yandexDirectServiceSchema = (locale: string): object => ({
  '@context': 'https://schema.org',
  '@type': 'Service',
  name:
    locale === 'ru'
      ? 'Настройка Яндекс.Директ'
      : 'Yandex Direct Setup',
  description:
    locale === 'ru'
      ? 'Настраиваем контекстную рекламу в Яндекс.Директ: сбор семантики, создание объявлений, аналитика. Работаем с малым бизнесом в Крыму и России.'
      : 'We set up contextual advertising in Yandex Direct: keyword research, ad creation, analytics.',
  provider: {
    '@type': 'LocalBusiness',
    name: 'Optisphere',
    url: BASE_URL,
  },
  areaServed: locale === 'ru' ? ['Крым', 'Россия'] : ['Crimea', 'Russia'],
  inLanguage: locale === 'ru' ? 'ru-RU' : 'en-US',
  offers: {
    '@type': 'AggregateOffer',
    lowPrice: '15000',
    highPrice: '50000',
    priceCurrency: 'RUB',
    offerCount: '3',
  },
})

// ─── FAQ schemas ──────────────────────────────────────────────────────────────

export const faqWebsitesSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Сколько стоит создание сайта?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Лендинг — от 50 000 ₽ за 3-5 дней. Многостраничный сайт — от 120 000 ₽ за 5-10 дней. В каждый сайт включён AI-ассистент Опти.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как долго делается сайт?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Лендинг — 3-7 дней. Многостраничный сайт с CMS — 2-4 недели. Срочная разработка возможна по договорённости.',
      },
    },
    {
      '@type': 'Question',
      name: 'Работаете ли вы с клиентами из других городов России?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, работаем удалённо по всей России и СНГ. Основной офис в Симферополе (Крым), но географических ограничений нет.',
      },
    },
    {
      '@type': 'Question',
      name: 'Входит ли хостинг в стоимость?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Мы помогаем с выбором и настройкой хостинга. Стоимость хостинга — от 300 ₽/мес, оплачивается отдельно напрямую провайдеру.',
      },
    },
  ],
}

export const faqAiAssistantsSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'На каком движке работает AI-ассистент?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Используем собственную платформу Optisphere с поддержкой GPT-4 и Claude. Ассистент обучается на данных вашего бизнеса.',
      },
    },
    {
      '@type': 'Question',
      name: 'Как долго занимает интеграция?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Базовая интеграция — 1 день. Полная настройка с обучением на ваших данных — 3-5 дней.',
      },
    },
    {
      '@type': 'Question',
      name: 'Работает ли ассистент в Telegram?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Да, ассистент можно подключить к Telegram-боту, сайту и другим каналам одновременно.',
      },
    },
  ],
}

export const faqSeoSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Сколько времени нужно для выхода в ТОП Яндекса?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Первые результаты заметны через 2-3 месяца. Стабильные позиции в ТОП-10 — через 4-6 месяцев при регулярной работе.',
      },
    },
    {
      '@type': 'Question',
      name: 'Вы продвигаете в Яндексе или Google?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'В обоих поисковиках. Для РФ и Крыма приоритет — Яндекс, но Google тоже охватываем.',
      },
    },
  ],
}
