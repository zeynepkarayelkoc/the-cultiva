import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { authorSlug } from '@/lib/authorSlug'

// Hazır bir testi tek istekte siteye yükler.
// generate-test skill'i bunu kullanır: sorular, şıklar ve sonuçlar
// tek gövdede gelir, burada doğrulanıp kaydedilir.

type GelenSecenek = { text: string; is_correct?: boolean; outcome_key?: string | null }
type GelenSoru = {
  text: string; hint?: string | null; explanation?: string | null
  image_url?: string | null; options: GelenSecenek[]
}
type GelenSonuc = {
  key?: string | null; min_correct?: number | null
  title: string; description?: string | null; color?: string | null; image_url?: string | null
}
type Gelen = {
  title: string; description?: string | null; type?: 'bilgi' | 'kisilik'
  category?: string | null; cover_url?: string | null; published?: boolean
  questions: GelenSoru[]; outcomes?: GelenSonuc[]
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  let g: Gelen
  try { g = await req.json() } catch { return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 }) }

  const tip = g.type === 'kisilik' ? 'kisilik' : 'bilgi'

  /* ---------- doğrulama ---------- */
  if (!g.title?.trim()) return NextResponse.json({ error: 'Başlık gerekli.' }, { status: 400 })
  if (!Array.isArray(g.questions) || g.questions.length === 0) {
    return NextResponse.json({ error: 'En az bir soru gerekli.' }, { status: 400 })
  }
  for (const [i, s] of g.questions.entries()) {
    if (!s.text?.trim()) return NextResponse.json({ error: `${i + 1}. sorunun metni boş.` }, { status: 400 })
    if (!Array.isArray(s.options) || s.options.length < 2) {
      return NextResponse.json({ error: `${i + 1}. soruda en az iki şık olmalı.` }, { status: 400 })
    }
    if (tip === 'bilgi') {
      const dogruSayisi = s.options.filter(o => o.is_correct).length
      if (dogruSayisi !== 1) {
        return NextResponse.json(
          { error: `${i + 1}. soruda tam olarak bir doğru şık olmalı (${dogruSayisi} bulundu).` },
          { status: 400 },
        )
      }
    } else if (s.options.some(o => !o.outcome_key)) {
      return NextResponse.json({ error: `${i + 1}. soruda her şıkka outcome_key verilmeli.` }, { status: 400 })
    }
  }

  const sonuclar = g.outcomes ?? []
  if (tip === 'kisilik') {
    const anahtarlar = new Set(sonuclar.map(o => o.key).filter(Boolean))
    const kullanilan = new Set(g.questions.flatMap(s => s.options.map(o => o.outcome_key)).filter(Boolean))
    const eksik = [...kullanilan].filter(k => !anahtarlar.has(k as string))
    if (eksik.length) {
      return NextResponse.json(
        { error: `Şıklarda geçen ama tanımı olmayan tip(ler): ${eksik.join(', ')}` },
        { status: 400 },
      )
    }
  }

  // Kategori gerçekten var mı (yoksa yabancı anahtar hatası verir)
  let kategori: string | null = g.category?.trim() || null
  if (kategori) {
    const { data: kat } = await supabase.from('categories').select('slug').eq('slug', kategori).maybeSingle()
    if (!kat) kategori = null
  }

  /* ---------- benzersiz slug ---------- */
  const temel = authorSlug(g.title) || 'test'
  let slug = temel
  for (let n = 2; n < 40; n++) {
    const { data: varMi } = await supabase.from('quizzes').select('id').eq('slug', slug).maybeSingle()
    if (!varMi) break
    slug = `${temel}-${n}`
  }

  /* ---------- kayıt ---------- */
  const { data: quiz, error: e1 } = await supabase.from('quizzes').insert({
    slug,
    title: g.title.trim(),
    description: g.description?.trim() || null,
    cover_url: g.cover_url?.trim() || null,
    type: tip,
    category: kategori,
    published: g.published !== false,
  }).select('id,slug').single()
  if (e1 || !quiz) return NextResponse.json({ error: e1?.message ?? 'Test oluşturulamadı.' }, { status: 500 })

  // Hata olursa yarım kayıt bırakmamak için testi geri sil
  const geriAl = async (mesaj: string) => {
    await supabase.from('quizzes').delete().eq('id', quiz.id)
    return NextResponse.json({ error: mesaj }, { status: 500 })
  }

  for (const [qi, s] of g.questions.entries()) {
    const { data: soru, error: e2 } = await supabase.from('quiz_questions').insert({
      quiz_id: quiz.id, position: qi, text: s.text.trim(),
      hint: s.hint?.trim() || null,
      explanation: s.explanation?.trim() || null,
      image_url: s.image_url?.trim() || null,
    }).select('id').single()
    if (e2 || !soru) return geriAl(e2?.message ?? 'Soru kaydedilemedi.')

    const { error: e3 } = await supabase.from('quiz_options').insert(
      s.options.map((o, oi) => ({
        question_id: soru.id, position: oi, text: o.text.trim(),
        is_correct: tip === 'bilgi' ? !!o.is_correct : false,
        outcome_key: tip === 'kisilik' ? (o.outcome_key ?? null) : null,
      })),
    )
    if (e3) return geriAl(e3.message)
  }

  if (sonuclar.length) {
    const { error: e4 } = await supabase.from('quiz_outcomes').insert(
      sonuclar.map(o => ({
        quiz_id: quiz.id,
        key: tip === 'kisilik' ? (o.key ?? null) : null,
        min_correct: tip === 'bilgi' ? (o.min_correct ?? 0) : null,
        title: o.title.trim(),
        description: o.description?.trim() || null,
        color: o.color?.trim() || '#b5734a',
        image_url: o.image_url?.trim() || null,
      })),
    )
    if (e4) return geriAl(e4.message)
  }

  return NextResponse.json({
    ok: true,
    slug: quiz.slug,
    url: `/test/${quiz.slug}`,
    soru: g.questions.length,
    sonuc: sonuclar.length,
  })
}
