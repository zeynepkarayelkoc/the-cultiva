export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
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

  const { data: users } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', background: '#1a110a', color: '#f5e8d0' }}>
      <div style={{ padding: '0 2.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(245,232,208,0.1)', background: '#120c06' }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#b5734a' }}>The Cultiva · Admin</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/admin/anasayfa" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(245,232,208,0.7)', background: 'rgba(245,232,208,0.08)', padding: '0.45rem 1.2rem', borderRadius: 50, border: '1px solid rgba(245,232,208,0.15)' }}>★ Ana Sayfa</Link>
          <Link href="/admin/yazi/yeni" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5e8d0', background: '#b5734a', padding: '0.45rem 1.2rem', borderRadius: 50 }}>+ Yeni Yazı</Link>
          <Link href="/" style={{ fontSize: '0.72rem', color: 'rgba(245,232,208,0.5)' }}>siteye dön</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '2.5rem' }}>Panel</h1>
        <AdminPanelClient posts={posts ?? []} users={users ?? []} />
      </div>
    </div>
  )
}
