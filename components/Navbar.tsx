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
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Sayfa değişince mobil menüyü kapat
  useEffect(() => { setMenuOpen(false) }, [pathname])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  const categories = [
    { href: '/yasam', label: 'yaşam' },
    { href: '/seyahat', label: 'seyahat' },
    { href: '/sanat', label: 'sanat' },
    { href: '/rehber', label: 'rehber' },
    { href: '/kitap', label: 'kitap' },
  ]

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      minHeight: 64, padding: '0 2.5rem',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(245,240,232,0.92)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border)',
    }} className="site-nav">
      <Link href="/" style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src="/logo.png"
          alt="The Cultiva"
          style={{ height: 36, width: 'auto', mixBlendMode: 'multiply' }}
        />
      </Link>

      {/* Masaüstü orta menü */}
      <ul className="nav-desktop" style={{ display: 'flex', gap: '2rem', listStyle: 'none' }}>
        {categories.slice(0, 3).map(({ href, label }) => (
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

      {/* Masaüstü sağ aksiyonlar */}
      <div className="nav-desktop" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
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

      {/* Mobil hamburger butonu */}
      <button
        className="nav-toggle"
        aria-label="Menü"
        onClick={() => setMenuOpen((o) => !o)}
        style={{
          display: 'none',
          background: 'none', border: 'none', padding: '0.4rem',
          flexDirection: 'column', gap: 5,
        }}
      >
        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'translateY(7px) rotate(45deg)' : 'none' }} />
        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: 'opacity 0.2s' }} />
        <span style={{ display: 'block', width: 22, height: 2, background: 'var(--text)', borderRadius: 2, transition: 'transform 0.25s', transform: menuOpen ? 'translateY(-7px) rotate(-45deg)' : 'none' }} />
      </button>

      {/* Mobil açılır menü */}
      {menuOpen && (
        <div className="nav-mobile-panel" style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'rgba(245,240,232,0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          padding: '0.5rem 1.5rem 1.5rem',
        }}>
          {categories.map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase',
              color: pathname.startsWith(href) ? 'var(--terra)' : 'var(--text)',
              padding: '0.85rem 0',
              borderBottom: '1px solid var(--border)',
            }}>{label}</Link>
          ))}
          {user ? (
            <>
              <Link href="/panel" style={{ fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terra)', padding: '0.85rem 0', borderBottom: '1px solid var(--border)' }}>panelim</Link>
              <button onClick={handleSignOut} style={{ textAlign: 'left', fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', background: 'none', border: 'none', padding: '0.85rem 0' }}>çıkış</button>
            </>
          ) : (
            <Link href="/giris" style={{ fontSize: '0.9rem', letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--terra2)', padding: '0.85rem 0' }}>giriş yap</Link>
          )}
        </div>
      )}
    </nav>
  )
}
