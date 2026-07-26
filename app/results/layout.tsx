import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Matches',
  description: 'Your personalized remote job matches based on your quiz answers.',
  robots: {
    index: false,
    follow: true,
  },
}

export default function ResultsLayout({ children }: { children: React.ReactNode }) {
  return children
}
