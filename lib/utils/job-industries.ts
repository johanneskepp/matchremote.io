// Infers industry tags from a job's title + description text, using the
// exact same short codes the quiz's "industries" question collects (see
// app/quiz/page.tsx). Applied uniformly across all ingest sources instead of
// relying on Remotive's raw `category` field, which used full English phrases
// like "Artificial Intelligence" that never actually matched the quiz's short
// codes in lib/utils/matching.ts's substring check (industryPreference was
// silently 0 for almost everyone who picked a preference).
export type IndustryCode = 'saas' | 'fintech' | 'health' | 'edu' | 'ecommerce' | 'ai' | 'climate' | 'gaming'

const INDUSTRY_KEYWORDS: Record<IndustryCode, string[]> = {
  saas: ['saas', 'b2b software', 'enterprise software', 'platform', 'api', 'devtools', 'developer tools'],
  fintech: ['fintech', 'banking', 'payments', 'lending', 'insurance', 'trading', 'crypto', 'blockchain', 'investment'],
  health: ['health', 'healthcare', 'medical', 'wellness', 'clinical', 'pharma', 'telehealth', 'mental health', 'fitness'],
  edu: ['education', 'edtech', 'e-learning', 'elearning', 'learning platform', 'university', 'student', 'tutoring'],
  ecommerce: ['e-commerce', 'ecommerce', 'marketplace', 'retail', 'shopify', 'online store', 'd2c', 'dtc'],
  ai: ['artificial intelligence', ' ai ', 'ai-', 'machine learning', 'ml ', 'llm', 'generative ai', 'deep learning', 'nlp'],
  climate: ['climate', 'sustainability', 'renewable', 'solar', 'carbon', 'clean energy', 'green energy', 'esg'],
  gaming: ['gaming', 'video game', 'game studio', 'esports', 'game developer', 'entertainment platform'],
}

export function inferIndustries(title: string, description: string): IndustryCode[] {
  const text = ` ${title} ${description} `.toLowerCase()
  const matches: IndustryCode[] = []

  for (const code of Object.keys(INDUSTRY_KEYWORDS) as IndustryCode[]) {
    if (INDUSTRY_KEYWORDS[code].some((kw) => text.includes(kw))) matches.push(code)
  }

  return matches
}
