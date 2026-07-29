// Maps the quiz UI's free form multi select answers onto the strict
// quiz_responses table columns used by the matching engine.

const SALARY_BUCKETS: Record<string, [number, number]> = {
  '30000': [0, 50000],
  '60000': [50000, 80000],
  '90000': [80000, 120000],
  '130000': [120000, 180000],
  '200000': [180000, 400000],
}

const EXPERIENCE_LEVELS: Record<string, number> = {
  junior: 1,
  mid: 2,
  senior: 4,
  lead: 5,
}

function mapSalaryRange(selected: string[] | undefined): { min: number; max: number } {
  if (!selected || selected.length === 0) return { min: 0, max: 400000 }
  const mins = selected.map((v) => SALARY_BUCKETS[v]?.[0] ?? 0)
  const maxs = selected.map((v) => SALARY_BUCKETS[v]?.[1] ?? 400000)
  return { min: Math.min(...mins), max: Math.max(...maxs) }
}

function mapExperienceLevel(selected: string[] | undefined): number {
  if (!selected || selected.length === 0) return 3
  const levels = selected.map((v) => EXPERIENCE_LEVELS[v] ?? 3)
  return Math.max(...levels)
}

function mapAsyncNeed(workStyle: string[] | undefined): number {
  const styles = workStyle || []
  const hasAsync = styles.includes('async')
  const hasSync = styles.includes('sync')
  if (hasAsync && !hasSync) return 9
  if (hasSync && !hasAsync) return 3
  return 6
}

function mapMeetingTolerance(workStyle: string[] | undefined): number {
  const styles = workStyle || []
  const hasAsync = styles.includes('async')
  const hasSync = styles.includes('sync')
  if (hasAsync && !hasSync) return 2
  if (hasSync && !hasAsync) return 9
  return 5
}

function mapWorkSchedule(workStyle: string[] | undefined): string {
  const styles = workStyle || []
  if (styles.includes('flexible')) return 'flexible'
  if (styles.includes('structured')) return 'structured'
  return 'flexible'
}

export function mapQuizAnswersToResponse(answers: Record<string, string[]>) {
  const { min, max } = mapSalaryRange(answers.salary)

  return {
    timezone: answers.timezone?.[0] ?? 'europe',
    async_need: mapAsyncNeed(answers.work_style),
    meeting_tolerance: mapMeetingTolerance(answers.work_style),
    salary_min: min,
    salary_max: max,
    skills: answers.role ?? [],
    experience_level: mapExperienceLevel(answers.experience),
    company_size_pref: answers.company_size ?? [],
    work_schedule: mapWorkSchedule(answers.work_style),
    industry_pref: answers.industries ?? [],
    remote_only: true,
  }
}
