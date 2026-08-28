/**
 * Repairs `jobs` rows whose text was decoded as Latin-1 somewhere upstream, so
 * the UTF-8 bytes are being read one at a time instead of in groups. A right
 * single quote arrives as "â" plus two invisible control characters, an em dash
 * arrives as another such run, and a Chinese or Arabic city name arrives as a
 * whole line of Latin-1 letters.
 *
 * Left as they arrived, those rows render the damage in the visible h1 and the
 * title tag, and publish it to Google as the JobPosting title, hiringOrganization
 * and jobLocation, so an employer reads as "ç¾äº" rather than "百事".
 *
 * Every byte is still present, so this is an exact reconstruction rather than a
 * guess about which punctuation mark was meant. See lib/utils/mojibake.ts for
 * why the repair works on one run at a time instead of round tripping the whole
 * string, and for what stops it touching genuine accented text.
 *
 * Ingestion repairs this going forward. This repairs the rows that already
 * landed, rather than deactivating them, because they are real postings with a
 * mis-decoded field, not junk listings.
 *
 * Rerunnable and safe: a row that is already clean is skipped, and the repair is
 * idempotent, so running twice cannot over decode a value.
 *
 * Usage: npx tsx --env-file=.env.local scripts/repair-mojibake.ts [--dry-run]
 */
import { supabaseAdmin } from '../lib/db/supabase'
import { getAllActiveJobs } from '../lib/db/queries'
import { repairMojibake } from '../lib/utils/mojibake'

const jobsTable = supabaseAdmin as any
const dryRun = process.argv.includes('--dry-run')

const FIELDS = ['title', 'company', 'location', 'description'] as const

async function main() {
  const jobs = await getAllActiveJobs()

  const repairs: { id: string; changes: Record<string, string>; before: Record<string, string> }[] = []

  for (const job of jobs as any[]) {
    const changes: Record<string, string> = {}
    const before: Record<string, string> = {}

    for (const field of FIELDS) {
      const value = job[field]
      if (typeof value !== 'string' || value.length === 0) continue

      const repaired = repairMojibake(value)
      if (repaired === value) continue

      changes[field] = repaired
      before[field] = value
    }

    if (Object.keys(changes).length > 0) repairs.push({ id: job.id, changes, before })
  }

  const perField: Record<string, number> = {}
  for (const repair of repairs) {
    for (const field of Object.keys(repair.changes)) perField[field] = (perField[field] || 0) + 1
  }

  console.log(`${repairs.length} of ${jobs.length} active jobs carry mis-decoded text.`)
  console.log('Fields affected:', perField)

  for (const repair of repairs.slice(0, 25)) {
    for (const [field, after] of Object.entries(repair.changes)) {
      const from = repair.before[field]
      console.log(`  - ${field}: ${JSON.stringify(from.slice(0, 70))} -> ${JSON.stringify(after.slice(0, 70))}`)
    }
  }

  if (repairs.length === 0) return

  if (dryRun) {
    console.log('\nDry run, nothing written.')
    return
  }

  // One statement per row, since each gets its own set of repaired values.
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
