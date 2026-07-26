import type { Metadata } from 'next'

const TITLE = 'Remote Job Matching Quiz'
const DESCRIPTION =
  'Answer 15 quick questions about your skills, timezone, salary, and work style to get personalized remote job matches. Free, takes 3 minutes, no signup needed.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: 'https://matchremote.io/quiz',
  },
  openGraph: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
    url: 'https://matchremote.io/quiz',
  },
  twitter: {
    title: `${TITLE} | matchremote`,
    description: DESCRIPTION,
  },
}

export default function QuizLayout({ children }: { children: React.ReactNode }) {
  return children
}
