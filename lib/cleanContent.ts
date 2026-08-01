// WordPress'ten gelen yazı içeriğini temizler.
// Eski site (loveinartsz.com) artık erişilemediği için oradan gelen
// görseller kırık. Bu fonksiyon o görselleri (ve onları saran figure
// bloklarını) içerikten kaldırır ki kırık resim / boşluk görünmesin.

export function cleanContent(html: string): string {
  if (!html) return html

  let out = html

  // 1) loveinartsz.com görseli içeren <figure>...</figure> bloklarını sil.
  //    (?:(?!<\/?figure)[\s\S])*? kalıbı sayesinde eşleşme başka bir <figure>
  //    etiketinin üzerinden atlayamaz - yoksa iki figür arasındaki gerçek
  //    metin de silinirdi.
  out = out.replace(
    /<figure\b(?:(?!<\/?figure\b)[\s\S])*?loveinartsz\.com(?:(?!<\/?figure\b)[\s\S])*?<\/figure>/gi,
    ''
  )

  // 2) Kalan tekil <img ... loveinartsz.com ... > etiketlerini sil
  out = out.replace(
    /<img[^>]*loveinartsz\.com[^>]*>/gi,
    ''
  )

  // 3) style="background-image:url(...loveinartsz...)" bildirimlerini sil.
  //    Blok içindeki metin korunur, sadece kırık arka plan görseli kalkar.
  out = out.replace(
    /background-image\s*:\s*url\(\s*['"]?[^)'"]*loveinartsz\.com[^)'"]*['"]?\s*\)\s*;?/gi,
    ''
  )

  // 4) Ölü loveinartsz.com linklerini metne çevir (etiket gider, yazı kalır)
  out = out.replace(
    /<a\b[^>]*loveinartsz\.com[^>]*>([\s\S]*?)<\/a>/gi,
    '$1'
  )

  // 5) Görsel/link çıkınca geriye kalan boş paragrafları temizle
  out = out.replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')

  return out
}
