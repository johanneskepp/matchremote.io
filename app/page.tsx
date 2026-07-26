import Link from 'next/link'

const RECENT_JOBS = [
  { emoji: '💻', title: 'Senior React Developer', company: 'Vercel', pay: '$140k', color: '#FFB627' },
  { emoji: '🎨', title: 'Product Designer', company: 'Notion', pay: '$110k', color: '#FF9E9E' },
  { emoji: '💬', title: 'Customer Success Manager', company: 'Zapier', pay: '$85k', color: '#5EEAD4' },
  { emoji: '⚙️', title: 'DevOps Engineer', company: 'GitLab', pay: '$150k', color: '#A5B4FC' },
  { emoji: '📣', title: 'Content Marketer', company: 'Buffer', pay: '$75k', color: '#FDBA74' },
  { emoji: '📊', title: 'Data Analyst', company: 'Automattic', pay: '$95k', color: '#86EFAC' },
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
              <span className="job-badge" style={{ background: job.color }}>{job.emoji} NEW</span>
              {job.title} <span className="company">at {job.company}</span> <span className="pay">{job.pay}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section style={{ padding: '48px 0 36px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 18px', background: 'var(--bg-warm)', borderRadius: '999px', marginBottom: '20px', fontSize: '14px', fontWeight: 600 }}>
            <span>⚡</span>
            <span>Free • Takes 3 minutes</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(34px, 6vw, 58px)',
            fontWeight: 700,
            lineHeight: 1.08,
            marginBottom: '16px',
          }}>
            Find remote work that <em style={{ color: 'var(--indigo)', fontStyle: 'italic' }}>actually</em> fits your life.
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
          <div style={{ marginTop: '28px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { emoji: '🙌', text: 'No signup to start' },
              { emoji: '🌤️', text: 'Fresh jobs daily' },
              { emoji: '🏡', text: 'Truly remote only' },
            ].map((item) => (
              <span key={item.text} className="chip" style={{ fontSize: '14px' }}>
                {item.emoji} {item.text}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* How it works + Why us, side by side to stay compact */}
      <section style={{ padding: '40px 0', background: 'white', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '40px' }}>
          <div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {[
                { emoji: '🎯', title: 'Answer 15 questions', text: 'About your skills, work style, timezone, and salary.', tint: 'var(--tint-pink)' },
                { emoji: '🤖', title: 'We analyze thousands of jobs', text: 'Scored against what actually matters to you.', tint: 'var(--tint-indigo)' },
                { emoji: '✨', title: 'Get your top matches', text: 'Ranked by fit. Apply directly, no middleman.', tint: 'var(--tint-yellow)' },
              ].map((step, i) => (
                <div key={i} style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <div style={{
                    fontSize: '28px',
                    flexShrink: 0,
                    width: '52px',
                    height: '52px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: step.tint,
                    borderRadius: '14px',
                  }}>{step.emoji}</div>
                  <div>
                    <h3 className="font-display" style={{ fontSize: '18px', marginBottom: '2px' }}>{step.title}</h3>
                    <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '14px', fontWeight: 500 }}>{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {[
                { emoji: '🌍', title: 'Timezone-aware', text: 'No 3am meetings.', tint: 'var(--tint-indigo)' },
                { emoji: '💰', title: 'Real salaries', text: 'No "competitive" nonsense.', tint: 'var(--tint-yellow)' },
                { emoji: '🧘', title: 'Async-first', text: 'Respects deep work.', tint: 'var(--tint-green)' },
                { emoji: '🎨', title: 'Beyond keywords', text: 'Matched on values, too.', tint: 'var(--tint-pink)' },
              ].map((feat, i) => (
                <div key={i} style={{ padding: '16px', background: feat.tint, border: '2px solid var(--border)', borderRadius: '16px' }}>
                  <div style={{ fontSize: '26px', marginBottom: '6px' }}>{feat.emoji}</div>
                  <h3 className="font-display" style={{ fontSize: '16px', marginBottom: '2px' }}>{feat.title}</h3>
                  <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '13px', fontWeight: 600 }}>{feat.text}</p>
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
              Ready to find your fit? 🚀
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
