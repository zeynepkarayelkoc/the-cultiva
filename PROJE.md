# The Cultiva - Proje Dökümanı

**Site:** yaşam, sanat ve seyahat üzerine kişisel dergi
**Stack:** Next.js 16 (App Router) + Supabase + Vercel
**GitHub:** https://github.com/zeynepkarayelkoc/the-cultiva
**Canlı site:** https://www.thecultiva.com (Vercel projesi: `the-cultiva-web`)

> Bu dosya projenin haritasıdır. Bir hata ararken ya da yeni özellik eklerken
> önce buraya bak, ilgili dosyayı buradan bulup doğrudan oraya git.

---

## Projenin amacı

Kapanmış WordPress sitesi `loveinartsz.com`'un 510 yazısını taşımak ve üzerine
kendi kendine yeten bir yayın platformu kurmak. Hedef, siteyi geliştirici
yardımı olmadan yönetebilmek: yazı yazmak, yazar ve kategori eklemek, site
kimliğini değiştirmek ve test yayınlamak panelden yapılır.

---

## Sayfalar

### Okuyucu tarafı

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Ana sayfa | `/` | Hero kaydırıcı (öne çıkan yazılar), kategori sütunları, son yazılar |
| Kategori | `/yasam` `/sanat` `/seyahat` `/sinema` `/kitap` `/rehber` | Kategoriye göre yazı listesi |
| Yazı | `/yazi/[slug]` | Yazı detayı, kapak, yazar linki, reklam alanı |
| Yazar | `/yazar/[ad]` | Bir yazarın tüm yazıları |
| Testler | `/testler` | Yayındaki testlerin listesi |
| Test | `/test/[slug]` | Test çözme ekranı (bilgi ve kişilik) |
| Şampiyonluk | `/testler/siralama` | Toplam puana göre kullanıcı sıralaması |
| Giriş | `/giris` | Okuyucu girişi (Supabase Auth) |
| Üye paneli | `/panel` | Kaydedilen yazılar + test karnesi (korumalı) |

### Yönetim paneli

Tümü `/admin` altında, açık temalı ve sol menülü. Menü `components/AdminShell.tsx`'te tanımlı.

| Sayfa | URL | Açıklama |
|-------|-----|----------|
| Yazılar | `/admin` | Liste, filtreler (yazar/kategori/durum/arama), toplu işlem, sayfalama |
| Yeni yazı | `/admin/yazi/yeni` | Zengin metin editörü, auto-save, SEO, zamanlama, AI asistan |
| Yazı düzenle | `/admin/yazi/[id]` | Aynı editör, mevcut yazı üzerinde |
| Yazarlar | `/admin/yazarlar` | Yazar ekle/düzenle, ad değişince yazılar da güncellenir |
| Kategoriler | `/admin/kategoriler` | Kategori ekle/sil/yeniden adlandır |
| Testler | `/admin/testler` | Test listesi ve yeni test oluşturma |
| Test düzenle | `/admin/test/[id]` | Soru, şık, görsel, sonuç rozetleri; yazıdan AI ile soru üretme |
| Ana sayfa | `/admin/anasayfa` | Kaydırıcıda hangi yazılar çıksın, geçiş süresi |
| Ayarlar | `/admin/ayarlar` | Site başlığı, meta açıklama, site ikonu, hesap |
| Admin giriş | `/admin/giris` | Ayrı giriş sayfası |

---

## Dosya haritası

