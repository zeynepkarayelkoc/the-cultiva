'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import { dosyaKontrol } from '@/lib/upload'

/*
  Yazı içeriği editörü. Hem "yeni yazı" hem "yazıyı düzenle" sayfası bunu kullanır,
  böylece iki yerde ayrı toolbar tutmak zorunda kalmıyoruz.

  Önemli: buradaki stiller app/globals.css içindeki .post-content kurallarıyla
  birebir aynı tutulmalı. Editörde gördüğün boyut, sitede çıkacak boyuttur.
  Birini değiştirirsen diğerini de değiştir.
*/

export type YuklemeFn = (dosya: File, klasor: string) => Promise<string | null>

type Props = {
  editorRef: React.RefObject<HTMLDivElement | null>
  onChange: (html: string) => void
  onUpload: YuklemeFn
  minHeight?: number
}

/* ---------- blok biçimleri ---------- */
const BLOKLAR = [
  { deger: 'p',          ad: 'Normal metin' },
  { deger: 'h2',         ad: 'Başlık 1' },
  { deger: 'h3',         ad: 'Başlık 2' },
  { deger: 'h4',         ad: 'Başlık 3' },
  { deger: 'blockquote', ad: 'Alıntı' },
]

/* ---------- hazır punto ölçeği ---------- */
// Gövde metni sitede 1.05rem. Ölçek buna göre kuruldu.
const PUNTOLAR = [
  { deger: '',         ad: 'Normal' },
  { deger: '0.85rem',  ad: 'Küçük' },
  { deger: '1.15rem',  ad: 'Büyük' },
  { deger: '1.35rem',  ad: 'Çok büyük' },
]

/* ---------- görsel genişlikleri ---------- */
const GENISLIKLER = [
  { deger: '40%',  ad: 'Küçük' },
  { deger: '65%',  ad: 'Orta' },
  { deger: '85%',  ad: 'Geniş' },
  { deger: '100%', ad: 'Tam' },
]

const HIZALAR = [
  { deger: 'sol',  ad: '⤆', baslik: 'Sola yasla' },
  { deger: 'orta', ad: '⇔', baslik: 'Ortala' },
  { deger: 'sag',  ad: '⤇', baslik: 'Sağa yasla' },
]

function hizaUygula(img: HTMLImageElement, hiza: string) {
  img.style.display = 'block'
  if (hiza === 'sol')      { img.style.marginLeft = '0';    img.style.marginRight = 'auto' }
  else if (hiza === 'sag') { img.style.marginLeft = 'auto'; img.style.marginRight = '0' }
  else                     { img.style.marginLeft = 'auto'; img.style.marginRight = 'auto' }
  img.style.marginTop = '2rem'
  img.style.marginBottom = '2rem'
}

function hizaOku(img: HTMLImageElement): string {
  const sol = img.style.marginLeft
  const sag = img.style.marginRight
  if (sol === '0px' || sol === '0') return 'sol'
  if (sag === '0px' || sag === '0') return 'sag'
  return 'orta'
}

