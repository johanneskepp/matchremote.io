import type { Job, QuizResponse } from '@/lib/db/types'
import { JOB_CATEGORIES, jobMatchesCategory } from './job-categories'
import { deriveApplicantCountries, deriveJobRegions } from './job-country'
import { TIMEZONE_REGION_LABELS, type TimezoneRegion } from './timezone-region'
import { formatSalary } from './helpers'

export interface MatchResult {
  score: number
  reasons: {
    asyncAlignment?: number
    salaryMatch?: number
    experienceMatch?: number
    skillsMatch?: number
    // Renamed from timezoneFit when it grew to cover eligibility as well as
    // hours. Rows scored before that still carry timezoneFit, which the
    // explanation helpers below still read.
    locationFit?: number
    timezoneFit?: number
    scheduleFit?: number
    industryPreference?: number
  }
}

// Max points per dimension if it can be evaluated at all. A job missing
// salary/timezone/industry data no longer gets a flat "partial credit" score
// that permanently caps its ceiling below 100, that structurally punished
// jobs for missing optional metadata rather than for being a poor fit.
// Instead, dimensions we can't evaluate are excluded from BOTH the earned
// points and the max-possible denominator, so the final percentage reflects
// only what we actually know, letting any job reach 100% on the dimensions
// that are knowable for it.
//
// Rebalanced 2026-07-28 after measuring the real distribution across 394 live
// jobs. The old split gave 394 jobs only 53 distinct scores, and just 7 across
// the whole top 20, because the two biggest dimensions barely moved:
// asyncAlignment handed exactly 12 of 20 to 365 of 394 jobs, and scheduleFit
// gave 10 of 10 to 336 of them. Forty of the hundred points were effectively a
// constant. Weight now sits on the dimensions that carry real, per job signal.
//
// The old `skillsMatch` was worse than uninformative: it substring searched the
// user's role word anywhere in the description, so "partnering across
// marketing, product, engineering, and content" scored a Senior SEO Manager a
// full 15 of 15 for someone looking for engineering work. 47 of its 92
// engineering "matches" were roles the title does not support. It is replaced
// by a title driven category match, reusing the same jobMatchesCategory that
// the category pages already rely on for exactly this reason.
const WEIGHTS = {
  skillsMatch: 25,
  locationFit: 20,
  salaryMatch: 20,
  experienceMatch: 15,
  industryPreference: 10,
  asyncAlignment: 5,
  scheduleFit: 5,
} as const

/**
 * Calculate match score between a user's preferences and a job
 * Returns a score 0-100 with detailed reasons
 */
