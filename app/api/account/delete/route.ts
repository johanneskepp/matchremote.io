import { NextResponse } from 'next/server'
import { getSessionUser, endSession } from '@/lib/auth/session'
import { getSubscription, deleteUser } from '@/lib/db/queries'
import { cancelStripeSubscriptionImmediately } from '@/lib/billing/stripe'

export const dynamic = 'force-dynamic'

export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 })

  // An active recurring subscription must not keep billing an account that
  // no longer exists, so cancel it first, immediately rather than at period
  // end since there is no account left to keep access on. Best effort: if
  // Stripe is briefly unreachable, stop rather than delete with billing live.
  const subscription = await getSubscription(user.id)
  if (subscription?.stripe_subscription_id && subscription.status !== 'canceled') {
    const result = await cancelStripeSubscriptionImmediately(subscription.stripe_subscription_id)
    if (!result.ok) {
      console.error('[account] delete: could not cancel subscription first', result.error)
      return NextResponse.json(
        { message: 'Could not cancel your subscription right now, so the account was not deleted. Try again in a moment.' },
        { status: 502 }
      )
    }
  }

  await deleteUser(user.id)
  await endSession()

  return NextResponse.json({ success: true })
}
