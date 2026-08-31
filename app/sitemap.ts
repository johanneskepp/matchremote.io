import type { MetadataRoute } from 'next'
import { getAllActiveJobs } from '@/lib/db/queries'
import { JOB_CATEGORIES, jobMatchesCategory } from '@/lib/utils/job-categories'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { getQualifyingComboPages } from '@/lib/utils/combo-pages'
import { ALL_JOBS_PAGE_SIZE, CATEGORY_PAGE_SIZE } from '@/lib/utils/job-pagination'
import { canonicalJobIds } from '@/lib/utils/job-duplicates'

const BASE_URL = 'https://matchremote.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/quiz`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/remote-jobs`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/faq`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  // No arbitrary cap: 300 used to silently leave most active jobs out of the
  // sitemap entirely once the catalogue grew past it, invisible to Google.
  // Well under Google's 50,000 URL per sitemap limit even with room to grow.
  const jobs = await getAllActiveJobs()
  // One posting fanned out across countries by the source is still one job.
  // Submitting every copy asked Google to index the same posting on a dozen
  // URLs, which its job posting guidelines forbid and which it had already
  // started doing. Only the canonical copy is submitted, the rest carry a
  // canonical tag pointing at it, see lib/utils/job-duplicates.ts.
  const canonicalIds = canonicalJobIds(jobs)
  const jobPages: MetadataRoute.Sitemap = jobs
    .filter((job) => canonicalIds.has(job.id))
    .map((job) => ({
      url: `${BASE_URL}/jobs/${buildJobSlug(job)}`,
      lastModified: job.scraped_at ? new Date(job.scraped_at) : now,
      changeFrequency: 'weekly',
      priority: 0.5,
    }))

  // Category listings are paginated at CATEGORY_PAGE_SIZE, so page 2 and up
  // need their own entries or the jobs sitting on them lose the one internal
  // link their own category gives them. Page 1 keeps the bare URL.
  const categoryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.flatMap((category) => {
    const count = jobs.filter((job) => jobMatchesCategory(job, category)).length
    const totalPages = Math.max(1, Math.ceil(count / CATEGORY_PAGE_SIZE))
    return Array.from({ length: totalPages }, (_, i) => ({
      url:
        i === 0
          ? `${BASE_URL}/remote-jobs/${category.slug}`
          : `${BASE_URL}/remote-jobs/${category.slug}/p/${i + 1}`,
      lastModified: now,
      changeFrequency: 'daily' as const,
      priority: i === 0 ? 0.7 : 0.55,
    }))
  })

  const combos = await getQualifyingComboPages()
  const comboPages: MetadataRoute.Sitemap = combos.map((combo) => ({
    url: `${BASE_URL}/remote-jobs/${combo.category.slug}/${combo.region}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.65,
  }))

  // /remote-jobs/all, paginated, gives every job at least one real internal
  // link regardless of whether its title matches a category, closing the
  // orphan-page gap category pages alone leave behind.
  const allJobsTotalPages = Math.max(1, Math.ceil(jobs.length / ALL_JOBS_PAGE_SIZE))
  const allJobsPages: MetadataRoute.Sitemap = Array.from({ length: allJobsTotalPages }, (_, i) => ({
    url: i === 0 ? `${BASE_URL}/remote-jobs/all` : `${BASE_URL}/remote-jobs/all/${i + 1}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.6,
  }))

  return [...staticPages, ...categoryPages, ...comboPages, ...allJobsPages, ...jobPages]
}
