import Link from 'next/link'
import type { Metadata } from 'next'

const TITLE = 'Personalized Remote Job Matches by Timezone, Salary & Work Style'
const DESCRIPTION =
  'Free 3 minute quiz matches you to remote jobs based on your timezone, salary target, and how you like to work. No signup, no keyword spam, just real fits.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io',
  },
  openGraph: {
    title: `matchremote: ${TITLE}`,
    description: DESCRIPTION,
    url: 'https://matchremote.io',
  },
  twitter: {
    title: `matchremote: ${TITLE}`,
    description: DESCRIPTION,
  },
}

const FAQS = [
  {
    question: 'How does matchremote match me to remote jobs?',
    answer:
      'You answer 15 quick questions about your skills, timezone, salary target, and how you like to work. We score every open role against your answers and show you the closest fits first.',
  },
  {
    question: 'Is matchremote really free?',
    answer:
      'Yes. Taking the quiz and seeing your matches is free, no signup required. Paid plans add unlimited matches and daily email alerts.',
  },
  {
    question: 'What makes a job truly remote on matchremote?',
    answer:
      'We only list roles open to fully remote candidates in your region. No "remote three days a week" or surprise return to office policies.',
  },
  {
    question: 'Do I need to create an account to see my matches?',
    answer:
      'No. You can take the quiz and view your matches without signing up. An account just lets you save jobs and get alerts later.',
  },
  {
    question: 'How is matchremote different from other remote job boards?',
    answer:
      'Most job boards match on keywords alone. We also match on timezone, salary expectations, meeting load, and work style, so you see fewer jobs that look right but feel wrong.',
  },
]

const RECENT_JOBS = [
  { title: 'Senior React Developer', company: 'Vercel', pay: '$140k' },
  { title: 'Product Designer', company: 'Notion', pay: '$110k' },
  { title: 'Customer Success Manager', company: 'Zapier', pay: '$85k' },
  { title: 'DevOps Engineer', company: 'GitLab', pay: '$150k' },
  { title: 'Content Marketer', company: 'Buffer', pay: '$75k' },
  { title: 'Data Analyst', company: 'Automattic', pay: '$95k' },
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((faq) => ({
    '@type': 'Question',
    name: faq.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.answer,
    },
  })),
}

export default function Home() {
  const tickerItems = [...RECENT_JOBS, ...RECENT_JOBS]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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

      <main>
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
            <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '0 0 14px' }}>
              How it works
            </h2>
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
            <h2 style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--ink-soft)', margin: '0 0 14px' }}>
              Why matchremote
            </h2>
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

      {/* FAQ, targets longtail search queries */}
      <section style={{ padding: '40px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
        <div className="container">
          <h2 className="font-display" style={{ fontSize: 'clamp(24px, 3vw, 32px)', marginBottom: '20px' }}>
            Frequently asked questions
          </h2>
          <div>
            {FAQS.map((faq) => (
              <details key={faq.question} className="faq-item">
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
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
      </main>

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
