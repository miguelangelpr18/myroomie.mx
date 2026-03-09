import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/account', '/messages', '/saved', '/profiles/edit'],
    },
    sitemap: 'https://www.myroomie.mx/sitemap.xml',
  }
}
