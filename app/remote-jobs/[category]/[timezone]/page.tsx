import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getCategoryBySlug } from '@/lib/utils/job-categories'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { formatSalary, formatDate } from '@/lib/utils/helpers'
import { getQualifyingComboPages, type ComboPage } from '@/lib/utils/combo-pages'

export const revalidate = 3600
// Combo pages only exist while there's enough real job data behind them
// (see MIN_COMBO_JOBS in lib/utils/combo-pages.ts). A combo not returned by
// generateStaticParams should 404, not silently render thin, so this stays
// false rather than the dynamicParams=true used on /jobs/[slug].
export const dynamicParams = false

const SITE_URL = 'https://matchremote.io'

export async function generateStaticParams() {
  const combos = await getQualifyingComboPages()
  return combos.map((c) => ({ category: c.category.slug, timezone: c.region }))
}

async function loadCombo(categorySlug: string, timezone: string): Promise<ComboPage | null> {
  const category = getCategoryBySlug(categorySlug)
  if (!category) return null
  const combos = await getQualifyingComboPages()
  return combos.find((c) => c.category.slug === categorySlug && c.region === timezone) ?? null
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; timezone: string }>
}): Promise<Metadata> {
  const { category: categorySlug, timezone } = await params
  const combo = await loadCombo(categorySlug, timezone)
  if (!combo) return {}

  const title = `Remote ${combo.category.label} Jobs in ${combo.regionLabel}`
  const description = `${combo.jobs.length} open remote ${combo.category.label.toLowerCase()} roles open to candidates in ${combo.regionLabel}. Matched to your timezone and salary target with a free 3 minute quiz.`
  const url = `${SITE_URL}/remote-jobs/${categorySlug}/${timezone}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title: `${title} | matchremote`, description, url },
    twitter: { title: `${title} | matchremote`, description },
  }
}

export default async function ComboPageRoute({
  params,
}: {
  params: Promise<{ category: string; timezone: string }>
}) {
  const { category: categorySlug, timezone } = await params
  const combo = await loadCombo(categorySlug, timezone)
  if (!combo) notFound()

  const url = `${SITE_URL}/remote-jobs/${categorySlug}/${timezone}`

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `Remote ${combo.category.label} Jobs in ${combo.regionLabel}`,
    url,
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: combo.jobs.map((job, i) => ({
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
      { '@type': 'ListItem', position: 3, name: combo.category.label, item: `${SITE_URL}/remote-jobs/${categorySlug}` },
      { '@type': 'ListItem', position: 4, name: combo.regionLabel, item: url },
    ],
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />

      <header style={{ padding: '20px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🎯</span>
            <span className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>matchremote</span>
          </Link>
          <Link href="/quiz" style={{
            padding: '12px 24px',
            background: 'var(--indigo)',
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
              <Link href={`/remote-jobs/${categorySlug}`} style={{ color: 'var(--ink-soft)', textDecoration: 'underline' }}>
                {combo.category.label}
              </Link>
              {' / '}
              {combo.regionLabel}
            </nav>
          </div>
          <div className="container-wide" style={{ textAlign: 'center' }}>
            <div className="chip" style={{ marginBottom: '16px' }}>
              {combo.category.emoji} {combo.category.label} · {combo.regionLabel}
            </div>
            <h1 className="font-display" style={{ fontSize: 'clamp(28px, 4.5vw, 42px)', marginBottom: '12px' }}>
              Remote {combo.category.label} Jobs in {combo.regionLabel}
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '560px', margin: '0 auto' }}>
              {combo.jobs.length} open roles for candidates based in {combo.regionLabel}. Take the free quiz to see which ones fit your salary target and work style.
            </p>
          </div>
        </section>

        <section style={{ padding: '16px 0 80px' }}>
          <div className="container-wide">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {combo.jobs.map((job) => (
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
                  <p style={{ fontWeight: 700, color: 'var(--indigo)', margin: 0 }}>
                    {formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'white' }}>
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
