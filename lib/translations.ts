/*
  Yazı dilleri ve çeviri eşleşmeleri.

  Sitede 52 İngilizce yazı var ama sayfa genelinde dil "tr" olarak tanımlıydı.
  Bunların 41'i Türkçe yazıların birebir çevirisi. Google için bu ikisi ayrı ayrı
  yarışan sayfalar gibi görünüyordu; hreflang ile "bunlar aynı içeriğin iki dili"
  demiş oluyoruz. Böylece Türkçe arayana Türkçesi, İngilizce arayana İngilizcesi
  çıkar ve ikisi birbirinin sıralamasını yemez.

  Çiftler kapak görselinin aynı olmasından tespit edildi.

  Yeni bir çeviri yayınlarsan buraya bir satır eklemen yeterli. Veritabanına
  kolon eklemek yerine burada tutuluyor çünkü liste küçük ve seyrek değişiyor.
*/

// Türkçe slug -> İngilizce slug
export const CEVIRI_CIFTLERI: Record<string, string> = {
  'sanat-ugruna-yolculukla-gecen-bir-hayat-paul-gauguin':
    'a-life-traveled-for-art-paul-gauguin',
  'michelangelonun-davut-heykeli':
    'michelangelos-statue-of-david',
  'karl-johan-da-aksam-edward-munch-1892':
    'evening-in-karl-johan-edward-munch-1892',
  'gustav-klimt-resimlerinin-sembolik-anlamlari':
    'symbolic-meanings-of-gustav-klimt-pictures',
  'sanat-ve-ask':
    'art-and-love',
  'soktares-in-olumu':
    'death-of-socrates',
  'lumiere-kardesler':
    'lumiere-brothers',
  'opera-garnier':
    'opera-garnier-2',
  'renk-bacchus-un-beyazi':
    'white-of-bacchus',
  'beynimizdeki-taklit-ayna-noronlar':
    'imitation-in-our-brains-mirror-neurons',
  'amerikan-gotigi-grant-wood':
    'grant-wood-american-gothic',
  'yeniden-sekillendirilmis-tanrica-kirke':
    'reshaped-goddess-kirke',
  'venus-ve-mars':
    'venus-and-mars',
  'yok-olusun-fotografcisi-francesca-woodman':
    'the-photographer-of-destruction-francesca-woodman',
  'albert-camus-ve-absurdizm':
    'albert-camus-and-absurdism',
  'ayn-rand-ve-objektivizm':
    'ayn-rand-and-objectivism',
  'gorulenin-hissettirdiklerini-resmetmek-izlenimcilik-empresyonizm':
    'what-is-impressionism',
  'medusa-nin-intikami':
    'medusas-revenge',
  'ahlaki-gelisimimiz-heinz-ikilemi':
    'our-moral-progress-heinz-dilemma',
  'iskandinav-mitolojisinin-hilekar-tanrisi-loki':
    'loki-deceitful-god-of-norse-mythology',
  'paul-cezanne-kimdir':
    'who-is-paul-cezanne',
  'manet-in-hayati':
    'who-is-edouard-manet',
  'claude-monet-ve-niluferler':
    'claude-monet-and-water-lilies',
  'michelangelonun-pieta-heykeli':
    'michelangelos-pieta-sculpture',
  'uzun-boyunlu-meryem':
    'madonna-with-the-long-neck-parmigianino',
  'turk-devletcilik-sanati-kutadgu-bilig':
    'the-art-of-turkish-statism-kutadgu-bilig',
  'halkin-rehberi-ozgurluktur-eugene-delacroix':
    'liberty-leading-the-people-eugene-delacroix',
  'michelangelonun-musasi-ve-ziyaretcisi':
    'michelangelos-moses-and-visitor',
  'edgar-degasnin-balerinleri':
    'edgar-degass-ballerinas',
  'erkekligi-olduren-cadi-medea':
    'the-witch-who-killed-masculinity-medea',
  'lilith-efsanesi':
    'the-legend-of-lilith',
  'lacan-ve-arzu':
    'jacques-lacan-and-desire',
  'kral-arthur-efsanesinin-icinde-az-bilinen-bir-dram-shalott-leydisi':
    'a-little-known-drama-in-the-legend-of-king-arthur-the-lady-of-shalott',
  'meryemana-kudusten-efese-yolculuk':
    'virgin-mary-journey-from-jerusalem-to-ephesus',
  'klasik-ve-modern-arasinda-kendi-tarzini-olusturan-ressam-renoir-izlenimcilik-ve-reddi':
    'painter-who-creates-his-own-style-between-classical-and-modern-renoir-impressionism-and-refusal',
  'aya-bakmanin-fotografi-eugene-atgetin-tutulma-sirasinda-hikayesi':
    'photo-of-looking-at-the-moon-the-story-of-eugene-atget-during-eclipse',
  'gozlemlenen-insanlik-hawthorne-etkisi':
    'observed-humanity-the-hawthorne-study',
  'ikarusun-dususu-sirasinda-bir-manzara':
    'landscape-with-the-fall-of-icarus',
  'bernininin-etkileyici-apollon-ve-daphne-tasviri':
    'berninis-impressive-depiction-of-apollo-and-daphne',
  'cagin-otesinde-bir-heykeltiras-camille-claudel':
    'a-sculptor-beyond-the-age-camille-claudel',
  'just-stop-oil-nedir-iklim-aktivistleri-neden-sanat-eserlerine-saldiriyor':
    'what-is-just-stop-oil-why-are-climate-activists-attacking-artworks',
}

