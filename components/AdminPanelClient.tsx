'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, input, btn, btnPrimary, th, td, label } from '@/lib/adminTheme'

type Post = {
  id: string; title: string; slug: string; category: string
  published: boolean; created_at: string; author_name: string | null
}
type Cat = { id: string; name: string; slug: string }

const PER_PAGE = 25

export default function AdminPanelClient({
  posts, categories,
}: { posts: Post[]; categories: Cat[] }) {
  const router = useRouter()
  const supabase = createClient()

  const [search, setSearch] = useState('')
  const [cat, setCat]       = useState('')
  const [author, setAuthor] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage]     = useState(1)
  const [sel, setSel]       = useState<Set<string>>(new Set())
  const [bulk, setBulk]     = useState('')
  const [busy, setBusy]     = useState(false)

  const catName = useMemo(() => {
    const m: Record<string, string> = {}
    categories.forEach(c => { m[c.slug] = c.name })
    return m
  }, [categories])

  const authors = useMemo(
    () => [...new Set(posts.map(p => p.author_name).filter(Boolean) as string[])]
      .sort((a, b) => a.localeCompare(b, 'tr')),
    [posts]
  )

  const filtered = useMemo(() => posts.filter(p => {
    if (search && !p.title.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))) return false
    if (cat && p.category !== cat) return false
    if (author && p.author_name !== author) return false
    if (status === 'published' && !p.published) return false
    if (status === 'draft' && p.published) return false
    return true
  }), [posts, search, cat, author, status])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PER_PAGE))
  const current = Math.min(page, pageCount)
  const rows = filtered.slice((current - 1) * PER_PAGE, current * PER_PAGE)

  const reset = () => { setPage(1); setSel(new Set()) }

  const toggle = (id: string) => {
    const n = new Set(sel)
    if (n.has(id)) n.delete(id); else n.add(id)
    setSel(n)
  }
  const toggleAll = () =>
    setSel(sel.size === rows.length ? new Set() : new Set(rows.map(r => r.id)))

  const runBulk = async () => {
    if (!bulk || sel.size === 0) return
    const ids = [...sel]
    if (bulk === 'delete' && !confirm(`${ids.length} yazı kalıcı olarak silinecek. Emin misin?`)) return
    setBusy(true)
    if (bulk === 'delete') await supabase.from('posts').delete().in('id', ids)
    else await supabase.from('posts').update({ published: bulk === 'publish' }).in('id', ids)
    setBusy(false); setSel(new Set()); setBulk('')
    router.refresh()
  }

  const removeOne = async (p: Post) => {
    if (!confirm(`"${p.title}" silinecek. Emin misin?`)) return
    await supabase.from('posts').delete().eq('id', p.id)
    router.refresh()
  }

  const ctl = { ...input, height: 34 }

  return (
    <AdminShell
      title="Yazılar"
      action={
        <Link href="/admin/yazi/yeni" style={{ ...btnPrimary, display: 'inline-flex', alignItems: 'center', textDecoration: 'none' }}>
          Yeni yazı ekle
        </Link>
      }
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 14 }}>
        <div>
          <label style={label}>Yazar</label>
          <select style={ctl} value={author} onChange={e => { setAuthor(e.target.value); reset() }}>
            <option value="">Tüm yazarlar</option>
            {authors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Kategori</label>
          <select style={ctl} value={cat} onChange={e => { setCat(e.target.value); reset() }}>
            <option value="">Tüm kategoriler</option>
            {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={label}>Durum</label>
          <select style={ctl} value={status} onChange={e => { setStatus(e.target.value); reset() }}>
            <option value="">Tümü</option>
            <option value="published">Yayında</option>
            <option value="draft">Taslak</option>
          </select>
        </div>
        <div>
          <label style={label}>Ara</label>
          <input style={ctl} value={search} placeholder="Başlıkta ara" onChange={e => { setSearch(e.target.value); reset() }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <select style={{ ...input, height: 32, width: 'auto', fontSize: '0.8rem' }} value={bulk} onChange={e => setBulk(e.target.value)}>
          <option value="">Toplu işlem</option>
          <option value="publish">Yayına al</option>
          <option value="draft">Taslağa çek</option>
          <option value="delete">Sil</option>
        </select>
        <button
          onClick={runBulk}
          disabled={!bulk || sel.size === 0 || busy}
          style={{ ...btn, height: 32, fontSize: '0.8rem', opacity: (!bulk || sel.size === 0) ? 0.45 : 1 }}
        >
          {busy ? 'işleniyor…' : `Uygula${sel.size ? ` (${sel.size})` : ''}`}
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: T.faint }}>
          {filtered.length === posts.length ? `${posts.length} yazı` : `${filtered.length} / ${posts.length} yazı`}
        </span>
      </div>

      <div style={{ background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
          <thead>
            <tr>
              <th style={{ ...th, width: 38 }}>
                <input type="checkbox" aria-label="Tümünü seç" checked={rows.length > 0 && sel.size === rows.length} onChange={toggleAll} />
              </th>
              <th style={th}>Başlık</th>
              <th style={{ ...th, width: 150 }}>Yazar</th>
              <th style={{ ...th, width: 105 }}>Kategori</th>
              <th style={{ ...th, width: 92 }}>Durum</th>
              <th style={{ ...th, width: 100 }}>Tarih</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6} style={{ ...td, textAlign: 'center', padding: '40px 12px', color: T.faint }}>Sonuç bulunamadı</td></tr>
            ) : rows.map(p => (
              <tr key={p.id}>
                <td style={td}>
                  <input type="checkbox" aria-label="Seç" checked={sel.has(p.id)} onChange={() => toggle(p.id)} />
                </td>
                <td style={td}>
                  <Link href={`/admin/yazi/${p.id}`} style={{ color: T.text, fontWeight: 500, textDecoration: 'none', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {p.title}
                  </Link>
                  <span style={{ fontSize: '0.72rem', color: T.faint }}>
                    <Link href={`/admin/yazi/${p.id}`} style={{ color: T.terra, textDecoration: 'none' }}>Düzenle</Link>
                    {' · '}
                    <a href={`/yazi/${p.slug}`} target="_blank" rel="noopener" style={{ color: T.terra, textDecoration: 'none' }}>Önizle</a>
                    {' · '}
                    <button onClick={() => removeOne(p)} style={{ background: 'none', border: 'none', padding: 0, font: 'inherit', color: T.danger, cursor: 'pointer' }}>Sil</button>
                  </span>
                </td>
                <td style={{ ...td, color: T.muted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.author_name ?? '—'}</td>
                <td style={{ ...td, color: T.muted }}>{catName[p.category] ?? p.category}</td>
                <td style={td}>
                  <span style={{
                    fontSize: '0.7rem', padding: '3px 9px', borderRadius: 20,
                    background: p.published ? T.greenSoft : T.amberSoft,
                    color: p.published ? T.green : T.amber,
                  }}>
                    {p.published ? 'Yayında' : 'Taslak'}
                  </span>
                </td>
                <td style={{ ...td, color: T.faint, fontSize: '0.78rem' }}>
                  {new Date(p.created_at).toLocaleDateString('tr-TR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 14, fontSize: '0.8rem', color: T.muted }}>
          <button style={{ ...btn, height: 30, padding: '0 10px' }} disabled={current === 1} onClick={() => { setPage(current - 1); setSel(new Set()) }}>‹</button>
          <span>{current} / {pageCount}</span>
          <button style={{ ...btn, height: 30, padding: '0 10px' }} disabled={current === pageCount} onClick={() => { setPage(current + 1); setSel(new Set()) }}>›</button>
        </div>
      )}
    </AdminShell>
  )
}
