import Link from 'next/link'

export default function Home() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{
        padding: '20px 0',
        borderBottom: '2px solid var(--border)',
        background: 'white',
      }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '32px' }}>🎯</span>
            <span className="font-display" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--ink)' }}>matchremote</span>
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

      {/* Hero */}
      <section style={{ padding: '80px 0 60px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 20px', background: 'var(--bg-warm)', borderRadius: '999px', marginBottom: '32px', fontSize: '15px', fontWeight: 600 }}>
            <span>⚡</span>
            <span>Free • Takes 3 minutes</span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(40px, 7vw, 72px)',
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: '24px',
          }}>
            Find remote work<br />that <em style={{ color: 'var(--indigo)', fontStyle: 'italic' }}>actually</em> fits<br />your life.
          </h1>

          <p style={{
            fontSize: '20px',
            color: 'var(--ink-soft)',
            maxWidth: '560px',
            margin: '0 auto 40px',
            lineHeight: 1.5,
          }}>
            Skip the endless scrolling. Answer 15 quick questions and get jobs matched to your timezone, salary, and how you actually want to work.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '400px', margin: '0 auto' }}>
            <Link href="/quiz" className="btn-big">
              Start matching →
            </Link>
            <Link href="/pricing" style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'underline' }}>
              See pricing
            </Link>
          </div>

          {/* Trust indicators */}
          <div style={{ marginTop: '48px', display: 'flex', gap: '32px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span>✓</span> No signup to start
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span>✓</span> Fresh jobs daily
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              <span>✓</span> Truly remote only
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 0', background: 'white', borderTop: '2px solid var(--border)', borderBottom: '2px solid var(--border)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div className="chip" style={{ marginBottom: '16px' }}>How it works</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              Three steps.<br />No BS.
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {[
              { emoji: '🎯', title: 'Answer 15 questions', text: 'About your skills, work style, timezone, and salary. Takes 3 minutes.' },
              { emoji: '🤖', title: 'We analyze thousands of jobs', text: 'Our matching engine scores every job against what actually matters to you.' },
              { emoji: '✨', title: 'Get your top 20 matches', text: 'Only jobs that fit. Ranked by match score. Apply directly, no middleman.' },
            ].map((step, i) => (
              <div key={i} className="card" style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                <div style={{
                  fontSize: '64px',
                  flexShrink: 0,
                  width: '96px',
                  height: '96px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'var(--bg-warm)',
                  borderRadius: '20px',
                }}>{step.emoji}</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--indigo)', marginBottom: '4px', letterSpacing: '0.05em' }}>
                    STEP {i + 1}
                  </div>
                  <h3 className="font-display" style={{ fontSize: '24px', marginBottom: '8px' }}>{step.title}</h3>
                  <p style={{ color: 'var(--ink-soft)', margin: 0 }}>{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section style={{ padding: '80px 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div className="chip" style={{ marginBottom: '16px' }}>Why matchremote</div>
            <h2 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 48px)' }}>
              Built for humans,<br />not keyword matchers.
            </h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { emoji: '🌍', title: 'Timezone-aware', text: 'We only show jobs that work with your hours. No 3am meetings.' },
              { emoji: '💰', title: 'Real salaries', text: 'Every job shows real pay ranges. No "competitive salary" nonsense.' },
              { emoji: '🧘', title: 'Async-first', text: 'Filter for jobs that respect deep work and asynchronous communication.' },
              { emoji: '🎨', title: 'Beyond keywords', text: 'We match on work style, values, and lifestyle. Not just skills.' },
            ].map((feat, i) => (
              <div key={i} style={{ padding: '32px', background: 'white', border: '2px solid var(--border)', borderRadius: '20px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{feat.emoji}</div>
                <h3 className="font-display" style={{ fontSize: '22px', marginBottom: '8px' }}>{feat.title}</h3>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '16px' }}>{feat.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section style={{ padding: '80px 0 120px' }}>
        <div className="container">
          <div style={{
            background: 'var(--indigo)',
            borderRadius: '32px',
            padding: '64px 40px',
            textAlign: 'center',
            color: 'white',
            border: '4px solid var(--indigo-dark)',
          }}>
            <div style={{ fontSize: '64px', marginBottom: '24px' }}>🚀</div>
            <h2 className="font-display" style={{ color: 'white', fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>
              Ready to find your fit?
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.9, marginBottom: '32px', maxWidth: '480px', margin: '0 auto 32px' }}>
              Free, no signup needed. Just 15 questions between you and better work.
            </p>
            <div style={{ maxWidth: '320px', margin: '0 auto' }}>
              <Link href="/quiz" className="btn-big btn-yellow">
                Start quiz →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 0', borderTop: '2px solid var(--border)', background: 'white' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '24px' }}>🎯</span>
            <span className="font-display" style={{ fontWeight: 700 }}>matchremote</span>
          </div>
          <div style={{ color: 'var(--ink-soft)', fontSize: '14px' }}>
            © 2026 matchremote. Made for people who want more.
          </div>
        </div>
      </footer>
    </div>
  )
}
