import Link from 'next/link'
import type { Metadata } from 'next'
import { getCategoryBySlug } from '@/lib/utils/job-categories'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { getQualifyingComboPages, type ComboPage } from '@/lib/utils/combo-pages'
import { CATEGORY_PAGE_SIZE as PAGE_SIZE } from '@/lib/utils/job-pagination'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import Logo from '@/components/Logo'

// Shared by app/remote-jobs/[category]/[timezone] (page 1) and
// app/remote-jobs/[category]/[timezone]/p/[n] (page 2 and up), the same
// split components/CategoryJobsListing.tsx gives the category pages.
// Combo pages used to render every matching job in one document, which
// reached 815 jobs and 1.62 MB on /remote-jobs/engineering/americas, and
// every crawler fetch of that page was 1.62 MB of origin transfer.

const SITE_URL = 'https://matchremote.io'

// "p" rather than "page" for the same reason as the category pages: Next
// builds its route keys by appending "/page", so a folder named page collides
// with the parent route's key and every paginated URL 404s at runtime.
export function comboPageHref(categorySlug: string, region: string, page: number): string {
  const base = `/remote-jobs/${categorySlug}/${region}`
  return page === 1 ? base : `${base}/p/${page}`
}

export function comboTotalPages(jobCount: number): number {
  return Math.max(1, Math.ceil(jobCount / PAGE_SIZE))
}

export async function loadCombo(categorySlug: string, region: string): Promise<ComboPage | null> {
  if (!getCategoryBySlug(categorySlug)) return null
  const combos = await getQualifyingComboPages()
  return combos.find((c) => c.category.slug === categorySlug && c.region === region) ?? null
}

export function buildComboMetadata(combo: ComboPage, page: number): Metadata {
  const base = `Remote ${combo.category.label} Jobs in ${combo.regionLabel}`
  const title = page === 1 ? base : `${base}, Page ${page}`
  const description =
    page === 1
      ? `${combo.jobs.length} open remote ${combo.category.label.toLowerCase()} roles open to candidates in ${combo.regionLabel}. Matched to your timezone and salary target with a free 3 minute quiz.`
      : `Page ${page} of ${combo.jobs.length} open remote ${combo.category.label.toLowerCase()} roles open to candidates in ${combo.regionLabel}. Matched to your timezone and salary target with a free 3 minute quiz.`
  const url = `${SITE_URL}${comboPageHref(combo.category.slug, combo.region, page)}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | matchremote`, description, url, images: [`${SITE_URL}/opengraph-image`] },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default function ComboJobsListing({ combo, page }: { combo: ComboPage; page: number }) {
  const totalPages = comboTotalPages(combo.jobs.length)
  const pageJobs = combo.jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const categorySlug = combo.category.slug
  const url = `${SITE_URL}${comboPageHref(categorySlug, combo.region, page)}`
  const heading = `Remote ${combo.category.label} Jobs in ${combo.regionLabel}`

  // Only this page's jobs, with the position offset, so the markup describes
  // the document Google actually fetched rather than the whole combo.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page === 1 ? heading : `${heading}, Page ${page}`,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: pageJobs.map((job, i) => ({
        '@type': 'ListItem',
        position: (page - 1) * PAGE_SIZE + i + 1,
        url: `${SITE_URL}/jobs/${buildJobSlug(job)}`,
      })),
    },
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Remote Jobs', item: `${SITE_URL}/remote-jobs` },
      { '@type': 'ListItem', position: 3, name: combo.category.label, item: `${SITE_URL}/remote-jobs/${categorySlug}` },
      { '@type': 'ListItem', position: 4, name: combo.regionLabel, item: `${SITE_URL}${comboPageHref(categorySlug, combo.region, 1)}` },
    ],
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
          <Link href="/quiz" style={{
            padding: '12px 24px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '16px',
          }}>
            Get matched →
          </Link>
        </div>
      </header>

      <main>
        <section style={{ padding: '48px 0 24px' }}>
          <div className="container-wide">
            <nav aria-label="Breadcrumb" style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--ink-soft)', textAlign: 'center' }}>
              <Link prefetch={false} href="/remote-jobs" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                Remote Jobs
              </Link>
              {' / '}
              <Link prefetch={false} href={`/remote-jobs/${categorySlug}`} style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                {combo.category.label}
              </Link>
              {' / '}
              {page === 1 ? (
                combo.regionLabel
              ) : (
                <>
                  <Link prefetch={false} href={comboPageHref(categorySlug, combo.region, 1)} style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                    {combo.regionLabel}
                  </Link>
                  {' / '}
                  {`Page ${page}`}
                </>
              )}
            </nav>
          </div>
          <div className="container-wide" style={{ textAlign: 'center' }}>
            <div className="chip" style={{ marginBottom: '16px' }}>
              {combo.category.emoji} {combo.category.label} · {combo.regionLabel}
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', marginBottom: '12px' }}>
              {heading}{page > 1 ? `, Page ${page}` : ''}
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto' }}>
              {combo.jobs.length} open roles for candidates based in {combo.regionLabel}. Take the free quiz to see which ones fit your salary target and work style.
            </p>
          </div>
        </section>

        <section style={{ padding: '16px 0 40px' }}>
          <div className="container-wide">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {pageJobs.map((job) => (
                <Link
                  prefetch={false}
                  key={job.id}
                  href={`/jobs/${buildJobSlug(job)}`}
                  className="card"
                  style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
                >
                  <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', flexWrap: 'wrap' }}>
                    <span className="chip chip-sm">{job.job_type}</span>
                    <span className="chip chip-sm">{formatDate(job.posted_date)}</span>
                  </div>
                  <h2 className="font-display" style={{ fontSize: '20px', marginBottom: '4px' }}>
                    {job.title}
                  </h2>
                  <p style={{ color: 'var(--ink-soft)', fontWeight: 600, marginBottom: '12px' }}>
                    {job.company}
                  </p>
                  <p style={{ fontWeight: 700, color: 'var(--accent)', margin: 0 }}>
                    {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {totalPages > 1 && (
          <section style={{ padding: '0 0 80px' }}>
            <div
              className="container-wide"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
            >
              {page > 1 && (
                <Link prefetch={false} href={comboPageHref(categorySlug, combo.region, page - 1)} className="chip" style={{ textDecoration: 'none' }}>
                  ← Previous
                </Link>
              )}
              <span style={{ color: 'var(--ink-soft)', fontSize: '14px', padding: '0 8px' }}>
                Page {page} of {totalPages}, {combo.jobs.length} open roles
              </span>
              {page < totalPages && (
                <Link prefetch={false} href={comboPageHref(categorySlug, combo.region, page + 1)} className="chip" style={{ textDecoration: 'none' }}>
                  Next →
                </Link>
              )}
            </div>
          </section>
        )}
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size={22} href="" />
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/privacy" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Terms</Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote. Made for people who want more.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