export function calculateMatchScore(
  job: Job,
  userPreferences: QuizResponse
): MatchResult {
  console.log('[Matching] Calculating score for:', job.title)

  const reasons = {
    asyncAlignment: 0,
    salaryMatch: 0,
    experienceMatch: 0,
    skillsMatch: 0,
    locationFit: 0,
    scheduleFit: 0,
    industryPreference: 0,
  }

  const applicable: Record<keyof typeof WEIGHTS, boolean> = {
    asyncAlignment: true,
    salaryMatch: true,
    experienceMatch: true,
    skillsMatch: true,
    locationFit: true,
    scheduleFit: true,
    industryPreference: true,
  }

  // 1. ASYNC ALIGNMENT (5 points)
  // Deliberately small. lib/utils/async-score.ts infers this from description
  // keywords and lands on nearly the same value for almost every listing, so
  // it is a tie level nudge, not a real differentiator. Worth keeping only
  // because when a description does say "no standups" it says something true.
  if (job.async_score) {
    const asyncDiff = Math.abs(job.async_score - userPreferences.async_need)
    reasons.asyncAlignment = Math.max(0, 5 - asyncDiff * 0.5)
  } else {
    applicable.asyncAlignment = false
  }

  // 2. SALARY MATCH (20 points)
  // Continuous rather than the old four fixed tiers. Pay is one of the few
  // fields with genuinely fine grained data, so it should produce fine grained
  // scores instead of collapsing every near miss onto the same 10.
  if (job.salary_min && job.salary_max) {
    const userMin = userPreferences.salary_min
    const userMax = userPreferences.salary_max
    const jobMid = (job.salary_min + job.salary_max) / 2

    if (jobMid >= userMin && jobMid <= userMax) {
      reasons.salaryMatch = 20
    } else {
      // How far outside the target band, as a share of the band's own width,
      // so the penalty means the same thing to someone asking for 40k as to
      // someone asking for 200k.
      const distance = jobMid < userMin ? userMin - jobMid : jobMid - userMax
      const band = Math.max(userMax - userMin, 1)
      reasons.salaryMatch = Math.max(0, 20 * (1 - distance / band))
    }
  } else {
    applicable.salaryMatch = false
  }

  // 3. EXPERIENCE LEVEL MATCH (15 points)
  if (job.description) {
    const experienceKeywords = getExperienceKeywords(userPreferences.experience_level)
    const haystack = (job.title + ' ' + job.description).toLowerCase()
    const matches = experienceKeywords.filter(kw => haystack.includes(kw)).length

    // A hit in the title is the level the employer actually advertised, a hit
    // buried in body text is much weaker evidence, so the title is worth more.
    const titleLower = job.title.toLowerCase()
    const titleHit = experienceKeywords.some(kw => titleLower.includes(kw))
    reasons.experienceMatch = Math.min(15, matches * 3 + (titleHit ? 4 : 0))
  } else {
    applicable.experienceMatch = false
  }

  // 4. ROLE MATCH (25 points), stored under skillsMatch for continuity
  // Title driven, via the same categorization the category pages use. The old
  // version searched the whole description, which is how a Senior SEO Manager
  // came back as a perfect engineering match.
  if (userPreferences.skills && userPreferences.skills.length > 0) {
    reasons.skillsMatch = scoreRoleMatch(job, userPreferences.skills)
  } else {
    applicable.skillsMatch = false
  }

  // 5. LOCATION FIT (20 points)
  // Covers eligibility first and hours second. A listing naming specific
  // countries is telling you where it can hire, which matters more than
  // whether the clocks happen to overlap, so a job open only to a region the
  // user is not in is scored far below one that is genuinely open to them.
  if (userPreferences.timezone) {
    const jobRegions = deriveJobRegions(job.location, job.timezone)

    if (!jobRegions) {
      // No stated restriction. Open to the user as far as we know, but we
      // cannot claim any timezone alignment either, so it sits mid scale.
      reasons.locationFit = 13
    } else if (jobRegions.includes(userPreferences.timezone as any)) {
      reasons.locationFit = 20
    } else if (jobRegions.some((r) => isCompatibleTimezone(r, userPreferences.timezone))) {
      reasons.locationFit = 6
    } else {
      reasons.locationFit = 1
    }
  } else {
    applicable.locationFit = false
  }

  // 6. SCHEDULE FIT (5 points)
  // Shrunk from 10 for the same reason as async: 336 of 394 live jobs scored
  // full marks here, so it separates almost nothing.
  if (userPreferences.work_schedule === 'flexible' && job.job_type === 'full-time') {
    reasons.scheduleFit = 5
  } else if (job.job_type === 'contract' && userPreferences.work_schedule === 'flexible') {
    reasons.scheduleFit = 4
  } else if (job.job_type === userPreferences.work_schedule) {
    reasons.scheduleFit = 5
  } else {
    reasons.scheduleFit = 1.5
  }

  // 7. INDUSTRY PREFERENCE (10 points)
  // Only evaluable if the user actually cares about industry AND the job has
  // at least one inferred industry tag, an empty jobIndustries list means we
  // don't know, not that it doesn't match, so it's excluded rather than
  // scored 0.
  if (userPreferences.industry_pref && userPreferences.industry_pref.length > 0 && job.industries && job.industries.length > 0) {
    const industryMatches = userPreferences.industry_pref.filter(pref =>
      job.industries.some(ind => ind.toLowerCase().includes(pref.toLowerCase()))
    ).length

    // Graded rather than the old all or nothing. Someone who picked saas and
    // ai should see a job that is both rank above one that is only saas.
    reasons.industryPreference =
      industryMatches === 0 ? 0 : 4 + 6 * (industryMatches / userPreferences.industry_pref.length)
  } else {
    applicable.industryPreference = false
  }

  // Percentage of only the dimensions we could actually evaluate, so a job
  // missing one field isn't punished as hard as one missing several.
  const totalWeight = Object.values(WEIGHTS).reduce((a, b) => a + b, 0)
  const applicableDims = (Object.keys(WEIGHTS) as (keyof typeof WEIGHTS)[]).filter((dim) => applicable[dim])
  const earned = applicableDims.reduce((sum, dim) => sum + reasons[dim], 0)
  const maxPossible = applicableDims.reduce((sum, dim) => sum + WEIGHTS[dim], 0)
  const rawPercent = maxPossible > 0 ? (earned / maxPossible) * 100 : 0

  // But a job we barely have data on still shouldn't be able to claim a
  // "perfect" match, that would be a false promise (e.g. a job with unknown
  // salary "perfectly" matching someone's salary target makes no sense).
  // Confidence factor scales the ceiling down with how much of the job we
  // actually know: 0.5 + 0.5 * (known weight / total weight). Missing only
  // salary (20/100 of the weight) caps the ceiling around 90%, missing
  // salary + timezone + industry caps it around 80%, full data keeps 100%
  // reachable.
  const confidence = 0.5 + 0.5 * (maxPossible / totalWeight)
  const score = Math.round(rawPercent * confidence)

  console.log('[Matching] Score calculated:', score, 'Breakdown:', reasons)

  return {
    score: Math.min(100, Math.max(0, score)),
    reasons,
  }
}

