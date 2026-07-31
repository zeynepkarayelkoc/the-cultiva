export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import WelcomeScreen from '@/components/WelcomeScreen'
import HeroSlider from '@/components/HeroSlider'
import AdBanner from '@/components/AdBanner'

const categoryColors: Record<string, string> = {
  yasam: '#8b2635', seyahat: '#1e3a5f', sanat: '#5c3460',
  sinema: '#7a3b5c', rehber: '#2d5a3d', kitap: '#7a4f1a',
}
const categoryLabels: Record<string, string> = {
  yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat',
  sinema: 'sinema', rehber: 'rehber', kitap: 'kitap',
}
const categoryImages: Record<string, string> = {
  yasam: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  seyahat: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  sanat: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=800&q=80',
  sinema: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
  rehber: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80',
  kitap: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
}

const editorialCats = [
  { slug: 'yasam',   label: 'yaşam' },
  { slug: 'seyahat', label: 'seyahat' },
  { slug: 'sanat',   label: 'sanat' },
]

export default async function Home() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  // Öne çıkan yazılar + slider ayarı
  const [{ data: featuredPosts }, { data: sliderSetting }] = await Promise.all([
    supabase
      .from('posts')
      .select('*')
      .eq('published', true)
      .eq('featured', true)
      .order('featured_order', { ascending: true })
      .limit(5),
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'slider_interval')
      .single(),
  ])

  // Slider: önce featured, yoksa en yeni 5
  const slides = (featuredPosts && featuredPosts.length > 0)
    ? featuredPosts
    : (posts?.slice(0, 5) ?? [])

  const sliderInterval = Number(sliderSetting?.value ?? 8000)
  const gridPosts = posts?.slice(5, 14) ?? []

  const byCategory = (cat: string) =>
    (posts ?? []).filter(p => p.category === cat).slice(0, 4)

  return (
    <>
      <WelcomeScreen />

      {/* ── TAM EKRAN HERO ── */}
      <HeroSlider slides={slides} interval={sliderInterval} />

      {/* ── REKLAM: Hero Altı Banner ── */}
      <AdBanner
        slot="1234567890"
        format="horizontal"
        style={{ padding: '0.75rem 2rem', background: '#f5f0e8', borderBottom: '1px solid rgba(42,31,24,0.07)' }}
      />

      {/* ── EDİTORYAL KATEGORİ BÖLÜMÜ ── */}
      <section className="editorial-section">
        {editorialCats.map(({ slug, label }) => {
          const catPosts = byCategory(slug)
          const featured = catPosts[0]
          const rest = catPosts.slice(1)
          return (
            <div key={slug} className="editorial-col">
              {/* Başlık */}
              <div className="editorial-col-header">
                <h2 className="editorial-col-title">{label}</h2>
                <Link href={`/${slug}`} className="editorial-col-link">
                  tümü →
                </Link>
              </div>
              <div className="editorial-col-divider" />

              {/* Featured görsel */}
              {featured && (
                <Link href={`/yazi/${featured.slug}`} className="editorial-img-link">
                  <div
                    className="editorial-img"
                    style={{
                      backgroundImage: featured.cover_url
                        ? `url(${featured.cover_url})`
                        : `url(${categoryImages[slug] ?? ''})`,
                    }}
                  />
                </Link>
              )}

              {/* Yazı listesi */}
              <div className="editorial-list">
                {(featured ? [featured, ...rest] : rest).map((post, i) => (
                  <Link key={post.id} href={`/yazi/${post.slug}`} className="editorial-list-item">
                    <span className="editorial-list-num">{String(i + 1).padStart(2, '0')}</span>
                    <span className="editorial-list-title">{post.title}</span>
                  </Link>
                ))}
              </div>
            </div>
          )
        })}
      </section>

      {/* ── SON YAZILAR ── */}
      <section className="section-pad" style={{ padding: '5rem 2.5rem', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
          marginBottom: '2.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem',
        }}>
          <h2 style={{ fontSize: '1.6rem', color: '#2a1f18', fontFamily: "'Playfair Display', serif" }}>
            Son Yazılar
          </h2>
          <Link href="/yasam" style={{ fontSize: '0.75rem', color: '#8b2635', letterSpacing: '0.08em' }}>
            tümünü gör →
          </Link>
        </div>
        <div className="post-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
          {gridPosts.map(post => (
            <Link key={post.id} href={`/yazi/${post.slug}`} className="card-hover" style={{
              background: 'white', borderRadius: 14, overflow: 'hidden',
              border: '1px solid var(--border)', display: 'block',
              boxShadow: '0 2px 12px rgba(0,0,0,0.05)',
            }}>
              <div style={{
                height: 200,
                background: categoryColors[post.category] ?? '#8b2635',
                backgroundImage: post.cover_url
                  ? `url(${post.cover_url})`
                  : `url(${categoryImages[post.category] ?? ''})`,
                backgroundSize: 'cover', backgroundPosition: 'center',
              }} />
              <div style={{ padding: '1.2rem' }}>
                <span style={{
                  fontSize: '0.56rem', letterSpacing: '0.22em', textTransform: 'uppercase',
                  color: categoryColors[post.category] ?? '#8b2635',
                  fontWeight: 700, display: 'block', marginBottom: '0.5rem',
                }}>
                  {categoryLabels[post.category]}
                </span>
                <h3 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: '1rem', fontWeight: 400, lineHeight: 1.35,
                  marginBottom: '0.6rem', color: '#2a1f18',
                }}>
                  {post.title}
                </h3>
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
              <a key={l} href="#" style={{ fontSize: '0.72rem', color: 'rgba(42,31,24,0.5)', letterSpacing: '0.06em' }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </>
  )
}
