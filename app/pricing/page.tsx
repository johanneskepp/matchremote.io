import Link from 'next/link'
import type { Metadata } from 'next'
import { PRICE_PER_WEEK_USD, FREE_MATCH_LIMIT } from '@/lib/plan'
import Logo from '@/components/Logo'

const TITLE = 'Pricing'
const DESCRIPTION =
  'Unlock remote job matches for $6 a week, new ones as soon as they exist. Cancel anytime, two clicks, from your account page.'

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
  'Every match unlocked',
  'New matches the moment they exist',
  'Email alerts, only above your score threshold',
  'Your own dashboard, all matches saved and ready whenever you check back',
]

export default function PricingPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
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
              One plan. Unlock for $6.
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', margin: 0 }}>
              First {FREE_MATCH_LIMIT} matches free. Unlock the rest.
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
              Cancel anytime, two clicks, no support ticket.
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
          </div>
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size={18} href="" />
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
