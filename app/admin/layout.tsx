import type { Metadata } from 'next'

/*
  robots.txt zaten /admin'i taramaya kapatıyor ama bu ikinci bir güvence:
  bir yerden bağlantı verilirse bile Google indekslemez.
*/
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
