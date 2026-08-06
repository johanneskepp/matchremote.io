/**
 * Posts newly ingested jobs to the matchremote Mastodon account.
 *
 * Picks the newest active jobs that have never been posted (posted_to_mastodon_at
 * is null), posts a short announcement with a link back to the job's own page,
 * and only marks a job posted after the post actually succeeds, so a failure
 * leaves it queued for the next run instead of silently skipping it forever.
 *
 * Capped at MAX_PER_RUN per run on purpose: this account has no followers yet,
 * a wall of posts in one run reads as spam the moment it does have some.
 *
 * Usage:
 *   npm run social:mastodon                 post for real, up to MAX_PER_RUN jobs
 *   npm run social:mastodon -- --dry-run     print what would be posted, post nothing
 *   npm run social:mastodon -- --limit=1     post at most 1 job this run (still capped at MAX_PER_RUN)
 */

import { getJobsToPostToMastodon, markJobsPostedToMastodon } from '../lib/db/queries'
import { postToMastodon, mastodonConfigured } from '../lib/social/mastodon'
import { buildJobSlug } from '../lib/utils/job-slug'
import { formatSalary } from '../lib/utils/helpers'
import type { Job } from '../lib/db/types'

// Absolute ceiling regardless of what --limit asks for, so a typo can never
// turn into a spam run on an account with no followers yet.
const MAX_PER_RUN = 5
const SITE_URL = 'https://matchremote.io'
// Mastodon's default limit is 500 characters (varies by instance, but this
// is the universal safe floor).
const MAX_POST_LENGTH = 500

const dryRun = process.argv.includes('--dry-run')

const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
const requestedLimit = limitArg ? parseInt(limitArg.split('=')[1], 10) : MAX_PER_RUN
const runLimit = Number.isFinite(requestedLimit) && requestedLimit > 0 ? Math.min(requestedLimit, MAX_PER_RUN) : MAX_PER_RUN

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, Math.max(0, max - 1)).trimEnd() + '…'
}

function composePost(job: Job): string {
  const url = `${SITE_URL}/jobs/${buildJobSlug(job)}`
  const salary = job.salary_min ? formatSalary(job.salary_min, job.salary_max ?? undefined) : null

  // Budget everything except the title/company against the fixed parts, then
  // spend what is left on the title and company so the link is never the
  // thing that gets cut.
  const fixedTail = `${salary ? ` ${salary}.` : ''}\n\n${url}\n\n#RemoteWork #RemoteJobs`
  const budgetForNamePart = MAX_POST_LENGTH - 'New remote role: '.length - ' at .'.length - fixedTail.length

  const namePart = truncate(`${job.title} at ${job.company}`, Math.max(20, budgetForNamePart))

  return `New remote role: ${namePart}.${salary ? ` ${salary}.` : ''}\n\n${url}\n\n#RemoteWork #RemoteJobs`
}

async function main() {
  if (!mastodonConfigured()) {
    console.log('MASTODON_INSTANCE_URL or MASTODON_ACCESS_TOKEN is not configured, nothing to do.')
    return
  }

  if (dryRun) console.log('DRY RUN, nothing will actually be posted or marked.\n')

  const jobs: Job[] = await getJobsToPostToMastodon(runLimit)

  if (jobs.length === 0) {
    console.log('No new jobs to post.')
    return
  }

  console.log(`${jobs.length} job(s) queued to post.\n`)

  const posted: string[] = []
  let failed = 0

  for (const job of jobs) {
    const text = composePost(job)

    if (dryRun) {
      console.log(`--- ${job.title} at ${job.company} ---`)
      console.log(text)
      console.log(`(${text.length} chars)\n`)
      posted.push(job.id)
      continue
    }

    const result = await postToMastodon(text)
    if (!result.ok) {
      console.error(`Failed to post "${job.title}" at ${job.company}: ${result.error}`)
      failed++
      continue
    }

    console.log(`Posted: ${job.title} at ${job.company} (${result.uri})`)
    posted.push(job.id)
  }

  if (!dryRun && posted.length > 0) {
    await markJobsPostedToMastodon(posted)
  }

  console.log(`\nDone. ${dryRun ? 'Would post' : 'Posted'} ${posted.length}, ${failed} failed.`)
}

main().catch((error) => {
  console.error('[social:mastodon] fatal', error)
  process.exit(1)
})
