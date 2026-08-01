import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  try {
    // Sadece admin kullanabilsin
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Giriş gerekli.' }, { status: 401 })
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Yetkisiz.' }, { status: 403 })

    const { postId, type } = await req.json()
    const { data: post } = await supabase
      .from('posts').select('title,excerpt,content').eq('id', postId).single()
    if (!post) return NextResponse.json({ error: 'Yazı bulunamadı.' }, { status: 404 })

    const metin = (post.content ?? '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 6000)

    const bilgi = type === 'bilgi'
    const prompt = bilgi
      ? `Aşağıdaki yazıdan 5 adet çoktan seçmeli bilgi sorusu üret.

Kurallar:
- Sorular Türkçe, eğlenceli ve merak uyandırıcı olsun. Kuru ansiklopedi dili kullanma.
- Her sorunun 4 şıkkı olsun, tam olarak biri doğru.
- Yanlış şıklar da makul görünsün, saçma olmasın.
- "hint" alanı kısa bir ipucu cümlesi olsun.
- "explanation" doğru cevabın neden doğru olduğunu 1-2 cümlede anlatsın.
- Cevabı doğrudan soruda ele verme.

Sadece şu JSON'u döndür, başka hiçbir şey yazma:
{"questions":[{"text":"...","hint":"...","explanation":"...","options":[{"text":"...","is_correct":true},{"text":"...","is_correct":false},{"text":"...","is_correct":false},{"text":"...","is_correct":false}]}]}

Yazı başlığı: ${post.title}
Yazı: ${metin}`
      : `Aşağıdaki yazının temasından 5 soruluk eğlenceli bir kişilik testi üret.

Kurallar:
- Türkçe, samimi ve esprili bir dil kullan.
- 4 kişilik tipi olsun: tip1, tip2, tip3, tip4.
- Her sorunun 4 şıkkı olsun, her şık bir tipe işaret etsin (outcome_key).
- Doğru cevap yok, her şık bir kişilik yönünü yansıtsın.

Sadece şu JSON'u döndür, başka hiçbir şey yazma:
{"questions":[{"text":"...","hint":"","options":[{"text":"...","outcome_key":"tip1"},{"text":"...","outcome_key":"tip2"},{"text":"...","outcome_key":"tip3"},{"text":"...","outcome_key":"tip4"}]}]}

Yazı başlığı: ${post.title}
Yazı: ${metin}`

    const cevap = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const ham = cevap.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map(b => b.text).join('')

    const json = ham.slice(ham.indexOf('{'), ham.lastIndexOf('}') + 1)
    const cozum = JSON.parse(json)

    return NextResponse.json({ questions: cozum.questions ?? [] })
  } catch (e) {
    console.error('quiz-generate error:', e)
    const mesaj = e instanceof Error && e.message.includes('credit balance')
      ? 'Claude Console bakiyesi yetersiz.'
      : 'Sorular üretilemedi.'
    return NextResponse.json({ error: mesaj }, { status: 500 })
  }
}
