import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { getSubscription, upsertSubscription } from '@/lib/db/queries'
import { cancelStripeSubscription } from '@/lib/billing/stripe'

export const dynamic = 'force-dynamic'

export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 })

  const subscription = await getSubscription(user.id)
  if (!subscription?.stripe_subscription_id) {
    return NextResponse.json({ message: 'No active subscription to cancel.' }, { status: 400 })
  }

  const result = await cancelStripeSubscription(subscription.stripe_subscription_id)
  if (!result.ok) {
    console.error('[account] cancel failed', result.error)
    return NextResponse.json({ message: 'Could not cancel right now. Try again in a moment.' }, { status: 502 })
  }

  // Stripe confirms the final state over the webhook, this just reflects it
  // immediately so the account page does not look like nothing happened.
  await upsertSubscription(user.id, { status: 'canceled', cancel_at: subscription.current_period_end })

  return NextResponse.json({ success: true })
}
