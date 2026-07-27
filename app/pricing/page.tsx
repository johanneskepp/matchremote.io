import Link from 'next/link'
import type { Metadata } from 'next'

const TITLE = 'Pricing'
const DESCRIPTION = 'Simple pricing for matchremote. Start free and see your top remote job matches, upgrade for unlimited matches and job alerts.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io/pricing',
  },
  openGraph: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
    url: 'https://matchremote.io/pricing',
  },
  twitter: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
  },
}

export default function PricingPage() {
  const plans = [
    {
      emoji: '🎯',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect to get started',
      features: [
        'Take the quiz',
        'See your top 3 matches',
        'Full match score & reasons',
        'Retake the quiz anytime',
      ],
      cta: 'Start free',
      href: '/quiz',
      featured: false,
    },
    {
      emoji: '⚡',
      name: 'Pro',
      price: '$9',
      period: 'per month',
      description: 'For serious job hunters',
      features: [
        'Everything in Free',
        'Unlock all your matches',
        'Save jobs to revisit later',
        'Email alerts for new matches',
        'Refreshed matches every time you retake the quiz',
      ],
      cta: 'Get Pro',
      href: '/quiz',
      featured: true,
    },
    {
      emoji: '🏢',
      name: 'Teams',
      price: 'Custom',
      period: 'talk to us',
      description: 'For companies hiring remote',
      features: [
        'Post unlimited jobs',
        'Featured placement',
        'Candidate insights',
        'Analytics dashboard',
        'Dedicated support',
      ],
      cta: 'Contact sales',
      href: 'mailto:hello@matchremote.io',
      featured: false,
    },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Header */}
      <header style={{ padding: '20px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
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
          }}>Start quiz</Link>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 0 40px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <div className="chip" style={{ marginBottom: '16px' }}>Pricing</div>
          <h1 className="font-display" style={{ fontSize: 'clamp(40px, 6vw, 64px)', marginBottom: '16px' }}>
            Simple, honest pricing.
          </h1>
          <p style={{ fontSize: '20px', color: 'var(--ink-soft)', maxWidth: '520px', margin: '0 auto' }}>
            Start free. Upgrade when you're ready.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '20px 0 100px' }}>
        <div className="container-wide">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
            {plans.map((plan) => (
              <div key={plan.name} style={{
                padding: '40px 32px',
                background: plan.featured ? 'var(--indigo)' : 'white',
                color: plan.featured ? 'white' : 'var(--ink)',
                borderRadius: '24px',
                border: plan.featured ? '4px solid var(--indigo-dark)' : '2px solid var(--border)',
                position: 'relative',
                transform: plan.featured ? 'scale(1.02)' : 'none',
              }}>
                {plan.featured && (
                  <div style={{
                    position: 'absolute',
                    top: '-14px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'var(--yellow)',
                    color: 'var(--ink)',
                    padding: '6px 16px',
                    borderRadius: '999px',
                    fontSize: '13px',
                    fontWeight: 700,
                  }}>MOST POPULAR</div>
                )}

                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{plan.emoji}</div>
                <h3 className="font-display" style={{ fontSize: '28px', marginBottom: '4px', color: plan.featured ? 'white' : 'var(--ink)' }}>
                  {plan.name}
                </h3>
                <div style={{ opacity: plan.featured ? 0.85 : 1, color: plan.featured ? 'white' : 'var(--ink-soft)', fontSize: '15px', marginBottom: '24px' }}>
                  {plan.description}
                </div>

                <div style={{ marginBottom: '32px' }}>
                  <span className="font-display" style={{ fontSize: '48px', fontWeight: 700, color: plan.featured ? 'white' : 'var(--ink)' }}>
                    {plan.price}
                  </span>
                  <span style={{ fontSize: '16px', opacity: 0.7, marginLeft: '8px' }}>{plan.period}</span>
                </div>

                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0' }}>
                  {plan.features.map((f) => (
                    <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginBottom: '12px', fontSize: '16px' }}>
                      <span style={{ color: plan.featured ? 'var(--yellow)' : 'var(--success)', fontWeight: 700 }}>✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link href={plan.href} className={`btn-big ${plan.featured ? 'btn-yellow' : ''}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* FAQ small */}
          <div style={{ marginTop: '80px', textAlign: 'center' }}>
            <p style={{ color: 'var(--ink-soft)', fontSize: '15px' }}>
              Questions? Email us at <a href="mailto:hello@matchremote.io" style={{ color: 'var(--indigo)', fontWeight: 600 }}>hello@matchremote.io</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
