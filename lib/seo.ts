import type { Metadata } from 'next'
import { siteAyarlari } from '@/lib/siteSettings'

/*
  SEO yardımcıları. Her sayfanın kendi başlığı, açıklaması ve canonical adresi
  olsun diye burada topluyoruz.

  Neden önemli: bu dosya eklenmeden önce 510 yazının hepsi Google'da site
  başlığıyla ("The Cultiva yaşam, sanat & seyahat") görünüyordu, çünkü hiçbir
  yazı sayfasında generateMetadata yoktu. Google açısından hepsi aynı sayfaydı.
*/

export const SITE_ADRES = 'https://www.thecultiva.com'

/** Metni verilen sınıra kelime ortasından kesmeden kısaltır. */
export function kisalt(metin: string, sinir: number): string {
  const temiz = metin.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (temiz.length <= sinir) return temiz
  const kesik = temiz.slice(0, sinir)
  const bosluk = kesik.lastIndexOf(' ')
  return (bosluk > sinir * 0.6 ? kesik.slice(0, bosluk) : kesik).trimEnd() + '…'
}

export function mutlakAdres(yol: string): string {
  if (!yol) return SITE_ADRES
  if (yol.startsWith('http')) return yol
  return `${SITE_ADRES}${yol.startsWith('/') ? '' : '/'}${yol}`
}

type SayfaSeo = {
  baslik: string
  aciklama: string
  yol: string                 // "/yazi/ornek-slug"
  gorsel?: string | null
  tip?: 'website' | 'article'
  yayinTarihi?: string | null
  guncellemeTarihi?: string | null
  yazarlar?: string[]
  indeksleme?: boolean        // false ise arama motorlarına kapat
}

/**
 * Tek bir yerden Metadata üretir: başlık, açıklama, canonical, OG ve Twitter.
 * Başlığın sonuna site adını ekler, ama başlık zaten çok uzunsa eklemez.
 */
export async function sayfaMetadata(s: SayfaSeo): Promise<Metadata> {
  const ayar = await siteAyarlari()
  const adres = mutlakAdres(s.yol)

  // Site adını sona ekle, ama başlık zaten uzunsa ya da site adını
  // içeriyorsa ekleme. Yoksa "The Cultiva … | The Cultiva" gibi olurdu.
  const hamBaslik = s.baslik.trim()
  const adVar = /the cultiva/i.test(hamBaslik)
  const baslik = (hamBaslik.length > 45 || adVar) ? hamBaslik : `${hamBaslik} | The Cultiva`
  const aciklama = kisalt(s.aciklama || ayar.site_description, 158)
  const gorsel = s.gorsel ? mutlakAdres(s.gorsel) : null

  return {
    // absolute: layout'taki "%s | The Cultiva" şablonunu atlar.
    // Ek zaten yukarıda koşullu olarak yapıldı, iki kez eklenmesin.
    title: { absolute: baslik },
    description: aciklama,
    alternates: { canonical: adres },
    ...(s.indeksleme === false ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      title: baslik,
      description: aciklama,
      url: adres,
      siteName: 'The Cultiva',
      locale: 'tr_TR',
      type: s.tip ?? 'website',
      ...(gorsel ? { images: [{ url: gorsel, width: 1200, height: 630, alt: hamBaslik }] } : {}),
      ...(s.tip === 'article'
        ? {
            publishedTime: s.yayinTarihi ?? undefined,
            modifiedTime: s.guncellemeTarihi ?? s.yayinTarihi ?? undefined,
            authors: s.yazarlar,
          }
        : {}),
    },
    twitter: {
      card: gorsel ? 'summary_large_image' : 'summary',
      title: baslik,
      description: aciklama,
      ...(gorsel ? { images: [gorsel] } : {}),
    },
  }
}

/* ---------------- JSON-LD yapısal veri ----------------
   Google'ın sayfayı "makale" olarak tanıması, yazar ve tarih bilgisini
   görmesi için. Arama sonucunda tarih ve yazar gösterilmesini sağlar. */

type MakaleVeri = {
  baslik: string
  aciklama: string
  yol: string
  gorsel?: string | null
  yazar?: string | null
  yayinTarihi?: string | null
  guncellemeTarihi?: string | null
  kategori?: string | null
}

export function makaleSemasi(m: MakaleVeri) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: kisalt(m.baslik, 110),
    description: kisalt(m.aciklama, 200),
    mainEntityOfPage: { '@type': 'WebPage', '@id': mutlakAdres(m.yol) },
    ...(m.gorsel ? { image: [mutlakAdres(m.gorsel)] } : {}),
    ...(m.yazar
      ? { author: { '@type': 'Person', name: m.yazar } }
      : { author: { '@type': 'Organization', name: 'The Cultiva' } }),
    publisher: {
      '@type': 'Organization',
      name: 'The Cultiva',
      url: SITE_ADRES,
    },
    ...(m.yayinTarihi ? { datePublished: m.yayinTarihi } : {}),
    dateModified: m.guncellemeTarihi ?? m.yayinTarihi ?? undefined,
    ...(m.kategori ? { articleSection: m.kategori } : {}),
    inLanguage: 'tr-TR',
  }
}

export function siteSemasi(baslik: string, aciklama: string) {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'The Cultiva',
      alternateName: baslik,
      url: SITE_ADRES,
      description: aciklama,
      inLanguage: 'tr-TR',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'The Cultiva',
      url: SITE_ADRES,
      logo: mutlakAdres('/icon.png'),
    },
  ]
}

/** Kırıntı navigasyonu. Google sonuçlarda site > kategori > yazı yolunu gösterir. */
export function kirintiSemasi(basamaklar: { ad: string; yol: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: basamaklar.map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: b.ad,
      item: mutlakAdres(b.yol),
    })),
  }
}