export default function RichEditor({ editorRef, onChange, onUpload, minHeight = 460 }: Props) {
  const [blok, setBlok]           = useState('p')
  const [punto, setPunto]         = useState('')
  const [ozelPunto, setOzelPunto] = useState('')
  const [imgSecili, setImgSecili] = useState(false)
  const [imgGenislik, setImgGenislik] = useState('100%')
  const [imgHiza, setImgHiza]     = useState('orta')
  const [yukleniyor, setYukleniyor] = useState(false)
  const dosyaRef = useRef<HTMLInputElement>(null)
  // Seçili görseli state'te değil ref'te tutuyoruz: DOM düğümü React state'i
  // değil, dış bir sistem. State'te tutup üzerinde style değiştirmek
  // React'in değişmezlik kuralını ihlal ediyor.
  const secilenRef = useRef<HTMLImageElement | null>(null)

  const bildir = useCallback(() => {
    onChange(editorRef.current?.innerHTML ?? '')
  }, [onChange, editorRef])

  const exec = useCallback((cmd: string, value?: string) => {
    document.execCommand(cmd, false, value)
    editorRef.current?.focus()
    bildir()
  }, [bildir, editorRef])

  /* ---------- punto uygulama ----------
     execCommand('fontSize') yalnızca 1-7 arası kabul ediyor ve <font> etiketi
     üretiyor. O yüzden 7 ile işaretleyip ürettiği etiketleri kendi span'imizle
     değiştiriyoruz. Böylece istediğimiz rem/px değerini verebiliyoruz. */
  const puntoUygula = useCallback((css: string) => {
    const sec = window.getSelection()
    if (!sec || sec.isCollapsed) {
      alert('Önce boyutunu değiştirmek istediğin metni seç.')
      return
    }
    document.execCommand('fontSize', false, '7')
    const kok = editorRef.current
    if (!kok) return
    kok.querySelectorAll('font[size="7"]').forEach(f => {
      if (css) {
        const span = document.createElement('span')
        span.style.fontSize = css
        while (f.firstChild) span.appendChild(f.firstChild)
        f.replaceWith(span)
      } else {
        // "Normal" seçildiyse sarmalayıcıyı tamamen kaldır
        const parca = document.createDocumentFragment()
        while (f.firstChild) parca.appendChild(f.firstChild)
        f.replaceWith(parca)
      }
    })
    editorRef.current?.focus()
    bildir()
  }, [bildir, editorRef])

  /* ---------- görsel ---------- */
  const gorselEkle = useCallback((url: string) => {
    const kok = editorRef.current
    if (!kok) return
    kok.focus()
    document.execCommand('insertHTML', false,
      `<img src="${url}" alt="" style="display:block;width:100%;margin:2rem auto;border-radius:12px;height:auto" /><p><br></p>`)
    bildir()
  }, [bildir, editorRef])

  const dosyaSecildi = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const dosya = e.target.files?.[0]
    e.target.value = ''
    if (!dosya) return
    const sorun = dosyaKontrol(dosya)
    if (sorun) { alert(sorun); return }
    setYukleniyor(true)
    const url = await onUpload(dosya, 'content')
    setYukleniyor(false)
    if (url) gorselEkle(url)
  }

  // Görsele tıklanınca boyut panelini aç
  const tikla = (e: React.MouseEvent) => {
    const hedef = e.target as HTMLElement
    if (hedef.tagName === 'IMG') {
      const img = hedef as HTMLImageElement
      secilenRef.current = img
      setImgGenislik(img.style.width || '100%')
      setImgHiza(hizaOku(img))
      setImgSecili(true)
    } else {
      secilenRef.current = null
      setImgSecili(false)
    }
  }

  const genislikUygula = (deger: string) => {
    const img = secilenRef.current
    if (!img) return
    img.style.width = deger
    img.style.height = 'auto'
    hizaUygula(img, imgHiza)
    setImgGenislik(deger)
    bildir()
  }

  const hizaSec = (deger: string) => {
    const img = secilenRef.current
    if (!img) return
    hizaUygula(img, deger)
    setImgHiza(deger)
    bildir()
  }

  const gorselSil = () => {
    const img = secilenRef.current
    if (!img) return
    img.remove()
    secilenRef.current = null
    setImgSecili(false)
    bildir()
  }

  // İmlecin bulunduğu bloğu takip et, açılır listede doğru seçenek görünsün
  useEffect(() => {
    const guncelle = () => {
      const kok = editorRef.current
      if (!kok) return
      const sec = window.getSelection()
      if (!sec || sec.rangeCount === 0) return
      let d = sec.anchorNode as HTMLElement | null
      while (d && d !== kok) {
        const etiket = d.nodeType === 1 ? d.tagName?.toLowerCase() : ''
        if (etiket && BLOKLAR.some(b => b.deger === etiket)) { setBlok(etiket); return }
        d = d.parentElement
      }
      setBlok('p')
    }
    document.addEventListener('selectionchange', guncelle)
    return () => document.removeEventListener('selectionchange', guncelle)
  }, [editorRef])

  return (
    <>
      {/* ---------- TOOLBAR ---------- */}
      <div style={cubuk}>
        <select
          value={blok}
          onChange={e => { setBlok(e.target.value); exec('formatBlock', e.target.value) }}
          title="Metin biçimi"
          style={{ ...secim, minWidth: 118 }}
        >
          {BLOKLAR.map(b => <option key={b.deger} value={b.deger}>{b.ad}</option>)}
        </select>

        <select
          value={punto}
          onChange={e => { setPunto(e.target.value); setOzelPunto(''); puntoUygula(e.target.value) }}
          title="Yazı boyutu"
          style={{ ...secim, minWidth: 96 }}
        >
          {PUNTOLAR.map(p => <option key={p.ad} value={p.deger}>{p.ad}</option>)}
        </select>

        <input
          type="number" min={10} max={72} placeholder="px"
          value={ozelPunto}
          onChange={e => setOzelPunto(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              e.preventDefault()
              const n = Number(ozelPunto)
              if (n >= 10 && n <= 72) { setPunto(''); puntoUygula(`${n}px`) }
            }
          }}
          onBlur={() => {
            const n = Number(ozelPunto)
            if (n >= 10 && n <= 72) { setPunto(''); puntoUygula(`${n}px`) }
          }}
          title="Kendi puntonu yaz, sonra Enter'a bas"
          style={{ ...secim, width: 58, textAlign: 'center' }}
        />

        <Ayrac />

        <Dugme title="Kalın" onAction={() => exec('bold')} stil={{ fontWeight: 700 }}>B</Dugme>
        <Dugme title="İtalik" onAction={() => exec('italic')} stil={{ fontStyle: 'italic' }}>I</Dugme>
        <Dugme title="Alt çizgi" onAction={() => exec('underline')} stil={{ textDecoration: 'underline' }}>U</Dugme>
        <Dugme title="Üstü çizili" onAction={() => exec('strikeThrough')} stil={{ textDecoration: 'line-through' }}>S</Dugme>

        <Ayrac />

        <Dugme title="Madde listesi" onAction={() => exec('insertUnorderedList')}>≡</Dugme>
        <Dugme title="Numaralı liste" onAction={() => exec('insertOrderedList')}>1.</Dugme>
        <Dugme title="Ayraç çizgisi" onAction={() => exec('insertHorizontalRule')}>―</Dugme>

        <Ayrac />

        <Dugme title="Bağlantı ekle" onAction={() => { const u = prompt('URL:'); if (u) exec('createLink', u) }}>🔗</Dugme>
        <Dugme title="Görsel yükle" onAction={() => dosyaRef.current?.click()}>
          {yukleniyor ? '⏳' : '🖼'}
        </Dugme>
        <Dugme title="Görsel adresi yapıştır" onAction={() => { const u = prompt('Görsel URL:'); if (u) gorselEkle(u) }} stil={{ fontSize: '0.62rem', letterSpacing: '0.05em' }}>IMG URL</Dugme>

        <Ayrac />

        <Dugme title="Biçimi temizle" onAction={() => exec('removeFormat')} stil={{ color: '#b03030' }}>✕</Dugme>
      </div>

      <input ref={dosyaRef} type="file" accept="image/*" onChange={dosyaSecildi} style={{ display: 'none' }} />

      {/* ---------- SEÇİLİ GÖRSEL PANELİ ---------- */}
      {imgSecili && (
        <div style={imgPanel}>
          <span style={imgEtiket}>Görsel</span>
          {GENISLIKLER.map(g => (
            <button key={g.deger} type="button" onClick={() => genislikUygula(g.deger)}
              style={{ ...imgDugme, ...(imgGenislik === g.deger ? imgAktif : null) }}>
              {g.ad}
            </button>
          ))}
          <span style={{ width: 1, alignSelf: 'stretch', background: '#e4ddd1', margin: '0 4px' }} />
          {HIZALAR.map(h => (
            <button key={h.deger} type="button" title={h.baslik} onClick={() => hizaSec(h.deger)}
              style={{ ...imgDugme, ...(imgHiza === h.deger ? imgAktif : null) }}>
              {h.ad}
            </button>
          ))}
          <span style={{ flex: 1 }} />
          <button type="button" onClick={gorselSil} style={{ ...imgDugme, color: '#b03030' }}>sil</button>
          <button type="button" onClick={() => { secilenRef.current = null; setImgSecili(false) }} style={imgDugme}>kapat</button>
        </div>
      )}

      {/* ---------- YAZIM ALANI ---------- */}
      <div
        ref={editorRef}
        className="yazi-editor"
        contentEditable
        suppressContentEditableWarning
        onInput={bildir}
        onClick={tikla}
        data-placeholder="Yazınızı buraya yazın…"
        style={{
          minHeight,
          padding: '1.8rem 1.6rem',
          background: '#fff',
          border: '1px solid #e4ddd1',
          borderTop: 'none',
          borderRadius: imgSecili ? 0 : '0 0 10px 10px',
          color: '#2c2419',
          outline: 'none',
          fontFamily: "'Open Sans', sans-serif",
          fontSize: '1.05rem',
          lineHeight: 1.85,
        }}
      />

      {/* Sitedeki .post-content ile aynı görünüm */}
      <style>{`
        .yazi-editor:empty:before{content:attr(data-placeholder);color:#a89c8c;pointer-events:none}
        .yazi-editor p{margin:0 0 1.4rem}
        .yazi-editor h2,.yazi-editor h3,.yazi-editor h4{
          font-family:'Playfair Display',serif;font-weight:500;line-height:1.3;
          color:#2c2419;margin:2.4rem 0 1rem}
        .yazi-editor h2{font-size:1.6rem}
        .yazi-editor h3{font-size:1.35rem}
        .yazi-editor h4{font-size:1.15rem}
        .yazi-editor strong,.yazi-editor b{font-weight:600;color:#1e1410}
        .yazi-editor blockquote{margin:2rem 0;padding:0.5rem 0 0.5rem 1.4rem;
          border-left:3px solid #b5734a;font-style:italic;color:#7d7264}
        .yazi-editor ul,.yazi-editor ol{margin:0 0 1.4rem;padding-left:1.4rem}
        .yazi-editor li{margin-bottom:0.5rem}
        .yazi-editor a{color:#b5734a;border-bottom:1px solid rgba(139,38,53,0.3)}
        .yazi-editor hr{border:none;border-top:1px solid #e4ddd1;margin:2.5rem 0}
        .yazi-editor img{max-width:100%;height:auto;border-radius:12px;cursor:pointer}
        .yazi-editor img:hover{outline:2px solid rgba(181,115,74,0.5);outline-offset:3px}
      `}</style>
    </>
  )
}

