import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { cache } from 'react'
import { getActiveJobsByTitle, getAllJobs, getJobById } from '@/lib/db/queries'
import { buildJobSlug, extractJobIdFromSlug } from '@/lib/utils/job-slug'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import { JOB_CATEGORIES, jobMatchesCategory } from '@/lib/utils/job-categories'
import { deriveApplicantCountries } from '@/lib/utils/job-country'
import { validThroughFor } from '@/lib/utils/job-freshness'
import { resolveCanonicalJob } from '@/lib/utils/job-duplicates'
import type { Job } from '@/lib/db/types'
import Logo from '@/components/Logo'

export const revalidate = 3600
export const dynamicParams = true

const SITE_URL = 'https://matchremote.io'

const EMPLOYMENT_TYPE_MAP: Record<Job['job_type'], string> = {
  'full-time': 'FULL_TIME',
  'part-time': 'PART_TIME',
  contract: 'CONTRACTOR',
  freelance: 'CONTRACTOR',
}

// Cached so the metadata pass and the render share one lookup, and so both
// receive the same job object, which is what lets loadCanonicalJob below
// dedupe its own query too.
const loadJob = cache(async (slug: string): Promise<Job | null> => {
  const id = extractJobIdFromSlug(slug)
  if (!id) return null
  const job = await getJobById(id)
  // A deactivated job (filled, expired, or removed as a non-job listing) must
  // stop serving JobPosting structured data, not just drop out of listings
  // and the sitemap. getJobById does not filter by is_active since other
  // callers need the raw row, so the check belongs here.
  if (!job || !job.is_active) return null
  return job
})

// Sources publish one posting once per eligible country, so the same role can
// arrive as a dozen rows that differ only in the location chip. Each of those
// used to be its own self-canonical indexable page carrying its own JobPosting
// markup, which Google's job posting guidelines forbid. The pages stay, only
// the search signals collapse onto one row per group. Wrapped in cache so the
// metadata pass and the render share a single lookup.
const loadCanonicalJob = cache(async (job: Job): Promise<Job> => {
  const sameTitle = await getActiveJobsByTitle(job.title)
  return resolveCanonicalJob(job, sameTitle as Job[])
})

export async function generateStaticParams() {
  const jobs: Job[] = await getAllJobs(200)
  return jobs.map((job) => ({ slug: buildJobSlug(job) }))
}

// Google/Ahrefs both flag a <title> once it runs past ~60 characters, and
// the root layout appends " | matchremote" (14 more) to whatever this
// returns, so the budget here has to leave room for that suffix.
const MAX_TITLE_LENGTH = 46
// Ahrefs' healthy range is roughly 110 to 155 characters, short descriptions
// waste the space Google would otherwise show, long ones get cut off anyway.
const MIN_DESCRIPTION_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 155

function truncateAtWord(text: string, max: number): string {
  if (text.length <= max) return text
  const cut = text.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trim() + '…'
}

function buildJobTitle(job: Job): string {
  return truncateAtWord(`${job.title} at ${job.company}`, MAX_TITLE_LENGTH)
}

function buildJobDescription(job: Job): string {
  let description = `${job.title} at ${job.company}, a remote ${job.job_type} role${job.location ? ` open to ${job.location}` : ''}.`

  if (job.salary_min || job.salary_max) {
    description += ` Pays ${formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)}.`
  }

  // A missing salary used to leave this as dead-weight "Salary not specified"
  // text, which added length without adding value and still often left the
  // whole description under Ahrefs' minimum. A real value-prop sentence pads
  // it properly instead.
  if (description.length < MIN_DESCRIPTION_LENGTH) {
    description += ' Matched to your timezone, salary target, and work style with a free quiz on matchremote.'
  }

  return truncateAtWord(description, MAX_DESCRIPTION_LENGTH)
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const job = await loadJob(slug)
  if (!job) return {}

  const title = buildJobTitle(job)
  const description = buildJobDescription(job)
  // Built from the job row, never from the requested slug. Only the trailing id
  // decides which job renders, so echoing the request back would let every
  // spelling of the same page declare itself canonical.
  const url = `${SITE_URL}/jobs/${buildJobSlug(job)}`
  // When the source fanned this posting out per country, every copy points at
  // the one canonical row instead of at itself.
  const canonicalJob = await loadCanonicalJob(job)
  const canonicalUrl = `${SITE_URL}/jobs/${buildJobSlug(canonicalJob)}`

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: { title: `${title} | matchremote`, description, url, images: [`${SITE_URL}/opengraph-image`] },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const job = await loadJob(slug)
  if (!job) notFound()

  // extractJobIdFromSlug only reads the trailing id, so any text in front of it
  // used to render this same page with a 200 and its own canonical tag. That
  // turned one job into unlimited indexable duplicates, and it stranded the 229
  // listings whose company was repaired on 2026-08-14: their old URL stayed
  // indexed while the sitemap moved to a URL Google had never seen. Sending the
  // one canonical form a 308 hands those signals to the right page.
  const canonicalSlug = buildJobSlug(job)
  if (slug !== canonicalSlug) permanentRedirect(`/jobs/${canonicalSlug}`)

  const url = `${SITE_URL}/jobs/${canonicalSlug}`
  const category = JOB_CATEGORIES.find((c) => jobMatchesCategory(job, c))

  // A copy of a posting the source already published for another country must
  // not publish a second JobPosting for the same role, so only the canonical
  // row carries the markup. The duplicates keep the page, the breadcrumb and
  // the apply link, they just hand their search signals over via the canonical
  // tag set in generateMetadata.
  const canonicalJob = await loadCanonicalJob(job)
  const isCanonicalCopy = canonicalJob.id === job.id

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

  // jobLocationType is always TELECOMMUTE. Google treats jobLocation as
  // required unless a posting declares itself fully remote, so leaving the
  // type off asks for a physical address we do not have and never will, and
  // the URL Inspection API reported exactly that as an ERROR ("Missing field
  // jobLocation") on every page that omitted it. Every listing here comes from
  // a remote job board, so the claim is honest on all of them.
  //
  // applicantLocationRequirements stays conditional, which is the part that
  // genuinely cannot be guessed. No source gives a clean country field, only
  // free text location, so a country is named only when
  // deriveApplicantCountries can read one out of that text (see
  // lib/utils/job-country.ts). A job whose location is "Worldwide" or "EMEA"
  // is left unrestricted rather than pinned to a country we invented.
  const applicantCountries = deriveApplicantCountries(job.location)
  // Himalayas listings carry the source's own expiry, so those publish a real
  // date rather than our posting date plus MAX_JOB_AGE_DAYS estimate.
  const validThrough = validThroughFor(job.posted_date, job.expires_at)

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
    jobLocationType: 'TELECOMMUTE',
    ...(applicantCountries
      ? {
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
      {isCanonicalCopy && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jobPostingJsonLd) }}
        />
      )}
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

              <div style={{
                background: 'var(--surface-alt)',
                border: '1px solid var(--border)',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
              }}>
                <h2 className="font-display" style={{ fontSize: '22px', marginBottom: '8px' }}>
                  See jobs picked for you, not just this one
                </h2>
                <p style={{ color: 'var(--ink-soft)', marginBottom: '16px' }}>
                  Take the 3 minute quiz and get matched with remote roles based on your timezone, skills, and async needs.
                </p>
                <Link href="/quiz" className="btn-big" style={{ maxWidth: '320px' }}>
                  Get matched →
                </Link>
              </div>

              <a
                href={job.url}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="btn-big btn-ghost"
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
