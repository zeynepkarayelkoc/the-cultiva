export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TestlerClient from '@/components/TestlerClient'

export default async function AdminTestlerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id,slug,title,type,published,play_count,created_at,quiz_questions(id)')
    .order('created_at', { ascending: false })

  const { data: denemeler } = await supabase.from('quiz_attempts').select('quiz_id')
  const cozum: Record<string, number> = {}
  ;(denemeler ?? []).forEach(d => { cozum[d.quiz_id] = (cozum[d.quiz_id] ?? 0) + 1 })

  const liste = (quizzes ?? []).map(q => ({
    id: q.id, slug: q.slug, title: q.title, type: q.type,
    published: q.published, created_at: q.created_at,
    soru: (q.quiz_questions as { id: string }[] | null)?.length ?? 0,
    cozum: cozum[q.id] ?? 0,
  }))

  return <TestlerClient quizzes={liste} />
}
