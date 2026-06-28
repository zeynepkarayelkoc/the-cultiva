export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WelcomeScreen from '@/components/WelcomeScreen'

const categoryColors: Record<string, string> = {
  yasam: '#8b2635', seyahat: '#1e3a5f', sanat: '#5c3460',
  sinema: '#7a3b5c', rehber: '#2d5a3d', kitap: '#7a4f1a',
}

const categoryLabels: Record<string, string> = {
  yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat',
  sinema: 'sinema', rehber: 'rehber', kitap: 'kitap',
}

// Kategori başına güzel unsplash fotoğrafları
const categoryImages: Record<string, string> = {
  yasam: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  seyahat: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
  sanat: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&q=80',
  sinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  rehber: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
  kitap: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
}

const heroImage = 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80'

export default async function Home() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const featured = posts?.[0]
  const rest = posts?.slice(1, 7) ?? []

  return (
    <>
      <WelcomeScreen />

      {/* ── NAVBAR SPACER (sticky nav var) ── */}

      {/* ── HERO ── */}
      <section className="hero-section" style={{
        minHeight: '92vh',
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        overflow: 'hidden',
      }}>
        {/* Full-boy arka plan görseli */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: featured?.cover_url
            ? `url(${featured.cover_url})`
            : `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'brightness(0.45) saturate(0.8)',
        }} />
        {/* Koyu gradient overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(105deg, rgba(10,6,4,0.75) 0%, rgba(10,6,4,0.3) 60%, transparent 100%)',
        }} />

        {/* Sol — yazı */}
        <div className="hero-text" style={{
          position: 'relative', zIndex: 2,
          padding: '7rem 3rem 5rem 5rem',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '1.5rem',
        }}>
          <div className="anim-fade-up anim-delay-1" style={{
            fontSize: '0.65rem', letterSpacing: '0.35em', textTransform: 'uppercase',
            color: '#c8956a', fontWeight: 600,
          }}>öne çıkan</div>

          <h1 className="anim-fade-up anim-delay-2" style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(2.4rem, 5vw, 4rem)', lineHeight: 1.1,
            letterSpacing: '-0.01em', color: '#f5e8d0',
            textShadow: '0 2px 20px rgba(0,0,0,0.5)',
          }}>
            {featured ? (
              <>
                {featured.title.split(' ').slice(0, 4).join(' ')}<br />
                <em style={{ fontStyle: 'italic', color: '#e8b080' }}>
                  {featured.title.split(' ').slice(4).join(' ')}
                </em>
              </>
            ) : (
              <em style={{ fontStyle: 'italic', color: '#e8b080' }}>The Cultiva</em>
            )}
          </h1>

          {featured && (
            <p className="anim-fade-up anim-delay-3" style={{ fontSize: '0.95rem', color: 'rgba(245,232,208,0.75)', lineHeight: 1.8, maxWidth: 380 }}>
              {featured.excerpt}
            </p>
          )}

          {featured && (
            <Link href={`/yazi/${featured.slug}`} className="anim-fade-up anim-delay-4 btn-primary" style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
              padding: '0.85rem 2rem',
              background: '#8b2635',
              color: '#f5e8d0',
              fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase',
              borderRadius: '50px', width: 'fit-content',
              fontWeight: 600,
              boxShadow: '0 4px 20px rgba(139,38,53,0.5)',
              transition: 'all 0.25s',
            }}>devamını oku →</Link>
          )}
        </div>

        {/* Sağ — stacked cards */}
        <div className="hero-cards" style={{
          position: 'relative', zIndex: 2,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem',
        }}>
          {rest.slice(0, 3).map((post, i) => {
            const rotations = [-7, 1, 9]
            const translates = ['-80px, 8px', '10px, -24px', '90px, 12px']
            const zIndexes = [3, 5, 2]
            const floatClasses = ['stack-card-0', 'stack-card-1', 'stack-card-2']
            return (
              <Link key={post.id} href={`/yazi/${post.slug}`} className={floatClasses[i]} style={{
                position: 'absolute', width: 190,
                background: 'white', borderRadius: 16, overflow: 'hidden',
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
                transform: `rotate(${rotations[i]}deg) translate(${translates[i]})`,
                zIndex: zIndexes[i],
              }}>
                <div style={{
                  height: 130,
                  background: categoryColors[post.category] ?? '#8b2635',
                  backgroundImage: `url(${categoryImages[post.category] ?? heroImage})`,
                  backgroundSize: 'cover', backgroundPosition: 'center',
                  filter: 'brightness(0.75)',
                }} />
                <div style={{ padding: '0.7rem 0.9rem 1rem' }}>
                  <div style={{
                    fontSize: '0.55rem', letterSpacing: '0.2em', textTransform: 'uppercase',
                    color: categoryColors[post.category] ?? '#8b2635',
                    fontWeight: 700, marginBottom: '0.35rem',
                  }}>
                    {categoryLabels[post.category]}
                  </div>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: '0.82rem', lineHeight: 1.35, color: '#2a1f18',
                  }}>
                    {post.title.substring(0, 45)}...
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── KATEGORİLER ── */}
      <section className="section-pad" style={{ background: '#1e1410', padding: '3rem 2.5rem' }}>
        <div className="cat-row" style={{ maxWidth: 900, margin: '0 auto', display: 'flex', justifyContent: 'center', gap: '2.5rem', flexWrap: 'wrap' }}>
          {[
            { href: '/yasam', label: 'yaşam', color: '#8b2635' },
            { href: '/seyahat', label: 'seyahat', color: '#1e3a5f' },
            { href: '/sanat', label: 'sanat', color: '#5c3460' },
            { href: '/sinema', label: 'sinema', color: '#7a3b5c' },
            { href: '/rehber', label: 'rehber', color: '#2d5a3d' },
            { href: '/kitap', label: 'kitap', color: '#7a4f1a' },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.7rem' }}>
              <div className="cat-circle" style={{
                width: 80, height: 80, borderRadius: '50%',
                background: color,
                border: '2px solid rgba(245,232,208,0.15)',
                boxShadow: `0 4px 20px ${color}55`,
              }} />
              <span style={{
                fontSize: '0.7rem', letterSpacing: '0.15em', textTransform: 'uppercase',
                color: 'rgba(245,232,208,0.7)', fontWeight: 500,
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
          <Link href="/yasam" style={{ fontSize: '0.75rem', color: '#8b2635', letterSpacing: '0.08em' }}>tümünü gör →</Link>
        </div>
        <div className="post-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {rest.map(post => (
            <Link key={post.id} href={`/yazi/${post.slug}`} className="card-hover" style={{
              background: 'white', borderRadius: 16, overflow: 'hidden',
              border: '1px solid var(--border)', display: 'block',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                height: 190,
                background: categoryColors[post.category] ?? '#8b2635',
                backgroundImage: `url(${categoryImages[post.category] ?? heroImage})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: 'brightness(0.8)',
              }} />
              <div style={{ padding: '1.3rem' }}>
                <span style={{
                  display: 'inline-block', fontSize: '0.58rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: categoryColors[post.category] ?? '#8b2635',
                  fontWeight: 700, marginBottom: '0.6rem',
                }}>{categoryLabels[post.category]}</span>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1rem', fontWeight: 400, lineHeight: 1.35,
                  marginBottom: '0.5rem', color: '#2a1f18',
                }}>
                  {post.title}
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#6a5a4a', lineHeight: 1.65, marginBottom: '0.8rem' }}>
                  {post.excerpt?.substring(0, 90)}...
                </p>
                <div style={{ fontSize: '0.65rem', color: '#9a8a7a' }}>
                  {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })} · {post.read_time} dk
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: '#1e1410', borderTop: '1px solid rgba(245,232,208,0.08)', padding: '2.5rem' }}>
        <div className="site-footer" style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <span style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: '#c8956a', fontSize: '1.1rem' }}>The Cultiva</span>
          <p style={{ fontSize: '0.72rem', color: 'rgba(245,232,208,0.4)' }}>© 2026 The Cultiva — yaşam, sanat & seyahat</p>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            {['instagram', 'iletişim', 'hakkında'].map(l => (
              <a key={l} href="#" style={{ fontSize: '0.72rem', color: 'rgba(245,232,208,0.45)', letterSpacing: '0.06em' }}>{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
