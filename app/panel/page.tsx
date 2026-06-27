import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function PanelPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/giris')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const { data: saved } = await supabase
    .from('saved_posts')
    .select('*, posts(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div style={{ minHeight: '100vh', padding: '4rem 2.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '3rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border)' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '0.5rem' }}>üye paneli</div>
        <h1 style={{ fontSize: '2.2rem' }}>Merhaba, {profile?.full_name?.split(' ')[0] ?? 'okuyucu'}</h1>
        <p style={{ color: 'var(--muted)', marginTop: '0.4rem', fontSize: '0.88rem' }}>{user.email}</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '3rem' }}>
        {[
          { label: 'Kaydedilen Yazı', value: saved?.length ?? 0 },
          { label: 'Üyelik', value: profile?.role === 'admin' ? 'Admin' : 'Üye' },
          { label: 'Katılım', value: new Date(user.created_at).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) },
        ].map(({ label, value }) => (
          <div key={label} style={{
            background: 'white', borderRadius: 14, padding: '1.5rem',
            border: '1px solid var(--border)',
          }}>
            <div style={{ fontSize: '1.8rem', fontFamily: "'Playfair Display', serif", marginBottom: '0.3rem' }}>{value}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Admin link */}
      {profile?.role === 'admin' && (
        <div style={{ marginBottom: '2rem' }}>
          <Link href="/admin" style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.75rem 1.5rem', background: 'var(--text)', color: 'var(--bg)',
            borderRadius: 50, fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            Admin Paneli →
          </Link>
        </div>
      )}

      {/* Saved posts */}
      <div>
        <h2 style={{ fontSize: '1.4rem', marginBottom: '1.5rem' }}>Kaydedilen Yazılar</h2>
        {!saved?.length ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--muted)' }}>
            <p>Henüz kaydettiğin yazı yok.</p>
            <Link href="/" style={{ color: 'var(--terra)', fontSize: '0.82rem', marginTop: '0.5rem', display: 'block' }}>Yazılara göz at →</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {saved.map((item: any) => (
              <Link key={item.id} href={`/yazi/${item.posts.slug}`} style={{
                display: 'grid', gridTemplateColumns: '80px 1fr', gap: '1rem',
                background: 'white', borderRadius: 12, padding: '1rem',
                border: '1px solid var(--border)',
              }}>
                <div style={{ width: 80, height: 80, borderRadius: 8, background: 'linear-gradient(135deg, #d4b896, #a07848)' }} />
                <div>
                  <div style={{ fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '0.3rem' }}>
                    {item.posts.category}
                  </div>
                  <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', fontWeight: 400, lineHeight: 1.3, marginBottom: '0.3rem' }}>
                    {item.posts.title}
                  </h3>
                  <div style={{ fontSize: '0.65rem', color: 'var(--muted)', opacity: 0.6 }}>
                    {item.posts.read_time} dk okuma
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
