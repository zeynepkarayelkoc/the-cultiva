// İngilizce test sayfası. Türkçe /test/[slug] ile aynı bileşenleri kullanır;
// metinler quiz.lang'e göre lib/i18n.ts'ten gelir.
export const revalidate = 300

import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import QuizPlayer from '@/components/QuizPlayer'
import JsonLd from '@/components/JsonLd'
import BelgeDili from '@/components/BelgeDili'
import TestSayfaIcerik, { sikSorulanlar } from '@/components/TestSayfaIcerik'
import { testGetir, digerTestleriGetir } from '@/lib/testVeri'
import { sayfaMetadata, mutlakAdres } from '@/lib/seo'
import { METIN } from '@/lib/i18n'

export function generateStaticParams() {
  return []
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const quiz = await testGetir(slug)
  if (!quiz || quiz.lang !== 'en') return { title: METIN.en.testBulunamadi }
  return sayfaMetadata({
    baslik: quiz.title,
    aciklama: quiz.description ?? METIN.en.varsayilanAciklama(quiz.title),
    yol: `/en/quiz/${quiz.slug}`,
    gorsel: quiz.cover_url,
    dil: 'en',
  })
}

export default async function EnQuizPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const quiz = await testGetir(slug)
  if (!quiz) notFound()
  // Türkçe bir test bu adresle açılırsa asıl adresine gönder.
  if (quiz.lang !== 'en') permanentRedirect(`/test/${quiz.slug}`)

  const digerTestler = await digerTestleriGetir(quiz.slug, 'en')
  const sss = sikSorulanlar(quiz)

  return (
    <div lang="en" style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <BelgeDili dil="en" />
      <JsonLd veri={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: sss.map(({ soru, cevap }) => ({
          '@type': 'Question',
          name: soru,
          acceptedAnswer: { '@type': 'Answer', text: cevap },
        })),
        url: mutlakAdres(`/en/quiz/${quiz.slug}`),
        inLanguage: 'en',
      }} />

      <Link href="/en/quizzes" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra)', textDecoration: 'none' }}>
        {METIN.en.geriTestler}
      </Link>
      <div style={{ marginTop: '1.2rem' }}>
        <QuizPlayer quiz={quiz} />
      </div>

      <TestSayfaIcerik quiz={quiz} digerTestler={digerTestler} />
    </div>
  )
}
