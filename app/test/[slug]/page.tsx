export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import QuizPlayer from '@/components/QuizPlayer'
import type { Quiz } from '@/lib/quiz'
import type { Metadata } from 'next'

async function testGetir(slug: string) {
  const supabase = await createClient()
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
  if (!quiz) return {}
  return {
    title: quiz.title,
    description: quiz.description ?? undefined,
    openGraph: { title: quiz.title, description: quiz.description ?? undefined },
  }
}

export default async function TestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const quiz = await testGetir(slug)
  if (!quiz) notFound()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Çözülme sayacını artır (hata olursa sessiz geç)
  await supabase.from('quizzes').update({ play_count: quiz.play_count + 1 }).eq('id', quiz.id)

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>
      <Link href="/testler" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra)', textDecoration: 'none' }}>
        ← testler
      </Link>
      <div style={{ marginTop: '1.2rem' }}>
        <QuizPlayer quiz={quiz} girisYapti={!!user} />
      </div>
    </div>
  )
}
