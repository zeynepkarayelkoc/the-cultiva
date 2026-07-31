export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WelcomeScreen from '@/components/WelcomeScreen'
import HeroSlider from '@/components/HeroSlider'

const categoryColors: Record<string, string> = {
  yasam: '#8b2635', seyahat: '#1e3a5f', sanat: '#5c3460',
  sinema: '#7a3b5c', rehber: '#2d5a3d', kitap: '#7a4f1a',
}

const categoryLabels: Record<string, string> = {
  yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat',
  sinema: 'sinema', rehber: 'rehber', kitap: 'kitap',
}

const categoryImages: Record<string, string> = {
  yasam: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  seyahat: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
  sanat: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&q=80',
  sinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  rehber: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
  kitap: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
}

export default async function Home() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const slides = posts?.slice(0, 5) ?? []
  const sideCards = posts?.slice(5, 8) ?? []
  const gridPosts = posts?.slice(8, 14) ?? []

  return (
    <>
      <WelcomeScreen />

      <HeroSlider slides={slides} sideCards={sideCards} />

      {/* ── KATEGORİLER ── */}
      <section style={{
        background: '#f5f0e8',
        padding: '3rem 2.5rem',
        borderTop: '1px solid rgba(42,31,24,0.08)',
        borderBottom: '1px solid rgba(42,31,24,0.08)',
      }}>
        <div className="cat-row" style={{
          maxWidth: 900, margin: '0 auto',
          display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap',
        }}>
          {[
            { href: '/yasam',   label: 'yaşam',   color: '#8b2635' },
            { href: '/seyahat', label: 'seyahat', color: '#1e3a5f' },
            { href: '/sanat',   label: 'sanat',   color: '#5c3460' },
            { href: '/sinema',  label: 'sinema',  color: '#7a3b5c' },
            { href: '/rehber',  label: 'rehber',  color: '#2d5a3d' },
            { href: '/kitap',   label: 'kitap',   color: '#7a4f1a' },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem',
            }}>
              <div className="cat-circle" style={{
                width: 80, height: 80, borderRadius: '50%',
                background: color,
                border: '3px solid white',
                boxShadow: `0 4px 20px ${color}35`,
              }} />
              <span style={{
                fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(42,31,24,0.55)', fontWeight: 600,
              }}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── SON YAZILAR ── */}
      <section className="section-pad" style={{ padding: '5rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
        }}>
          <h2 style={{ fontSize: '1.6rem', color: '#2a1f18' }}>Son Yazılar</h2>
          <Link href="/yasam" style={{ fontSize: '0.75rem', color: '#8b2635', letterSpacing: '0.08em' }}>
            tümünü gör →
          </Link>
        </div>
        <div className="post-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {gridPosts.map(post => (
            <Link key={post.id} href={`/yazi/${post.slug}`} className="card-hover" style={{
              background: 'white', borderRadius: 16, overflow: 'hidden',
              border: '1px solid var(--border)', display: 'block',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                height: 190,
                background: categoryColors[post.category] ?? '#8b2635',
                backgroundImage: post.cover_url
                  ? `url(${post.cover_url})`
                  : `url(${categoryImages[post.category] ?? ''})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'brightness(0.82)',
              }} />
              <div style={{ padding: '1.3rem' }}>
                <span style={{
                  display: 'inline-block', fontSize: '0.58rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: categoryColors[post.category] ?? '#8b2635',
                  fontWeight: 700, marginBottom: '0.6rem',
                }}>
                  {categoryLabels[post.category]}
                </span>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1rem', fontWeight: 400, lineHeight: 1.35,
                  marginBottom: '0.5rem', color: '#2a1f18',
                }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6a5a4a', lineHeight: 1.65, marginBottom: '0.8rem' }}>
                  {post.excerpt?.substring(0, 90)}…
                </p>
                <div style={{ fontSize: '0.65rem', color: '#9a8a7a' }}>
                  {new Date(post.created_at).toLocaleDateString('tr-TR', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })} · {post.read_time} dk
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{
        background: '#ede6d8',
        borderTop: '1px solid rgba(42,31,24,0.1)',
        padding: '2.5rem',
      }}>
        <div className="site-footer" style={{
          maxWidth: 1100, margin: '0 auto',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1rem',
        }}>
          <span style={{
            fontFamily: "'Playfair Display', serif",
            fontStyle: 'italic', color: '#8b2635', fontSize: '1.1rem',
          }}>The Cultiva</span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(42,31,24,0.4)' }}>
            © 2026 The Cultiva — yaşam, sanat & seyahat
          </p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['instagram', 'iletişim', 'hakkında'].map(l => (
              <a key={l} href="#" style={{
                fontSize: '0.72rem', color: 'rgba(42,31,24,0.5)', letterSpacing: '0.06em',
              }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
