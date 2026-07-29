'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROLE_OPTIONS, SALARY_OPTIONS } from '@/lib/quiz-options'

type Option = { value: string; label: string; emoji: string }
type Question = {
  id: string
  emoji: string
  title: string
  subtitle?: string
  options: Option[]
}

const QUESTIONS: Question[] = [
  {
    id: 'role',
    emoji: '💼',
    title: 'What kind of role are you looking for?',
    subtitle: 'Pick all that apply',
    options: ROLE_OPTIONS,
  },
  {
    id: 'experience',
    emoji: '📈',
    title: 'How much experience do you have?',
    subtitle: 'Pick all that apply',
    options: [
      { value: 'junior', label: 'Junior (0-2 years)', emoji: '🌱' },
      { value: 'mid', label: 'Mid level (3-5 years)', emoji: '🌿' },
      { value: 'senior', label: 'Senior (6-10 years)', emoji: '🌳' },
      { value: 'lead', label: 'Lead / Staff (10+ years)', emoji: '🏔️' },
    ],
  },
  {
    id: 'timezone',
    emoji: '🌍',
    title: 'Where are you based?',
    subtitle: 'We\'ll match jobs with compatible hours',
    options: [
      { value: 'americas', label: 'Americas (UTC 8 to UTC 3)', emoji: '🌎' },
      { value: 'europe', label: 'Europe / Africa (UTC 1 to UTC+3)', emoji: '🌍' },
      { value: 'asia', label: 'Asia / Oceania (UTC+5 to UTC+12)', emoji: '🌏' },
    ],
  },
  {
    id: 'work_style',
    emoji: '🧘',
    title: 'How do you like to work?',
    subtitle: 'Pick all that apply',
    options: [
      { value: 'async', label: 'Mostly async, deep work focused', emoji: '🧘' },
      { value: 'sync', label: 'Real time collaboration & meetings', emoji: '💬' },
      { value: 'flexible', label: 'Flexible hours, no set schedule', emoji: '🕐' },
      { value: 'structured', label: 'Set hours, clear routine', emoji: '📅' },
    ],
  },
  {
    id: 'salary',
    emoji: '💰',
    title: 'What\'s your salary target?',
    subtitle: 'Annual, in USD. Pick all that apply',
    options: SALARY_OPTIONS,
  },
  {
    id: 'job_type',
    emoji: '📋',
    title: 'What kind of position?',
    subtitle: 'Pick all that apply',
    options: [
      { value: 'full_time', label: 'Full time employee', emoji: '👔' },
      { value: 'contract', label: 'Contract / Freelance', emoji: '📝' },
      { value: 'part_time', label: 'Part time', emoji: '⏰' },
      { value: 'any', label: 'Open to anything', emoji: '🤷' },
    ],
  },
  {
    id: 'company_size',
    emoji: '🏢',
    title: 'What size company do you prefer?',
    subtitle: 'Pick all that apply',
    options: [
      { value: 'startup', label: 'Early stage startup (1 to 20)', emoji: '🚀' },
      { value: 'growth', label: 'Growth stage (20 to 100)', emoji: '📈' },
      { value: 'midsize', label: 'Mid size (100 to 500)', emoji: '🏢' },
      { value: 'large', label: 'Large company (500+)', emoji: '🏛️' },
    ],
  },
  {
    id: 'industries',
    emoji: '🎯',
    title: 'Any industries you\'re drawn to?',
    subtitle: 'Pick all that apply',
    options: [
      { value: 'saas', label: 'SaaS / B2B Software', emoji: '💾' },
      { value: 'fintech', label: 'Fintech', emoji: '💳' },
      { value: 'health', label: 'Healthcare / Wellness', emoji: '🏥' },
      { value: 'edu', label: 'Education / EdTech', emoji: '📚' },
      { value: 'ecommerce', label: 'E commerce', emoji: '🛒' },
      { value: 'ai', label: 'AI / Machine Learning', emoji: '🤖' },
      { value: 'climate', label: 'Climate / Sustainability', emoji: '🌱' },
      { value: 'gaming', label: 'Gaming / Entertainment', emoji: '🎮' },
    ],
  },
  {
    id: 'must_haves',
    emoji: '✨',
    title: 'What\'s non negotiable?',
    subtitle: 'The stuff you won\'t compromise on',
    options: [
      { value: 'health_insurance', label: 'Health insurance', emoji: '🏥' },
      { value: 'equity', label: 'Equity / Stock options', emoji: '📈' },
      { value: 'unlimited_pto', label: 'Generous time off', emoji: '🏖️' },
      { value: 'learning_budget', label: 'Learning budget', emoji: '📚' },
      { value: '4_day_week', label: '4 day work week', emoji: '🎉' },
      { value: 'home_office', label: 'Home office stipend', emoji: '🏠' },
    ],
  },
  {
    id: 'management',
    emoji: '👥',
    title: 'Interested in managing people?',
    subtitle: 'Pick all that apply',
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
    subtitle: 'Pick all that apply',
    options: [
      { value: 'minimal', label: 'Almost none, let me work', emoji: '🤫' },
      { value: 'few', label: 'A few per day is fine', emoji: '👍' },
      { value: 'many', label: 'I like collaborating a lot', emoji: '🗣️' },
    ],
  },
  {
    id: 'growth',
    emoji: '🚀',
    title: 'What\'s more important to you?',
    subtitle: 'Pick all that apply',
    options: [
      { value: 'stability', label: 'Stability & steady growth', emoji: '🌳' },
      { value: 'growth', label: 'Fast growth & new challenges', emoji: '🚀' },
      { value: 'balance', label: 'Work life balance above all', emoji: '⚖️' },
      { value: 'impact', label: 'Making meaningful impact', emoji: '🌟' },
    ],
  },
  {
    id: 'benefits_priority',
    emoji: '🎁',
    title: 'Pick your top perks',
    subtitle: 'Pick all that apply',
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
    subtitle: 'Pick all that apply',
    options: [
      { value: 'asap', label: 'ASAP, actively looking', emoji: '🔥' },
      { value: 'soon', label: 'Within 1 to 3 months', emoji: '📅' },
      { value: 'browsing', label: 'Just browsing for now', emoji: '👀' },
    ],
  },
  {
    id: 'ready',
    emoji: '🎉',
    title: 'Ready to see your matches?',
    subtitle: 'We\'ll analyze thousands of jobs for you',
    options: [
      { value: 'yes', label: 'Yes, show me my matches!', emoji: '✨' },
    ],
  },
]

