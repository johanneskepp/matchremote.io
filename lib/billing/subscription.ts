import { getSubscription } from '@/lib/db/queries'

export type AccessState = {
  active: boolean
  status: string | null
  renewsAt: string | null
  cancelAt: string | null
}

// A canceled subscription still has access until the period it was paid for
// runs out, which is why status alone is not the answer.
export function isActive(subscription: any | null): boolean {
  if (!subscription) return false
  if (subscription.status === 'active' || subscription.status === 'trialing') return true
  if (subscription.status === 'canceled' && subscription.current_period_end) {
    return new Date(subscription.current_period_end) > new Date()
  }
  return false
}

export async function getAccessState(userId: string): Promise<AccessState> {
  const subscription = await getSubscription(userId)
  return {
    active: isActive(subscription),
    status: subscription?.status ?? null,
    renewsAt: subscription?.current_period_end ?? null,
    cancelAt: subscription?.cancel_at ?? null,
  }
}
