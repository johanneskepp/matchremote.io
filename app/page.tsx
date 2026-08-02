import Link from 'next/link'
import type { Metadata } from 'next'
import { getAllJobs } from '@/lib/db/queries'
import { formatSalary } from '@/lib/utils/helpers'
import type { Job } from '@/lib/db/types'
import HeroSearch from './HeroSearch'
import Logo from '@/components/Logo'

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

export default async function Home() {
  const recentJobs = await getRecentTickerJobs()
  const tickerItems = [...recentJobs, ...recentJobs]

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div className="job-ticker" aria-label="Recently added jobs">
        <div className="job-ticker-track">
          {tickerItems.map((job, i) => (
            <span key={i} className="job-ticker-item">
              <span className="job-badge">NEW</span>
              {job.title}
              <span className="company">at {job.company}</span>
              <span className="pay">{job.pay}</span>
            </span>
          ))}
        </div>
      </div>

      <main className="hero-main">
        <div className="container-wide" style={{ maxWidth: '860px' }}>
          <nav className="hero-nav">
            <Link href="/pricing">Pricing</Link>
            <Link href="/auth/login">Log in</Link>
          </nav>

          <header className="hero-head">
            <h1 className="font-display hero-wordmark">
              <svg viewBox="0 0 128 128" aria-hidden="true" className="hero-wordmark-icon">
                <rect width="128" height="128" rx="30" fill="var(--accent)" />
                <circle cx="64" cy="64" r="46" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
                <circle cx="64" cy="64" r="27" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
                <circle cx="64" cy="64" r="9" fill="#FFFFFF" />
                <circle className="logo-pulse-dot" cx="112" cy="16" r="17" fill="var(--teal)" stroke="var(--bg)" strokeWidth="5" />
              </svg>
              match<span style={{ color: 'var(--accent)' }}>remote</span>
            </h1>
            <p>Hundreds of remote jobs. We show you yours.</p>
          </header>

          <HeroSearch />
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', alignItems: 'center' }}>
          <Logo size={18} href="" />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/remote-jobs" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Browse jobs</Link>
            <Link href="/pricing" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Pricing</Link>
            <Link href="/about" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>About</Link>
            <Link href="/faq" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>FAQ</Link>
            <Link href="/privacy" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Terms</Link>
            <a href="/feed.xml" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>RSS</a>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
