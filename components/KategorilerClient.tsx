'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, input, btn, btnPrimary, th, td, label } from '@/lib/adminTheme'
import { authorSlug } from '@/lib/authorSlug'

type Cat = { id: string; name: string; slug: string; sort_order: number }

export default function KategorilerClient({
  categories, counts,
}: { categories: Cat[]; counts: Record<string, number> }) {
  const router = useRouter()
  const supabase = createClient()

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  const onName = (v: string) => {
    setName(v)
    if (!slugTouched) setSlug(authorSlug(v))
  }

  const add = async () => {
    setErr(''); setMsg('')
    const n = name.trim(), s = (slug.trim() || authorSlug(name))
    if (!n || !s) { setErr('Ad ve kısa ad gerekli.'); return }
    if (categories.some(c => c.slug === s)) { setErr('Bu kısa ad zaten kullanılıyor.'); return }
    setBusy(true)
    const max = categories.reduce((m, c) => Math.max(m, c.sort_order), 0)
    const { error } = await supabase.from('categories').insert({ name: n, slug: s, sort_order: max + 1 })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setName(''); setSlug(''); setSlugTouched(false); setMsg(`"${n}" eklendi.`)
    router.refresh()
  }

  const rename = async (c: Cat) => {
    const n = editName.trim()
    if (!n || n === c.name) { setEditing(null); return }
    await supabase.from('categories').update({ name: n }).eq('id', c.id)
    setEditing(null)
    router.refresh()
  }

  const remove = async (c: Cat) => {
    const used = counts[c.slug] ?? 0
    if (used > 0) {
      setErr(`"${c.name}" silinemez, ${used} yazı bu kategoride. Önce o yazıları başka kategoriye taşı.`)
      setMsg('')
      return
    }
    if (!confirm(`"${c.name}" kategorisi silinsin mi?`)) return
    await supabase.from('categories').delete().eq('id', c.id)
    setErr(''); setMsg(`"${c.name}" silindi.`)
    router.refresh()
  }

  return (
    <AdminShell title="Kategoriler">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20, alignItems: 'start' }}>
        {/* Ekleme formu */}
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, padding: 16 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 14 }}>Yeni kategori</div>

          <label style={label}>Ad</label>
          <input style={{ ...input, marginBottom: 12 }} value={name} placeholder="Mimari" onChange={e => onName(e.target.value)} />

          <label style={label}>Kısa ad (adres)</label>
          <input
            style={{ ...input, marginBottom: 6, fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }}
            value={slug} placeholder="mimari"
            onChange={e => { setSlug(e.target.value); setSlugTouched(true) }}
          />
          <div style={{ fontSize: '0.7rem', color: T.faint, marginBottom: 14 }}>
            thecultiva.com/{slug || 'kisa-ad'}
          </div>

          <button style={{ ...btnPrimary, width: '100%' }} onClick={add} disabled={busy}>
            {busy ? 'ekleniyor…' : 'Ekle'}
          </button>

          {err && <div style={{ marginTop: 12, fontSize: '0.78rem', color: T.danger, lineHeight: 1.5 }}>{err}</div>}
          {msg && <div style={{ marginTop: 12, fontSize: '0.78rem', color: T.green }}>{msg}</div>}
        </div>

        {/* Liste */}
        <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: 420, borderCollapse: 'collapse', tableLayout: 'fixed' }}>
            <thead>
              <tr>
                <th style={th}>Ad</th>
                <th style={{ ...th, width: 130 }}>Kısa ad</th>
                <th style={{ ...th, width: 70 }}>Yazı</th>
                <th style={{ ...th, width: 90 }} />
              </tr>
            </thead>
            <tbody>
              {categories.map(c => {
                const used = counts[c.slug] ?? 0
                return (
                  <tr key={c.id}>
                    <td style={td}>
                      {editing === c.id ? (
                        <input
                          autoFocus style={{ ...input, height: 30 }} value={editName}
                          onChange={e => setEditName(e.target.value)}
                          onBlur={() => rename(c)}
                          onKeyDown={e => { if (e.key === 'Enter') rename(c); if (e.key === 'Escape') setEditing(null) }}
                        />
                      ) : (
                        <button
                          onClick={() => { setEditing(c.id); setEditName(c.name) }}
                          style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', fontWeight: 500, color: T.text, cursor: 'pointer' }}
                        >
                          {c.name}
                        </button>
                      )}
                    </td>
                    <td style={{ ...td, color: T.muted, fontFamily: 'ui-monospace, monospace', fontSize: '0.78rem' }}>{c.slug}</td>
                    <td style={{ ...td, color: T.faint }}>{used}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <button
                        onClick={() => remove(c)}
                        title={used > 0 ? `${used} yazı kullanıyor` : 'Sil'}
                        style={{ background: 'none', border: 'none', font: 'inherit', fontSize: '0.75rem', color: used > 0 ? T.faint : T.danger, cursor: 'pointer' }}
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div style={{ padding: '10px 12px', fontSize: '0.72rem', color: T.faint, borderTop: `1px solid ${T.borderSoft}` }}>
            Adı değiştirmek için üzerine tıkla. Yazısı olan kategori silinemez.
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
