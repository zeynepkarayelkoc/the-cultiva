export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { coverStyle } from '@/lib/coverUrl'

export const metadata = {
  title: 'Testler',
  description: 'Sanat, sinema ve kültür testleri. Kaç doğru yapacaksın?',
}

export default async function TestlerPage() {
  const supabase = await createClient()
  const { data: quizzes } = await supabase
    .from('quizzes')
    .select('id,slug,title,description,cover_url,type,category,play_count')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const liste = quizzes ?? []

  return (
    <div style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 400, marginBottom: '0.4rem' }}>
            Testler
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: 0 }}>
            Bilgini sına, kendini keşfet, sıralamaya gir.
          </p>
        </div>
        <Link href="/testler/siralama" style={{
          fontSize: '0.8rem', letterSpacing: '0.08em', textTransform: 'uppercase',
          color: 'var(--terra)', border: '1px solid var(--border)', borderRadius: 50,
          padding: '0.55rem 1.2rem', textDecoration: 'none', whiteSpace: 'nowrap',
        }}>
          şampiyonluk tablosu →
        </Link>
      </div>

      {liste.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Henüz yayında test yok.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {liste.map(q => (
            <Link key={q.id} href={`/test/${q.slug}`} style={{
              background: '#fff', borderRadius: 14, overflow: 'hidden',
              border: '1px solid var(--border)', display: 'block', textDecoration: 'none', color: 'inherit',
            }}>
              <div style={{ height: 170, ...coverStyle({ cover_url: q.cover_url, category: q.category }) }} />
              <div style={{ padding: '1.3rem' }}>
                <span style={{
                  display: 'inline-block', fontSize: '0.58rem', letterSpacing: '0.2em',
                  textTransform: 'uppercase', color: 'var(--terra)', fontWeight: 700, marginBottom: '0.6rem',
                }}>
                  {q.type === 'bilgi' ? 'bilgi testi' : 'kişilik testi'}
                </span>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', fontWeight: 400, lineHeight: 1.35, marginBottom: '0.5rem' }}>
                  {q.title}
                </h2>
                {q.description && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', lineHeight: 1.65, marginBottom: '0.8rem' }}>
                    {q.description.slice(0, 96)}{q.description.length > 96 ? '…' : ''}
                  </p>
                )}
                <div style={{ fontSize: '0.7rem', color: 'var(--muted)', opacity: 0.7 }}>
                  {q.play_count.toLocaleString('tr-TR')} kişi çözdü
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
