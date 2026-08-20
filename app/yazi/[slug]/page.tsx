// Yazılar sık değişmiyor, 5 dakikada bir yenilenmesi yeterli.
// force-dynamic her ziyarette sıfırdan üretiyordu, sayfa hızını düşürüyordu.
export const revalidate = 300

import { createPublicClient } from '@/lib/supabase/public'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { authorSlug } from '@/lib/authorSlug'
import { cleanContent } from '@/lib/cleanContent'
import AdBanner from '@/components/AdBanner'
import JsonLd from '@/components/JsonLd'
import { coverUrl } from '@/lib/coverUrl'
import { sayfaMetadata, makaleSemasi, kirintiSemasi, kisalt } from '@/lib/seo'
import { yaziDili, ceviriSlug, dilAlternatifleri } from '@/lib/translations'

const labels: Record<string, string> = { yasam: 'yaşam', seyahat: 'seyahat', sanat: 'sanat', sinema: 'sinema', rehber: 'rehber', kitap: 'kitap' }

async function yaziGetir(slug: string) {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const post = await yaziGetir(slug)
  if (!post) return { title: 'Yazı bulunamadı' }

  // Panelde doldurulan SEO alanları öncelikli, boşsa başlık ve özete düşer.
  const aciklama = post.meta_description?.trim()
    || post.excerpt?.trim()
    || kisalt(post.content ?? '', 158)

  return sayfaMetadata({
    baslik: post.meta_title?.trim() || post.title,
    aciklama,
    yol: `/yazi/${post.slug}`,
    gorsel: coverUrl(post),
    tip: 'article',
    yayinTarihi: post.created_at,
    guncellemeTarihi: post.updated_at ?? post.created_at,
    yazarlar: post.author_name ? [post.author_name] : undefined,
    dil: yaziDili(post.slug),
    dilAlternatifleri: dilAlternatifleri(post.slug),
  })
}

export default async function YaziPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await yaziGetir(slug)

  if (!post) notFound()

  const kategoriAdi = labels[post.category ?? ''] ?? post.category ?? ''
  const dil = yaziDili(post.slug)
  const ceviri = ceviriSlug(post.slug)

  return (
    // lang niteliği yazının kendi dilini söyler. Kök layout'ta site geneli
    // "tr" tanımlı; İngilizce yazılarda burada düzeltiliyor.
    <article lang={dil} style={{ minHeight: '100vh' }}>
      <JsonLd veri={[
        makaleSemasi({
          baslik: post.meta_title?.trim() || post.title,
          aciklama: post.meta_description?.trim() || post.excerpt || '',
          yol: `/yazi/${post.slug}`,
          gorsel: coverUrl(post),
          yazar: post.author_name,
          yayinTarihi: post.created_at,
          guncellemeTarihi: post.updated_at ?? post.created_at,
          kategori: kategoriAdi,
          dil,
        }),
        kirintiSemasi([
          { ad: 'The Cultiva', yol: '/' },
          ...(post.category ? [{ ad: kategoriAdi, yol: `/${post.category}` }] : []),
          { ad: post.title, yol: `/yazi/${post.slug}` },
        ]),
      ]} />

      {/* Cover */}
      <div style={{
        height: '55vh', minHeight: 360,
        background: 'linear-gradient(135deg, #d4c0a0, #a08060)',
        backgroundImage: `url(${coverUrl(post)})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(245,240,232,0.97) 100%)',
        }} />
        {/* Kategori badge */}
        <div style={{
          position: 'absolute', top: '2rem', left: '2.5rem',
          fontSize: '0.65rem', letterSpacing: '0.25em', textTransform: 'uppercase',
          color: 'var(--terra)', background: 'rgba(245,240,232,0.9)',
          padding: '0.3rem 0.8rem', borderRadius: 50,
        }}>
          <Link href={`/${post.category}`}>{labels[post.category]}</Link>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 720, margin: '-4rem auto 0', padding: '0 2.5rem 6rem', position: 'relative', zIndex: 2 }}>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 400, lineHeight: 1.15, letterSpacing: '-0.01em',
          marginBottom: '1.2rem',
        }}>
          {post.title}
        </h1>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2.5rem', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
          {post.author_name && (
            <>
              <Link href={`/yazar/${authorSlug(post.author_name)}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  background: 'var(--terra)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.72rem', color: 'white', fontWeight: 600, flexShrink: 0,
                }}>
                  {post.author_name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.8rem', color: 'var(--text)', fontWeight: 500, borderBottom: '1px solid rgba(139,38,53,0.3)' }}>
                  {post.author_name}
                </span>
              </Link>
              <span style={{ color: 'var(--border)' }}>·</span>
            </>
          )}
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
            {new Date(post.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
          </span>
          <span style={{ color: 'var(--border)' }}>·</span>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{post.read_time} dk okuma</span>
        </div>

        {post.content ? (
          <div
            className="post-content"
            dangerouslySetInnerHTML={{ __html: cleanContent(post.content) }}
          />
        ) : (
          <p style={{ fontSize: '1.05rem', lineHeight: 1.85, color: 'var(--text)', fontStyle: 'italic' }}>
            {post.excerpt}
          </p>
        )}

        {/* Yazı sonu reklamı */}
        <AdBanner
          slot="0987654321"
          format="fluid"
          style={{ margin: '3rem 0', padding: '0.5rem 0' }}
        />

        {/* Diğer dildeki sürüm */}
        {ceviri && (
          <div style={{ marginTop: '2.5rem', padding: '1rem 1.2rem', background: 'rgba(181,115,74,0.07)', borderRadius: 10, border: '1px solid var(--border)' }}>
            <Link
              href={`/yazi/${ceviri.slug}`}
              hrefLang={ceviri.dil}
              style={{ fontSize: '0.85rem', color: 'var(--terra)', borderBottom: '1px solid rgba(181,115,74,0.35)' }}
            >
              {ceviri.dil === 'en' ? 'Read this article in English →' : 'Bu yazıyı Türkçe oku →'}
            </Link>
          </div>
        )}

        {/* Back link */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <Link href={`/${post.category}`} style={{
            fontSize: '0.75rem', letterSpacing: '0.1em', textTransform: 'uppercase',
            color: 'var(--terra)', borderBottom: '1px solid rgba(181,115,74,0.3)',
          }}>
            ← {labels[post.category]} yazılarına dön
          </Link>
        </div>
      </div>
    </article>
  )
}
