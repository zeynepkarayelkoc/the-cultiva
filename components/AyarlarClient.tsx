'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, input, btn, btnPrimary, label } from '@/lib/adminTheme'

type Ayarlar = {
  site_title: string
  site_description: string
  favicon_url: string
  apple_icon_url: string
}

export default function AyarlarClient({
  email, ayarlar, stats,
}: {
  email: string
  ayarlar: Ayarlar
  stats: { posts: number; authors: number; categories: number }
}) {
  const router = useRouter()
  const supabase = createClient()
  const dosyaRef = useRef<HTMLInputElement>(null)

  const [baslik, setBaslik]   = useState(ayarlar.site_title)
  const [aciklama, setAciklama] = useState(ayarlar.site_description)
  const [ikon, setIkon]       = useState(ayarlar.favicon_url)
  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [yukleniyor, setYukleniyor]     = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const kaydet = async () => {
    setKaydediliyor(true); setErr(''); setMsg('')
    const { error } = await supabase.from('site_settings').upsert([
      { key: 'site_title',       value: baslik.trim() },
      { key: 'site_description', value: aciklama.trim() },
      { key: 'favicon_url',      value: ikon.trim() },
    ])
    setKaydediliyor(false)
    if (error) { setErr(error.message); return }
    setMsg('Kaydedildi. Arama sonuçlarına yansıması birkaç gün sürebilir.')
    router.refresh()
  }

  const ikonYukle = async (dosya: File) => {
    setYukleniyor(true); setErr(''); setMsg('')
    const uzanti = dosya.name.split('.').pop() ?? 'png'
    const yol = `site/favicon-${Date.now()}.${uzanti}`
    const { error: upErr } = await supabase.storage.from('images').upload(yol, dosya, { upsert: true })
    if (upErr) { setYukleniyor(false); setErr(upErr.message); return }
    const { data } = supabase.storage.from('images').getPublicUrl(yol)
    setIkon(data.publicUrl)
    setYukleniyor(false)
    setMsg('Görsel yüklendi, kaydetmeyi unutma.')
  }

  const cikis = async () => {
    await supabase.auth.signOut()
    router.push('/admin/giris')
  }

  const kutu: React.CSSProperties = {
    background: T.panel, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: 18, marginBottom: 16, maxWidth: 620,
  }
  const satir: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between',
    padding: '9px 0', borderBottom: `1px solid ${T.borderSoft}`, fontSize: '0.86rem',
  }
  const sayac = (n: number, max: number): React.CSSProperties => ({
    fontSize: '0.7rem', color: n > max ? T.danger : T.faint, marginTop: 4,
  })

  return (
    <AdminShell title="Ayarlar">
      {/* Site kimliği */}
      <div style={kutu}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 4 }}>Site kimliği</div>
        <p style={{ fontSize: '0.78rem', color: T.muted, lineHeight: 1.6, margin: '0 0 16px' }}>
          Google sonuçlarında ve tarayıcı sekmesinde görünen bilgiler.
        </p>

        <label style={label}>Site başlığı</label>
        <input style={input} value={baslik} onChange={e => setBaslik(e.target.value)} />
        <div style={sayac(baslik.length, 60)}>{baslik.length} / 60 karakter. Uzunu Google&apos;da kesilir</div>

        <div style={{ height: 14 }} />

        <label style={label}>Meta açıklama</label>
        <textarea
          style={{ ...input, height: 68, padding: '8px 10px', resize: 'vertical', lineHeight: 1.6 }}
          value={aciklama} onChange={e => setAciklama(e.target.value)}
        />
        <div style={sayac(aciklama.length, 160)}>{aciklama.length} / 160 karakter</div>

        <div style={{ height: 18 }} />

        <label style={label}>Site ikonu (sekmede ve Google&apos;da görünen)</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{
            width: 46, height: 46, borderRadius: 8, flexShrink: 0,
            border: `1px solid ${T.border}`, background: `#fff url(${ikon}) center/contain no-repeat`,
          }} />
          <input
            style={{ ...input, flex: 1, fontSize: '0.78rem' }}
            value={ikon} onChange={e => setIkon(e.target.value)} placeholder="/icon.png"
          />
          <button style={{ ...btn, whiteSpace: 'nowrap' }} onClick={() => dosyaRef.current?.click()} disabled={yukleniyor}>
            {yukleniyor ? 'yükleniyor…' : 'Görsel yükle'}
          </button>
          <input
            ref={dosyaRef} type="file" accept="image/png,image/x-icon,image/svg+xml" hidden
            onChange={e => { const f = e.target.files?.[0]; if (f) ikonYukle(f) }}
          />
        </div>
        <div style={{ fontSize: '0.7rem', color: T.faint, marginTop: 6 }}>
          Kare, en az 180×180 piksel önerilir. Varsayılana dönmek için kutuya <code>/icon.png</code> yaz.
        </div>

        {/* Google önizlemesi */}
        <div style={{ marginTop: 20, padding: 14, background: '#fff', border: `1px solid ${T.borderSoft}`, borderRadius: 8 }}>
          <div style={{ fontSize: '0.65rem', color: T.faint, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 10 }}>
            Google&apos;da böyle görünecek
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 6 }}>
            <div style={{
              width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
              border: `1px solid ${T.borderSoft}`, background: `#fff url(${ikon}) center/60% no-repeat`,
            }} />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: '0.78rem', color: T.text }}>thecultiva.com</div>
              <div style={{ fontSize: '0.72rem', color: T.muted }}>https://www.thecultiva.com</div>
            </div>
          </div>
          <div style={{ color: '#6b31a8', fontSize: '1.05rem', marginBottom: 3 }}>{baslik || '-'}</div>
          <div style={{ fontSize: '0.82rem', color: '#4a4a4a', lineHeight: 1.5 }}>{aciklama || '-'}</div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18 }}>
          <button style={btnPrimary} onClick={kaydet} disabled={kaydediliyor}>
            {kaydediliyor ? 'kaydediliyor…' : 'Kaydet'}
          </button>
          {msg && <span style={{ fontSize: '0.78rem', color: T.green }}>{msg}</span>}
          {err && <span style={{ fontSize: '0.78rem', color: T.danger }}>{err}</span>}
        </div>
      </div>

      {/* Hesap */}
      <div style={kutu}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 10 }}>Hesap</div>
        <div style={{ ...satir, borderBottom: 'none' }}>
          <span style={{ color: T.muted }}>Giriş yapan</span>
          <span>{email}</span>
        </div>
        <button style={{ ...btn, marginTop: 12 }} onClick={cikis}>Çıkış yap</button>
      </div>

      {/* Özet */}
      <div style={kutu}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 10 }}>Site özeti</div>
        <div style={satir}><span style={{ color: T.muted }}>Yazı</span><span>{stats.posts}</span></div>
        <div style={satir}><span style={{ color: T.muted }}>Yazar</span><span>{stats.authors}</span></div>
        <div style={{ ...satir, borderBottom: 'none' }}><span style={{ color: T.muted }}>Kategori</span><span>{stats.categories}</span></div>
      </div>

      <div style={kutu}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 6 }}>Zamanlanmış yayın</div>
        <p style={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.65, margin: 0 }}>
          Yayın saati gelen taslaklar her sabah 09:00&apos;da otomatik yayına alınır.
          Sıklık Vercel Hobby planının günlük tek görev sınırına göre ayarlı.
        </p>
      </div>
    </AdminShell>
  )
}
