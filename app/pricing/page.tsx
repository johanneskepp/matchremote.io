import Link from 'next/link'
import type { Metadata } from 'next'
import { PRICE_PER_WEEK_USD, FREE_MATCH_LIMIT } from '@/lib/plan'

const TITLE = 'Pricing'
const DESCRIPTION =
  'Six dollars a week for every remote job match we score for you, with new ones as soon as they exist. Cancel yourself, any time, from your account page.'

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

const INCLUDED = [
  'Every match unlocked, not just the free two',
  'New matches as soon as they show up, never the same job twice',
  'You set the score threshold, so you only hear about matches worth your time',
  'Email alerts at your threshold, nothing below it',
  'Fresh matches every time you retake the quiz',
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <span className="font-display" style={{ fontSize: '22px', fontWeight: 700, color: 'var(--ink)' }}>matchremote</span>
          </Link>
          <Link href="/quiz" style={{
            padding: '12px 24px',
            background: 'var(--accent)',
            color: 'white',
            borderRadius: '12px',
            fontWeight: 700,
            textDecoration: 'none',
            fontSize: '16px',
          }}>Start quiz</Link>
        </div>
      </header>

      <main style={{ flex: '1 1 auto', padding: '56px 0 72px' }}>
        <div className="container" style={{ maxWidth: '560px' }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 46px)', marginBottom: '10px' }}>
              One plan. Six dollars a week.
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', margin: 0 }}>
              Your first {FREE_MATCH_LIMIT} matches are free and always will be. This is for the rest.
            </p>
          </div>

          <div className="card" style={{ padding: '36px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '8px' }}>
              <span className="font-display" style={{ fontSize: '52px', fontWeight: 700, lineHeight: 1 }}>
                ${PRICE_PER_WEEK_USD}
              </span>
              <span style={{ fontSize: '17px', color: 'var(--ink-soft)' }}>per week</span>
            </div>
            <p style={{ margin: '0 0 26px', fontSize: '15px', color: 'var(--ink-soft)' }}>
              Renews automatically every week until you cancel it yourself. There is no bigger tier to upgrade to,
              this is the whole product.
            </p>

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 30px' }}>
              {INCLUDED.map((item) => (
                <li key={item} style={{ display: 'flex', gap: '10px', marginBottom: '12px', fontSize: '16px', lineHeight: 1.45 }}>
                  <span style={{ color: 'var(--success)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link href="/account" className="btn-big">Subscribe</Link>

            <p style={{ margin: '18px 0 0', fontSize: '14px', color: 'var(--ink-soft)', textAlign: 'center' }}>
              Cancel from your account page in two clicks. No email, no support ticket.
            </p>
          </div>

          <p style={{ textAlign: 'center', fontSize: '15px', color: 'var(--ink-soft)', marginTop: '28px' }}>
            Not sure yet? <Link href="/quiz" style={{ color: 'var(--teal)', fontWeight: 600 }}>Take the quiz free</Link> and see your first {FREE_MATCH_LIMIT} matches.
          </p>
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <span className="font-display" style={{ fontSize: '15px', fontWeight: 600 }}>matchremote</span>
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/remote-jobs" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Browse jobs</Link>
            <Link href="/faq" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>FAQ</Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
