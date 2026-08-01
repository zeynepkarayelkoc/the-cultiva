export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminPanelClient from '@/components/AdminPanelClient'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: posts } = await supabase
    .from('posts')
    .select('id,title,slug,category,published,created_at,author_name')
    .order('created_at', { ascending: false })

  const { data: categories } = await supabase
    .from('categories')
    .select('id,name,slug')
    .order('sort_order')

  return <AdminPanelClient posts={posts ?? []} categories={categories ?? []} />
}
