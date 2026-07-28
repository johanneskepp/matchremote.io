'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FREE_MATCH_LIMIT, PRICE_PER_WEEK_USD } from '@/lib/plan'

type Match = {
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
}

export default function ResultsPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [unlocked, setUnlocked] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('matchremote_user_id')
    if (!userId) {
      router.push('/quiz')
      return
    }

    const load = async () => {
      try {
        const [res] = await Promise.all([
          fetch(`/api/matches?userId=${encodeURIComponent(userId)}`),
          // Keeps the analyzing moment feeling real instead of flashing.
          new Promise((resolve) => setTimeout(resolve, 900)),
        ])
        const data = await res.json()
        setMatches(data.matches || [])
        setUnlocked(Boolean(data.unlocked))
      } catch {
        setMatches([])
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '56px', marginBottom: '16px' }}>🎯</div>
          <p style={{ fontSize: '19px', fontWeight: 600 }}>Finding your matches...</p>
        </div>
      </div>
    )
  }

  const open = matches.filter((m) => !m.locked)
  const locked = matches.filter((m) => m.locked)

  return (
    <div style={{ minHeight: '100vh' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>matchremote</span>
          </Link>
          <Link href="/quiz" style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'underline' }}>
            Retake quiz
          </Link>
        </div>
      </header>

      <section style={{ padding: '48px 0 28px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 46px)', marginBottom: '10px' }}>
            Your matches
          </h1>
          <p style={{ fontSize: '17px', color: 'var(--ink-soft)', margin: 0 }}>
            Ranked by fit against your answers.
          </p>
          {locked.length > 0 && (
            <div className="chip" style={{ marginTop: '16px' }}>
              {open.length} open, {locked.length} more scored and waiting
            </div>
          )}
        </div>
      </section>

      <section style={{ paddingBottom: '72px' }}>
        <div className="container">
          {matches.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'var(--surface)', border: '2px solid var(--border)', borderRadius: '24px' }}>
              <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '10px' }}>No matches yet</h2>
              <p style={{ color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 24px' }}>
                Nothing in the database fits your answers right now. Your answers are saved, and we keep adding jobs as they get published.
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

              {locked.length > 0 && (
                <>
                  <UpgradeBanner lockedCount={locked.length} />
                  {locked.map((job) => (
                    <LockedMatchCard key={job.id} job={job} />
                  ))}
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ScoreRing({ score }: { score: number }) {
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '50%',
        background: 'var(--teal)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display), sans-serif',
        fontSize: '21px',
        fontWeight: 700,
      }}>{score}%</div>
      <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '6px', fontWeight: 700, letterSpacing: '0.06em' }}>MATCH</div>
    </div>
  )
}

function OpenMatchCard({ job }: { job: Match }) {
  return (
    <div className="card" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', gap: '18px', marginBottom: '18px', alignItems: 'flex-start' }}>
        <div style={{
          width: '58px',
          height: '58px',
          borderRadius: '14px',
          background: 'var(--surface-alt)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '22px',
          fontWeight: 700,
          color: 'var(--accent)',
          flexShrink: 0,
        }}>{job.company?.charAt(0).toUpperCase()}</div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 className="font-display" style={{ fontSize: '22px', marginBottom: '4px' }}>{job.title}</h2>
          <div style={{ fontSize: '16px', color: 'var(--ink-soft)', marginBottom: '6px' }}>
            {job.company} · {job.location}
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, color: 'var(--accent)' }}>{job.salary}</div>
        </div>

        <ScoreRing score={job.matchScore} />
      </div>

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

function LockedMatchCard({ job }: { job: Match }) {
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

function UpgradeBanner({ lockedCount }: { lockedCount: number }) {
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
