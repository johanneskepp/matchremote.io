/**
 * Salary insight badge: how one match's pay compares to the other matches the
 * same user got in the same role category.
 *
 * This is deliberately conservative. Roughly half the ingested jobs have no
 * salary at all, and the role categories come from title matching, so a
 * comparison built on one or two other listings would be noise dressed up as
 * an insight. A badge is only produced when there are enough real peers to
 * average against, and only when the difference is big enough to mean
 * something. Everything else silently gets no badge, which is the honest
 * outcome, not a failure.
 */

import { JOB_CATEGORIES, jobMatchesCategory } from './job-categories'

// Other jobs (excluding the one being described) that must have a known
// salary in the same category before an average is worth quoting.
const MIN_PEERS = 3

// Under this, the gap says more about which listings happened to publish a
// range than about the job itself.
const MIN_DIFF_PERCENT = 5

export type SalaryInsight = {
  percent: number
  direction: 'above' | 'below'
  label: string
}

// Median rather than mean on purpose. Salary ranges are skewed and a single
// unusually high listing would otherwise relabel every ordinary job in the
// category as "below average", which is arithmetically true and completely
// useless. The median moves only when the middle of the pack moves.
function median(values: number[]): number {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]
}

function salaryMidpoint(job: any): number | null {
  const min = job?.salary_min
  const max = job?.salary_max
  if (typeof min === 'number' && typeof max === 'number') return (min + max) / 2
  if (typeof min === 'number') return min
  if (typeof max === 'number') return max
  return null
}

export function categorySlugFor(job: any): string | null {
  const category = JOB_CATEGORIES.find((c) => jobMatchesCategory(job, c))
  return category ? category.slug : null
}

/**
 * Returns a map of job id to insight. Jobs with no salary, no category, or too
 * few comparable peers are simply absent from the map.
 */
export function buildSalaryInsights(jobs: any[]): Record<string, SalaryInsight> {
  const byCategory = new Map<string, any[]>()

  for (const job of jobs) {
    if (salaryMidpoint(job) === null) continue
    const slug = categorySlugFor(job)
    if (!slug) continue
    const list = byCategory.get(slug) ?? []
    list.push(job)
    byCategory.set(slug, list)
  }

  const insights: Record<string, SalaryInsight> = {}

  for (const list of byCategory.values()) {
    if (list.length <= MIN_PEERS) continue

    for (const job of list) {
      // Compare against the others, never against an average this job is
      // itself part of, which would flatten the difference.
      const peers = list.filter((p) => p.id !== job.id)
      if (peers.length < MIN_PEERS) continue

      const typical = median(peers.map((p) => salaryMidpoint(p) as number))
      if (typical <= 0) continue

      const mine = salaryMidpoint(job) as number
      const percent = Math.round(((mine - typical) / typical) * 100)
      if (Math.abs(percent) < MIN_DIFF_PERCENT) continue

      const direction: 'above' | 'below' = percent > 0 ? 'above' : 'below'
      insights[job.id] = {
        percent: Math.abs(percent),
        direction,
        // "typical" rather than "average" because the comparison really is a
        // median, and the badge should not describe a statistic it does not use.
        label: `${Math.abs(percent)} percent ${direction} typical for similar roles in your matches`,
      }
    }
  }

  return insights
}
