import type { Metadata } from 'next'

const BASE_URL = 'https://optisphere.tech'
const SITE_NAME = 'Optisphere'

type PageSEO = {
  titleRu: string
  titleEn: string
  descRu: string
  descEn: string
  path: string
  keywordsRu?: string[]
}

export function buildMetadata(locale: string, seo: PageSEO): Metadata {
  const isRu = locale === 'ru'
  const title = isRu ? seo.titleRu : seo.titleEn
  const description = isRu ? seo.descRu : seo.descEn
  const canonicalPath = isRu ? seo.path : `/en${seo.path}`
  const canonical = `${BASE_URL}${canonicalPath}`

  return {
    title,
    description,
    ...(isRu && seo.keywordsRu ? { keywords: seo.keywordsRu } : {}),
    alternates: {
      canonical,
      languages: {
        ru: `${BASE_URL}${seo.path}`,
        en: `${BASE_URL}/en${seo.path}`,
      },
    },
    openGraph: {
      siteName: SITE_NAME,
      locale: isRu ? 'ru_RU' : 'en_US',
      type: 'website',
      title,
      description,
      url: canonical,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

export function buildServiceSchema(
  locale: string,
  service: {
    name: string
    nameEn: string
    description: string
    descriptionEn: string
    price?: string
    priceHigh?: string
  }
): object {
  const isRu = locale === 'ru'
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: isRu ? service.name : service.nameEn,
    description: isRu ? service.description : service.descriptionEn,
    provider: {
      '@type': 'LocalBusiness',
      name: SITE_NAME,
      url: BASE_URL,
    },
    areaServed: isRu ? ['Крым', 'Россия'] : ['Crimea', 'Russia'],
    inLanguage: isRu ? 'ru-RU' : 'en-US',
  }

  if (service.price) {
    schema.offers = {
      '@type': 'AggregateOffer',
      lowPrice: service.price,
      ...(service.priceHigh ? { highPrice: service.priceHigh } : {}),
      priceCurrency: 'RUB',
    }
  }

  return schema
}

export function buildFaqSchema(faqs: Array<{ q: string; a: string }>): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: a,
      },
    })),
  }
}

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
