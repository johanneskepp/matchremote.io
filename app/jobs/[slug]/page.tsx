import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getAllJobs, getJobById } from '@/lib/db/queries'
import { buildJobSlug, extractJobIdFromSlug } from '@/lib/utils/job-slug'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import { JOB_CATEGORIES, jobMatchesCategory } from '@/lib/utils/job-categories'
import { deriveApplicantCountries } from '@/lib/utils/job-country'
import { validThroughFor } from '@/lib/utils/job-freshness'
import type { Job } from '@/lib/db/types'

export const revalidate = 3600
export const dynamicParams = true

const SITE_URL = 'https://matchremote.io'

const EMPLOYMENT_TYPE_MAP: Record<Job['job_type'], string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  freelance: 'CONTRACTOR',
}

async function loadJob(slug: string): Promise<Job | null> {
  const id = extractJobIdFromSlug(slug)
  if (!id) return null
  return getJobById(id)
}

export async function generateStaticParams() {
  const jobs: Job[] = await getAllJobs(200)
  return jobs.map((job) => ({ slug: buildJobSlug(job) }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const job = await loadJob(slug)
  if (!job) return {}

  const title = `${job.title} at ${job.company} (Remote)`
  const description = `${job.title} at ${job.company}, a remote ${job.job_type} role${job.location ? ` open to ${job.location}` : ''}. ${formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)}.`
  const url = `${SITE_URL}/jobs/${slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | matchremote`, description, url },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await loadJob(slug)
  if (!job) notFound()

  const url = `${SITE_URL}/jobs/${slug}`
  const category = JOB_CATEGORIES.find((c) => jobMatchesCategory(job, c))

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'Remote Jobs', item: `${SITE_URL}/remote-jobs` },
      ...(category
        ? [{ '@type': 'ListItem', position: 3, name: category.label, item: `${SITE_URL}/remote-jobs/${category.slug}` }]
        : []),
      { '@type': 'ListItem', position: category ? 4 : 3, name: job.title, item: url },
    ],
  }

  // Google requires applicantLocationRequirements whenever jobLocationType is
  // TELECOMMUTE, otherwise it flags a Search Console warning. None of our
  // ingest sources give a clean country field, only free text location, so
  // jobLocationType is only set when deriveApplicantCountries can honestly
  // name a country from that text (see lib/utils/job-country.ts), jobs with
  // vague or worldwide locations omit jobLocationType entirely rather than
  // claim TELECOMMUTE without backing it up.
  const applicantCountries = deriveApplicantCountries(job.location)
  const validThrough = validThroughFor(job.posted_date)

  const jobPostingJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description,
    identifier: {
      '@type': 'PropertyValue',
      name: 'matchremote',
      value: job.id,
    },
    datePosted: job.posted_date,
    // Tells Google when we stop treating this as open, which is the same
    // MAX_JOB_AGE_DAYS the daily ingestion deactivates on. Without it there is
    // nothing stopping a filled role from sitting in the index as live
    // JobPosting markup, which is what Google penalizes.
    ...(validThrough ? { validThrough } : {}),
    employmentType: EMPLOYMENT_TYPE_MAP[job.job_type],
    hiringOrganization: {
      '@type': 'Organization',
      name: job.company,
    },
    url,
    directApply: false,
    ...(applicantCountries
      ? {
          jobLocationType: 'TELECOMMUTE',
          applicantLocationRequirements: applicantCountries.map((name) => ({
            '@type': 'Country',
            name,
          })),
        }
      : {}),
    ...(job.salary_min && job.salary_max
      ? {
          baseSalary: {
            '@type': 'MonetaryAmount',
            currency: 'USD',
            value: {
              '@type': 'QuantitativeValue',
              minValue: job.salary_min,
              maxValue: job.salary_max,
              unitText: 'YEAR',
            },
          },
        }
      : {}),
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
            <span className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>matchremote</span>
          </Link>
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
        <section style={{ padding: '48px 0' }}>
          <div className="container">
            <nav aria-label="Breadcrumb" style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--ink-soft)' }}>
              <Link href="/remote-jobs" style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                Remote Jobs
              </Link>
              {category && (
                <>
                  {' / '}
                  <Link href={`/remote-jobs/${category.slug}`} style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                    {category.label}
                  </Link>
                </>
              )}
            </nav>
            <div className="card">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                <span className="chip chip-sm">{job.job_type}</span>
                {job.location && <span className="chip chip-sm">{job.location}</span>}
                <span className="chip chip-sm">{formatDate(job.posted_date)}</span>
              </div>

              <h1 className="font-display" style={{ fontSize: 'clamp(28px, 4vw, 40px)', marginBottom: '8px' }}>
                {job.title}
              </h1>
              <p style={{ fontSize: '18px', color: 'var(--ink-soft)', fontWeight: 600, marginBottom: '20px' }}>
                {job.company}
              </p>

              <div className="big-num" style={{ fontSize: '28px', marginBottom: '24px' }}>
                {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)}
              </div>

              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-big"
                style={{ maxWidth: '320px', marginBottom: '32px' }}
              >
                Apply on {job.source} →
              </a>

              {job.tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '32px' }}>
                  {job.tags.slice(0, 12).map((tag) => (
                    <span key={tag} className="chip chip-sm" style={{ background: 'var(--bg)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>About this role</h2>
              <p style={{ whiteSpace: 'pre-wrap', color: 'var(--ink)', lineHeight: 1.7 }}>
                {job.description}
              </p>
            </div>

            <div style={{ marginTop: '24px', textAlign: 'center' }}>
              <Link href="/quiz" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'underline' }}>
                Want jobs matched to your timezone and salary target? Take the 3 minute quiz →
              </Link>
            </div>

            {category && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <Link href={`/remote-jobs/${category.slug}`} style={{ color: 'var(--ink-soft)', fontWeight: 600, textDecoration: 'underline' }}>
                  Browse more remote {category.label.toLowerCase()} jobs →
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '22px' }}>🎯</span>
            <span className="font-display" style={{ fontWeight: 700 }}>matchremote</span>
          </div>
          <div style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>
            © 2026 matchremote. Made for people who want more.
          </div>
        </div>
      </footer>
    </div>
  )
}
