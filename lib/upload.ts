// Görsel yükleme sınırları tek yerde.
// Supabase depolama kotası sınırlı olduğu için dosya başına 5 MB tavan var.
// Aynı sınır Supabase tarafında da (images kovasında) tanımlı; buradaki
// kontrol kullanıcıya yüklemeden önce anlaşılır bir uyarı vermek için.

export const MAKS_MB = 5
export const MAKS_BAYT = MAKS_MB * 1024 * 1024

export function boyutMetni(bayt: number): string {
  if (bayt >= 1024 * 1024) return `${(bayt / 1024 / 1024).toFixed(1)} MB`
  return `${Math.round(bayt / 1024)} KB`
}

// Dosya uygunsa null, değilse gösterilecek hata metnini döndürür.
export function dosyaKontrol(dosya: File): string | null {
  if (!dosya.type.startsWith('image/')) {
    return 'Sadece görsel dosyası yükleyebilirsin.'
  }
  if (dosya.size > MAKS_BAYT) {
    return `Görsel ${boyutMetni(dosya.size)}. En fazla ${MAKS_MB} MB yükleyebilirsin — küçültüp tekrar dene.`
  }
  return null
}
