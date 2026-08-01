export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import TestEditor from '@/components/TestEditor'
import type { Quiz } from '@/lib/quiz'

export default async function TestDuzenlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*, quiz_options(*)), quiz_outcomes(*)')
    .eq('id', id)
    .single()
  if (!data) notFound()

  const { data: categories } = await supabase.from('categories').select('slug,name').order('sort_order')
  const { data: posts } = await supabase
    .from('posts').select('id,title').eq('published', true)
    .order('created_at', { ascending: false }).limit(200)

  return (
    <TestEditor
      quiz={data as Quiz}
      categories={categories ?? []}
      posts={posts ?? []}
    />
  )
}
