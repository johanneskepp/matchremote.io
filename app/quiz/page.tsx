'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { QuizCard } from '@/components/QuizCard'
import { timezones, experienceLevels, jobTypes, commonSkills, industries, companySizes } from '@/lib/utils/helpers'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface QuizAnswers {
  timezone: string
  asyncNeed: number
  meetingTolerance: number
  isParent: boolean
  isNeurodiv: string
  salaryMin: number
  salaryMax: number
  skills: string[]
  experienceLevel: number
  companySizePref: string[]
  workSchedule: string
  industryPref: string[]
  remoteOnly: boolean
}

const initialAnswers: QuizAnswers = {
  timezone: '',
  asyncNeed: 5,
  meetingTolerance: 5,
  isParent: false,
  isNeurodiv: 'no',
  salaryMin: 50000,
  salaryMax: 150000,
  skills: [],
  experienceLevel: 2,
  companySizePref: [],
  workSchedule: 'flexible',
  industryPref: [],
  remoteOnly: true,
}

const quizQuestions = [
  {
    id: 1,
    title: 'What is your primary timezone?',
    description: 'This helps us find jobs with good overlap for your working hours',
    key: 'timezone' as const,
    type: 'select' as const,
    options: timezones.map(tz => ({ value: tz, label: tz })),
  },
  {
    id: 2,
    title: 'How important is async work to you?',
    description: 'Rate from 1 (prefer synchronous) to 10 (need fully async)',
    key: 'asyncNeed' as const,
    type: 'range' as const,
    min: 1,
    max: 10,
  },
  {
    id: 3,
    title: 'How many meetings can you tolerate per week?',
    description: '1 = minimal, 10 = open to lots of meetings',
    key: 'meetingTolerance' as const,
    type: 'range' as const,
    min: 1,
    max: 10,
  },
  {
    id: 4,
    title: 'Do you have parenting responsibilities?',
    key: 'isParent' as const,
    type: 'radio' as const,
    options: [
      { value: 'true', label: 'Yes' },
      { value: 'false', label: 'No' },
    ],
  },
  {
    id: 5,
    title: 'Do you identify as neurodivergent?',
    description: 'Helps us match roles with supportive environments',
    key: 'isNeurodiv' as const,
    type: 'select' as const,
    options: [
      { value: 'no', label: 'No / Prefer not to say' },
      { value: 'adhd', label: 'ADHD' },
      { value: 'autism', label: 'Autism' },
      { value: 'dyslexia', label: 'Dyslexia' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 6,
    title: 'What is your salary expectation?',
    description: 'Minimum annual salary in USD',
    key: 'salaryMin' as const,
    type: 'range' as const,
    min: 30000,
    max: 250000,
    step: 5000,
  },
  {
    id: 7,
    title: 'Maximum salary expectation?',
    description: 'Maximum annual salary in USD',
    key: 'salaryMax' as const,
    type: 'range' as const,
    min: 50000,
    max: 300000,
    step: 5000,
  },
  {
    id: 8,
    title: 'What are your key technical skills?',
    description: 'Select the top 3-5 skills you\'re strongest in',
    key: 'skills' as const,
    type: 'checkbox' as const,
    options: commonSkills.map(skill => ({ value: skill, label: skill })),
  },
  {
    id: 9,
    title: 'What is your experience level?',
    key: 'experienceLevel' as const,
    type: 'select' as const,
    options: Object.entries(experienceLevels).map(([key, label]) => ({ value: key, label })),
  },
  {
    id: 10,
    title: 'What company sizes interest you?',
    description: 'You can select multiple',
    key: 'companySizePref' as const,
    type: 'checkbox' as const,
    options: companySizes.map(size => ({ value: size, label: size })),
  },
  {
    id: 11,
    title: 'What is your preferred work schedule?',
    key: 'workSchedule' as const,
    type: 'select' as const,
    options: jobTypes.map(job => ({ value: job.value, label: job.label })),
  },
  {
    id: 12,
    title: 'What industries interest you?',
    description: 'Select up to 3 industries',
    key: 'industryPref' as const,
    type: 'checkbox' as const,
    options: industries.map(ind => ({ value: ind, label: ind })),
  },
  {
    id: 13,
    title: 'Do you require fully remote positions?',
    key: 'remoteOnly' as const,
    type: 'radio' as const,
    options: [
      { value: 'true', label: 'Yes, fully remote only' },
      { value: 'false', label: 'No, open to hybrid' },
    ],
  },
  {
    id: 14,
    title: 'What role type are you looking for?',
    description: 'What is your primary focus?',
    key: 'skills' as const,
    type: 'radio' as const,
    options: [
      { value: 'engineering', label: 'Software Engineering' },
      { value: 'design', label: 'Design' },
      { value: 'product', label: 'Product Management' },
      { value: 'sales', label: 'Sales' },
      { value: 'marketing', label: 'Marketing' },
      { value: 'other', label: 'Other' },
    ],
  },
  {
    id: 15,
    title: 'Ready to see your matches?',
    description: 'Click next to analyze the job market and see your personalized matches',
    key: 'remoteOnly' as const,
    type: 'radio' as const,
    options: [
      { value: 'true', label: '✓ I\'m ready!' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswers>(initialAnswers)
  const [isLoading, setIsLoading] = useState(false)

  const currentQ = quizQuestions[currentQuestion]

  const handleAnswer = useCallback((value: any) => {
    console.log(`[Quiz] Question ${currentQuestion + 1}: ${currentQ.key} = ${value}`)

    if (currentQ.key === 'isParent') {
      setAnswers(prev => ({
        ...prev,
        isParent: value === 'true',
      }))
    } else if (currentQ.key === 'remoteOnly') {
      setAnswers(prev => ({
        ...prev,
        remoteOnly: value === 'true',
      }))
    } else {
      setAnswers(prev => ({
        ...prev,
        [currentQ.key]: value,
      }))
    }
  }, [currentQuestion, currentQ.key])

  const handleNext = async () => {
    if (currentQuestion < quizQuestions.length - 1) {
      setCurrentQuestion(prev => prev + 1)
    } else {
      // Submit quiz
      setIsLoading(true)
      try {
        console.log('[Quiz] Submitting answers:', answers)

        const response = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(answers),
        })

        if (!response.ok) {
          throw new Error('Failed to submit quiz')
        }

        const data = await response.json()
        console.log('[Quiz] Got results:', data.matchCount, 'matches')

        // Redirect to results
        router.push('/results')
      } catch (error) {
        console.error('[Quiz] Error:', error)
        alert('Error submitting quiz. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1)
    }
  }

  const isAnswered = (): boolean => {
    const key = currentQ.key as keyof QuizAnswers
    const value = answers[key]

    if (value === undefined || value === null || value === '') return false
    if (Array.isArray(value) && value.length === 0) return false
    return true
  }

  const progress = ((currentQuestion + 1) / quizQuestions.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12">
      <div className="container-safe max-w-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Question {currentQuestion + 1} of {quizQuestions.length}
            </span>
            <span className="text-sm font-semibold text-gray-600">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-600 to-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <QuizCard
          title={currentQ.title}
          description={currentQ.description}
          type={currentQ.type}
          options={currentQ.options}
          value={answers[currentQ.key as keyof QuizAnswers]}
          onChange={handleAnswer}
          min={currentQ.type === 'range' ? currentQ.min : undefined}
          max={currentQ.type === 'range' ? currentQ.max : undefined}
          step={currentQ.type === 'range' ? currentQ.step : undefined}
        />

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-4 mt-8">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="btn-secondary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </button>

          <button
            onClick={handleNext}
            disabled={!isAnswered() || isLoading}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Analyzing...' : currentQuestion === quizQuestions.length - 1 ? 'See Results' : 'Next'}
            {!isLoading && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>

        {/* Helpful hint */}
        <p className="text-center text-gray-500 text-sm mt-8">
          💡 Take your time. Your answers help us find better matches.
        </p>
      </div>
    </div>
  )
}
