import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { JOB_CATEGORIES, getCategoryBySlug } from '@/lib/utils/job-categories'
import CategoryJobsListing, {
  buildCategoryMetadata,
  categoryTotalPages,
  getCategoryJobs,
} from '@/components/CategoryJobsListing'

export const revalidate = 3600
// A page number past the end of a category should 404 rather than render an
// empty listing, and an unbuilt page still has to render as job volume grows
// between builds, so this stays true and the range check below does the work.
export const dynamicParams = true

function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null
  const n = parseInt(raw, 10)
  return Number.isSafeInteger(n) ? n : null
}

export async function generateStaticParams() {
  const params: { category: string; n: string }[] = []
  for (const category of JOB_CATEGORIES) {
    const jobs = await getCategoryJobs(category)
    const totalPages = categoryTotalPages(jobs.length)
    for (let i = 2; i <= totalPages; i++) {
      params.push({ category: category.slug, n: String(i) })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; n: string }>
}): Promise<Metadata> {
  const { category: slug, n } = await params
  const category = getCategoryBySlug(slug)
  const page = parsePage(n)
  if (!category || page === null) return {}
  return buildCategoryMetadata(category, page)
}

export default async function RemoteJobsCategoryPagedPage({
  params,
}: {
  params: Promise<{ category: string; n: string }>
}) {
  const { category: slug, n } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const page = parsePage(n)
  if (page === null) notFound()
  // Page 1 has exactly one canonical URL and it is not this one. Hand any
  // signals a /page/1 link picked up straight to it rather than serving the
  // same listing on two URLs, the same reasoning as the job page 308.
  if (page === 1) permanentRedirect(`/remote-jobs/${slug}`)

  const jobs = await getCategoryJobs(category)
  if (page > categoryTotalPages(jobs.length)) notFound()

  return <CategoryJobsListing category={category} page={page} jobs={jobs} />
}
