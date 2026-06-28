export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { authorSlug } from '@/lib/authorSlug'

const labels: Record<string, string> = { yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat', sinema: 'sinema', rehber: 'rehber', kitap: 'kitap' }
const colors: Record<string, string> = { yasam: '#8b2635', seyahat: '#1e3a5f', sanat: '#5c3460', sinema: '#7a3b5c', rehber: '#2d5a3d', kitap: '#7a4f1a' }

export default async function YazarPage({ params }: { params: Promise<{ ad: string }> }) {
  const { ad } = await params
  const supabase = await createClient()

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .not('author_name', 'is', null)
    .order('created_at', { ascending: false })

  // URL slug'ı ile eşleşen yazarın yazıları
  const authorPosts = (posts ?? []).filter(
    (p) => p.author_name && authorSlug(p.author_name) === ad
  )

  if (authorPosts.length === 0) notFound()

  const authorName = authorPosts[0].author_name as string

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Header */}
      <div className="section-pad" style={{
        padding: '5rem 2.5rem 3rem',
        background: 'linear-gradient(135deg, rgba(139,38,53,0.12), var(--cream))',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'var(--terra)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem', color: 'white', fontWeight: 600, flexShrink: 0,
            boxShadow: '0 4px 20px rgba(139,38,53,0.35)',
          }}>
            {authorName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '0.5rem' }}>
              yazar
            </div>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.1, marginBottom: '0.4rem' }}>
              {authorName}
            </h1>
            <p style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
              {authorPosts.length} yazı
            </p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div className="section-pad" style={{ maxWidth: 1100, margin: '0 auto', padding: '4rem 2.5rem' }}>
        <div className="post-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {authorPosts.map((post) => (
            <Link key={post.id} href={`/yazi/${post.slug}`} style={{
              background: 'white', borderRadius: 14, overflow: 'hidden',
              border: '1px solid var(--border)', display: 'block',
              transition: 'transform 0.25s, box-shadow 0.25s',
            }}>
              <div style={{ height: 160, background: `linear-gradient(135deg, ${colors[post.category] ?? '#8b2635'}, #806040)` }} />
              <div style={{ padding: '1.4rem' }}>
                <span style={{
                  display: 'inline-block', fontSize: '0.58rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: colors[post.category] ?? '#8b2635',
                  fontWeight: 700, marginBottom: '0.6rem',
                }}>{labels[post.category] ?? post.category}</span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', fontWeight: 400, lineHeight: 1.35, marginBottom: '0.6rem' }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: '0.82rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '0.8rem' }}>
                  {post.excerpt?.substring(0, 100)}
                </p>
                <div style={{ fontSize: '0.65rem', color: 'var(--muted)', opacity: 0.6 }}>
                  {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.read_time} dk okuma
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
