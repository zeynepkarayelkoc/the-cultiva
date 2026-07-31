// .env.local'dan key'leri otomatik okur, ayrıca env var girmen gerekmez
// Çalıştır: node fix_content.mjs

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// .env.local'ı oku
const envFile = readFileSync('./.env.local', 'utf-8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l.includes('='))
    .map(l => [l.split('=')[0].trim(), l.split('=').slice(1).join('=').trim()])
)

const SUPABASE_URL  = env.NEXT_PUBLIC_SUPABASE_URL
const ANON_KEY      = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
// Service role key varsa kullan, yoksa anon key dene
const SERVICE_KEY   = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SECRET_KEY || ANON_KEY

console.log("🔑 Kullanılan key tipi:", SERVICE_KEY === ANON_KEY ? "anon (okuma)" : "service_role ✓")

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

// Bağlantı testi
const { data: testRow, error: testErr } = await supabase
  .from('posts')
  .select('id, slug')
  .limit(1)
  .single()

if (testErr) {
  console.error("❌ Bağlantı hatası:", testErr.message)
  process.exit(1)
}
console.log("✓ Bağlandı:", testRow.slug, "\n")

// İçerikleri yükle
const posts = JSON.parse(readFileSync('./wordpress_posts.json', 'utf-8'))
console.log(`📚 ${posts.length} yazı güncelleniyor...\n`)

let updated = 0, skipped = 0, errored = 0

for (const post of posts) {
  if (!post.content) { skipped++; continue }

  const { error } = await supabase
    .from('posts')
    .update({ content: post.content })
    .eq('slug', post.slug)

  if (error) {
    if (errored === 0) console.error(`İlk hata (${post.slug}): ${error.message}`)
    errored++
    // RLS hatası gelirse dur ve SQL yöntemini öner
    if (error.message.includes('policy') || error.message.includes('RLS') || errored >= 5) {
      console.error(`\n⚠️  ${errored} hata — muhtemelen RLS engeli.`)
      console.error("💡 Çözüm: Supabase → Settings → API → service_role key'i kopyala,")
      console.error("   .env.local'a şu satırı ekle:")
      console.error("   SUPABASE_SERVICE_ROLE_KEY=buraya_yaz")
      console.error("   Sonra tekrar çalıştır: node fix_content.mjs")
      break
    }
  } else {
    updated++
    if (updated % 50 === 0 || updated === 1) console.log(`  ✓ ${updated}/${posts.length}`)
  }
}

console.log(`\n${errored === 0 ? '✅' : '⚠️ '} Bitti — güncellenen: ${updated} | atlatılan: ${skipped} | hata: ${errored}`)

if (errored > 0 && updated === 0) {
  console.log("\n📋 Alternatif: Supabase SQL Editor'da fix_content_1.sql ~ fix_content_10.sql dosyalarını çalıştır.")
}