/**
 * How well a job's title matches the roles the user picked, out of 25.
 *
 * Graded on purpose. The old binary "the word appears somewhere" gave every
 * qualifying job the identical full score, which is a large part of why so
 * many matches tied. Here a title that names the role twice ("Senior Backend
 * Engineer" hits both 'engineer' and 'backend') outranks one that names it
 * once, which outranks a job whose title says nothing but whose description
 * does, which outranks a job that clearly belongs to another discipline.
 */
function scoreRoleMatch(job: Job, roles: string[]): number {
  const title = job.title.toLowerCase()

  let best = 0

  for (const role of roles) {
    const category = JOB_CATEGORIES.find((c) => c.slug === role.toLowerCase())

    if (!category) {
      // A role the category list does not cover, "other" for instance. Fall
      // back to looking for the word itself in the title, never the body.
      if (title.includes(role.toLowerCase())) best = Math.max(best, 18)
      continue
    }

    const hits = category.keywords.filter((kw) => title.includes(kw)).length

    if (hits >= 2) best = Math.max(best, 25)
    else if (hits === 1) best = Math.max(best, 20)
  }

  if (best > 0) return best

  // Nothing in the title. If the title does not place the job in any other
  // category either, a mention in the description is weak but honest evidence.
  // If it clearly belongs to a different discipline, that is a real mismatch.
  const belongsElsewhere = JOB_CATEGORIES.some((c) => jobMatchesCategory(job, c))
  if (belongsElsewhere) return 0

  const body = (job.description || '').toLowerCase()
  return roles.some((role) => body.includes(role.toLowerCase())) ? 7 : 0
}

/**
 * Get experience level keywords for matching
 */
function getExperienceKeywords(level: number): string[] {
  const keywords: Record<number, string[]> = {
    1: ['entry level', 'junior', 'graduate', 'internship', 'no experience', 'fresh'],
    2: ['junior', '1-3 years', 'early career', 'entry'],
    3: ['mid-level', 'experienced', '3-5 years', 'intermediate'],
    4: ['senior', '5+ years', 'lead', 'expert'],
    5: ['principal', 'staff', 'architect', '10+ years', 'very experienced'],
  }
  return keywords[level] || []
}

