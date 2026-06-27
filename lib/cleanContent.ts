// WordPress'ten gelen yazı içeriğini temizler.
// Eski site (loveinartsz.com) artık erişilemediği için oradan gelen
// görseller kırık. Bu fonksiyon o görselleri (ve onları saran figure
// bloklarını) içerikten kaldırır ki kırık resim / boşluk görünmesin.

export function cleanContent(html: string): string {
  if (!html) return html

  let out = html

  // 1) loveinartsz.com görseli içeren <figure>...</figure> bloklarını sil
  out = out.replace(
    /<figure[^>]*>[\s\S]*?loveinartsz\.com[\s\S]*?<\/figure>/gi,
    ''
  )

  // 2) Kalan tekil <img ... loveinartsz.com ... > etiketlerini sil
  out = out.replace(
    /<img[^>]*loveinartsz\.com[^>]*>/gi,
    ''
  )

  // 3) Görsel çıkınca geriye kalan boş paragrafları temizle
  out = out.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')

  return out
}
