import { NextResponse } from 'next/server'
import { verifyPaddleSignature } from '@/lib/billing/paddle'
import { getUserByEmail, updateUser, upsertSubscription } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

const STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  paused: 'paused',
  canceled: 'canceled',
  past_due: 'past_due',
}

export async function POST(request: Request) {
  const secret = process.env.PADDLE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[paddle] PADDLE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ message: 'Not configured' }, { status: 503 })
  }

  // Must read the raw text: the signature covers the exact bytes Paddle sent.
  const rawBody = await request.text()
  if (!verifyPaddleSignature(rawBody, request.headers.get('paddle-signature'), secret)) {
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  try {
    const event = JSON.parse(rawBody)
    const type: string = event.event_type ?? ''
    if (!type.startsWith('subscription.')) {
      return NextResponse.json({ received: true })
    }

    const data = event.data ?? {}
    // custom_data.userId is set when the checkout is opened, which is how a
    // Paddle subscription is tied back to a matchremote account.
    const userId: string | undefined = data.custom_data?.userId
    const email: string | undefined = data.customer?.email

    const user = userId
      ? { id: userId }
      : email
        ? await getUserByEmail(email.toLowerCase())
        : null

    if (!user) {
      console.error('[paddle] no user for event', type, data.id)
      return NextResponse.json({ received: true })
    }

    const status = STATUS_MAP[data.status] ?? 'active'
    await upsertSubscription(user.id, {
      paddle_subscription_id: data.id ?? null,
      paddle_customer_id: data.customer_id ?? null,
      status,
      current_period_end: data.current_billing_period?.ends_at ?? null,
      cancel_at: data.scheduled_change?.effective_at ?? null,
    })

    await updateUser(user.id, { plan: status === 'active' || status === 'trialing' ? 'premium' : 'free' })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[paddle] webhook error', error)
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}
