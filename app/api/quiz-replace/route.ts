import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/*
  Var olan bir testin sorularını ve sonuçlarını yenisiyle değiştirir.

  Neden var: Google'da sıralanan bir testi (ör. "Ne kadar İzmirlisin?") daha iyi
  sorularla yenilemek istiyoruz ama adresi, başlığı ve çözülme sayısını
  kaybetmeden. /api/quiz-import yeni kayıt açar; bu uç mevcut kaydı korur.

  - slug, id, play_count, oluşturulma tarihi değişmez.
  - title / description gönderilirse güncellenir, gönderilmezse dokunulmaz.
  - Yalnızca admin oturumuyla çalışır.

  Gövde: { slug, title?, description?, questions: [...], outcomes: [...] }
  Soru/sonuç biçimi /api/quiz-import ile aynı.
*/

type Secenek = { text: string; is_correct?: boolean; outcome_key?: string | null }
type Soru = { text: string; hint?: string | null; explanation?: string | null; image_url?: string | null; options: Secenek[] }
type Sonuc = { key?: string | null; min_correct?: number | null; title: string; description?: string | null; color?: string | null; image_url?: string | null }
type Gelen = { slug: string; title?: string; description?: string | null; questions: Soru[]; outcomes?: Sonuc[] }

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })
  const { data: profil } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profil?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  let g: Gelen
  try { g = await req.json() } catch { return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 }) }

  const { data: quiz } = await supabase.from('quizzes').select('id, slug, type, lang').eq('slug', String(g.slug ?? '').trim()).maybeSingle()
  if (!quiz) return NextResponse.json({ error: `Test bulunamadı: ${g.slug}` }, { status: 404 })
  const bilgi = quiz.type !== 'kisilik'

  // Doğrulama: bir şey silmeden önce yeni içeriğin geçerli olduğundan emin ol.
  if (!Array.isArray(g.questions) || g.questions.length === 0) {
    return NextResponse.json({ error: 'En az bir soru gerekli.' }, { status: 400 })
  }
  for (const [i, s] of g.questions.entries()) {
    if (!s.text?.trim() || !Array.isArray(s.options) || s.options.length < 2) {
      return NextResponse.json({ error: `${i + 1}. soru eksik.` }, { status: 400 })
    }
    if (bilgi && s.options.filter(o => o.is_correct).length !== 1) {
      return NextResponse.json({ error: `${i + 1}. soruda tam bir doğru şık olmalı.` }, { status: 400 })
    }
    if (!bilgi && s.options.some(o => !o.outcome_key)) {
      return NextResponse.json({ error: `${i + 1}. soruda her şıkka outcome_key verilmeli.` }, { status: 400 })
    }
  }
  const sonuclar = g.outcomes ?? []

  // Künye
  const kunye: Record<string, string | null> = {}
  if (g.title?.trim()) kunye.title = g.title.trim()
  if (g.description !== undefined) kunye.description = g.description?.trim() || null
  if (Object.keys(kunye).length) {
    const { error } = await supabase.from('quizzes').update(kunye).eq('id', quiz.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Sil ve yeniden yaz (TestEditor'ün kaydetme mantığıyla aynı)
  await supabase.from('quiz_questions').delete().eq('quiz_id', quiz.id)
  if (sonuclar.length) await supabase.from('quiz_outcomes').delete().eq('quiz_id', quiz.id)

  for (const [qi, s] of g.questions.entries()) {
    const { data: soru, error: e2 } = await supabase.from('quiz_questions').insert({
      quiz_id: quiz.id, position: qi, text: s.text.trim(),
      hint: s.hint?.trim() || null, explanation: s.explanation?.trim() || null,
      image_url: s.image_url?.trim() || null,
    }).select('id').single()
    if (e2 || !soru) return NextResponse.json({ error: e2?.message ?? 'Soru kaydedilemedi.' }, { status: 500 })
    const { error: e3 } = await supabase.from('quiz_options').insert(
      s.options.map((o, oi) => ({
        question_id: soru.id, position: oi, text: o.text.trim(),
        is_correct: bilgi ? !!o.is_correct : false,
        outcome_key: bilgi ? null : (o.outcome_key ?? null),
      })),
    )
    if (e3) return NextResponse.json({ error: e3.message }, { status: 500 })
  }

  if (sonuclar.length) {
    const { error: e4 } = await supabase.from('quiz_outcomes').insert(
      sonuclar.map(o => ({
        quiz_id: quiz.id, key: bilgi ? null : (o.key || null),
        min_correct: bilgi ? (o.min_correct ?? 0) : null,
        title: o.title.trim(), description: o.description?.trim() || null,
        color: o.color || null, image_url: o.image_url || null,
      })),
    )
    if (e4) return NextResponse.json({ error: e4.message }, { status: 500 })
  }

  const yol = quiz.lang === 'en' ? `/en/quiz/${quiz.slug}` : `/test/${quiz.slug}`
  revalidatePath(yol)
  return NextResponse.json({ ok: true, slug: quiz.slug, soru: g.questions.length, sonuc: sonuclar.length, url: yol })
}
