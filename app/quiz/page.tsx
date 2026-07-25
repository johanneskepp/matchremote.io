'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Option = { value: string; label: string; emoji: string }
type Question = {
  id: string
  emoji: string
  title: string
  subtitle?: string
  type: 'single' | 'multi'
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    id: 'role',
    emoji: '💼',
    title: 'What kind of role are you looking for?',
    subtitle: 'Pick your main area',
    type: 'single',
    options: [
      { value: 'engineering', label: 'Engineering / Development', emoji: '💻' },
      { value: 'design', label: 'Design / Creative', emoji: '🎨' },
      { value: 'product', label: 'Product Management', emoji: '📊' },
      { value: 'marketing', label: 'Marketing / Growth', emoji: '📣' },
      { value: 'sales', label: 'Sales / Business Development', emoji: '💰' },
      { value: 'operations', label: 'Operations / Support', emoji: '⚙️' },
      { value: 'other', label: 'Something else', emoji: '✨' },
    ],
  },
  {
    id: 'experience',
    emoji: '📈',
    title: 'How much experience do you have?',
    type: 'single',
    options: [
      { value: 'junior', label: 'Junior (0-2 years)', emoji: '🌱' },
      { value: 'mid', label: 'Mid-level (3-5 years)', emoji: '🌿' },
      { value: 'senior', label: 'Senior (6-10 years)', emoji: '🌳' },
      { value: 'lead', label: 'Lead / Staff (10+ years)', emoji: '🏔️' },
    ],
  },
  {
    id: 'timezone',
    emoji: '🌍',
    title: 'Where are you based?',
    subtitle: 'We\'ll match jobs with compatible hours',
    type: 'single',
    options: [
      { value: 'americas', label: 'Americas (UTC-8 to UTC-3)', emoji: '🌎' },
      { value: 'europe', label: 'Europe / Africa (UTC-1 to UTC+3)', emoji: '🌍' },
      { value: 'asia', label: 'Asia / Oceania (UTC+5 to UTC+12)', emoji: '🌏' },
    ],
  },
  {
    id: 'work_style',
    emoji: '🧘',
    title: 'How do you like to work?',
    subtitle: 'Pick all that apply',
    type: 'multi',
    options: [
      { value: 'async', label: 'Mostly async, deep work focused', emoji: '🧘' },
      { value: 'sync', label: 'Real-time collaboration & meetings', emoji: '💬' },
      { value: 'flexible', label: 'Flexible hours, no set schedule', emoji: '🕐' },
      { value: 'structured', label: 'Set hours, clear routine', emoji: '📅' },
    ],
  },
  {
    id: 'salary',
    emoji: '💰',
    title: 'What\'s your salary target?',
    subtitle: 'Annual, in USD',
    type: 'single',
    options: [
      { value: '30000', label: 'Under $50k', emoji: '💵' },
      { value: '60000', label: '$50k - $80k', emoji: '💵' },
      { value: '90000', label: '$80k - $120k', emoji: '💰' },
      { value: '130000', label: '$120k - $180k', emoji: '💰' },
      { value: '200000', label: '$180k+', emoji: '💎' },
    ],
  },
  {
    id: 'job_type',
    emoji: '📋',
    title: 'What kind of position?',
    type: 'single',
    options: [
      { value: 'full_time', label: 'Full-time employee', emoji: '👔' },
      { value: 'contract', label: 'Contract / Freelance', emoji: '📝' },
      { value: 'part_time', label: 'Part-time', emoji: '⏰' },
      { value: 'any', label: 'Open to anything', emoji: '🤷' },
    ],
  },
  {
    id: 'company_size',
    emoji: '🏢',
    title: 'What size company do you prefer?',
    type: 'multi',
    options: [
      { value: 'startup', label: 'Early stage startup (1-20)', emoji: '🚀' },
      { value: 'growth', label: 'Growth stage (20-100)', emoji: '📈' },
      { value: 'midsize', label: 'Mid-size (100-500)', emoji: '🏢' },
      { value: 'large', label: 'Large company (500+)', emoji: '🏛️' },
    ],
  },
  {
    id: 'industries',
    emoji: '🎯',
    title: 'Any industries you\'re drawn to?',
    subtitle: 'Pick up to 3',
    type: 'multi',
    options: [
      { value: 'saas', label: 'SaaS / B2B Software', emoji: '💾' },
      { value: 'fintech', label: 'Fintech', emoji: '💳' },
      { value: 'health', label: 'Healthcare / Wellness', emoji: '🏥' },
      { value: 'edu', label: 'Education / EdTech', emoji: '📚' },
      { value: 'ecommerce', label: 'E-commerce', emoji: '🛒' },
      { value: 'ai', label: 'AI / Machine Learning', emoji: '🤖' },
      { value: 'climate', label: 'Climate / Sustainability', emoji: '🌱' },
      { value: 'gaming', label: 'Gaming / Entertainment', emoji: '🎮' },
    ],
  },
  {
    id: 'must_haves',
    emoji: '✨',
    title: 'What\'s non-negotiable?',
    subtitle: 'The stuff you won\'t compromise on',
    type: 'multi',
    options: [
      { value: 'health_insurance', label: 'Health insurance', emoji: '🏥' },
      { value: 'equity', label: 'Equity / Stock options', emoji: '📈' },
      { value: 'unlimited_pto', label: 'Generous time off', emoji: '🏖️' },
      { value: 'learning_budget', label: 'Learning budget', emoji: '📚' },
      { value: '4_day_week', label: '4-day work week', emoji: '🎉' },
      { value: 'home_office', label: 'Home office stipend', emoji: '🏠' },
    ],
  },
  {
    id: 'management',
    emoji: '👥',
    title: 'Interested in managing people?',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes, I want to lead a team', emoji: '👑' },
      { value: 'ic', label: 'No, I prefer being an IC', emoji: '🎯' },
      { value: 'open', label: 'Open to both', emoji: '🤝' },
    ],
  },
  {
    id: 'meetings',
    emoji: '📞',
    title: 'How many meetings feel right?',
    type: 'single',
    options: [
      { value: 'minimal', label: 'Almost none - let me work', emoji: '🤫' },
      { value: 'few', label: 'A few per day is fine', emoji: '👍' },
      { value: 'many', label: 'I like collaborating a lot', emoji: '🗣️' },
    ],
  },
  {
    id: 'growth',
    emoji: '🚀',
    title: 'What\'s more important to you?',
    type: 'single',
    options: [
      { value: 'stability', label: 'Stability & steady growth', emoji: '🌳' },
      { value: 'growth', label: 'Fast growth & new challenges', emoji: '🚀' },
      { value: 'balance', label: 'Work-life balance above all', emoji: '⚖️' },
      { value: 'impact', label: 'Making meaningful impact', emoji: '🌟' },
    ],
  },
  {
    id: 'benefits_priority',
    emoji: '🎁',
    title: 'Pick your top perk',
    type: 'single',
    options: [
      { value: 'high_salary', label: 'High salary', emoji: '💰' },
      { value: 'flexibility', label: 'Maximum flexibility', emoji: '🌈' },
      { value: 'learning', label: 'Learning & growth', emoji: '📚' },
      { value: 'team', label: 'Amazing team & culture', emoji: '💫' },
    ],
  },
  {
    id: 'when',
    emoji: '⏱️',
    title: 'When would you start?',
    type: 'single',
    options: [
      { value: 'asap', label: 'ASAP - actively looking', emoji: '🔥' },
      { value: 'soon', label: 'Within 1-3 months', emoji: '📅' },
      { value: 'browsing', label: 'Just browsing for now', emoji: '👀' },
    ],
  },
  {
    id: 'ready',
    emoji: '🎉',
    title: 'Ready to see your matches?',
    subtitle: 'We\'ll analyze thousands of jobs for you',
    type: 'single',
    options: [
      { value: 'yes', label: 'Yes, show me my matches!', emoji: '✨' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)

  const question = QUESTIONS[current]
  const progress = ((current + 1) / QUESTIONS.length) * 100
  const currentAnswer = answers[question.id]

  const isMultiSelected = (value: string) => {
    return Array.isArray(currentAnswer) && currentAnswer.includes(value)
  }

  const handleSelect = (value: string) => {
    if (question.type === 'multi') {
      const current = Array.isArray(currentAnswer) ? currentAnswer : []
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      setAnswers({ ...answers, [question.id]: updated })
    } else {
      setAnswers({ ...answers, [question.id]: value })
    }
  }

  const canProceed = () => {
    if (question.type === 'multi') {
      return Array.isArray(currentAnswer) && currentAnswer.length > 0
    }
    return !!currentAnswer
  }

  const handleNext = async () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1)
    } else {
      // Submit
      setSubmitting(true)
      try {
        // Store in localStorage for now (before database is set up)
        localStorage.setItem('matchremote_quiz', JSON.stringify(answers))
        router.push('/results')
      } catch (e) {
        alert('Something went wrong. Try again?')
        setSubmitting(false)
      }
    }
  }

  const handleBack = () => {
    if (current > 0) setCurrent(current - 1)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar with progress */}
      <div style={{ padding: '20px 0', background: 'white', borderBottom: '2px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/" style={{ fontSize: '24px', textDecoration: 'none' }}>×</Link>
          <div style={{ flex: 1 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
            {current + 1} / {QUESTIONS.length}
          </div>
        </div>
      </div>

      {/* Question */}
      <div style={{ flex: 1, padding: '40px 0 20px', display: 'flex', flexDirection: 'column' }}>
        <div className="container" style={{ flex: 1 }}>
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>{question.emoji}</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(28px, 5vw, 40px)', marginBottom: '12px', lineHeight: 1.2 }}>
              {question.title}
            </h1>
            {question.subtitle && (
              <p style={{ color: 'var(--ink-soft)', fontSize: '17px', margin: 0 }}>
                {question.subtitle}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {question.options.map((opt) => {
              const isSelected = question.type === 'multi'
                ? isMultiSelected(opt.value)
                : currentAnswer === opt.value

              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`option-card ${isSelected ? 'selected' : ''}`}
                >
                  <span className="emoji">{opt.emoji}</span>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {isSelected && (
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--indigo)',
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '18px',
                      fontWeight: 700,
                    }}>✓</span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ padding: '20px 0', background: 'white', borderTop: '2px solid var(--border)' }}>
        <div className="container" style={{ display: 'flex', gap: '12px' }}>
          {current > 0 && (
            <button onClick={handleBack} className="btn-big btn-ghost" style={{ flex: '0 0 auto', width: 'auto', padding: '20px 28px' }}>
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-big"
            disabled={!canProceed() || submitting}
            style={{
              flex: 1,
              opacity: !canProceed() || submitting ? 0.4 : 1,
              cursor: !canProceed() || submitting ? 'not-allowed' : 'pointer',
            }}
          >
            {submitting
              ? 'Analyzing...'
              : current === QUESTIONS.length - 1
                ? 'See my matches ✨'
                : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
