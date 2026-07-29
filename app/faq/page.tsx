import Link from 'next/link'
import type { Metadata } from 'next'
import Logo from '@/components/Logo'

const TITLE = 'Remote Job Matching FAQ'
const DESCRIPTION =
  'How matchremote scores remote jobs against your timezone, salary target, and work style, what is free, and what an account gets you.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io/faq',
  },
  openGraph: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
    url: 'https://matchremote.io/faq',
  },
  twitter: {
    title: `${TITLE} | matchremote`,
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
      'Taking the quiz and seeing your top 2 matches is free, no signup required. A subscription unlocks every match, sets your own match threshold, and emails you new ones as they land.',
  },
  {
    question: 'What makes a job truly remote on matchremote?',
    answer:
      'We only list roles open to fully remote candidates in your region. No "remote three days a week" or surprise return to office policies.',
  },
  {
    question: 'Do I need to create an account to see my matches?',
    answer:
      'No. You can take the quiz and view your free matches without signing up. An account is only needed to unlock the rest and to set up email alerts.',
  },
  {
    question: 'How is matchremote different from other remote job boards?',
    answer:
      'Most job boards match on keywords alone. We also match on timezone, salary expectations, meeting load, and work style, so you see fewer jobs that look right but feel wrong.',
  },
  {
    question: 'How often do new matches appear?',
    answer:
      'We pull from five remote job sources every day. New matches appear as soon as a job that fits you is published, and you never get shown the same job twice.',
  },
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

export default function FaqPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

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
          <h1 className="font-display" style={{ fontSize: 'clamp(32px, 5vw, 44px)', marginBottom: '8px' }}>
            Frequently asked questions
          </h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: '32px' }}>
            Everything about how the matching works and what it costs.
          </p>

          {FAQS.map((faq) => (
            <details key={faq.question} className="faq-item">
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}

          <div style={{ marginTop: '40px' }}>
            <Link href="/quiz" className="btn-big" style={{ maxWidth: '320px' }}>
              Take the quiz
            </Link>
          </div>
        </div>
      </main>

      <footer style={{ padding: '24px 0', borderTop: '2px solid var(--border)', background: 'var(--surface)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <Logo size={18} href="" />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/remote-jobs" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Browse jobs</Link>
            <Link href="/pricing" style={{ color: 'var(--ink-soft)', fontSize: '13px', textDecoration: 'none' }}>Pricing</Link>
            <span style={{ color: 'var(--ink-soft)', fontSize: '13px' }}>© 2026 matchremote</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