```
the-cultiva/
├── app/
│   ├── layout.tsx                    # Kök düzen; başlık/açıklama/ikon DB'den (generateMetadata)
│   ├── page.tsx                      # Ana sayfa
│   ├── globals.css                   # CSS değişkenleri, animasyonlar, .post-content stilleri
│   ├── favicon.ico                   # Logodan üretilmiş site ikonu (RGBA olmalı!)
│   ├── [kategori]/page.tsx           # Kategori listesi
│   ├── yazi/[slug]/page.tsx          # Yazı detayı
│   ├── yazar/[ad]/page.tsx           # Yazar sayfası
│   ├── testler/page.tsx              # Test listesi
│   ├── testler/siralama/page.tsx     # Şampiyonluk tablosu
│   ├── test/[slug]/page.tsx          # Test çözme (QuizPlayer'ı sarar)
│   ├── panel/page.tsx                # Üye paneli + test karnesi
│   ├── giris/page.tsx
│   ├── admin/…                       # Yukarıdaki tabloya bak
│   └── api/
│       ├── ai-assist/route.ts        # Yazı editörü AI yardımı (düzelt/özet/başlık)
│       ├── quiz-generate/route.ts    # Bir yazıdan taslak test soruları üretir
│       ├── quiz-import/route.ts      # Hazır testi tek istekte yükler (generate-test skill)
│       └── publish-scheduled/route.ts# Zamanlanmış yazıları yayına alır (Vercel Cron)
├── components/
│   ├── AdminShell.tsx                # Panel kabuğu + sol menü  ← menüye madde eklemek için burası
│   ├── AdminPanelClient.tsx          # Yazılar listesi
│   ├── YazarlarClient.tsx            # Yazar yönetimi
│   ├── KategorilerClient.tsx         # Kategori yönetimi
│   ├── TestlerClient.tsx             # Test listesi
│   ├── TestEditor.tsx                # Test editörü (soru/şık/görsel/sonuç)
│   ├── AyarlarClient.tsx             # Site kimliği ayarları
│   ├── QuizPlayer.tsx                # Test çözme akışı (istemci)
│   ├── Navbar.tsx                    # Site üst menüsü
│   ├── SiteChrome.tsx                # /admin altında Navbar'ı gizler
│   ├── HeroSlider.tsx                # Ana sayfa kaydırıcı
│   ├── AdBanner.tsx                  # AdSense alanı
│   └── WelcomeScreen.tsx             # Açılış ekranı
├── lib/
│   ├── supabase/{client,server}.ts   # Supabase istemcileri (tarayıcı / sunucu)
│   ├── adminTheme.ts                 # Panelin açık tema paleti ve ortak stiller
│   ├── quiz.ts                       # Test tipleri, puanlama, sonuç seçimi
│   ├── coverUrl.ts                   # Kapak görseli çözümü + kategori yedeği
│   ├── cleanContent.ts               # WordPress içeriğindeki kırık görselleri temizler
│   ├── siteSettings.ts               # Panelden yönetilen site ayarları
│   ├── upload.ts                     # Görsel yükleme sınırı (5 MB) ve kontrolü
│   └── authorSlug.ts                 # TR karakterli metni URL slug'ına çevirir
├── vercel.json                       # Cron: her sabah 09:00 zamanlanmış yayın
└── .env.local                        # Supabase URL + anon key (git'e gitmez)
```

---

## Supabase

**Proje:** the-cultiva
**URL:** https://ksprrlcgdiyrjovbgqda.supabase.co

### Tablolar

| Tablo | Ne işe yarar |
|-------|--------------|
| `posts` | Yazılar (510 kayıt) |
| `profiles` | Kullanıcı hesapları, `role` alanı `admin` olabilir |
| `saved_posts` | Kullanıcının kaydettiği yazılar |
| `categories` | Kategoriler; `posts.category` buraya yabancı anahtarla bağlı |
| `authors` | Yazarlar (52 kayıt); ad, e-posta, biyografi, foto |
| `site_settings` | Anahtar/değer site ayarları (başlık, açıklama, ikon, kaydırıcı hızı) |
| `quizzes` | Testler |
| `quiz_questions` | Test soruları |
| `quiz_options` | Soru şıkları (`is_correct` ya da `outcome_key`) |
| `quiz_outcomes` | Sonuç rozetleri / kişilik tipleri |
| `quiz_attempts` | Çözüm kayıtları; şampiyonluk tablosu buradan hesaplanır |

`posts` ana kolonları: `title, slug, content, excerpt, cover_url, category,
published, read_time, author_name, meta_title, meta_description, scheduled_at,
featured, featured_order, created_at`

### Güvenlik (RLS)

Tüm tablolarda satır güvenliği **açık**. Genel kural:

- **Okuma:** yayındaki içerik herkese açık, taslaklar sadece admine
- **Yazma:** yalnızca `profiles.role = 'admin'` olan oturumlar
- `quiz_attempts`: okuma herkese açık (sıralama için), ekleme sadece kendi adına

> Not: `posts` tablosunda RLS bir dönem kapalıydı; politikalar yazılmış ama
> etkinleştirilmemişti. Yani anon anahtarla tüm yazılar düzenlenebiliyordu.
> Açıldı ve doğrulandı. Yeni tablo eklerken RLS'i açmayı unutma.

### Storage

- Bucket: `images`, herkese açık okuma
- Dosya sınırı: **5 MB**, sadece görsel MIME tipleri
- Klasörler: `covers/` (yazı kapakları), `content/` (yazı içi), `quiz/<test-id>/`, `site/` (favicon)

---

## Test modülü

İki tip test var:

- **Bilgi testi** (`type: 'bilgi'`): doğru cevabı olan sorular. Puan = her doğru 100 +
  soru başına 24 saniyeden hızlı çözülen her saniye için 2 puan bonus.
  Sonuçlar `quiz_outcomes.min_correct` eşiklerine göre rozet verir.
- **Kişilik testi** (`type: 'kisilik'`): "Hangi Friends karakterisin" formatı. Doğru
  cevap yok, her şık bir `outcome_key` gösterir ve en çok işaretlenen tip sonuç olur.
  Sonuç ekranında "Sonucu paylaş" düğmesi vardır: cihaz destekliyorsa sistem paylaşım
  penceresini açar, desteklemiyorsa bağlantıyı panoya kopyalar. Deneme `score: 0` ile
  kaydedilir, yani profilde görünür ama şampiyonluk tablosunu kirletmez.

