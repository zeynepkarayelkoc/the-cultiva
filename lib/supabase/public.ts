import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/*
  Çerez okumayan, herkese açık okuma istemcisi.

  Neden ayrı bir istemci: lib/supabase/server.ts içindeki createClient()
  next/headers'tan cookies() çağırıyor. Bir sayfa cookies()'e dokunduğu anda
  Next.js o rotayı zorunlu olarak dinamik render ediyor ve "export const
  revalidate" hiçbir işe yaramıyor. Yani her ziyaretçi için sayfa sıfırdan
  üretiliyor, önbellek devre dışı kalıyor.

  Yazı, kategori, yazar ve test listesi sayfaları oturum bilgisine ihtiyaç
  duymuyor; sadece yayınlanmış içeriği okuyorlar. Bu istemciyle onlar
  gerçekten önbelleğe alınabiliyor, sayfa hızı ve Core Web Vitals düzeliyor.

  Oturum gereken yerlerde (admin, panel, test çözme) eski istemci kullanılmalı.
*/
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  )
}
