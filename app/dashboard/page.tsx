import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth/session'
import { getAccessState } from '@/lib/billing/subscription'
import { getAllUserMatches, getLatestQuizResponse, getUserMatchScores, markMatchesSeen } from '@/lib/db/queries'
import { diversifyTop, getMatchExplanation, getMatchTeaser, getTimezoneBadge } from '@/lib/utils/matching'
import { buildSalaryInsights } from '@/lib/utils/salary-insight'
import { matchSummaryLine, summarizeMatchStats } from '@/lib/utils/match-stats'
import { formatSalary } from '@/lib/utils/helpers'
import { FREE_MATCH_LIMIT } from '@/lib/plan'
import type { MatchView } from '@/components/MatchCard'
import DashboardMatches from './DashboardMatches'
import Logo from '@/components/Logo'

export const metadata: Metadata = {
  title: 'Your matches',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login?next=/dashboard')

  const [access, rows, quiz, allScores] = await Promise.all([
    getAccessState(user.id),
    getAllUserMatches(user.id),
    getLatestQuizResponse(user.id),
    getUserMatchScores(user.id),
  ])

  const unlocked = access.active

  // Same diversification as /api/matches so the free pair a signed in visitor
  // sees here matches what they saw on /results.
  const withJob = diversifyTop(
    rows.filter((row: any) => row.jobs),
    FREE_MATCH_LIMIT,
    (row: any) => ({ score: row.match_score, company: row.jobs?.company })
  )

  // Salary insight compares each job against the user's other matches in the
  // same role category, so it is built from the whole set before any locking.
  const insights = buildSalaryInsights(withJob.map((row: any) => row.jobs))
  const userTimezone: string | null = quiz?.timezone ?? null

  const matches: MatchView[] = withJob.map((row: any, index: number) => {
    const job = row.jobs
    const teaser = getMatchTeaser(row.match_reasons || {})
    const visible = unlocked || index < FREE_MATCH_LIMIT

    // Same discipline as /api/matches: a locked card never carries the
    // identifying fields into the payload, so nothing is recoverable client
    // side.
    if (!visible) {
      return { id: row.id, locked: true, matchScore: row.match_score, teaser }
    }

    return {
      id: job.id,
      locked: false,
      matchScore: row.match_score,
      teaser,
      title: job.title,
      company: job.company,
      location: job.location || (job.timezone ? `Remote (${job.timezone})` : 'Remote'),
      salary: formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined),
      tags: job.tags || [],
      matchReasons: getMatchExplanation(row.match_reasons || {}, row.match_score, {
        job,
        user: { timezone: userTimezone, industry_pref: quiz?.industry_pref },
      }),
      description: job.description,
      url: job.url,
      timezoneBadge: getTimezoneBadge(job.timezone, userTimezone, job.location),
      salaryInsight: insights[job.id]?.label ?? null,
    }
  })

  // Anything shown in full counts as seen, which keeps it out of future
  // notification emails.
  await markMatchesSeen(
    withJob.filter((_: any, i: number) => unlocked || i < FREE_MATCH_LIMIT).map((row: any) => row.id)
  )

  const summary = matchSummaryLine(summarizeMatchStats(allScores))

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/quiz" style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'none' }}>
              Retake quiz
            </Link>
            <Link href="/account" style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'none' }}>
              Account
            </Link>
          </div>
        </div>
      </header>

      <main style={{ flex: '1 1 auto', padding: '44px 0 72px' }}>
        <div className="container">
          <h1 className="font-display" style={{ fontSize: 'clamp(30px, 5vw, 42px)', marginBottom: '8px' }}>
            Your matches
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--ink-soft)', marginTop: 0, marginBottom: '28px' }}>
            {summary}
          </p>

          <DashboardMatches matches={matches} unlocked={unlocked} />
        </div>
      </main>
    </div>
  )
}
