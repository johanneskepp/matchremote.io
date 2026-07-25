'use client'

import Link from 'next/link'
import { Star, MapPin, DollarSign, Clock, ArrowRight } from 'lucide-react'
import { formatSalary, formatDate, getColorForScore } from '@/lib/utils/helpers'
import { useState } from 'react'

export interface JobCardProps {
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
  matchScore?: number
  matchReasons?: Record<string, number>
  onSave?: (jobId: string) => void
  isSaved?: boolean
}

export function JobCard({
  id,
  title,
  company,
  description,
  salary_min,
  salary_max,
  location,
  timezone,
  job_type,
  posted_date,
  url,
  matchScore,
  matchReasons,
  onSave,
  isSaved = false,
}: JobCardProps) {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (onSave) {
      setIsSaving(true)
      await onSave(id)
      setIsSaving(false)
    }
  }

  const scoreColor = matchScore ? getColorForScore(matchScore) : '#666'

  return (
    <Link href={`/jobs/${id}`} className="no-underline">
      <div className="card-hover group">
        {/* Header with Match Score */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition mb-1">
              {title}
            </h3>
            <p className="text-sm text-gray-600 font-medium">{company}</p>
          </div>

          {matchScore !== undefined && (
            <div className="flex-shrink-0 ml-4 text-center">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white"
                style={{ backgroundColor: scoreColor }}
              >
                {matchScore}%
              </div>
              <p className="text-xs text-gray-600 mt-1">Match</p>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
          {description}
        </p>

        {/* Tags/Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="badge-primary text-xs">
            {job_type.charAt(0).toUpperCase() + job_type.slice(1)}
          </span>
          {timezone && (
            <span className="badge-success text-xs">{timezone}</span>
          )}
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-t border-b border-gray-100">
          {/* Salary */}
          {(salary_min || salary_max) && (
            <div className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-600">{formatSalary(salary_min, salary_max)}</p>
              </div>
            </div>
          )}

          {/* Location */}
          {location && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="text-gray-600">{location}</p>
              </div>
            </div>
          )}

          {/* Posted Date */}
          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-gray-600">{formatDate(posted_date)}</p>
            </div>
          </div>

          {/* Match Reasons (if available) */}
          {matchReasons && Object.keys(matchReasons).length > 0 && (
            <div className="flex items-start gap-2">
              <Star className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5 fill-yellow-400" />
              <div className="text-sm">
                <p className="text-gray-600">Good Fit</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Action Buttons */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-2">
            {matchScore && matchScore >= 80 && (
              <div className="px-2 py-1 bg-green-50 rounded text-xs font-semibold text-green-700">
                ✓ Perfect Match
              </div>
            )}
            {matchScore && matchScore >= 60 && matchScore < 80 && (
              <div className="px-2 py-1 bg-blue-50 rounded text-xs font-semibold text-blue-700">
                ✓ Great Match
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {onSave && (
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="p-2 hover:bg-gray-100 rounded-lg transition disabled:opacity-50"
                title={isSaved ? 'Saved' : 'Save job'}
              >
                <Star
                  className="w-5 h-5"
                  fill={isSaved ? '#fbbf24' : 'none'}
                  color={isSaved ? '#fbbf24' : '#9ca3af'}
                />
              </button>
            )}
            <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition" />
          </div>
        </div>
      </div>
    </Link>
  )
}
