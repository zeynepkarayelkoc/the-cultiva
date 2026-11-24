import Link from 'next/link'
import { coverStyle } from '@/lib/coverUrl'
import { METIN } from '@/lib/i18n'

// İngilizce bölümün kart listeleri (/en ve /en/quizzes).

const izgara: React.CSSProperties = {
  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem',
}
const kart: React.CSSProperties = {
  background: '#fff', borderRadius: 14, overflow: 'hidden',
  border: '1px solid var(--border)', display: 'block', textDecoration: 'none', color: 'inherit',
}
const etiket: React.CSSProperties = {
  display: 'inline-block', fontSize: '0.58rem', letterSpacing: '0.2em',
  textTransform: 'uppercase', color: 'var(--terra)', fontWeight: 700, marginBottom: '0.6rem',
}
const kartBaslik: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.35, marginBottom: '0.5rem',
}
const ozet: React.CSSProperties = { fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, margin: 0 }

const kisalt = (s: string | null, n = 110) => (s ? (s.length > n ? s.slice(0, n) + '…' : s) : '')

export type EnYazi = { slug: string; title: string; excerpt: string | null; cover_url: string | null; category: string | null; read_time: number | null }
export type EnTest = { id: string; slug: string; title: string; description: string | null; cover_url: string | null; type: string; category: string | null; play_count: number }

export function YaziKartlari({ yazilar }: { yazilar: EnYazi[] }) {
  return (
    <div style={izgara}>
      {yazilar.map(y => (
        <Link key={y.slug} href={`/yazi/${y.slug}`} style={kart}>
          <div style={{ height: 170, ...coverStyle(y) }} />
          <div style={{ padding: '1.3rem' }}>
            <span style={etiket}>{y.read_time ? `${y.read_time} ${METIN.en.dkOkuma}` : 'article'}</span>
            <h3 style={kartBaslik}>{y.title}</h3>
            {y.excerpt && <p style={ozet}>{kisalt(y.excerpt)}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}

export function TestKartlari({ testler }: { testler: EnTest[] }) {
  return (
    <div style={izgara}>
      {testler.map(q => (
        <Link key={q.id} href={`/en/quiz/${q.slug}`} style={kart}>
          <div style={{ height: 170, ...coverStyle({ cover_url: q.cover_url, category: q.category }) }} />
          <div style={{ padding: '1.3rem' }}>
            <span style={etiket}>{q.type === 'bilgi' ? METIN.en.bilgiTesti : METIN.en.kisilikTesti}</span>
            <h3 style={kartBaslik}>{q.title}</h3>
            {q.description && <p style={ozet}>{kisalt(q.description, 96)}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}
