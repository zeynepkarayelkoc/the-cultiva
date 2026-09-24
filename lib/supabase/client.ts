import { createBrowserClient } from '@supabase/ssr'

/*
  Tarayıcı istemcisi.

  DİKKAT: İstemci bileşenlerinin ("use client") render gövdesi yalnızca
  tarayıcıda değil, sunucuda da çalışır. Next.js sayfaları önce sunucuda
  render eder (SSR) ve derleme sırasında ön-üretim yapar.

  components/Navbar.tsx gibi kök düzende yer alan bileşenler bu fonksiyonu
  render gövdesinde çağırıyor. Sunucu tarafındaki bu çalıştırmada ortam
  değişkenleri okunamadığında createBrowserClient hata fırlatıyor ve
  "Export encountered an error on /_not-found/page" diyerek derlemeyi tamamen
  düşürüyordu. Tek bir sayfa değil, bütün sitenin ön-üretimi bu yüzden
  başarısız oluyordu.

  Çözüm: sunucuda değer bulunamazsa gerçek bağlantı yerine yer tutucu ile
  istemci kur. Bu istemci sunucuda zaten hiç kullanılmıyor; bütün çağrılar
  useEffect ve olay yöneticilerinin içinde, yani tarayıcıda.

  Tarayıcıda davranış değişmedi: değer gerçekten eksikse yine hata fırlar,
  böylece gerçek bir yapılandırma hatası sessizce gizlenmez.
*/
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const sunucuda = typeof window === 'undefined'
  if (sunucuda && (!url || !key)) {
    return createBrowserClient(
      'https://sunucu-yer-tutucu.supabase.co',
      'sunucu-yer-tutucu',
    )
  }

  return createBrowserClient(url!, key!)
}
