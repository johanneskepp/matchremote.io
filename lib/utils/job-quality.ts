// RemoteOK's public feed occasionally includes entries that aren't real job
// postings at all: recruiting page boilerplate ("Join the Family", "No open
// roles right now"), blog content that leaked in ("How Keep Your Pies From
// Getting Soggy Bottoms"), raw URLs, placeholder rows ("Sample Job"), and
// personal names with no role attached. Publishing these with JobPosting
// structured data risks a Google structured data spam penalty on the whole
// site, so they're filtered out before anything reaches the `jobs` table.

const BOILERPLATE_PHRASES = [
  'no open role',
  "don't currently have any open role",
  'do not currently have any open role',
  'current vacancies',
  'all jobs',
  'join the family',
  'join our team',
  'join the team',
  'come and join',
  'why join us',
  'we are hiring',
  'sample job',
  'we are',
  'widen the circle',
  'book recommendation',
  'job hunting indecision',
  'i want all the money',
  // Generic open application forms with no actual role attached, seen from
  // both English and French language sources.
  'spontaneous application',
  'postuler chez nous',
  'candidature spontanee',
  // A title stating there is nothing to apply to right now, not a role.
  'no current opening',
  // A vague headcount announcement with no role named, seen from both a
  // company ("MJV Group Multiple Positions") and a government listing
  // ("Multiple Positions") whose descriptions were both generic company
  // overviews with no specific duties, never a real title on its own.
  'multiple positions',
  // A generic open-application CTA with no role attached, description was
  // just company nav/capabilities text with nothing job specific in it.
  'could be a good fit',
  // More open application and vacancy index CTAs naming no role at all, the
  // same class as 'spontaneous application' above, seen across RemoteOK and
  // Himalayas ("General Application (PDCflow)", "Open Vacancies", "Our
  // vacancies", "Currently no vacancies", "Not Finding Your Fit Apply Here").
  'general application',
  'speculative application',
  'not finding your fit',
  'open position',
  'open vacanc',
  'our vacanc',
  'no vacanc',
  // A recruiting page section heading, never a role.
  'hiring process',
  // Two more open application CTAs carrying no occupation. Both are safe as a
  // substring because neither phrase can sit inside a real job title: seen as
  // "Don’t see your role Apply here" and as a recruiter instruction,
  // "APPLY NOW Send Veritas your Resume DON'T CLOSE WEBSITE".
  'see your role',
  'close website',
]

// Open application and talent pool CTAs that name no role at all, the same
// class as 'spontaneous application' and 'general application' above. These
// are matched as a PREFIX, deliberately, not as a substring: whatever follows
// the phrase in these titles is a company or a location ("Expression of
// Interest with First Quantum", "Expression of Interest (United States)"),
// never an occupation. A substring match would also catch "AUS Dr Martens
// Sales Assistant Expression of Interest", which leads with a real role and
// is a real posting, and deleting those is the same trap that once made every
// job located in "Ukraine" claim it was in the UK. Titles that merely tag a
// named role as a talent pool ("Virtual Assistant (Talent Pool)", "Data
// Scientist Talent Pool") are real postings and stay, they name the job.
const OPEN_INTEREST_TITLE_PREFIXES = [
  'expression of interest',
  'general interest',
  'register your interest',
  // A vacancy index heading, seen as "Vacancies Australia". The plural plus
  // the trailing space is what makes this safe: the singular "Vacancy Control
  // Officer" is a real occupation and does not match it, and a real posting is
  // never titled "Vacancies <place>", that shape is always an index heading.
  'vacancies ',
  // Numbered test rows ("Test Job 3") that the exact list below cannot catch.
  // Safe as a prefix because "test job" is not an occupational phrase in any
  // title: the real roles here lead with "Test Engineer", "Test Automation
  // Engineer" or "Test Automation Architect", never with "Test Job".
  'test job',
]

// "Join Praemium Expression of Interest" is the same CTA with the employer
// spliced into the middle, so the prefixes above are also tried against the
// title with a leading "join <company> " removed. A real posting like "Join
// Our Growing Team as Account Executive" survives, stripping its first two
// words still leaves no matching prefix.
function isOpenInterestTitle(lowerTitle: string): boolean {
  const withoutJoin = lowerTitle.replace(/^join\s+\S+\s+/, '')
  return OPEN_INTEREST_TITLE_PREFIXES.some(
    (p) => lowerTitle.startsWith(p) || withoutJoin.startsWith(p)
  )
}

