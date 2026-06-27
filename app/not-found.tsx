export default function NotFound() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', color: '#8b2635' }}>404</h1>
      <p style={{ color: '#6a5a4a' }}>Sayfa bulunamadı.</p>
      <a href="/" style={{ color: '#8b2635', fontSize: '0.85rem' }}>← Ana sayfaya dön</a>
    </div>
  )
}
