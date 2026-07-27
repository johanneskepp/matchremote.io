import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllJobs } from '@/lib/db/queries'
import { formatSalary } from '@/lib/utils/helpers'
import type { Job } from '@/lib/db/types'

// Design direction (2026-07-27): dark, restrained fintech-premium — a
// deliberate departure from the lighter Duolingo-esque shell still used by
// /quiz, /results, and /pricing, scoped to just this landing page per an
// explicit ask for a more serious first impression: darker, less on-page
// content, one dominant push toward the quiz, no emoji-driven decoration.
// Near-black surface, a single restrained indigo glow (not a rainbow of
// accents), lighter Fraunces weights for an editorial rather than playful
// feel. Colors are local consts rather than the shared --bg/--ink tokens so
// the rest of the site is untouched.
const BG = '#0A0C11'
const SURFACE = '#12151D'
const BORDER = 'rgba(255,255,255,0.08)'
const TEXT = '#F1F2F4'
const TEXT_MUTED = 'rgba(241,242,244,0.56)'
const ACCENT = '#6C67F5'
const ACCENT_SOFT = 'rgba(108,103,245,0.14)'
const SUCCESS = '#3FDDA0'

const TITLE = 'Personalized Remote Job Matches by Timezone, Salary & Work Style'
const DESCRIPTION =
  'Free 3 minute quiz matches you to remote jobs based on your timezone, salary target, and how you like to work. No signup, no keyword spam, just real fits.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io',
  },
  openGraph: {
    title: `matchremote: ${TITLE}`,
    description: DESCRIPTION,
    url: 'https://matchremote.io',
  },
  twitter: {
    title: `matchremote: ${TITLE}`,
    description: DESCRIPTION,
  },
}

const FAQS = [
  {
    question: 'How does matchremote match me to remote jobs?',
    answer:
      'You answer 15 quick questions about your skills, timezone, salary target, and how you like to work. We score every open role against your answers and show you the closest fits first.',
  },
  {
    question: 'Is matchremote really free?',
    answer:
      'Yes. Taking the quiz and seeing your top 3 matches is free, no signup required. Pro ($9/mo) unlocks every match, saved jobs, and email alerts.',
  },
  {
    question: 'What makes a job truly remote on matchremote?',
    answer:
      'We only list roles open to fully remote candidates in your region. No "remote three days a week" or surprise return to office policies.',
  },
  {
    question: 'Do I need to create an account to see my matches?',
    answer:
      'No. You can take the quiz and view your matches without signing up. An account just lets you save jobs and get alerts later.',
  },
  {
    question: 'How is matchremote different from other remote job boards?',
    answer:
      'Most job boards match on keywords alone. We also match on timezone, salary expectations, meeting load, and work style, so you see fewer jobs that look right but feel wrong.',
  },
]

const VALUE_ROWS = [
  {
    n: '01',
    title: 'Real fit, not keywords',
    text: 'Scored on salary target, timezone, and how you actually like to work.',
  },
  {
    n: '02',
    title: 'Fresh jobs, every day',
    text: 'Pulled continuously from the sources that actually post remote roles.',
  },
  {
    n: '03',
    title: 'Yours in minutes',
    text: 'Fifteen questions, then real matches. No account required to start.',
  },
]

// Fallback only, used if the jobs table has too few salaried listings to fill
// the ticker (e.g. right after a DB reset). Not shown once real data exists.
const FALLBACK_RECENT_JOBS = [
  { title: 'Senior React Developer', company: 'Vercel', pay: '$140k' },
  { title: 'Product Designer', company: 'Notion', pay: '$110k' },
  { title: 'Customer Success Manager', company: 'Zapier', pay: '$85k' },
  { title: 'DevOps Engineer', company: 'GitLab', pay: '$150k' },
  { title: 'Content Marketer', company: 'Buffer', pay: '$75k' },
  { title: 'Data Analyst', company: 'Automattic', pay: '$95k' },
]

