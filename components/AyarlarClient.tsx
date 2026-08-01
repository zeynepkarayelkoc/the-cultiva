'use client'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, btn } from '@/lib/adminTheme'

export default function AyarlarClient({
  email, stats,
}: { email: string; stats: { posts: number; authors: number; categories: number } }) {
  const router = useRouter()
  const supabase = createClient()

  const cikis = async () => {
    await supabase.auth.signOut()
    router.push('/admin/giris')
  }

  const box: React.CSSProperties = {
    background: T.panel, border: `1px solid ${T.border}`,
    borderRadius: 10, padding: 18, marginBottom: 16, maxWidth: 560,
  }
  const row: React.CSSProperties = {
    display: 'flex', justifyContent: 'space-between',
    padding: '9px 0', borderBottom: `1px solid ${T.borderSoft}`, fontSize: '0.86rem',
  }

  return (
    <AdminShell title="Ayarlar">
      <div style={box}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 10 }}>Hesap</div>
        <div style={{ ...row, borderBottom: 'none' }}>
          <span style={{ color: T.muted }}>Giriş yapan</span>
          <span>{email}</span>
        </div>
        <button style={{ ...btn, marginTop: 12 }} onClick={cikis}>Çıkış yap</button>
      </div>

      <div style={box}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 10 }}>Site özeti</div>
        <div style={row}><span style={{ color: T.muted }}>Yazı</span><span>{stats.posts}</span></div>
        <div style={row}><span style={{ color: T.muted }}>Yazar</span><span>{stats.authors}</span></div>
        <div style={{ ...row, borderBottom: 'none' }}><span style={{ color: T.muted }}>Kategori</span><span>{stats.categories}</span></div>
      </div>

      <div style={box}>
        <div style={{ fontSize: '0.95rem', fontWeight: 500, marginBottom: 6 }}>Zamanlanmış yayın</div>
        <p style={{ fontSize: '0.82rem', color: T.muted, lineHeight: 1.65, margin: 0 }}>
          Yayın saati gelen taslaklar her sabah 09:00&apos;da otomatik yayına alınır.
          Sıklık Vercel Hobby planının günlük tek görev sınırına göre ayarlı.
        </p>
      </div>
    </AdminShell>
  )
}
