import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

const SUPABASE_URL = "https://ksprrlcgdiyrjovbgqda.supabase.co"
const SUPABASE_KEY = process.env.SUPABASE_SECRET_KEY || ""

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
const posts = JSON.parse(readFileSync('./wordpress_posts.json', 'utf-8'))

console.log(`Toplam ${posts.length} yazı yüklenecek...`)

const batchSize = 50
let success = 0

for (let i = 0; i < posts.length; i += batchSize) {
  const batch = posts.slice(i, i + batchSize)
  const { error } = await supabase.from('posts').insert(batch)
  if (error) {
    console.error(`Hata (batch ${i}):`, error.message)
    process.exit(1)
  }
  success += batch.length
  console.log(`  ✓ ${Math.min(i + batchSize, posts.length)}/${posts.length}`)
}

console.log(`\nTamamlandı! ${success} yazı yüklendi.`)
