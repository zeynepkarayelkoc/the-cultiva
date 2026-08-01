'use client'
import { useState, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import AdminShell from './AdminShell'
import { T, input, btn, btnPrimary, label } from '@/lib/adminTheme'
import type { Quiz, QuizQuestion, QuizOutcome } from '@/lib/quiz'
import { dosyaKontrol, MAKS_MB } from '@/lib/upload'

type Kategori = { slug: string; name: string }
type Yazi = { id: string; title: string }

// Görsel adresi + yükle + kaldır üçlüsü.
// Bileşen dosya seviyesinde tanımlı; render içinde tanımlansaydı her
// tuş vuruşunda yeniden oluşur ve yazarken odak kaybolurdu.
function GorselAlani({
  deger, ata, yukseklik = 90, yukleniyorMu, onYukle, kilitli,
}: {
  deger: string
  ata: (v: string) => void
  yukseklik?: number
  yukleniyorMu: boolean
  onYukle: () => void
  kilitli: boolean
}) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
      <div style={{
        width: yukseklik * 1.5, height: yukseklik, borderRadius: 8, flexShrink: 0,
        border: `1px solid ${T.border}`,
        background: deger ? `#fff url(${deger}) center/cover no-repeat` : '#f7f3ec',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '0.7rem', color: T.faint,
      }}>
        {deger ? '' : 'görsel yok'}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          style={{ ...input, height: 32, fontSize: '0.78rem', marginBottom: 6 }}
          value={deger} placeholder="https://… ya da yükle"
          onChange={e => ata(e.target.value)}
        />
        <div style={{ display: 'flex', gap: 6 }}>
          <button style={{ ...btn, height: 30, fontSize: '0.75rem' }} onClick={onYukle} disabled={kilitli}>
            {yukleniyorMu ? 'yükleniyor…' : 'Görsel yükle'}
          </button>
          {deger && (
            <button style={{ ...btn, height: 30, fontSize: '0.75rem', color: T.danger }} onClick={() => ata('')}>
              Kaldır
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TestEditor({
  quiz, categories, posts,
}: { quiz: Quiz; categories: Kategori[]; posts: Yazi[] }) {
  const router = useRouter()
  const supabase = createClient()
  const bilgi = quiz.type === 'bilgi'

  const [baslik, setBaslik]   = useState(quiz.title)
  const [slug, setSlug]       = useState(quiz.slug)
  const [aciklama, setAciklama] = useState(quiz.description ?? '')
  const [kapak, setKapak]     = useState(quiz.cover_url ?? '')
  const [kategori, setKategori] = useState(quiz.category ?? '')
  const [yayinda, setYayinda] = useState(quiz.published)

  // Her sorunun en az 4 şık satırı olsun; eksikse boş satırlarla tamamla,
  // yoksa şıkkı silinmiş/hiç girilmemiş sorulara şık eklenemez.
  const [sorular, setSorular] = useState<QuizQuestion[]>(
    [...quiz.quiz_questions].sort((a, b) => a.position - b.position).map(q => {
      const mevcut = [...q.quiz_options].sort((a, b) => a.position - b.position)
      const eksik = Math.max(0, 4 - mevcut.length)
      const bosSatirlar = Array.from({ length: eksik }, (_, k) => ({
        id: `bos-${q.id}-${k}`,
        position: mevcut.length + k,
        text: '',
        is_correct: mevcut.length === 0 && k === 0,
        outcome_key: null,
      }))
      return { ...q, quiz_options: [...mevcut, ...bosSatirlar] }
    }),
  )
  const [sonuclar, setSonuclar] = useState<QuizOutcome[]>(
    [...quiz.quiz_outcomes].sort((a, b) => (b.min_correct ?? 0) - (a.min_correct ?? 0)),
  )

  const [kaydediliyor, setKaydediliyor] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')
  const [aiYazi, setAiYazi] = useState('')
  const [aiCalisiyor, setAiCalisiyor] = useState(false)

  const yeniId = () => `yeni-${Math.random().toString(36).slice(2, 10)}`

  /* ---------- görsel yükleme ---------- */
  const dosyaRef = useRef<HTMLInputElement>(null)
  const hedefRef = useRef<((url: string) => void) | null>(null)
  const [yukleniyor, setYukleniyor] = useState<string | null>(null)

  const gorselSec = (anahtar: string, ata: (url: string) => void) => {
    hedefRef.current = ata
    setYukleniyor(anahtar)
    dosyaRef.current?.click()
  }

  const dosyaSecildi = async (dosya: File) => {
    setErr(''); setMsg('')
    const sorun = dosyaKontrol(dosya)
    if (sorun) { setYukleniyor(null); setErr(sorun); return }
    // Yol dosya adından türetiliyor; upsert sayesinde çakışma sorun olmuyor.
    const temizAd = dosya.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const yol = `quiz/${quiz.id}/${yukleniyor}-${temizAd}`
    const { error } = await supabase.storage.from('images').upload(yol, dosya, { upsert: true })
    if (error) { setYukleniyor(null); setErr(error.message); return }
    const { data } = supabase.storage.from('images').getPublicUrl(yol)
    hedefRef.current?.(data.publicUrl)
    setYukleniyor(null)
    setMsg('Görsel yüklendi, kaydetmeyi unutma.')
  }


  /* ---------- soru işlemleri ---------- */
  const soruEkle = () => setSorular(s => [...s, {
    id: yeniId(), position: s.length, text: '', hint: null, explanation: null, image_url: null,
    quiz_options: [0, 1, 2, 3].map(i => ({ id: yeniId(), position: i, text: '', is_correct: i === 0, outcome_key: null })),
  }])

  const soruSil = (id: string) => setSorular(s => s.filter(q => q.id !== id))

  const soruGuncelle = (id: string, alan: Partial<QuizQuestion>) =>
    setSorular(s => s.map(q => q.id === id ? { ...q, ...alan } : q))

  const secenekGuncelle = (sid: string, oid: string, alan: Record<string, unknown>) =>
    setSorular(s => s.map(q => q.id !== sid ? q : {
      ...q,
      quiz_options: q.quiz_options.map(o => o.id === oid ? { ...o, ...alan } : o),
    }))

  const dogruSec = (sid: string, oid: string) =>
    setSorular(s => s.map(q => q.id !== sid ? q : {
      ...q, quiz_options: q.quiz_options.map(o => ({ ...o, is_correct: o.id === oid })),
    }))

  /* ---------- sonuç işlemleri ---------- */
  const sonucEkle = () => setSonuclar(x => [...x, {
    id: yeniId(), key: bilgi ? null : `tip${x.length + 1}`,
    min_correct: bilgi ? 0 : null, title: '', description: '', image_url: null, color: T.terra,
  }])
  const sonucSil = (id: string) => setSonuclar(x => x.filter(o => o.id !== id))
  const sonucGuncelle = (id: string, alan: Partial<QuizOutcome>) =>
    setSonuclar(x => x.map(o => o.id === id ? { ...o, ...alan } : o))

  /* ---------- AI ---------- */
  const aiUret = async () => {
    if (!aiYazi) { setErr('Önce bir yazı seç.'); return }
    setAiCalisiyor(true); setErr(''); setMsg('')
    try {
      const r = await fetch('/api/quiz-generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId: aiYazi, type: quiz.type }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error ?? 'AI hatası')
      const uretilen: QuizQuestion[] = (j.questions ?? []).map((q: {
        text: string; hint?: string; explanation?: string
        options: { text: string; is_correct?: boolean; outcome_key?: string }[]
      }, qi: number) => ({
        id: yeniId(), position: sorular.length + qi, text: q.text,
        hint: q.hint ?? null, explanation: q.explanation ?? null, image_url: null,
        quiz_options: q.options.map((o, oi) => ({
          id: yeniId(), position: oi, text: o.text,
          is_correct: !!o.is_correct, outcome_key: o.outcome_key ?? null,
        })),
      }))
      setSorular(s => [...s, ...uretilen])
      setMsg(`${uretilen.length} soru eklendi. Gözden geçirip kaydet.`)
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'AI hatası')
    }
    setAiCalisiyor(false)
  }

  /* ---------- kaydet ---------- */
  const kaydet = async () => {
    setKaydediliyor(true); setErr(''); setMsg('')

    const { error: e1 } = await supabase.from('quizzes').update({
      title: baslik.trim(), slug: slug.trim(), description: aciklama.trim() || null,
      cover_url: kapak.trim() || null, category: kategori || null, published: yayinda,
    }).eq('id', quiz.id)
    if (e1) { setKaydediliyor(false); setErr(e1.message); return }

    // Sorular ve sonuçlar: sil-yeniden yaz (basit ve tutarlı)
    await supabase.from('quiz_questions').delete().eq('quiz_id', quiz.id)
    await supabase.from('quiz_outcomes').delete().eq('quiz_id', quiz.id)

    for (const [qi, q] of sorular.entries()) {
      if (!q.text.trim()) continue
      const { data: yeniSoru, error: e2 } = await supabase.from('quiz_questions').insert({
        quiz_id: quiz.id, position: qi, text: q.text.trim(),
        hint: q.hint || null, explanation: q.explanation || null, image_url: q.image_url || null,
      }).select('id').single()
      if (e2 || !yeniSoru) { setKaydediliyor(false); setErr(e2?.message ?? 'Soru kaydedilemedi'); return }

      const secenekler = q.quiz_options
        .filter(o => o.text.trim())
        .map((o, oi) => ({
          question_id: yeniSoru.id, position: oi, text: o.text.trim(),
          is_correct: bilgi ? o.is_correct : false,
          outcome_key: bilgi ? null : (o.outcome_key || null),
        }))
      if (secenekler.length) {
        const { error: e3 } = await supabase.from('quiz_options').insert(secenekler)
        if (e3) { setKaydediliyor(false); setErr(e3.message); return }
      }
    }

    const sonucKayit = sonuclar.filter(o => o.title.trim()).map(o => ({
      quiz_id: quiz.id, key: bilgi ? null : (o.key || null),
      min_correct: bilgi ? (o.min_correct ?? 0) : null,
      title: o.title.trim(), description: o.description || null,
      image_url: o.image_url || null, color: o.color || T.terra,
    }))
    if (sonucKayit.length) {
      const { error: e4 } = await supabase.from('quiz_outcomes').insert(sonucKayit)
      if (e4) { setKaydediliyor(false); setErr(e4.message); return }
    }

    setKaydediliyor(false)
    setMsg('Kaydedildi.')
    router.refresh()
  }

  const kutu: React.CSSProperties = {
    background: T.panel, border: `1px solid ${T.border}`, borderRadius: 10,
    padding: 16, marginBottom: 16,
  }

  return (
    <AdminShell
      title={bilgi ? 'Bilgi testi' : 'Kişilik testi'}
      action={
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {msg && <span style={{ fontSize: '0.75rem', color: T.green }}>{msg}</span>}
          {err && <span style={{ fontSize: '0.75rem', color: T.danger }}>{err}</span>}
          <a href={`/test/${slug}`} target="_blank" rel="noopener" style={{ ...btn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Önizle ↗</a>
          <button style={{ ...btn, background: yayinda ? T.greenSoft : '#fff', color: yayinda ? T.green : T.text, borderColor: yayinda ? T.green : T.border }}
            onClick={() => setYayinda((v: boolean) => !v)}>
            {yayinda ? '● yayında' : '○ taslak'}
          </button>
          <button style={btnPrimary} onClick={kaydet} disabled={kaydediliyor}>
            {kaydediliyor ? 'kaydediliyor…' : 'Kaydet'}
          </button>
        </div>
      }
    >
      <input
        ref={dosyaRef} type="file" accept="image/*" hidden
        onChange={e => {
          const f = e.target.files?.[0]
          e.target.value = ''
          if (f) dosyaSecildi(f)
        }}
      />

      <div style={{ maxWidth: 780 }}>
        {/* Künye */}
        <div style={kutu}>
          <label style={label}>Test başlığı</label>
          <input style={{ ...input, marginBottom: 12 }} value={baslik} onChange={e => setBaslik(e.target.value)} />

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 12, marginBottom: 12 }}>
            <div>
              <label style={label}>Adres (slug)</label>
              <input style={{ ...input, fontFamily: 'ui-monospace, monospace', fontSize: '0.8rem' }} value={slug} onChange={e => setSlug(e.target.value)} />
            </div>
            <div>
              <label style={label}>Kategori</label>
              <select style={input} value={kategori} onChange={e => setKategori(e.target.value)}>
                <option value="">seçilmedi</option>
                {categories.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>

          <label style={label}>Açıklama</label>
          <textarea style={{ ...input, height: 62, padding: '8px 10px', resize: 'vertical', lineHeight: 1.6, marginBottom: 12 }}
            value={aciklama} onChange={e => setAciklama(e.target.value)} placeholder="Kartlarda ve test girişinde görünür" />

          <label style={label}>Kapak görseli (en fazla {MAKS_MB} MB)</label>
          <GorselAlani
            deger={kapak} ata={setKapak} yukseklik={90}
            yukleniyorMu={yukleniyor === 'kapak'}
            kilitli={yukleniyor !== null}
            onYukle={() => gorselSec('kapak', setKapak)}
          />
        </div>

        {/* AI */}
        <div style={{ ...kutu, background: '#fdfaf6' }}>
          <div style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: 4 }}>Yazıdan soru üret</div>
          <p style={{ fontSize: '0.78rem', color: T.muted, lineHeight: 1.6, margin: '0 0 12px' }}>
            Bir yazı seç, yapay zeka taslak sorular hazırlasın. Sonra elle düzeltirsin.
          </p>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <select style={{ ...input, flex: 1, minWidth: 200 }} value={aiYazi} onChange={e => setAiYazi(e.target.value)}>
              <option value="">yazı seç</option>
              {posts.map(p => <option key={p.id} value={p.id}>{p.title.slice(0, 70)}</option>)}
            </select>
            <button style={btn} onClick={aiUret} disabled={aiCalisiyor || !aiYazi}>
              {aiCalisiyor ? 'üretiliyor…' : 'Soru üret'}
            </button>
          </div>
        </div>

        {/* Sorular */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>Sorular ({sorular.length})</div>
          <button style={btn} onClick={soruEkle}>+ Soru ekle</button>
        </div>

        {sorular.map((q, qi) => (
          <div key={q.id} style={kutu}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <span style={{ fontSize: '0.72rem', color: T.faint, letterSpacing: '0.1em', textTransform: 'uppercase' }}>soru {qi + 1}</span>
              <button onClick={() => soruSil(q.id)} style={{ background: 'none', border: 'none', font: 'inherit', fontSize: '0.75rem', color: T.danger, cursor: 'pointer' }}>Sil</button>
            </div>

            <input style={{ ...input, marginBottom: 8 }} value={q.text} placeholder="Soru metni"
              onChange={e => soruGuncelle(q.id, { text: e.target.value })} />
            <input style={{ ...input, marginBottom: 8, fontSize: '0.82rem' }} value={q.hint ?? ''} placeholder="İpucu (isteğe bağlı)"
              onChange={e => soruGuncelle(q.id, { hint: e.target.value })} />

            <label style={{ ...label, marginTop: 4 }}>Soru görseli (isteğe bağlı, en fazla {MAKS_MB} MB)</label>
            <div style={{ marginBottom: 10 }}>
              <GorselAlani
                deger={q.image_url ?? ''}
                ata={v => soruGuncelle(q.id, { image_url: v })}
                yukseklik={76}
                yukleniyorMu={yukleniyor === `soru-${q.id}`}
                kilitli={yukleniyor !== null}
                onYukle={() => gorselSec(`soru-${q.id}`, v => soruGuncelle(q.id, { image_url: v }))}
              />
            </div>

            <div style={{ display: 'grid', gap: 6, marginBottom: 8 }}>
              {q.quiz_options.map((o, oi) => (
                <div key={o.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  {bilgi ? (
                    <input type="radio" name={`d-${q.id}`} checked={o.is_correct} onChange={() => dogruSec(q.id, o.id)}
                      title="Doğru cevap" style={{ flexShrink: 0 }} />
                  ) : (
                    <input style={{ ...input, width: 78, height: 34, fontSize: '0.75rem', flexShrink: 0 }}
                      value={o.outcome_key ?? ''} placeholder="tip1"
                      onChange={e => secenekGuncelle(q.id, o.id, { outcome_key: e.target.value })} />
                  )}
                  <input style={{ ...input, height: 34 }} value={o.text} placeholder={`${String.fromCharCode(65 + oi)} şıkkı`}
                    onChange={e => secenekGuncelle(q.id, o.id, { text: e.target.value })} />
                </div>
              ))}
            </div>

            {bilgi && (
              <input style={{ ...input, fontSize: '0.82rem' }} value={q.explanation ?? ''}
                placeholder="Cevap açıklaması (doğru/yanlış sonrası görünür)"
                onChange={e => soruGuncelle(q.id, { explanation: e.target.value })} />
            )}
          </div>
        ))}

        {/* Sonuçlar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '22px 0 10px' }}>
          <div>
            <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>Sonuçlar ({sonuclar.length})</div>
            <div style={{ fontSize: '0.75rem', color: T.muted, marginTop: 2 }}>
              {bilgi ? 'Kaç doğrudan itibaren hangi rozet verilsin' : 'Her kişilik tipi ve açıklaması'}
            </div>
          </div>
          <button style={btn} onClick={sonucEkle}>+ Sonuç ekle</button>
        </div>

        {sonuclar.map(o => (
          <div key={o.id} style={kutu}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              {bilgi ? (
                <div style={{ width: 120 }}>
                  <label style={label}>En az doğru</label>
                  <input type="number" min={0} style={{ ...input, height: 34 }} value={o.min_correct ?? 0}
                    onChange={e => sonucGuncelle(o.id, { min_correct: Number(e.target.value) })} />
                </div>
              ) : (
                <div style={{ width: 120 }}>
                  <label style={label}>Tip anahtarı</label>
                  <input style={{ ...input, height: 34, fontFamily: 'ui-monospace, monospace', fontSize: '0.75rem' }}
                    value={o.key ?? ''} onChange={e => sonucGuncelle(o.id, { key: e.target.value })} />
                </div>
              )}
              <div style={{ flex: 1, minWidth: 180 }}>
                <label style={label}>Başlık</label>
                <input style={{ ...input, height: 34 }} value={o.title}
                  placeholder={bilgi ? 'Küratör' : 'Sen bir Monet\'sin'}
                  onChange={e => sonucGuncelle(o.id, { title: e.target.value })} />
              </div>
              <div style={{ width: 74 }}>
                <label style={label}>Renk</label>
                <input type="color" style={{ ...input, height: 34, padding: 3 }} value={o.color ?? T.terra}
                  onChange={e => sonucGuncelle(o.id, { color: e.target.value })} />
              </div>
              <button onClick={() => sonucSil(o.id)} style={{ ...btn, height: 34, color: T.danger }}>Sil</button>
            </div>
            <textarea style={{ ...input, height: 56, padding: '8px 10px', resize: 'vertical', lineHeight: 1.6, marginBottom: 10 }}
              value={o.description ?? ''} placeholder="Sonuç açıklaması"
              onChange={e => sonucGuncelle(o.id, { description: e.target.value })} />

            {!bilgi && (
              <>
                <label style={label}>Sonuç görseli (isteğe bağlı, en fazla {MAKS_MB} MB)</label>
                <GorselAlani
                  deger={o.image_url ?? ''}
                  ata={v => sonucGuncelle(o.id, { image_url: v })}
                  yukseklik={70}
                  yukleniyorMu={yukleniyor === `sonuc-${o.id}`}
                  kilitli={yukleniyor !== null}
                  onYukle={() => gorselSec(`sonuc-${o.id}`, v => sonucGuncelle(o.id, { image_url: v }))}
                />
              </>
            )}
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 18, alignItems: 'center' }}>
          <button style={btnPrimary} onClick={kaydet} disabled={kaydediliyor}>
            {kaydediliyor ? 'kaydediliyor…' : 'Kaydet'}
          </button>
          <Link href="/admin/testler" style={{ ...btn, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
            Listeye dön
          </Link>
          {msg && <span style={{ fontSize: '0.8rem', color: T.green }}>{msg}</span>}
          {err && <span style={{ fontSize: '0.8rem', color: T.danger }}>{err}</span>}
        </div>
      </div>
    </AdminShell>
  )
}
