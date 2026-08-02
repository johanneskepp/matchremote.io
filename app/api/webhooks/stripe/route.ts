import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getStripeClient } from '@/lib/billing/stripe'
import { updateUser, upsertSubscription } from '@/lib/db/queries'

export const dynamic = 'force-dynamic'

// Stripe subscription statuses that don't map 1:1 onto the DB's stricter
// CHECK constraint (active, paused, canceled, past_due, trialing).
const STATUS_MAP: Record<string, string> = {
  active: 'active',
  trialing: 'trialing',
  past_due: 'past_due',
  unpaid: 'past_due',
  incomplete: 'past_due',
  incomplete_expired: 'canceled',
  canceled: 'canceled',
  paused: 'paused',
}

function toIso(unixSeconds: number | null | undefined): string | null {
  return unixSeconds ? new Date(unixSeconds * 1000).toISOString() : null
}

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!secret) {
    console.error('[stripe] STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ message: 'Not configured' }, { status: 503 })
  }

  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')

  let event: Stripe.Event
  try {
    event = getStripeClient().webhooks.constructEvent(rawBody, signature ?? '', secret)
  } catch (error) {
    console.error('[stripe] signature verification failed', error)
    return NextResponse.json({ message: 'Invalid signature' }, { status: 401 })
  }

  try {
    if (!event.type.startsWith('customer.subscription.')) {
      return NextResponse.json({ received: true })
    }

    const subscription = event.data.object as Stripe.Subscription
    const userId = subscription.metadata?.userId

    if (!userId) {
      console.error('[stripe] subscription event with no userId in metadata', subscription.id)
      return NextResponse.json({ received: true })
    }

    const status = STATUS_MAP[subscription.status] ?? 'active'
    const item = subscription.items.data[0]

    await upsertSubscription(userId, {
      stripe_subscription_id: subscription.id,
      stripe_customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id,
      status,
      current_period_end: toIso(item?.current_period_end),
      cancel_at: toIso(subscription.cancel_at),
    })

    await updateUser(userId, { plan: status === 'active' || status === 'trialing' ? 'premium' : 'free' })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('[stripe] webhook error', error)
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}
