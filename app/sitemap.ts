import type { MetadataRoute } from 'next'
import { createPublicClient } from '@/lib/supabase/public'
import { authorSlug } from '@/lib/authorSlug'
import { SITE_ADRES } from '@/lib/seo'
import { dilAlternatifleri } from '@/lib/translations'

/*
  Site haritası. Google'ın bütün yazıları tek tek keşfetmesini beklemek yerine
  hepsini tek listede veriyoruz. Search Console'a bu adres gönderildi:
  https://www.thecultiva.com/sitemap.xml

  DİKKAT - burada "export const revalidate" KULLANMA.

  sitemap.ts bir metadata rotası ve Next.js bunu derleme anında statik dosyaya
  çeviriyor. revalidate bu rotada çalışmıyor: dosya yalnızca yeni bir deploy
  yapıldığında değişiyor. Bir dönem revalidate = 86400 yazılıydı ve site haritası
  haftalarca donup kaldı; panelden eklenen yeni testler ve yazılar içine hiç
  girmedi, dolayısıyla Google onları göremedi.

  Metadata rotasını taze tutmanın yolu dinamik yapmak. Site haritasını yalnızca
  arama motoru tarayıcıları çağırdığı için istek başına birkaç sorgu sorun değil.
*/
export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 0 = önbelleksiz. Site haritası her zaman güncel içeriği göstermeli.
  const supabase = createPublicClient(0)

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

  // Çeviri çiftlerini site haritasında da bildiriyoruz. Google hreflang'i
  // hem sayfadan hem buradan okuyunca eşleşmeyi daha hızlı kabul ediyor.
  const yaziSayfalari: MetadataRoute.Sitemap = (yazilar.data ?? []).map(y => {
    const alternatifler = dilAlternatifleri(y.slug)
    return {
      url: `${SITE_ADRES}/yazi/${y.slug}`,
      lastModified: new Date(y.created_at ?? bugun),
      changeFrequency: 'monthly' as const,
      priority: 0.9,
      ...(alternatifler
        ? {
            alternates: {
              languages: Object.fromEntries(
                Object.entries(alternatifler).map(([k, v]) => [k, `${SITE_ADRES}${v}`]),
              ),
            },
          }
        : {}),
    }
  })

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
