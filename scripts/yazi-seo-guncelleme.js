// The Cultiva: mevcut sanat yazılarının SEO güncellemesi (Kasım 2026)
//
// Ne yapar: altı yazının Google'da görünen başlığını ve açıklamasını aranan
// kelimelere göre günceller, içeriğin SONUNA kısa bir özet ve sık sorulanlar
// bölümü ekler. Mevcut metne dokunmaz, adresleri (slug) değiştirmez.
// Tekrar çalıştırılırsa ekleri ikinci kez eklemez.
//
// Kullanım: /api/post-seo uç noktası canlıdayken (bu commit deploy edildikten
// sonra) thecultiva.com/admin açık ve admin girişi yapılmışken konsolda çalıştır.

const sss = (liste) =>
  '<h2>Sık sorulanlar</h2>\n' +
  liste.map(([s, c]) => `<h3>${s}</h3>\n<p>${c}</p>`).join('\n')

const GUNCELLEMELER = [
  {
    slug: 'las-meninas-velazquez-neyi-resmediyor',
    meta_title: 'Nedimeler (Las Meninas) Tablosunun Hikayesi ve Anlamı',
    meta_description: 'Velázquez\'in Nedimeler (Las Meninas) tablosunda kim var, aynadaki çift kim ve ressam neyi resmediyor? Prado\'nun en tartışılan tablosunun hikayesi.',
    ek_anahtar: 'nedimeler-sss',
    ek_html:
      '<h2>Kısaca: Nedimeler tablosu</h2>\n' +
      '<p>Türkçede "Nedimeler" diye bilinen Las Meninas, Diego Velázquez\'in 1656\'da yaptığı ve bugün Madrid\'deki Prado Müzesi\'nde duran tablodur. Görünüşte küçük prenses Margarita\'nın etrafındaki bir saray anını anlatır; ama bakışlar, ayna ve ressamın kendini tabloya koyması yüzünden asıl konunun izleyicinin kendisi olduğu söylenir.</p>\n' +
      sss([
        ['Nedimeler tablosu kimin eseri?', 'İspanyol saray ressamı Diego Velázquez\'in eseridir. Tabloyu 1656\'da tamamladı.'],
        ['Nedimeler tablosu nerede?', 'Madrid\'deki Prado Müzesi\'nde sergileniyor ve müzenin en çok ziyaret edilen eserlerinden biri.'],
        ['Tabloya neden Nedimeler deniyor?', '"Meninas" Portekizce kökenli bir kelime ve nedime anlamına geliyor. Adını, prensesin yanındaki iki nedimeden alıyor.'],
        ['Aynada görünen kişiler kim?', 'Arka duvardaki aynada Kral IV. Felipe ve Kraliçe Mariana görünür. Tablonun en çok tartışılan sorusu da onların odanın neresinde durduğudur.'],
      ]),
  },
  {
    slug: 'shakespearein-satirlarindan-tuvale-ophelianin-oykusu',
    meta_title: 'Ophelia Tablosunun Hikayesi ve Anlamı: Millais',
    meta_description: 'John Everett Millais\'in Ophelia tablosu neyi anlatıyor? Hamlet\'teki Ophelia\'nın hikayesi, tablodaki çiçeklerin anlamı ve diğer Ophelia tasvirleri.',
    ek_anahtar: 'ophelia-sss',
    ek_html:
      '<h2>Kısaca: Ophelia tablosu</h2>\n' +
      '<p>En bilinen Ophelia tablosu, İngiliz ressam John Everett Millais\'in 1851-1852 yıllarında yaptığı eserdir. Shakespeare\'in Hamlet oyununda babasının ölümünden sonra aklını yitiren Ophelia\'nın derede boğulmadan hemen önceki anını gösterir. Bugün Londra\'daki Tate Britain\'da sergileniyor.</p>\n' +
      sss([
        ['Ophelia tablosu kimin eseri?', 'En ünlü Ophelia tablosu John Everett Millais\'e aittir. Ophelia\'yı başka pek çok ressam da resmetmiştir; yazıda bunlardan bazılarına yer veriyoruz.'],
        ['Ophelia tablosu hangi akıma ait?', 'Millais, 19. yüzyıl ortasında kurulan Prerafaelit Kardeşlik\'in kurucularındandır. Doğadaki her ayrıntıyı titizlikle resmetmek bu akımın en belirgin özelliğidir.'],
        ['Tablodaki çiçeklerin anlamı ne?', 'Millais çiçekleri bilinçli seçmiştir: gelincik ölümü, papatya masumiyeti, söğüt terk edilmiş aşkı, Ophelia\'nın boynundaki menekşeler ise sadakati ve genç ölümü simgeler.'],
        ['Ophelia tablosu nerede?', 'Londra\'daki Tate Britain müzesinde sergileniyor.'],
      ]),
  },
  {
    slug: 'yildizli-gece-aci-dolu-bir-son',
    meta_title: 'Yıldızlı Gece Tablosunun Anlamı ve Hikayesi | Van Gogh',
    meta_description: 'Van Gogh Yıldızlı Gece\'yi nerede ve neden yaptı, tablo ne anlatıyor? Saint-Rémy\'deki pencereden MoMA\'ya, sanat tarihinin en ünlü gökyüzünün hikayesi.',
    ek_anahtar: 'yildizli-gece-sss',
    ek_html:
      '<h2>Kısaca: Yıldızlı Gece tablosu</h2>\n' +
      '<p>Yıldızlı Gece, Vincent van Gogh\'un Haziran 1889\'da Saint-Rémy-de-Provence\'taki akıl hastanesinde kaldığı dönemde yaptığı tablodur. Odasının penceresinden gördüğü manzarayı temel alır ama köy ve kilise büyük ölçüde hayal ürünüdür. Bugün New York\'taki Modern Sanat Müzesi\'nde (MoMA) sergileniyor.</p>\n' +
      sss([
        ['Yıldızlı Gece tablosu kimin eseri?', 'Hollandalı ressam Vincent van Gogh\'un eseridir.'],
        ['Yıldızlı Gece tablosu nerede?', 'New York\'taki Modern Sanat Müzesi\'nde (MoMA) sergileniyor.'],
        ['Yıldızlı Gece ne anlatıyor?', 'Gece gökyüzünü dalgalanan, canlı bir varlık gibi gösterir. Ön plandaki selvi ağacı Akdeniz kültüründe ölümle ve mezarlıklarla bağdaştırılır; bu yüzden tablo çoğu zaman ölüm ile sonsuzluk arasındaki bir bakış olarak yorumlanır.'],
        ['Van Gogh Yıldızlı Gece\'yi sevdi mi?', 'Pek sayılmaz. Mektuplarında bu tabloyu başarılı bulmadığını yazmıştır. Bugün ise sanat tarihinin en çok tanınan eserlerinden biri.'],
      ]),
  },
  {
    slug: 'bir-zarafet-ki-osman-hamdi-bey',
    meta_title: 'Silah Taciri Tablosunun Hikayesi: Osman Hamdi Bey',
    meta_description: 'Osman Hamdi Bey\'in Silah Taciri tablosu ne anlatıyor? Baba ile oğul, kılıç ile kitap, gençlik ile ölüm arasındaki zıtlıklarla bir eser okuması.',
    ek_anahtar: 'silah-taciri-sss',
    ek_html:
      '<h2>Kısaca: Silah Taciri tablosu</h2>\n' +
      '<p>Silah Taciri, Osman Hamdi Bey\'in 1908\'de, hayatının son yıllarında yaptığı tablodur. Ressam kendisini oturan baba figürü olarak, oğlu Ethem\'i de kılıca hayranlıkla bakan genç olarak resmetmiştir. Tablo, kuşak farkı ve eğitimin değeri üzerine kurulu zıtlıklarıyla bilinir.</p>\n' +
      sss([
        ['Silah Taciri tablosu kimin eseri?', 'Ressam, arkeolog ve müzeci Osman Hamdi Bey\'in eseridir.'],
        ['Silah Taciri tablosu ne zaman yapıldı?', '1908\'de, Osman Hamdi Bey\'in 1910\'daki ölümünden iki yıl önce yapıldı.'],
        ['Silah Taciri tablosu nerede?', 'Ankara Resim ve Heykel Müzesi kendi sayfasında eseri Osman Hamdi Bey salonunda sergilenen eserler arasında gösteriyor.'],
        ['Tablodaki kişiler kim?', 'Oturan baba Osman Hamdi Bey\'in kendisi, ayaktaki genç oğlu Ethem\'dir. Arka plandaki ihtiyar ve ona bez uzatan tüccar ise yazıda anlattığımız ölüm metaforunu taşır.'],
      ]),
  },
  {
    slug: 'yeniden-sekillendirilmis-tanrica-kirke',
    meta_title: 'Kirke Kimdir? Mitolojide Kirke ve Odysseus',
    meta_description: 'Yunan mitolojisinde Kirke kimdir, Odysseus\'un adamlarını neden domuza çevirdi? Cadı tanrıçanın hikayesi ve Madeline Miller\'ın Ben, Kirke romanıyla yeniden doğuşu.',
    ek_anahtar: 'kirke-sss',
    ek_html:
      '<h2>Kısaca: Kirke kimdir?</h2>\n' +
      '<p>Kirke, Yunan mitolojisinde güneş tanrısı Helios ile su perisi Perse\'nin kızı olan büyücü tanrıçadır. Aiaia adasında yaşar ve en çok Homeros\'un Odysseia destanındaki rolüyle bilinir: Odysseus\'un adamlarını domuza çevirir, sonra Odysseus\'u bir yıl boyunca adasında ağırlar.</p>\n' +
      sss([
        ['Kirke\'nin babası kimdir?', 'Güneş tanrısı Helios\'tur. Annesi ise su perisi Perse\'dir.'],
        ['Kirke Odysseus\'un adamlarını neden domuza çevirdi?', 'Adasına gelen yabancılara karşı büyüsünü kullanır. Odysseus, Hermes\'in verdiği moly adlı bitki sayesinde büyüden korunur ve adamlarını geri insana çevirmesini sağlar.'],
        ['Ben, Kirke kitabı kimin?', 'Amerikalı yazar Madeline Miller\'ın 2018\'de yayımlanan romanıdır. Kirke\'nin hikayesini onun ağzından yeniden anlatır.'],
      ]),
  },
  {
    slug: 'surgunde-bir-cadi-ben-kirke',
    meta_title: 'Ben, Kirke Kitap Yorumu: Madeline Miller',
    meta_description: 'Madeline Miller\'ın Ben, Kirke romanı ne anlatıyor, kimler okumalı? Mitolojinin dışladığı cadı tanrıçayı kendi sesinden anlatan kitap üzerine bir yorum.',
    ek_anahtar: 'ben-kirke-sss',
    ek_html:
      sss([
        ['Ben, Kirke kitabının konusu ne?', 'Helios\'un kızı Kirke\'nin, ailesi tarafından dışlanıp Aiaia adasına sürgün edilmesini ve orada kendi gücünü keşfetmesini, Kirke\'nin kendi ağzından anlatır.'],
        ['Ben, Kirke kimin kitabı?', 'Amerikalı yazar Madeline Miller\'ın 2018\'de yayımlanan romanıdır.'],
        ['Mitoloji bilmeden okunur mu?', 'Okunur. Yazıda da önerdiğimiz gibi, önce kitabın sonundaki karakter dizinine göz atmak işinizi kolaylaştırır.'],
      ]),
  },
]

const sonuclar = {}
for (const g of GUNCELLEMELER) {
  const r = await fetch('/api/post-seo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(g) })
  sonuclar[g.slug] = { status: r.status, ...(await r.json()) }
}
console.table(sonuclar)
sonuclar
