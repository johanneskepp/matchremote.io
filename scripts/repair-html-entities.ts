/**
 * Repairs `jobs` rows whose text fields still hold HTML entities rather than
 * the characters they stand for. RemoteOK sends titles like "MARINE PAINTER
 * &amp; BLASTER", Jobicy (WordPress) sends companies like "Johnson &#038;
 * Johnson", Himalayas sends "&#x28;Contractor&#x29;".
 *
 * Left as they arrived, those rows render the entity literally in the h1 and
 * the title tag, publish it to Google as the JobPosting title and
 * hiringOrganization, and carry it into the URL slug as the words "amp" and
 * "038", since slugify drops "&" and ";" but keeps the entity body.
 *
 * Ingestion decodes these going forward. This repairs the rows that already
 * landed, rather than deactivating them, because they are real postings with
 * a mis-encoded field, not junk listings. Repairing title or company changes
 * the job's slug, which `/jobs/[slug]` already absorbs by 308 redirecting any
 * non canonical spelling to the canonical one.
 *
 * Rerunnable and safe: a row with no entity left in it is skipped, and the
 * decode is a single pass, so running twice cannot over decode a value.
 *
 * Usage: npx tsx --env-file=.env.local scripts/repair-html-entities.ts [--dry-run]
 */
import { supabaseAdmin } from '../lib/db/supabase'
import { getAllActiveJobs } from '../lib/db/queries'
import { containsHtmlEntity, decodeHtmlEntities, htmlToPlainText } from '../lib/utils/html-entities'

const jobsTable = supabaseAdmin as any
const dryRun = process.argv.includes('--dry-run')

// Plain text fields, so a single decode is the whole repair.
const TEXT_FIELDS = ['title', 'company', 'location'] as const

const TAG = /<\/?[a-z][^>]*>/i

async function main() {
  const jobs = await getAllActiveJobs()

  const repairs: { id: string; changes: Record<string, string>; before: Record<string, string> }[] = []

  for (const job of jobs as any[]) {
    const changes: Record<string, string> = {}
    const before: Record<string, string> = {}

    for (const field of TEXT_FIELDS) {
      const value = job[field]
      if (typeof value !== 'string' || !containsHtmlEntity(value)) continue

      const decoded = decodeHtmlEntities(value)
      if (decoded === value) continue

      changes[field] = decoded
      before[field] = value
    }

    // The description goes through the same cleaner ingestion uses, since the
    // rows that landed while the double escaping was mishandled hold real
    // markup, not just entities, and that renders as a literal "<p>" on the
    // page. Already clean descriptions come back unchanged.
    const description = job.description
    if (typeof description === 'string' && (containsHtmlEntity(description) || TAG.test(description))) {
      const cleaned = htmlToPlainText(description)
      if (cleaned !== description && cleaned.length > 0) {
        changes.description = cleaned
        before.description = description
      }
    }

    if (Object.keys(changes).length > 0) repairs.push({ id: job.id, changes, before })
  }

  const perField: Record<string, number> = {}
  for (const repair of repairs) {
    for (const field of Object.keys(repair.changes)) perField[field] = (perField[field] || 0) + 1
  }

  console.log(`${repairs.length} of ${jobs.length} active jobs carry an HTML entity.`)
  console.log('Fields affected:', perField)

  for (const repair of repairs.slice(0, 25)) {
    for (const [field, after] of Object.entries(repair.changes)) {
      const from = repair.before[field]
      console.log(`  - ${field}: ${JSON.stringify(from.slice(0, 80))} -> ${JSON.stringify(after.slice(0, 80))}`)
    }
  }

  if (repairs.length === 0) return

  if (dryRun) {
    console.log('\nDry run, nothing written.')
    return
  }

  // One statement per row, since each gets its own set of decoded values.
  let updated = 0
  for (const repair of repairs) {
    const { error } = await jobsTable.from('jobs').update(repair.changes).eq('id', repair.id)
    if (error) throw error
    updated++
  }

  console.log(`\nRepaired ${updated} rows.`)
}

main().catch((err) => {
  console.error('Repair failed:', err)
  process.exit(1)
})
