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

const categoryLabels: Record<string, string> = {
  yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat',
  sinema: 'sinema', rehber: 'rehber', kitap: 'kitap',
}

const defaultBg = 'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?w=1600&q=80'

export default function HeroSlider({ slides }: { slides: Post[] }) {
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIdx(i => (i + 1) % slides.length), 5500)
    return () => clearInterval(t)
  }, [slides.length])

  const current = slides[idx]
  if (!current) return null

  const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length)
  const next = () => setIdx(i => (i + 1) % slides.length)

  return (
    <section className="hero-full">
      {/* Arka plan */}
      <div
        key={current.id}
        className="hero-full-bg anim-fade-in"
        style={{
          backgroundImage: current.cover_url
            ? `url(${current.cover_url})`
            : `url(${defaultBg})`,
        }}
      />
      <div className="hero-full-overlay" />

      {/* İçerik */}
      <div className="hero-full-content">
        <div className="hero-badge">
          {categoryLabels[current.category] ?? current.category}
        </div>
        <h1 className="hero-full-title">{current.title}</h1>
        <Link href={`/yazi/${current.slug}`} className="hero-full-btn">
          devamını oku
        </Link>
      </div>

      {/* Ok butonları */}
      <button className="hero-full-arrow hero-arrow-left" onClick={prev} aria-label="önceki">‹</button>
      <button className="hero-full-arrow hero-arrow-right" onClick={next} aria-label="sonraki">›</button>

      {/* Dots */}
      {slides.length > 1 && (
        <div className="hero-full-dots">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`hero-dot${i === idx ? ' hero-dot-active' : ''}`}
              aria-label={`${i + 1}. yazı`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