// Titles that are template placeholders rather than a real role name. Checked
// as an exact match so a legitimate title like "Test Engineer" still passes.
// The bare category nouns below are all scraped site navigation labels, a real
// posting always qualifies them ("Budget Analyst", "Education Coordinator"),
// so matching them exactly is safe.
const EXACT_PLACEHOLDER_TITLES = [
  'test',
  'job details',
  'jop posting title',
  'vacancy',
  'vacancies',
  'jobs',
  'news',
  'budget',
  'management',
  'education',
  'corporate',
  'wholesale',
  'professional',
  // Vacancy index and open interest headings naming no role.
  'talent pipeline',
  'open roles and general interest',
  // Literal test and template rows, confirmed by reading their descriptions
  // ("Testing testing Testing testing", "Test job description Test job
  // description", "This a testing job for the integration", and "We are
  // seeking a passionate and dedicated Job Role to join our team", which is
  // the unfilled template variable left in place). Exact only, deliberately:
  // "Test Engineer", "Test Automation Engineer" and "Demo Engineer" are real
  // occupations and a substring match on "test" would delete every one.
  'test job',
  'test job title',
  'test req',
  'test copy',
  'testing',
  'job role',
  'title tbd',
  // A headcount announcement naming no role. Exact only, since a real posting
  // titled "Now Hiring: Truck Drivers" has to survive.
  'now hiring',
  'hiring now',
  // More scraped navigation labels, the same class as the bare category nouns
  // above. Their descriptions were a studio blurb, an empty application form
  // field list, and a distance filter menu ("Other areas / 0 km / 2 km").
  'other',
  'other areas',
  'menu',
  // Bare acronyms naming no occupation, each with a description consisting of
  // nothing but the source's own apply instruction. Exact only, so a real
  // "MES Engineer" or "CDP Analyst" is untouched.
  'cdp',
  'mes',
]

// A real description is never Lorem Ipsum filler or a raw application form
// field list, both seen from RemoteOK entries that are placeholder or
// non-job content, not an actual posting.
const DESCRIPTION_BOILERPLATE_PHRASES = [
  'lorem ipsum',
  'formulaire de postulation',
  // The whole "description" is just a Google Forms sign in redirect, not
  // any actual job content, seen from a RemoteOK entry linking to a form.
  'continue to google forms',
]

// Phrases that mean the scraper captured page furniture instead of the posting
// itself: a cookie banner, an access denied page, a 404, or a bot check
// interstitial. These only disqualify a listing when the whole description is
// short, because a long real posting can legitimately end with a cookie notice
// scraped from the page footer, and that job is still real. Measured against
// the live catalogue when this was added: 17 rows matched under the cap and
// zero real postings sat above it.
const PAGE_CHROME_PHRASES = [
  'this website uses cookies',
  'we use cookies',
  'cookie preferences',
  'access denied',
  "you don't have permission to access",
  'page not found',
  'performing security verification',
  'protect against malicious bots',
  // More of the same class, found 2026-09-03: two other 404 wordings, a
  // failed asset load, an Akamai error page, and another cookie banner. The
  // apostrophe is deliberately left off "page doesn" so both the straight and
  // the curly variant match, sources send either one.
  'page doesn',
  'it looks like there',
  'download failed',
  'errors.edgesuite.net',
  'anonymized cookies',
]
const PAGE_CHROME_MAX_LENGTH = 700

const QUESTION_STARTERS = ['how ', 'why ', 'what ', 'when ']

// A handful of sources turned out, on manual inspection, to not be real job
// listings at all: their "description" is scraped nav menu, glossary, or
// product page content rather than a posting. Confirmed by reading the actual
// content, not by a generic heuristic, so this stays a narrow explicit list
// rather than something that risks catching real postings. Shared by the
// ingestion script and the cleanup script so the two cannot drift apart.
//
// "World Veterans" lists brand names like "Walgreens"/"Starbucks" as job
// titles with identical nav menu text as the description. "AI Supermarket"
// (added 2026-08-14) is the same shape from RemoteOK: seven rows whose titles
// are SaaS product names ("Jenni AI", "Typefully", "Apify", "Beehiiv") all
// carrying one identical description of an unrelated forex trading simulator,
// so it is a scraped product directory, not an employer with vacancies.
export const KNOWN_NON_JOB_COMPANIES = new Set([
  'world veterans',
  'devtube',
  'adconversion',
  'ai supermarket',
])

