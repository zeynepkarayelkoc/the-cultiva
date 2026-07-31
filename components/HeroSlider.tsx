'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Post = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  cover_url: string | null
  category: string
  created_at: string
  read_time: number
}

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

const defaultBg = 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80'

export default function HeroSlider({ slides, sideCards }: { slides: Post[]; sideCards: Post[] }) {
  const [idx, setIdx] = useState(0)

  // Otomatik geçiş — 5 saniyede bir
  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5000)
    return () => clearInterval(t)
  }, [slides.length])

  const current = slides[idx]
  if (!current) return null

  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length)
  const next = () => setIdx(i => (i + 1) % slides.length)

  const cardBg = (post: Post) =>
    post.cover_url ?? categoryImages[post.category] ?? defaultBg

  return (
    <section className="hero-slider-section">
      {/* Arka plan görseli — idx değişince fade */}
      <div
        key={current.id}
        className="hero-slider-bg anim-fade-in"
        style={{
          backgroundImage: current.cover_url
            ? `url(${current.cover_url})`
            : `url(${defaultBg})`,
        }}
      />
      <div className="hero-slider-overlay" />

      {/* SOL: featured yazı */}
      <div className="hero-slider-left">
        <div className="hero-badge">öne çıkan</div>

        <h1 className="hero-slider-title" key={current.id + '-title'}>
          {current.title}
        </h1>

        <p className="hero-slider-excerpt">
          {(current.excerpt ?? '').substring(0, 150)}{(current.excerpt?.length ?? 0) > 150 ? '…' : ''}
        </p>

        <Link href={`/yazi/${current.slug}`} className="hero-slider-btn">
          devamını oku →
        </Link>

        {slides.length > 1 && (
          <div className="hero-slider-controls">
            <button className="hero-slider-arrow" onClick={prev} aria-label="önceki">‹</button>
            <div className="hero-slider-dots">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIdx(i)}
                  className={`hero-dot${i === idx ? ' hero-dot-active' : ''}`}
                  aria-label={`${i + 1}. yazı`}
                />
              ))}
            </div>
            <button className="hero-slider-arrow" onClick={next} aria-label="sonraki">›</button>
          </div>
        )}
      </div>

      {/* SAĞ: magazine-style kartlar */}
      <div className="hero-slider-right">
        {sideCards.map((post, i) => (
          <Link
            key={post.id}
            href={`/yazi/${post.slug}`}
            className="hero-mag-card"
            style={{ animationDelay: `${0.15 + i * 0.12}s` }}
          >
            <div
              className="hero-mag-card-bg"
              style={{ backgroundImage: `url(${cardBg(post)})` }}
            />
            <div className="hero-mag-card-overlay" />
            <div className="hero-mag-card-content">
              <span
                className="hero-mag-card-cat"
                style={{ background: categoryColors[post.category] ?? '#8b2635' }}
              >
                {categoryLabels[post.category] ?? post.category}
              </span>
              <div className="hero-mag-card-title">
                {post.title.length > 58 ? post.title.substring(0, 58) + '…' : post.title}
              </div>
            </div>
            <span className="hero-mag-card-arrow">→</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
