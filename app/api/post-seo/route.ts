import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/*
  Mevcut bir yazının SEO alanlarını günceller ve isteğe bağlı olarak içeriğin
  SONUNA yeni bir bölüm ekler (tablonun anlamı, sık sorulanlar gibi).

  Bilerek sınırlı tutuldu:
  - Mevcut içerik asla değiştirilmez ya da silinmez, yalnızca sonuna eklenir.
  - Aynı bölüm iki kez eklenmesin diye işaret yorumu (<!-- seo-ek:anahtar -->)
    kontrol edilir; tekrar çağrılırsa ekleme atlanır.
  - Slug değiştirilmez. Adres değişirse Google'daki birikim kaybolur.

  Yalnızca admin oturumuyla çalışır.
*/

type Gelen = {
  slug: string
  meta_title?: string | null
  meta_description?: string | null
  ek_anahtar?: string          // eklenen bölümün kimliği, tekrar eklemeyi önler
  ek_html?: string             // içeriğin sonuna eklenecek HTML
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })
  const { data: profil } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profil?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  let g: Gelen
  try { g = await req.json() } catch { return NextResponse.json({ error: 'Geçersiz JSON.' }, { status: 400 }) }

  const slug = String(g.slug ?? '').trim()
  if (!slug) return NextResponse.json({ error: 'slug gerekli.' }, { status: 400 })

  const { data: yazi, error: e1 } = await supabase
    .from('posts').select('id, content').eq('slug', slug).maybeSingle()
  if (e1 || !yazi) return NextResponse.json({ error: `Yazı bulunamadı: ${slug}` }, { status: 404 })

  const guncelle: Record<string, string | null> = {}
  if (g.meta_title !== undefined) guncelle.meta_title = g.meta_title?.trim() || null
  if (g.meta_description !== undefined) guncelle.meta_description = g.meta_description?.trim() || null

  let eklendi = false
  if (g.ek_html && g.ek_anahtar) {
    const isaret = `<!-- seo-ek:${g.ek_anahtar} -->`
    const mevcut = yazi.content ?? ''
    if (!mevcut.includes(isaret)) {
      guncelle.content = `${mevcut}\n${isaret}\n${g.ek_html.trim()}`
      eklendi = true
    }
  }

  if (Object.keys(guncelle).length === 0) {
    return NextResponse.json({ ok: true, degisiklik: false })
  }

  const { error: e2 } = await supabase.from('posts').update(guncelle).eq('id', yazi.id)
  if (e2) return NextResponse.json({ error: e2.message }, { status: 500 })

  return NextResponse.json({ ok: true, degisiklik: true, icerikEklendi: eklendi })
}
