# The Cultiva — Proje Dökümanı

**Site:** yaşam, sanat ve seyahat üzerine kişisel blog  
**Stack:** Next.js (App Router) + Supabase + Vercel  
**GitHub:** https://github.com/zeynepkarayelkoc/the-cultiva  
**Canlı site:** https://the-cultiva-web.vercel.app

---

## Sayfalar

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana Sayfa | `/` | Michelangelo welcome ekranı (bir kez gösterilir), hero bölümü, kategori linkleri, son yazılar |
| Kategori | `/yasam` `/seyahat` `/sanat` | Kategoriye göre filtrelenmiş yazı listesi |
| Yazı | `/yazi/[slug]` | Yazı detay sayfası — başlık, yazar, tarih, içerik |
| Giriş | `/giris` | Okuyucu girişi (Supabase Auth) |
| Üye Paneli | `/panel` | Giriş yapmış kullanıcının profil sayfası (korumalı) |
| Admin Giriş | `/admin/giris` | Admin kullanıcısı için ayrı giriş sayfası |
| Admin Panel | `/admin` | Yazı listesi, yayınla/taslak/sil (korumalı) |
| Yeni Yazı | `/admin/yazi/yeni` | WordPress tarzı rich text editörü, kapak görseli yükleme |
| Yazı Düzenle | `/admin/yazi/[id]` | Mevcut yazıyı düzenle, sil, yayınla |

---

## Önemli Dosyalar

```
the-cultiva/
├── app/
│   ├── page.tsx                  # Ana sayfa
│   ├── layout.tsx                # Global layout, Navbar
│   ├── globals.css               # CSS variables, animasyonlar
│   ├── not-found.tsx             # 404 sayfası
│   ├── [kategori]/page.tsx       # Kategori sayfası
│   ├── yazi/[slug]/page.tsx      # Yazı detay
│   ├── giris/page.tsx            # Okuyucu girişi
│   ├── panel/page.tsx            # Üye paneli
│   └── admin/
│       ├── page.tsx              # Admin panel
│       ├── giris/page.tsx        # Admin girişi
│       └── yazi/
│           ├── yeni/page.tsx     # Yeni yazı
│           └── [id]/page.tsx     # Yazı düzenle
├── components/
│   ├── WelcomeScreen.tsx         # Michelangelo açılış ekranı
│   └── Navbar.tsx                # Navbar (ana sayfada gizli)
├── lib/supabase/
│   ├── client.ts                 # Browser-side Supabase client
│   └── server.ts                 # Server-side Supabase client
├── proxy.ts                      # Route koruması middleware
├── public/
│   └── logo.png                  # The Cultiva logosu (yatay, 1664x457)
├── import_posts.mjs              # WordPress → Supabase import scripti
├── wordpress_posts.json          # 509 yazının işlenmiş hali
└── .env.local                    # Supabase URL ve anon key (git'e gitmiyor)
```

---

## Supabase

**Proje:** the-cultiva  
**URL:** https://ksprrlcgdiyrjovbgqda.supabase.co

### posts tablosu
| Kolon | Tip | Açıklama |
|-------|-----|----------|
| id | uuid | Primary key |
| title | text | Yazı başlığı |
| slug | text | URL'de kullanılan kısa ad |
| content | text | HTML içerik |
| excerpt | text | Kısa özet |
| cover_url | text | Kapak görseli URL |
| category | text | yasam / seyahat / sanat / rehber / kitap |
| published | boolean | Yayınlandı mı? |
| read_time | int | Tahmini okuma süresi (dakika) |
| author_name | text | Yazarın adı |
| created_at | timestamp | Yayın tarihi |

### Storage
- Bucket: `images`
- `images/covers/` — kapak görselleri
- `images/content/` — yazı içi görseller

---

## Kategoriler

| Slug | Türkçe |
|------|--------|
| yasam | yaşam |
| seyahat | seyahat |
| sanat | sanat |
| rehber | rehber |
| kitap | kitap |

---

## Tasarım

- **Renkler:** terra (#8b2635), navy (#1e3a5f), sage (#2d5a3d), text (#2a1f18)
- **Yazı tipleri:** Playfair Display (başlıklar) + Open Sans (gövde)
- **Animasyonlar:** fadeUp, float, shimmer, paintDrift, sparkle, card-hover, cat-circle
- **Logo:** mix-blend-mode: multiply ile navbar'da, invert + glow ile welcome ekranında

---

## WordPress İçerik Aktarımı

Eski site `loveinartsz.com` (Turhost/cPanel) üzerindeydi.  
509 yazı phpMyAdmin'den CSV olarak alınıp `import_posts.mjs` scriptiyle Supabase'e aktarıldı.  
52 farklı yazar var, her yazının `author_name` alanı dolduruldu.

---

## Yapılacaklar

- [ ] Alan adını Vercel'e bağla (.com domain)
- [ ] Supabase Auth — admin rolü ayarla (`UPDATE profiles SET role = 'admin' WHERE email = 'zeynepkaraayel@gmail.com'`)
- [ ] Supabase Storage `images` bucket politikaları (public read)
- [ ] Responsive / mobil uyumluluk
- [ ] Instagram, İletişim, Hakkında sayfaları
