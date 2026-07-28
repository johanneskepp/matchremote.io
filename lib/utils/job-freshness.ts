/**
 * When a listing stops counting as something you can still apply to.
 *
 * Two separate questions live here, and they are not the same question:
 *
 * 1. Is it too old to still be open? Age is the honest primary signal. Remote
 *    roles are usually filled within a month, and every serious job board
 *    expires listings on a timer for exactly this reason.
 *
 * 2. Did it vanish from the source feed? This one is deliberately NOT treated
 *    as evidence. Measured 2026-07-28: RemoteOK's API returns its most recent
 *    100 while we hold 127 active RemoteOK jobs, so at least 27 fall out of
 *    the window every single day purely by ageing, whether or not they are
 *    still hiring. Deactivating on feed absence alone would kill live listings.
 *
 * What absence from the feed does earn is a link check, but only for sources
 * where a dead listing actually says so. Measured per source on real dead
 * rows: Remotive returns a true 404, while RemoteOK and Arbeitnow answer 200
 * for closed and open listings alike, and Himalayas answers 403 to any request
 * from us. Checking those three would spend requests to learn nothing, so we
 * do not.
 */

// Chosen by Johannes on 2026-07-28. Long enough that a slow but genuinely open
// role survives, short enough that visitors rarely meet a filled one.
export const MAX_JOB_AGE_DAYS = 40

// Sources whose pages give a machine readable answer when a listing is gone.
// Anything not listed here is left to the age rule. Add a source only after
// checking a real dead listing from it, not from reading their docs.
export const LINK_CHECKABLE_SOURCES = new Set(['remotive'])

export function jobAgeInDays(postedDate: string | null | undefined, now: Date = new Date()): number | null {
  if (!postedDate) return null
  const posted = new Date(postedDate).getTime()
  if (Number.isNaN(posted)) return null
  return Math.floor((now.getTime() - posted) / 86400000)
}

export function isExpiredByAge(postedDate: string | null | undefined, now: Date = new Date()): boolean {
  const age = jobAgeInDays(postedDate, now)
  // Unknown posting date is left alone rather than guessed into expiry.
  if (age === null) return false
  return age > MAX_JOB_AGE_DAYS
}

/**
 * The date we tell Google a listing stops being valid, for the JobPosting
 * validThrough field. Without it, Google has no way to know when we consider a
 * posting expired, and serving JobPosting markup for filled roles is the kind
 * of thing that earns a structured data penalty.
 */
export function validThroughFor(postedDate: string | null | undefined): string | null {
  if (!postedDate) return null
  const posted = new Date(postedDate)
  if (Number.isNaN(posted.getTime())) return null
  return new Date(posted.getTime() + MAX_JOB_AGE_DAYS * 86400000).toISOString()
}

/**
 * Whether a fetched page says the listing is gone.
 *
 * A hard 404 or 410 is the reliable case. The phrase check is a secondary net
 * for boards that answer 200 with a "no longer accepting applications" page,
 * and is deliberately narrow: these strings appear in the closed state and not
 * in an ordinary posting.
 */
const GONE_PHRASES = [
  'no longer accepting applications',
  'this job is no longer available',
  'this position has been filled',
  'this job has expired',
  'job posting has expired',
]

export function looksGone(status: number, body: string): boolean {
  if (status === 404 || status === 410) return true
  if (status !== 200) return false

  const text = body.toLowerCase()
  return GONE_PHRASES.some((phrase) => text.includes(phrase))
}
