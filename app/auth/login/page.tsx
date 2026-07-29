'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/Logo'

const RESEND_COOLDOWN_S = 60

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ minHeight: '100vh' }} />}>
      <Login />
    </Suspense>
  )
}

function Login() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') || '/dashboard'

  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  // A session cookie already logged in doesn't mean the visitor wants to see
  // the login form again, send them straight on. Starts true so the form
  // never flashes before this check resolves.
  const [checkingSession, setCheckingSession] = useState(true)

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          router.replace(next)
        } else {
          setCheckingSession(false)
        }
      })
      .catch(() => setCheckingSession(false))
    // Only ever needs to run once on mount, next/router identity churn shouldn't retrigger it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (cooldown <= 0) return
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [cooldown])

  if (checkingSession) {
    return <main style={{ minHeight: '100vh' }} />
  }

  const requestCode = async () => {
    setError('')
    setBusy(true)
    try {
      const res = await fetch('/api/auth/request-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'Could not send the code.')
        if (typeof data.retryIn === 'number') setCooldown(data.retryIn)
        return
      }
      setStep('code')
      setCooldown(RESEND_COOLDOWN_S)
    } catch {
      setError('Could not reach the server. Try again.')
    } finally {
      setBusy(false)
    }
  }

  const verifyCode = async () => {
    setError('')
    setBusy(true)
    try {
      // Carries over anything the visitor already did as an anonymous quiz
      // taker, so signing in never loses their existing matches.
      const guestUserId = localStorage.getItem('matchremote_user_id')
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, guestUserId }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || 'That code did not work.')
        return
      }
      localStorage.setItem('matchremote_user_id', data.userId)
      router.push(next)
    } catch {
      setError('Could not reach the server. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide">
          <Logo />
        </div>
      </header>

      <div style={{ flex: '1 1 auto', display: 'flex', alignItems: 'center', padding: '40px 0' }}>
        <div className="container" style={{ maxWidth: '440px' }}>
          <div className="card">
            {step === 'email' ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!busy) requestCode()
                }}
              >
                <h1 className="font-display" style={{ fontSize: '28px', marginBottom: '8px' }}>Sign in</h1>
                <p style={{ color: 'var(--ink-soft)', fontSize: '15px', marginTop: 0, marginBottom: '24px' }}>
                  We send you a six digit code. No password, ever.
                </p>

                <label htmlFor="email" style={labelStyle}>Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={inputStyle}
                />

                {error && <p style={errorStyle}>{error}</p>}

                <button type="submit" className="btn-big" disabled={busy} style={{ marginTop: '20px', opacity: busy ? 0.6 : 1 }}>
                  {busy ? 'Sending...' : 'Send me a code'}
                </button>
              </form>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!busy) verifyCode()
                }}
              >
                <h1 className="font-display" style={{ fontSize: '28px', marginBottom: '8px' }}>Check your email</h1>
                <p style={{ color: 'var(--ink-soft)', fontSize: '15px', marginTop: 0, marginBottom: '24px' }}>
                  We sent a six digit code to {email}. It expires in 10 minutes.
                </p>

                <label htmlFor="code" style={labelStyle}>Code</label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  autoFocus
                  maxLength={6}
                  placeholder="000000"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{ ...inputStyle, fontSize: '26px', letterSpacing: '0.3em', textAlign: 'center', fontWeight: 700 }}
                />

                {error && <p style={errorStyle}>{error}</p>}

                <button
                  type="submit"
                  className="btn-big"
                  disabled={busy || code.length !== 6}
                  style={{ marginTop: '20px', opacity: busy || code.length !== 6 ? 0.6 : 1 }}
                >
                  {busy ? 'Checking...' : 'Sign in'}
                </button>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px', fontSize: '14px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('email')
                      setCode('')
                      setError('')
                    }}
                    style={linkButtonStyle}
                  >
                    Use another email
                  </button>
                  <button
                    type="button"
                    onClick={requestCode}
                    disabled={cooldown > 0 || busy}
                    style={{ ...linkButtonStyle, opacity: cooldown > 0 ? 0.5 : 1 }}
                  >
                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                  </button>
                </div>
              </form>
            )}
          </div>

          <p style={{ textAlign: 'center', fontSize: '14px', color: 'var(--ink-soft)', marginTop: '20px' }}>
            No account needed to take the quiz.{' '}
            <Link href="/quiz" style={{ color: 'var(--teal)', fontWeight: 600 }}>Start there instead</Link>
          </p>
        </div>
      </div>
    </main>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '12px',
  fontWeight: 700,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: 'var(--ink-soft)',
  marginBottom: '6px',
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '56px',
  padding: '14px 16px',
  fontSize: '17px',
  fontFamily: 'var(--font-body), sans-serif',
  color: 'var(--ink)',
  background: 'var(--bg)',
  border: '2px solid var(--border)',
  borderRadius: '14px',
  outline: 'none',
}

const errorStyle: React.CSSProperties = {
  margin: '14px 0 0',
  fontSize: '14px',
  color: 'var(--accent-dark)',
  fontWeight: 600,
}

const linkButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  padding: 0,
  color: 'var(--teal)',
  fontWeight: 600,
  fontSize: '14px',
  cursor: 'pointer',
}