export default function QuizPage() {
  const router = useRouter()
  const [current, setCurrent] = useState(0)
  // Always starts empty. Nothing about this quiz should ever arrive
  // pre-selected, not from a URL, not from a previous session.
  const [answers, setAnswers] = useState<Record<string, string[]>>({})
  const [submitting, setSubmitting] = useState(false)

  const question = QUESTIONS[current]
  const prevQuestion = current > 0 ? QUESTIONS[current - 1] : null
  const nextQuestion = current < QUESTIONS.length - 1 ? QUESTIONS[current + 1] : null

  const answeredCount = QUESTIONS.filter((q) => (answers[q.id]?.length ?? 0) > 0).length
  const progress = (answeredCount / QUESTIONS.length) * 100
  const currentAnswer = answers[question.id] ?? []

  const isSelected = (questionId: string, value: string) => (answers[questionId] ?? []).includes(value)

  const handleSelect = (value: string) => {
    const updated = currentAnswer.includes(value)
      ? currentAnswer.filter((v) => v !== value)
      : [...currentAnswer, value]
    setAnswers({ ...answers, [question.id]: updated })
  }

  const canProceed = currentAnswer.length > 0

  const handleNext = async () => {
    if (current < QUESTIONS.length - 1) {
      setCurrent(current + 1)
    } else {
      setSubmitting(true)
      try {
        const res = await fetch('/api/quiz/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) throw new Error(data.message || 'Submit failed')
        localStorage.setItem('matchremote_user_id', data.userId)
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

  const renderSideSummary = (q: Question) => {
    const picked = answers[q.id] ?? []
    if (picked.length === 0) {
      return <div className="chip chip-sm">Not answered yet</div>
    }
    const labels = q.options.filter((o) => picked.includes(o.value))
    return (
      <div className="side-chips">
        {labels.slice(0, 3).map((o) => (
          <span key={o.value} className="chip chip-sm">{o.emoji} {o.label}</span>
        ))}
        {labels.length > 3 && <span className="chip chip-sm">+{labels.length - 3}</span>}
      </div>
    )
  }

  return (
    <div className="quiz-shell">
      <div className="quiz-topbar">
        <div className="container-wide" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link href="/" style={{ fontSize: '24px', textDecoration: 'none', color: 'var(--ink)' }}>×</Link>
          <div style={{ flex: 1 }}>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, color: 'var(--ink-soft)', whiteSpace: 'nowrap' }}>
            {answeredCount} / {QUESTIONS.length} answered
          </div>
        </div>
        <div className="container-wide">
          <div className="quiz-dots">
            {QUESTIONS.map((q, idx) => {
              const answered = (answers[q.id]?.length ?? 0) > 0
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrent(idx)}
                  className={`quiz-dot ${idx === current ? 'current' : answered ? 'answered' : ''}`}
                  title={q.title}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="container-wide quiz-carousel">
        {prevQuestion && (
          <button className="quiz-side-card" onClick={handleBack}>
            <div className="side-emoji">{prevQuestion.emoji}</div>
            <div className="side-title">{prevQuestion.title}</div>
            {renderSideSummary(prevQuestion)}
          </button>
        )}

        <div className="quiz-main-card">
          <div style={{ textAlign: 'center', marginBottom: '24px', flex: '0 0 auto' }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>{question.emoji}</div>
            <h1 className="font-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: '10px', lineHeight: 1.2 }}>
              {question.title}
            </h1>
            {question.subtitle && (
              <p style={{ color: 'var(--ink-soft)', fontSize: '16px', margin: 0 }}>
                {question.subtitle}
              </p>
            )}
          </div>

          <div className="quiz-options">
            {question.options.map((opt) => {
              const selected = isSelected(question.id, opt.value)
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`option-card ${selected ? 'selected' : ''}`}
                >
                  <span className="emoji">{opt.emoji}</span>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {selected && (
                    <span style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--accent)',
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

        {nextQuestion && (
          <button className="quiz-side-card" onClick={() => setCurrent(current + 1)}>
            <div className="side-emoji">{nextQuestion.emoji}</div>
            <div className="side-title">{nextQuestion.title}</div>
            {renderSideSummary(nextQuestion)}
          </button>
        )}
      </div>

      <div style={{ padding: '20px 0', background: 'var(--surface)', borderTop: '2px solid var(--border)', flex: '0 0 auto' }}>
        <div className="container" style={{ display: 'flex', gap: '12px' }}>
          {current > 0 && (
            <button onClick={handleBack} className="btn-big btn-ghost" style={{ flex: '0 0 auto', width: 'auto', padding: '20px 28px' }}>
              ← Back
            </button>
          )}
          <button
            onClick={handleNext}
            className="btn-big"
            disabled={!canProceed || submitting}
            style={{
              flex: 1,
              opacity: !canProceed || submitting ? 0.4 : 1,
              cursor: !canProceed || submitting ? 'not-allowed' : 'pointer',
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
