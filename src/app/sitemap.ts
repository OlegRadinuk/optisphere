import { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

const BASE_URL = 'https://optisphere.tech'

// lastmod — date of last meaningful content update
const LAST_MOD = '2026-04-28'

type ChangeFreq =
  | 'always'
  | 'hourly'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'yearly'
  | 'never'

type PageEntry = {
  path: string
  priority: number
  changeFreq: ChangeFreq
  lastmod?: string
}

const PAGES: PageEntry[] = [
  { path: '',                        priority: 1.0,  changeFreq: 'weekly'  },
  { path: '/services',               priority: 0.9,  changeFreq: 'monthly' },
  { path: '/services/websites',      priority: 0.9,  changeFreq: 'monthly' },
  { path: '/services/ai-assistants', priority: 0.9,  changeFreq: 'monthly' },
  { path: '/services/seo',           priority: 0.8,  changeFreq: 'monthly' },
  { path: '/services/yandex-direct', priority: 0.7,  changeFreq: 'monthly' },
  { path: '/cases',                  priority: 0.85, changeFreq: 'weekly'  },
  { path: '/pricing',                priority: 0.85, changeFreq: 'monthly' },
  { path: '/blog',                   priority: 0.85, changeFreq: 'weekly'  },
  { path: '/contact',                priority: 0.8,  changeFreq: 'yearly'  },
  { path: '/privacy',                priority: 0.2,  changeFreq: 'yearly'  },
  { path: '/cookies',                priority: 0.2,  changeFreq: 'yearly'  },
]

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = []

  for (const page of PAGES) {
    // ru — no locale prefix (as-needed routing)
    const ruUrl = `${BASE_URL}${page.path}`
    // en — explicit /en prefix
    const enUrl = `${BASE_URL}/en${page.path}`

    entries.push({
      url: ruUrl,
      lastModified: page.lastmod ?? LAST_MOD,
      changeFrequency: page.changeFreq,
      priority: page.priority,
      alternates: {
        languages: {
          ru: ruUrl,
          en: enUrl,
        },
      },
    })

    entries.push({
      url: enUrl,
      lastModified: page.lastmod ?? LAST_MOD,
      changeFrequency: page.changeFreq,
      priority: page.priority * 0.9, // slightly lower for non-primary locale
      alternates: {
        languages: {
          ru: ruUrl,
          en: enUrl,
        },
      },
    })
  }

  // Blog posts
  const posts = getAllPosts('ru')
  for (const post of posts) {
    const ruUrl = `${BASE_URL}/blog/${post.slug}`
    const enUrl = `${BASE_URL}/en/blog/${post.slug}`
    entries.push({
      url: ruUrl,
      lastModified: LAST_MOD,
      changeFrequency: 'monthly',
      priority: 0.7,
      alternates: { languages: { ru: ruUrl, en: enUrl } },
    })
    entries.push({
      url: enUrl,
      lastModified: LAST_MOD,
      changeFrequency: 'monthly',
      priority: 0.63,
      alternates: { languages: { ru: ruUrl, en: enUrl } },
    })
  }

  return entries
}
