import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import { siteAyarlari } from '@/lib/siteSettings'

// Google AdSense Publisher ID - AdSense hesabın onaylandıktan sonra
// https://adsense.google.com → Account → Account information → Publisher ID
const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'  // ← buraya yaz

// Başlık, açıklama ve site ikonu panelden (Ayarlar) yönetilir.
export async function generateMetadata(): Promise<Metadata> {
  const a = await siteAyarlari()
  return {
    title: a.site_title,
    description: a.site_description,
    icons: {
      icon: a.favicon_url,
      shortcut: a.favicon_url,
      apple: a.apple_icon_url,
    },
    openGraph: {
      title: a.site_title,
      description: a.site_description,
      type: 'website',
    },
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Google AdSense - publisher ID doğrulandıktan sonra aktif olur */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <SiteChrome />
        <main>{children}</main>
      </body>
    </html>
  )
}
