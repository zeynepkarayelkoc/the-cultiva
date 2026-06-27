'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const categories = ['yasam', 'seyahat', 'sanat', 'rehber', 'kitap']

export default function YaziDuzenle() {
  const { id } = useParams() as { id: string }
  const [title, setTitle]       = useState('')
  const [slug, setSlug]         = useState('')
  const [excerpt, setExcerpt]   = useState('')
  const [category, setCategory] = useState('yasam')
  const [readTime, setReadTime] = useState(5)
  const [published, setPublished] = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [preview, setPreview]   = useState(false)
  const [contentHtml, setContentHtml] = useState('')
  const editorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.from('posts').select('*').eq('id', id).single().then(({ data }) => {
      if (!data) return
      setTitle(data.title ?? '')
      setSlug(data.slug ?? '')
      setExcerpt(data.excerpt ?? '')
      setCategory(data.category ?? 'yasam')
      setReadTime(data.read_time ?? 5)
      setPublished(data.published ?? false)
      const html = data.content ?? ''
      setContentHtml(html)
      if (editorRef.current) editorRef.current.innerHTML = html
      setLoading(false)
    })
  }, [id])

  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
  }, [])

  const insertLink = () => {
    const url = prompt('URL girin:')
    if (url) exec('createLink', url)
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setError(''); setSuccess('')
    const { error: err } = await supabase.from('posts').update({
      title, slug, excerpt,
      content: editorRef.current?.innerHTML ?? contentHtml,
      category, read_time: readTime, published,
    }).eq('id', id)
    if (err) setError(err.message)
    else setSuccess('Kaydedildi ✓')
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!confirm('Bu yazıyı silmek istediğine emin misin?')) return
    await supabase.from('posts').delete().eq('id', id)
    router.push('/admin')
  }

  const toolbarBtns = [
    { label: 'B',  title: 'Kalın',     action: () => exec('bold'),               style: { fontWeight: 700 } as React.CSSProperties },
    { label: 'I',  title: 'İtalik',    action: () => exec('italic'),              style: { fontStyle: 'italic' } as React.CSSProperties },
    { label: 'U',  title: 'Alt çizgi', action: () => exec('underline'),           style: { textDecoration: 'underline' } as React.CSSProperties },
    { label: 'H1', title: 'Başlık 1',  action: () => exec('formatBlock', 'h2'),   style: {} },
    { label: 'H2', title: 'Başlık 2',  action: () => exec('formatBlock', 'h3'),   style: {} },
    { label: '¶',  title: 'Paragraf',  action: () => exec('formatBlock', 'p'),    style: {} },
    { label: '|',  title: 'sep',       action: () => null,                        style: {} },
    { label: '≡',  title: 'Liste',     action: () => exec('insertUnorderedList'), style: {} },
    { label: '1.', title: 'Numaralı',  action: () => exec('insertOrderedList'),   style: {} },
    { label: '"',  title: 'Alıntı',    action: () => exec('formatBlock', 'blockquote'), style: { fontSize: '1.1rem' } as React.CSSProperties },
    { label: '|',  title: 'sep',       action: () => null,                        style: {} },
    { label: '🔗', title: 'Link',      action: insertLink,                        style: {} },
    { label: '✕',  title: 'Temizle',   action: () => exec('removeFormat'),        style: { color: '#c97060' } as React.CSSProperties },
  ]

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#0f0a07', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(245,232,208,0.35)', fontSize: '0.85rem' }}>
      yükleniyor...
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#0f0a07', color: '#f5e8d0' }}>
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, padding: '0 2rem', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#1a100a', borderBottom: '1px solid rgba(245,232,208,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/admin" style={{ color: '#b5734a', fontSize: '0.8rem' }}>← panel</Link>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,232,208,0.3)', textTransform: 'uppercase' }}>düzenle</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {success && <span style={{ fontSize: '0.72rem', color: '#6db88a' }}>{success}</span>}
          {error && <span style={{ fontSize: '0.72rem', color: '#c97060' }}>{error}</span>}
          <button type="button" onClick={() => setPreview(p => !p)} style={{ ...topBtn, border: '1px solid rgba(245,232,208,0.2)' }}>
            {preview ? 'düzenle' : 'önizle'}
          </button>
          {published && (
            <Link href={`/yazi/${slug}`} target="_blank" style={{ ...topBtn, border: '1px solid rgba(245,232,208,0.15)', color: 'rgba(245,232,208,0.5)' }}>
              sitede gör ↗
            </Link>
          )}
          <button type="button" onClick={() => setPublished(p => !p)} style={{
            ...topBtn,
            background: published ? '#2d5a3d' : 'rgba(245,232,208,0.06)',
            border: `1px solid ${published ? '#2d5a3d' : 'rgba(245,232,208,0.15)'}`,
          }}>
            {published ? '● yayında' : '○ taslak'}
          </button>
          <button type="button" onClick={handleDelete} style={{ ...topBtn, color: '#c97060', border: '1px solid rgba(201,112,96,0.3)' }}>sil</button>
          <button form="edit-form" type="submit" disabled={saving} style={{ ...topBtn, background: '#8b2635', border: 'none', fontWeight: 600, opacity: saving ? 0.7 : 1 }}>
            {saving ? '...' : 'güncelle'}
          </button>
        </div>
      </div>

      <form id="edit-form" onSubmit={handle}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 2rem 6rem' }}>
          <textarea
            value={title} onChange={e => setTitle(e.target.value)} required rows={2}
            placeholder="Yazı başlığı..."
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(245,232,208,0.1)',
              color: '#f5e8d0', outline: 'none', resize: 'none',
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2,
              paddingBottom: '1rem', marginBottom: '1.5rem',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 70px', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>slug</label><input value={slug} onChange={e => setSlug(e.target.value)} required style={inp} /></div>
            <div><label style={lbl}>kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inp}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>dk okuma</label><input type="number" min={1} max={99} value={readTime} onChange={e => setReadTime(+e.target.value)} style={inp} /></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>özet</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>
          <div>
            <label style={{ ...lbl, marginBottom: '0.5rem' }}>içerik</label>
            {!preview ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '0.4rem 0.6rem', background: 'rgba(245,232,208,0.05)', border: '1px solid rgba(245,232,208,0.1)', borderBottom: 'none', borderRadius: '10px 10px 0 0' }}>
                  {toolbarBtns.map((btn, i) =>
                    btn.label === '|' ? (
                      <div key={i} style={{ width: 1, background: 'rgba(245,232,208,0.12)', margin: '2px 4px', alignSelf: 'stretch' }} />
                    ) : (
                      <button key={i} type="button" title={btn.title}
                        onMouseDown={e => { e.preventDefault(); btn.action() }}
                        style={{ background: 'transparent', border: 'none', color: '#f5e8d0', cursor: 'pointer', padding: '0.3rem 0.55rem', borderRadius: 6, minWidth: 28, fontSize: btn.label.length > 1 ? '0.65rem' : '0.85rem', ...btn.style }}
                      >{btn.label}</button>
                    )
                  )}
                </div>
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => setContentHtml(editorRef.current?.innerHTML ?? '')}
                  data-placeholder="Yazınızı buraya yazın..."
                  style={{ minHeight: 420, padding: '1.4rem 1.2rem', background: 'rgba(245,232,208,0.03)', border: '1px solid rgba(245,232,208,0.1)', borderRadius: '0 0 10px 10px', color: '#f5e8d0', outline: 'none', fontSize: '1rem', lineHeight: 1.85, fontFamily: "'Open Sans', sans-serif" }}
                />
                <style>{`
                  [contenteditable]:empty:before{content:attr(data-placeholder);color:rgba(245,232,208,0.2);pointer-events:none}
                  [contenteditable] h2{font-family:'Playfair Display',serif;font-size:1.6rem;margin:1.2rem 0 0.5rem}
                  [contenteditable] h3{font-family:'Playfair Display',serif;font-size:1.2rem;margin:1rem 0 0.4rem;color:#e8d0b0}
                  [contenteditable] blockquote{border-left:3px solid #b5734a;padding-left:1rem;margin:1rem 0;color:rgba(245,232,208,0.7);font-style:italic}
                  [contenteditable] ul,[contenteditable] ol{padding-left:1.5rem;margin:0.5rem 0}
                  [contenteditable] a{color:#b5734a;text-decoration:underline}
                `}</style>
              </>
            ) : (
              <div style={{ minHeight: 420, padding: '2rem', background: '#f5f0e8', color: '#2a1f18', borderRadius: 10, fontSize: '1rem', lineHeight: 1.85 }}>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

const topBtn: React.CSSProperties = { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#f5e8d0', padding: '0.45rem 1rem', borderRadius: 50, background: 'transparent', cursor: 'pointer' }
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,232,208,0.3)', marginBottom: '0.35rem' }
const inp: React.CSSProperties = { width: '100%', padding: '0.55rem 0.8rem', border: '1px solid rgba(245,232,208,0.12)', borderRadius: 8, background: 'rgba(245,232,208,0.05)', color: '#f5e8d0', outline: 'none', fontFamily: 'inherit', fontSize: '0.84rem' }
