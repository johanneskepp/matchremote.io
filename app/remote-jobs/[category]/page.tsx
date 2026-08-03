import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllActiveJobs } from '@/lib/db/queries'
import { JOB_CATEGORIES, getCategoryBySlug, jobMatchesCategory } from '@/lib/utils/job-categories'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { getQualifyingComboPages } from '@/lib/utils/combo-pages'
import { sortJobsBySalaryFirst } from '@/lib/utils/job-sort'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import type { Job } from '@/lib/db/types'
import Logo from '@/components/Logo'

export const revalidate = 3600

const SITE_URL = 'https://matchremote.io'

export function generateStaticParams() {
  return JOB_CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category: slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) return {}

  const title = `Remote ${category.label} Jobs`
  const description = `${category.description} Matched to your timezone, salary target, and work style with a free 3 minute quiz.`
  const url = `${SITE_URL}/remote-jobs/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | matchremote`, description, url },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default async function RemoteJobsCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category: slug } = await params
  const category = getCategoryBySlug(slug)
  if (!category) notFound()

  const allJobs: Job[] = await getAllActiveJobs()
  const jobs = sortJobsBySalaryFirst(allJobs.filter((job) => jobMatchesCategory(job, category)))
  const regionLinks = (await getQualifyingComboPages()).filter((c) => c.category.slug === slug)

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Remote ${category.label} Jobs`,
    url: `${SITE_URL}/remote-jobs/${slug}`,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: jobs.map((job, i) => ({
        '@type': 'ListItem',
        position: i + 1,
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
      { '@type': 'ListItem', position: 3, name: category.label, item: `${SITE_URL}/remote-jobs/${slug}` },
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
              {category.label}
            </nav>
          </div>
          <div className="container-wide" style={{ textAlign: 'center' }}>
            <div className="chip" style={{ marginBottom: '16px' }}>
              {category.emoji} {category.label}
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(30px, 5vw, 46px)', marginBottom: '12px' }}>
              Remote {category.label} Jobs
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto' }}>
              {category.description} Take the free quiz to see which ones fit your timezone and salary target.
            </p>
            {regionLinks.length > 0 && (
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '16px' }}>
                {regionLinks.map((combo) => (
                  <Link
                    key={combo.region}
                    href={`/remote-jobs/${slug}/${combo.region}`}
                    className="chip chip-sm"
                    style={{ textDecoration: 'none' }}
                  >
                    In {combo.regionLabel} ({combo.jobs.length})
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={{ padding: '16px 0 80px' }}>
          <div className="container-wide">
            {jobs.length === 0 ? (
              <div className="card" style={{ textAlign: 'center' }}>
                <p style={{ color: 'var(--ink-soft)', margin: 0 }}>
                  No open {category.label.toLowerCase()} roles right now. New jobs are added regularly, check back soon.
                </p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {jobs.map((job) => (
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
