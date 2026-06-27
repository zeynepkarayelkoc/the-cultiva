'use client'
import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const categories = ['yasam', 'seyahat', 'sanat', 'rehber', 'kitap']

const toSlug = (s: string) =>
  s.toLowerCase().trim()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')

export default function YeniYaziPage() {
  const [title, setTitle]         = useState('')
  const [slug, setSlug]           = useState('')
  const [excerpt, setExcerpt]     = useState('')
  const [coverUrl, setCoverUrl]   = useState('')
  const [category, setCategory]   = useState('yasam')
  const [readTime, setReadTime]   = useState(5)
  const [published, setPublished] = useState(false)
  const [loading, setLoading]     = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError]         = useState('')
  const [preview, setPreview]     = useState(false)
  const [contentHtml, setContentHtml] = useState('')
  const editorRef    = useRef<HTMLDivElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const imgFileRef   = useRef<HTMLInputElement>(null)
  const router  = useRouter()
  const supabase = createClient()

  const handleTitleChange = (v: string) => {
    setTitle(v)
    setSlug(prev => (prev === toSlug(title) || prev === '') ? toSlug(v) : prev)
  }

  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
  }, [])

  // Supabase Storage'a dosya yükle
  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const ext  = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true })
    if (error) { alert('Yükleme hatası: ' + error.message); return null }
    const { data } = supabase.storage.from('images').getPublicUrl(path)
    return data.publicUrl
  }

  // Cover görseli yükle
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile(file, 'covers')
    if (url) setCoverUrl(url)
    setUploading(false)
  }

  // Editör içine görsel ekle
  const handleInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const url = await uploadFile(file, 'content')
    if (url) {
      exec('insertImage', url)
    }
    setUploading(false)
    e.target.value = ''
  }

  const insertLink = () => {
    const url = prompt('URL girin:')
    if (url) exec('createLink', url)
  }

  const insertImageUrl = () => {
    const url = prompt('Görsel URL girin:')
    if (url) exec('insertImage', url)
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Oturum açık değil.'); setLoading(false); return }
    const { error: err } = await supabase.from('posts').insert({
      title, slug, excerpt, cover_url: coverUrl || null,
      content: editorRef.current?.innerHTML ?? contentHtml,
      category, read_time: readTime, published, author_id: user.id,
    })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/admin')
  }

  const toolbarBtns = [
    { label: 'B',  title: 'Kalın',    action: () => exec('bold'),                   style: { fontWeight: 700 } as React.CSSProperties },
    { label: 'I',  title: 'İtalik',   action: () => exec('italic'),                 style: { fontStyle: 'italic' } as React.CSSProperties },
    { label: 'U',  title: 'Altçizgi', action: () => exec('underline'),              style: { textDecoration: 'underline' } as React.CSSProperties },
    { label: 'H1', title: 'Başlık 1', action: () => exec('formatBlock','h2'),       style: {} },
    { label: 'H2', title: 'Başlık 2', action: () => exec('formatBlock','h3'),       style: {} },
    { label: '¶',  title: 'Paragraf', action: () => exec('formatBlock','p'),        style: {} },
    { label: '|',  title: 'sep',      action: () => null,                           style: {} },
    { label: '≡',  title: 'Liste',    action: () => exec('insertUnorderedList'),    style: {} },
    { label: '1.', title: 'Numaralı', action: () => exec('insertOrderedList'),      style: {} },
    { label: '"',  title: 'Alıntı',   action: () => exec('formatBlock','blockquote'),style: { fontSize:'1.1rem' } as React.CSSProperties },
    { label: '|',  title: 'sep',      action: () => null,                           style: {} },
    { label: '🔗', title: 'Link',     action: insertLink,                           style: {} },
    { label: '🖼',  title: 'Görsel URL', action: insertImageUrl,                   style: {} },
    { label: '📁', title: 'Görsel Yükle', action: () => imgFileRef.current?.click(), style: {} },
    { label: '|',  title: 'sep',      action: () => null,                           style: {} },
    { label: '✕',  title: 'Temizle',  action: () => exec('removeFormat'),           style: { color:'#c97060' } as React.CSSProperties },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#0f0a07', color: '#f5e8d0' }}>

      {/* Üst bar */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 100, padding: '0 2rem', height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: '#1a100a', borderBottom: '1px solid rgba(245,232,208,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <Link href="/admin" style={{ color: '#b5734a', fontSize: '0.8rem' }}>← panel</Link>
          <span style={{ fontSize: '0.65rem', letterSpacing: '0.2em', color: 'rgba(245,232,208,0.3)', textTransform: 'uppercase' }}>yeni yazı</span>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {uploading && <span style={{ fontSize: '0.7rem', color: '#b5734a' }}>yükleniyor...</span>}
          <button type="button" onClick={() => setPreview(p => !p)} style={{ ...topBtn, border: '1px solid rgba(245,232,208,0.2)' }}>
            {preview ? 'düzenle' : 'önizle'}
          </button>
          <button type="button" onClick={() => setPublished(p => !p)} style={{
            ...topBtn,
            background: published ? '#2d5a3d' : 'rgba(245,232,208,0.06)',
            border: `1px solid ${published ? '#2d5a3d' : 'rgba(245,232,208,0.15)'}`,
          }}>
            {published ? '● yayında' : '○ taslak'}
          </button>
          <button form="post-form" type="submit" disabled={loading} style={{ ...topBtn, background: '#8b2635', border: 'none', fontWeight: 600, opacity: loading ? 0.7 : 1 }}>
            {loading ? '...' : 'kaydet'}
          </button>
        </div>
      </div>

      <form id="post-form" onSubmit={handle}>
        <div style={{ maxWidth: 860, margin: '0 auto', padding: '2.5rem 2rem 6rem' }}>

          {/* Başlık */}
          <textarea
            placeholder="Yazı başlığı..." value={title}
            onChange={e => handleTitleChange(e.target.value)}
            required rows={2}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '1px solid rgba(245,232,208,0.1)',
              color: '#f5e8d0', outline: 'none', resize: 'none',
              fontFamily: "'Playfair Display',serif", fontStyle: 'italic',
              fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.2,
              paddingBottom: '1rem', marginBottom: '1.5rem',
            }}
          />

          {/* Meta */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.2fr 70px', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>slug / url</label><input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="url-adresi" style={inp} /></div>
            <div>
              <label style={lbl}>kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inp}>
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label style={lbl}>dk okuma</label><input type="number" min={1} max={99} value={readTime} onChange={e => setReadTime(+e.target.value)} style={inp} /></div>
          </div>

          {/* Özet */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>özet — kart ve meta açıklaması</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Okuyucuyu çekecek kısa bir cümle..." rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* ── COVER GÖRSEL ── */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={lbl}>kapak görseli</label>
            <div style={{
              border: '1px solid rgba(245,232,208,0.12)', borderRadius: 12,
              overflow: 'hidden', background: 'rgba(245,232,208,0.03)',
            }}>
              {/* Önizleme */}
              {coverUrl && (
                <div style={{ position: 'relative' }}>
                  <img src={coverUrl} alt="cover" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  <button
                    type="button" onClick={() => setCoverUrl('')}
                    style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#f5e8d0', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}
                  >✕ kaldır</button>
                </div>
              )}

              <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                {/* Dosya yükleme */}
                <button
                  type="button"
                  onClick={() => coverFileRef.current?.click()}
                  style={{ ...smallBtn, background: '#b5734a' }}
                >
                  📁 bilgisayardan yükle
                </button>
                <input ref={coverFileRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />

                {/* URL ile */}
                <span style={{ fontSize: '0.65rem', color: 'rgba(245,232,208,0.3)' }}>veya</span>
                <input
                  value={coverUrl} onChange={e => setCoverUrl(e.target.value)}
                  placeholder="https://... görsel URL yapıştır"
                  style={{ ...inp, flex: 1, minWidth: 200 }}
                />
              </div>
            </div>
          </div>

          {/* ── İÇERİK EDİTÖRÜ ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={lbl}>içerik</label>
              {error && <span style={{ fontSize: '0.75rem', color: '#c97060' }}>{error}</span>}
            </div>

            {!preview ? (
              <>
                {/* Araç çubuğu */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '2px', padding: '0.4rem 0.6rem',
                  background: 'rgba(245,232,208,0.05)', border: '1px solid rgba(245,232,208,0.1)',
                  borderBottom: 'none', borderRadius: '10px 10px 0 0',
                }}>
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

                {/* Gizli dosya input */}
                <input ref={imgFileRef} type="file" accept="image/*" onChange={handleInsertImage} style={{ display: 'none' }} />

                {/* Editör */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={() => setContentHtml(editorRef.current?.innerHTML ?? '')}
                  data-placeholder="Yazınızı buraya yazın... Görseli araç çubuğundan ekleyebilirsiniz."
                  style={{
                    minHeight: 420, padding: '1.4rem 1.2rem',
                    background: 'rgba(245,232,208,0.03)',
                    border: '1px solid rgba(245,232,208,0.1)',
                    borderRadius: '0 0 10px 10px',
                    color: '#f5e8d0', outline: 'none',
                    fontSize: '1rem', lineHeight: 1.85,
                    fontFamily: "'Open Sans',sans-serif",
                  }}
                />
                <style>{`
                  [contenteditable]:empty:before{content:attr(data-placeholder);color:rgba(245,232,208,0.2);pointer-events:none}
                  [contenteditable] h2{font-family:'Playfair Display',serif;font-size:1.6rem;margin:1.2rem 0 0.5rem}
                  [contenteditable] h3{font-family:'Playfair Display',serif;font-size:1.2rem;margin:1rem 0 0.4rem;color:#e8d0b0}
                  [contenteditable] blockquote{border-left:3px solid #b5734a;padding-left:1rem;margin:1rem 0;color:rgba(245,232,208,0.7);font-style:italic}
                  [contenteditable] ul,[contenteditable] ol{padding-left:1.5rem;margin:0.5rem 0}
                  [contenteditable] a{color:#b5734a;text-decoration:underline}
                  [contenteditable] img{max-width:100%;border-radius:8px;margin:0.75rem 0;display:block}
                `}</style>
              </>
            ) : (
              <div style={{ minHeight: 420, padding: '2rem', background: '#f5f0e8', color: '#2a1f18', borderRadius: 10, fontSize: '1rem', lineHeight: 1.85 }}>
                {coverUrl && <img src={coverUrl} alt="cover" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 10, marginBottom: '2rem' }} />}
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', marginBottom: '1rem' }}>{title || 'Başlık yok'}</h1>
                <div dangerouslySetInnerHTML={{ __html: contentHtml || '<p style="color:#999">İçerik yok</p>' }} />
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
const smallBtn: React.CSSProperties = { fontSize: '0.72rem', padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', color: '#f5e8d0', cursor: 'pointer', whiteSpace: 'nowrap' }
