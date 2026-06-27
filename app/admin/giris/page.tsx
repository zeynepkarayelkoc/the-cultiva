'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function AdminGirisPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password })
    if (authError) { setError('Giriş başarısız.'); setLoading(false); return }

    // Check admin role
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single()
    if (profile?.role !== 'admin') {
      await supabase.auth.signOut()
      setError('Bu hesabın admin yetkisi yok.')
      setLoading(false); return
    }
    router.push('/admin')
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#1a110a', padding: '2rem',
    }}>
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'rgba(245,232,208,0.04)', border: '1px solid rgba(245,232,208,0.1)',
        borderRadius: 20, padding: '3rem 2.5rem',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.4rem', color: '#b5734a' }}>
            The Cultiva
          </Link>
          <p style={{ fontSize: '0.75rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(245,232,208,0.4)', marginTop: '0.5rem' }}>
            admin girişi
          </p>
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input
            type="email" placeholder="e-posta" value={email}
            onChange={e => setEmail(e.target.value)} required
            style={inputStyle}
          />
          <input
            type="password" placeholder="şifre" value={password}
            onChange={e => setPassword(e.target.value)} required
            style={inputStyle}
          />

          {error && <p style={{ fontSize: '0.78rem', color: '#c97060', textAlign: 'center' }}>{error}</p>}

          <button type="submit" disabled={loading} style={{
            padding: '0.85rem', background: '#b5734a', color: '#f5e8d0',
            border: 'none', borderRadius: 50, fontSize: '0.78rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginTop: '0.5rem', opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '...' : 'giriş yap'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.85rem 1rem',
  border: '1px solid rgba(245,232,208,0.15)', borderRadius: 10,
  fontSize: '0.88rem', background: 'rgba(245,232,208,0.07)',
  color: '#f5e8d0', outline: 'none', fontFamily: 'inherit',
}
