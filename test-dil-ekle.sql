-- Testlere dil alanı (24 Kasım 2026, Supabase SQL Editor'da çalıştırıldı).
-- Mevcut testlerin hepsi Türkçe kalır. İngilizce testler /en/quiz/<slug> adresinde yayınlanır.
alter table public.quizzes add column if not exists lang text not null default 'tr';
alter table public.quizzes drop constraint if exists quizzes_lang_check;
alter table public.quizzes add constraint quizzes_lang_check check (lang in ('tr','en'));
