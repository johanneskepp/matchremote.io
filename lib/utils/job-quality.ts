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
  // An all caps recruiting slogan too long for isAllCapsSlogan's four word
  // cap ("JOIN US AND MAKE AN IMPACT ON THE FUTURE"), whose description was a
  // company mission statement naming no role.
  'join us and make an impact',
  // Found 2026-09-14 in a RemoteOK burst of scraped careers pages. Every one
  // is an open application CTA naming no role ("Express your interest",
  // "Send us your CV", "Build with us", "Talk us here if you can't find the
  // job that you're looking for", "The right person can still introduce
  // themselves", "If you think you've got what it takes..", "All Other
  // Roles", "All Other Future Considerations", "Across all departments",
  // "Don't see a role for you", and the French "Candidature libre"). None of
  // these phrases can sit inside a real job title, so substring is safe, and
  // each was measured against the live catalogue before shipping.
  'express your interest',
  'send us your cv',
  'build with us',
  'find the job that',
  'introduce themselves',
  'got what it takes',
  'candidature libre',
  'all other roles',
  'all other future',
  'across all departments',
  'see a role for you',
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
  // A spam post written as a sentence ("If you are looking for a employment
  // job"), never the opening of a real title.
  'if you are looking for',
  // Job seekers posting themselves as listings ("Seeking a job", "Looking for
  // Job", "Find a job 3rd comi", each with a description reading "Hi, I'm
  // looking for work"). A real posting never opens with the applicant's own
  // search, so these are safe as prefixes.
  'seeking a job',
  'looking for job',
  'looking for a job',
  'find a job',
  'i am looking for',
  "i'm looking for",
]

