'use client'

import { useState } from 'react'
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

const defaultBg = 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80'

export default function HeroSlider({ slides, sideCards }: { slides: Post[]; sideCards: Post[] }) {
  const [idx, setIdx] = useState(0)
  const current = slides[idx]
  if (!current) return null

  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length)
  const next = () => setIdx(i => (i + 1) % slides.length)

  return (
    <section className="hero-slider-section">
      {/* Arka plan görseli */}
      <div
        key={current.id}
        className="hero-slider-bg"
        style={{
          backgroundImage: current.cover_url
            ? `url(${current.cover_url})`
            : `url(${defaultBg})`,
        }}
      />
      {/* Sol koyu gradient */}
      <div className="hero-slider-overlay" />
      {/* Sağ panel arka planı */}
      <div className="hero-side-panel" />

      {/* SOL: featured yazı */}
      <div className="hero-slider-left">
        <div className="hero-badge">öne çıkan</div>

        <h1 className="hero-slider-title">{current.title}</h1>

        <p className="hero-slider-excerpt">
          {(current.excerpt ?? '').substring(0, 160)}{(current.excerpt?.length ?? 0) > 160 ? '…' : ''}
        </p>

        <Link href={`/yazi/${current.slug}`} className="hero-slider-btn">
          devamını oku →
        </Link>

        {/* Slider kontrolleri */}
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

      {/* SAĞ: mini kart listesi */}
      <div className="hero-slider-right">
        {sideCards.map(post => (
          <Link key={post.id} href={`/yazi/${post.slug}`} className="hero-mini-card">
            <div
              className="hero-mini-card-img"
              style={{
                background: `${categoryColors[post.category] ?? '#8b2635'}`,
                backgroundImage: post.cover_url ? `url(${post.cover_url})` : undefined,
              }}
            />
            <div className="hero-mini-card-body">
              <span
                className="hero-mini-card-cat"
                style={{ color: categoryColors[post.category] ?? '#8b2635' }}
              >
                {categoryLabels[post.category] ?? post.category}
              </span>
              <div className="hero-mini-card-title">
                {post.title.length > 65 ? post.title.substring(0, 65) + '…' : post.title}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
