import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllActiveJobs } from '@/lib/db/queries'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import Logo from '@/components/Logo'
import type { Job } from '@/lib/db/types'
import { ALL_JOBS_PAGE_SIZE as PAGE_SIZE } from '@/lib/utils/job-pagination'

// A full, paginated directory of every active job, newest first. Category
// pages only link to jobs whose title matches one of JOB_CATEGORIES's
// keyword heuristics, so any job that matches none of them had no real
// internal link pointing to it at all, only the sitemap. This page gives
// every job at least one, regardless of how well it categorizes.
export const revalidate = 3600
export const dynamicParams = true

const SITE_URL = 'https://matchremote.io'

function parsePage(segments?: string[]): number {
  if (!segments || segments.length === 0) return 1
  const n = parseInt(segments[0], 10)
  return Number.isFinite(n) && n > 0 ? n : 1
}

export async function generateStaticParams() {
  const jobs = await getAllActiveJobs()
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))
  const params: { page?: string[] }[] = [{ page: undefined }]
  for (let i = 2; i <= Math.min(totalPages, 10); i++) {
    params.push({ page: [String(i)] })
  }
  return params
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ page?: string[] }>
}): Promise<Metadata> {
  const { page: pageParam } = await params
  const page = parsePage(pageParam)

  const title = page === 1 ? 'All Remote Jobs' : `All Remote Jobs, Page ${page}`
  const description =
    'Every open remote role on matchremote, newest first. Matched to your timezone, salary target, and work style with a free 3 minute quiz.'
  const url = page === 1 ? `${SITE_URL}/remote-jobs/all` : `${SITE_URL}/remote-jobs/all/${page}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | matchremote`, description, url, images: [`${SITE_URL}/opengraph-image`] },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default async function AllJobsPage({ params }: { params: Promise<{ page?: string[] }> }) {
  const { page: pageParam } = await params
  const page = parsePage(pageParam)

  const jobs: Job[] = await getAllActiveJobs()
  const totalPages = Math.max(1, Math.ceil(jobs.length / PAGE_SIZE))
  if (page > totalPages) notFound()

  const pageJobs = jobs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const basePath = '/remote-jobs/all'
  const pageHref = (n: number) => (n === 1 ? basePath : `${basePath}/${n}`)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'All Remote Jobs',
    url: `${SITE_URL}${pageHref(page)}`,
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
      { '@type': 'ListItem', position: 3, name: 'All Jobs', item: `${SITE_URL}${basePath}` },
    ],
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
          <Link
            href="/quiz"
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'white',
              borderRadius: '12px',
              fontWeight: 700,
              textDecoration: 'none',
              fontSize: '16px',
            }}
          >
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
              {' / '}All Jobs
            </nav>
          </div>
          <div className="container-wide" style={{ textAlign: 'center' }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(30px, 5vw, 46px)', marginBottom: '12px' }}>
              All Remote Jobs
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto' }}>
              {jobs.length} open roles, newest first. Take the free quiz to see which ones fit your timezone and salary target.
            </p>
          </div>
        </section>

        <section style={{ padding: '16px 0 40px' }}>
          <div className="container-wide">
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
                  <p style={{ color: 'var(--ink-soft)', fontWeight: 600, marginBottom: '12px' }}>{job.company}</p>
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
                <Link href={pageHref(page - 1)} className="chip" style={{ textDecoration: 'none' }}>
                  ← Previous
                </Link>
              )}
              <span style={{ color: 'var(--ink-soft)', fontSize: '14px', padding: '0 8px' }}>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <Link href={pageHref(page + 1)} className="chip" style={{ textDecoration: 'none' }}>
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
            <Link href="/privacy" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>
              Privacy
            </Link>
            <Link href="/terms" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>
              Terms
            </Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote. Made for people who want more.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
