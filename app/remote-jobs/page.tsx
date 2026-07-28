import Link from 'next/link'
import type { Metadata } from 'next'
import { JOB_CATEGORIES } from '@/lib/utils/job-categories'

const SITE_URL = 'https://matchremote.io'
const TITLE = 'Remote Jobs by Category'
const DESCRIPTION = 'Browse remote jobs by role: engineering, design, product, marketing, sales, operations, and finance. Matched to your timezone and salary with a free quiz.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/remote-jobs` },
  openGraph: { title: `${TITLE} | matchremote`, description: DESCRIPTION, url: `${SITE_URL}/remote-jobs` },
  twitter: { title: `${TITLE} | matchremote`, description: DESCRIPTION },
}

export default function RemoteJobsIndexPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header style={{ padding: '20px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
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
            Get matched →
          </Link>
        </div>
      </header>

      <main>
        <section style={{ padding: '56px 0' }}>
          <div className="container-wide" style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(30px, 5vw, 46px)', marginBottom: '12px' }}>
              Remote Jobs by Category
            </h1>
            <p style={{ fontSize: '17px', color: 'var(--ink-soft)', maxWidth: '520px', margin: '0 auto' }}>
              Pick a category to browse, or take the quiz for matches personalized to your timezone and salary target.
            </p>
          </div>

          <div className="container-wide" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
            {JOB_CATEGORIES.map((category) => (
              <Link
                key={category.slug}
                href={`/remote-jobs/${category.slug}`}
                className="card"
                style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
              >
                <div style={{ fontSize: '32px', marginBottom: '12px' }}>{category.emoji}</div>
                <h2 className="font-display" style={{ fontSize: '22px', marginBottom: '6px' }}>
                  {category.label}
                </h2>
                <p style={{ color: 'var(--ink-soft)', margin: 0, fontSize: '15px' }}>
                  {category.description}
                </p>
              </Link>
            ))}
          </div>
        </section>
      </main>

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
