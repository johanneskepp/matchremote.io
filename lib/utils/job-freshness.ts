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
 * What absence from the feed does earn is a link check. Measured 2026-07-28 by
 * requesting a deliberately invented job URL at each source: Jobicy and
 * RemoteOK answer 404, Arbeitnow and Remotive answer 410. So all four do
 * remove pages and say so, and a check against them is worth making.
 *
 * The catch is that RemoteOK keeps a page up forever once published. A job
 * outside its feed and a job inside it were byte for byte indistinguishable in
 * testing, both showing the title and a live "Apply now" button. Checking it
 * still costs nothing and will catch a genuine removal, but for RemoteOK the
 * age rule is realistically the only lever.
 *
 * Himalayas is the exception, and the best case: it publishes an expiryDate on
 * every job in its API, so we store that and never need to guess or probe. It
 * also answers 403 to any request from us, which settles the question anyway.
 */

// Fallback for sources that publish no expiry of their own. Chosen by Johannes
// on 2026-07-28. Long enough that a slow but genuinely open role survives,
// short enough that visitors rarely meet a filled one.
export const MAX_JOB_AGE_DAYS = 40

// Every source except Himalayas, which blocks us and does not need checking
// because it hands us a real expiry date instead.
export const LINK_CHECKABLE_SOURCES = new Set(['remotive', 'remoteok', 'jobicy', 'arbeitnow'])

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
 * Past the expiry the source itself stated. Only Himalayas gives us one today.
 * Takes precedence over the age rule, because the source knows and we guess.
 */
export function isExpiredBySource(expiresAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!expiresAt) return false
  const expiry = new Date(expiresAt).getTime()
  if (Number.isNaN(expiry)) return false
  return expiry < now.getTime()
}

/**
 * Himalayas returns expiryDate as a Unix timestamp in seconds. Returns null on
 * anything that does not look like a plausible date, so a format change on
 * their side cannot quietly expire the whole source.
 */
export function parseSourceExpiry(epochSeconds: number | null | undefined): string | null {
  if (typeof epochSeconds !== 'number' || !Number.isFinite(epochSeconds)) return null

  const ms = epochSeconds * 1000
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return null

  // Sanity window: not already years past, not absurdly far ahead.
  const now = Date.now()
  const oneYearAgo = now - 365 * 86400000
  const twoYearsAhead = now + 2 * 365 * 86400000
  if (ms < oneYearAgo || ms > twoYearsAhead) return null

  return date.toISOString()
}

/**
 * The date we tell Google a listing stops being valid, for the JobPosting
 * validThrough field. Without it, Google has no way to know when we consider a
 * posting expired, and serving JobPosting markup for filled roles is the kind
 * of thing that earns a structured data penalty.
 *
 * Prefers the source's own expiry over our age heuristic, so the roughly one
 * in four listings that come with a real date publish that date rather than a
 * guess.
 */
export function validThroughFor(
  postedDate: string | null | undefined,
  expiresAt?: string | null
): string | null {
  if (expiresAt) {
    const stated = new Date(expiresAt)
    if (!Number.isNaN(stated.getTime())) return stated.toISOString()
  }

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
