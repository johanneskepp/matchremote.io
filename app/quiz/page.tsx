'use client'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ROLE_OPTIONS, SALARY_OPTIONS } from '@/lib/quiz-options'

type Option = { value: string; label: string; emoji: string }
type Group = { id: string; title: string; options: Option[] }
type Question = {
  id: string
  title: string
  subtitle?: string
  options?: Option[]
  groups?: Group[]
}

const QUESTIONS: Question[] = [
  {
    id: 'role',
    title: 'What kind of role are you looking for?',
    subtitle: 'Select all that apply',
    options: ROLE_OPTIONS,
  },
  {
    id: 'experience',
    title: 'How much experience do you have?',
    subtitle: 'Select all that apply',
    options: [
      { value: 'junior', label: 'Junior (0 to 2 years)', emoji: '' },
      { value: 'mid', label: 'Mid level (3 to 5 years)', emoji: '' },
      { value: 'senior', label: 'Senior (6 to 10 years)', emoji: '' },
      { value: 'lead', label: 'Lead / Staff (10+ years)', emoji: '' },
    ],
  },
  {
    id: 'timezone',
    title: 'Where are you based?',
    subtitle: "We'll match jobs with compatible hours",
    options: [
      { value: 'americas', label: 'Americas (UTC 8 to UTC 3)', emoji: '' },
      { value: 'europe', label: 'Europe / Africa (UTC 1 to UTC+3)', emoji: '' },
      { value: 'asia', label: 'Asia / Oceania (UTC+5 to UTC+12)', emoji: '' },
    ],
  },
  {
    id: 'work_style',
    title: 'How do you like to work day to day?',
    subtitle: 'Select all that apply',
    options: [
      { value: 'async', label: 'Mostly async, deep work, minimal meetings', emoji: '' },
      { value: 'sync', label: 'Real time collaboration, meetings included', emoji: '' },
      { value: 'flexible', label: 'Flexible hours, no set schedule', emoji: '' },
      { value: 'structured', label: 'Set hours, clear routine', emoji: '' },
    ],
  },
  {
    id: 'salary',
    title: "What's your salary target?",
    subtitle: 'Annual, in USD. Select all that apply',
    options: SALARY_OPTIONS,
  },
  {
    id: 'company_size',
    title: 'What size company do you prefer?',
    subtitle: 'Select all that apply',
    options: [
      { value: 'startup', label: 'Early stage startup (1 to 20)', emoji: '' },
      { value: 'growth', label: 'Growth stage (20 to 100)', emoji: '' },
      { value: 'midsize', label: 'Mid size (100 to 500)', emoji: '' },
      { value: 'large', label: 'Large company (500+)', emoji: '' },
    ],
  },
  {
    id: 'industries',
    title: "Any industries you're drawn to?",
    subtitle: 'Select all that apply',
    options: [
      { value: 'saas', label: 'SaaS / B2B Software', emoji: '' },
      { value: 'fintech', label: 'Fintech', emoji: '' },
      { value: 'health', label: 'Healthcare / Wellness', emoji: '' },
      { value: 'edu', label: 'Education / EdTech', emoji: '' },
      { value: 'ecommerce', label: 'E commerce', emoji: '' },
      { value: 'ai', label: 'AI / Machine Learning', emoji: '' },
      { value: 'climate', label: 'Climate / Sustainability', emoji: '' },
      { value: 'gaming', label: 'Gaming / Entertainment', emoji: '' },
    ],
  },
  {
    id: 'position_shape',
    title: 'A couple quick ones',
    groups: [
      {
        id: 'job_type',
        title: 'Position type',
        options: [
          { value: 'full_time', label: 'Full time employee', emoji: '' },
          { value: 'contract', label: 'Contract / Freelance', emoji: '' },
          { value: 'part_time', label: 'Part time', emoji: '' },
          { value: 'any', label: 'Open to anything', emoji: '' },
        ],
      },
      {
        id: 'management',
        title: 'Managing people',
        options: [
          { value: 'yes', label: 'Yes, I want to lead a team', emoji: '' },
          { value: 'ic', label: 'No, I prefer being an IC', emoji: '' },
          { value: 'open', label: 'Open to both', emoji: '' },
        ],
      },
    ],
  },
  {
    id: 'priorities',
    title: 'What matters most',
    groups: [
      {
        id: 'growth',
        title: "What's more important to you",
        options: [
          { value: 'stability', label: 'Stability & steady growth', emoji: '' },
          { value: 'growth', label: 'Fast growth & new challenges', emoji: '' },
          { value: 'balance', label: 'Work life balance above all', emoji: '' },
          { value: 'impact', label: 'Making meaningful impact', emoji: '' },
        ],
      },
      {
        id: 'benefits_priority',
        title: 'Top priority',
        options: [
          { value: 'high_salary', label: 'High salary', emoji: '' },
          { value: 'flexibility', label: 'Maximum flexibility', emoji: '' },
          { value: 'learning', label: 'Learning & growth', emoji: '' },
          { value: 'team', label: 'Team & culture', emoji: '' },
        ],
      },
    ],
  },
  {
    id: 'when',
    title: 'When would you start?',
    subtitle: 'Select all that apply',
    options: [
      { value: 'asap', label: 'ASAP, actively looking', emoji: '' },
      { value: 'soon', label: 'Within 1 to 3 months', emoji: '' },
      { value: 'browsing', label: 'Just browsing for now', emoji: '' },
    ],
  },
]

