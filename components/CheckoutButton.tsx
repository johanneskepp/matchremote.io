'use client'

import { useState } from 'react'

type Props = {
  label?: string
}

export default function CheckoutButton({ label = 'Subscribe' }: Props) {
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  const openCheckout = async () => {
    setOpening(true)
    setError('')
    try {
      // No body: the server derives who is checking out from the session
      // cookie, never from anything the client claims.
      const res = await fetch('/api/checkout/create-session', { method: 'POST' })
      const data = await res.json()
      if (!res.ok || !data.url) throw new Error(data.message || 'Could not start checkout')
      window.location.href = data.url
    } catch {
      setError('Could not open checkout. Try again in a moment.')
      setOpening(false)
    }
  }

  return (
    <div>
      <button onClick={openCheckout} disabled={opening} className="btn-big" style={{ width: 'auto', minHeight: '52px' }}>
        {opening ? 'Loading...' : label}
      </button>
      {error && <p style={{ margin: '10px 0 0', fontSize: '14px', color: 'var(--ink-soft)' }}>{error}</p>}
    </div>
  )
}