/**
 * Check if two timezone regions have workable overlap. Both the quiz
 * (app/quiz/page.tsx "timezone" question) and job ingestion
 * (lib/utils/timezone-region.ts) use the same three broad buckets, not
 * specific offsets, so compatibility is just adjacency between them:
 * americas/europe overlap in the morning/afternoon, europe/asia overlap
 * similarly, but americas/asia barely overlap at all.
 */
const ADJACENT_REGIONS: Record<string, string[]> = {
  americas: ['europe'],
  europe: ['americas', 'asia'],
  asia: ['europe'],
}

export function isCompatibleTimezone(region1: string, region2: string): boolean {
  return ADJACENT_REGIONS[region1.toLowerCase()]?.includes(region2.toLowerCase()) ?? false
}

/**
 * Short timezone badge for a single match, or null when we cannot say
 * anything truthful.
 *
 * Around half of ingested jobs have timezone null because their location text
 * was "Worldwide" or unparseable, and the regions we do have are three coarse
 * buckets rather than real offsets. So this returns null unless both sides are
 * known, and the wording stays at the level the data actually supports: same
 * broad region, or a neighbouring one with usable overlap. It never claims a
 * specific number of overlapping hours.
 */
export function getTimezoneBadge(
  jobTimezone: string | null | undefined,
  userTimezone: string | null | undefined,
  jobLocation?: string | null
): string | null {
  if (!userTimezone) return null

  // Prefer the countries named in the listing over the coarse ingested region,
  // for the same reason locationFit does: a stated country is an eligibility
  // fact, the region is an inference on top of it.
  const regions = deriveJobRegions(jobLocation, jobTimezone)
  if (!regions) return null

  if (regions.includes(userTimezone as any)) return 'Open where you are'
  if (regions.some((r) => isCompatibleTimezone(r, userTimezone))) return 'Overlaps your hours'
  return null
}

/**
 * One short line above the lock on a paid match, naming what actually carried
 * that particular job.
 *
 * Rewritten 2026-07-28. The previous version walked a fixed list in a fixed
 * order and emitted the first two phrases that cleared a threshold, so every
 * job whose strongest dimensions were the same pair produced the identical
 * sentence, and with scores clustering hard that was most of them.
 *
 * Now each dimension is ranked by how much of its own weight the job earned,
 * and the line names the ones this job did best at, in that job's own order. A
 * job carried by pay reads differently from one carried by location, even at
 * the same percentage.
 *
 * Still gated so nothing is claimed from missing data: a dimension that scored
 * below half its weight never gets a phrase, and locationFit only earns its
 * strong wording at the top of its range, which requires a stated region that
 * actually includes the user.
 */
const PHRASES: Record<string, { weight: number; strong: string; soft: string }> = {
  skillsMatch: { weight: 25, strong: 'the role you asked for', soft: 'work adjacent to your role' },
  locationFit: { weight: 20, strong: 'where you can actually work', soft: 'hours that overlap yours' },
  timezoneFit: { weight: 10, strong: 'your timezone', soft: 'hours that overlap yours' },
  salaryMatch: { weight: 20, strong: 'your salary target', soft: 'a salary near your target' },
  experienceMatch: { weight: 15, strong: 'your experience level', soft: 'roughly your experience level' },
  industryPreference: { weight: 10, strong: 'an industry you picked', soft: 'an industry you picked' },
  asyncAlignment: { weight: 5, strong: 'how you like to work', soft: 'a work style close to yours' },
}

type RankedDimension = { key: string; ratio: number; text: string }

function rankDimensions(reasons: Record<string, number>): RankedDimension[] {
  return Object.entries(PHRASES)
    .filter(([key]) => reasons[key] !== undefined && reasons[key] !== null)
    .map(([key, phrase]) => {
      const ratio = reasons[key] / phrase.weight
      return { key, ratio, text: ratio >= 0.9 ? phrase.strong : phrase.soft }
    })
    .filter((d) => d.ratio >= 0.5)
    .sort((a, b) => b.ratio - a.ratio)
}

