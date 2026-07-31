'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'

type Post = {
  id: string; title: string; slug: string; category: string
  published: boolean; created_at: string; author_name: string | null
}
type User = { id: string; full_name: string | null; email: string; role: string; created_at: string }

const catLabels: Record<string, string> = {
  yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat',
  sinema: 'sinema', rehber: 'rehber', kitap: 'kitap',
}

export default function AdminPanelClient({ posts, users }: { posts: Post[]; users: User[] }) {
  const [search,   setSearch]   = useState('')
  const [filterCat, setFilterCat] = useState('tümü')
  const [filterStatus, setFilterStatus] = useState('tümü')
  const [filterAuthor, setFilterAuthor] = useState('tümü')

  // Benzersiz yazarlar
  const authors = useMemo(() => {
    const names = posts.map(p => p.author_name).filter(Boolean) as string[]
    return [...new Set(names)].sort()
  }, [posts])

  // Benzersiz kategoriler (yazılarda olanlar)
  const cats = useMemo(() => {
    return [...new Set(posts.map(p => p.category))].sort()
  }, [posts])

  const filtered = useMemo(() => {
    return posts.filter(p => {
      if (search && !p.title.toLowerCase().includes(search.toLowerCase())) return false
      if (filterCat !== 'tümü' && p.category !== filterCat) return false
      if (filterStatus === 'yayında' && !p.published) return false
      if (filterStatus === 'taslak'  && p.published)  return false
      if (filterAuthor !== 'tümü' && p.author_name !== filterAuthor) return false
      return true
    })
  }, [posts, search, filterCat, filterStatus, filterAuthor])

  const published = posts.filter(p => p.published).length
  const drafts    = posts.filter(p => !p.published).length

  const selStyle = (active: boolean): React.CSSProperties => ({
    fontSize: '0.68rem', padding: '0.35rem 0.85rem', borderRadius: 50, cursor: 'pointer',
    border: active ? '1px solid #b5734a' : '1px solid rgba(245,232,208,0.15)',
    background: active ? 'rgba(181,115,74,0.18)' : 'transparent',
    color: active ? '#b5734a' : 'rgba(245,232,208,0.5)',
    transition: 'all 0.15s', whiteSpace: 'nowrap' as const,
  })

  return (
    <>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { label: 'Toplam Yazı', value: posts.length },
          { label: 'Yayında', value: published },
          { label: 'Taslak', value: drafts },
          { label: 'Üye', value: users.length },
        ].map(({ label, value }) => (
          <div key={label} style={{ background: 'rgba(245,232,208,0.06)', borderRadius: 14, padding: '1.5rem', border: '1px solid rgba(245,232,208,0.1)' }}>
            <div style={{ fontSize: '2rem', fontFamily: "'Playfair Display', serif", marginBottom: '0.3rem' }}>{value}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(245,232,208,0.5)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Yazılar */}
      <div style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h2 style={{ fontSize: '1.2rem' }}>Yazılar</h2>
          <Link href="/admin/yazi/yeni" style={{ fontSize: '0.72rem', color: '#b5734a', letterSpacing: '0.1em' }}>+ yeni yazı</Link>
        </div>

        {/* Filtreler */}
        <div style={{ background: 'rgba(245,232,208,0.04)', borderRadius: 12, padding: '1rem 1.2rem', marginBottom: '1rem', border: '1px solid rgba(245,232,208,0.08)' }}>
          {/* Arama */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="yazı ara..."
              style={{ flex: 1, minWidth: 180, padding: '0.45rem 0.85rem', background: 'rgba(245,232,208,0.07)', border: '1px solid rgba(245,232,208,0.12)', borderRadius: 8, color: '#f5e8d0', outline: 'none', fontSize: '0.8rem' }}
            />
            <span style={{ fontSize: '0.65rem', color: 'rgba(245,232,208,0.25)', whiteSpace: 'nowrap' }}>
              {filtered.length}/{posts.length} yazı
            </span>
          </div>

          {/* Durum */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.58rem', color: 'rgba(245,232,208,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: 4 }}>durum</span>
            {['tümü', 'yayında', 'taslak'].map(s => (
              <button key={s} type="button" onClick={() => setFilterStatus(s)} style={selStyle(filterStatus === s)}>{s}</button>
            ))}
          </div>

          {/* Kategori */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.58rem', color: 'rgba(245,232,208,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: 4 }}>kategori</span>
            <button type="button" onClick={() => setFilterCat('tümü')} style={selStyle(filterCat === 'tümü')}>tümü</button>
            {cats.map(c => (
              <button key={c} type="button" onClick={() => setFilterCat(c)} style={selStyle(filterCat === c)}>
                {catLabels[c] ?? c}
              </button>
            ))}
          </div>

          {/* Yazar */}
          {authors.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '0.58rem', color: 'rgba(245,232,208,0.3)', letterSpacing: '0.15em', textTransform: 'uppercase', marginRight: 4 }}>yazar</span>
              <button type="button" onClick={() => setFilterAuthor('tümü')} style={selStyle(filterAuthor === 'tümü')}>tümü</button>
              {authors.map(a => (
                <button key={a} type="button" onClick={() => setFilterAuthor(a)} style={selStyle(filterAuthor === a)}>{a}</button>
              ))}
            </div>
          )}
        </div>

        {/* Tablo */}
        <div style={{ background: 'rgba(245,232,208,0.04)', borderRadius: 14, overflow: 'hidden', border: '1px solid rgba(245,232,208,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(245,232,208,0.1)' }}>
                {['Başlık', 'Yazar', 'Kategori', 'Durum', 'Tarih', ''].map(h => (
                  <th key={h} style={{ padding: '0.9rem 1.2rem', textAlign: 'left', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,232,208,0.4)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(245,232,208,0.3)', fontSize: '0.85rem' }}>Sonuç bulunamadı</td></tr>
              ) : filtered.map(post => (
                <tr key={post.id} style={{ borderBottom: '1px solid rgba(245,232,208,0.05)', transition: 'background 0.12s' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'rgba(245,232,208,0.03)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '0.85rem 1.2rem', maxWidth: 280 }}>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '0.88rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </div>
                  </td>
                  <td style={{ padding: '0.85rem 1.2rem', fontSize: '0.75rem', color: 'rgba(245,232,208,0.55)', whiteSpace: 'nowrap' }}>
                    {post.author_name ?? '—'}
                  </td>
                  <td style={{ padding: '0.85rem 1.2rem', fontSize: '0.68rem', color: '#b5734a', letterSpacing: '0.1em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                    {catLabels[post.category] ?? post.category}
                  </td>
                  <td style={{ padding: '0.85rem 1.2rem' }}>
                    <span style={{
                      fontSize: '0.62rem', letterSpacing: '0.1em', textTransform: 'uppercase',
                      padding: '0.22rem 0.65rem', borderRadius: 50,
                      background: post.published ? 'rgba(122,140,114,0.2)' : 'rgba(181,115,74,0.15)',
                      color: post.published ? '#7a8c72' : '#b5734a',
                    }}>
                      {post.published ? 'yayında' : 'taslak'}
                    </span>
                  </td>
                  <td style={{ padding: '0.85rem 1.2rem', fontSize: '0.7rem', color: 'rgba(245,232,208,0.4)', whiteSpace: 'nowrap' }}>
                    {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </td>
                  <td style={{ padding: '0.85rem 1.2rem' }}>
                    <Link href={`/admin/yazi/${post.id}`} style={{ fontSize: '0.7rem', color: '#b5734a', letterSpacing: '0.05em' }}>düzenle →</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Üyeler */}
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
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid rgba(245,232,208,0.06)' }}>
                  <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.88rem' }}>{u.full_name ?? '—'}</td>
                  <td style={{ padding: '0.9rem 1.2rem', fontSize: '0.82rem', color: 'rgba(245,232,208,0.6)' }}>{u.email}</td>
                  <td style={{ padding: '0.9rem 1.2rem' }}>
                    <span style={{ fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', padding: '0.2rem 0.6rem', borderRadius: 50, background: u.role === 'admin' ? 'rgba(181,115,74,0.2)' : 'rgba(245,232,208,0.08)', color: u.role === 'admin' ? '#b5734a' : 'rgba(245,232,208,0.5)' }}>{u.role}</span>
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
    </>
  )
}
