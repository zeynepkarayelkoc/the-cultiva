-- posts.updated_at düzenlemesi (24 Kasım 2026, Supabase SQL Editor'da çalıştırıldı)
--
-- Durum: updated_at kolonu zaten vardı ama eski "on_post_updated" tetikleyicisi
-- HER güncellemede (öne çıkarma, sıralama dahil) tarihi yeniliyordu. Temmuz-Ağustos
-- 2026 toplu taşıma/link düzeltmeleri yüzünden ~490 yazı sahte bir güncelleme
-- tarihi taşıyordu. Bu dosya kayıt için; tekrar çalıştırmak zarar vermez.

alter table public.posts add column if not exists updated_at timestamptz;
update public.posts set updated_at = created_at where updated_at is null;
alter table public.posts alter column updated_at set default now();

-- Yalnızca okurun gördüğü içerik değişince tarihi yenile.
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

-- Eski, her şeyde tetiklenen tetikleyiciyi kaldır.
drop trigger if exists on_post_updated on public.posts;

-- Toplu düzeltmelerin bıraktığı sahte tarihleri sıfırla.
update public.posts set updated_at = created_at
  where updated_at::date in ('2026-07-31', '2026-08-01');

-- Gerçekten güncellenen yazılar
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
update public.posts set updated_at = created_at
  where slug in ('ciglik-tablosunun-anlami','mihrap-tablosunun-hikayesi','opucuk-tablosunun-anlami-klimt');