// Himalayas' API intermittently returns the literal string "name" in its
// companyName field while the companySlug on the same record stays correct.
// A company genuinely called "name" does not exist, so treating it as a real
// employer only publishes a wrong hiringOrganization to Google.
const PLACEHOLDER_COMPANY_NAMES = new Set(['name', 'company name', 'companyname'])

export function isPlaceholderCompany(company: string): boolean {
  return PLACEHOLDER_COMPANY_NAMES.has(company.trim().toLowerCase())
}

// Turns a company slug into a readable employer name. Used only when a source
// hands us a placeholder instead of the real name, so an imperfect
// capitalisation ("Td Synnex" for "td-synnex") is still far better than the
// alternative, which was publishing the literal word "name" as the employer.
export function companyNameFromSlug(slug: string): string {
  return slug
    .split('-')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// "4 vacatures" is a Dutch vacancy index heading, not a posting. A title that
// is nothing but a count and a vacancy noun never names an occupation, so
// matching the whole string is safe in any of these languages.
function isVacancyCountTitle(lowerTitle: string): boolean {
  return /^\d+\s+(vacatures?|vacancies|vacancy|jobs?|openings?|positions?|roles?)$/.test(lowerTitle)
}

// Sources send the same boilerplate both with and without diacritics, so the
// phrase list already carried 'candidature spontanee' while the live row read
// "Candidature spontanée" and slipped straight through. Every phrase, exact
// title and prefix rule is therefore matched against an accent stripped copy.
// Measured against the live catalogue before shipping: of the 92 active titles
// carrying an accent, exactly one changes classification, that French open
// application form, so no real accented posting is newly rejected.
function deaccent(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function isUrlLike(title: string): boolean {
  return /https?[:\s]|www\.|\.(com|community|net|org)\b/i.test(title)
}

function isAllCapsSlogan(title: string): boolean {
  const words = title.trim().split(/\s+/)
  if (words.length < 1 || words.length > 4) return false
  return words.every((w) => w === w.toUpperCase() && w.length >= 3 && /[A-Z]/.test(w) && !/\d/.test(w))
}

function isQuestionOrBlogTitle(title: string): boolean {
  const lower = title.toLowerCase()
  // "¿" opens a Spanish/Portuguese question and, unlike "?", is never part of
  // a real job title, so it's a safe signal even when a scraped title got
  // truncated before the closing "?" (seen from a RemoteOK entry whose
  // description turned out to be an unrelated blog post, not a job).
  return title.includes('?') || title.startsWith('¿') || QUESTION_STARTERS.some((q) => lower.startsWith(q))
}

export function isLikelyRealJob(title: string, description: string, company: string): boolean {
  const t = title.trim()
  if (t.length < 3) return false

  const lower = deaccent(t.toLowerCase())
  if (lower === deaccent(company.trim().toLowerCase())) return false
  // Insurance only. Ingestion recovers the real employer from the source's
  // company slug before this ever runs, so a row reaching here with a
  // placeholder employer means that recovery failed and the listing would
  // publish a false hiringOrganization.
  if (isPlaceholderCompany(company)) return false
  if (BOILERPLATE_PHRASES.some((p) => lower.includes(p))) return false
  if (EXACT_PLACEHOLDER_TITLES.includes(lower)) return false
  if (isOpenInterestTitle(lower)) return false
  if (isVacancyCountTitle(lower)) return false
  if (isUrlLike(t)) return false
  if (isAllCapsSlogan(t)) return false
  if (isQuestionOrBlogTitle(t)) return false
  if (!/[a-zA-Z]{3,}/.test(t)) return false

  const lowerDescription = deaccent(description.toLowerCase())
  if (DESCRIPTION_BOILERPLATE_PHRASES.some((p) => lowerDescription.includes(p))) return false

  if (
    lowerDescription.length <= PAGE_CHROME_MAX_LENGTH &&
    PAGE_CHROME_PHRASES.some((p) => lowerDescription.includes(p))
  ) {
    return false
  }

  // A real posting almost always has a real description. Both the title AND
  // the description being suspiciously thin is a stronger signal than either
  // alone (some legit short titles like "Caretaker" have full descriptions).
  if (description.trim().length < 30 && t.split(/\s+/).length <= 2) return false

  return true
}
