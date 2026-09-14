import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getQualifyingComboPages } from '@/lib/utils/combo-pages'
import ComboJobsListing, {
  buildComboMetadata,
  comboPageHref,
  comboTotalPages,
  loadCombo,
} from '@/components/ComboJobsListing'

export const revalidate = 21600
// A page number past the end of a combo should 404 rather than render an
// empty listing, and a page that only comes into existence as job volume
// grows between builds still has to render, so this stays true and the
// range check below does the work. A combo that does not qualify at all is
// still refused, loadCombo returns null for it exactly as on page 1.
export const dynamicParams = true

function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null
  const n = parseInt(raw, 10)
  return Number.isSafeInteger(n) ? n : null
}

export async function generateStaticParams() {
  const params: { category: string; timezone: string; n: string }[] = []
  for (const combo of await getQualifyingComboPages()) {
    const totalPages = comboTotalPages(combo.jobs.length)
    for (let i = 2; i <= totalPages; i++) {
      params.push({ category: combo.category.slug, timezone: combo.region, n: String(i) })
    }
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; timezone: string; n: string }>
}): Promise<Metadata> {
  const { category: categorySlug, timezone, n } = await params
  const page = parsePage(n)
  if (page === null) return {}
  const combo = await loadCombo(categorySlug, timezone)
  if (!combo) return {}
  return buildComboMetadata(combo, page)
}

export default async function ComboPagedPageRoute({
  params,
}: {
  params: Promise<{ category: string; timezone: string; n: string }>
}) {
  const { category: categorySlug, timezone, n } = await params
  const page = parsePage(n)
  if (page === null) notFound()

  const combo = await loadCombo(categorySlug, timezone)
  if (!combo) notFound()

  // Page 1 has exactly one canonical URL and it is not this one. Hand any
  // signals a /p/1 link picked up straight to it rather than serving the
  // same listing on two URLs, the same reasoning as the category pages.
  if (page === 1) permanentRedirect(comboPageHref(categorySlug, combo.region, 1))
  if (page > comboTotalPages(combo.jobs.length)) notFound()

  return <ComboJobsListing combo={combo} page={page} />
}
