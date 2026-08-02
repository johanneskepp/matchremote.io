import Link from 'next/link'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

const TITLE = 'About matchremote'
const DESCRIPTION = 'matchremote is built and run by one person who was tired of remote job boards that match on keywords instead of how you actually want to work.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io/about',
  },
  openGraph: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
    url: 'https://matchremote.io/about',
  },
  twitter: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
  },
}

const pStyle = { color: 'var(--ink-soft)', lineHeight: 1.7, marginBottom: '18px', fontSize: '16px' }

export default function AboutPage() {
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
          <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 44px)', marginBottom: '24px' }}>
            One person, tired of the same broken job boards.
          </h1>

          <p style={pStyle}>
            matchremote is built and run by <strong>Johannes Kepp</strong>, working solo out of Sweden. There is no
            team, no office, and no venture funding behind it, just one person who kept running into the same
            problem while looking at remote job boards: they match on keywords, not on how a job actually fits your
            life.
          </p>

          <p style={pStyle}>
            A "Senior Engineer" listing that happens to mention "marketing" in a sentence about cross team
            collaboration shows up in an engineering search. A role open to "remote" turns out to mean three
            timezones you cannot work. A salary range that reads as promising is really a floor nobody hits. None
            of that is malicious, it is just what keyword matching gets you.
          </p>

          <p style={pStyle}>
            matchremote scores every listing against your timezone, your salary target, your experience level, and
            how you actually like to work (async and heads down, or synchronous and collaborative), not just
            whether a word appears somewhere in the description. It pulls fresh listings every day from five public
            remote job sources, filters out the listings that turn out not to be real jobs at all, and shows you a
            score with the actual reasons behind it, not just a percentage.
          </p>

          <p style={pStyle}>
            It is early. matchremote launched in 2026 and is still small, still adding sources, and still being
            improved in the open based on what does not work yet. If something looks wrong, a bad match, a stale
            listing, a bug, email me directly.
          </p>

          <p style={pStyle}>
            <a href="mailto:johanneskepp@gmail.com" style={{ color: 'var(--teal)' }}>johanneskepp@gmail.com</a>
          </p>

          <div style={{ marginTop: '32px', maxWidth: '320px' }}>
            <Link href="/quiz" className="btn-big">
              Take the quiz
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size={18} href="" />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Link href="/faq" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>FAQ</Link>
            <Link href="/privacy" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Privacy</Link>
            <Link href="/terms" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Terms</Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
