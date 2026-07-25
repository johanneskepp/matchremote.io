'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type Job = {
  id: string
  title: string
  company: string
  companyEmoji: string
  location: string
  salary: string
  tags: string[]
  matchScore: number
  matchReasons: string[]
  description: string
}

const MOCK_JOBS: Job[] = [
  {
    id: '1',
    title: 'Senior Product Designer',
    company: 'Linear',
    companyEmoji: '📐',
    location: 'Remote (Global)',
    salary: '$140k - $180k',
    tags: ['Async-first', 'Full-time', 'Design systems'],
    matchScore: 94,
    matchReasons: ['Timezone match', 'Salary range fits', 'Async-first culture'],
    description: 'Shape the future of software development tools. Fully async, small team.',
  },
  {
    id: '2',
    title: 'Full Stack Engineer',
    company: 'Cal.com',
    companyEmoji: '📅',
    location: 'Remote (Europe)',
    salary: '$110k - $150k',
    tags: ['Open source', 'TypeScript', 'React'],
    matchScore: 91,
    matchReasons: ['Perfect experience level', 'Tech stack match', 'Startup vibe'],
    description: 'Build the open-source scheduling infrastructure of the internet.',
  },
  {
    id: '3',
    title: 'Growth Marketing Lead',
    company: 'Beehiiv',
    companyEmoji: '🐝',
    location: 'Remote (Americas)',
    salary: '$120k - $160k',
    tags: ['Growth', 'B2B SaaS', 'Content'],
    matchScore: 89,
    matchReasons: ['Leadership role', 'SaaS industry', 'Fast-growing team'],
    description: 'Lead growth at the newsletter platform disrupting the space.',
  },
  {
    id: '4',
    title: 'Senior Backend Engineer',
    company: 'Supabase',
    companyEmoji: '⚡',
    location: 'Remote (Global)',
    salary: '$130k - $180k',
    tags: ['PostgreSQL', 'Rust', 'Open source'],
    matchScore: 87,
    matchReasons: ['Timezone flexibility', 'Open source love', 'Deep work friendly'],
    description: 'Build the Firebase alternative developers actually love.',
  },
  {
    id: '5',
    title: 'Head of Design',
    company: 'Vercel',
    companyEmoji: '▲',
    location: 'Remote (Americas + Europe)',
    salary: '$180k - $250k',
    tags: ['Leadership', 'Design ops', 'Brand'],
    matchScore: 85,
    matchReasons: ['Leadership match', 'Strong compensation', 'Industry-leading team'],
    description: 'Lead design at the platform powering modern web development.',
  },
  {
    id: '6',
    title: 'Product Engineer',
    company: 'Raycast',
    companyEmoji: '🚀',
    location: 'Remote (Europe)',
    salary: '$100k - $140k',
    tags: ['Product', 'Native apps', 'Swift'],
    matchScore: 83,
    matchReasons: ['Small team feel', 'Product-focused', 'Craft-oriented'],
    description: 'Craft the productivity tool millions rely on daily.',
  },
]

export default function ResultsPage() {
  const router = useRouter()
  const [answers, setAnswers] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('matchremote_quiz')
    if (!stored) {
      router.push('/quiz')
      return
    }
    setAnswers(JSON.parse(stored))
    setTimeout(() => setLoading(false), 1500) // Fake analysis time for delight
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {MOCK_JOBS.map((job) => (
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
                    fontSize: '32px',
                    flexShrink: 0,
                  }}>{job.companyEmoji}</div>

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
                    <button className="btn-big btn-yellow" style={{ flex: 1 }}>
                      Apply now →
                    </button>
                    <button className="btn-big btn-ghost" style={{ flex: '0 0 auto', width: 'auto', padding: '20px 24px' }}>
                      🔖 Save
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
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
        </div>
      </section>
    </div>
  )
}
