export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import YazarlarClient from '@/components/YazarlarClient'

export default async function YazarlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: authors } = await supabase
    .from('authors').select('id,name,slug,email,bio,avatar_url').order('name')

  const { data: posts } = await supabase.from('posts').select('author_name')
  const counts: Record<string, number> = {}
  ;(posts ?? []).forEach(p => {
    const n = (p.author_name ?? '').trim()
    if (n) counts[n] = (counts[n] ?? 0) + 1
  })

  return <YazarlarClient authors={authors ?? []} counts={counts} />
}
