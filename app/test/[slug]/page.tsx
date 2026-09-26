// Artık dinamik olmak zorunda değil: çözülme sayacı render'dan çıkıp
// /api/test-cozuldu rotasına taşındı. Testler aramada en iyi iş çıkaran
// içerik, hızlanmaları doğrudan işimize yarıyor.
export const revalidate = 300

import { createPublicClient } from '@/lib/supabase/public'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QuizPlayer from '@/components/QuizPlayer'
import JsonLd from '@/components/JsonLd'
import TestSayfaIcerik, { sikSorulanlar } from '@/components/TestSayfaIcerik'
import type { Quiz } from '@/lib/quiz'
import type { Metadata } from 'next'
import { sayfaMetadata, mutlakAdres } from '@/lib/seo'

// params request-time API; bu olmadan rota hiç önbelleğe alınmaz.
export function generateStaticParams() {
  return []
}

async function digerTestleriGetir(haricSlug: string) {
  const supabase = createPublicClient(300)
  const { data } = await supabase
    .from('quizzes')
    .select('slug, title, type')
    .eq('published', true)
    .neq('slug', haricSlug)
    .order('play_count', { ascending: false })
    .limit(8)
  return data ?? []
}

async function testGetir(slug: string) {
  const supabase = createPublicClient(300)
  const { data } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*, quiz_options(*)), quiz_outcomes(*)')
    .eq('slug', slug)
    .single()
  return data as Quiz | null
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

  const digerTestler = await digerTestleriGetir(quiz.slug)

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
