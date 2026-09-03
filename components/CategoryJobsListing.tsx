import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllActiveJobs } from '@/lib/db/queries'
import { jobMatchesCategory, type JobCategory } from '@/lib/utils/job-categories'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { getQualifyingComboPages } from '@/lib/utils/combo-pages'
import { sortJobsBySalaryFirst } from '@/lib/utils/job-sort'
import { CATEGORY_PAGE_SIZE as PAGE_SIZE } from '@/lib/utils/job-pagination'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import type { Job } from '@/lib/db/types'
import Logo from '@/components/Logo'

// Shared by app/remote-jobs/[category] (page 1) and
// app/remote-jobs/[category]/p/[n] (page 2 and up), so the two routes cannot
// drift apart the way the ingest script and the cleanup script once did.
// Everything about a category listing lives here.

const SITE_URL = 'https://matchremote.io'

// The paginated segment is "p" rather than the obvious "page" because Next
// builds its internal route keys by appending "/page", so a route folder
// named page collides with the category route's own key and every paginated
// URL 404s at runtime while still building cleanly. Verified the hard way.
export function categoryPageHref(slug: string, page: number): string {
  return page === 1 ? `/remote-jobs/${slug}` : `/remote-jobs/${slug}/p/${page}`
}

export async function getCategoryJobs(category: JobCategory): Promise<Job[]> {
  const allJobs = await getAllActiveJobs()
  return sortJobsBySalaryFirst(allJobs.filter((job) => jobMatchesCategory(job, category)))
}

export function categoryTotalPages(jobCount: number): number {
  return Math.max(1, Math.ceil(jobCount / PAGE_SIZE))
}

export function buildCategoryMetadata(category: JobCategory, page: number): Metadata {
  const base = `Remote ${category.label} Jobs`
  const title = page === 1 ? base : `${base}, Page ${page}`
  const description =
    page === 1
      ? `${category.description} Matched to your timezone, salary target, and work style with a free 3 minute quiz.`
      : `${category.description} Page ${page} of open roles, matched to your timezone and salary target with a free 3 minute quiz.`
  const url = `${SITE_URL}${categoryPageHref(category.slug, page)}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | matchremote`, description, url, images: [`${SITE_URL}/opengraph-image`] },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default async function CategoryJobsListing({
  category,
  page,
  jobs,
}: {
  category: JobCategory
  page: number
  jobs: Job[]
}) {
  const totalPages = categoryTotalPages(jobs.length)
  const pageJobs = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const regionLinks = (await getQualifyingComboPages()).filter((c) => c.category.slug === category.slug)
  const url = `${SITE_URL}${categoryPageHref(category.slug, page)}`

  // Only this page's jobs, with the position offset, so the markup describes
  // the document Google actually fetched rather than the whole category.
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: page === 1 ? `Remote ${category.label} Jobs` : `Remote ${category.label} Jobs, Page ${page}`,
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
      { '@type': 'ListItem', position: 3, name: category.label, item: `${SITE_URL}/remote-jobs/${category.slug}` },
    ],
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

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
              <Link href="/remote-jobs" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                Remote Jobs
              </Link>
              {' / '}
              {page === 1 ? (
                category.label
              ) : (
                <>
                  <Link href={`/remote-jobs/${category.slug}`} style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                    {category.label}
                  </Link>
                  {' / '}
                  {`Page ${page}`}
                </>
              )}
            </nav>
          </div>
          <div className="container-wide" style={{ textAlign: 'center' }}>
            <div className="chip" style={{ marginBottom: '16px' }}>
              {category.emoji} {category.label}
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(30px, 5vw, 46px)', marginBottom: '12px' }}>
              Remote {category.label} Jobs{page > 1 ? `, Page ${page}` : ''}
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto' }}>
              {category.description} Take the free quiz to see which ones fit your timezone and salary target.
            </p>
            {regionLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                {regionLinks.map((combo) => (
                  <Link
                    key={combo.region}
                    href={`/remote-jobs/${category.slug}/${combo.region}`}
                    className="chip chip-sm"
                    // These three chips sit above the fold, so Next prefetches
                    // every combo page as soon as this page renders. Combo
                    // pages are not paginated, so engineering/americas alone is
                    // a 1.34 MB document, and measured on production that made
                    // /remote-jobs/engineering pull 108 KB of combo payload
                    // inside a 401 KB load, 27% of everything the page fetches,
                    // for links most visitors never click. The chips still work
                    // exactly as before, they just fetch when clicked.
                    prefetch={false}
                    style={{ textDecoration: 'none' }}
                  >
                    In {combo.regionLabel} ({combo.jobs.length})
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ padding: '16px 0 40px' }}>
          <div className="container-wide">
            {pageJobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
                  No open {category.label.toLowerCase()} roles right now. New jobs are added regularly, check back soon.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {pageJobs.map((job) => (
                  <Link
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
            )}
          </div>
        </section>

        {totalPages > 1 && (
          <section style={{ padding: '0 0 80px' }}>
            <div
              className="container-wide"
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}
            >
              {page > 1 && (
                <Link href={categoryPageHref(category.slug, page - 1)} className="chip" style={{ textDecoration: 'none' }}>
                  ← Previous
                </Link>
              )}
              <span style={{ color: 'var(--ink-soft)', fontSize: '14px', padding: '0 8px' }}>
                Page {page} of {totalPages}, {jobs.length} open roles
              </span>
              {page < totalPages && (
                <Link href={categoryPageHref(category.slug, page + 1)} className="chip" style={{ textDecoration: 'none' }}>
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
