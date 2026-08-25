/**
 * Sources fan one posting out into one listing per eligible country, so a
 * single role arrives as many rows with the same title, the same employer and
 * the same description, differing only in the location field. Himalayas does
 * this heavily (one Bluelight Consulting data engineer role landed as 11 rows,
 * one per Latin American country), and every one of those rows used to get its
 * own /jobs/[slug] page, its own sitemap entry and its own JobPosting markup.
 *
 * Google's job posting guidelines are explicit that the same job must not be
 * published on multiple URLs, and it was already happening: two rows of that
 * Bluelight group came back "Submitted and indexed" from the URL Inspection
 * API on 2026-08-25, each naming itself as its own canonical, while a third
 * came back "Discovered, currently not indexed".
 *
 * The pages themselves stay: a visitor in Chile still wants the Chile listing.
 * Only the search signals are consolidated onto one row per group.
 */
import type { Job } from '@/lib/db/types'

type DuplicateCandidate = Pick<Job, 'id' | 'title' | 'company' | 'description' | 'posted_date'>

/**
 * Only the leading part of the description takes part in the key. Sources
 * truncate the same posting at slightly different lengths, and stripping
 * everything but letters and digits absorbs the bullet characters and stray
 * spacing that otherwise make two copies of one text look different.
 */
const DESCRIPTION_KEY_LENGTH = 200

function normalize(value: string | null | undefined): string {
  return String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, '')
}

/**
 * The title goes in raw and unnormalized on purpose. The job page can only
 * afford to look up its own group rather than load the whole catalogue, so it
 * queries by exact title, and that query is a guaranteed superset of the group
 * only while an exact title match is part of what defines the group. Loosening
 * it here would let the sitemap and the page disagree about which row is
 * canonical, which is worse than missing the occasional title that differs
 * only in capitalisation.
 */
export function duplicateKey(job: DuplicateCandidate): string {
  return [
    job.title,
    normalize(job.company),
    normalize(job.description).slice(0, DESCRIPTION_KEY_LENGTH),
  ].join('|')
}

/**
 * Oldest posting wins, falling back to the lowest id when a source stamps a
 * whole batch with the same time. Both inputs are immutable, so the choice is
 * stable: it only moves when the canonical row itself is retired, which is the
 * one case where it has to. Picking the newest instead would reshuffle the
 * canonical every time another country's copy arrived.
 */
export function pickCanonicalJob<T extends DuplicateCandidate>(group: T[]): T {
  return group.reduce((best, job) => {
    const bestDate = String(best.posted_date ?? '')
    const jobDate = String(job.posted_date ?? '')
    if (jobDate !== bestDate) return jobDate < bestDate ? job : best
    return String(job.id) < String(best.id) ? job : best
  })
}

/**
 * Given every active job, the ids that should carry the search signals: one
 * per duplicate group, plus every job that has no duplicates at all.
 */
export function canonicalJobIds(jobs: DuplicateCandidate[]): Set<string> {
  const groups = new Map<string, DuplicateCandidate[]>()
  for (const job of jobs) {
    const key = duplicateKey(job)
    const group = groups.get(key)
    if (group) group.push(job)
    else groups.set(key, [job])
  }
  return new Set([...groups.values()].map((group) => pickCanonicalJob(group).id))
}

/**
 * The canonical for one job, given the active jobs sharing its exact title.
 * Returns the job itself when it has no duplicates, so a caller can compare by
 * id to find out whether it is looking at the canonical copy.
 */
export function resolveCanonicalJob<T extends DuplicateCandidate>(job: T, sameTitleJobs: T[]): T {
  const key = duplicateKey(job)
  const group = sameTitleJobs.filter((candidate) => duplicateKey(candidate) === key)
  if (group.length < 2) return job
  return pickCanonicalJob(group)
}
