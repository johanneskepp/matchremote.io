'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SCORE_THRESHOLDS } from '@/lib/plan'

type Props = {
  active: boolean
  status: string | null
  renewsAt: string | null
  cancelAt: string | null
  threshold: number
  alertsActive: boolean
  pricePerWeek: number
}

function formatDay(value: string | null): string {
  if (!value) return ''
  return new Date(value).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
}

export default function AccountControls({ active, status, renewsAt, cancelAt, threshold, alertsActive, pricePerWeek }: Props) {
  const router = useRouter()
  const [savedThreshold, setSavedThreshold] = useState(threshold)
  const [alertsOn, setAlertsOn] = useState(alertsActive)
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [confirmingCancel, setConfirmingCancel] = useState(false)

  const saveAlerts = async (nextThreshold: number, nextActive: boolean) => {
    setBusy(true)
    setNote('')
    try {
      const res = await fetch('/api/account/alert-settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: nextThreshold, active: nextActive }),
      })
      if (!res.ok) {
        const data = await res.json()
        setNote(data.message || 'Could not save that.')
        return
      }
      setSavedThreshold(nextThreshold)
      setAlertsOn(nextActive)
      setNote('Saved.')
    } catch {
      setNote('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  const cancel = async () => {
    setBusy(true)
    setNote('')
    try {
      const res = await fetch('/api/account/cancel', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        setNote(data.message || 'Could not cancel right now.')
        return
      }
      setConfirmingCancel(false)
      router.refresh()
    } catch {
      setNote('Could not reach the server.')
    } finally {
      setBusy(false)
    }
  }

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <section className="card">
        <h2 className="font-display" style={{ fontSize: '21px', marginBottom: '10px' }}>Subscription</h2>

        {active ? (
          <>
            <p style={{ margin: '0 0 6px', fontSize: '16px' }}>
              Active. ${pricePerWeek} a week{renewsAt ? `, next charge ${formatDay(renewsAt)}` : ''}.
            </p>
            {status === 'canceled' && (
              <p style={{ margin: '0 0 6px', fontSize: '15px', color: 'var(--ink-soft)' }}>
                Cancelled. You keep every match until {formatDay(cancelAt || renewsAt)}, then it stops. Nothing else to do.
              </p>
            )}

            {status !== 'canceled' && (
              confirmingCancel ? (
                <div style={{ marginTop: '16px' }}>
                  <p style={{ fontSize: '15px', color: 'var(--ink-soft)', marginTop: 0 }}>
                    You keep access until {formatDay(renewsAt)}. Nothing is charged after that.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    <button onClick={cancel} disabled={busy} className="btn-big" style={{ width: 'auto', minHeight: '52px' }}>
                      {busy ? 'Cancelling...' : 'Yes, cancel'}
                    </button>
                    <button onClick={() => setConfirmingCancel(false)} className="btn-big btn-ghost" style={{ width: 'auto', minHeight: '52px' }}>
                      Keep it
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmingCancel(true)}
                  style={{ marginTop: '12px', color: 'var(--ink-soft)', textDecoration: 'underline', fontSize: '15px', background: 'none', border: 'none', padding: 0 }}
                >
                  Cancel subscription
                </button>
              )
            )}
          </>
        ) : (
          <>
            <p style={{ margin: '0 0 16px', fontSize: '16px', color: 'var(--ink-soft)' }}>
              You are on the free two matches. ${pricePerWeek} a week unlocks the rest and emails you new ones.
            </p>
            <p style={{ margin: 0, fontSize: '15px', color: 'var(--ink-soft)' }}>
              Checkout is not connected yet. This is the last piece waiting on Paddle keys.
            </p>
          </>
        )}
      </section>

      <section className="card">
        <h2 className="font-display" style={{ fontSize: '21px', marginBottom: '6px' }}>Email alerts</h2>
        <p style={{ margin: '0 0 18px', fontSize: '15px', color: 'var(--ink-soft)' }}>
          We email you new matches at or above your threshold, and never the same job twice.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {SCORE_THRESHOLDS.map((value) => (
            <button
              key={value}
              onClick={() => saveAlerts(value, alertsOn)}
              disabled={busy}
              className={`option-card${savedThreshold === value ? ' selected' : ''}`}
              style={{ width: 'auto', minHeight: '56px', padding: '12px 20px', fontSize: '16px' }}
            >
              {value}% and up
            </button>
          ))}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '15px', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={alertsOn}
            disabled={busy}
            onChange={(e) => saveAlerts(savedThreshold, e.target.checked)}
            style={{ width: '20px', height: '20px', accentColor: 'var(--accent)' }}
          />
          Send me these emails
        </label>

        {note && <p style={{ margin: '14px 0 0', fontSize: '14px', color: 'var(--ink-soft)' }}>{note}</p>}
      </section>

      <button onClick={signOut} className="btn-big btn-ghost">Sign out</button>
    </div>
  )
}
