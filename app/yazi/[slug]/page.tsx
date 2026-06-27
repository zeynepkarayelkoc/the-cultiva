export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { authorSlug } from '@/lib/authorSlug'

const labels: Record<string, string> = { yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat', rehber: 'rehber', kitap: 'kitap' }

export default async function YaziPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

  return (
    <article style={{ minHeight: '100vh' }}>
      {/* Cover */}
      <div style={{
        height: '55vh', minHeight: 360,
        background: 'linear-gradient(135deg, #d4c0a0, #a08060)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, transparent 40%, rgba(245,240,232,0.95) 100%)',
        }} />
        {/* Kategori badge */}
        <div style={{
          position: 'absolute', top: '2rem', left: '2.5rem',
          fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'var(--terra)', background: 'rgba(245,240,232,0.9)',
          padding: '0.3rem 0.8rem', borderRadius: 50,
        }}>
          <Link href={`/${post.category}`}>{labels[post.category]}</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '-4rem auto 0', padding: '0 2.5rem 6rem', position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em',
          marginBottom: '1.2rem',
        }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {post.author_name && (
            <>
              <Link href={`/yazar/${authorSlug(post.author_name)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--terra)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', color: 'white', fontWeight: 600, flexShrink: 0,
                }}>
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500, borderBottom: '1px solid rgba(139,38,53,0.3)' }}>
                  {post.author_name}
                </span>
              </Link>
              <span style={{ color: 'var(--border)' }}>·</span>
            </>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{post.read_time} dk okuma</span>
        </div>

        {post.content ? (
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        ) : (
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text)', fontStyle: 'italic' }}>
            {post.excerpt}
          </p>
        )}

        {/* Back link */}
        <div style={{ marginTop: '4rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <Link href={`/${post.category}`} style={{
            fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--terra)', borderBottom: '1px solid rgba(181,115,74,0.3)',
          }}>
            ← {labels[post.category]} yazılarına dön
          </Link>
        </div>
      </div>
    </article>
  )
}
