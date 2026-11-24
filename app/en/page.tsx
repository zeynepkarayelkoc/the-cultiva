// İngilizce ana sayfa: İngilizce yazılar ve testler.
export const revalidate = 300

import type { Metadata } from 'next'
import Link from 'next/link'
import BelgeDili from '@/components/BelgeDili'
import JsonLd from '@/components/JsonLd'
import { YaziKartlari, TestKartlari, type EnYazi } from '@/components/EnKartlar'
import { createPublicClient } from '@/lib/supabase/public'
import { testListesi } from '@/lib/testVeri'
import { ingilizceSluglar } from '@/lib/translations'
import { sayfaMetadata, siteSemasi } from '@/lib/seo'

const BASLIK = 'The Cultiva: Art, Myth and Culture Explained'
const ACIKLAMA = 'Clear, well-sourced guides to paintings, symbols, art terms and mythology, plus art history quizzes. From Istanbul, in English.'

export async function generateMetadata(): Promise<Metadata> {
  return sayfaMetadata({
    baslik: BASLIK, aciklama: ACIKLAMA, yol: '/en', dil: 'en',
    dilAlternatifleri: { tr: '/', en: '/en', 'x-default': '/' },
  })
}

async function yazilariGetir(): Promise<EnYazi[]> {
  const supabase = createPublicClient(300)
  const { data } = await supabase
    .from('posts')
    .select('slug, title, excerpt, cover_url, category, read_time')
    .eq('published', true)
    .in('slug', ingilizceSluglar())
    .order('created_at', { ascending: false })
  return data ?? []
}

const bolumBaslik: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif", fontSize: '1.6rem', fontWeight: 400, margin: '0 0 1.2rem',
}

export default async function EnHome() {
  const [yazilar, testler] = await Promise.all([yazilariGetir(), testListesi('en')])

  return (
    <div lang="en" style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <BelgeDili dil="en" />
      <JsonLd veri={siteSemasi(BASLIK, ACIKLAMA)} />

      <header style={{ marginBottom: '3rem', maxWidth: 720 }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 400, lineHeight: 1.15, marginBottom: '0.8rem' }}>
          Art, myth and culture, explained
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '1rem', lineHeight: 1.7, margin: 0 }}>
          The Cultiva is an independent magazine from Istanbul. In English we publish clear guides to
          paintings, symbols and art terms, stories from Turkish art, and quizzes to test your eye.
        </p>
      </header>

      {testler.length > 0 && (
        <section style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <h2 style={bolumBaslik}>Quizzes</h2>
            <Link href="/en/quizzes" style={{ fontSize: '0.8rem', color: 'var(--terra)' }}>All quizzes →</Link>
          </div>
          <TestKartlari testler={testler.slice(0, 3)} />
        </section>
      )}

      <section>
        <h2 style={bolumBaslik}>Articles</h2>
        <YaziKartlari yazilar={yazilar} />
      </section>
    </div>
  )
}
