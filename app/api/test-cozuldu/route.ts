import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/*
  Test çözülme sayacı.

  Eskiden bu sayaç test sayfasının render'ı içinde artırılıyordu ve iki sorunu
  vardı:

  1) quizzes tablosunda yazma yetkisi yalnızca adminde. Yani sayaç gerçek
     ziyaretçiler için hiç çalışmıyordu, sadece ben panelden girince artıyordu.
  2) Her render'da veritabanına yazdığı için sayfa önbelleğe alınamıyordu.
     Testler aramada en iyi iş çıkaran içerik ve en yavaş sayfalardı.

  Şimdi sayaç buradan, servis anahtarıyla artıyor. Sayfa render'ı temiz kaldı,
  test sayfaları önbelleğe alınabiliyor.

  Ayrıca artık "sayfayı açan" değil "teste başlayan" sayılıyor, ölçü olarak da
  doğrusu bu.
*/

export async function POST(req: NextRequest) {
  let slug: string
  try {
    const gelen = await req.json()
    slug = String(gelen?.slug ?? '').trim()
  } catch {
    return NextResponse.json({ error: 'Geçersiz istek.' }, { status: 400 })
  }

  // Sadece slug biçimine uyanları kabul et; gelen veri doğrudan sorguya girmesin
  if (!slug || !/^[a-z0-9-]{1,120}$/.test(slug)) {
    return NextResponse.json({ error: 'Geçersiz test adresi.' }, { status: 400 })
  }

  const servisAnahtari = process.env.SUPABASE_SERVICE_ROLE_KEY
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!servisAnahtari || !url) {
    // Sayaç kritik değil; ortam eksikse sessizce geç, sayfa çalışmaya devam etsin
    return NextResponse.json({ ok: false })
  }

  const supabase = createClient(url, servisAnahtari, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const { data: quiz } = await supabase
    .from('quizzes')
    .select('id, play_count')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (!quiz) return NextResponse.json({ ok: false })

  await supabase
    .from('quizzes')
    .update({ play_count: (quiz.play_count ?? 0) + 1 })
    .eq('id', quiz.id)

  return NextResponse.json({ ok: true })
}
