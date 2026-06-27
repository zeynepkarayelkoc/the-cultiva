export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'

const valid = ['yasam', 'seyahat', 'sanat', 'rehber', 'kitap']
const labels: Record<string, string> = { yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat', rehber: 'rehber', kitap: 'kitap' }
const colors: Record<string, string> = { yasam: '#d4c0a0', seyahat: '#a0b8c0', sanat: '#c0b0c8', rehber: '#a0c0a8', kitap: '#c8c0a0' }

export default async function KategoriPage({ params }: { params: Promise<{ kategori: string }> }) {
  const { kategori } = await params
  if (!valid.includes(kategori)) notFound()

  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .eq('category', kategori)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        padding: '5rem 2.5rem 3rem',
        background: `linear-gradient(135deg, ${colors[kategori]}44, var(--cream))`,
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '0.8rem' }}>
            kategori
          </div>
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '1rem' }}>
            {labels[kategori]}
          </h1>
          <p style={{ fontSize: '1rem', color: 'var(--muted)', lineHeight: 1.7 }}>
            {posts?.length ?? 0} yazı
          </p>
        </div>
      </div>

      {/* Posts */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2.5rem' }}>
        {posts?.length === 0 ? (
          <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '4rem' }}>Henüz yazı yok.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {posts?.map(post => (
              <Link key={post.id} href={`/yazi/${post.slug}`} style={{
                background: 'white', borderRadius: 14, overflow: 'hidden',
                border: '1px solid var(--border)', display: 'block',
                transition: 'transform 0.25s, box-shadow 0.25s',
              }}>
                <div style={{ height: 200, background: `linear-gradient(135deg, ${colors[kategori]}, #806040)` }} />
                <div style={{ padding: '1.4rem' }}>
                  <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 400, lineHeight: 1.35, marginBottom: '0.6rem' }}>
                    {post.title}
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.8rem' }}>
                    {post.excerpt}
                  </p>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', opacity: 0.6 }}>
                    {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.read_time} dk okuma
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
