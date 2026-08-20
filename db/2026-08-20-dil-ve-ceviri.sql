-- The Cultiva: yazı dili ve çeviri eşleştirmesi
-- 20 Ağustos 2026
--
-- Neden: sitede 52 İngilizce yazı var ama site genelinde lang="tr" tanımlıydı.
-- Bunların 41'i Türkçe yazıların çevirisi. Google bunları ya kopya sanıyor
-- ya da yanlış dildeki kullanıcıya gösteriyordu.
--
-- Çeviri çiftleri aynı kapak görselini paylaşmalarından tespit edildi.

alter table posts add column if not exists lang text not null default 'tr';
alter table posts add column if not exists translation_of uuid references posts(id) on delete set null;
create index if not exists posts_translation_of_idx on posts(translation_of);

-- Dil kısıtı: şimdilik yalnızca tr ve en
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'posts_lang_check') then
    alter table posts add constraint posts_lang_check check (lang in ('tr','en'));
  end if;
end $$;

-- İngilizce yazıları işaretle (52 kayıt)
update posts set lang = 'en' where slug in (
  'white-of-bacchus','symbolic-meanings-of-gustav-klimt-pictures','death-of-socrates',
  'edward-hopper-nighthawks-1942','starry-night-a-painful-end','lumiere-brothers',
  'the-birth-of-venus-rainer-maria-rilke','art-and-love','opera-garnier-2',
  'the-table-of-mythology-saturn-devouring-his-son','grant-wood-american-gothic',
  'madonna-with-the-long-neck-parmigianino','medusas-revenge','claude-monet-and-water-lilies',
  'who-is-paul-cezanne','what-is-impressionism','details-and-story-of-perseus-sculpture',
  'who-is-edouard-manet','liberty-leading-the-people-eugene-delacroix','ayn-rand-and-objectivism',
  'albert-camus-and-absurdism','michelangelos-pieta-sculpture',
  'the-photographer-of-destruction-francesca-woodman','michelangelos-statue-of-david',
  'the-legend-of-lilith','the-witch-who-killed-masculinity-medea','jacques-lacan-and-desire',
  'michelangelos-moses-and-visitor',
  'a-little-known-drama-in-the-legend-of-king-arthur-the-lady-of-shalott',
  'virgin-mary-journey-from-jerusalem-to-ephesus','our-moral-progress-heinz-dilemma',
  'reshaped-goddess-kirke',
  'painter-who-creates-his-own-style-between-classical-and-modern-renoir-impressionism-and-refusal',
  'another-day-in-panopticon-and-we-are-not-doing-well-2','loki-deceitful-god-of-norse-mythology',
  'observed-humanity-the-hawthorne-study',
  'photo-of-looking-at-the-moon-the-story-of-eugene-atget-during-eclipse',
  'a-life-traveled-for-art-paul-gauguin','what-is-doodle-art','landscape-with-the-fall-of-icarus',
  'van-goghs-starry-night','berninis-impressive-depiction-of-apollo-and-daphne',
  'a-sculptor-beyond-the-age-camille-claudel',
  'what-is-just-stop-oil-why-are-climate-activists-attacking-artworks',
  'evening-in-karl-johan-edward-munch-1892','candlelight-painter-petrus-van-schendel',
  'frida-kahlo-frieda-and-diego-rivera','venus-and-mars',
  'the-art-of-turkish-statism-kutadgu-bilig','edgar-degass-ballerinas',
  'imitation-in-our-brains-mirror-neurons','art-and-soul'
);

