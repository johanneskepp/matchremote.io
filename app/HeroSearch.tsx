'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ROLE_OPTIONS, SALARY_OPTIONS, matchRoleValue } from '@/lib/quiz-options'

type DemoMatch = {
  title: string
  company: string
  pay: string
  note: string
  score: number
}

// Illustrative only. Company names here are invented, not real listings, and
// the block is labelled as an example on screen so nobody reads these as
// available jobs.
const DEMOS: { role: string; salary: string; matches: DemoMatch[] }[] = [
  {
    role: 'Frontend Engineer',
    salary: '130000',
    matches: [
      { title: 'Senior Frontend Engineer', company: 'Northwind Systems', pay: '$140k - $170k', note: 'Async first, overlaps your hours', score: 94 },
      { title: 'React Engineer, Platform', company: 'Corva Labs', pay: '$125k - $150k', note: 'Salary above your target', score: 88 },
    ],
  },
  {
    role: 'Product Designer',
    salary: '90000',
    matches: [
      { title: 'Product Designer', company: 'Fieldnote', pay: '$95k - $120k', note: 'Two meetings a week, no more', score: 92 },
      { title: 'Senior UX Designer', company: 'Halden Studio', pay: '$88k - $110k', note: 'Matches your timezone', score: 85 },
    ],
  },
  {
    role: 'Customer Success Manager',
    salary: '60000',
    matches: [
      { title: 'Customer Success Manager', company: 'Rowan Health', pay: '$70k - $85k', note: 'Flexible hours, set your own', score: 91 },
      { title: 'Support Lead, EMEA', company: 'Tessel', pay: '$62k - $78k', note: 'Salary above your target', score: 83 },
    ],
  },
  {
    role: 'Data Analyst',
    salary: '90000',
    matches: [
      { title: 'Data Analyst', company: 'Bramble Group', pay: '$92k - $115k', note: 'Deep work culture, low meeting load', score: 90 },
      { title: 'Analytics Engineer', company: 'Juniper Rail', pay: '$105k - $130k', note: 'Salary above your target', score: 86 },
    ],
  },
]

const TYPE_SPEED_MS = 55
const CARDS_DELAY_MS = 420
const DEMO_HOLD_MS = 5200
const SCORE_TICK_MS = 22
const SCORE_TICKS = 28

export default function HeroSearch() {
  const router = useRouter()
  const [demoIndex, setDemoIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [cardsIn, setCardsIn] = useState(false)
  const [scoreProgress, setScoreProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Once the visitor touches either field the demo stops for good and the
  // inputs become theirs.
  const [userOwns, setUserOwns] = useState(false)
  const [role, setRole] = useState('')
  const [salary, setSalary] = useState('')

  const demo = DEMOS[demoIndex]

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (userOwns) return

    if (reducedMotion) {
      setTyped(demo.role)
      setCardsIn(true)
      setScoreProgress(1)
      return
    }

    setTyped('')
    setCardsIn(false)
    let chars = 0
    const timeouts: ReturnType<typeof setTimeout>[] = []

    const typer = setInterval(() => {
      chars += 1
      setTyped(demo.role.slice(0, chars))
      if (chars >= demo.role.length) {
        clearInterval(typer)
        timeouts.push(setTimeout(() => setCardsIn(true), CARDS_DELAY_MS))
        timeouts.push(setTimeout(() => setDemoIndex((i) => (i + 1) % DEMOS.length), DEMO_HOLD_MS))
      }
    }, TYPE_SPEED_MS)

    return () => {
      clearInterval(typer)
      timeouts.forEach(clearTimeout)
    }
  }, [demoIndex, userOwns, reducedMotion, demo.role])

  useEffect(() => {
    if (!cardsIn) {
      setScoreProgress(0)
      return
    }
    if (reducedMotion || userOwns) {
      setScoreProgress(1)
      return
    }
    let tick = 0
    const id = setInterval(() => {
      tick += 1
      setScoreProgress(tick / SCORE_TICKS)
      if (tick >= SCORE_TICKS) clearInterval(id)
    }, SCORE_TICK_MS)
    return () => clearInterval(id)
  }, [cardsIn, reducedMotion, userOwns])

  const takeOver = () => {
    if (userOwns) return
    setUserOwns(true)
    setCardsIn(true)
    setScoreProgress(1)
  }

  const start = () => {
    const params = new URLSearchParams()
    const roleValue = matchRoleValue(userOwns ? role : demo.role)
    if (roleValue) params.set('role', roleValue)
    const salaryValue = userOwns ? salary : demo.salary
    if (salaryValue) params.set('salary', salaryValue)
    const query = params.toString()
    router.push(query ? `/quiz?${query}` : '/quiz')
  }

  const roleFieldValue = userOwns ? role : typed
  const salaryFieldValue = userOwns ? salary : demo.salary

  return (
    <div>
      <div className="hero-search">
        <div className="hero-field">
          <label htmlFor="hero-role">Role</label>
          <input
            id="hero-role"
            type="text"
            list="hero-roles"
            autoComplete="off"
            placeholder="Frontend Engineer"
            value={roleFieldValue}
            onChange={(e) => {
              takeOver()
              setRole(e.target.value)
            }}
            onFocus={takeOver}
          />
          {!userOwns && !reducedMotion && <span className="hero-caret" aria-hidden="true" />}
          <datalist id="hero-roles">
            {ROLE_OPTIONS.filter((o) => o.value !== 'other').map((o) => (
              <option key={o.value} value={o.label} />
            ))}
          </datalist>
        </div>

        <div className="hero-field hero-field-salary">
          <label htmlFor="hero-salary">Salary target</label>
          <select
            id="hero-salary"
            value={salaryFieldValue}
            onChange={(e) => {
              takeOver()
              setSalary(e.target.value)
            }}
            onFocus={takeOver}
          >
            <option value="">Any salary</option>
            {SALARY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <button type="button" className="hero-go" onClick={start}>
          See my matches
        </button>
      </div>

      <div className="hero-demo-label">
        <span className="chip chip-sm">Example</span>
        <span>This is what your results look like. Yours are scored on your own answers.</span>
      </div>

      <div className="hero-cards" aria-live="polite">
        {demo.matches.map((match, i) => (
          <article
            key={`${demoIndex}-${match.company}`}
            className={`hero-card${cardsIn ? ' is-in' : ''}`}
            style={{ transitionDelay: `${i * 110}ms` }}
          >
            <div className="hero-card-main">
              <h3>{match.title}</h3>
              <p className="hero-card-company">{match.company}</p>
              <p className="hero-card-pay">{match.pay}</p>
              <p className="hero-card-note">{match.note}</p>
            </div>
            <div className="hero-card-score">
              <span className="hero-score-num">{Math.round(match.score * scoreProgress)}%</span>
              <span className="hero-score-label">match</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
