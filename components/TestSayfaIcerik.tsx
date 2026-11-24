import Link from 'next/link'
import type { Quiz, QuizOutcome } from '@/lib/quiz'
import { METIN, testYolu, type Dil } from '@/lib/i18n'

/*
  Test sayfasının altındaki içerik bölümü.

  Neden var: test sayfalarında yalnızca başlık, tek cümlelik açıklama ve
  "Teste başla" düğmesi vardı, toplam 33 kelime. Google'ın çalışacağı hiçbir
  şey yoktu. "hangi friends karakterisin" sorgusu sitenin bütün gösteriminin
  %12'siydi ama sayfa 9. sıradaydı ve ayda 2 tıklama alıyordu.

  Buradaki metinlerin tamamı veritabanındaki mevcut veriden üretiliyor
  (sonuç tipleri, soru sayısı, kategori). Yani 18 testin hepsi yeni bir şey
  yazmadan içerik kazanıyor.

  Sonuçları baştan göstermek testi bozmuyor: kişilik testinde "doğru cevap"
  diye bir şey yok, bilgi testinde de yalnızca rozet adları görünüyor, sorular
  değil. Üstelik insanlar "hangi karakterler çıkabiliyor" diye arıyor.
*/

type Props = {
  quiz: Quiz
  digerTestler: { slug: string; title: string; type: string }[]
}

export type SoruCevap = { soru: string; cevap: string }

/** SSS metinleri. Hem ekranda hem JSON-LD'de aynısı kullanılacağı için
 *  tek yerden üretiliyor; ikisi ayrışırsa Google yapısal veriyi reddeder. */
export function sikSorulanlar(quiz: Quiz): SoruCevap[] {
  if (quiz.lang === 'en') return sikSorulanlarEn(quiz)
  const soruSayisi = quiz.quiz_questions?.length ?? 0
  const dakika = Math.max(1, Math.round(soruSayisi * 0.4))
  const kisilik = quiz.type === 'kisilik'
  const sonuclar = quiz.quiz_outcomes ?? []

  const liste: SoruCevap[] = [
    {
      soru: `${quiz.title} testi kaç soru ve ne kadar sürer?`,
      cevap: `Test ${soruSayisi} sorudan oluşuyor ve ortalama ${dakika} dakika sürüyor. Soruları sırayla cevaplıyorsun, geri dönüş yok.`,
    },
    {
      soru: 'Testi çözmek için üye olmak gerekiyor mu?',
      cevap: kisilik
        ? 'Hayır, üye olmadan da çözebilirsin. Giriş yaparsan sonucun profiline kaydedilir ve daha sonra tekrar görebilirsin.'
        : 'Hayır, üye olmadan da çözebilirsin. Ama puanının kaydedilmesi ve şampiyonluk tablosuna girmen için giriş yapman gerekiyor.',
    },
  ]

  if (kisilik) {
    const adlar = sonuclar.map(s => s.title).filter(Boolean)
    if (adlar.length) {
      liste.push({
        soru: 'Bu testte hangi sonuçlar çıkabiliyor?',
        cevap: `${adlar.length} farklı sonuç var: ${adlar.join(', ')}. Hangisinin çıkacağı verdiğin cevaplara göre belirleniyor.`,
      })
    }
    liste.push({
      soru: 'Sonucu nasıl paylaşırım?',
      cevap: 'Sonuç ekranındaki "Sonucu paylaş" düğmesine bas. Telefonunda sistem paylaşım penceresi açılır, bilgisayarda ise bağlantı panoya kopyalanır.',
    })
  } else {
    liste.push({
      soru: 'Puan nasıl hesaplanıyor?',
      cevap: 'Her doğru cevap 100 puan getiriyor. Testi hızlı bitirirsen süre bonusu da ekleniyor, yani hem bilmek hem çabuk karar vermek işe yarıyor.',
    })
    liste.push({
      soru: 'Testi tekrar çözebilir miyim?',
      cevap: 'Evet, istediğin kadar tekrar çözebilirsin. Şampiyonluk tablosuna en iyi denemen yansır.',
    })
  }

  return liste
}

/** İngilizce testlerin SSS'si. Üyelik ve sıralama İngilizce bölümde yok, o yüzden
 *  o sorular burada yer almıyor. */