/* ---------- küçük parçalar ---------- */

function Ayrac() {
  return <span style={{ width: 1, background: '#e4ddd1', margin: '3px 5px', alignSelf: 'stretch' }} />
}

function Dugme({ children, title, onAction, stil }: {
  children: React.ReactNode; title: string
  onAction: () => void; stil?: React.CSSProperties
}) {
  return (
    <button
      type="button" title={title}
      onMouseDown={e => { e.preventDefault(); onAction() }}
      style={{
        background: 'transparent', border: 'none', color: '#2c2419',
        cursor: 'pointer', padding: '0.35rem 0.55rem', borderRadius: 6,
        minWidth: 30, fontSize: '0.85rem', lineHeight: 1, ...stil,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f3efe8')}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >{children}</button>
  )
}

/* ---------- stiller ---------- */

const cubuk: React.CSSProperties = {
  display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center',
  padding: '0.45rem 0.6rem', background: '#faf8f5',
  border: '1px solid #e4ddd1', borderBottom: '1px solid #e4ddd1',
  borderRadius: '10px 10px 0 0',
}

const secim: React.CSSProperties = {
  fontSize: '0.75rem', padding: '0.3rem 0.4rem', borderRadius: 6,
  border: '1px solid #e4ddd1', background: '#fff', color: '#2c2419',
  fontFamily: 'inherit', outline: 'none', cursor: 'pointer',
}

const imgPanel: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap',
  padding: '0.45rem 0.6rem', background: '#f3efe8',
  border: '1px solid #e4ddd1', borderTop: 'none', borderBottom: 'none',
}

const imgEtiket: React.CSSProperties = {
  fontSize: '0.58rem', letterSpacing: '0.2em', textTransform: 'uppercase',
  color: '#a89c8c', marginRight: 6,
}

const imgDugme: React.CSSProperties = {
  fontSize: '0.72rem', padding: '0.3rem 0.7rem', borderRadius: 6,
  border: '1px solid #e4ddd1', background: '#fff', color: '#2c2419',
  cursor: 'pointer', fontFamily: 'inherit',
}

const imgAktif: React.CSSProperties = {
  background: '#b5734a', color: '#fff', borderColor: '#b5734a',
}
