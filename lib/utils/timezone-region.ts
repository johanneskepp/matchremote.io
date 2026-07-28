// Derives the same broad timezone bucket the quiz itself collects (see the
// "timezone" question in app/quiz/page.tsx: americas / europe / asia)
// from a job's free-text location field. None of our ingest sources
// (RemoteOK, Remotive, Arbeitnow) give a clean timezone, but most give a
// country or city we can classify with a keyword match.
export type TimezoneRegion = 'americas' | 'europe' | 'asia'

const REGION_KEYWORDS: Record<TimezoneRegion, string[]> = {
  americas: [
    'usa', 'united states', 'u.s.', 'canada', 'mexico', 'brazil', 'brasil', 'argentina',
    'chile', 'colombia', 'peru', 'uruguay', 'ecuador', 'latam', 'latin america',
    'north america', 'south america', 'new york', 'san francisco', 'los angeles',
    'chicago', 'austin', 'seattle', 'boston', 'toronto', 'vancouver', 'montreal',
    'mexico city', 'sao paulo', 'são paulo', 'bogota', 'bogotá', 'buenos aires',
    'santiago', 'lima', 'belo horizonte', 'montevideo', 'campinas', 'florianopolis',
    'florianópolis', 'rio de janeiro',
  ],
  europe: [
    'europe', 'eu', 'uk', 'united kingdom', 'germany', 'deutschland', 'france',
    'spain', 'italy', 'netherlands', 'poland', 'portugal', 'sweden', 'norway',
    'denmark', 'finland', 'ireland', 'belgium', 'austria', 'switzerland',
    'czech', 'romania', 'greece', 'hungary', 'croatia', 'bulgaria', 'slovakia',
    'berlin', 'munich', 'münchen', 'hamburg', 'frankfurt', 'cologne', 'köln',
    'london', 'paris', 'madrid', 'barcelona', 'amsterdam', 'lisbon', 'lisboa',
    'warsaw', 'dublin', 'vienna', 'zurich', 'geneva', 'stockholm', 'copenhagen',
    'oslo', 'helsinki', 'brussels', 'prague', 'bucharest', 'athens', 'milan',
  ],
  asia: [
    'india', 'china', 'japan', 'singapore', 'philippines', 'indonesia', 'vietnam',
    'thailand', 'malaysia', 'south korea', 'korea', 'australia', 'new zealand',
    'apac', 'asia pacific', 'oceania', 'hong kong', 'taiwan', 'pakistan',
    'bangladesh', 'sri lanka', 'mumbai', 'delhi', 'bangalore', 'bengaluru',
    'bangkok', 'manila', 'jakarta', 'kuala lumpur', 'seoul', 'tokyo', 'sydney',
    'melbourne', 'auckland', 'shanghai', 'beijing', 'shenzhen',
  ],
}

export const TIMEZONE_REGION_LABELS: Record<TimezoneRegion, string> = {
  americas: 'the Americas',
  europe: 'Europe',
  asia: 'Asia Pacific',
}

export function deriveTimezoneRegion(location: string | null | undefined): TimezoneRegion | null {
  if (!location) return null
  const text = location.toLowerCase()

  for (const region of Object.keys(REGION_KEYWORDS) as TimezoneRegion[]) {
    if (REGION_KEYWORDS[region].some((kw) => text.includes(kw))) return region
  }

  return null
}
