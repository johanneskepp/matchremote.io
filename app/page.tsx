import Link from 'next/link'

const RECENT_JOBS = [
  { title: 'Senior React Developer', company: 'Vercel', pay: '$140k' },
  { title: 'Product Designer', company: 'Notion', pay: '$110k' },
  { title: 'Customer Success Manager', company: 'Zapier', pay: '$85k' },
  { title: 'DevOps Engineer', company: 'GitLab', pay: '$150k' },
  { title: 'Content Marketer', company: 'Buffer', pay: '$75k' },
  { title: 'Data Analyst', company: 'Automattic', pay: '$95k' },
]

export default function Home() {
  const tickerItems = [...RECENT_JOBS, ...RECENT_JOBS]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '16px 0',
        borderBottom: '2px solid var(--border)',
        background: 'white',
      }}>
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
            Start quiz
          </Link>
        </div>
      </header>

      {/* Recently added jobs ticker */}
      <div className="job-ticker" aria-label="Recently added jobs">
        <div className="job-ticker-track">
          {tickerItems.map((job, i) => (
            <span className="job-ticker-item" key={i}>
              <span className="job-badge">NEW</span>
              {job.title} <span className="company">at {job.company}</span> <span className="pay">{job.pay}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding: '48px 0 36px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', padding: '6px 18px', background: 'white', border: '1.5px solid var(--border)', borderRadius: '999px', marginBottom: '20px', fontSize: '14px', fontWeight: 600, color: 'var(--ink-soft)' }}>
            Free · Takes 3 minutes
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(34px, 6vw, 58px)',
            fontWeight: 700,
            lineHeight: 1.08,
            marginBottom: '16px',
          }}>
            Find remote work that{' '}
            <span style={{ position: 'relative', display: 'inline-block' }}>
              <em style={{ color: 'var(--indigo)', fontStyle: 'italic' }}>actually</em>
              <svg
                viewBox="0 0 100 12"
                preserveAspectRatio="none"
                style={{ position: 'absolute', left: 0, bottom: '-8px', width: '100%', height: '12px' }}
                aria-hidden="true"
              >
                <path
                  d="M1,7 Q15,1 27,7 T53,7 T79,7 T99,6"
                  fill="none"
                  stroke="var(--yellow)"
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            </span>{' '}
            fits your life.
          </h1>

          <p style={{
            fontSize: '18px',
            color: 'var(--ink-soft)',
            maxWidth: '540px',
            margin: '0 auto 28px',
            lineHeight: 1.5,
          }}>
            Skip the endless scrolling. Answer 15 quick questions and get jobs matched to your timezone, salary, and how you actually want to work.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '360px', margin: '0 auto' }}>
            <Link href="/quiz" className="btn-big">
              Start matching →
            </Link>
            <Link href="/pricing" style={{ color: 'var(--ink-soft)', fontSize: '14px', textDecoration: 'underline' }}>
              See pricing
            </Link>
          </div>

          {/* Trust indicators */}
          <div style={{ marginTop: '28px', display: 'flex', gap: '24px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['No signup to start', 'Fresh jobs daily', 'Truly remote only'].map((text) => (
              <span key={text} style={{ fontSize: '14px', fontWeight: 600, color: 'var(--ink-soft)' }}>
                {text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Wavy divider instead of a straight line */}
      <svg
        viewBox="0 0 1440 40"
        preserveAspectRatio="none"
        style={{ display: 'block', width: '100%', height: '32px', marginBottom: '-1px' }}
        aria-hidden="true"
      >
        <path
          d="M0,20 Q60,38 120,20 T240,20 T360,20 T480,20 T600,20 T720,20 T840,20 T960,20 T1080,20 T1200,20 T1320,20 T1440,20 L1440,40 L0,40 Z"
          fill="white"
        />
      </svg>

      {/* How it works + Why us, side by side to stay compact */}
      <section style={{ padding: '40px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Answer 15 questions', text: 'About your skills, work style, timezone, and salary.' },
                { title: 'We analyze thousands of jobs', text: 'Scored against what actually matters to you.' },
                { title: 'Get your top matches', text: 'Ranked by fit. Apply directly, no middleman.' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    color: 'var(--indigo)',
                    borderRadius: '50%',
                  }}>{i + 1}</div>
                  <div>
                    <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '2px' }}>{step.title}</h3>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '15px', fontWeight: 500 }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { title: 'Timezone-aware', text: 'No 3am meetings.' },
                { title: 'Real salaries', text: 'No "competitive" nonsense.' },
                { title: 'Async-first', text: 'Respects deep work.' },
                { title: 'Beyond keywords', text: 'Matched on values, too.' },
              ].map((feat, i) => (
                <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                  <div style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    flexShrink: 0,
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--bg)',
                    border: '1.5px solid var(--border)',
                    color: 'var(--indigo)',
                    borderRadius: '50%',
                  }}>✓</div>
                  <div>
                    <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '2px' }}>{feat.title}</h3>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '15px', fontWeight: 500 }}>{feat.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '40px 0 56px' }}>
        <div className="container">
          <div style={{
            background: 'var(--indigo)',
            borderRadius: '28px',
            padding: '40px 32px',
            textAlign: 'center',
            color: 'white',
            border: '4px solid var(--indigo-dark)',
          }}>
            <h2 className="font-display" style={{ color: 'white', fontSize: 'clamp(26px, 4vw, 38px)', marginBottom: '10px' }}>
              Ready to find your fit?
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '24px', maxWidth: '440px', margin: '0 auto 24px' }}>
              Free, no signup needed. Just 15 questions between you and better work.
            </p>
            <div style={{ maxWidth: '300px', margin: '0 auto' }}>
              <Link href="/quiz" className="btn-big btn-yellow">
                Start quiz →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
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
