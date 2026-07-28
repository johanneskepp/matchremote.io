// Google requires `applicantLocationRequirements` whenever a JobPosting sets
// jobLocationType: TELECOMMUTE, otherwise it flags a Search Console warning
// (the site previously set TELECOMMUTE on every job with no location
// requirement at all). None of our ingest sources give a clean country
// field, only free text location strings, so this only returns a country
// when the text names one unambiguously, region words like "Europe",
// "LATAM", or "Worldwide" are not valid schema.org Country values and are
// deliberately left unmatched rather than guessed at.
const COUNTRY_KEYWORDS: Record<string, string[]> = {
  'United States': [
    'usa', 'u.s.', 'united states', 'new york', 'san francisco', 'los angeles', 'chicago',
    'austin', 'seattle', 'boston', 'washington', 'idaho', 'vancouver, vancouver',
    'brooklyn', 'palm beach', 'las vegas', 'sacramento', 'connecticut', 'pasadena',
    'houston', 'salt lake city', 'boulder', 'glendale', 'cloquet', 'california',
    'texas', 'florida', 'illinois', 'nevada',
  ],
  Canada: ['canada', 'toronto', 'vancouver', 'montreal'],
  Brazil: ['brazil', 'brasil', 'sao paulo', 'são paulo', 'rio de janeiro'],
  Mexico: ['mexico', 'méxico', 'mexico city', 'ciudad valles'],
  Uruguay: ['uruguay', 'montevideo'],
  Peru: ['peru', 'perú', 'lima'],
  Portugal: ['portugal', 'lisbon', 'lisboa'],
  Spain: ['spain', 'españa', 'madrid', 'barcelona'],
  Germany: ['germany', 'deutschland', 'berlin', 'schwäbisch hall', 'brandenburg', 'stuttgart', 'hockenheim', 'cologne', 'köln', 'eltville', 'ditzingen', 'magdeburg'],
  'United Kingdom': ['united kingdom', 'uk', 'london'],
  France: ['france'],
  Philippines: ['philippines'],
  Australia: ['australia', 'sydney', 'albury', 'wagga wagga'],
  'South Africa': ['south africa'],
  India: ['india', 'nagpur'],
}

export function deriveApplicantCountries(location: string | null | undefined): string[] | null {
  if (!location) return null
  const text = location.toLowerCase()

  const matches = Object.entries(COUNTRY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => text.includes(kw)))
    .map(([country]) => country)

  return matches.length > 0 ? matches : null
}
