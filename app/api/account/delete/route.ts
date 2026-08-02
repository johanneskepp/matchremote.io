import { NextResponse } from 'next/server'
import { getSessionUser, endSession } from '@/lib/auth/session'
import { getSubscription, deleteUser } from '@/lib/db/queries'
import { cancelPaddleSubscription } from '@/lib/billing/paddle'

export const dynamic = 'force-dynamic'

export async function POST() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 })

  // An active recurring subscription must not keep billing an account that
  // no longer exists, so cancel it first. Best effort: if Paddle is briefly
  // unreachable, stop rather than delete the account with billing still live.
  const subscription = await getSubscription(user.id)
  if (subscription?.paddle_subscription_id && subscription.status !== 'canceled') {
    const result = await cancelPaddleSubscription(subscription.paddle_subscription_id)
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
