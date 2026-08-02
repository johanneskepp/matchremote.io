import Stripe from 'stripe'

let stripeClient: Stripe | null = null

export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const key = process.env.STRIPE_SECRET_KEY
    if (!key) throw new Error('STRIPE_SECRET_KEY is not configured')
    stripeClient = new Stripe(key)
  }
  return stripeClient
}

// Cancels at the end of the current billing period rather than immediately,
// since the user already paid for that time, matching the UX promise shown
// on /account ("you keep access until [date]").
export async function cancelStripeSubscription(subscriptionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const stripe = getStripeClient()
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true })
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error?.message ?? 'Unknown Stripe error' }
  }
}

// Used only when an account is deleted: billing must stop immediately since
// there is no account left to keep access to.
export async function cancelStripeSubscriptionImmediately(subscriptionId: string): Promise<{ ok: boolean; error?: string }> {
  try {
    const stripe = getStripeClient()
    await stripe.subscriptions.cancel(subscriptionId)
    return { ok: true }
  } catch (error: any) {
    return { ok: false, error: error?.message ?? 'Unknown Stripe error' }
  }
}
