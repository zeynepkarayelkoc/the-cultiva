export const revalidate = 300

import type { Metadata } from 'next'
import BelgeDili from '@/components/BelgeDili'
import { TestKartlari } from '@/components/EnKartlar'
import { testListesi } from '@/lib/testVeri'
import { sayfaMetadata } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  return sayfaMetadata({
    baslik: 'Art History Quizzes',
    aciklama: 'Free art history and culture quizzes from The Cultiva. Test your eye for paintings, symbols and techniques.',
    yol: '/en/quizzes',
    dil: 'en',
  })
}

export default async function EnQuizzesPage() {
  const testler = await testListesi('en')
  return (
    <div lang="en" style={{ maxWidth: 1080, margin: '0 auto', padding: '3rem 1.5rem 5rem' }}>
      <BelgeDili dil="en" />
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.9rem, 5vw, 2.6rem)', fontWeight: 400, marginBottom: '0.4rem' }}>
        Quizzes
      </h1>
      <p style={{ color: 'var(--muted)', fontSize: '0.95rem', margin: '0 0 2.5rem' }}>
        Test your eye for art: paintings, symbols, techniques and the stories behind them.
      </p>
      {testler.length === 0
        ? <p style={{ color: 'var(--muted)' }}>New quizzes are on the way.</p>
        : <TestKartlari testler={testler} />}
    </div>
  )
}
