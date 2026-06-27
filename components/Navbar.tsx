'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }


  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      height: 64, padding: '0 2.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(245,240,232,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo.png"
          alt="The Cultiva"
          style={{ height: 36, width: 'auto', mixBlendMode: 'multiply' }}
        />
      </Link>

      <ul style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
        {[
          { href: '/yasam', label: 'yaşam' },
          { href: '/seyahat', label: 'seyahat' },
          { href: '/sanat', label: 'sanat' },
        ].map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="nav-link" style={{
              fontSize: '0.75rem',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: pathname.startsWith(href) ? 'var(--terra)' : 'var(--muted)',
            }}>{label}</Link>
          </li>
        ))}
      </ul>

      <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
        {user ? (
          <>
            <Link href="/panel" style={{
              fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--terra)',
            }}>panelim</Link>
            <button onClick={handleSignOut} style={{
              fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
              color: 'var(--muted)', background: 'none', border: 'none',
            }}>çıkış</button>
          </>
        ) : (
          <Link href="/giris" style={{
            fontSize: '0.72rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--terra2)',
            border: '1px solid rgba(181,115,74,0.4)',
            padding: '0.45rem 1.2rem',
            borderRadius: '50px',
            background: 'rgba(181,115,74,0.06)',
            transition: 'all 0.2s',
          }}>giriş yap</Link>
        )}
      </div>
    </nav>
  )
}
