import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { authorSlug } from '@/lib/authorSlug'
import { SITE_ADRES } from '@/lib/seo'

/*
  Site haritası. Google'ın 510 yazıyı tek tek keşfetmesini beklemek yerine
  hepsini tek listede veriyoruz. Search Console'a bu adresi eklemek gerekiyor:
  https://www.thecultiva.com/sitemap.xml

  Günde bir yenilenmesi yeterli, her istekte veritabanını taramasın.
*/
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createPublicClient()

  // Dikkat: posts tablosunda updated_at kolonu YOK. İstersek PostgREST
  // sorgunun tamamını hataya düşürür ve site haritası boş kalır.
  const [yazilar, kategoriler, testler] = await Promise.all([
    supabase.from('posts')
      .select('slug, created_at, author_name')
      .eq('published', true)
      .order('created_at', { ascending: false }),
    supabase.from('categories').select('slug').order('sort_order'),
    supabase.from('quizzes').select('slug, created_at').eq('published', true),
  ])

  const bugun = new Date()

  const sabitler: MetadataRoute.Sitemap = [
    { url: SITE_ADRES,                     lastModified: bugun, changeFrequency: 'daily',  priority: 1 },
    { url: `${SITE_ADRES}/testler`,        lastModified: bugun, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_ADRES}/testler/siralama`, lastModified: bugun, changeFrequency: 'daily', priority: 0.4 },
  ]

  // categories tablosu okunamazsa (RLS) site haritası kategorisiz kalmasın.
  const VARSAYILAN_KATEGORILER = ['yasam', 'seyahat', 'sanat', 'sinema', 'rehber', 'kitap']
  const kategoriSluglari = kategoriler.data?.length
    ? kategoriler.data.map(k => k.slug)
    : VARSAYILAN_KATEGORILER

  const kategoriSayfalari: MetadataRoute.Sitemap = kategoriSluglari.map(slug => ({
    url: `${SITE_ADRES}/${slug}`,
    lastModified: bugun,
    changeFrequency: 'daily' as const,
    priority: 0.8,
  }))

  const yaziSayfalari: MetadataRoute.Sitemap = (yazilar.data ?? []).map(y => ({
    url: `${SITE_ADRES}/yazi/${y.slug}`,
    lastModified: new Date(y.created_at ?? bugun),
    changeFrequency: 'monthly' as const,
    priority: 0.9,
  }))

  // Aynı yazar birden çok yazıda geçiyor, tekilleştir.
  const yazarSluglari = new Set(
    (yazilar.data ?? [])
      .map(y => y.author_name)
      .filter((a): a is string => !!a)
      .map(authorSlug),
  )
  const yazarSayfalari: MetadataRoute.Sitemap = [...yazarSluglari].map(s => ({
    url: `${SITE_ADRES}/yazar/${s}`,
    lastModified: bugun,
    changeFrequency: 'weekly' as const,
    priority: 0.5,
  }))

  const testSayfalari: MetadataRoute.Sitemap = (testler.data ?? []).map(t => ({
    url: `${SITE_ADRES}/test/${t.slug}`,
    lastModified: new Date(t.created_at ?? bugun),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  return [...sabitler, ...kategoriSayfalari, ...yaziSayfalari, ...yazarSayfalari, ...testSayfalari]
}
