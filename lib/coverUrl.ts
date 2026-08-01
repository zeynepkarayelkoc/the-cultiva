// Kapak görseli adresini tek yerden çözer.
// Eski site (loveinartsz.com) kapalı olduğu için oradan gelen adresler kırık;
// kapağı olmayan ya da kırık olan yazılarda kategoriye uygun bir görsel gösterilir.

const KATEGORI_GORSELI: Record<string, string> = {
  yasam:   'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
  seyahat: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
  sanat:   'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=1200&q=80',
  sinema:  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&q=80',
  rehber:  'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80',
  kitap:   'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=1200&q=80',
}

export function coverUrl(post: { cover_url?: string | null; category?: string | null }): string {
  const c = (post.cover_url ?? '').trim()
  if (!c || c.includes('loveinartsz.com')) {
    return KATEGORI_GORSELI[post.category ?? ''] ?? KATEGORI_GORSELI.yasam
  }
  return c
}

// Kart/kapak alanları için hazır arka plan stili.
export function coverStyle(post: { cover_url?: string | null; category?: string | null }): React.CSSProperties {
  return {
    backgroundImage: `url(${coverUrl(post)})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundColor: '#e9e2d6',
  }
}
