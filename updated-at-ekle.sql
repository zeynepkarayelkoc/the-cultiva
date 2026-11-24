-- posts tablosuna "son güncellenme" tarihi ekler (Kasım 2026)
-- Supabase → SQL Editor'da bir kez çalıştır. Tekrar çalıştırmak zarar vermez.

-- 1) Kolon. Var olan yazılarda başlangıç değeri yayın tarihi.
alter table public.posts add column if not exists updated_at timestamptz;
update public.posts set updated_at = created_at where updated_at is null;
alter table public.posts alter column updated_at set default now();

-- 2) Yalnızca okurun gördüğü içerik değişince tarihi yenile.
--    Ana sayfada öne çıkarma, sıralama gibi panel işlemleri tarihi değiştirmesin.
create or replace function public.posts_updated_at_yenile()
returns trigger
language plpgsql
as $$
begin
  if new.content          is distinct from old.content
  or new.title            is distinct from old.title
  or new.excerpt          is distinct from old.excerpt
  or new.meta_title       is distinct from old.meta_title
  or new.meta_description is distinct from old.meta_description
  or new.cover_url        is distinct from old.cover_url
  then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists posts_updated_at on public.posts;
create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.posts_updated_at_yenile();

-- 3) Bu ay elle güncellenen yazılar
update public.posts set updated_at = '2026-11-22 12:00+03'
  where slug = 'vizesiz-yunan-adalari-kapida-vize-uygulamasi-rehberi';
update public.posts set updated_at = '2026-11-01 12:00+03'
  where slug in (
    'las-meninas-velazquez-neyi-resmediyor',
    'shakespearein-satirlarindan-tuvale-ophelianin-oykusu',
    'yildizli-gece-aci-dolu-bir-son',
    'bir-zarafet-ki-osman-hamdi-bey',
    'yeniden-sekillendirilmis-tanrica-kirke',
    'surgunde-bir-cadi-ben-kirke'
  );

-- Kontrol: en son güncellenen 10 yazı
select slug, created_at::date as yayin, updated_at::date as guncelleme
from public.posts order by updated_at desc nulls last limit 10;
