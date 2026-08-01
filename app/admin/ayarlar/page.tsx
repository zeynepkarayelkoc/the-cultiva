export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AyarlarClient from '@/components/AyarlarClient'
import { siteAyarlari } from '@/lib/siteSettings'

export default async function AyarlarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const [ayarlar, posts, authors, cats] = await Promise.all([
    siteAyarlari(),
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('authors').select('id', { count: 'exact', head: true }),
    supabase.from('categories').select('id', { count: 'exact', head: true }),
  ])

  return (
    <AyarlarClient
      email={user.email ?? ''}
      ayarlar={ayarlar}
      stats={{
        posts: posts.count ?? 0,
        authors: authors.count ?? 0,
        categories: cats.count ?? 0,
      }}
    />
  )
}