export function getMatchTeaser(reasons: Record<string, number>): string {
  const ranked = rankDimensions(reasons)

  // locationFit replaced timezoneFit, so a row scored under either engine has
  // one of them but never both worth showing. Drop the weaker duplicate.
  const seen = new Set<string>()
  const hits = ranked
    .filter((d) => {
      if (seen.has(d.text)) return false
      seen.add(d.text)
      return true
    })
    .slice(0, 2)

  if (hits.length === 0) return 'Partial fit on what you told us'
  if (hits.length === 1) return `Matches ${hits[0].text}`
  return `Matches ${hits[0].text} and ${hits[1].text}`
}

/**
 * Get top matching jobs for a user, best first.
 *
 * Ties are broken on real information rather than whatever order the database
 * happened to return: a fresher posting first, then one that publishes a
 * salary, since both make a match more actionable. This never changes a score,
 * only the order two equal scores appear in.
 */
export function rankJobs(
  jobs: Job[],
  userPreferences: QuizResponse
): Array<Job & { matchScore: number; matchReasons: any }> {
  console.log(`[Matching] Ranking ${jobs.length} jobs for user`)

  const scored = jobs.map(job => {
    const { score, reasons } = calculateMatchScore(job, userPreferences)
    return { ...job, matchScore: score, matchReasons: reasons }
  })

  const postedAt = (job: Job) => (job.posted_date ? new Date(job.posted_date).getTime() : 0)

  const ranked = scored.sort((a, b) => {
    if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore
    const freshness = postedAt(b) - postedAt(a)
    if (freshness !== 0) return freshness
    const aHasPay = a.salary_min ? 1 : 0
    const bHasPay = b.salary_min ? 1 : 0
    return bHasPay - aHasPay
  })

  console.log(
    `[Matching] Top 3 matches: ${ranked
      .slice(0, 3)
      .map(j => `${j.title}(${j.matchScore})`)
      .join(', ')}`
  )

  return ranked
}

/**
 * Reorders the front of an already ranked list so the handful shown for free
 * are not near duplicates of each other.
 *
 * Two openings at the same company, or two identical scores describing the
 * same thing, waste the only slots a visitor sees before the paywall. This
 * walks the top of the list and pulls up the best candidate that differs from
 * what has already been picked, looking no further than `window` so it can
 * never promote a genuinely worse match to do it.
 *
 * This is ordinary recommendation practice, not a fudge: nothing is rescored,
 * and a job only moves ahead of another with the same or lower score.
 */
export function diversifyTop<T>(
  ranked: T[],
  count: number,
  read: (item: T) => { score: number; company?: string | null },
  window: number = 8
): T[] {
  if (ranked.length <= count) return ranked

  const picked: T[] = []
  const pool = [...ranked]

  while (picked.length < count && pool.length > 0) {
    const limit = Math.min(window, pool.length)
    let chosen = 0

    for (let i = 0; i < limit; i++) {
      const candidate = read(pool[i])
      const distinct = picked.every((p) => {
        const already = read(p)
        const sameCompany =
          already.company && candidate.company &&
          already.company.toLowerCase() === candidate.company.toLowerCase()
        return !sameCompany && already.score !== candidate.score
      })

      if (distinct) {
        chosen = i
        break
      }
      // Nothing distinct inside the window, keep the honest top pick.
    }

    picked.push(pool[chosen])
    pool.splice(chosen, 1)
  }

  return [...picked, ...pool]
}

/**
 * Optional facts about the job and the user, used to make each explanation
 * line concrete. Without it the lines still work, they are just generic.
 *
 * This exists because generic lines were the remaining source of sameness:
 * two jobs that both nail role, location and industry produced word for word
 * identical bullet lists even at different percentages. Naming the actual
 * country, the actual pay and the actual industry separates them using facts
 * already in the row, with nothing invented.
 */