// Talent pipeline titles of the shape "Future <role> Positions" or "Future
// <company> Career Opportunities". Every live row of this shape said in its
// own description that nothing was open ("we currently do not have any
// positions open; however, if you would like to be considered for future
// opportunities"). The colon check keeps "Future Opportunity: Enterprise
// Sales Representative", which is a pipeline for one named role and stays,
// the same rule that keeps "Data Scientist Talent Pool".
function isFuturePipelineTitle(lowerTitle: string): boolean {
  if (lowerTitle.includes(':')) return false
  return /^future\b.*\b(positions|opportunities)\b/.test(lowerTitle)
}

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
  // Found 2026-09-11. "Various" and "Information" headed real recruiting
  // text that named no occupation at all ("Join Australia's Only Plumber
  // Owned Supply Team", a job ref and postcode list). "Open roles" is a
  // careers page heading ("We hire slowly"). "Future Job Test" is a literal
  // test row ("This is a future job.") and "Future Shaprs" a talent pool
  // ("even if our current postings haven't piqued your interest"). Exact
  // only, so "Information Security Analyst" and "Various Positions Nurse"
  // would both survive.
  'various',
  'information',
  'open roles',
  'future job test',
  'future shaprs',
  // Found 2026-09-14, the same RemoteOK burst as the phrases above, on
  // employers that are otherwise real so the company cannot be blocked.
  // Careers page headings and open application CTAs ("Your Next Role" read
  // "We're Hiring... Eventually!", "Current Openings" read "At present, we do
  // not have any open positions", "Custom Role", "General Staff Position",
  // "Various roles", "Various Positions" on a newspaper's nav bar, "Earn
  // more" on a furniture retailer's careers intro, "Rest of World" and
  // "Distribution Centers" as site navigation, "Holly Can Fix It" as a hotel
  // group's campaign name, "A People's Place" as a careers page slogan),
  // template placeholders ("Company Name", "Job Summary"), a scraped 404
  // ("Page Not Found"), a talent pool waitlist ("A glimpse of the pool") and
  // a venture studio's careers slogan ("Build from the frontier").
  // Exact only, so "Various Positions Registered Nurse", "Current Openings:
  // Nurses" or "Custom Role Designer" would all survive.
  'your next role',
  'current openings',
  'custom role',
  'general staff position',
  'various roles',
  'various positions',
  'earn more',
  'rest of world',
  'distribution centers',
  'holly can fix it',
  "a people's place",
  'company name',
  'job summary',
  'page not found',
  'a glimpse of the pool',
  'build from the frontier',
  // Personal profiles scraped as postings ("Resume Writer He/Him", a
  // dyslexia startup founder's bio) whose employers are names a real company
  // also uses, so the title is the only safe key.
  'joel q',
  'krish gupta',
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
  // Found 2026-09-11. Video game skin marketplace listings scraped as jobs:
  // "Exterior: Battle-Scarred" opened a description of gloves and an AK-47.
  // These five are the exact wear grades that marketplace uses and no job
  // description opens with one, so they are safe as a substring where a bare
  // "exterior:" would not be (a painting job can list exterior work).
  'exterior: battle-scarred',
  'exterior: well-worn',
  'exterior: field-tested',
  'exterior: minimal wear',
  'exterior: factory new',
  // A crypto token call ("$MERV JUST HIT CTO RADAR ... ATH MC: $79.5K")
  // scraped as a posting. "ATH MC" is market cap slang that never appears in
  // a job description.
  'ath mc:',
  // Found 2026-09-14. A literal test row ("Company Description Test Job
  // Description Test Qualifications Test", matched on that whole run so a
  // real posting that merely mentions a test job description survives) and
  // a career guide page scraped as a posting, whose description opens with
  // the guide index's own back link ("← All career guides Product and design
  // Product Manager").
  'test job description test qualifications',
  'all career guides',
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
  // A scraped document editor toolbar ("Undo·Ctrl+Z Redo·Ctrl+Shift+Z
  // open_with Translate"), found 2026-09-11 as the whole description of a
  // "Routesetters" row.
  'redo·ctrl+shift+z',
  // A browser support notice ("Unsupported Browser This browser is no longer
  // supported. Please install one of these supported browsers") and a bot
  // check ("403 / Security check Before you continue, please verify your
  // request"), both found 2026-09-14 as the entire description.
  'unsupported browser',
  '403 / security check',
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
//
// The block added 2026-09-11 is the same shape again, one RemoteOK burst (ids
// 1135xxx to 1137xxx) of product pages, app store blurbs, company profiles
// and outright spam scraped as postings. Every active row of every company
// listed was read individually before it went on this list, none had a
// single real vacancy: video game skin listings ("Exterior: Battle-Scarred"),
// a Bible chapter in Croatian, two crypto token calls, a Jacques Tati film
// listing, gym membership tiers ("Elite", "Basic"), an excavator, UK
// employment statistics, and a long tail of SaaS products whose titles are
// the product name. Their titles are single brand words, and a title shape
// rule cannot separate "Slingshot" from "Caretaker", "Porter" or "Butcher",
// all real single word occupations live in the catalogue, so the employer
// is the only honest signal. Matched after stripping accents, since one
// source spells its own name "Quicksite sàrl".
export const KNOWN_NON_JOB_COMPANIES = new Set([
  'world veterans',
  'devtube',
  'adconversion',
  'ai supermarket',
  'skinventory',
  'new atlantis',
  'covaltech',
  'simpletech.ai',
  'nexlane',
  'westtech home automation, llc',
  'build fast with ai',
  'meme calls',
  'yemma',
  'cllimber',
  'powerplay',
  'social value, inc.',
  'best in britain',
  'playtomax',
  'wesaas',
  'metriq srl',
  'hdgforge',
  'twitan.com',
  'mp software',
  'qorsi',
  'svetoviz',
  'curcle',
  'program delta performance group',
  'yt corporation',
  'quicksite sarl',
  'hot9ja',
  'koodup',
  'xsbrt',
  'tridant',
  'setrsoft',
  'eterniseed',
  'myaarohan',
  'flurix.ai',
  'fasek d.o.o.',
  'bujak maszyny',
  'filmtheater cinecenter',
  'nexerada',
  'looknet',
  'odf',
  // Found 2026-09-14, one more RemoteOK burst (ids 1136xxx) of blog posts,
  // product pages, personal profiles and fiction scraped as postings. Every
  // active row of every one of these was read before it went on the list:
  // cold outreach blog articles ("Attachments skip the first message"), a
  // China policy newsletter, an Amiga nostalgia essay published under three
  // titles, Russian and werewolf fiction, data science challenge briefs,
  // personal finance course listings, a habit tracker, a flight operations
  // app, a Crossy Road fan page, a resume writer's portfolio, a car rental
  // rating badge, a payment template, a mortgage explainer, an alumni
  // profile, and a real estate landing page duplicated under two employers.
  'ouba',
  'world data league',
  'macsweeney llc',
  'nibrasec',
  'quizzly.ai',
  'inbrief.ai',
  'terranovita bv',
  'openskills',
  'zyke',
  'bat pros',
  'the site office',
  'spore n sprouts',
  'apex local',
  'jalandhar local',
  'coldoutreach.blog',
  'fylos',
  'order from chaos, today!',
  'as unexpected',
  'my baristyle',
  'remora technologies limited',
  'uxgeek.tech',
  'radical reversibility',
  'fochis',
  'omesync',
  'ark intelligence',
  'memento ai',
  'chris greer press',
  'managing ai',
  'apply.coop',
  'mukti switzerland',
  'eventthone network',
  'reboot with ai',
  'iopener.today',
  'durbean',
  'carrentalrating.com',
  'haus.com',
  'cross seat',
  'giant leap consulting',
  'productionbeast',
  'chinadebate',
  'tclara',
  'american academy of achievement',
  'brite enterprises',
  'aleh writing services (aws)',
  'myriadloop',
  'sc ai impact alliance',
  'quintessence films limited',
  'vistara group',
  'saasuji',
  'wb melback corporation',
  'workajobs',
])

