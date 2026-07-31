import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const PROMPTS: Record<string, (data: { title: string; content: string; excerpt: string }) => string> = {
  fix: ({ content }) =>
    `Aşağıdaki Türkçe blog yazısını yazım ve dilbilgisi açısından düzelt. HTML tagları koru, sadece metin içeriğini düzelt. Yanıt olarak sadece düzeltilmiş HTML'yi ver, başka hiçbir şey yazma.\n\n${content}`,

  excerpt: ({ title, content }) =>
    `Bu blog yazısı için okuyucuyu çekecek, 2-3 cümlelik Türkçe bir özet yaz. Sadece özeti yaz, tırnak işareti veya başka açıklama ekleme.\n\nBaşlık: ${title}\n\nİçerik:\n${content.replace(/<[^>]+>/g, ' ').substring(0, 1000)}`,

  title: ({ title, content }) =>
    `Bu blog yazısı için 3 farklı Türkçe başlık öner. Her başlığı ayrı satıra yaz, numara veya tire ekleme.\n\nMevcut başlık: ${title}\n\nİçerik özeti:\n${content.replace(/<[^>]+>/g, ' ').substring(0, 500)}`,
}

export async function POST(req: NextRequest) {
  try {
    const { action, title = '', content = '', excerpt = '' } = await req.json()

    const promptFn = PROMPTS[action]
    if (!promptFn) return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 })

    const prompt = promptFn({ title, content, excerpt })

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    })

    const result = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ result })
  } catch (err: unknown) {
    console.error('AI assist error:', err)
    return NextResponse.json({ error: 'AI hatası oluştu.' }, { status: 500 })
  }
}
