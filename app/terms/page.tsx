import Link from 'next/link'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'
import { PRICE_PER_WEEK_USD } from '@/lib/plan'

const TITLE = 'Terms of Service'
const DESCRIPTION = 'The terms that apply when you use matchremote and subscribe to unlock full match access.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io/terms',
  },
  robots: {
    index: false,
    follow: true,
  },
}

const sectionStyle = { marginBottom: '32px' }
const h2Style = { fontSize: '20px', marginBottom: '10px' }
const pStyle = { color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '12px' }
const ulStyle = { color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '12px', paddingLeft: '20px' }

export default function TermsPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo size={24} />
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

      <main style={{ flex: '1 1 auto', padding: '48px 0 72px' }}>
        <div className="container">
          <h1 className="font-display" style={{ fontSize: 'clamp(30px, 5vw, 40px)', marginBottom: '4px' }}>
            Terms of Service
          </h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: '40px', fontSize: '14px' }}>
            Effective 2 August 2026
          </p>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>The service</h2>
            <p style={pStyle}>
              matchremote.io ("matchremote", "we") is operated by Johannes Kepp, based in Sweden. matchremote
              scores remote job listings against a quiz you answer and shows you the closest matches. Taking the
              quiz and seeing your first {' '}
              <Link href="/pricing" style={{ color: 'var(--teal)' }}>free matches</Link>{' '}
              does not require an account. Creating an account with your email lets you sign in again and manage a
              subscription.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Subscriptions and billing</h2>
            <p style={pStyle}>
              Full, ongoing match access costs ${PRICE_PER_WEEK_USD} a week, billed automatically until you cancel.
              You can cancel any time from your account page, you keep access until the end of the period you
              already paid for, then billing stops.
            </p>
            <p style={pStyle}>
              Payments are processed by <strong>Stripe</strong>. matchremote, not Stripe, is the seller on your
              receipt. Applicable VAT or sales tax is calculated automatically at checkout based on your location.
              Stripe's own terms, covering how your payment details are handled, are available at{' '}
              <a href="https://stripe.com/legal/consumer" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)' }}>stripe.com/legal/consumer</a>.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Refund policy</h2>
            <p style={pStyle}>
              Charges are final once a billing period starts, cancelling stops future charges but does not refund
              the period already paid for. If something went wrong on our end (a billing error, a duplicate charge),
              email us at{' '}
              <a href="mailto:johanneskepp@gmail.com" style={{ color: 'var(--teal)' }}>johanneskepp@gmail.com</a>{' '}
              and we will make it right.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>What matchremote is not</h2>
            <ul style={ulStyle}>
              <li>We are not an employer, recruiter, or staffing agency. We do not guarantee that any listing is still open, accurate, or that applying will lead to an interview or an offer.</li>
              <li>Job listings are sourced from third parties (currently RemoteOK, Remotive, Arbeitnow, Jobicy, and Himalayas). Applying happens on or through the original source, matchremote is not a party to that application or any resulting hire.</li>
              <li>Match scores are an estimate based on the answers you gave us, not a promise of fit.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Acceptable use</h2>
            <p style={pStyle}>
              Do not scrape, automate signups, attempt to bypass the free match limit, or use the service to harm
              other users or the job listings we source. We can suspend or close an account that does this.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Liability</h2>
            <p style={pStyle}>
              matchremote is provided as is. To the extent allowed by Swedish law, we are not liable for indirect
              or consequential losses, including a job opportunity you did not get. Nothing here limits liability
              that cannot be limited under mandatory consumer protection law.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Governing law</h2>
            <p style={pStyle}>These terms are governed by the laws of Sweden.</p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Changes</h2>
            <p style={pStyle}>
              We may update these terms as the service changes. We will update the effective date above when we do.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Contact</h2>
            <p style={pStyle}>
              Questions about these terms: <a href="mailto:johanneskepp@gmail.com" style={{ color: 'var(--teal)' }}>johanneskepp@gmail.com</a>.
              See also our <Link href="/privacy" style={{ color: 'var(--teal)' }}>Privacy Policy</Link>.
            </p>
          </section>
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size={18} href="" />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/privacy" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/about" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>About</Link>
            <Link href="/faq" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>FAQ</Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
