import type { Metadata } from 'next'

// giris/page.tsx bir istemci bileşeni ('use client'), o yüzden metadata'yı
// buradan veriyoruz. Giriş sayfasının arama sonuçlarında işi yok.
export const metadata: Metadata = {
  title: 'Giriş yap',
  robots: { index: false, follow: false },
}

export default function GirisLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
