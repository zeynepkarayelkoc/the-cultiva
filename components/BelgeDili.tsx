'use client'
import { useEffect } from 'react'

/*
  Kök layout <html lang="tr"> diyor ve önbelleği bozmamak için sayfa başına
  değiştirilemiyor. İngilizce sayfalar bu bileşeni koyuyor; tarayıcıda html
  lang'i "en" yapıyor, sayfadan çıkınca geri alıyor. İçerik zaten
  <article lang="en"> / <div lang="en"> ile işaretli, bu ek bir güvence.
*/
export default function BelgeDili({ dil }: { dil: 'tr' | 'en' }) {
  useEffect(() => {
    const onceki = document.documentElement.lang
    document.documentElement.lang = dil
    return () => { document.documentElement.lang = onceki || 'tr' }
  }, [dil])
  return null
}