// Türkçe karşılığı olmayan, yalnızca İngilizce yayınlanmış yazılar
const TEKIL_INGILIZCE = new Set([
  'edward-hopper-nighthawks-1942',
  'starry-night-a-painful-end',
  'the-birth-of-venus-rainer-maria-rilke',
  'the-table-of-mythology-saturn-devouring-his-son',
  'details-and-story-of-perseus-sculpture',
  'another-day-in-panopticon-and-we-are-not-doing-well-2',
  'what-is-doodle-art',
  'van-goghs-starry-night',
  'candlelight-painter-petrus-van-schendel',
  'frida-kahlo-frieda-and-diego-rivera',
  'art-and-soul',
])

// Ters yön: İngilizce slug -> Türkçe slug
const TERS: Record<string, string> = Object.fromEntries(
  Object.entries(CEVIRI_CIFTLERI).map(([tr, en]) => [en, tr]),
)

export type Dil = 'tr' | 'en'

/** Yazının dili. Bilinen İngilizce listelerinde yoksa Türkçe kabul edilir. */
export function yaziDili(slug: string): Dil {
  return (TERS[slug] || TEKIL_INGILIZCE.has(slug)) ? 'en' : 'tr'
}

/** Yazının diğer dildeki karşılığı, yoksa null. */
export function ceviriSlug(slug: string): { dil: Dil; slug: string } | null {
  if (CEVIRI_CIFTLERI[slug]) return { dil: 'en', slug: CEVIRI_CIFTLERI[slug] }
  if (TERS[slug]) return { dil: 'tr', slug: TERS[slug] }
  return null
}

/**
 * hreflang için dil -> adres eşlemesi.
 * Kural: her iki sayfa da kendisi dahil bütün alternatifleri listelemeli,
 * yoksa Google eşleşmeyi yok sayar.
 */
export function dilAlternatifleri(slug: string): Record<string, string> | undefined {
  const es = ceviriSlug(slug)
  if (!es) return undefined
  const bu = yaziDili(slug)
  const adres = (s: string) => `/yazi/${s}`
  return {
    [bu === 'tr' ? 'tr' : 'en']: adres(slug),
    [es.dil]: adres(es.slug),
    'x-default': adres(bu === 'tr' ? slug : es.slug),
  }
}
