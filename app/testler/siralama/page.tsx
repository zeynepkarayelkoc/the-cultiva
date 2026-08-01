export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export const metadata = { title: 'Şampiyonluk tablosu' }

type Satir = { id: string; ad: string; puan: number; test: number; dogru: number; toplam: number }

export default async function SiralamaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: denemeler } = await supabase
    .from('quiz_attempts')
    .select('user_id,score,correct_count,total')
    .not('user_id', 'is', null)

  const { data: profiller } = await supabase.from('profiles').select('id,full_name,email')

  const adlar: Record<string, string> = {}
  ;(profiller ?? []).forEach(p => {
    adlar[p.id] = p.full_name || (p.email ? p.email.split('@')[0] : 'Anonim')
  })

  const toplu: Record<string, Satir> = {}
  ;(denemeler ?? []).forEach(d => {
    const id = d.user_id as string
    if (!toplu[id]) toplu[id] = { id, ad: adlar[id] ?? 'Anonim', puan: 0, test: 0, dogru: 0, toplam: 0 }
    toplu[id].puan += d.score ?? 0
    toplu[id].test += 1
    toplu[id].dogru += d.correct_count ?? 0
    toplu[id].toplam += d.total ?? 0
  })

  const siralama = Object.values(toplu).sort((a, b) => b.puan - a.puan)
  const benimSira = user ? siralama.findIndex(s => s.id === user.id) + 1 : 0

  const madalya = ['#c9a227', '#a8a8a8', '#b07a4a']

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <Link href="/testler" style={{ fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--terra)', textDecoration: 'none' }}>
        ← testler
      </Link>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.9rem, 5vw, 2.4rem)', fontWeight: 400, margin: '1.2rem 0 0.4rem' }}>
        Şampiyonluk tablosu
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.92rem', marginBottom: '2rem' }}>
        Toplam puana göre sıralama. Her doğru 100 puan, hızlı çözene süre bonusu.
      </p>

      {siralama.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Henüz kimse test çözmemiş. İlk sen ol.</p>
      ) : (
        <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          {siralama.map((s, idx) => {
            const ben = user && s.id === user.id
            return (
              <div key={s.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.9rem',
                padding: '0.9rem 1.2rem', borderBottom: '1px solid var(--border)',
                background: ben ? 'rgba(181,115,74,0.07)' : 'transparent',
              }}>
                <span style={{
                  width: 26, textAlign: 'center', fontFamily: "'Playfair Display', serif",
                  fontSize: '1.05rem', color: idx < 3 ? madalya[idx] : 'var(--muted)',
                  fontWeight: idx < 3 ? 700 : 400,
                }}>{idx + 1}</span>
                <span style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: ben ? 'var(--terra)' : 'rgba(42,31,24,0.08)',
                  color: ben ? '#fff' : 'var(--muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem',
                }}>{s.ad.charAt(0).toLocaleUpperCase('tr')}</span>
                <span style={{ flex: 1, fontSize: '0.95rem', fontWeight: ben ? 600 : 400, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {s.ad}{ben ? ' (sen)' : ''}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--muted)', whiteSpace: 'nowrap' }}>
                  {s.test} test · %{s.toplam ? Math.round(s.dogru / s.toplam * 100) : 0}
                </span>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.1rem', minWidth: 64, textAlign: 'right' }}>
                  {s.puan.toLocaleString('tr-TR')}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {user && benimSira > 0 && (
        <p style={{ marginTop: '1.2rem', fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center' }}>
          {siralama.length} kişi arasında <strong style={{ color: 'var(--terra)' }}>{benimSira}.</strong> sıradasın.
        </p>
      )}
      {!user && (
        <p style={{ marginTop: '1.2rem', fontSize: '0.88rem', color: 'var(--muted)', textAlign: 'center' }}>
          Sıralamaya girmek için <Link href="/giris" style={{ color: 'var(--terra)' }}>giriş yap</Link>.
        </p>
      )}
    </div>
  )
}
