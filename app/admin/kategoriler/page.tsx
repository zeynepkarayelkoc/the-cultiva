export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KategorilerClient from '@/components/KategorilerClient'

export default async function KategorilerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: categories } = await supabase
    .from('categories').select('id,name,slug,sort_order').order('sort_order')

  const { data: posts } = await supabase.from('posts').select('category')
  const counts: Record<string, number> = {}
  ;(posts ?? []).forEach(p => { counts[p.category] = (counts[p.category] ?? 0) + 1 })

  return <KategorilerClient categories={categories ?? []} counts={counts} />
}
