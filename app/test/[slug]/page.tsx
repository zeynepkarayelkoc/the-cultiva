// Artık dinamik olmak zorunda değil: çözülme sayacı render'dan çıkıp
// /api/test-cozuldu rotasına taşındı. Testler aramada en iyi iş çıkaran
// içerik, hızlanmaları doğrudan işimize yarıyor.
export const revalidate = 300

import { notFound, permanentRedirect } from 'next/navigation'
import { testGetir, digerTestleriGetir } from '@/lib/testVeri'
import Link from 'next/link'
import QuizPlayer from '@/components/QuizPlayer'
import JsonLd from '@/components/JsonLd'
import TestSayfaIcerik, { sikSorulanlar } from '@/components/TestSayfaIcerik'
import type { Metadata } from 'next'
import { sayfaMetadata, mutlakAdres } from '@/lib/seo'

// params request-time API; bu olmadan rota hiç önbelleğe alınmaz.
export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const quiz = await testGetir(slug)
  if (!quiz) return { title: 'Test bulunamadı' }
  return sayfaMetadata({
    baslik: quiz.title,
    aciklama: quiz.description
      ?? `${quiz.title} testini çöz, sonucunu arkadaşlarınla paylaş.`,
    yol: `/test/${quiz.slug}`,
    gorsel: quiz.cover_url,
  })
}

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const quiz = await testGetir(slug)
  if (!quiz) notFound()
  // İngilizce testlerin adresi /en/quiz/<slug>
  if (quiz.lang === 'en') permanentRedirect(`/en/quiz/${quiz.slug}`)

  const digerTestler = await digerTestleriGetir(quiz.slug, 'tr')

  const sss = sikSorulanlar(quiz)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <JsonLd veri={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: sss.map(({ soru, cevap }) => ({
          '@type': 'Question',
          name: soru,
          acceptedAnswer: { '@type': 'Answer', text: cevap },
        })),
        url: mutlakAdres(`/test/${quiz.slug}`),
        inLanguage: 'tr-TR',
      }} />

      <Link href="/testler" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra)', textDecoration: 'none' }}>
        ← testler
      </Link>
      <div style={{ marginTop: '1.2rem' }}>
        <QuizPlayer quiz={quiz} />
      </div>

      <TestSayfaIcerik quiz={quiz} digerTestler={digerTestler} />
    </div>
  )
}
