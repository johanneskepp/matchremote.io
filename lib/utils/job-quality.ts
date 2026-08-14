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
]

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

  const lower = t.toLowerCase()
  if (lower === company.trim().toLowerCase()) return false
  // Insurance only. Ingestion recovers the real employer from the source's
  // company slug before this ever runs, so a row reaching here with a
  // placeholder employer means that recovery failed and the listing would
  // publish a false hiringOrganization.
  if (isPlaceholderCompany(company)) return false
  if (BOILERPLATE_PHRASES.some((p) => lower.includes(p))) return false
  if (EXACT_PLACEHOLDER_TITLES.includes(lower)) return false
  if (isUrlLike(t)) return false
  if (isAllCapsSlogan(t)) return false
  if (isQuestionOrBlogTitle(t)) return false
  if (!/[a-zA-Z]{3,}/.test(t)) return false

  const lowerDescription = description.toLowerCase()
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
