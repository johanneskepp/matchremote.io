/**
 * Daily match notification email.
 *
 * For every user who still has access, finds the matches that are new to them,
 * clear their own score threshold, and have never been emailed or already
 * shown on screen, then sends one combined email and marks those matches
 * notified. A user with nothing new gets no email at all that day.
 *
 * The "never twice" guarantee is the pair of null checks in
 * getUnnotifiedMatches: notified_at null means it was never emailed, seen_at
 * null means it was never shown for free on /results or in /dashboard. Both
 * columns are set the moment either thing happens, so a job cannot come back
 * around in a later send.
 *
 * Usage:
 *   npm run notify:matches            send for real
 *   npm run notify:matches -- --dry-run   report what would be sent, send nothing
 */

import {
  createEmailLog,
  getAlertSettings,
  getPayingUsers,
  getUnnotifiedMatches,
  getUserMatchScores,
  markMatchesNotified,
} from '../lib/db/queries'
import { isActive } from '../lib/billing/subscription'
import { sendMatchNotification, type NotifiableMatch } from '../lib/email/match-notification'
import { getMatchTeaser } from '../lib/utils/matching'
import { matchSummaryLine, summarizeMatchStats } from '../lib/utils/match-stats'
import { DEFAULT_ALERT_THRESHOLD } from '../lib/plan'

// One email stays readable at this length. Anything above the cap keeps its
// notified_at null and simply leads the next send.
const MAX_PER_EMAIL = 10

const dryRun = process.argv.includes('--dry-run')

async function main() {
  if (dryRun) console.log('DRY RUN, no email will be sent and nothing will be marked notified.\n')

  const subscriptions = await getPayingUsers()
  const withAccess = subscriptions.filter((s: any) => isActive(s) && s.users)

  console.log(`${subscriptions.length} subscription rows, ${withAccess.length} with active access.`)

  let sent = 0
  let skippedNothingNew = 0
  let skippedAlertsOff = 0
  let failed = 0

  for (const subscription of withAccess) {
    const user = subscription.users
    const settings = await getAlertSettings(user.id)

    if (settings && settings.active === false) {
      skippedAlertsOff++
      continue
    }

    // A guest row has no real inbox to reach, so it is never emailed.
    if (!user.email || user.email.endsWith('@guest.matchremote.io')) {
      skippedAlertsOff++
      continue
    }

    const threshold = settings?.threshold ?? DEFAULT_ALERT_THRESHOLD
    const rows = (await getUnnotifiedMatches(user.id, threshold)).filter((row: any) => row.jobs)

    if (rows.length === 0) {
      skippedNothingNew++
      continue
    }

    const batch = rows.slice(0, MAX_PER_EMAIL)
    const matches: NotifiableMatch[] = batch.map((row: any) => ({
      score: row.match_score,
      teaser: getMatchTeaser(row.match_reasons || {}),
      title: row.jobs.title,
      company: row.jobs.company,
      location: row.jobs.location || (row.jobs.timezone ? `Remote (${row.jobs.timezone})` : 'Remote'),
      salaryMin: row.jobs.salary_min ?? null,
      salaryMax: row.jobs.salary_max ?? null,
      url: row.jobs.url,
    }))

    // Counted before marking, so the closing line describes the history the
    // user already has rather than including what this email is introducing.
    const summary = matchSummaryLine(summarizeMatchStats(await getUserMatchScores(user.id)))

    if (dryRun) {
      console.log(`\nWould email ${user.email}`)
      console.log(`  threshold ${threshold}%, ${rows.length} qualifying, sending ${batch.length}`)
      for (const match of matches) console.log(`  ${match.score}%  ${match.title} at ${match.company}`)
      console.log(`  closing line: ${summary}`)
      sent++
      continue
    }

    const result = await sendMatchNotification(user.email, matches, summary)

    if (!result.ok) {
      console.error(`Failed for ${user.email}: ${result.error}`)
      failed++
      continue
    }

    // Only marked after the send actually succeeded, so a failure leaves the
    // matches queued for the next run instead of silently burning them.
    await markMatchesNotified(batch.map((row: any) => row.id))
    await createEmailLog(user.id, user.email, result.subject, 'match_notification', result.id)

    console.log(`Sent ${batch.length} to ${user.email} (threshold ${threshold}%)`)
    sent++
  }

  console.log(
    `\nDone. ${dryRun ? 'Would send' : 'Sent'} ${sent}, ${skippedNothingNew} had nothing new, ${skippedAlertsOff} skipped, ${failed} failed.`
  )
}

main().catch((error) => {
  console.error('[notify:matches] fatal', error)
  process.exit(1)
})