export type ExplanationContext = {
  job?: {
    title?: string
    location?: string | null
    timezone?: string | null
    salary_min?: number | null
    salary_max?: number | null
    industries?: string[] | null
  }
  user?: {
    timezone?: string | null
    industry_pref?: string[] | null
  }
}

function specificLines(context: ExplanationContext): Record<string, string | null> {
  const job = context.job
  const user = context.user
  if (!job) return {}

  const out: Record<string, string | null> = {}

  if (job.title) {
    const category = JOB_CATEGORIES.find((c) => jobMatchesCategory({ title: job.title } as Job, c))
    if (category) out.skillsMatch = `✓ ${category.label} role, by job title`
  }

  const countries = deriveApplicantCountries(job.location)
  if (countries && countries.length > 0) {
    out.locationFit = countries.length === 1
      ? `✓ Hiring in ${countries[0]}`
      : `✓ Hiring in ${countries.slice(0, 2).join(' and ')}`
  } else if (user?.timezone) {
    const regions = deriveJobRegions(job.location, job.timezone)
    if (regions && regions.includes(user.timezone as any)) {
      out.locationFit = `✓ Open across ${TIMEZONE_REGION_LABELS[user.timezone as TimezoneRegion] ?? user.timezone}`
    }
  }

  if (job.salary_min || job.salary_max) {
    out.salaryMatch = `✓ Pays ${formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)}`
  }

  if (job.industries && job.industries.length > 0 && user?.industry_pref) {
    const shared = user.industry_pref.filter((pref) =>
      job.industries!.some((ind) => ind.toLowerCase().includes(pref.toLowerCase()))
    )
    if (shared.length > 0) {
      out.industryPreference = `✓ ${shared.map((s) => s.toUpperCase()).join(' and ')}, which you picked`
    }
  }

  return out
}

/**
 * Get human-readable explanation for match
 */
export function getMatchExplanation(
  reasons: Record<string, number>,
  matchScore: number,
  context: ExplanationContext = {}
): string[] {
  // Ordered by how much of each dimension this job actually earned, so the
  // first line names what carried this specific job rather than always leading
  // with the same sentence. Two jobs at the same percentage will list their
  // reasons in a different order whenever they got there differently.
  const LINES: Record<string, { strong: string; soft: string }> = {
    skillsMatch: {
      strong: '✓ The role you asked for, by title',
      soft: '✓ Close to the kind of role you picked',
    },
    locationFit: {
      strong: '✓ Open to people where you are',
      soft: '✓ Workable overlap with your hours',
    },
    timezoneFit: {
      strong: '✓ Perfect timezone match',
      soft: '✓ Reasonable timezone overlap',
    },
    salaryMatch: {
      strong: '✓ Pay lands inside your target range',
      soft: '✓ Pay is close to your target',
    },
    experienceMatch: {
      strong: '✓ Advertised at your experience level',
      soft: '✓ Roughly your experience level',
    },
    industryPreference: {
      strong: '✓ In an industry you picked',
      soft: '✓ Touches an industry you picked',
    },
    asyncAlignment: {
      strong: '✓ Describes the async setup you want',
      soft: '✓ Work style leans your way',
    },
  }

  // A concrete line beats the generic one whenever the row carries the fact.
  const specific = specificLines(context)

  const seen = new Set<string>()
  const explanations = rankDimensions(reasons)
    .map((d) => {
      if (specific[d.key]) return specific[d.key] as string
      const line = LINES[d.key]
      return d.ratio >= 0.9 ? line.strong : line.soft
    })
    .filter((line) => {
      if (seen.has(line)) return false
      seen.add(line)
      return true
    })
    .slice(0, 4)

  if (matchScore >= 80) {
    explanations.push('💫 Exceptional match')
  } else if (matchScore >= 60) {
    explanations.push('🎯 Strong match')
  }

  return explanations.length > 0
    ? explanations
    : ['Based on your preferences, this role could be a good fit']
}
