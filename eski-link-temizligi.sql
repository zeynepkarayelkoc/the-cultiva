-- ============================================================
-- The Cultiva — Eski site (loveinartsz.com) SAYFA linklerini
-- yeni ana sayfa (www.thecultiva.com) ile değiştirir.
--
-- KORUNUR: Görseller (loveinartsz.com/wp-content/uploads/...) —
-- onlar hâlâ eski sunucudan yükleniyor, DEĞİŞTİRİLMEZ.
--
-- Yöntem: PostgreSQL POSIX regex lookahead desteklemediği için,
-- önce görsel URL'lerini geçici bir işaretleyiciyle koruyup,
-- kalan tüm loveinartsz.com (= sayfa linkleri) değiştirilir,
-- sonra görseller geri alınır.
--
-- Supabase → SQL Editor'de adımları SIRAYLA çalıştır.
-- ============================================================


-- ── ADIM 1: ÖNİZLEME (değiştirmez) — kaç yazı etkilenecek? ──
SELECT count(*) AS etkilenecek_yazi
FROM posts
WHERE content LIKE '%loveinartsz.com%'
  AND replace(content, 'loveinartsz.com/wp-content', '') LIKE '%loveinartsz.com%';


-- ── ADIM 2: GÜVENLİK YEDEĞİ ──
CREATE TABLE IF NOT EXISTS posts_content_yedek AS
SELECT id, content, now() AS yedek_tarihi
FROM posts
WHERE content LIKE '%loveinartsz.com%';


-- ── ADIM 3: GÜNCELLEME (görselleri koruyarak) ──
UPDATE posts
SET content =
  -- C) görselleri geri al
  replace(
    -- B) kalan tüm loveinartsz.com sayfa/başlık metinlerini değiştir
    regexp_replace(
      -- A) görselleri geçici olarak koru
      replace(content, 'loveinartsz.com/wp-content', '__LOVEKEEP__/wp-content'),
      'https?://(www\.)?loveinartsz\.com[^"''[:space:]<>]*',
      'https://www.thecultiva.com/',
      'g'
    ),
    '__LOVEKEEP__/wp-content', 'loveinartsz.com/wp-content'
  )
WHERE content LIKE '%loveinartsz.com%';


-- ── ADIM 4: title="..." içinde kalan çıplak eski ad izlerini temizle ──
-- (Görselleri yine koruyarak: önce wp-content'i sakla, değiştir, geri al)
UPDATE posts
SET content = replace(
      replace(
        replace(content, 'loveinartsz.com/wp-content', '__LOVEKEEP__/wp-content'),
        'loveinartsz.com', 'thecultiva.com'
      ),
      '__LOVEKEEP__/wp-content', 'loveinartsz.com/wp-content'
    )
WHERE content LIKE '%loveinartsz.com%'
  AND replace(content, 'loveinartsz.com/wp-content', '') LIKE '%loveinartsz.com%';


-- ── ADIM 5: DOĞRULAMA ──
-- (a) Geriye sayfa linki kalmamalı → 0 dönmeli:
SELECT count(*) AS kalan_sayfa_izi
FROM posts
WHERE content LIKE '%loveinartsz.com%'
  AND replace(content, 'loveinartsz.com/wp-content', '') LIKE '%loveinartsz.com%';

-- (b) Görseller hâlâ yerinde → büyük sayı dönmeli:
SELECT count(*) AS gorsel_iceren_yazi
FROM posts
WHERE content LIKE '%loveinartsz.com/wp-content%';


-- ── (İSTEĞE BAĞLI) GERİ ALMA ──
-- UPDATE posts p
-- SET content = y.content
-- FROM posts_content_yedek y
-- WHERE p.id = y.id;
