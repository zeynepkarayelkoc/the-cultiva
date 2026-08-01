'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import AdminShell from '@/components/AdminShell'

export default function YaziDuzenle() {
  const { id } = useParams() as { id: string }
  const [title, setTitle]       = useState('')
  const [slug, setSlug]         = useState('')
  const [excerpt, setExcerpt]   = useState('')
  const [category, setCategory] = useState('yasam')
  const [readTime, setReadTime] = useState(5)
  const [published, setPublished] = useState(false)
  const [coverUrl, setCoverUrl]       = useState('')
  const [uploading, setUploading]     = useState(false)
  const [authorName, setAuthorName]   = useState('')
  const [authors, setAuthors]         = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories]   = useState<{ slug: string; name: string }[]>([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [error, setError]       = useState('')
  const [success, setSuccess]   = useState('')
  const [preview, setPreview]   = useState(false)
  const [contentHtml, setContentHtml] = useState('')
  const editorRef    = useRef<HTMLDivElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
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
      setCoverUrl(data.cover_url ?? '')
      setAuthorName(data.author_name ?? '')
      setContentHtml(data.content ?? '')
      setLoading(false)
    })
    supabase.from('authors').select('id, name').order('name').then(({ data }) => {
      if (data) setAuthors(data)
    })
    supabase.from('categories').select('slug, name').order('sort_order').then(({ data }) => {
      if (data) setCategories(data)
    })
  }, [id])

  // Yazı yüklenirken editör henüz DOM'da olmadığı için içeriği o anda
  // yazamıyoruz. Loading bitip editör mount olduktan sonra bir kez doldur.
  useEffect(() => {
    if (loading) return
    const el = editorRef.current
    if (el && el.innerHTML === '') el.innerHTML = contentHtml
  }, [loading])

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

    // Güvenlik: editör boşken kaydetmek mevcut içeriği silmesin.
    const editorHtml = editorRef.current?.innerHTML ?? ''
    const bos = editorHtml.replace(/<[^>]+>|&nbsp;|\s/g, '') === ''
    if (bos && contentHtml.trim() !== '') {
      setError('İçerik boş görünüyor — kayıt iptal edildi. Sayfayı yenileyip tekrar dene.')
      return
    }

    setSaving(true); setError(''); setSuccess('')
    const { error: err } = await supabase.from('posts').update({
      title, slug, excerpt, cover_url: coverUrl || null,
      content: editorHtml,
      category, read_time: readTime, published,
      author_name: authorName || null,
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
    { label: '✕',  title: 'Temizle',   action: () => exec('removeFormat'),        style: { color: '#b03030' } as React.CSSProperties },
  ]

  if (loading) return (
    <AdminShell title="Yazıyı düzenle">
      <div style={{ color: '#a89c8c', fontSize: '0.85rem' }}>yükleniyor…</div>
    </AdminShell>
  )

  return (
    <AdminShell
      title="Yazıyı düzenle"
      action={
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {success && <span style={{ fontSize: '0.72rem', color: '#4f7a52' }}>{success}</span>}
          {error && <span style={{ fontSize: '0.72rem', color: '#b03030' }}>{error}</span>}
          <button type="button" onClick={() => setPreview(p => !p)} style={{ ...topBtn, border: '1px solid #e4ddd1', color: '#2c2419' }}>
            {preview ? 'düzenle' : 'önizle'}
          </button>
          {published && (
            <Link href={`/yazi/${slug}`} target="_blank" style={{ ...topBtn, border: '1px solid #e4ddd1', color: '#7d7264' }}>
              sitede gör ↗
            </Link>
          )}
          <button type="button" onClick={() => setPublished(p => !p)} style={{
            ...topBtn,
            color: published ? '#fff' : '#2c2419',
            background: published ? '#4f7a52' : '#fff',
            border: `1px solid ${published ? '#4f7a52' : '#e4ddd1'}`,
          }}>
            {published ? '● yayında' : '○ taslak'}
          </button>
          <button type="button" onClick={handleDelete} style={{ ...topBtn, color: '#b03030', border: '1px solid #e4c9c9', background: '#fff' }}>sil</button>
          <button form="edit-form" type="submit" disabled={saving} style={{ ...topBtn, background: '#b5734a', color: '#fff', border: 'none', opacity: saving ? 0.7 : 1 }}>
            {saving ? '…' : 'güncelle'}
          </button>
        </div>
      }
    >
      <form id="edit-form" onSubmit={handle}>
        <div style={{ maxWidth: 860 }}>
          <textarea
            value={title} onChange={e => setTitle(e.target.value)} required rows={2}
            placeholder="Yazı başlığı..."
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '1px solid #e4ddd1',
              color: '#2c2419', outline: 'none', resize: 'none',
              fontFamily: "'Playfair Display', serif", fontStyle: 'italic',
              fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', lineHeight: 1.2,
              paddingBottom: '1rem', marginBottom: '1.5rem',
            }}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 70px', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>slug</label><input value={slug} onChange={e => setSlug(e.target.value)} required style={inp} /></div>
            <div><label style={lbl}>kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inp}>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>yazar</label>
              {authors.length > 0 ? (
                <select value={authorName} onChange={e => setAuthorName(e.target.value)} style={inp}>
                  <option value="">— seç —</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                </select>
              ) : (
                <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Yazar adı" style={inp} />
              )}
            </div>
            <div><label style={lbl}>dk okuma</label><input type="number" min={1} max={99} value={readTime} onChange={e => setReadTime(+e.target.value)} style={inp} /></div>
          </div>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>özet</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* Kapak görseli */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={lbl}>kapak görseli</label>
            <div style={{ border: '1px solid #e4ddd1', borderRadius: 12, overflow: 'hidden', background: '#fbf9f6' }}>
              {coverUrl && (
                <div style={{ position: 'relative' }}>
                  <img src={coverUrl} alt="cover" style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => setCoverUrl('')} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#2c2419', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>✕ kaldır</button>
                </div>
              )}
              <div style={{ padding: '0.9rem 1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => coverFileRef.current?.click()} disabled={uploading} style={{ fontSize: '0.72rem', padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', background: '#b5734a', color: '#2c2419', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {uploading ? '⏳ yükleniyor…' : '📁 bilgisayardan yükle'}
                </button>
                <input ref={coverFileRef} type="file" accept="image/*" onChange={async e => {
                  const file = e.target.files?.[0]; if (!file) return
                  setUploading(true)
                  const ext = file.name.split('.').pop()
                  const path = `covers/${Date.now()}.${ext}`
                  const { error: upErr } = await supabase.storage.from('images').upload(path, file, { upsert: true })
                  if (!upErr) {
                    const { data } = supabase.storage.from('images').getPublicUrl(path)
                    setCoverUrl(data.publicUrl)
                  } else alert('Yükleme hatası: ' + upErr.message)
                  setUploading(false)
                  e.target.value = ''
                }} style={{ display: 'none' }} />
                <span style={{ fontSize: '0.65rem', color: '#a89c8c' }}>veya</span>
                <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://… görsel URL yaz" style={{ ...inp, flex: 1, minWidth: 200 }} />
              </div>
            </div>
          </div>

          <div>
            <label style={{ ...lbl, marginBottom: '0.5rem' }}>içerik</label>
            {!preview ? (
              <>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '0.4rem 0.6rem', background: '#fbf9f6', border: '1px solid #e4ddd1', borderBottom: 'none', borderRadius: '10px 10px 0 0' }}>
                  {toolbarBtns.map((btn, i) =>
                    btn.label === '|' ? (
                      <div key={i} style={{ width: 1, background: '#e4ddd1', margin: '2px 4px', alignSelf: 'stretch' }} />
                    ) : (
                      <button key={i} type="button" title={btn.title}
                        onMouseDown={e => { e.preventDefault(); btn.action() }}
                        style={{ background: 'transparent', border: 'none', color: '#2c2419', cursor: 'pointer', padding: '0.3rem 0.55rem', borderRadius: 6, minWidth: 28, fontSize: btn.label.length > 1 ? '0.65rem' : '0.85rem', ...btn.style }}
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
                  style={{ minHeight: 420, padding: '1.4rem 1.2rem', background: '#fbf9f6', border: '1px solid #e4ddd1', borderRadius: '0 0 10px 10px', color: '#2c2419', outline: 'none', fontSize: '1rem', lineHeight: 1.85, fontFamily: "'Open Sans', sans-serif" }}
                />
                <style>{`
                  [contenteditable]:empty:before{content:attr(data-placeholder);color:#a89c8c;pointer-events:none}
                  [contenteditable] h2{font-family:'Playfair Display',serif;font-size:1.6rem;margin:1.2rem 0 0.5rem}
                  [contenteditable] h3{font-family:'Playfair Display',serif;font-size:1.2rem;margin:1rem 0 0.4rem;color:#8b5e3c}
                  [contenteditable] blockquote{border-left:3px solid #b5734a;padding-left:1rem;margin:1rem 0;color:#2c2419;font-style:italic}
                  [contenteditable] ul,[contenteditable] ol{padding-left:1.5rem;margin:0.5rem 0}
                  [contenteditable] a{color:#b5734a;text-decoration:underline}
                `}</style>
              </>
            ) : (
              <div style={{ minHeight: 420, padding: '2rem', background: '#f5f0e8', color: '#ffffff', borderRadius: 10, fontSize: '1rem', lineHeight: 1.85 }}>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', marginBottom: '1rem' }}>{title}</h1>
                <div dangerouslySetInnerHTML={{ __html: contentHtml }} />
              </div>
            )}
          </div>
        </div>
      </form>
    </AdminShell>
  )
}

const topBtn: React.CSSProperties = { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2c2419', padding: '0.45rem 1rem', borderRadius: 50, background: 'transparent', cursor: 'pointer' }
const lbl: React.CSSProperties = { display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a89c8c', marginBottom: '0.35rem' }
const inp: React.CSSProperties = { width: '100%', padding: '0.55rem 0.8rem', border: '1px solid #e4ddd1', borderRadius: 8, background: '#fbf9f6', color: '#2c2419', outline: 'none', fontFamily: 'inherit', fontSize: '0.84rem' }
