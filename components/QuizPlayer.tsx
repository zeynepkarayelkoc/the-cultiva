'use client'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  Quiz, QuizOutcome, puanHesapla, bilgiSonucu, kisilikSonucu, VARSAYILAN_RENK,
} from '@/lib/quiz'

type Durum = 'giris' | 'soru' | 'sonuc'

export default function QuizPlayer({ quiz, girisYapti }: { quiz: Quiz; girisYapti: boolean }) {
  const supabase = createClient()
  const sorular = [...quiz.quiz_questions].sort((a, b) => a.position - b.position)
  const bilgi = quiz.type === 'bilgi'

  const [durum, setDurum] = useState<Durum>('giris')
  const [i, setI] = useState(0)
  const [secili, setSecili] = useState<string | null>(null)
  const [dogru, setDogru] = useState(0)
  const [anahtarlar, setAnahtarlar] = useState<(string | null)[]>([])
  const [saniye, setSaniye] = useState(0)
  const [kaydedildi, setKaydedildi] = useState<'yok' | 'evet' | 'hata'>('yok')
  const sayacRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => () => { if (sayacRef.current) clearInterval(sayacRef.current) }, [])

  const basla = () => {
    setDurum('soru'); setI(0); setDogru(0); setAnahtarlar([]); setSecili(null); setSaniye(0)
    sayacRef.current = setInterval(() => setSaniye(s => s + 1), 1000)
  }

  const soru = sorular[i]
  const secenekler = soru ? [...soru.quiz_options].sort((a, b) => a.position - b.position) : []

  const cevapla = (optId: string) => {
    if (secili) return
    setSecili(optId)
    const o = secenekler.find(x => x.id === optId)
    if (bilgi && o?.is_correct) setDogru(d => d + 1)
    if (!bilgi) setAnahtarlar(a => [...a, o?.outcome_key ?? null])
  }

  const ilerle = async () => {
    if (i + 1 < sorular.length) { setI(i + 1); setSecili(null); return }
    if (sayacRef.current) clearInterval(sayacRef.current)
    setDurum('sonuc')
    await kaydet()
  }

  const kaydet = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const sonuc = bilgi ? bilgiSonucu(quiz.quiz_outcomes, dogru) : kisilikSonucu(quiz.quiz_outcomes, anahtarlar)
    const { error } = await supabase.from('quiz_attempts').insert({
      quiz_id: quiz.id,
      user_id: user.id,
      correct_count: bilgi ? dogru : 0,
      total: sorular.length,
      score: bilgi ? puanHesapla(dogru, sorular.length, saniye) : 0,
      duration_sec: saniye,
      outcome_key: sonuc?.key ?? null,
    })
    setKaydedildi(error ? 'hata' : 'evet')
  }

  const sonuc: QuizOutcome | null = bilgi
    ? bilgiSonucu(quiz.quiz_outcomes, dogru)
    : kisilikSonucu(quiz.quiz_outcomes, anahtarlar)
  const renk = sonuc?.color || VARSAYILAN_RENK
  const puan = puanHesapla(dogru, sorular.length, saniye)

  const kart: React.CSSProperties = {
    background: '#fff', border: '1px solid var(--border)', borderRadius: 14,
  }
  const anaBtn: React.CSSProperties = {
    background: 'var(--terra)', color: '#fff', border: 'none', borderRadius: 10,
    padding: '0.85rem 1.8rem', fontSize: '0.95rem', cursor: 'pointer', fontFamily: 'inherit',
  }

  if (sorular.length === 0) {
    return <p style={{ color: 'var(--muted)' }}>Bu testte henüz soru yok.</p>
  }

  /* ---------- GİRİŞ ---------- */
  if (durum === 'giris') return (
    <div style={{ ...kart, overflow: 'hidden' }}>
      <div style={{
        height: 200, background: `linear-gradient(135deg, ${renk}, #806040)`,
        backgroundImage: quiz.cover_url ? `url(${quiz.cover_url})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
      <div style={{ padding: '1.8rem' }}>
        <div style={{ fontSize: '0.65rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--terra)', marginBottom: '0.7rem' }}>
          {bilgi ? 'bilgi testi' : 'kişilik testi'}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 400, lineHeight: 1.25, marginBottom: '0.8rem' }}>
          {quiz.title}
        </h1>
        {quiz.description && (
          <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, marginBottom: '1.2rem' }}>
            {quiz.description}
          </p>
        )}
        <div style={{ display: 'flex', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--muted)', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span>{sorular.length} soru</span><span>·</span>
          <span>{Math.max(1, Math.round(sorular.length * 0.4))} dk</span><span>·</span>
          <span>{quiz.play_count.toLocaleString('tr-TR')} kişi çözdü</span>
        </div>
        <button onClick={basla} style={anaBtn}>Teste başla</button>
        {!girisYapti && (
          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '1rem' }}>
            Puanının kaydedilmesi ve sıralamaya girmek için{' '}
            <Link href="/giris" style={{ color: 'var(--terra)' }}>giriş yap</Link>.
          </div>
        )}
      </div>
    </div>
  )

  /* ---------- SORU ---------- */
  if (durum === 'soru') return (
    <div>
      <div style={{ height: 5, background: 'var(--border)', borderRadius: 5, marginBottom: '1.5rem' }}>
        <div style={{ height: '100%', width: `${(i / sorular.length) * 100}%`, background: 'var(--terra)', borderRadius: 5, transition: 'width .3s' }} />
      </div>

      <div style={{ ...kart, padding: '1.6rem' }}>
        <div style={{ fontSize: '0.7rem', color: 'var(--muted)', letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '0.7rem' }}>
          soru {i + 1} / {sorular.length}
        </div>

        {soru.image_url && (
          <div style={{
            height: 200, borderRadius: 10, marginBottom: '1rem',
            background: `#eee url(${soru.image_url}) center/cover no-repeat`,
          }} />
        )}

        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.35rem', fontWeight: 400, lineHeight: 1.4, marginBottom: soru.hint ? '0.4rem' : '1.2rem' }}>
          {soru.text}
        </h2>
        {soru.hint && (
          <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontStyle: 'italic', marginBottom: '1.2rem' }}>
            {soru.hint}
          </div>
        )}

        <div style={{ display: 'grid', gap: '0.6rem' }}>
          {secenekler.map((o, idx) => {
            let bg = '#faf8f4', bd = 'var(--border)', tc = 'var(--text)', op = 1
            if (secili && bilgi) {
              if (o.is_correct) { bg = '#eaf1ea'; bd = '#4f7a52'; tc = '#33562f' }
              else if (o.id === secili) { bg = '#fbecec'; bd = '#b03030'; tc = '#8c2222' }
              else op = 0.5
            } else if (secili && !bilgi) {
              if (o.id === secili) { bg = '#faf0e6'; bd = 'var(--terra)' }
              else op = 0.5
            }
            return (
              <button
                key={o.id}
                onClick={() => cevapla(o.id)}
                disabled={!!secili}
                style={{
                  textAlign: 'left', padding: '0.9rem 1rem', borderRadius: 10,
                  background: bg, border: `1px solid ${bd}`, color: tc, opacity: op,
                  fontSize: '0.95rem', fontFamily: 'inherit',
                  cursor: secili ? 'default' : 'pointer', transition: 'all .15s',
                }}
              >
                <span style={{ display: 'inline-block', width: 24, color: 'var(--muted)' }}>
                  {String.fromCharCode(65 + idx)}
                </span>
                {o.text}
              </button>
            )
          })}
        </div>

        {secili && (
          <div style={{ marginTop: '1.2rem' }}>
            {bilgi && soru.explanation && (
              <div style={{
                padding: '0.9rem 1rem', borderRadius: 10, fontSize: '0.88rem', lineHeight: 1.65,
                marginBottom: '1rem',
                background: secenekler.find(x => x.id === secili)?.is_correct ? '#eaf1ea' : '#fbecec',
                color: secenekler.find(x => x.id === secili)?.is_correct ? '#33562f' : '#8c2222',
              }}>
                {soru.explanation}
              </div>
            )}
            <button onClick={ilerle} style={anaBtn}>
              {i + 1 < sorular.length ? 'Sonraki soru' : 'Sonucu gör'}
            </button>
          </div>
        )}
      </div>
    </div>
  )

  /* ---------- SONUÇ ---------- */
  return (
    <div style={{ ...kart, padding: '2rem', textAlign: 'center' }}>
      {bilgi ? (
        <div style={{
          width: 96, height: 96, margin: '0 auto 1rem', borderRadius: '50%', background: renk,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontFamily: "'Playfair Display', serif", fontSize: '1.9rem',
        }}>
          {dogru}/{sorular.length}
        </div>
      ) : sonuc?.image_url ? (
        <div style={{
          width: 130, height: 130, margin: '0 auto 1rem', borderRadius: '50%',
          background: `#eee url(${sonuc.image_url}) center/cover no-repeat`,
        }} />
      ) : null}

      <div style={{ fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: renk, marginBottom: '0.5rem' }}>
        {bilgi ? 'sonucun' : 'sen bir'}
      </div>
      <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.7rem', fontWeight: 400, marginBottom: '0.7rem' }}>
        {sonuc?.title ?? (bilgi ? `${dogru}/${sorular.length} doğru` : 'Sonuç')}
      </h2>
      {sonuc?.description && (
        <p style={{ fontSize: '0.95rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: 460, margin: '0 auto 1.5rem' }}>
          {sonuc.description}
        </p>
      )}

      {bilgi && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.7rem', maxWidth: 380, margin: '0 auto 1.5rem' }}>
          {[['Puan', puan], ['Süre', `${saniye} sn`], ['Doğru', `%${Math.round(dogru / sorular.length * 100)}`]].map(([k, v]) => (
            <div key={k as string} style={{ background: 'var(--cream, #f5f0e8)', borderRadius: 10, padding: '0.8rem 0.4rem' }}>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.25rem' }}>{v}</div>
              <div style={{ fontSize: '0.62rem', color: 'var(--muted)', letterSpacing: '0.12em', textTransform: 'uppercase', marginTop: 2 }}>{k}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.6rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button onClick={basla} style={{ ...anaBtn, background: '#fff', color: 'var(--text)', border: '1px solid var(--border)' }}>
          Tekrar dene
        </button>
        {bilgi && (
          <Link href="/testler/siralama" style={{ ...anaBtn, textDecoration: 'none', display: 'inline-block' }}>
            Şampiyonluk tablosu
          </Link>
        )}
        <Link href="/testler" style={{ ...anaBtn, background: '#fff', color: 'var(--text)', border: '1px solid var(--border)', textDecoration: 'none', display: 'inline-block' }}>
          Başka test
        </Link>
      </div>

      <div style={{ fontSize: '0.78rem', color: 'var(--muted)', marginTop: '1.2rem' }}>
        {!girisYapti
          ? <>Puanın kaydedilmedi. <Link href="/giris" style={{ color: 'var(--terra)' }}>Giriş yap</Link>, sıralamaya gir.</>
          : kaydedildi === 'evet' ? 'Puanın profiline işlendi.'
          : kaydedildi === 'hata' ? 'Puan kaydedilemedi.'
          : 'Kaydediliyor…'}
      </div>
    </div>
  )
}
