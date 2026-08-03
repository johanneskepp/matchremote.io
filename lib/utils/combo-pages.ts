import { getAllActiveJobs } from '@/lib/db/queries'
import { JOB_CATEGORIES, jobMatchesCategory, type JobCategory } from '@/lib/utils/job-categories'
import { deriveTimezoneRegion, TIMEZONE_REGION_LABELS, type TimezoneRegion } from '@/lib/utils/timezone-region'
import { sortJobsBySalaryFirst } from '@/lib/utils/job-sort'
import type { Job } from '@/lib/db/types'

// A "[role] jobs in [region]" page is only worth indexing once there's
// enough real data behind it, otherwise it's thin or empty content, worse
// for SEO than not having the page at all. This threshold is checked fresh
// on every build/revalidate, so pages appear automatically as job volume
// grows and disappear (404, via dynamicParams=false) if it drops back down,
// no manual page creation needed.
export const MIN_COMBO_JOBS = 5

export interface ComboPage {
  category: JobCategory
  region: TimezoneRegion
  regionLabel: string
  jobs: Job[]
}

export async function getQualifyingComboPages(): Promise<ComboPage[]> {
  const jobs: Job[] = await getAllActiveJobs()
  const combos: ComboPage[] = []

  for (const category of JOB_CATEGORIES) {
    for (const region of Object.keys(TIMEZONE_REGION_LABELS) as TimezoneRegion[]) {
      const matching = jobs.filter((job) => jobMatchesCategory(job, category) && deriveTimezoneRegion(job.location) === region)
      if (matching.length >= MIN_COMBO_JOBS) {
        combos.push({ category, region, regionLabel: TIMEZONE_REGION_LABELS[region], jobs: sortJobsBySalaryFirst(matching) })
      }
    }
  }

  return combos
}
