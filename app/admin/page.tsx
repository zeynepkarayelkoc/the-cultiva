import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/giris')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/')

  const { data: posts } = await supabase.from('posts').select('*').order('created_at', { ascending: false })
  const { data: users } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })

  const published = posts?.filter(p => p.published).length ?? 0
  const drafts = posts?.filter(p => !p.published).length ?? 0

  return (
    <div style={{ minHeight: '100vh', background: '#1a110a', color: '#f5e8d0' }}>
      {/* Admin Nav */}
      <div style={{
        padding: '0 2.5rem', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        borderBottom: '1px solid rgba(245,232,208,0.1)',
        background: '#120c06',
      }}>
        <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#b5734a' }}>The Cultiva · Admin</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/admin/yazi/yeni" style={{ fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#f5e8d0', background: '#b5734a', padding: '0.45rem 1.2rem', borderRadius: 50 }}>
            + Yeni Yazı
          </Link>
          <Link href="/" style={{ fontSize: '0.72rem', color: 'rgba(245,232,208,0.5)' }}>siteye dön</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '3rem 2.5rem' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2rem', marginBottom: '2.5rem' }}>Panel</h1>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '3rem' }}>
          {[
            { label: 'Toplam Yazı', value: posts?.length ?? 0 },
            { label: 'Yayında', value: published },
            { label: 'Taslak', value: drafts },
            { label: 'Üye', value: users?.length ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{ background: 'rgba(245,232,208,0.06)', borderRadius: 14, padding: '1.5rem', border: '1px solid rgba(245,232,208,0.1)' }}>
              <div style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '0.3rem' }}>{value}</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245,232,208,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Posts table */}
        <div style={{ marginBottom: '3rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2 style={{ fontSize: '1.2rem' }}>Yazılar</h2>
            <Link href="/admin/yazi/yeni" style={{ fontSize: '0.72rem', color: '#b5734a', letterSpacing: '0.1em' }}>+ yeni yazı</Link>
          </div>
          <div style={{ background: 'rgba(245,232,208,0.04)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,232,208,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,232,208,0.1)' }}>
                  {['Başlık', 'Kategori', 'Durum', 'Tarih', 'İşlem'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1.2rem', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,232,208,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {posts?.map(post => (
                  <tr key={post.id} style={{ borderBottom: '1px solid rgba(245,232,208,0.06)' }}>
                    <td style={{ padding: '1rem 1.2rem', fontSize: '0.88rem', maxWidth: 300 }}>
                      <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {post.title}
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', color: '#b5734a', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{post.category}</td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <span style={{
                        fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '0.25rem 0.7rem', borderRadius: 50,
                        background: post.published ? 'rgba(122,140,114,0.2)' : 'rgba(181,115,74,0.15)',
                        color: post.published ? '#7a8c72' : '#b5734a',
                      }}>
                        {post.published ? 'yayında' : 'taslak'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem 1.2rem', fontSize: '0.72rem', color: 'rgba(245,232,208,0.4)' }}>
                      {new Date(post.created_at).toLocaleDateString('tr-TR')}
                    </td>
                    <td style={{ padding: '1rem 1.2rem' }}>
                      <Link href={`/admin/yazi/${post.id}`} style={{ fontSize: '0.72rem', color: '#b5734a', letterSpacing: '0.05em' }}>düzenle</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Users table */}
        <div>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>Üyeler</h2>
          <div style={{ background: 'rgba(245,232,208,0.04)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,232,208,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(245,232,208,0.1)' }}>
                  {['Ad', 'E-posta', 'Rol', 'Katılım'].map(h => (
                    <th key={h} style={{ padding: '0.9rem 1.2rem', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,232,208,0.4)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users?.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid rgba(245,232,208,0.06)' }}>
                    <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.88rem' }}>{u.full_name ?? '—'}</td>
                    <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.82rem', color: 'rgba(245,232,208,0.6)' }}>{u.email}</td>
                    <td style={{ padding: '0.9rem 1.2rem' }}>
                      <span style={{
                        fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                        padding: '0.2rem 0.6rem', borderRadius: 50,
                        background: u.role === 'admin' ? 'rgba(181,115,74,0.2)' : 'rgba(245,232,208,0.08)',
                        color: u.role === 'admin' ? '#b5734a' : 'rgba(245,232,208,0.5)',
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.72rem', color: 'rgba(245,232,208,0.4)' }}>
                      {new Date(u.created_at).toLocaleDateString('tr-TR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
