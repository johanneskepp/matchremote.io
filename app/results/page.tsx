'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Job = {
  id: string
  title: string
  company: string
  location: string
  salary: string
  tags: string[]
  matchScore: number
  matchReasons: string[]
  description: string
  url?: string
}

export default function ResultsPage() {
  const router = useRouter()
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = localStorage.getItem('matchremote_user_id')
    if (!userId) {
      router.push('/quiz')
      return
    }

    const minDelay = new Promise((resolve) => setTimeout(resolve, 900)) // Keeps the "analyzing" moment feeling real

    Promise.all([
      fetch(`/api/matches?userId=${userId}`).then((res) => res.json()),
      minDelay,
    ])
      .then(([data]) => {
        setJobs(data.matches || [])
        setLoading(false)
      })
      .catch(() => {
        setJobs([])
        setLoading(false)
      })
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '72px', marginBottom: '24px', animation: 'pulse 2s ease-in-out infinite' }}>🎯</div>
          <h1 className="font-display" style={{ fontSize: '32px', marginBottom: '12px' }}>Finding your matches...</h1>
          <p style={{ color: 'var(--ink-soft)' }}>Analyzing thousands of remote jobs</p>
          <style>{`
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          `}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ padding: '20px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '32px' }}>🎯</span>
            <span className="font-display" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>matchremote</span>
          </Link>
          <Link href="/quiz" style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'underline' }}>
            Retake quiz
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '60px 0 40px' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '64px', marginBottom: '16px' }}>✨</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(36px, 6vw, 56px)', marginBottom: '12px' }}>
              Your top matches
            </h1>
            <p style={{ fontSize: '18px', color: 'var(--ink-soft)' }}>
              Ranked by fit. Refreshed daily.
            </p>
          </div>
        </div>
      </section>

      {/* Job cards */}
      <section style={{ paddingBottom: '80px' }}>
        <div className="container">
          {jobs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 24px', background: 'white', border: '2px solid var(--border)', borderRadius: '24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <h2 className="font-display" style={{ fontSize: '24px', marginBottom: '10px' }}>
                No matches yet
              </h2>
              <p style={{ color: 'var(--ink-soft)', maxWidth: '440px', margin: '0 auto 24px' }}>
                We're still building our job database. Your answers are saved, check back soon or get email alerts for when new jobs land.
              </p>
              <div style={{ maxWidth: '280px', margin: '0 auto' }}>
                <Link href="/pricing" className="btn-big">
                  Get email alerts
                </Link>
              </div>
            </div>
          ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {jobs.map((job) => (
              <div key={job.id} className="card" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '16px',
                    background: 'var(--bg-warm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 700,
                    color: 'var(--indigo)',
                    flexShrink: 0,
                  }}>{job.company.charAt(0).toUpperCase()}</div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '4px' }}>
                      {job.title}
                    </h3>
                    <div style={{ fontSize: '17px', color: 'var(--ink-soft)', marginBottom: '8px' }}>
                      {job.company} · {job.location}
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--indigo)' }}>
                      {job.salary}
                    </div>
                  </div>

                  <div style={{ textAlign: 'center', flexShrink: 0 }}>
                    <div style={{
                      width: '72px',
                      height: '72px',
                      borderRadius: '50%',
                      background: 'var(--success)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: 'Fraunces, serif',
                      fontSize: '24px',
                      fontWeight: 700,
                      border: '4px solid white',
                      boxShadow: '0 4px 0 var(--border)',
                    }}>{job.matchScore}%</div>
                    <div style={{ fontSize: '12px', color: 'var(--ink-soft)', marginTop: '6px', fontWeight: 600 }}>MATCH</div>
                  </div>
                </div>

                <p style={{ color: 'var(--ink-soft)', fontSize: '16px', marginBottom: '16px' }}>
                  {job.description}
                </p>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                  {job.tags.map((tag) => (
                    <span key={tag} className="chip">{tag}</span>
                  ))}
                </div>

                <div style={{ paddingTop: '20px', borderTop: '2px solid var(--border)' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--ink-soft)', marginBottom: '10px', letterSpacing: '0.05em' }}>
                    WHY IT MATCHES YOU
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
                    {job.matchReasons.map((reason) => (
                      <div key={reason} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '15px' }}>
                        <span style={{ color: 'var(--success)' }}>✓</span> {reason}
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', gap: '12px' }}>
                    <a
                      href={job.url || '#'}
                      target={job.url ? '_blank' : undefined}
                      rel={job.url ? 'noopener noreferrer' : undefined}
                      className="btn-big btn-yellow"
                      style={{ flex: 1, textDecoration: 'none' }}
                    >
                      Apply now →
                    </a>
                    <button className="btn-big btn-ghost" style={{ flex: '0 0 auto', width: 'auto', padding: '20px 24px' }}>
                      🔖 Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Bottom CTA */}
          {jobs.length > 0 && (
          <div style={{ marginTop: '48px', textAlign: 'center', padding: '40px', background: 'var(--bg-warm)', borderRadius: '24px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📬</div>
            <h3 className="font-display" style={{ fontSize: '28px', marginBottom: '12px' }}>
              Get weekly matches by email
            </h3>
            <p style={{ color: 'var(--ink-soft)', marginBottom: '24px' }}>
              We'll send you fresh matches every Monday morning.
            </p>
            <div style={{ maxWidth: '320px', margin: '0 auto' }}>
              <Link href="/pricing" className="btn-big">
                Get email alerts
              </Link>
            </div>
          </div>
          )}
        </div>
      </section>
    </div>
  )
}