function screenFieldIds(q: Question): string[] {
  return q.groups ? q.groups.map((g) => g.id) : [q.id]
}

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
  const isLast = current === QUESTIONS.length - 1

  const scrollRef = useRef<HTMLDivElement>(null)
  const mainCardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    if (mainCardRef.current) mainCardRef.current.scrollTop = 0
  }, [current])

  const isScreenAnswered = (q: Question) =>
    screenFieldIds(q).every((id) => (answers[id]?.length ?? 0) > 0)

  const answeredCount = QUESTIONS.filter(isScreenAnswered).length
  const progress = (answeredCount / QUESTIONS.length) * 100

  const isSelected = (fieldId: string, value: string) => (answers[fieldId] ?? []).includes(value)

  const handleSelect = (fieldId: string, value: string) => {
    const current = answers[fieldId] ?? []
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    setAnswers({ ...answers, [fieldId]: updated })
  }

  const canProceed = isScreenAnswered(question)

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
    const fieldIds = screenFieldIds(q)
    const allOptions: Option[] = q.groups ? q.groups.flatMap((g) => g.options) : q.options ?? []
    const picked = fieldIds.flatMap((id) => answers[id] ?? [])
    if (picked.length === 0) {
      return <div className="chip chip-sm">Not answered yet</div>
    }
    const labels = allOptions.filter((o) => picked.includes(o.value))
    return (
      <div className="side-chips">
        {labels.slice(0, 3).map((o) => (
          <span key={o.value} className="chip chip-sm">{o.label}</span>
        ))}
        {labels.length > 3 && <span className="chip chip-sm">+{labels.length - 3}</span>}
      </div>
    )
  }

  const renderOptions = (fieldId: string, options: Option[], compact: boolean) => (
    <div
      className={compact ? 'quiz-options quiz-options-compact' : 'quiz-options'}
      ref={compact ? undefined : scrollRef}
    >
      {options.map((opt) => {
        const selected = isSelected(fieldId, opt.value)
        return (
          <button
            key={opt.value}
            onClick={() => handleSelect(fieldId, opt.value)}
            className={`option-card ${compact ? 'option-card-compact' : ''} ${selected ? 'selected' : ''}`}
          >
            <span style={{ flex: 1 }}>{opt.label}</span>
            {selected && <span className="option-check">✓</span>}
          </button>
        )
      })}
    </div>
  )

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
              const answered = isScreenAnswered(q)
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
            <div className="side-title">{prevQuestion.title}</div>
            {renderSideSummary(prevQuestion)}
          </button>
        )}

        <div className="quiz-main-card" ref={mainCardRef}>
          <div style={{ textAlign: 'center', marginBottom: '24px', flex: '0 0 auto' }}>
            <h1 className="font-display" style={{ fontSize: 'clamp(24px, 4vw, 36px)', marginBottom: '10px', lineHeight: 1.2 }}>
              {question.title}
            </h1>
            {question.subtitle && (
              <p style={{ color: 'var(--ink-soft)', fontSize: '16px', margin: 0 }}>
                {question.subtitle}
              </p>
            )}
          </div>

          {question.groups ? (
            <div className="quiz-groups" ref={scrollRef}>
              {question.groups.map((g) => (
                <div key={g.id} className="quiz-group">
                  <h2 className="quiz-group-title">{g.title}</h2>
                  {renderOptions(g.id, g.options, true)}
                </div>
              ))}
            </div>
          ) : (
            renderOptions(question.id, question.options ?? [], false)
          )}
        </div>

        {nextQuestion && (
          <button className="quiz-side-card" onClick={() => setCurrent(current + 1)}>
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
            {submitting ? 'Analyzing' : isLast ? 'See your matches' : 'Continue →'}
          </button>
        </div>
      </div>
    </div>
  )
}
