'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/*
  Tarayıcı dili Türkçe olmayan ziyaretçiye, Türkçe liste sayfalarında İngilizce
  bölümü öneren ince bir şerit. Otomatik yönlendirme yapmıyoruz: Google'ın
  tarayıcısı İngilizce geliyor, yönlendirseydik Türkçe sayfaları göremezdi.

  - Yalnızca tarayıcıda, sayfa yüklendikten sonra karar veriliyor; sunucu
    çıktısında yok, arama motorları görmüyor.
  - Ekranın altında sabit duruyor, sayfa düzenini kaydırmıyor.
  - Kapatılınca bir daha gösterilmiyor (localStorage).
*/
const ANAHTAR = 'tc-dil-onerisi-kapali'

export default function DilOnerisi() {
  const [goster, setGoster] = useState(false)

  useEffect(() => {
    try {
      if (localStorage.getItem(ANAHTAR)) return
    } catch { /* gizli sekme vb. */ }
    const diller = (navigator.languages?.length ? navigator.languages : [navigator.language]).filter(Boolean)
    const turkce = diller.some(d => d.toLowerCase().startsWith('tr'))
    if (!turkce) setGoster(true)
  }, [])

  if (!goster) return null

  const kapat = () => {
    setGoster(false)
    try { localStorage.setItem(ANAHTAR, '1') } catch { /* yok say */ }
  }

  return (
    <div lang="en" role="region" aria-label="Language suggestion" style={{
      position: 'fixed', left: 0, right: 0, bottom: 0, zIndex: 90,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap',
      padding: '0.7rem 1rem', background: 'rgba(44,36,25,0.94)', color: '#f5f0e8',
      fontSize: '0.85rem',
    }}>
      <span>Looking for English?</span>
      <Link href="/en" hrefLang="en" onClick={kapat} style={{ color: '#f5f0e8', fontWeight: 600, borderBottom: '1px solid rgba(245,240,232,0.5)' }}>
        Read The Cultiva in English →
      </Link>
      <button onClick={kapat} aria-label="Close" style={{
        background: 'none', border: 'none', color: 'rgba(245,240,232,0.7)', fontSize: '1.1rem', cursor: 'pointer', lineHeight: 1,
      }}>×</button>
    </div>
  )
}
