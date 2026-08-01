'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, input, btn, btnPrimary, th, td, label } from '@/lib/adminTheme'
import { authorSlug } from '@/lib/authorSlug'

type Author = {
  id: string; name: string; slug: string
  email: string | null; bio: string | null; avatar_url: string | null
}

export default function YazarlarClient({
  authors, counts,
}: { authors: Author[]; counts: Record<string, number> }) {
  const router = useRouter()
  const supabase = createClient()

  const [open, setOpen] = useState<string | null>(null)
  const [draft, setDraft] = useState<Partial<Author>>({})
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [newName, setNewName] = useState('')

  const edit = (a: Author) => {
    setOpen(open === a.id ? null : a.id)
    setDraft({ ...a }); setErr(''); setMsg('')
  }

  const save = async (a: Author) => {
    const newName = (draft.name ?? '').trim()
    if (!newName) { setErr('Ad boş olamaz.'); return }
    setBusy(true); setErr(''); setMsg('')

    const patch: Record<string, unknown> = {
      name: newName,
      email: (draft.email ?? '') || null,
      bio: (draft.bio ?? '') || null,
      avatar_url: (draft.avatar_url ?? '') || null,
    }
    // Ad değiştiyse slug'ı da tazele ve yazılardaki ismi güncelle
    if (newName !== a.name) patch.slug = authorSlug(newName)

    const { error } = await supabase.from('authors').update(patch).eq('id', a.id)
    if (error) { setBusy(false); setErr(error.message); return }

    let moved = 0
    if (newName !== a.name) {
      const { count } = await supabase
        .from('posts')
        .update({ author_name: newName }, { count: 'exact' })
        .eq('author_name', a.name)
      moved = count ?? 0
    }
    setBusy(false); setOpen(null)
    setMsg(moved > 0 ? `Kaydedildi. ${moved} yazıdaki isim de güncellendi.` : 'Kaydedildi.')
    router.refresh()
  }

  const add = async () => {
    const n = newName.trim()
    if (!n) return
    const s = authorSlug(n)
    if (authors.some(a => a.slug === s)) { setErr('Bu isimde bir yazar zaten var.'); return }
    setBusy(true); setErr('')
    const { error } = await supabase.from('authors').insert({ name: n, slug: s })
    setBusy(false)
    if (error) { setErr(error.message); return }
    setNewName(''); setMsg(`"${n}" eklendi.`)
    router.refresh()
  }

  const remove = async (a: Author) => {
    const used = counts[a.name] ?? 0
    if (used > 0) { setErr(`"${a.name}" silinemez — ${used} yazısı var.`); return }
    if (!confirm(`"${a.name}" silinsin mi?`)) return
    await supabase.from('authors').delete().eq('id', a.id)
    setMsg(`"${a.name}" silindi.`)
    router.refresh()
  }

  return (
    <AdminShell
      title="Yazarlar"
      action={
        <div style={{ display: 'flex', gap: 8 }}>
          <input style={{ ...input, width: 190, height: 36 }} placeholder="Yeni yazar adı" value={newName}
            onChange={e => setNewName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }} />
          <button style={btnPrimary} onClick={add} disabled={busy || !newName.trim()}>Ekle</button>
        </div>
      }
    >
      {err && <div style={{ marginBottom: 12, fontSize: '0.82rem', color: T.danger }}>{err}</div>}
      {msg && <div style={{ marginBottom: 12, fontSize: '0.82rem', color: T.green }}>{msg}</div>}

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={th}>Ad</th>
              <th style={{ ...th, width: 210 }}>E-posta</th>
              <th style={{ ...th, width: 70 }}>Yazı</th>
              <th style={{ ...th, width: 120 }} />
            </tr>
          </thead>
          <tbody>
            {authors.map(a => {
              const used = counts[a.name] ?? 0
              const isOpen = open === a.id
              return (
                <tr key={a.id}>
                  <td style={{ ...td, padding: 0 }} colSpan={4}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 210px 70px 120px', alignItems: 'center' }}>
                      <div style={{ padding: '11px 12px', display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                        <span style={{
                          width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                          background: T.terraSoft, color: T.terra,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.78rem',
                          backgroundImage: a.avatar_url ? `url(${a.avatar_url})` : undefined,
                          backgroundSize: 'cover', backgroundPosition: 'center',
                        }}>
                          {a.avatar_url ? '' : a.name.charAt(0).toLocaleUpperCase('tr')}
                        </span>
                        <span style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.name}</span>
                      </div>
                      <div style={{ padding: '11px 12px', color: T.muted, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.email ?? '—'}
                      </div>
                      <div style={{ padding: '11px 12px', color: T.faint, fontSize: '0.85rem' }}>{used}</div>
                      <div style={{ padding: '11px 12px', textAlign: 'right', fontSize: '0.75rem' }}>
                        <button onClick={() => edit(a)} style={{ background: 'none', border: 'none', font: 'inherit', color: T.terra, cursor: 'pointer' }}>
                          {isOpen ? 'Kapat' : 'Düzenle'}
                        </button>
                        {' · '}
                        <button onClick={() => remove(a)} style={{ background: 'none', border: 'none', font: 'inherit', color: used > 0 ? T.faint : T.danger, cursor: 'pointer' }}>Sil</button>
                      </div>
                    </div>

                    {isOpen && (
                      <div style={{ padding: '14px 12px 18px', background: '#fbf9f6', borderTop: `1px solid ${T.borderSoft}` }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                          <div>
                            <label style={label}>Ad</label>
                            <input style={input} value={draft.name ?? ''} onChange={e => setDraft({ ...draft, name: e.target.value })} />
                          </div>
                          <div>
                            <label style={label}>E-posta</label>
                            <input style={input} value={draft.email ?? ''} onChange={e => setDraft({ ...draft, email: e.target.value })} />
                          </div>
                          <div>
                            <label style={label}>Fotoğraf adresi</label>
                            <input style={input} value={draft.avatar_url ?? ''} placeholder="https://…" onChange={e => setDraft({ ...draft, avatar_url: e.target.value })} />
                          </div>
                        </div>
                        <label style={label}>Biyografi</label>
                        <textarea
                          style={{ ...input, height: 70, padding: '8px 10px', resize: 'vertical', lineHeight: 1.6 }}
                          value={draft.bio ?? ''} onChange={e => setDraft({ ...draft, bio: e.target.value })}
                          placeholder="Yazar sayfasında görünecek kısa tanıtım"
                        />
                        <div style={{ display: 'flex', gap: 8, marginTop: 12, alignItems: 'center' }}>
                          <button style={btnPrimary} onClick={() => save(a)} disabled={busy}>{busy ? 'kaydediliyor…' : 'Kaydet'}</button>
                          <button style={btn} onClick={() => setOpen(null)}>Vazgeç</button>
                          {draft.name && draft.name !== a.name && (
                            <span style={{ fontSize: '0.75rem', color: T.amber }}>
                              Ad değişecek — {used} yazıdaki isim de güncellenir.
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </AdminShell>
  )
}
