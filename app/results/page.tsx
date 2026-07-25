'use client'

import { useEffect, useState } from 'react'
import { JobCard } from '@/components/JobCard'
import { Loader, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface Match {
  id: string
  title: string
  company: string
  description: string
  salary_min?: number
  salary_max?: number
  location?: string
  timezone?: string
  job_type: string
  posted_date: string
  url: string
  matchScore: number
  matchReasons?: Record<string, number>
}

export default function ResultsPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchMatches()
  }, [])

  const fetchMatches = async () => {
    try {
      console.log('[Results] Fetching matches...')
      setIsLoading(true)

      const response = await fetch('/api/matches')
      if (!response.ok) {
        throw new Error('Failed to fetch matches')
      }

      const data = await response.json()
      console.log('[Results] Got', data.matches?.length || 0, 'matches')

      setMatches(data.matches || [])
    } catch (err) {
      console.error('[Results] Error fetching matches:', err)
      setError('Unable to load your matches. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveJob = async (jobId: string) => {
    try {
      console.log('[Results] Saving job:', jobId)

      const response = await fetch('/api/jobs/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })

      if (response.ok) {
        setSavedJobs(prev => new Set([...prev, jobId]))
        console.log('[Results] Job saved')
      }
    } catch (error) {
      console.error('[Results] Error saving job:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Analyzing your matches...
          </h2>
          <p className="text-gray-600">
            Our AI is scoring thousands of jobs against your profile
          </p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/quiz" className="btn-primary">
            Retake Quiz
          </Link>
        </div>
      </div>
    )
  }

  if (matches.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center py-12">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No matches found
          </h2>
          <p className="text-gray-600 mb-6">
            We couldn't find any jobs that match your criteria. Try adjusting your preferences.
          </p>
          <Link href="/quiz" className="btn-primary">
            Adjust Quiz Answers
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-safe max-w-4xl">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">
            Your Top Matches
          </h1>
          <p className="text-xl text-gray-600">
            We found <span className="font-semibold text-blue-600">{matches.length}</span> great opportunities that match your profile
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-600">{matches.length}</div>
            <p className="text-sm text-gray-600">Total Matches</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-green-600">
              {matches.filter(m => m.matchScore >= 80).length}
            </div>
            <p className="text-sm text-gray-600">Perfect Matches</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-blue-500">
              {matches.filter(m => m.matchScore >= 60 && m.matchScore < 80).length}
            </div>
            <p className="text-sm text-gray-600">Great Matches</p>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-amber-500">
              ${(
                matches.reduce((sum, m) => sum + ((m.salary_min || 0) + (m.salary_max || 0)) / 2, 0) / matches.length / 1000
              ).toFixed(0)}k
            </div>
            <p className="text-sm text-gray-600">Avg Salary</p>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4 mb-12">
          {matches.map((match, index) => (
            <JobCard
              key={match.id}
              id={match.id}
              title={match.title}
              company={match.company}
              description={match.description}
              salary_min={match.salary_min}
              salary_max={match.salary_max}
              location={match.location}
              timezone={match.timezone}
              job_type={match.job_type}
              posted_date={match.posted_date}
              url={match.url}
              matchScore={match.matchScore}
              matchReasons={match.matchReasons}
              onSave={handleSaveJob}
              isSaved={savedJobs.has(match.id)}
            />
          ))}
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-bold mb-4">Like what you see?</h2>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Sign up for premium to get daily job alerts, save your favorite matches, and get full company profiles.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/pricing" className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition">
              Explore Premium
            </Link>
            <Link href="/" className="border-2 border-white text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
