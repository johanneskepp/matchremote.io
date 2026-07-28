'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { LockedMatchCard, OpenMatchCard, UpgradeBanner, type MatchView } from '@/components/MatchCard'
import { SCORE_THRESHOLDS } from '@/lib/plan'

type Filter = 0 | (typeof SCORE_THRESHOLDS)[number]

const FILTERS: { value: Filter; label: string }[] = [
  { value: 0, label: 'All' },
  ...SCORE_THRESHOLDS.map((t) => ({ value: t as Filter, label: `Over ${t}%` })),
]

export default function DashboardMatches({
  matches,
  unlocked,
}: {
  matches: MatchView[]
  unlocked: boolean
}) {
  const [filter, setFilter] = useState<Filter>(0)

  // Filtering happens entirely in memory on data the server already sent, so
  // switching is instant and never refetches. Locked matches keep their score,
  // so they filter alongside the open ones instead of vanishing.
  const visible = useMemo(
    () => matches.filter((m) => m.matchScore >= filter),
    [matches, filter]
  )

  const open = visible.filter((m) => !m.locked)
  const locked = visible.filter((m) => m.locked)

  return (
    <>
      <div
        role="group"
        aria-label="Filter by match score"
        style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '26px' }}
      >
        {FILTERS.map((option) => {
          const active = filter === option.value
          const count = matches.filter((m) => m.matchScore >= option.value).length

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilter(option.value)}
              aria-pressed={active}
              style={{
                padding: '11px 18px',
                borderRadius: '999px',
                border: `2px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                background: active ? 'var(--accent)' : 'var(--surface)',
                color: active ? 'white' : 'var(--ink)',
                fontSize: '15px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'background 0.12s ease, border-color 0.12s ease',
              }}
            >
              {option.label} <span style={{ opacity: 0.7 }}>({count})</span>
            </button>
          )
        })}
      </div>

      {visible.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: '24px' }}>
          <h2 className="font-display" style={{ fontSize: '22px', marginBottom: '10px' }}>
            {matches.length === 0 ? 'No matches yet' : 'Nothing at that score yet'}
          </h2>
          <p style={{ color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 24px' }}>
            {matches.length === 0
              ? 'Your answers are saved. We keep adding jobs as they get published, and new matches show up here on their own.'
              : 'Lower the filter to see the rest, or leave it here and we will email you when something clears this bar.'}
          </p>
          <div style={{ maxWidth: '280px', margin: '0 auto' }}>
            <Link href="/remote-jobs" className="btn-big">Browse all jobs</Link>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {open.map((job) => (
            <OpenMatchCard key={job.id} job={job} />
          ))}

          {!unlocked && locked.length > 0 && (
            <>
              <UpgradeBanner lockedCount={locked.length} />
              {locked.map((job) => (
                <LockedMatchCard key={job.id} job={job} />
              ))}
            </>
          )}
        </div>
      )}
    </>
  )
}
