import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
  title: 'The Cultiva — yaşam, sanat & seyahat',
  description: 'Hayatı, sanatı ve yolculuğu birlikte keşfedenler için bir alan.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
