import Link from 'next/link'
import type { Quiz, QuizOutcome } from '@/lib/quiz'

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

function SonucKarti({ sonuc, kisilik }: { sonuc: QuizOutcome; kisilik: boolean }) {
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
            {sonuc.min_correct}+ doğru
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
            {kisilik ? 'Bu testte hangi sonuçlar var?' : 'Rozetler'}
          </h2>
          <p style={paragraf}>
            {kisilik
              ? `${quiz.title} testinde ${sonuclar.length} farklı sonuç çıkabiliyor. Verdiğin cevaplar en çok hangisine yakınsa o çıkıyor; doğru ya da yanlış cevap yok.`
              : `${soruSayisi} sorunun kaçını bildiğine göre bir rozet kazanıyorsun. En üsttekine ulaşmak için neredeyse hepsini doğru bilmen gerekiyor.`}
          </p>
          <ul style={{ padding: 0, margin: '0 0 2.5rem' }}>
            {sonuclar.map(s => (
              <SonucKarti key={s.id} sonuc={s} kisilik={kisilik} />
            ))}
          </ul>
        </>
      )}

      {/* Sık sorulanlar */}
      <h2 style={baslik}>Sık sorulanlar</h2>
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
          <h2 style={baslik}>Başka testler</h2>
          <ul style={{ padding: 0, margin: 0, display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {digerTestler.map(t => (
              <li key={t.slug} style={{ listStyle: 'none' }}>
                <Link href={`/test/${t.slug}`} style={{
                  display: 'inline-block',
                  fontSize: '0.82rem',
                  padding: '0.45rem 0.9rem',
                  borderRadius: 50,
                  border: '1px solid var(--border)',
                  background: 'white',
                  color: 'var(--text)',
                }}>
                  {t.title}
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
