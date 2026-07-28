/**
 * One time cleanup: deactivates existing rows in the `jobs` table that don't
 * pass the isLikelyRealJob quality filter (added 2026-07-28) or come from a
 * small confirmed list of non-job sources. Soft delete via is_active=false,
 * fully reversible, nothing is dropped from the table.
 *
 * Usage: npx tsx --env-file=.env.local scripts/cleanup-non-job-listings.ts
 */
import { supabaseAdmin } from '../lib/db/supabase'
import { isLikelyRealJob } from '../lib/utils/job-quality'

const jobsTable = supabaseAdmin as any

const KNOWN_NON_JOB_SOURCES = new Set(['world veterans', 'devtube', 'adconversion'])

async function main() {
  const { data: jobs, error } = await jobsTable.from('jobs').select('id, title, description, company').eq('is_active', true)
  if (error) throw error

  const toDeactivate = (jobs ?? []).filter((j: any) => {
    if (KNOWN_NON_JOB_SOURCES.has(j.company.trim().toLowerCase())) return true
    return !isLikelyRealJob(j.title, j.description ?? '', j.company)
  })

  console.log(`${toDeactivate.length} of ${jobs.length} active jobs will be deactivated:`)
  toDeactivate.forEach((j: any) => console.log(`- ${j.title} (${j.company})`))

  if (toDeactivate.length === 0) return

  const { error: updateError } = await jobsTable
    .from('jobs')
    .update({ is_active: false })
    .in('id', toDeactivate.map((j: any) => j.id))

  if (updateError) throw updateError
  console.log(`Deactivated ${toDeactivate.length} non-job listings.`)
}

main().catch((err) => {
  console.error('Cleanup failed:', err)
  process.exit(1)
})
