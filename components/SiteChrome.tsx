'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import DilOnerisi from './DilOnerisi'

// İngilizce öneri şeridinin çıkacağı Türkçe liste sayfaları.
const ONERI_YOLLARI = ['/', '/testler', '/yasam', '/seyahat', '/sanat', '/sinema', '/rehber', '/kitap']

// Yönetim panelinde sitenin üst menüsü görünmesin - panelin kendi
// sol menüsü ve başlığı var, ikisi üst üste binmesin.
export default function SiteChrome() {
  const path = usePathname()
  if (path?.startsWith('/admin')) return null
  return (
    <>
      <Navbar />
      {ONERI_YOLLARI.includes(path ?? '') && <DilOnerisi />}
    </>
  )
}
