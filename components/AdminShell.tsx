'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { T } from '@/lib/adminTheme'

const MENU: { href: string; label: string; icon: string; exact?: boolean }[] = [
  { href: '/admin',            label: 'Yazılar',     icon: '▤', exact: true },
  { href: '/admin/yazi/yeni',  label: 'Yeni yazı',   icon: '✎' },
  { href: '/admin/yazarlar',   label: 'Yazarlar',    icon: '☺' },
  { href: '/admin/kategoriler',label: 'Kategoriler', icon: '⌗' },
  { href: '/admin/testler',    label: 'Testler',     icon: '◆' },
  { href: '/admin/anasayfa',   label: 'Ana sayfa',   icon: '★' },
  { href: '/admin/ayarlar',    label: 'Ayarlar',     icon: '⚙' },
]

export default function AdminShell({
  title,
  action,
  children,
}: {
  title: string
  action?: React.ReactNode
  children: React.ReactNode
}) {
  const path = usePathname()

  const isActive = (m: (typeof MENU)[number]) =>
    m.exact ? path === m.href : path.startsWith(m.href)

  return (
    <div style={{ minHeight: '100vh', background: T.bg, color: T.text, display: 'flex' }}>
      {/* Sol menü */}
      <aside
        style={{
          width: 208,
          flexShrink: 0,
          background: T.side,
          borderRight: `1px solid ${T.border}`,
          display: 'flex',
          flexDirection: 'column',
          position: 'sticky',
          top: 0,
          height: '100vh',
        }}
      >
        <div style={{ padding: '18px 18px 14px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: T.terra, fontSize: '1.05rem' }}>
            The Cultiva
          </div>
          <div style={{ fontSize: '0.68rem', color: T.faint, marginTop: 2, letterSpacing: '0.08em' }}>
            yönetim paneli
          </div>
        </div>

        <nav style={{ padding: '8px 0', flex: 1 }}>
          {MENU.map((m) => {
            const on = isActive(m)
            return (
              <Link
                key={m.href}
                href={m.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '9px 18px',
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  color: on ? T.terra : T.muted,
                  background: on ? T.sideActive : 'transparent',
                  borderLeft: `3px solid ${on ? T.terra : 'transparent'}`,
                  fontWeight: on ? 500 : 400,
                }}
              >
                <span aria-hidden style={{ fontSize: '0.9rem', width: 14, textAlign: 'center' }}>{m.icon}</span>
                {m.label}
              </Link>
            )
          })}
        </nav>

        <Link
          href="/"
          style={{
            padding: '12px 18px',
            borderTop: `1px solid ${T.border}`,
            fontSize: '0.75rem',
            color: T.faint,
            textDecoration: 'none',
          }}
        >
          ↗ siteye dön
        </Link>
      </aside>

      {/* İçerik */}
      <main style={{ flex: 1, minWidth: 0 }}>
        <header
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '16px 26px',
            background: T.panel,
            borderBottom: `1px solid ${T.border}`,
          }}
        >
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.4rem', fontWeight: 400, margin: 0 }}>
            {title}
          </h1>
          {action}
        </header>

        <div style={{ padding: '22px 26px 60px' }}>{children}</div>
      </main>
    </div>
  )
}
