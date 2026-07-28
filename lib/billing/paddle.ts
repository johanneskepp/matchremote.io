import { createHmac, timingSafeEqual } from 'node:crypto'

const PADDLE_API_BASE = 'https://api.paddle.com'

/**
 * Paddle Billing sends a Paddle-Signature header shaped like
 * "ts=1700000000;h1=<hex hmac>", where the HMAC is over "<ts>:<raw body>".
 * Verified against the raw request text, never a re-serialized object.
 */
export function verifyPaddleSignature(rawBody: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false

  const parts = Object.fromEntries(
    signatureHeader.split(';').map((pair) => {
      const [key, ...rest] = pair.split('=')
      return [key.trim(), rest.join('=')]
    })
  )

  const ts = parts.ts
  const h1 = parts.h1
  if (!ts || !h1) return false

  const expected = createHmac('sha256', secret).update(`${ts}:${rawBody}`).digest('hex')
  const a = Buffer.from(expected, 'hex')
  const b = Buffer.from(h1, 'hex')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

export async function cancelPaddleSubscription(subscriptionId: string): Promise<{ ok: boolean; error?: string }> {
  const apiKey = process.env.PADDLE_API_KEY
  if (!apiKey) return { ok: false, error: 'PADDLE_API_KEY is not configured' }

  const res = await fetch(`${PADDLE_API_BASE}/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    // Paddle keeps access until the end of the period the user already paid for.
    body: JSON.stringify({ effective_from: 'next_billing_period' }),
  })

  if (!res.ok) {
    const text = await res.text()
    return { ok: false, error: `Paddle returned ${res.status}: ${text}` }
  }
  return { ok: true }
}
