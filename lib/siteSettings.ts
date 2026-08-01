import { createClient } from '@/lib/supabase/server'

// Panelden yönetilen site ayarları. site_settings tablosu anahtar/değer
// biçiminde olduğu için yeni bir ayar eklemek migration gerektirmez.

export const AYAR_VARSAYILAN = {
  site_title: 'The Cultiva yaşam, sanat & seyahat',
  site_description: 'Hayatı, sanatı ve yolculuğu birlikte keşfedenler için bir alan.',
  favicon_url: '/icon.png',
  apple_icon_url: '/apple-icon.png',
} as const

export type AyarAnahtari = keyof typeof AYAR_VARSAYILAN

export async function siteAyarlari(): Promise<Record<AyarAnahtari, string>> {
  const sonuc = { ...AYAR_VARSAYILAN } as Record<AyarAnahtari, string>
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from('site_settings')
      .select('key,value')
      .in('key', Object.keys(AYAR_VARSAYILAN))

    for (const satir of data ?? []) {
      const deger = (satir.value ?? '').trim()
      if (deger) sonuc[satir.key as AyarAnahtari] = deger
    }
  } catch {
    // Veritabanına ulaşılamazsa varsayılanlarla devam et - site açık kalsın.
  }
  return sonuc
}
