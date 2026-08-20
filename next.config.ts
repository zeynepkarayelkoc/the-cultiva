import type { NextConfig } from 'next'

/*
  Eski adres yönlendirmeleri.

  Bir yazının slug'ı değiştiğinde eski adres 404 vermeye başlar. Google o adresi
  yıllardır tanıyorsa biriken bütün değer çöpe gider. 301 (kalıcı) yönlendirme
  o değeri yeni adrese taşır.

  permanent: true -> 301. Yeni bir slug değişikliği olursa buraya bir satır ekle.
*/
const eskiAdresler = [
  // Google'ın arama sonuçlarında hâlâ tuttuğu, artık var olmayan adres
  { kaynak: '/yazi/medusa-symbolism-in-art', hedef: '/yazi/medusas-revenge' },
]

const nextConfig: NextConfig = {
  async redirects() {
    return eskiAdresler.map(y => ({
      source: y.kaynak,
      destination: y.hedef,
      permanent: true,
    }))
  },
}

export default nextConfig
