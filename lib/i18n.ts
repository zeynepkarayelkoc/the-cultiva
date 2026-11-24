/*
  Arayüz metinleri, iki dil.

  Site Türkçe; İngilizce yazılar ve testler aynı bileşenleri kullanıyor, sadece
  ekrandaki sabit metinler buradan dile göre seçiliyor. Türkçe metinler eskiden
  bileşenlerin içinde neyse birebir aynısı, yani Türkçe sayfalarda hiçbir şey
  değişmiyor.

  İngilizce bölümün adresleri:
    /en                 İngilizce ana sayfa (yazılar + testler)
    /en/quizzes         İngilizce testler
    /en/quiz/<slug>     İngilizce test sayfası (quizzes.lang = 'en')
    /yazi/<slug>        İngilizce yazılar eski adreslerinde kalıyor,
                        dilleri lib/translations.ts'ten geliyor.
*/

import type { Dil } from './translations'
export type { Dil }

export const tarihYerel = (dil: Dil) => (dil === 'en' ? 'en-GB' : 'tr-TR')
export const sayiYerel = (dil: Dil) => (dil === 'en' ? 'en-US' : 'tr-TR')

/** Test sayfasının adresi, dile göre. */
export const testYolu = (slug: string, dil: Dil) =>
  dil === 'en' ? `/en/quiz/${slug}` : `/test/${slug}`

/** Test listesinin adresi, dile göre. */
export const testListeYolu = (dil: Dil) => (dil === 'en' ? '/en/quizzes' : '/testler')

const tr = {
    // QuizPlayer
    bilgiTesti: 'bilgi testi',
    kisilikTesti: 'kişilik testi',
    soru: 'soru',
    dk: 'dk',
    kisiCozdu: 'kişi çözdü',
    testeBasla: 'Teste başla',
    girisUyari: 'Puanının kaydedilmesi ve sıralamaya girmek için',
    girisYap: 'giriş yap',
    soruSayaci: 'soru',
    sonrakiSoru: 'Sonraki soru',
    sonucuGor: 'Sonucu gör',
    sonucun: 'sonucun',
    dogruKisa: 'doğru',
    sonuc: 'Sonuç',
    puan: 'Puan',
    sure: 'Süre',
    sn: 'sn',
    dogru: 'Doğru',
    yuzde: (n: number) => `%${n}`,
    kopyalandi: 'Bağlantı kopyalandı',
    paylas: 'Sonucu paylaş',
    tekrarDene: 'Tekrar dene',
    siralama: 'Şampiyonluk tablosu',
    baskaTest: 'Başka test',
    puanKaydedilmedi: 'Puanın kaydedilmedi.',
    sonucKaydedilmedi: 'Sonucun kaydedilmedi.',
    girisYapBuyuk: 'Giriş yap',
    siralamayaGir: ', sıralamaya gir.',
    profildeBiriksin: ', profilinde biriksin.',
    puanIslendi: 'Puanın profiline işlendi.',
    sonucIslendi: 'Sonucun profiline işlendi.',
    kaydedilemedi: 'Kaydedilemedi.',
    kaydediliyor: 'Kaydediliyor…',
    soruYok: 'Bu testte henüz soru yok.',
    paylasBilgi: (t: string, d: number, n: number) => `${t} testinde ${d}/${n} yaptım.`,
    paylasKisilik: (t: string, s: string) => `${t} testinde sonucum: ${s}`,
    // Test sayfası
    geriTestler: '← testler',
    testBulunamadi: 'Test bulunamadı',
    varsayilanAciklama: (t: string) => `${t} testini çöz, sonucunu arkadaşlarınla paylaş.`,
    // TestSayfaIcerik
    hangiSonuclar: 'Bu testte hangi sonuçlar var?',
    rozetler: 'Rozetler',
    kisilikAciklama: (t: string, n: number) =>
      `${t} testinde ${n} farklı sonuç çıkabiliyor. Verdiğin cevaplar en çok hangisine yakınsa o çıkıyor; doğru ya da yanlış cevap yok.`,
    bilgiAciklama: (n: number) =>
      `${n} sorunun kaçını bildiğine göre bir rozet kazanıyorsun. En üsttekine ulaşmak için neredeyse hepsini doğru bilmen gerekiyor.`,
    enAzDogru: (n: number) => `${n}+ doğru`,
    sss: 'Sık sorulanlar',
    baskaTestler: 'Başka testler',
    // Yazı sayfası
    dkOkuma: 'dk okuma',
    guncellendi: 'Güncellendi',
    yazilarinaDon: (k: string) => `${k} yazılarına dön`,
}

const en: typeof tr = {
    bilgiTesti: 'trivia quiz',
    kisilikTesti: 'personality quiz',
    soru: 'questions',
    dk: 'min',
    kisiCozdu: 'plays',
    testeBasla: 'Start the quiz',
    girisUyari: '',
    girisYap: '',
    soruSayaci: 'question',
    sonrakiSoru: 'Next question',
    sonucuGor: 'See your result',
    sonucun: 'your result',
    dogruKisa: 'correct',
    sonuc: 'Result',
    puan: 'Score',
    sure: 'Time',
    sn: 's',
    dogru: 'Correct',
    yuzde: (n: number) => `${n}%`,
    kopyalandi: 'Link copied',
    paylas: 'Share your result',
    tekrarDene: 'Try again',
    siralama: '',
    baskaTest: 'More quizzes',
    puanKaydedilmedi: '',
    sonucKaydedilmedi: '',
    girisYapBuyuk: '',
    siralamayaGir: '',
    profildeBiriksin: '',
    puanIslendi: '',
    sonucIslendi: '',
    kaydedilemedi: '',
    kaydediliyor: '',
    soruYok: 'This quiz has no questions yet.',
    paylasBilgi: (t: string, d: number, n: number) => `I got ${d}/${n} on "${t}".`,
    paylasKisilik: (t: string, s: string) => `My result in "${t}": ${s}`,
    geriTestler: '← quizzes',
    testBulunamadi: 'Quiz not found',
    varsayilanAciklama: (t: string) => `Take the "${t}" quiz and share your result.`,
    hangiSonuclar: 'What results can you get?',
    rozetler: 'Badges',
    kisilikAciklama: (t: string, n: number) =>
      `There are ${n} possible results in "${t}". You get the one closest to your answers; there are no right or wrong choices.`,
    bilgiAciklama: (n: number) =>
      `You earn a badge depending on how many of the ${n} questions you get right. The top one needs an almost perfect score.`,
    enAzDogru: (n: number) => `${n}+ correct`,
    sss: 'FAQ',
    baskaTestler: 'More quizzes',
    dkOkuma: 'min read',
    guncellendi: 'Updated',
    yazilarinaDon: () => 'More from The Cultiva in English',
}

export type Metinler = typeof tr
export const METIN: Record<Dil, Metinler> = { tr, en }

/** Kategori adları, dile göre. */
export const KATEGORI_ADI: Record<Dil, Record<string, string>> = {
  tr: { yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat', sinema: 'sinema', rehber: 'rehber', kitap: 'kitap' },
  en: { yasam: 'life', seyahat: 'travel', sanat: 'art', sinema: 'film', rehber: 'guides', kitap: 'books' },
}
