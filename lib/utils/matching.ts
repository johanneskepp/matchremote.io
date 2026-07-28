import type { Job, QuizResponse } from '@/lib/db/types'

export interface MatchResult {
  score: number
  reasons: {
    asyncAlignment?: number
    salaryMatch?: number
    experienceMatch?: number
    skillsMatch?: number
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
const WEIGHTS = {
  asyncAlignment: 20,
  salaryMatch: 20,
  experienceMatch: 15,
  skillsMatch: 15,
  timezoneFit: 10,
  scheduleFit: 10,
  industryPreference: 10,
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
    timezoneFit: 0,
    scheduleFit: 0,
    industryPreference: 0,
  }

  const applicable: Record<keyof typeof WEIGHTS, boolean> = {
    asyncAlignment: true,
    salaryMatch: true,
    experienceMatch: true,
    skillsMatch: true,
    timezoneFit: true,
    scheduleFit: true,
    industryPreference: true,
  }

  // 1. ASYNC ALIGNMENT (20 points)
  // job.async_score is inferred from the description at ingest time
  // (lib/utils/async-score.ts) for every job, so this is always evaluable.
  if (job.async_score) {
    const asyncDiff = Math.abs(job.async_score - userPreferences.async_need)
    reasons.asyncAlignment = Math.max(0, 20 - asyncDiff * 2)
  } else {
    applicable.asyncAlignment = false
  }

  // 2. SALARY MATCH (20 points)
  if (job.salary_min && job.salary_max) {
    const userMin = userPreferences.salary_min
    const userMax = userPreferences.salary_max
    const jobMid = (job.salary_min + job.salary_max) / 2

    if (jobMid >= userMin && jobMid <= userMax) {
      reasons.salaryMatch = 20
    } else if (jobMid >= userMin * 0.8 && jobMid <= userMax * 1.2) {
      reasons.salaryMatch = 10
    } else if (jobMid >= userMin && jobMid <= userMax * 1.5) {
      reasons.salaryMatch = 5
    }
  } else {
    applicable.salaryMatch = false
  }

  // 3. EXPERIENCE LEVEL MATCH (15 points)
  // This is a simple match - in production, analyze job description
  if (job.description) {
    const experienceKeywords = getExperienceKeywords(userPreferences.experience_level)
    const descLower = job.description.toLowerCase()
    const matches = experienceKeywords.filter(kw => descLower.includes(kw)).length

    reasons.experienceMatch = Math.min(15, matches * 3)
  } else {
    applicable.experienceMatch = false
  }

  // 4. SKILLS MATCH (15 points)
  if (userPreferences.skills && userPreferences.skills.length > 0) {
    const descLower = (job.title + ' ' + job.description).toLowerCase()
    const skillMatches = userPreferences.skills.filter(skill =>
      descLower.includes(skill.toLowerCase())
    ).length

    const skillScore = (skillMatches / userPreferences.skills.length) * 15
    reasons.skillsMatch = Math.min(15, skillScore)
  } else {
    applicable.skillsMatch = false
  }

  // 5. TIMEZONE FIT (10 points)
  if (job.timezone && userPreferences.timezone) {
    if (job.timezone === userPreferences.timezone) {
      reasons.timezoneFit = 10
    } else if (isCompatibleTimezone(job.timezone, userPreferences.timezone)) {
      reasons.timezoneFit = 7
    } else {
      reasons.timezoneFit = 2
    }
  } else {
    applicable.timezoneFit = false
  }

  // 6. SCHEDULE FIT (10 points)
  // Check if job type matches preferences (mostly for async/flexible)
  if (userPreferences.work_schedule === 'flexible' && job.job_type === 'full-time') {
    reasons.scheduleFit = 10
  } else if (job.job_type === 'contract' && userPreferences.work_schedule === 'flexible') {
    reasons.scheduleFit = 8
  } else if (job.job_type === userPreferences.work_schedule) {
    reasons.scheduleFit = 10
  } else {
    reasons.scheduleFit = 3
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

    reasons.industryPreference = industryMatches > 0 ? 10 : 0
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
  userTimezone: string | null | undefined
): string | null {
  if (!jobTimezone || !userTimezone) return null
  if (jobTimezone.toLowerCase() === userTimezone.toLowerCase()) return 'Matches your timezone'
  if (isCompatibleTimezone(jobTimezone, userTimezone)) return 'Overlaps your hours'
  return null
}

/**
 * One short line naming the two strongest reasons a job scored well, shown
 * above the lock on paid matches so the lock is concrete rather than a blank
 * tease.
 *
 * Every phrase is gated on a threshold that can only be reached when the
 * underlying data actually exists. timezoneFit in particular is 0 whenever
 * job.timezone is null (the dimension is excluded from scoring entirely) and
 * only 2 when the regions genuinely do not overlap, so requiring 7 means we
 * never claim a timezone fit we cannot back. Same reasoning for the rest: no
 * phrase is emitted from a missing or weak signal.
 *
 * Deliberately qualitative. skillsMatch is a 0 to 15 score, not a count, so
 * "two of your three skills" would be invented precision.
 */
const TEASER_PHRASES: { key: keyof MatchResult['reasons']; min: number; strong: number; strongText: string; text: string }[] = [
  { key: 'salaryMatch', min: 10, strong: 20, strongText: 'your salary target', text: 'a salary near your target' },
  { key: 'skillsMatch', min: 8, strong: 12, strongText: 'your skills', text: 'part of your skill set' },
  { key: 'timezoneFit', min: 7, strong: 10, strongText: 'your timezone', text: 'hours that overlap yours' },
  { key: 'asyncAlignment', min: 14, strong: 18, strongText: 'how you like to work', text: 'a work style close to yours' },
  { key: 'experienceMatch', min: 9, strong: 13, strongText: 'your experience level', text: 'roughly your experience level' },
  { key: 'industryPreference', min: 10, strong: 10, strongText: 'an industry you picked', text: 'an industry you picked' },
]

export function getMatchTeaser(reasons: Record<string, number>): string {
  const hits = TEASER_PHRASES.filter((p) => (reasons[p.key] ?? 0) >= p.min)
    .slice(0, 2)
    .map((p) => ((reasons[p.key] ?? 0) >= p.strong ? p.strongText : p.text))

  if (hits.length === 0) return 'Partial fit on what you told us'
  if (hits.length === 1) return `Matches ${hits[0]}`
  return `Matches ${hits[0]} and ${hits[1]}`
}

/**
 * Get top matching jobs for a user
 */
export function rankJobs(
  jobs: Job[],
  userPreferences: QuizResponse
): Array<Job & { matchScore: number; matchReasons: any }> {
  console.log(`[Matching] Ranking ${jobs.length} jobs for user`)

  const ranked = jobs
    .map(job => {
      const { score, reasons } = calculateMatchScore(job, userPreferences)
      return {
        ...job,
        matchScore: score,
        matchReasons: reasons,
      }
    })
    .sort((a, b) => b.matchScore - a.matchScore)

  console.log(
    `[Matching] Top 3 matches: ${ranked
      .slice(0, 3)
      .map(j => `${j.title}(${j.matchScore})`)
      .join(', ')}`
  )

  return ranked
}

/**
 * Get human-readable explanation for match
 */
export function getMatchExplanation(
  reasons: Record<string, number>,
  matchScore: number
): string[] {
  const explanations: string[] = []

  if (reasons.asyncAlignment && reasons.asyncAlignment > 15) {
    explanations.push('✓ Great async-friendly work environment')
  }

  if (reasons.salaryMatch === 20) {
    explanations.push('✓ Salary matches your expectations')
  } else if (reasons.salaryMatch >= 10) {
    explanations.push('✓ Competitive salary')
  }

  if (reasons.skillsMatch && reasons.skillsMatch > 10) {
    explanations.push('✓ Your skills align well with the role')
  }

  if (reasons.timezoneFit >= 10) {
    explanations.push('✓ Perfect timezone match')
  } else if (reasons.timezoneFit >= 7) {
    explanations.push('✓ Reasonable timezone overlap')
  }

  if (reasons.experienceMatch && reasons.experienceMatch > 10) {
    explanations.push('✓ Experience level matches well')
  }

  if (matchScore >= 80) {
    explanations.push('💫 Exceptional match!')
  } else if (matchScore >= 60) {
    explanations.push('🎯 Strong match')
  }

  return explanations.length > 0
    ? explanations
    : ['Based on your preferences, this role could be a good fit']
}
