/**
 * The one place that turns a user's match scores into the summary line shown
 * on the dashboard and repeated at the end of every notification email, so the
 * two can never quote different numbers.
 */

import { SCORE_THRESHOLDS } from '@/lib/plan'

export type MatchStats = {
  total: number
  // Keyed by the thresholds in SCORE_THRESHOLDS, value is how many matches
  // scored at or above it.
  atOrAbove: Record<number, number>
}

export function summarizeMatchStats(scores: number[]): MatchStats {
  const atOrAbove: Record<number, number> = {}
  for (const threshold of SCORE_THRESHOLDS) {
    atOrAbove[threshold] = scores.filter((s) => s >= threshold).length
  }
  return { total: scores.length, atOrAbove }
}

const WORDS = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen',
  'nineteen', 'twenty',
]

function spell(n: number): string {
  return n <= 20 ? WORDS[n] : String(n)
}

/**
 * "Eighteen matches over seventy five percent since you started."
 *
 * Picks the highest threshold the user actually has matches at, so the line
 * stays impressive without ever quoting a count of zero. Falls back to the
 * plain total when nothing clears the lowest threshold.
 */
export function matchSummaryLine(stats: MatchStats): string {
  if (stats.total === 0) return 'No matches scored yet.'

  const best = [...SCORE_THRESHOLDS]
    .sort((a, b) => b - a)
    .find((threshold) => stats.atOrAbove[threshold] > 0)

  if (!best) {
    const count = spell(stats.total)
    return `${count.charAt(0).toUpperCase()}${count.slice(1)} ${stats.total === 1 ? 'match' : 'matches'} scored since you started.`
  }

  const count = stats.atOrAbove[best]
  const word = spell(count)
  const percentWord = best === 60 ? 'sixty' : best === 75 ? 'seventy five' : best === 90 ? 'ninety' : String(best)

  return `${word.charAt(0).toUpperCase()}${word.slice(1)} ${count === 1 ? 'match' : 'matches'} over ${percentWord} percent since you started.`
}
