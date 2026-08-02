import Link from 'next/link'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

const TITLE = 'Privacy Policy'
const DESCRIPTION = 'How matchremote collects, uses, and protects your data, and your rights under GDPR.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io/privacy',
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

export default function PrivacyPage() {
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
            Privacy Policy
          </h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: '40px', fontSize: '14px' }}>
            Effective 2 August 2026
          </p>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Who we are</h2>
            <p style={pStyle}>
              matchremote.io is operated by Johannes Kepp, based in Sweden ("we", "us"). We are the data controller
              for the personal data described below. For any question or request, contact{' '}
              <a href="mailto:johanneskepp@gmail.com" style={{ color: 'var(--teal)' }}>johanneskepp@gmail.com</a>.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>What we collect</h2>
            <ul style={ulStyle}>
              <li>Your email address, to send sign in codes and, if you turn them on, match alerts.</li>
              <li>Your quiz answers (timezone, salary target, skills, experience, work style, industry preferences), used only to score job matches.</li>
              <li>A session cookie (`mr_session`), strictly necessary to keep you signed in. It is httpOnly, cannot be read by JavaScript, and carries no tracking or advertising purpose.</li>
              <li>Basic technical logs (request errors, email delivery status) kept for reliability, not for profiling.</li>
            </ul>
            <p style={pStyle}>
              We do not use analytics or advertising cookies. If that ever changes, this policy and, where the law
              requires it, a consent banner will change first.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Payment data</h2>
            <p style={pStyle}>
              Subscriptions are billed through <strong>Stripe</strong>, our payment processor. Stripe collects and
              processes your billing details and card information directly, we never see or store your full card
              number. Stripe acts as an independent data controller for that billing data under its own privacy
              policy, available at{' '}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)' }}>stripe.com/privacy</a>.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Why we process your data</h2>
            <ul style={ulStyle}>
              <li><strong>To provide the service</strong> (Article 6(1)(b) GDPR, performance of a contract): matching you to jobs, running your account, billing your subscription.</li>
              <li><strong>Legitimate interest</strong> (Article 6(1)(f)): keeping sign in secure, preventing abuse of the sign in code system, basic error monitoring.</li>
              <li>We do not send marketing email. Match alert emails are a feature you turn on yourself and can turn off from your account page at any time.</li>
            </ul>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Who we share it with</h2>
            <p style={pStyle}>We use a small number of processors to run the service, each only for the purpose named:</p>
            <ul style={ulStyle}>
              <li><strong>Supabase</strong>, our database host, stores your account, quiz answers, and matches.</li>
              <li><strong>Stripe</strong>, our payment processor, handles billing and card data.</li>
              <li><strong>Resend</strong>, our email provider, delivers sign in codes and match alerts.</li>
              <li><strong>Vercel</strong>, our hosting provider, serves the website.</li>
            </ul>
            <p style={pStyle}>
              We never sell your data, and we never share it with advertisers. Some of these providers may process
              data outside the EU/EEA (for example in the United States); where that happens, it is covered by
              Standard Contractual Clauses or an equivalent safeguard required under GDPR.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>How long we keep it</h2>
            <p style={pStyle}>
              We keep your account, quiz answers, and match history for as long as your account is active. If you
              ask us to delete your account, we delete your personal data within 30 days, except where we are
              legally required to keep billing records for longer (Stripe retains payment data on our behalf per
              its own obligations).
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Your rights</h2>
            <p style={pStyle}>Under GDPR, you have the right to:</p>
            <ul style={ulStyle}>
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate data</li>
              <li>Delete your data yourself, any time, from your account page ("right to be forgotten"), or by asking us to do it for you</li>
              <li>Request a copy of your data in a portable format</li>
              <li>Object to or restrict certain processing</li>
              <li>Lodge a complaint with your national supervisory authority. In Sweden, that is the{' '}
                <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--teal)' }}>Swedish Authority for Privacy Protection (IMY)</a>.
              </li>
            </ul>
            <p style={pStyle}>
              To exercise any of these rights, email{' '}
              <a href="mailto:johanneskepp@gmail.com" style={{ color: 'var(--teal)' }}>johanneskepp@gmail.com</a>. We
              respond within 30 days.
            </p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Children</h2>
            <p style={pStyle}>matchremote is not intended for anyone under 16 years old.</p>
          </section>

          <section style={sectionStyle}>
            <h2 className="font-display" style={h2Style}>Changes to this policy</h2>
            <p style={pStyle}>
              If we make a material change to how we handle your data, we will update this page and change the
              effective date above.
            </p>
          </section>
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size={18} href="" />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/terms" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Terms</Link>
            <Link href="/about" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>About</Link>
            <Link href="/faq" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>FAQ</Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
