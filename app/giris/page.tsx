'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export default function GirisPage() {
  const [mode, setMode] = useState<'giris' | 'kayit'>('giris')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handle = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError(''); setSuccess('')

    if (mode === 'giris') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('E-posta veya şifre hatalı.')
      else router.push('/panel')
    } else {
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { full_name: name } }
      })
      if (error) setError(error.message)
      else setSuccess('Kayıt başarılı! E-postanı doğrula.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem', background: 'var(--bg)',
    }}>
      <div style={{
        width: '100%', maxWidth: 420, background: 'white',
        borderRadius: 20, padding: '3rem 2.5rem',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 40px rgba(0,0,0,0.06)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Link href="/" style={{ fontFamily: "'Playfair Display', serif", fontStyle: 'italic', fontSize: '1.5rem', color: 'var(--terra2)' }}>
            The Cultiva
          </Link>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted)', marginTop: '0.4rem' }}>
            {mode === 'giris' ? 'Hesabına giriş yap' : 'Yeni hesap oluştur'}
          </p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', background: 'var(--cream)', borderRadius: 50, padding: '4px', marginBottom: '2rem' }}>
          {(['giris', 'kayit'] as const).map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setSuccess('') }} style={{
              flex: 1, padding: '0.55rem', borderRadius: 50,
              background: mode === m ? 'white' : 'transparent',
              border: 'none', fontSize: '0.78rem', letterSpacing: '0.08em',
              color: mode === m ? 'var(--text)' : 'var(--muted)',
              fontWeight: mode === m ? 600 : 400,
              boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 0.2s',
            }}>
              {m === 'giris' ? 'giriş yap' : 'kayıt ol'}
            </button>
          ))}
        </div>

        <form onSubmit={handle} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'kayit' && (
            <input
              type="text" placeholder="adın" value={name} onChange={e => setName(e.target.value)}
              required style={inputStyle}
            />
          )}
          <input
            type="email" placeholder="e-posta" value={email} onChange={e => setEmail(e.target.value)}
            required style={inputStyle}
          />
          <input
            type="password" placeholder="şifre" value={password} onChange={e => setPassword(e.target.value)}
            required minLength={6} style={inputStyle}
          />

          {error && <p style={{ fontSize: '0.78rem', color: '#c0392b', textAlign: 'center' }}>{error}</p>}
          {success && <p style={{ fontSize: '0.78rem', color: 'var(--sage)', textAlign: 'center' }}>{success}</p>}

          <button type="submit" disabled={loading} style={{
            padding: '0.85rem', background: 'var(--text)', color: 'var(--bg)',
            border: 'none', borderRadius: 50, fontSize: '0.8rem',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            marginTop: '0.5rem', transition: 'background 0.2s',
            opacity: loading ? 0.7 : 1,
          }}>
            {loading ? '...' : mode === 'giris' ? 'giriş yap' : 'kayıt ol'}
          </button>
        </form>
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.85rem 1rem',
  border: '1px solid var(--border)', borderRadius: 10,
  fontSize: '0.88rem', background: 'var(--bg)',
  outline: 'none', transition: 'border-color 0.2s',
  fontFamily: 'inherit',
}
