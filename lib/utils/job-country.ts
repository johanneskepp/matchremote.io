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
//
// "Georgia" is deliberately absent. It is both a country and a US state, and
// the live data carries both senses (one row reads "Georgia, United States"),
// so there is no honest way to tell the two apart from the location text alone.
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
  Argentina: ['argentina'],
  Chile: ['chile'],
  Colombia: ['colombia'],
  Ecuador: ['ecuador'],
  Bolivia: ['bolivia'],
  Paraguay: ['paraguay'],
  Venezuela: ['venezuela'],
  'Costa Rica': ['costa rica'],
  Panama: ['panama', 'panamá'],
  Guatemala: ['guatemala'],
  Honduras: ['honduras'],
  Nicaragua: ['nicaragua'],
  'El Salvador': ['el salvador'],
  'Dominican Republic': ['dominican republic'],
  Jamaica: ['jamaica'],
  Barbados: ['barbados'],
  Guyana: ['guyana'],
  Suriname: ['suriname'],
  Belize: ['belize'],
  Portugal: ['portugal', 'lisbon', 'lisboa'],
  Spain: ['spain', 'españa', 'madrid', 'barcelona'],
  Germany: ['germany', 'deutschland', 'berlin', 'schwäbisch hall', 'brandenburg', 'stuttgart', 'hockenheim', 'cologne', 'köln', 'eltville', 'ditzingen', 'magdeburg'],
  'United Kingdom': ['united kingdom', 'uk', 'london'],
  France: ['france'],
  Ireland: ['ireland'],
  Netherlands: ['netherlands'],
  Belgium: ['belgium'],
  Luxembourg: ['luxembourg'],
  Switzerland: ['switzerland'],
  Austria: ['austria'],
  Italy: ['italy'],
  Greece: ['greece'],
  Poland: ['poland', 'polska'],
  Czechia: ['czechia', 'czech republic'],
  Slovakia: ['slovakia'],
  Hungary: ['hungary'],
  Romania: ['romania'],
  Bulgaria: ['bulgaria'],
  Croatia: ['croatia'],
  Slovenia: ['slovenia'],
  Serbia: ['serbia'],
  Albania: ['albania'],
  'North Macedonia': ['north macedonia'],
  Montenegro: ['montenegro'],
  'Bosnia and Herzegovina': ['bosnia and herzegovina'],
  Ukraine: ['ukraine'],
  Moldova: ['moldova'],
  Belarus: ['belarus'],
  Estonia: ['estonia'],
  Latvia: ['latvia'],
  Lithuania: ['lithuania'],
  Sweden: ['sweden'],
  Norway: ['norway'],
  Denmark: ['denmark'],
  Finland: ['finland'],
  Iceland: ['iceland'],
  Malta: ['malta'],
  Cyprus: ['cyprus'],
  Monaco: ['monaco'],
  Türkiye: ['türkiye', 'turkey'],
  Israel: ['israel'],
  Armenia: ['armenia'],
  Azerbaijan: ['azerbaijan'],
  Kazakhstan: ['kazakhstan'],
  'United Arab Emirates': ['united arab emirates', 'uae'],
  'Saudi Arabia': ['saudi arabia'],
  Qatar: ['qatar'],
  Egypt: ['egypt'],
  Morocco: ['morocco'],
  Nigeria: ['nigeria'],
  Kenya: ['kenya'],
  Ghana: ['ghana'],
  Malawi: ['malawi'],
  'South Africa': ['south africa'],
  India: ['india', 'nagpur'],
  Pakistan: ['pakistan'],
  Bangladesh: ['bangladesh'],
  'Sri Lanka': ['sri lanka'],
  China: ['china'],
  'Hong Kong': ['hong kong'],
  Macao: ['macao', 'macau'],
  Taiwan: ['taiwan'],
  Japan: ['japan'],
  'South Korea': ['south korea'],
  Singapore: ['singapore'],
  Malaysia: ['malaysia'],
  Indonesia: ['indonesia'],
  Philippines: ['philippines'],
  Thailand: ['thailand'],
  Vietnam: ['vietnam'],
  Cambodia: ['cambodia'],
  Australia: ['australia', 'sydney', 'albury', 'wagga wagga'],
  'New Zealand': ['new zealand'],
}

/**
 * Above this many named countries a listing is not really restricting anything.
 *
 * Some sources paste their whole eligible country picker into the location
 * field, so one live row names roughly 140 countries and another names every
 * country in Europe and Asia Pacific. Publishing that as
 * applicantLocationRequirements would be both enormous and empty of meaning: it
 * says exactly what TELECOMMUTE on its own already says, that the job is remote
 * and open. Those listings are treated as unrestricted instead, which keeps the
 * requirement block for the postings where it carries real information.
 */
const MAX_APPLICANT_COUNTRIES = 12

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

function matchCountries(location: string | null | undefined): string[] {
  if (!location) return []
  const text = location.toLowerCase()

  return Object.entries(COUNTRY_KEYWORDS)
    .filter(([, keywords]) => keywords.some((kw) => mentionsKeyword(text, kw)))
    .map(([country]) => country)
}