-- Çeviri çiftleri: İngilizce yazıyı Türkçe aslına bağla (41 çift)
with ciftler(tr_slug, en_slug) as (values
  ('sanat-ugruna-yolculukla-gecen-bir-hayat-paul-gauguin','a-life-traveled-for-art-paul-gauguin'),
  ('michelangelonun-davut-heykeli','michelangelos-statue-of-david'),
  ('karl-johan-da-aksam-edward-munch-1892','evening-in-karl-johan-edward-munch-1892'),
  ('gustav-klimt-resimlerinin-sembolik-anlamlari','symbolic-meanings-of-gustav-klimt-pictures'),
  ('sanat-ve-ask','art-and-love'),
  ('soktares-in-olumu','death-of-socrates'),
  ('lumiere-kardesler','lumiere-brothers'),
  ('opera-garnier','opera-garnier-2'),
  ('renk-bacchus-un-beyazi','white-of-bacchus'),
  ('beynimizdeki-taklit-ayna-noronlar','imitation-in-our-brains-mirror-neurons'),
  ('amerikan-gotigi-grant-wood','grant-wood-american-gothic'),
  ('yeniden-sekillendirilmis-tanrica-kirke','reshaped-goddess-kirke'),
  ('venus-ve-mars','venus-and-mars'),
  ('yok-olusun-fotografcisi-francesca-woodman','the-photographer-of-destruction-francesca-woodman'),
  ('albert-camus-ve-absurdizm','albert-camus-and-absurdism'),
  ('ayn-rand-ve-objektivizm','ayn-rand-and-objectivism'),
  ('gorulenin-hissettirdiklerini-resmetmek-izlenimcilik-empresyonizm','what-is-impressionism'),
  ('medusa-nin-intikami','medusas-revenge'),
  ('ahlaki-gelisimimiz-heinz-ikilemi','our-moral-progress-heinz-dilemma'),
  ('iskandinav-mitolojisinin-hilekar-tanrisi-loki','loki-deceitful-god-of-norse-mythology'),
  ('paul-cezanne-kimdir','who-is-paul-cezanne'),
  ('manet-in-hayati','who-is-edouard-manet'),
  ('claude-monet-ve-niluferler','claude-monet-and-water-lilies'),
  ('michelangelonun-pieta-heykeli','michelangelos-pieta-sculpture'),
  ('uzun-boyunlu-meryem','madonna-with-the-long-neck-parmigianino'),
  ('turk-devletcilik-sanati-kutadgu-bilig','the-art-of-turkish-statism-kutadgu-bilig'),
  ('halkin-rehberi-ozgurluktur-eugene-delacroix','liberty-leading-the-people-eugene-delacroix'),
  ('michelangelonun-musasi-ve-ziyaretcisi','michelangelos-moses-and-visitor'),
  ('edgar-degasnin-balerinleri','edgar-degass-ballerinas'),
  ('erkekligi-olduren-cadi-medea','the-witch-who-killed-masculinity-medea'),
  ('lilith-efsanesi','the-legend-of-lilith'),
  ('lacan-ve-arzu','jacques-lacan-and-desire'),
  ('kral-arthur-efsanesinin-icinde-az-bilinen-bir-dram-shalott-leydisi','a-little-known-drama-in-the-legend-of-king-arthur-the-lady-of-shalott'),
  ('meryemana-kudusten-efese-yolculuk','virgin-mary-journey-from-jerusalem-to-ephesus'),
  ('klasik-ve-modern-arasinda-kendi-tarzini-olusturan-ressam-renoir-izlenimcilik-ve-reddi','painter-who-creates-his-own-style-between-classical-and-modern-renoir-impressionism-and-refusal'),
  ('aya-bakmanin-fotografi-eugene-atgetin-tutulma-sirasinda-hikayesi','photo-of-looking-at-the-moon-the-story-of-eugene-atget-during-eclipse'),
  ('gozlemlenen-insanlik-hawthorne-etkisi','observed-humanity-the-hawthorne-study'),
  ('ikarusun-dususu-sirasinda-bir-manzara','landscape-with-the-fall-of-icarus'),
  ('bernininin-etkileyici-apollon-ve-daphne-tasviri','berninis-impressive-depiction-of-apollo-and-daphne'),
  ('cagin-otesinde-bir-heykeltiras-camille-claudel','a-sculptor-beyond-the-age-camille-claudel'),
  ('just-stop-oil-nedir-iklim-aktivistleri-neden-sanat-eserlerine-saldiriyor','what-is-just-stop-oil-why-are-climate-activists-attacking-artworks')
)
update posts p
set translation_of = tr.id
from ciftler c
join posts tr on tr.slug = c.tr_slug
where p.slug = c.en_slug;

-- Kontrol
select lang, count(*) from posts group by lang;
select count(*) as eslesen_cift from posts where translation_of is not null;
