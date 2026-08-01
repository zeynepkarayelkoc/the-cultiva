'use client'
import { usePathname } from 'next/navigation'
import Navbar from './Navbar'

// Yönetim panelinde sitenin üst menüsü görünmesin - panelin kendi
// sol menüsü ve başlığı var, ikisi üst üste binmesin.
export default function SiteChrome() {
  const path = usePathname()
  if (path?.startsWith('/admin')) return null
  return <Navbar />
}
