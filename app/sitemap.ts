import type { MetadataRoute } from 'next'
import { getAllActiveJobs } from '@/lib/db/queries'
import { JOB_CATEGORIES } from '@/lib/utils/job-categories'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { getQualifyingComboPages } from '@/lib/utils/combo-pages'

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

  const categoryPages: MetadataRoute.Sitemap = JOB_CATEGORIES.map((category) => ({
    url: `${BASE_URL}/remote-jobs/${category.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // No arbitrary cap: 300 used to silently leave most active jobs out of the
  // sitemap entirely once the catalogue grew past it, invisible to Google.
  // Well under Google's 50,000 URL per sitemap limit even with room to grow.
  const jobs = await getAllActiveJobs()
  const jobPages: MetadataRoute.Sitemap = jobs.map((job) => ({
    url: `${BASE_URL}/jobs/${buildJobSlug(job)}`,
    lastModified: job.scraped_at ? new Date(job.scraped_at) : now,
    changeFrequency: 'weekly',
    priority: 0.5,
  }))

  const combos = await getQualifyingComboPages()
  const comboPages: MetadataRoute.Sitemap = combos.map((combo) => ({
    url: `${BASE_URL}/remote-jobs/${combo.category.slug}/${combo.region}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.65,
  }))

  return [...staticPages, ...categoryPages, ...comboPages, ...jobPages]
}
