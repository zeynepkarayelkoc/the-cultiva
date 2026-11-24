import { createPublicClient } from '@/lib/supabase/public'
import type { Quiz } from '@/lib/quiz'
import type { Dil } from '@/lib/i18n'

// Test sayfaları (/test/<slug> ve /en/quiz/<slug>) aynı veriyi kullanıyor.

export async function testGetir(slug: string) {
  const supabase = createPublicClient(300)
  const { data } = await supabase
    .from('quizzes')
    .select('*, quiz_questions(*, quiz_options(*)), quiz_outcomes(*)')
    .eq('slug', slug)
    .single()
  return data as Quiz | null
}

/** Aynı dildeki diğer testler; Türkçe sayfada İngilizce test önerilmesin. */
export async function digerTestleriGetir(haricSlug: string, dil: Dil) {
  const supabase = createPublicClient(300)
  const { data } = await supabase
    .from('quizzes')
    .select('slug, title, type')
    .eq('published', true)
    .eq('lang', dil)
    .neq('slug', haricSlug)
    .order('play_count', { ascending: false })
    .limit(8)
  return data ?? []
}

/** Yayındaki testler, dile göre. */
export async function testListesi(dil: Dil) {
  const supabase = createPublicClient(300)
  const { data } = await supabase
    .from('quizzes')
    .select('id,slug,title,description,cover_url,type,category,play_count')
    .eq('published', true)
    .eq('lang', dil)
    .order('created_at', { ascending: false })
  return data ?? []
}
