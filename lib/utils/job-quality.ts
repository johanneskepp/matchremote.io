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
]

// Titles that are template placeholders rather than a real role name. Checked
// as an exact match so a legitimate title like "Test Engineer" still passes.
const EXACT_PLACEHOLDER_TITLES = ['test', 'job details', 'jop posting title']

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

const QUESTION_STARTERS = ['how ', 'why ', 'what ', 'when ']

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
  return title.includes('?') || QUESTION_STARTERS.some((q) => lower.startsWith(q))
}

export function isLikelyRealJob(title: string, description: string, company: string): boolean {
  const t = title.trim()
  if (t.length < 3) return false

  const lower = t.toLowerCase()
  if (lower === company.trim().toLowerCase()) return false
  if (BOILERPLATE_PHRASES.some((p) => lower.includes(p))) return false
  if (EXACT_PLACEHOLDER_TITLES.includes(lower)) return false
  if (isUrlLike(t)) return false
  if (isAllCapsSlogan(t)) return false
  if (isQuestionOrBlogTitle(t)) return false
  if (!/[a-zA-Z]{3,}/.test(t)) return false

  const lowerDescription = description.toLowerCase()
  if (DESCRIPTION_BOILERPLATE_PHRASES.some((p) => lowerDescription.includes(p))) return false

  // A real posting almost always has a real description. Both the title AND
  // the description being suspiciously thin is a stronger signal than either
  // alone (some legit short titles like "Caretaker" have full descriptions).
  if (description.trim().length < 30 && t.split(/\s+/).length <= 2) return false

  return true
}
