import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/billing/stripe'
import { getSessionUser } from '@/lib/auth/session'

export const dynamic = 'force-dynamic'

// A plain redirect to Stripe's own hosted Checkout page rather than an
// embedded client-side widget. No client-side Stripe library or domain
// approval step needed, Stripe just needs to be told where to send the
// browser back to.
export async function POST(request: NextRequest) {
  try {
    // userId and email come only from the session, never from the request
    // body. Trusting a client-supplied userId here would let anyone open a
    // real Stripe Checkout Session for an account they don't own, and the
    // webhook mirrors whatever userId rode along in the metadata straight
    // into that account's subscription state.
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 })
    const userId = user.id
    const email = user.email

    const priceId = process.env.STRIPE_PRICE_ID
    if (!priceId) {
      return NextResponse.json({ message: 'Checkout is not configured' }, { status: 503 })
    }

    const origin = request.nextUrl.origin
    const stripe = getStripeClient()

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      customer_email: email,
      automatic_tax: { enabled: true },
      // Lets the webhook tie a completed checkout back to a matchremote
      // account without a separate lookup table.
      subscription_data: { metadata: { userId } },
      success_url: `${origin}/account?checkout=success`,
      cancel_url: `${origin}/account?checkout=cancelled`,
    })

    if (!session.url) {
      return NextResponse.json({ message: 'Could not start checkout' }, { status: 502 })
    }

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('[checkout] create-session error', error)
    return NextResponse.json({ message: 'Something went wrong' }, { status: 500 })
  }
}