function sikSorulanlarEn(quiz: Quiz): SoruCevap[] {
  const soruSayisi = quiz.quiz_questions?.length ?? 0
  const dakika = Math.max(1, Math.round(soruSayisi * 0.4))
  const kisilik = quiz.type === 'kisilik'
  const adlar = (quiz.quiz_outcomes ?? []).map(s => s.title).filter(Boolean)
  const liste: SoruCevap[] = [
    {
      soru: `How long is the "${quiz.title}" quiz?`,
      cevap: `It has ${soruSayisi} questions and takes about ${dakika} minute${dakika > 1 ? 's' : ''}. You answer them one by one.`,
    },
    {
      soru: 'Do I need to sign up?',
      cevap: 'No. The quiz is free and you can take it without an account.',
    },
  ]
  if (kisilik) {
    if (adlar.length) liste.push({
      soru: 'What results can I get?',
      cevap: `There are ${adlar.length} possible results: ${adlar.join(', ')}. Your answers decide which one you get.`,
    })
  } else {
    liste.push({
      soru: 'How is the score calculated?',
      cevap: 'Each correct answer is worth 100 points, and finishing quickly adds a time bonus.',
    })
  }
  liste.push({
    soru: 'How do I share my result?',
    cevap: 'Press "Share your result" on the result screen. On a phone the share menu opens; on a computer the link is copied to your clipboard.',
  })
  return liste
}

function SonucKarti({ sonuc, kisilik, dil }: { sonuc: QuizOutcome; kisilik: boolean; dil: Dil }) {
  return (
    <li style={{
      listStyle: 'none',
      padding: '0.9rem 1.1rem',
      background: 'white',
      border: '1px solid var(--border)',
      borderLeft: `3px solid ${sonuc.color || 'var(--terra)'}`,
      borderRadius: 10,
      marginBottom: '0.7rem',
    }}>
      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.05rem', fontWeight: 500, margin: '0 0 0.3rem',
      }}>
        {sonuc.title}
        {!kisilik && sonuc.min_correct !== null && (
          <span style={{ fontSize: '0.7rem', color: 'var(--muted)', fontWeight: 400, marginLeft: '0.5rem' }}>
            {METIN[dil].enAzDogru(sonuc.min_correct)}
          </span>
        )}
      </h3>
      {sonuc.description && (
        <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: 'var(--muted)', margin: 0 }}>
          {sonuc.description}
        </p>
      )}
    </li>
  )
}

export default function TestSayfaIcerik({ quiz, digerTestler }: Props) {
  const kisilik = quiz.type === 'kisilik'
  const dil: Dil = quiz.lang === 'en' ? 'en' : 'tr'
  const t = METIN[dil]
  const soruSayisi = quiz.quiz_questions?.length ?? 0
  const sonuclar = [...(quiz.quiz_outcomes ?? [])].sort(
    (a, b) => (b.min_correct ?? 0) - (a.min_correct ?? 0),
  )
  const sss = sikSorulanlar(quiz)

  return (
    <section style={{ marginTop: '3.5rem', paddingTop: '2.5rem', borderTop: '1px solid var(--border)' }}>

      {/* Sonuç tipleri */}
      {sonuclar.length > 0 && (
        <>
          <h2 style={baslik}>
            {kisilik ? t.hangiSonuclar : t.rozetler}
          </h2>
          <p style={paragraf}>
            {kisilik
              ? t.kisilikAciklama(quiz.title, sonuclar.length)
              : t.bilgiAciklama(soruSayisi)}
          </p>
          <ul style={{ padding: 0, margin: '0 0 2.5rem' }}>
            {sonuclar.map(s => (
              <SonucKarti key={s.id} sonuc={s} kisilik={kisilik} dil={dil} />
            ))}
          </ul>
        </>
      )}

      {/* Sık sorulanlar */}
      <h2 style={baslik}>{t.sss}</h2>
      <div style={{ marginBottom: '2.5rem' }}>
        {sss.map(({ soru, cevap }) => (
          <div key={soru} style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 0.3rem', color: 'var(--text)' }}>
              {soru}
            </h3>
            <p style={{ fontSize: '0.88rem', lineHeight: 1.75, color: 'var(--muted)', margin: 0 }}>
              {cevap}
            </p>
          </div>
        ))}
      </div>

      {/* Diğer testler: hem okuyucu için hem iç bağlantı için */}
      {digerTestler.length > 0 && (
        <>
          <h2 style={baslik}>{t.baskaTestler}</h2>
          <ul style={{ padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {digerTestler.map(d => (
              <li key={d.slug} style={{ listStyle: 'none' }}>
                <Link href={testYolu(d.slug, dil)} style={{
                  display: 'inline-block',
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 50,
                  border: '1px solid var(--border)',
                  background: 'white',
                  color: 'var(--text)',
                }}>
                  {d.title}
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  )
}

const baslik: React.CSSProperties = {
  fontFamily: "'Playfair Display', serif",
  fontSize: '1.35rem',
  fontWeight: 500,
  margin: '0 0 0.8rem',
}

const paragraf: React.CSSProperties = {
  fontSize: '0.92rem',
  lineHeight: 1.8,
  color: 'var(--muted)',
  margin: '0 0 1.3rem',
}