export function deriveApplicantCountries(location: string | null | undefined): string[] | null {
  const matches = matchCountries(location)

  if (matches.length === 0) return null
  if (matches.length > MAX_APPLICANT_COUNTRIES) return null

  return matches
}

// Which of the quiz's three broad regions each country sits in. Only the
// countries above appear here, anything we could not name stays unknown rather
// than being guessed into a region.
//
// The rule is the nearest of the three buckets by working day overlap, not by
// geography. That is why South Africa (UTC+2) and Israel (UTC+2 or +3) are
// filed under europe rather than getting a bucket of their own, and why the
// Gulf states sit there too: UTC+3 to +4 overlaps a European day far better
// than it overlaps an Asia Pacific one. Australia and New Zealand are under
// asia because that is the nearest of the three, not because the overlap is
// good.
const COUNTRY_REGIONS: Record<string, 'americas' | 'europe' | 'asia'> = {
  'United States': 'americas',
  Canada: 'americas',
  Brazil: 'americas',
  Mexico: 'americas',
  Uruguay: 'americas',
  Peru: 'americas',
  Argentina: 'americas',
  Chile: 'americas',
  Colombia: 'americas',
  Ecuador: 'americas',
  Bolivia: 'americas',
  Paraguay: 'americas',
  Venezuela: 'americas',
  'Costa Rica': 'americas',
  Panama: 'americas',
  Guatemala: 'americas',
  Honduras: 'americas',
  Nicaragua: 'americas',
  'El Salvador': 'americas',
  'Dominican Republic': 'americas',
  Jamaica: 'americas',
  Barbados: 'americas',
  Guyana: 'americas',
  Suriname: 'americas',
  Belize: 'americas',
  Portugal: 'europe',
  Spain: 'europe',
  Germany: 'europe',
  'United Kingdom': 'europe',
  France: 'europe',
  Ireland: 'europe',
  Netherlands: 'europe',
  Belgium: 'europe',
  Luxembourg: 'europe',
  Switzerland: 'europe',
  Austria: 'europe',
  Italy: 'europe',
  Greece: 'europe',
  Poland: 'europe',
  Czechia: 'europe',
  Slovakia: 'europe',
  Hungary: 'europe',
  Romania: 'europe',
  Bulgaria: 'europe',
  Croatia: 'europe',
  Slovenia: 'europe',
  Serbia: 'europe',
  Albania: 'europe',
  'North Macedonia': 'europe',
  Montenegro: 'europe',
  'Bosnia and Herzegovina': 'europe',
  Ukraine: 'europe',
  Moldova: 'europe',
  Belarus: 'europe',
  Estonia: 'europe',
  Latvia: 'europe',
  Lithuania: 'europe',
  Sweden: 'europe',
  Norway: 'europe',
  Denmark: 'europe',
  Finland: 'europe',
  Iceland: 'europe',
  Malta: 'europe',
  Cyprus: 'europe',
  Monaco: 'europe',
  Türkiye: 'europe',
  Israel: 'europe',
  Armenia: 'europe',
  Azerbaijan: 'europe',
  Kazakhstan: 'europe',
  'United Arab Emirates': 'europe',
  'Saudi Arabia': 'europe',
  Qatar: 'europe',
  Egypt: 'europe',
  Morocco: 'europe',
  Nigeria: 'europe',
  Kenya: 'europe',
  Ghana: 'europe',
  Malawi: 'europe',
  'South Africa': 'europe',
  India: 'asia',
  Pakistan: 'asia',
  Bangladesh: 'asia',
  'Sri Lanka': 'asia',
  China: 'asia',
  'Hong Kong': 'asia',
  Macao: 'asia',
  Taiwan: 'asia',
  Japan: 'asia',
  'South Korea': 'asia',
  Singapore: 'asia',
  Malaysia: 'asia',
  Indonesia: 'asia',
  Philippines: 'asia',
  Thailand: 'asia',
  Vietnam: 'asia',
  Cambodia: 'asia',
  Australia: 'asia',
  'New Zealand': 'asia',
}

/**
 * Every region a job's stated location would let you work from, or null when
 * the listing does not restrict itself to anywhere we can name.
 *
 * A job naming specific countries is making an eligibility statement, not
 * expressing a timezone preference, which is why this is derived from the
 * country text first and only falls back to the coarser ingested region.
 *
 * This reads the raw country matches rather than deriveApplicantCountries, so
 * the cap that keeps a 140 country picker out of the markup does not also throw
 * away the regions such a listing genuinely covers.
 */
export function deriveJobRegions(
  location: string | null | undefined,
  ingestedRegion: string | null | undefined
): ('americas' | 'europe' | 'asia')[] | null {
  const countries = matchCountries(location)

  if (countries.length > 0) {
    const regions = [...new Set(countries.map((c) => COUNTRY_REGIONS[c]).filter(Boolean))]
    if (regions.length > 0) return regions
  }

  if (ingestedRegion === 'americas' || ingestedRegion === 'europe' || ingestedRegion === 'asia') {
    return [ingestedRegion]
  }

  return null
}
