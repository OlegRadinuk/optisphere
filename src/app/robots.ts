import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/aiadmin/', '/_next/'],
      },
      {
        // Yandex bot — same rules but separate entry for explicitness
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/api/', '/aiadmin/', '/_next/'],
      },
    ],
    sitemap: 'https://optisphere.tech/sitemap.xml',
    host: 'optisphere.tech',
  }
}
