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
│   ├── RichEditor.tsx                # Yazı içeriği editörü (iki yazı sayfası da bunu kullanır)
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

6. **Editör stilleri iki yerde.** `components/RichEditor.tsx` içindeki
   `.yazi-editor` kuralları, `app/globals.css` içindeki `.post-content` kurallarının
   kopyası. Amaç: editörde görülen boyut, sitede çıkan boyutla birebir aynı olsun.
   Birini değiştirirsen diğerini de değiştir, yoksa yazarlar yanlış boyut görür.

7. **`posts` tablosunda `updated_at` kolonu YOK.** PostgREST'te olmayan bir kolonu
   `select` içine yazarsan sorgunun tamamı hataya düşer ve boş döner. Site haritası
   bu yüzden bir ara hiç yazı içermiyordu. `select('*')` güvenli, açık liste değil.

8. **`cookies()` önbelleği kapatır.** `lib/supabase/server.ts` çerez okuyor; bir
   sayfa ona dokunduğu anda Next.js rotayı zorunlu dinamik yapıyor ve
   `export const revalidate` hiçbir işe yaramıyor. Herkese açık okuma yapan
   sayfalarda `lib/supabase/public.ts` kullanılmalı.

9. **Punto değiştirme `<font>` üzerinden çalışır.** `execCommand('fontSize')` yalnızca
   1-7 arası değer kabul ettiği için önce 7 ile işaretlenip üretilen `<font size="7">`
   etiketleri kendi `<span style="font-size:…">`imizle değiştiriliyor. execCommand
   kullanımdan kalkmış sayılır ama contenteditable için hâlâ en pratik yol.

---

## Yazı içeriği editörü

`components/RichEditor.tsx`. Hem "yeni yazı" hem "yazıyı düzenle" sayfası bunu kullanır.

| Araç | Ne yapar |
|------|----------|
| Metin biçimi | Normal metin, Başlık 1/2/3 (h2/h3/h4), Alıntı |
| Yazı boyutu | Küçük / Normal / Büyük / Çok büyük hazır ölçek |
| px kutusu | Kendi puntonu yaz (10-72), Enter'a bas |
| B I U S | Kalın, italik, alt çizgi, üstü çizili |
| Listeler | Madde ve numaralı liste, yatay ayraç |
| Görsel | Bilgisayardan yükle (5 MB sınır) ya da adres yapıştır |

Sayfadaki `h1` yazının başlığıdır, o yüzden içerikteki "Başlık 1" aslında `h2` üretir.
SEO açısından doğrusu bu, bir sayfada tek `h1` olmalı.

Görsele tıklayınca üstte bir şerit açılır: genişlik (%40 / %65 / %85 / %100) ve
hizalama (sol / orta / sağ). Değerler görselin kendi `style` özniteliğine yazılır,
yüzde olduğu için mobilde de düzgün küçülür.

---

## SEO

Ağustos 2026'ya kadar site Google'da neredeyse görünmüyordu, çünkü **hiçbir yazı
sayfasında `generateMetadata` yoktu.** 510 yazının hepsi arama sonuçlarında
"The Cultiva yaşam, sanat & seyahat" başlığıyla çıkıyordu; Google açısından hepsi
birbirinin aynısı sayfalardı. Panelde doldurulan `meta_title` / `meta_description`
alanları kaydediliyor ama okunmuyordu.

Şimdi kurulan yapı:

| Dosya | Görevi |
|-------|--------|
| `lib/seo.ts` | `sayfaMetadata()` başlık/açıklama/canonical/OG/Twitter üretir; şema fonksiyonları |
| `components/JsonLd.tsx` | Yapısal veriyi sayfaya gömer |
| `app/sitemap.ts` | `/sitemap.xml`, tüm yazı/kategori/yazar/test adresleri |
| `app/robots.ts` | `/robots.txt`, admin ve panel taranmaz, sitemap'i işaret eder |
| `lib/supabase/public.ts` | Çerezsiz okuma istemcisi, önbelleklemeyi mümkün kılar |

Kurallar:

- Yeni bir herkese açık sayfa eklerken **mutlaka `generateMetadata` yaz** ve
  `sayfaMetadata()` kullan. Canonical adres olmadan sayfa kopya sayılabilir.
- Başlık ekini `sayfaMetadata` hallediyor. Kendin "| The Cultiva" ekleme, iki kez
  yazılır. Layout'taki `%s | The Cultiva` şablonu `title: { absolute }` ile atlanıyor.
- Yazıya özel açıklama sırası: `meta_description` → `excerpt` → içeriğin ilk 158 karakteri.
- Yönetim ve üyelik sayfalarına `robots: { index: false }` ver.

Search Console'da yapılacaklar (site zaten doğrulanmış durumda):

1. Sitemaps → `sitemap.xml` gönder
2. URL Denetimi ile birkaç yazıyı test edip "Dizine ekleme talebi" gönder
3. 1-2 hafta sonra Performans raporunda gösterim sayısına bak

---

## Yapılacaklar

- [ ] Instagram, İletişim, Hakkında sayfaları (şu an altbilgide `#` linkler)
- [ ] AdSense publisher ID'sini `app/layout.tsx` içine yaz (şu an `ca-pub-XXXX`)
- [ ] Kapağı olmayan 40 yazıya gerçek görsel
- [ ] Yazar sayfalarında biyografi ve fotoğrafı göster (`authors` tablosunda alanlar hazır)
- [ ] Testleri sosyal medyada paylaşma düğmesi
- [ ] Mobil görünümü baştan sona gözden geçir
- [ ] Search Console'a `sitemap.xml` gönder
- [ ] İçerik görsellerine `alt` metni (editörde alan yok, eklenmeli; görsel aramasından trafik gelir)
- [ ] Yazı sonuna "ilgili yazılar" bloğu (iç bağlantı, Google'ın site içi gezinmesini kolaylaştırır)
- [ ] `meta_title` / `meta_description` boş kalan yazıları doldur (özet yeterli ama özel yazılmış olanı daha iyi)
- [ ] Yazı sonu paylaşım düğmeleri
