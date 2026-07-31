import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Bu route Vercel Cron tarafından her 5 dakikada bir çağrılır
// vercel.json'da tanımlanmış: "crons": [{"path": "/api/publish-scheduled", "schedule": "*/5 * * * *"}]

export async function GET(req: NextRequest) {
  // Cron secret doğrulama (Vercel otomatik ekler)
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // service role key — sadece server tarafında kullan
  )

  const now = new Date().toISOString()

  // scheduled_at geçmiş veya şimdiki zamanda olan, henüz yayınlanmamış yazıları bul
  const { data: posts, error } = await supabase
    .from('posts')
    .select('id, title, scheduled_at')
    .eq('published', false)
    .not('scheduled_at', 'is', null)
    .lte('scheduled_at', now)

  if (error) {
    console.error('Scheduled publish query error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!posts || posts.length === 0) {
    return NextResponse.json({ published: 0, message: 'Yayınlanacak yazı yok' })
  }

  // Yazıları yayınla
  const ids = posts.map(p => p.id)
  const { error: updateError } = await supabase
    .from('posts')
    .update({ published: true, scheduled_at: null })
    .in('id', ids)

  if (updateError) {
    console.error('Scheduled publish update error:', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  console.log(`Scheduled publish: ${posts.length} yazı yayınlandı`, posts.map(p => p.title))
  return NextResponse.json({ published: posts.length, titles: posts.map(p => p.title) })
}
