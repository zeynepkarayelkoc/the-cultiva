'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from '@/components/AdminShell'
import RichEditor from '@/components/RichEditor'
import { dosyaKontrol } from '@/lib/upload'

const toSlug = (s: string) =>
  s.toLowerCase().trim()
    .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
    .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
    .replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-')

export default function YeniYaziPage() {
  const [title, setTitle]             = useState('')
  const [slug, setSlug]               = useState('')
  const [excerpt, setExcerpt]         = useState('')
  const [coverUrl, setCoverUrl]       = useState('')
  const [category, setCategory]       = useState('yasam')
  const [readTime, setReadTime]       = useState(5)
  const [published, setPublished]     = useState(false)
  const [scheduledAt, setScheduledAt] = useState('')
  const [showSchedule, setShowSchedule] = useState(false)
  const [metaTitle, setMetaTitle]     = useState('')
  const [metaDesc, setMetaDesc]       = useState('')
  const [loading, setLoading]         = useState(false)
  const [uploading, setUploading]     = useState(false)
  const [error, setError]             = useState('')
  const [preview, setPreview]         = useState(false)
  const [contentHtml, setContentHtml] = useState('')
  const [draftId, setDraftId]         = useState<string | null>(null)
  const [saveStatus, setSaveStatus]   = useState<'idle'|'saving'|'saved'>('idle')
  const [lastSaved, setLastSaved]     = useState<string>('')
  const [aiLoading, setAiLoading]     = useState(false)
  const [aiPanel, setAiPanel]         = useState(false)
  const [aiResult, setAiResult]       = useState('')
  const [authorName, setAuthorName]   = useState('')
  const [authors, setAuthors]         = useState<{ id: string; name: string }[]>([])
  const [categories, setCategories]   = useState<{ slug: string; name: string }[]>([])

  const editorRef    = useRef<HTMLDivElement>(null)
  const coverFileRef = useRef<HTMLInputElement>(null)
  const router       = useRouter()
  const supabase     = createClient()

  const handleTitleChange = (v: string) => {
    setTitle(v)
    setSlug(prev => (prev === toSlug(title) || prev === '') ? toSlug(v) : prev)
  }

  // Yazarları ve kategorileri yükle
  useEffect(() => {
    supabase.from('authors').select('id, name').order('name').then(({ data }) => {
      if (data) setAuthors(data)
    })
    supabase.from('categories').select('slug, name').order('sort_order').then(({ data }) => {
      if (data) {
        setCategories(data)
        setCategory(prev => prev || data[0]?.slug || '')
      }
    })
  }, [])

  // Okuma süresi otomatik hesapla
  useEffect(() => {
    const text = editorRef.current?.innerText ?? ''
    const words = text.trim().split(/\s+/).filter(Boolean).length
    if (words > 0) setReadTime(Math.max(1, Math.ceil(words / 200)))
  }, [contentHtml])

  // ── AUTO-SAVE (her 30 saniye) ──
  const doAutoSave = useCallback(async () => {
    const content = editorRef.current?.innerHTML ?? contentHtml
    if (!title && !content) return
    setSaveStatus('saving')
    const postData = {
      title: title || 'Başlıksız taslak',
      slug: slug || toSlug(title || `taslak-${Date.now()}`),
      excerpt, cover_url: coverUrl || null, content, category,
      read_time: readTime, published: false,
      meta_title: metaTitle || null, meta_description: metaDesc || null,
      author_name: authorName || null,
    }
    if (draftId) {
      await supabase.from('posts').update(postData).eq('id', draftId)
    } else {
      const { data } = await supabase.from('posts').insert(postData).select('id').single()
      if (data) setDraftId(data.id)
    }
    setLastSaved(new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }))
    setSaveStatus('saved')
  }, [title, slug, excerpt, coverUrl, category, readTime, contentHtml, metaTitle, metaDesc, draftId])

  useEffect(() => {
    const interval = setInterval(doAutoSave, 30000)
    return () => clearInterval(interval)
  }, [doAutoSave])

  // ── AI YAZIM ASISTANI ──
  const aiAssist = async (action: 'fix' | 'excerpt' | 'title') => {
    const content = editorRef.current?.innerText ?? ''
    if (!content && action !== 'title') return
    setAiLoading(true); setAiResult('')
    try {
      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, title, content: content.substring(0, 3000), excerpt }),
      })
      const { result } = await res.json()
      if (action === 'excerpt') {
        setExcerpt(result)
        setAiPanel(false)
      } else if (action === 'fix') {
        if (editorRef.current) editorRef.current.innerHTML = result
        setContentHtml(result)
        setAiPanel(false)
      } else {
        setAiResult(result)
      }
    } catch { setAiResult('Hata oluştu.') }
    setAiLoading(false)
  }

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    const sorun = dosyaKontrol(file)
    if (sorun) { alert(sorun); return null }
    const ext  = file.name.split('.').pop()
    const path = `${folder}/${Date.now()}.${ext}`
    const { error } = await supabase.storage.from('images').upload(path, file, { upsert: true })
    if (error) { alert('Yükleme hatası: ' + error.message); return null }
    const { data } = supabase.storage.from('images').getPublicUrl(path)
    return data.publicUrl
  }

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    setUploading(true)
    const url = await uploadFile(file, 'covers')
    if (url) setCoverUrl(url)
    setUploading(false)
  }

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Oturum açık değil.'); setLoading(false); return }
    const content = editorRef.current?.innerHTML ?? contentHtml
    const postData = {
      title, slug, excerpt, cover_url: coverUrl || null, content,
      category, read_time: readTime, published,
      scheduled_at: (!published && scheduledAt) ? scheduledAt : null,
      meta_title: metaTitle || null, meta_description: metaDesc || null,
      author_id: user.id,
      author_name: authorName || null,
    }
    if (draftId) {
      const { error: err } = await supabase.from('posts').update({ ...postData }).eq('id', draftId)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { error: err } = await supabase.from('posts').insert(postData)
      if (err) { setError(err.message); setLoading(false); return }
    }
    router.push('/admin')
  }

  return (
    <AdminShell
      title="Yeni yazı"
      action={
        <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Auto-save durumu */}
          <span style={{ fontSize: '0.65rem', color: '#a89c8c', minWidth: 120, textAlign: 'right' }}>
            {saveStatus === 'saving' ? '💾 kaydediliyor…' : saveStatus === 'saved' ? `✓ ${lastSaved} kaydedildi` : ''}
          </span>

          {/* AI butonu */}
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => setAiPanel(p => !p)} style={{ ...topBtn, border: '1px solid rgba(181,115,74,0.4)', color: '#b5734a', background: aiPanel ? 'rgba(181,115,74,0.1)' : 'transparent' }}>
              {aiLoading ? '⏳ AI…' : '✨ AI'}
            </button>
            {aiPanel && (
              <div style={{
                position: 'absolute', top: '110%', right: 0, zIndex: 200,
                background: '#faf8f5', border: '1px solid #e4ddd1',
                borderRadius: 12, padding: '0.75rem', width: 220,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>
                <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', color: '#a89c8c', marginBottom: '0.5rem', textTransform: 'uppercase' }}>AI Yardımı</div>
                {[
                  { label: '✏️ Metni düzelt', action: () => aiAssist('fix'), desc: 'Yazım + dilbilgisi' },
                  { label: '📝 Özet yaz', action: () => aiAssist('excerpt'), desc: 'Kart özeti oluştur' },
                  { label: '💡 Başlık öner', action: () => aiAssist('title'), desc: '3 başlık seçeneği' },
                ].map(({ label, action, desc }) => (
                  <button key={label} type="button" onClick={action} disabled={aiLoading} style={{
                    display: 'block', width: '100%', textAlign: 'left', padding: '0.6rem 0.75rem',
                    background: 'transparent', border: 'none', color: '#2c2419', cursor: 'pointer',
                    borderRadius: 8, marginBottom: 2, fontSize: '0.8rem',
                    transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#fbf9f6')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    {label}
                    <div style={{ fontSize: '0.6rem', color: '#a89c8c', marginTop: 1 }}>{desc}</div>
                  </button>
                ))}
                {aiResult && (
                  <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: '#fbf9f6', borderRadius: 8, fontSize: '0.78rem', lineHeight: 1.6, color: '#2c2419', whiteSpace: 'pre-wrap' }}>
                    {aiResult}
                  </div>
                )}
              </div>
            )}
          </div>

          {uploading && <span style={{ fontSize: '0.7rem', color: '#b5734a' }}>⏳ yükleniyor</span>}
          <button type="button" onClick={() => setPreview(p => !p)} style={{ ...topBtn, border: '1px solid #e4ddd1', color: '#2c2419' }}>
            {preview ? 'düzenle' : 'önizle'}
          </button>
          <button type="button" onClick={() => setPublished(p => !p)} style={{
            ...topBtn,
            color: published ? '#fff' : '#2c2419',
            background: published ? '#4f7a52' : '#fff',
            border: `1px solid ${published ? '#4f7a52' : '#e4ddd1'}`,
          }}>
            {published ? '● yayında' : '○ taslak'}
          </button>
          <button form="post-form" type="submit" disabled={loading} style={{ ...topBtn, background: '#b5734a', color: '#fff', border: 'none', opacity: loading ? 0.7 : 1 }}>
            {loading ? '…' : 'kaydet'}
          </button>
        </div>
      }
    >
      <form id="post-form" onSubmit={handle}>
        <div style={{ maxWidth: 860 }}>

          {/* Başlık */}
          <textarea
            placeholder="Yazı başlığı..." value={title}
            onChange={e => handleTitleChange(e.target.value)}
            required rows={2}
            style={{
              width: '100%', background: 'transparent', border: 'none',
              borderBottom: '1px solid #e4ddd1',
              color: '#2c2419', outline: 'none', resize: 'none',
              fontFamily: "'Playfair Display',serif", fontStyle: 'italic',
              fontSize: 'clamp(1.8rem,4vw,2.8rem)', lineHeight: 1.2,
              paddingBottom: '1rem', marginBottom: '1.5rem',
            }}
          />

          {/* Meta satırı */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <div><label style={lbl}>slug / url</label><input value={slug} onChange={e => setSlug(e.target.value)} required placeholder="url-adresi" style={inp} /></div>
            <div>
              <label style={lbl}>kategori</label>
              <select value={category} onChange={e => setCategory(e.target.value)} style={inp}>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>yazar</label>
              {authors.length > 0 ? (
                <select value={authorName} onChange={e => setAuthorName(e.target.value)} style={inp}>
                  <option value="">seç</option>
                  {authors.map(a => (
                    <option key={a.id} value={a.name}>{a.name}</option>
                  ))}
                  <option value="__custom">başka yazar…</option>
                </select>
              ) : (
                <input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Yazar adı" style={inp} />
              )}
              {authorName === '__custom' && (
                <input autoFocus value="" onChange={e => setAuthorName(e.target.value)} placeholder="Yazar adını yaz" style={{ ...inp, marginTop: 4 }} />
              )}
            </div>
            <div style={{ minWidth: 70 }}>
              <label style={lbl}>dk okuma</label>
              <input type="number" min={1} max={99} value={readTime} onChange={e => setReadTime(+e.target.value)} style={inp} />
            </div>
          </div>

          {/* Özet */}
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={lbl}>özet</label>
            <textarea value={excerpt} onChange={e => setExcerpt(e.target.value)} placeholder="Okuyucuyu çekecek kısa bir cümle…" rows={2} style={{ ...inp, resize: 'vertical', lineHeight: 1.6 }} />
          </div>

          {/* ── SEO ── */}
          <details style={{ marginBottom: '1.5rem' }}>
            <summary style={{ ...lbl, cursor: 'pointer', userSelect: 'none', listStyle: 'none', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span>▸ SEO ayarları</span>
              <span style={{ fontSize: '0.55rem', color: '#a89c8c' }}>boş bırakırsan başlık + özet kullanılır</span>
            </summary>
            <div style={{ paddingTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={lbl}>meta başlık (Google'da görünen)</label>
                <input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} placeholder={title || 'Meta başlık...'} maxLength={60} style={inp} />
                <div style={{ fontSize: '0.58rem', color: '#a89c8c', marginTop: 3 }}>{metaTitle.length}/60</div>
              </div>
              <div>
                <label style={lbl}>meta açıklama</label>
                <textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} placeholder={excerpt || 'Meta açıklama...'} maxLength={160} rows={2} style={{ ...inp, resize: 'vertical' }} />
                <div style={{ fontSize: '0.58rem', color: '#a89c8c', marginTop: 3 }}>{metaDesc.length}/160</div>
              </div>
            </div>
          </details>

          {/* ── YAYIN ZAMANLAMA ── */}
          <div style={{ marginBottom: '1.5rem', padding: '0.9rem 1rem', background: '#fbf9f6', borderRadius: 10, border: '1px solid #fbf9f6' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <label style={{ ...lbl, marginBottom: 0 }}>⏰ yayın zamanlama</label>
              <button type="button" onClick={() => setShowSchedule(s => !s)} style={{
                fontSize: '0.65rem', padding: '0.25rem 0.7rem', borderRadius: 50,
                border: '1px solid #a89c8c', background: 'transparent',
                color: '#7d7264', cursor: 'pointer',
              }}>
                {showSchedule ? 'kapat' : 'zamanla'}
              </button>
            </div>
            {showSchedule && (
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={e => setScheduledAt(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  style={{ ...inp, flex: 1, colorScheme: 'dark' }}
                />
                {scheduledAt && (
                  <button type="button" onClick={() => setScheduledAt('')} style={{ ...smallBtn, background: 'transparent', border: '1px solid #e4ddd1', color: '#7d7264' }}>
                    iptal
                  </button>
                )}
              </div>
            )}
            {scheduledAt && (
              <div style={{ marginTop: '0.5rem', fontSize: '0.68rem', color: '#b5734a' }}>
                📅 {new Date(scheduledAt).toLocaleString('tr-TR')} tarihinde otomatik yayınlanacak
              </div>
            )}
          </div>

          {/* ── COVER ── */}
          <div style={{ marginBottom: '2rem' }}>
            <label style={lbl}>kapak görseli</label>
            <div style={{ border: '1px solid #e4ddd1', borderRadius: 12, overflow: 'hidden', background: '#fbf9f6' }}>
              {coverUrl && (
                <div style={{ position: 'relative' }}>
                  <img src={coverUrl} alt="cover" style={{ width: '100%', height: 220, objectFit: 'cover', display: 'block' }} />
                  <button type="button" onClick={() => setCoverUrl('')} style={{ position: 'absolute', top: 10, right: 10, background: 'rgba(0,0,0,0.6)', border: 'none', color: '#2c2419', borderRadius: 6, padding: '0.3rem 0.6rem', fontSize: '0.72rem', cursor: 'pointer' }}>✕</button>
                </div>
              )}
              <div style={{ padding: '1rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button type="button" onClick={() => coverFileRef.current?.click()} style={{ ...smallBtn, background: '#b5734a' }}>📁 bilgisayardan yükle</button>
                <input ref={coverFileRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
                <span style={{ fontSize: '0.65rem', color: '#a89c8c' }}>veya</span>
                <input value={coverUrl} onChange={e => setCoverUrl(e.target.value)} placeholder="https://… görsel URL" style={{ ...inp, flex: 1, minWidth: 200 }} />
              </div>
            </div>
          </div>

          {/* ── İÇERİK ── */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <label style={lbl}>içerik</label>
              {error && <span style={{ fontSize: '0.75rem', color: '#b03030' }}>{error}</span>}
            </div>

            {!preview ? (
              <>
                <RichEditor
                  editorRef={editorRef}
                  onChange={setContentHtml}
                  onUpload={uploadFile}
                />
                <style>{`details summary::-webkit-details-marker{display:none}`}</style>
              </>
            ) : (
              <div className="post-content" style={{ minHeight: 420, padding: '2rem', background: '#fff', border: '1px solid #e4ddd1', color: '#2c2419', borderRadius: 10 }}>
                {coverUrl && <img src={coverUrl} alt="" style={{ width: '100%', height: 300, objectFit: 'cover', borderRadius: 10, marginBottom: '2rem' }} />}
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '2rem', marginBottom: '1rem' }}>{title || 'Başlık yok'}</h1>
                <div dangerouslySetInnerHTML={{ __html: contentHtml || '<p style="color:#a89c8c">İçerik yok</p>' }} />
              </div>
            )}
          </div>

        </div>
      </form>
    </AdminShell>
  )
}

const topBtn: React.CSSProperties = { fontSize: '0.72rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: '#2c2419', padding: '0.45rem 1rem', borderRadius: 50, background: 'transparent', cursor: 'pointer' }
const lbl: React.CSSProperties    = { display: 'block', fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#a89c8c', marginBottom: '0.35rem' }
const inp: React.CSSProperties    = { width: '100%', padding: '0.55rem 0.8rem', border: '1px solid #e4ddd1', borderRadius: 8, background: '#fbf9f6', color: '#2c2419', outline: 'none', fontFamily: 'inherit', fontSize: '0.84rem' }
const smallBtn: React.CSSProperties = { fontSize: '0.72rem', padding: '0.45rem 0.9rem', borderRadius: 8, border: 'none', color: '#2c2419', cursor: 'pointer', whiteSpace: 'nowrap' }
