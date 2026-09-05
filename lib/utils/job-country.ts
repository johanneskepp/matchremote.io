// `applicantLocationRequirements` narrows who a remote posting can hire, so it
// is only worth publishing when we can name a country honestly. None of our
// ingest sources give a clean country field, only free text location strings,
// so this returns a country only when the text names one unambiguously. Region
// words like "Europe", "LATAM" or "Worldwide" are not valid schema.org Country
// values and are deliberately left unmatched rather than guessed at.
//
// Returning null does NOT mean the JobPosting drops jobLocationType. That was
// the old behaviour and it published an invalid posting: Google then treats
// jobLocation as required and reports "Missing field jobLocation" as an ERROR.
// Every listing here is remote, so the page always declares TELECOMMUTE and
// simply leaves the requirement off when there is nothing truthful to say.
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

/**
 * Whole word match, not a substring.
 *
 * Plain `includes` claimed United Kingdom for every job located in "Ukraine",
 * because "ukraine" contains "uk". That wrong country was going into the
 * JobPosting applicantLocationRequirements we publish to Google, not just into
 * on screen copy, so short codes like "uk" and "u.s." have to be bounded by
 * something that is not a letter.
 */
function mentionsKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`).test(text)
}

export function deriveApplicantCountries(location: string | null | undefined): string[] | null {
  if (!location) return null
  const text = location.toLowerCase()

  const matches = Object.entries(COUNTRY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => mentionsKeyword(text, kw)))
    .map(([country]) => country)

  return matches.length > 0 ? matches : null
}

// Which of the quiz's three broad regions each country sits in. Only the
// countries above appear here, anything we could not name stays unknown rather
// than being guessed into a region.
//
// Two judgement calls worth stating: South Africa is filed under europe because
// SAST is UTC+2, which overlaps a European day almost completely, and Australia
// under asia because that is the nearest of the three buckets, not because the
// overlap is good.
const COUNTRY_REGIONS: Record<string, 'americas' | 'europe' | 'asia'> = {
  'United States': 'americas',
  Canada: 'americas',
  Brazil: 'americas',
  Mexico: 'americas',
  Uruguay: 'americas',
  Peru: 'americas',
  Portugal: 'europe',
  Spain: 'europe',
  Germany: 'europe',
  'United Kingdom': 'europe',
  France: 'europe',
  'South Africa': 'europe',
  Philippines: 'asia',
  India: 'asia',
  Australia: 'asia',
}

/**
 * Every region a job's stated location would let you work from, or null when
 * the listing does not restrict itself to anywhere we can name.
 *
 * A job naming specific countries is making an eligibility statement, not
 * expressing a timezone preference, which is why this is derived from the
 * country text first and only falls back to the coarser ingested region.
 */
export function deriveJobRegions(
  location: string | null | undefined,
  ingestedRegion: string | null | undefined
): ('americas' | 'europe' | 'asia')[] | null {
  const countries = deriveApplicantCountries(location)

  if (countries) {
    const regions = [...new Set(countries.map((c) => COUNTRY_REGIONS[c]).filter(Boolean))]
    if (regions.length > 0) return regions
  }

  if (ingestedRegion === 'americas' || ingestedRegion === 'europe' || ingestedRegion === 'asia') {
    return [ingestedRegion]
  }

  return null
}
