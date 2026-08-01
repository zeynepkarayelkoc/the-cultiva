// Test modülünün ortak tipleri ve puanlaması.

export type QuizType = 'bilgi' | 'kisilik'

export type QuizOption = {
  id: string
  position: number
  text: string
  is_correct: boolean
  outcome_key: string | null
}

export type QuizQuestion = {
  id: string
  position: number
  text: string
  hint: string | null
  explanation: string | null
  image_url: string | null
  quiz_options: QuizOption[]
}

export type QuizOutcome = {
  id: string
  key: string | null
  min_correct: number | null
  title: string
  description: string | null
  image_url: string | null
  color: string | null
}

export type Quiz = {
  id: string
  slug: string
  title: string
  description: string | null
  cover_url: string | null
  type: QuizType
  category: string | null
  author_name: string | null
  published: boolean
  play_count: number
  created_at: string
  quiz_questions: QuizQuestion[]
  quiz_outcomes: QuizOutcome[]
}

// Bilgi testi puanı: her doğru 100, hızlı bitirene süre bonusu.
// Bonus soru başına 24 saniyeden hızlı çözülen her saniye için 2 puan.
export function puanHesapla(dogru: number, toplam: number, saniye: number): number {
  const temel = dogru * 100
  const hedef = toplam * 24
  const bonus = Math.max(0, hedef - saniye) * 2
  return temel + bonus
}

// Bilgi testinde doğru sayısına uyan sonucu bulur.
export function bilgiSonucu(outcomes: QuizOutcome[], dogru: number): QuizOutcome | null {
  const sirali = outcomes
    .filter(o => o.min_correct !== null)
    .sort((a, b) => (b.min_correct ?? 0) - (a.min_correct ?? 0))
  return sirali.find(o => dogru >= (o.min_correct ?? 0)) ?? null
}

// Kişilik testinde en çok işaretlenen anahtarı bulur.
export function kisilikSonucu(
  outcomes: QuizOutcome[],
  secilenAnahtarlar: (string | null)[],
): QuizOutcome | null {
  const sayim: Record<string, number> = {}
  for (const k of secilenAnahtarlar) {
    if (k) sayim[k] = (sayim[k] ?? 0) + 1
  }
  const kazanan = Object.entries(sayim).sort((a, b) => b[1] - a[1])[0]?.[0]
  if (!kazanan) return outcomes[0] ?? null
  return outcomes.find(o => o.key === kazanan) ?? outcomes[0] ?? null
}

export const VARSAYILAN_RENK = '#b5734a'
