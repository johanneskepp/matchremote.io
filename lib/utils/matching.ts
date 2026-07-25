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

  // 1. ASYNC ALIGNMENT (20 points)
  // If job has async_score, compare with user's async_need
  if (job.async_score) {
    const asyncDiff = Math.abs(job.async_score - userPreferences.async_need)
    reasons.asyncAlignment = Math.max(0, 20 - asyncDiff * 2)
  } else {
    // Default to 10 points if async_score not available
    reasons.asyncAlignment = 10
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
    reasons.salaryMatch = 5 // Partial credit if salary not specified
  }

  // 3. EXPERIENCE LEVEL MATCH (15 points)
  // This is a simple match - in production, analyze job description
  if (job.description) {
    const experienceKeywords = getExperienceKeywords(userPreferences.experience_level)
    const descLower = job.description.toLowerCase()
    const matches = experienceKeywords.filter(kw => descLower.includes(kw)).length

    reasons.experienceMatch = Math.min(15, matches * 3)
  }

  // 4. SKILLS MATCH (15 points)
  if (userPreferences.skills && userPreferences.skills.length > 0) {
    const descLower = (job.title + ' ' + job.description).toLowerCase()
    const skillMatches = userPreferences.skills.filter(skill =>
      descLower.includes(skill.toLowerCase())
    ).length

    const skillScore = (skillMatches / userPreferences.skills.length) * 15
    reasons.skillsMatch = Math.min(15, skillScore)
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
    reasons.timezoneFit = 5 // Partial credit
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
  if (userPreferences.industry_pref && userPreferences.industry_pref.length > 0) {
    const jobIndustries = job.industries || []
    const industryMatches = userPreferences.industry_pref.filter(pref =>
      jobIndustries.some(ind => ind.toLowerCase().includes(pref.toLowerCase()))
    ).length

    reasons.industryPreference = industryMatches > 0 ? 10 : 0
  }

  // Calculate total
  const score = Math.round(
    Object.values(reasons).reduce((a, b) => a + b, 0)
  )

  console.log('[Matching] Score calculated:', score, 'Breakdown:', reasons)

  return {
    score: Math.min(100, score),
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
 * Check if two timezones are compatible (within 4 hours)
 */
function isCompatibleTimezone(tz1: string, tz2: string): boolean {
  // Simplified timezone compatibility check
  const tzMap: Record<string, number> = {
    // UTC offsets for common timezones
    'UTC': 0,
    'PST': -8, 'PDT': -7,
    'MST': -7, 'MDT': -6,
    'CST': -6, 'CDT': -5,
    'EST': -5, 'EDT': -4,
    'GMT': 0,
    'CET': 1, 'CEST': 2,
    'IST': 5.5,
    'SGT': 8,
    'AEST': 10,
    'JST': 9,
  }

  const offset1 = tzMap[tz1.toUpperCase()] ?? 0
  const offset2 = tzMap[tz2.toUpperCase()] ?? 0

  return Math.abs(offset1 - offset2) <= 4
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
