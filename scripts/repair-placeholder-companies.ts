/**
 * Repairs `jobs` rows whose `company` is a placeholder rather than a real
 * employer name. Himalayas' API intermittently returns the literal string
 * "name" as companyName while the company slug in the job URL stays correct,
 * so roughly 20 rows a day had been landing in the catalogue since 2026-07-28
 * rendering "at name" on screen and publishing it as the JobPosting
 * hiringOrganization, which is wrong data going straight to Google.
 *
 * Ingestion recovers the employer from the slug going forward. This repairs
 * the rows that already landed, rather than deactivating them, because they
 * are real postings with one broken field, not junk listings.
 *
 * The real name is taken from a healthy row sharing the same company slug
 * where one exists, so the exact display name and capitalisation are kept
 * ("M-KOPA", not "M Kopa"). Otherwise the slug is de-slugified.
 *
 * Rerunnable and safe: a row whose company already looks real is skipped.
 *
 * Usage: npx tsx --env-file=.env.local scripts/repair-placeholder-companies.ts [--dry-run]
 */
import { supabaseAdmin } from '../lib/db/supabase'
import { getAllActiveJobs } from '../lib/db/queries'
import { companyNameFromSlug, isPlaceholderCompany } from '../lib/utils/job-quality'

const jobsTable = supabaseAdmin as any
const dryRun = process.argv.includes('--dry-run')

// Both the application link and the guid Himalayas gives us are of the form
// https://himalayas.app/companies/<slug>/jobs/<job-slug>
function companySlugFromUrl(url: string): string | null {
  const match = /\/companies\/([^/]+)\//.exec(url ?? '')
  return match ? match[1] : null
}

async function main() {
  const jobs = await getAllActiveJobs()
  const broken = jobs.filter((j: any) => isPlaceholderCompany(j.company ?? ''))

  console.log(`${broken.length} of ${jobs.length} active jobs have a placeholder company.`)
  if (broken.length === 0) return

  // Build slug to real display name from the rows that came through healthy,
  // so we reuse the source's own capitalisation wherever it is available.
  const slugToRealName = new Map<string, string>()
  for (const job of jobs as any[]) {
    if (isPlaceholderCompany(job.company ?? '')) continue
    const slug = companySlugFromUrl(job.url)
    if (slug && !slugToRealName.has(slug)) slugToRealName.set(slug, job.company)
  }

  const repairs: { id: string; company: string; exact: boolean }[] = []
  const unrepairable: any[] = []

  for (const job of broken as any[]) {
    const slug = companySlugFromUrl(job.url)
    if (!slug) {
      unrepairable.push(job)
      continue
    }
    const exact = slugToRealName.get(slug)
    repairs.push({ id: job.id, company: exact ?? companyNameFromSlug(slug), exact: Boolean(exact) })
  }

  const exactCount = repairs.filter((r) => r.exact).length
  console.log(
    `${repairs.length} repairable (${exactCount} from a healthy sibling row, ${repairs.length - exactCount} de-slugified), ${unrepairable.length} with no company slug in their URL.`
  )
  repairs.slice(0, 20).forEach((r) => console.log(`  - ${r.company}${r.exact ? '' : ' (de-slugified)'}`))
  unrepairable.slice(0, 10).forEach((j) => console.log(`  ! no slug: "${j.title}" ${j.url}`))

  if (dryRun) {
    console.log('\nDry run, nothing written.')
    return
  }

  // One statement per row, since each gets its own company value.
  let updated = 0
  for (const repair of repairs) {
    const { error } = await jobsTable.from('jobs').update({ company: repair.company }).eq('id', repair.id)
    if (error) throw error
    updated++
  }

  console.log(`\nRepaired ${updated} rows.`)
}

main().catch((err) => {
  console.error('Repair failed:', err)
  process.exit(1)
})
