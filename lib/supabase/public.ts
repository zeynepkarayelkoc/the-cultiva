import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/*
  Çerez okumayan, herkese açık okuma istemcisi.

  İki ayrı sorunu birden çözüyor:

  1) lib/supabase/server.ts içindeki createClient() next/headers'tan cookies()
     çağırıyor. Bir rota çereze dokunduğu anda Next.js onu zorunlu dinamik
     yapıyor; sayfa her ziyarette sıfırdan üretiliyor.

  2) Next.js 15'ten beri fetch varsayılan olarak ÖNBELLEĞE ALINMIYOR. Yani
     istemci çereze dokunmasa bile, sorgular önbelleksiz sayıldığı için sayfa
     yine dinamik kalıyordu. Bu yüzden sayfalara yazdığımız
     "export const revalidate" hiçbir işe yaramıyordu.

  Çözüm: supabase-js'e kendi fetch'imizi veriyoruz ve GET isteklerine Next'in
  veri önbelleği için "next: { revalidate }" ekliyoruz.

  saniye = 0 verilirse önbellek kapalı olur (site haritası gibi her zaman taze
  olması gereken yerler için).

  Not: fetch önbelleğinin girdi başına boyut sınırı var. Liste sayfalarında
  select('*') yerine YAZI_LISTE_ALANLARI kullan, yoksa yanıt sınırı aşar ve
  sessizce önbelleğe alınmaz.
*/

/** Liste ve kart görünümlerinin ihtiyaç duyduğu kolonlar.
 *  content kolonu kasıtlı olarak yok: 502 yazının tam metni 3,5 MB tutuyor. */
export const YAZI_LISTE_ALANLARI =
  'id, slug, title, excerpt, cover_url, category, read_time, created_at, author_name'

/** Veritabanı cevap vermezse sonsuza kadar bekleme. Derleme sırasında
 *  generateStaticParams bu sorguları çağırıyor; takılırsa build hiç bitmez. */
const ZAMAN_ASIMI_MS = 10_000

/*
  Ortam değişkeni yoksa supabase-js'in verdiği "supabaseUrl is required" mesajı
  sorunun nerede olduğunu söylemiyor. Bunun yerine derleme kaydında o an hangi
  NEXT_PUBLIC_ değişkenlerinin görünür olduğunu yazdırıyoruz; "hiçbiri yok" ile
  "sadece bu biri eksik" çok farklı iki sorun.
*/
function ortamHatasi(): never {
  const gorunen = Object.keys(process.env).filter(k => k.startsWith('NEXT_PUBLIC_'))
  throw new Error(
    'Supabase ortam degiskenleri okunamadi. ' +
    `NEXT_PUBLIC_SUPABASE_URL=${process.env.NEXT_PUBLIC_SUPABASE_URL ? 'var' : 'YOK'}, ` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'var' : 'YOK'}. ` +
    `Su anda gorunen NEXT_PUBLIC_ degiskenleri: [${gorunen.join(', ') || 'hicbiri'}]. ` +
    `Toplam ortam degiskeni sayisi: ${Object.keys(process.env).length}. ` +
    'Derleme sirasinda goruluyorsa Vercel > Settings > Environment Variables ayarina bak.',
  )
}

export function createPublicClient(saniye = 0) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anahtar = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !anahtar) ortamHatasi()

  const onbellekliFetch: typeof fetch = (girdi, ayar) => {
    const yontem = (ayar?.method ?? 'GET').toUpperCase()
    const eklenecek: RequestInit = { ...ayar }

    // Çağıran kendi iptal sinyalini verdiyse ona dokunma
    if (!eklenecek.signal) eklenecek.signal = AbortSignal.timeout(ZAMAN_ASIMI_MS)

    // Yalnızca okuma isteklerini önbelleğe al
    if (saniye > 0 && yontem === 'GET') {
      return fetch(girdi, { ...eklenecek, next: { revalidate: saniye } })
    }
    return fetch(girdi, eklenecek)
  }

  return createSupabaseClient(
    url,
    anahtar,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { fetch: onbellekliFetch },
    },
  )
}
