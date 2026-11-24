import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/*
  Panelde bir yazı ya da test kaydedildiğinde ilgili sayfaların önbelleğini
  hemen temizler. Bu olmadan yayına alınan bir yazı, daha önce "bulunamadı"
  olarak önbelleğe girmişse birkaç yenileme döngüsü boyunca 404 kalabiliyor
  (sayfa önbelleği + veri önbelleği, ikisi de 300 sn).

  Gövde: { yollar: string[] }  örn. ["/yazi/ciglik-tablosunun-anlami", "/sanat"]
  Ana sayfa, testler sayfası ve sitemap her çağrıda ayrıca temizlenir.
  Yalnızca admin oturumuyla çalışır.
*/
export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })
  const { data: profil } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profil?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

  let yollar: string[] = []
  try {
    const g = await req.json()
    yollar = Array.isArray(g?.yollar) ? g.yollar : []
  } catch { /* boş gövde: sadece genel sayfalar */ }

  const temiz = [...new Set([
    ...yollar.filter(y => typeof y === 'string' && y.startsWith('/') && y.length < 300),
    '/', '/testler', '/en', '/en/quizzes', '/sitemap.xml',
  ])]
  for (const y of temiz) revalidatePath(y)

  return NextResponse.json({ ok: true, yollar: temiz })
}