Giriş yapmadan da çözülür; puanın kaydedilmesi ve sıralamaya girmek için giriş gerekir.

Kişilik testi yazarken dikkat: her sorunun **her** şıkkına `outcome_key` verilmeli ve
her soruda 4 tipin dördü de birer kez temsil edilmeli, yoksa bazı tipler matematiksel
olarak dezavantajlı kalır.

**Bilinen sınır:** Puanlama tarayıcıda hesaplanır, teknik bilgisi olan biri sahte
puan gönderebilir. Eğlence amaçlı bir özellik için kabul edilebilir; sıralama
ciddileşirse puanlama sunucuya taşınmalı.

### generate-test skill

Konu başlığından test üretip siteye yükler. Önce **test tipi** sorulur (puanlı bilgi
testi mi, "sen kimsin" kişilik testi mi), sonra soru sayısı (varsayılan 10). Bilgi
testinde ayrıca **zorluk** (kolay / orta / zor / imkansız) ve ton sorulur; zorluk
hem soruların bilinirliğini hem de rozet eşiklerini belirler. Kişilik testinde
zorluk sorulmaz, onun yerine tip ekseni seçilir. Ardından `POST /api/quiz-import`
ile tek istekte kaydedilir. Uç nokta doğrulama yapar ve
hata durumunda yarım kayıt bırakmaz. İstek kullanıcının giriş yapmış tarayıcı
sekmesinden gider (oturum çerezi gerekir).

---

## Dış servisler ve ortam değişkenleri

Vercel → Settings → Environment Variables:

| Değişken | Ne için |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase adresi |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Tarayıcı istemcisi |
| `SUPABASE_SERVICE_ROLE_KEY` | Zamanlanmış yayın görevi (RLS'i atlar) |
| `ANTHROPIC_API_KEY` | AI yazı asistanı ve test sorusu üretimi |

`NEXT_PUBLIC_` ile başlayanlar derleme sırasında koda gömülür; değiştirince
yeniden deploy gerekir.

**Vercel Hobby planı sınırları:** günde tek cron görevi (bu yüzden zamanlanmış
yayın 09:00'da bir kez çalışır), dosya yükleme 50 MB (biz 5 MB'a çektik).

---

## Tasarım

- **Site paleti:** krem zemin `#f5f0e8`, metin `#2a1f18`, terra `#b5734a`, şarap `#8b2635`
- **Panel paleti:** `lib/adminTheme.ts` içinde; beyaz zemin, açık gri sol menü
- **Yazı tipleri:** Playfair Display (başlıklar), Open Sans (gövde)
- **Yazım kuralı:** metinlerde em dash (—) kullanılmaz, virgül veya kısa tire tercih edilir

---

## Bilinmesi gereken tuhaflıklar

Bunlar geçmişte zaman kaybettiren, tekrar karşılaşılabilecek konular:

1. **Eski görseller kırık.** `loveinartsz.com` kapalı. 510 yazının 445'inin
   `cover_url`'ü oraya işaret ediyor. `lib/coverUrl.ts` bu durumda kategoriye
   uygun bir yedek görsel döndürür. Yazı içindeki kırık görselleri de
   `lib/cleanContent.ts` temizler.

2. **Vercel cron ve Hobby planı.** `vercel.json`'a günde birden fazla çalışan bir
   cron yazarsan Vercel **hiçbir deployment üretmez** ve sebebini sadece
   "Create Deployment" penceresinde gösterir. Deploy olmuyorsa önce buraya bak.

3. **favicon.ico RGBA olmalı.** RGB kaydedilirse Next.js derlemesi
   "The PNG is not in RGBA format" hatasıyla düşer.

4. **Kategori eklemek.** Kategoriler `categories` tablosunda ve `posts.category`
   yabancı anahtarla bağlı. Eskiden kodda sabit bir CHECK kısıtı vardı, kaldırıldı.
   Panelden eklenen kategori anında kullanılabilir.

5. **Düzenleme editörüne içerik yüklenmesi.** Sayfa açılırken editör henüz DOM'da
   olmadığı için içerik `loading` bitince ayrı bir effect'te yazılır. Ayrıca boş
   editörle kaydetmek mevcut içeriği silmesin diye koruma var.

---

## Yapılacaklar

- [ ] Instagram, İletişim, Hakkında sayfaları (şu an altbilgide `#` linkler)
- [ ] AdSense publisher ID'sini `app/layout.tsx` içine yaz (şu an `ca-pub-XXXX`)
- [ ] Kapağı olmayan 40 yazıya gerçek görsel
- [ ] Yazar sayfalarında biyografi ve fotoğrafı göster (`authors` tablosunda alanlar hazır)
- [ ] Testleri sosyal medyada paylaşma düğmesi
- [ ] Mobil görünümü baştan sona gözden geçir
