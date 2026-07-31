import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import './globals.css'
import Navbar from '@/components/Navbar'

// Google AdSense Publisher ID — AdSense hesabın onaylandıktan sonra
// https://adsense.google.com → Account → Account information → Publisher ID
const ADSENSE_PUBLISHER_ID = 'ca-pub-XXXXXXXXXXXXXXXX'  // ← buraya yaz

export const metadata: Metadata = {
  title: 'The Cultiva — yaşam, sanat & seyahat',
  description: 'Hayatı, sanatı ve yolculuğu birlikte keşfedenler için bir alan.',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        {/* Google AdSense — publisher ID doğrulandıktan sonra aktif olur */}
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
