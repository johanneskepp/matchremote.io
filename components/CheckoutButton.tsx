'use client'

import { useState } from 'react'
import { initializePaddle, type Paddle } from '@paddle/paddle-js'

let paddlePromise: Promise<Paddle | undefined> | null = null

function getPaddle(): Promise<Paddle | undefined> {
  if (!paddlePromise) {
    paddlePromise = initializePaddle({
      environment: process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === 'sandbox' ? 'sandbox' : 'production',
      token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN || '',
    })
  }
  return paddlePromise
}

type Props = {
  userId: string
  email: string
  label?: string
}

export default function CheckoutButton({ userId, email, label = 'Subscribe' }: Props) {
  const [opening, setOpening] = useState(false)
  const [error, setError] = useState('')

  const openCheckout = async () => {
    setOpening(true)
    setError('')
    try {
      const priceId = process.env.NEXT_PUBLIC_PADDLE_PRICE_ID
      if (!priceId) throw new Error('missing price id')

      const paddle = await getPaddle()
      if (!paddle) throw new Error('paddle did not load')

      paddle.Checkout.open({
        items: [{ priceId, quantity: 1 }],
        customer: { email },
        // app: 'matchremote' lets the webhook tell this subscription apart from
        // any other product on the same shared Paddle seller account.
        customData: { userId, app: 'matchremote' },
      })
    } catch {
      setError('Could not open checkout. Try again in a moment.')
    } finally {
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
