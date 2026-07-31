'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

type Post = {
  id: string
  title: string
  slug: string
  category: string
  published: boolean
  featured: boolean
  featured_order: number
  cover_url: string | null
  created_at: string
}

const catLabel: Record<string, string> = {
  yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat',
  sinema: 'sinema', rehber: 'rehber', kitap: 'kitap',
}
const catColor: Record<string, string> = {
  yasam: '#8b2635', seyahat: '#1e3a5f', sanat: '#5c3460',
  sinema: '#7a3b5c', rehber: '#2d5a3d', kitap: '#7a4f1a',
}

export default function AnasayfaYonetimi() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const supabase = createClient()

  const load = async () => {
    const { data } = await supabase
      .from('posts')
      .select('id,title,slug,category,published,featured,featured_order,cover_url,created_at')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const featured = posts
    .filter(p => p.featured)
    .sort((a, b) => (a.featured_order ?? 99) - (b.featured_order ?? 99))

  const maxOrder = featured.length ? Math.max(...featured.map(p => p.featured_order ?? 0)) : 0

  const toggleFeatured = async (post: Post) => {
    setSaving(post.id)
    if (post.featured) {
      await supabase.from('posts').update({ featured: false, featured_order: 0 }).eq('id', post.id)
    } else {
      await supabase.from('posts').update({ featured: true, featured_order: maxOrder + 1 }).eq('id', post.id)
    }
    await load()
    setSaving(null)
  }

  const moveUp = async (idx: number) => {
    if (idx === 0) return
    const a = featured[idx]
    const b = featured[idx - 1]
    setSaving(a.id)
    await supabase.from('posts').update({ featured_order: b.featured_order }).eq('id', a.id)
    await supabase.from('posts').update({ featured_order: a.featured_order }).eq('id', b.id)
    await load()
    setSaving(null)
  }

  const moveDown = async (idx: number) => {
    if (idx === featured.length - 1) return
    const a = featured[idx]
    const b = featured[idx + 1]
    setSaving(a.id)
    await supabase.from('posts').update({ featured_order: b.featured_order }).eq('id', a.id)
    await supabase.from('posts').update({ featured_order: a.featured_order }).eq('id', b.id)
    await load()
    setSaving(null)
  }

  const nonFeatured = posts
    .filter(p => !p.featured && p.published)
    .filter(p => search ? p.title.toLowerCase().includes(search.toLowerCase()) : true)

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#1a110a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f5e8d0', fontFamily: "'Playfair Display', serif", fontSize: '1.2rem' }}>
      yükleniyor…
    </div>
  )

  const S = {
    page: { minHeight: '100vh', background: '#1a110a', color: '#f5e8d0' } as React.CSSProperties,
    nav: { padding: '0 2.5rem', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(245,232,208,0.1)', background: '#120c06' } as React.CSSProperties,
    logo: { fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#b5734a' } as React.CSSProperties,
    wrap: { maxWidth: 1000, margin: '0 auto', padding: '3rem 2.5rem' } as React.CSSProperties,
    card: { background: 'rgba(245,232,208,0.04)', borderRadius: 14, border: '1px solid rgba(245,232,208,0.08)', marginBottom: '2.5rem' } as React.CSSProperties,
    cardHead: { padding: '1.2rem 1.5rem', borderBottom: '1px solid rgba(245,232,208,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' } as React.CSSProperties,
  }

  return (
    <div style={S.page}>
      {/* Nav */}
      <div style={S.nav}>
        <span style={S.logo}>The Cultiva · Admin</span>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <Link href="/admin" style={{ fontSize: '0.72rem', color: 'rgba(245,232,208,0.5)' }}>← panel</Link>
          <Link href="/" target="_blank" style={{ fontSize: '0.72rem', color: 'rgba(245,232,208,0.5)' }}>siteyi gör ↗</Link>
        </div>
      </div>

      <div style={S.wrap}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.8rem', marginBottom: '2rem' }}>
          Ana Sayfa Yönetimi
        </h1>

        {/* ── SLIDER ── */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Slider Yazıları</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245,232,208,0.4)', marginTop: 2 }}>
                Sırayla gösterilir · İlk 5 yazı ana sayfada slider'a girer
              </div>
            </div>
            <span style={{
              fontSize: '0.65rem', padding: '0.2rem 0.7rem', borderRadius: 50,
              background: 'rgba(181,115,74,0.2)', color: '#b5734a', letterSpacing: '0.1em',
            }}>
              {featured.length} yazı
            </span>
          </div>

          {featured.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(245,232,208,0.3)', fontSize: '0.85rem' }}>
              Henüz öne çıkan yazı yok. Aşağıdan yazı seç.
            </div>
          ) : (
            <div>
              {featured.map((post, i) => (
                <div key={post.id} style={{
                  display: 'flex', alignItems: 'center', gap: '1rem',
                  padding: '0.9rem 1.5rem',
                  borderBottom: i < featured.length - 1 ? '1px solid rgba(245,232,208,0.06)' : 'none',
                  background: saving === post.id ? 'rgba(245,232,208,0.03)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  {/* Sıra no */}
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i < 5 ? 'rgba(181,115,74,0.25)' : 'rgba(245,232,208,0.08)',
                    color: i < 5 ? '#b5734a' : 'rgba(245,232,208,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>

                  {/* Başlık */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.88rem', fontFamily: "'Playfair Display', serif", whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {post.title}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: catColor[post.category] ?? '#b5734a', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                      {catLabel[post.category] ?? post.category}
                    </div>
                  </div>

                  {/* Sıra butonları */}
                  <div style={{ display: 'flex', gap: 4 }}>
                    <button onClick={() => moveUp(i)} disabled={i === 0 || saving !== null} style={{
                      width: 28, height: 28, border: '1px solid rgba(245,232,208,0.15)',
                      background: 'transparent', color: 'rgba(245,232,208,0.5)',
                      borderRadius: 6, fontSize: '0.8rem', cursor: i === 0 ? 'not-allowed' : 'pointer',
                      opacity: i === 0 ? 0.3 : 1,
                    }}>↑</button>
                    <button onClick={() => moveDown(i)} disabled={i === featured.length - 1 || saving !== null} style={{
                      width: 28, height: 28, border: '1px solid rgba(245,232,208,0.15)',
                      background: 'transparent', color: 'rgba(245,232,208,0.5)',
                      borderRadius: 6, fontSize: '0.8rem', cursor: i === featured.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: i === featured.length - 1 ? 0.3 : 1,
                    }}>↓</button>
                  </div>

                  {/* Çıkar */}
                  <button onClick={() => toggleFeatured(post)} disabled={saving !== null} style={{
                    padding: '0.3rem 0.9rem', borderRadius: 50,
                    border: '1px solid rgba(181,115,74,0.3)',
                    background: 'rgba(181,115,74,0.1)',
                    color: '#b5734a', fontSize: '0.65rem',
                    letterSpacing: '0.08em', cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
                    {saving === post.id ? '…' : '− çıkar'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── TÜM YAZILAR ── */}
        <div style={S.card}>
          <div style={S.cardHead}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Tüm Yayınlanan Yazılar</div>
              <div style={{ fontSize: '0.7rem', color: 'rgba(245,232,208,0.4)', marginTop: 2 }}>Slider'a eklemek için &quot;+ öne çıkar&quot;a bas</div>
            </div>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="yazı ara…"
              style={{
                background: 'rgba(245,232,208,0.08)', border: '1px solid rgba(245,232,208,0.12)',
                borderRadius: 8, padding: '0.4rem 0.9rem', color: '#f5e8d0',
                fontSize: '0.78rem', outline: 'none', width: 180,
              }}
            />
          </div>
          <div>
            {nonFeatured.slice(0, 50).map((post, i) => (
              <div key={post.id} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                padding: '0.75rem 1.5rem',
                borderBottom: i < nonFeatured.slice(0, 50).length - 1 ? '1px solid rgba(245,232,208,0.05)' : 'none',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {post.title}
                  </div>
                  <div style={{ fontSize: '0.62rem', color: catColor[post.category] ?? '#b5734a', marginTop: 2, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {catLabel[post.category] ?? post.category} · {new Date(post.created_at).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <button onClick={() => toggleFeatured(post)} disabled={saving !== null} style={{
                  padding: '0.28rem 0.85rem', borderRadius: 50,
                  border: '1px solid rgba(245,232,208,0.15)',
                  background: 'transparent',
                  color: 'rgba(245,232,208,0.55)', fontSize: '0.62rem',
                  letterSpacing: '0.08em', cursor: 'pointer', whiteSpace: 'nowrap',
                  transition: 'all 0.2s',
                }}>
                  {saving === post.id ? '…' : '+ öne çıkar'}
                </button>
              </div>
            ))}
            {nonFeatured.length > 50 && (
              <div style={{ padding: '0.75rem 1.5rem', fontSize: '0.72rem', color: 'rgba(245,232,208,0.3)', textAlign: 'center' }}>
                + {nonFeatured.length - 50} yazı daha — aramayı kullan
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
