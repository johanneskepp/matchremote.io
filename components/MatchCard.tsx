'use client'

import Link from 'next/link'
import { PRICE_PER_WEEK_USD } from '@/lib/plan'

/**
 * The match card in its three states, shared by /results and /dashboard so the
 * two pages cannot drift apart.
 *
 * A locked card is never a hidden open card. The server strips company, title,
 * salary and link before they reach the browser, so what is missing here is
 * missing from the payload too, not just blurred in CSS.
 */
export type MatchView = {
  id: string
  locked: boolean
  matchScore: number
  teaser: string
  title?: string
  company?: string
  location?: string
  salary?: string
  tags?: string[]
  matchReasons?: string[]
  description?: string
  url?: string
  timezoneBadge?: string | null
  salaryInsight?: string | null
}

export function ScoreRing({ score }: { score: number }) {
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div className="score-ring">{score}%</div>
      <div className="score-ring-label">MATCH</div>
    </div>
  )
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span style={{
      display: 'inline-block',
      fontSize: '13px',
      fontWeight: 600,
      color: 'var(--teal)',
      background: 'var(--surface-alt)',
      borderRadius: '999px',
      padding: '5px 12px',
    }}>{children}</span>
  )
}

export function OpenMatchCard({ job }: { job: MatchView }) {
  const badges = [job.timezoneBadge, job.salaryInsight].filter(Boolean) as string[]

  return (
    <div className="card match-card">
      <div className="match-card-head">
        <div className="match-avatar">{job.company?.charAt(0).toUpperCase()}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="font-display match-card-title">{job.title}</h2>
          <div className="match-card-meta">
            {job.company} · {job.location}
          </div>
          <div className="match-card-salary">{job.salary}</div>
        </div>

        <ScoreRing score={job.matchScore} />
      </div>

      {badges.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '18px' }}>
          {badges.map((badge) => <Badge key={badge}>{badge}</Badge>)}
        </div>
      )}

      {job.matchReasons && job.matchReasons.length > 0 && (
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--ink-soft)', marginBottom: '8px' }}>
            WHY IT MATCHES YOU
          </div>
          {job.matchReasons.map((reason) => (
            <div key={reason} style={{ fontSize: '15px', marginBottom: '4px' }}>
              <span style={{ color: 'var(--success)' }}>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {job.url && (
        <a href={job.url} target="_blank" rel="noopener noreferrer" className="btn-big" style={{ maxWidth: '260px' }}>
          Apply now →
        </a>
      )}
    </div>
  )
}

export function LockedMatchCard({ job }: { job: MatchView }) {
  return (
    <div className="card" style={{ padding: '22px 28px', display: 'flex', alignItems: 'center', gap: '18px' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* The reason is real, built from the same scored dimensions as an open
            card. Only the identifying details are held back. */}
        <p style={{ margin: '0 0 12px', fontSize: '16px', fontWeight: 600 }}>{job.teaser}</p>
        <div aria-hidden="true" style={{ filter: 'blur(5px)', userSelect: 'none', pointerEvents: 'none' }}>
          <div style={{ height: '13px', width: '62%', background: 'var(--surface-alt)', borderRadius: '999px', marginBottom: '7px' }} />
          <div style={{ height: '11px', width: '38%', background: 'var(--surface-alt)', borderRadius: '999px' }} />
        </div>
        <span style={{ fontSize: '13px', color: 'var(--ink-soft)', display: 'inline-block', marginTop: '12px' }}>
          🔒 Company, salary and link locked
        </span>
      </div>
      <ScoreRing score={job.matchScore} />
    </div>
  )
}

export function UpgradeBanner({ lockedCount }: { lockedCount: number }) {
  return (
    <div style={{
      background: 'var(--accent)',
      color: 'white',
      borderRadius: '20px',
      padding: '26px 28px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: '18px',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ flex: '1 1 300px', minWidth: 0 }}>
        <p className="font-display" style={{ margin: '0 0 6px', fontSize: '21px', fontWeight: 700 }}>
          All matches unlocked. New ones as soon as they exist. You set the threshold.
        </p>
        <p style={{ margin: 0, fontSize: '15px', opacity: 0.9 }}>
          {PRICE_PER_WEEK_USD} dollars a week, cancel whenever you want.
        </p>
      </div>
      <Link href="/pricing" className="btn-big btn-ghost" style={{ flex: '0 0 auto', width: 'auto', minWidth: '220px' }}>
        Unlock {lockedCount} more
      </Link>
    </div>
  )
}
