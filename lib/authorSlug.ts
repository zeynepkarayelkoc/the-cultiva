// Yazar adını URL-safe bir slug'a çevirir ve geri eşleştirmeyi kolaylaştırır.
// Veritabanında ayrı yazar tablosu yok; eşleştirme author_name metni üzerinden,
// slug karşılaştırmasıyla yapılır.

const trMap: Record<string, string> = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
}

export function authorSlug(name: string): string {
  return name
    .trim()
    .replace(/[çÇğĞıİöÖşŞüÜ]/g, (ch) => trMap[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // kalan aksanları temizle
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // harf/rakam dışını tireye çevir
    .replace(/^-+|-+$/g, '') // baş/son tireleri at
}