// The one place the blocklist is consulted, shared by ingestion and the
// cleanup script so the two cannot disagree on how a company name is
// normalised before lookup.
export function isKnownNonJobCompany(company: string): boolean {
  return KNOWN_NON_JOB_COMPANIES.has(deaccent(company.trim().toLowerCase()))
}

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

// A scraped title can arrive with a line break in the middle ("Hiring\nProcess"
// slipped straight past the 'hiring process' phrase) or with a curly
// apostrophe where the list carries a straight one, so whitespace and
// apostrophes are normalised before any rule looks at the title.
function normaliseTitle(title: string): string {
  return title.replace(/\s+/g, ' ').replace(/[\u2018\u2019]/g, "'").trim()
}

// "$15.15 $17 HR depending on location" is a pay rate, not a role. A real
// title never opens with an amount of money, measured against the live
// catalogue before shipping: zero real postings start this way.
function isPayRateTitle(title: string): boolean {
  return /^[$€£]\s?\d/.test(title)
}

export function isLikelyRealJob(title: string, description: string, company: string): boolean {
  const t = normaliseTitle(title)
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
  if (isFuturePipelineTitle(lower)) return false
  if (isVacancyCountTitle(lower)) return false
  if (isPayRateTitle(t)) return false
  if (isUrlLike(t)) return false
  if (isAllCapsSlogan(t)) return false
  if (isQuestionOrBlogTitle(t)) return false
  if (!/[a-zA-Z]{3,}/.test(t)) return false

  // Whitespace is collapsed for the same reason as in the title: the test row
  // above arrives as "Test\n\nJob Description\n\nTest\n\nQualifications", one
  // word per paragraph, and no phrase can match across paragraph breaks.
  const lowerDescription = deaccent(description.toLowerCase()).replace(/\s+/g, ' ')
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
