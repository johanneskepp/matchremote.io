/**
 * Weekly report on programmatic "[role] jobs in [region]" combo page
 * coverage. The pages themselves regenerate automatically via
 * generateStaticParams in app/remote-jobs/[category]/[timezone]/page.tsx,
 * this script exists to surface the trend to the SEO agent (or a human):
 * which combos are live, which are close to the quality threshold, and
 * where the underlying job data is too thin to ever cover.
 *
 * Usage: npx tsx --env-file=.env.local scripts/analyze-combo-pages.ts
 */
import { getAllActiveJobs } from '../lib/db/queries'
import { JOB_CATEGORIES, jobMatchesCategory } from '../lib/utils/job-categories'
import { deriveTimezoneRegion, TIMEZONE_REGION_LABELS, type TimezoneRegion } from '../lib/utils/timezone-region'
import { MIN_COMBO_JOBS } from '../lib/utils/combo-pages'

async function main() {
  const jobs = await getAllActiveJobs()
  const regions = Object.keys(TIMEZONE_REGION_LABELS) as TimezoneRegion[]

  const rows: { category: string; region: string; count: number; status: string }[] = []

  for (const category of JOB_CATEGORIES) {
    for (const region of regions) {
      const count = jobs.filter((j) => jobMatchesCategory(j, category) && deriveTimezoneRegion(j.location) === region).length
      const status = count >= MIN_COMBO_JOBS ? 'LIVE' : count >= MIN_COMBO_JOBS - 2 ? 'CLOSE' : 'thin'
      rows.push({ category: category.slug, region, count, status })
    }
  }

  rows.sort((a, b) => b.count - a.count)

  const live = rows.filter((r) => r.status === 'LIVE')
  const close = rows.filter((r) => r.status === 'CLOSE')

  console.log(`Combo page threshold: ${MIN_COMBO_JOBS} jobs minimum.`)
  console.log(`\n${live.length} combo pages currently live:`)
  live.forEach((r) => console.log(`  - /remote-jobs/${r.category}/${r.region} (${r.count} jobs)`))

  console.log(`\n${close.length} combos close to unlocking (${MIN_COMBO_JOBS - 2}-${MIN_COMBO_JOBS - 1} jobs), worth checking again after the next ingest:`)
  close.forEach((r) => console.log(`  - ${r.category} / ${r.region} (${r.count} jobs, needs ${MIN_COMBO_JOBS - r.count} more)`))

  console.log(`\nFull breakdown:`)
  console.log(JSON.stringify(rows, null, 2))
}

main().catch((err) => {
  console.error('Combo page analysis failed:', err)
  process.exit(1)
})
