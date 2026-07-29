'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LockedMatchCard, OpenMatchCard, UpgradeBanner, type MatchView } from '@/components/MatchCard'
import Logo from '@/components/Logo'

type Match = MatchView

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
          <svg width="56" height="56" viewBox="0 0 128 128" aria-hidden="true" style={{ marginBottom: '16px' }}>
            <rect width="128" height="128" rx="30" fill="var(--accent)" />
            <circle cx="64" cy="64" r="46" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
            <circle cx="64" cy="64" r="27" fill="none" stroke="#FFFFFF" strokeWidth="7" opacity="0.95" />
            <circle cx="64" cy="64" r="9" fill="#FFFFFF" />
            <circle className="logo-pulse-dot" cx="112" cy="16" r="17" fill="var(--teal)" stroke="var(--surface)" strokeWidth="5" />
          </svg>
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
          <Logo />
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
