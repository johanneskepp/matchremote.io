import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { JOB_CATEGORIES, getCategoryBySlug } from '@/lib/utils/job-categories'
import CategoryJobsListing, {
  buildCategoryMetadata,
  getCategoryJobs,
} from '@/components/CategoryJobsListing'

export const revalidate = 3600

export function generateStaticParams() {
  return JOB_CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return {}
  return buildCategoryMetadata(category, 1)
}

// Page 1 keeps the URL it has always had, /remote-jobs/[category], so nothing
// Google already indexed moves. Pages 2 and up live at
// /remote-jobs/[category]/p/[n], which cannot collide with the combo route
// /remote-jobs/[category]/[timezone] because that one matches two segments and
// this one matches three.
export default async function RemoteJobsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const jobs = await getCategoryJobs(category)
  return <CategoryJobsListing category={category} page={1} jobs={jobs} />
}
