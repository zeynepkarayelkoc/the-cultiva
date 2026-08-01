'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, input, btnPrimary, th, td } from '@/lib/adminTheme'
import { authorSlug } from '@/lib/authorSlug'

type Satir = {
  id: string; slug: string; title: string; type: string
  published: boolean; created_at: string; soru: number; cozum: number
}

export default function TestlerClient({ quizzes }: { quizzes: Satir[] }) {
  const router = useRouter()
  const supabase = createClient()
  const [ad, setAd] = useState('')
  const [tip, setTip] = useState('bilgi')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const olustur = async () => {
    const t = ad.trim()
    if (!t) return
    const slug = authorSlug(t)
    if (!slug) { setErr('Başlıkta en az bir harf ya da rakam olmalı.'); return }
    setBusy(true); setErr('')
    const { data, error } = await supabase
      .from('quizzes')
      .insert({ slug, title: t, type: tip, published: false })
      .select('id').single()
    setBusy(false)
    if (error) { setErr(error.message); return }
    router.push(`/admin/test/${data.id}`)
  }

  const sil = async (q: Satir) => {
    if (!confirm(`"${q.title}" ve tüm soruları silinecek. Emin misin?`)) return
    await supabase.from('quizzes').delete().eq('id', q.id)
    router.refresh()
  }

  return (
    <AdminShell
      title="Testler"
      action={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input style={{ ...input, width: 190, height: 36 }} placeholder="Yeni test adı"
            value={ad} onChange={e => setAd(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') olustur() }} />
          <select style={{ ...input, width: 'auto', height: 36 }} value={tip} onChange={e => setTip(e.target.value)}>
            <option value="bilgi">Bilgi testi</option>
            <option value="kisilik">Kişilik testi</option>
          </select>
          <button style={btnPrimary} onClick={olustur} disabled={busy || !ad.trim()}>Oluştur</button>
        </div>
      }
    >
      {err && <div style={{ marginBottom: 12, fontSize: '0.82rem', color: T.danger }}>{err}</div>}

      {quizzes.length === 0 ? (
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 40, textAlign: 'center', color: T.muted }}>
          <div style={{ fontSize: '0.95rem', marginBottom: 6 }}>Henüz test yok</div>
          <div style={{ fontSize: '0.82rem', color: T.faint }}>Yukarıdan bir ad yazıp oluştur.</div>
        </div>
      ) : (
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 620, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={th}>Başlık</th>
                <th style={{ ...th, width: 110 }}>Tip</th>
                <th style={{ ...th, width: 70 }}>Soru</th>
                <th style={{ ...th, width: 80 }}>Çözüm</th>
                <th style={{ ...th, width: 92 }}>Durum</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map(q => (
                <tr key={q.id}>
                  <td style={td}>
                    <Link href={`/admin/test/${q.id}`} style={{ color: T.text, fontWeight: 500, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {q.title}
                    </Link>
                    <span style={{ fontSize: '0.72rem', color: T.faint }}>
                      <Link href={`/admin/test/${q.id}`} style={{ color: T.terra, textDecoration: 'none' }}>Düzenle</Link>
                      {' · '}
                      <a href={`/test/${q.slug}`} target="_blank" rel="noopener" style={{ color: T.terra, textDecoration: 'none' }}>Önizle</a>
                      {' · '}
                      <button onClick={() => sil(q)} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: T.danger, cursor: 'pointer' }}>Sil</button>
                    </span>
                  </td>
                  <td style={{ ...td, color: T.muted }}>{q.type === 'bilgi' ? 'Bilgi' : 'Kişilik'}</td>
                  <td style={{ ...td, color: T.faint }}>{q.soru}</td>
                  <td style={{ ...td, color: T.faint }}>{q.cozum}</td>
                  <td style={td}>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 9px', borderRadius: 20,
                      background: q.published ? T.greenSoft : T.amberSoft,
                      color: q.published ? T.green : T.amber,
                    }}>
                      {q.published ? 'Yayında' : 'Taslak'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminShell>
  )
}