async function getRecentTickerJobs() {
  const jobs: Job[] = await getAllJobs(300)
  const seenCompanies = new Set<string>()

  const recent = jobs
    .filter((job) => job.salary_min)
    .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
    .filter((job) => {
      // One listing per company keeps the ticker varied instead of repeating
      // the same employer (some sources post the same role across cities).
      if (seenCompanies.has(job.company)) return false
      seenCompanies.add(job.company)
      return true
    })
    .slice(0, 6)
    .map((job) => ({
      title: job.title,
      company: job.company,
      pay: formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined),
    }))

  return recent.length >= 3 ? recent : FALLBACK_RECENT_JOBS
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default async function Home() {
  const recentJobs = await getRecentTickerJobs()
  const tickerItems = [...recentJobs, ...recentJobs]

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT, position: 'relative', overflow: 'hidden' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Restrained glow, not a rainbow gradient mesh, just depth behind the hero */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-280px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '1100px',
          height: '620px',
          background: `radial-gradient(closest-side, ${ACCENT_SOFT}, transparent)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <header style={{ position: 'relative', padding: '24px 0', borderBottom: `1px solid ${BORDER}` }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '20px', fontWeight: 500, color: TEXT, letterSpacing: '-0.01em' }}>
              matchremote
            </span>
          </Link>
          <Link
            href="/quiz"
            style={{
              padding: '10px 20px',
              background: 'transparent',
              border: `1px solid ${BORDER}`,
              color: TEXT,
              borderRadius: '8px',
              fontWeight: 500,
              textDecoration: 'none',
              fontSize: '14px',
            }}
          >
            Take the quiz
          </Link>
        </div>
      </header>

      {/* Recently added jobs ticker */}
      <div
        aria-label="Recently added jobs"
        style={{ position: 'relative', overflow: 'hidden', padding: '10px 0', background: SURFACE, borderBottom: `1px solid ${BORDER}`, whiteSpace: 'nowrap' }}
      >
        <div className="job-ticker-track">
          {tickerItems.map((job, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: TEXT_MUTED }}>
              <span style={{
                fontFamily: 'ui-monospace, monospace',
                fontSize: '10px',
                letterSpacing: '0.06em',
                color: ACCENT,
                border: `1px solid ${ACCENT}`,
                borderRadius: '4px',
                padding: '2px 6px',
                flexShrink: 0,
              }}>NEW</span>
              <span style={{ color: TEXT }}>{job.title}</span>
              <span>at {job.company}</span>
              <span style={{ color: SUCCESS, fontWeight: 600 }}>{job.pay}</span>
            </span>
          ))}
        </div>
      </div>

      <main style={{ position: 'relative' }}>
        {/* Hero */}
        <section style={{ padding: '96px 0 72px' }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <div
              className="premium-fade-up"
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: TEXT_MUTED,
                marginBottom: '24px',
                animation: 'premium-fade-up 0.7s ease both',
              }}
            >
              Remote job matching, refined
            </div>

            <h1
              className="font-display premium-fade-up"
              style={{
                fontSize: 'clamp(38px, 6vw, 64px)',
                fontWeight: 300,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                marginBottom: '20px',
                color: TEXT,
                animation: 'premium-fade-up 0.7s ease 0.08s both',
              }}
            >
              Work matched to how<br />
              you <span style={{ color: ACCENT }}>actually</span> want to live.
            </h1>

            <p
              className="premium-fade-up"
              style={{
                fontSize: '18px',
                fontWeight: 300,
                color: TEXT_MUTED,
                maxWidth: '480px',
                margin: '0 auto 36px',
                lineHeight: 1.6,
                animation: 'premium-fade-up 0.7s ease 0.16s both',
              }}
            >
              Fifteen questions on salary, timezone, and work style. Real remote roles ranked by fit, not keywords.
            </p>

            <div
              className="premium-fade-up"
              style={{ animation: 'premium-fade-up 0.7s ease 0.24s both' }}
            >
              <Link
                href="/quiz"
                className="premium-cta"
                style={{
                  background: ACCENT,
                  color: '#fff',
                  boxShadow: `0 0 0 1px rgba(108,103,245,0.4), 0 12px 32px -8px ${ACCENT_SOFT}`,
                }}
              >
                Start matching →
              </Link>

              <p style={{ marginTop: '16px', fontSize: '13px', color: TEXT_MUTED }}>
                Top 3 matches free. Unlock every match for $9/mo.
              </p>
              <p style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(241,242,244,0.36)' }}>
                No signup to start · Fresh jobs daily · Fully remote only
              </p>
            </div>
          </div>
        </section>

        {/* Value row, condensed to three lines instead of two detailed columns */}
        <section style={{ padding: '56px 0', borderTop: `1px solid ${BORDER}` }}>
          <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '40px' }}>
            {VALUE_ROWS.map((row) => (
              <div key={row.n}>
                <div style={{ fontFamily: 'ui-monospace, monospace', fontSize: '13px', color: ACCENT, marginBottom: '10px' }}>
                  {row.n}
                </div>
                <h2 className="font-display" style={{ fontSize: '19px', fontWeight: 500, color: TEXT, marginBottom: '6px' }}>
                  {row.title}
                </h2>
                <p style={{ fontSize: '14px', color: TEXT_MUTED, margin: 0, lineHeight: 1.6 }}>
                  {row.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ, targets longtail search queries */}
        <section style={{ padding: '56px 0', borderTop: `1px solid ${BORDER}` }}>
          <div className="container">
            <h2 className="font-display" style={{ fontSize: '22px', fontWeight: 500, color: TEXT, marginBottom: '8px' }}>
              Frequently asked questions
            </h2>
            <div>
              {FAQS.map((faq) => (
                <details key={faq.question} style={{ borderBottom: `1px solid ${BORDER}` }}>
                  <summary
                    style={{
                      cursor: 'pointer',
                      listStyle: 'none',
                      padding: '18px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '16px',
                      fontFamily: 'Inter, sans-serif',
                      fontWeight: 500,
                      fontSize: '15px',
                      color: TEXT,
                    }}
                  >
                    {faq.question}
                  </summary>
                  <p style={{ margin: '0 0 18px', color: TEXT_MUTED, fontSize: '14px', lineHeight: 1.65, maxWidth: '640px' }}>
                    {faq.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section style={{ padding: '64px 0 80px', borderTop: `1px solid ${BORDER}` }}>
          <div className="container" style={{ textAlign: 'center' }}>
            <h2 className="font-display" style={{ fontSize: 'clamp(26px, 4vw, 36px)', fontWeight: 300, color: TEXT, marginBottom: '28px' }}>
              Ready to see your matches?
            </h2>
            <Link
              href="/quiz"
              className="premium-cta"
              style={{
                background: ACCENT,
                color: '#fff',
                boxShadow: `0 0 0 1px rgba(108,103,245,0.4), 0 12px 32px -8px ${ACCENT_SOFT}`,
              }}
            >
              Start quiz →
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ position: 'relative', padding: '28px 0', borderTop: `1px solid ${BORDER}` }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <span className="font-display" style={{ fontSize: '15px', fontWeight: 500, color: TEXT }}>matchremote</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/pricing" style={{ color: TEXT_MUTED, fontSize: '13px', textDecoration: 'none' }}>Pricing</Link>
            <span style={{ color: TEXT_MUTED, fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
