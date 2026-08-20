import type { MetadataRoute } from 'next'
import { SITE_ADRES } from '@/lib/seo'

/*
  Arama motoru tarayıcıları için kurallar.
  Yönetim ve üyelik sayfaları taranmasın: hem gereksiz tarama bütçesi harcıyor
  hem de bu sayfaların arama sonuçlarında çıkmasını istemiyoruz.
*/
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/admin/', '/panel', '/giris', '/api/'],
      },
    ],
    sitemap: `${SITE_ADRES}/sitemap.xml`,
    host: SITE_ADRES,
  }
}
