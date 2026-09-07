/**
 * Backfills `jobs.applicant_countries` for Himalayas rows ingested before that
 * column existed. Himalayas is the only source with a structured country
 * list (locationRestrictions), and it was already being flattened into the
 * `location` display text at ingest time (`restrictions.join(', ')`), so the
 * full original list is still sitting in that text for every existing row,
 * this is a reconstruction from data already stored, not a guess.
 *
 * A stored location of exactly "Worldwide" is the ingest fallback for a
 * genuinely empty locationRestrictions array (the source itself said no
 * restriction), not a real value to split, so those rows are left alone,
 * there is nothing to recover.
 *
 * This is what closes the gap the 2026-09-07 country cap opened for Himalayas
 * specifically: a job restricted to a real 34 country list was being read as
 * unrestricted because our own MAX_APPLICANT_COUNTRIES cap does not
 * distinguish a source's genuine list from our own free text keyword
 * matching over-triggering on a pasted country picker. Once
 * applicant_countries is populated, applicantCountriesFor and jobRegionsFor
 * both prefer it over that free text guess, cap included.
 *
 * Rerunnable and safe: a row that already has applicant_countries, or whose
 * location is "Worldwide", is skipped.
 *
 * Usage: npx tsx --env-file=.env.local scripts/repair-applicant-countries.ts [--dry-run]
 */
import { supabaseAdmin } from '../lib/db/supabase'
import { getAllActiveJobs } from '../lib/db/queries'

const jobsTable = supabaseAdmin as any
const dryRun = process.argv.includes('--dry-run')

async function main() {
  const jobs = await getAllActiveJobs()
  const himalayas = (jobs as any[]).filter((j) => j.source === 'himalayas')

  const repairs: { id: string; countries: string[]; location: string }[] = []

  for (const job of himalayas) {
    if (job.applicant_countries && job.applicant_countries.length > 0) continue
    const location = (job.location || '').trim()
    if (!location || location === 'Worldwide') continue

    const countries = location.split(',').map((c: string) => c.trim()).filter(Boolean)
    if (countries.length === 0) continue

    repairs.push({ id: job.id, countries, location })
  }

  console.log(`${himalayas.length} active Himalayas jobs, ${repairs.length} can recover a country list from their stored location text.`)

  const sizes = repairs.map((r) => r.countries.length)
  if (sizes.length > 0) {
    console.log(`Recovered list sizes: min ${Math.min(...sizes)}, max ${Math.max(...sizes)}, over the old cap of 12: ${sizes.filter((n) => n > 12).length}`)
  }

  for (const repair of repairs.slice(0, 15)) {
    console.log(`  - ${JSON.stringify(repair.location.slice(0, 80))} -> ${repair.countries.length} countries`)
  }

  if (repairs.length === 0) return

  if (dryRun) {
    console.log('\nDry run, nothing written.')
    return
  }

  let updated = 0
  for (const repair of repairs) {
    const { error } = await jobsTable
      .from('jobs')
      .update({ applicant_countries: repair.countries })
      .eq('id', repair.id)
    if (error) throw error
    updated++
  }

  console.log(`\nRepaired ${updated} rows.`)
}

main().catch((err) => {
  console.error('Repair failed:', err)
  process.exit(1)
})
