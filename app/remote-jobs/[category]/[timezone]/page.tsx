import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getQualifyingComboPages } from '@/lib/utils/combo-pages'
import ComboJobsListing, { buildComboMetadata, loadCombo } from '@/components/ComboJobsListing'

// Listings change once a day, when the 06:09 ingestion runs, so an hourly
// revalidate only moved the page from the free edge cache back to counted
// origin transfer 24 times a day for nothing. Six hours keeps repeated bot
// fetches within a day at the edge while new jobs still show the same day.
export const revalidate = 21600
// Combo pages only exist while there's enough real job data behind them
// (see MIN_COMBO_JOBS in lib/utils/combo-pages.ts). A combo not returned by
// generateStaticParams should 404, not silently render thin, so this stays
// false rather than the dynamicParams=true used on /jobs/[slug].
export const dynamicParams = false

export async function generateStaticParams() {
  const combos = await getQualifyingComboPages()
  return combos.map((c) => ({ category: c.category.slug, timezone: c.region }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; timezone: string }>
}): Promise<Metadata> {
  const { category: categorySlug, timezone } = await params
  const combo = await loadCombo(categorySlug, timezone)
  if (!combo) return {}
  return buildComboMetadata(combo, 1)
}

export default async function ComboPageRoute({
  params,
}: {
  params: Promise<{ category: string; timezone: string }>
}) {
  const { category: categorySlug, timezone } = await params
  const combo = await loadCombo(categorySlug, timezone)
  if (!combo) notFound()

  return <ComboJobsListing combo={combo} page={1} />
}
