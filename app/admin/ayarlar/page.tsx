export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AyarlarClient from '@/components/AyarlarClient'

export default async function AyarlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [{ count: postCount }, { count: authorCount }, { count: catCount }] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('authors').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
  ])

  return (
    <AyarlarClient
      email={user.email ?? ''}
      stats={{ posts: postCount ?? 0, authors: authorCount ?? 0, categories: catCount ?? 0 }}
    />
  )
}
