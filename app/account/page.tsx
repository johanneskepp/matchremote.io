import Link from 'next/link'
import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getSessionUser } from '@/lib/auth/session'
import { getAccessState } from '@/lib/billing/subscription'
import { getAlertSettings } from '@/lib/db/queries'
import { DEFAULT_ALERT_THRESHOLD, PRICE_PER_WEEK_USD } from '@/lib/plan'
import AccountControls from './AccountControls'
import Logo from '@/components/Logo'
import SignOutLink from '@/components/SignOutLink'

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await getSessionUser()
  if (!user) redirect('/auth/login?next=/account')

  const access = await getAccessState(user.id)
  const alerts = await getAlertSettings(user.id)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '20px 0', background: 'var(--surface)', borderBottom: '2px solid var(--border)' }}>
        <div className="container-wide" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
          <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
            <Link href="/dashboard" style={{ color: 'var(--ink-soft)', fontSize: '15px', textDecoration: 'none' }}>
              Your matches
            </Link>
            <SignOutLink />
          </div>
        </div>
      </header>

      <main style={{ flex: '1 1 auto', padding: '44px 0 72px' }}>
        <div className="container" style={{ maxWidth: '560px' }}>
          <h1 className="font-display" style={{ fontSize: '34px', marginBottom: '6px' }}>Your account</h1>
          <p style={{ color: 'var(--ink-soft)', marginTop: 0, marginBottom: '30px' }}>{user.email}</p>

          <AccountControls
            userId={user.id}
            email={user.email}
            checkoutConfigured={Boolean(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID)}
            active={access.active}
            status={access.status}
            renewsAt={access.renewsAt}
            cancelAt={access.cancelAt}
            threshold={alerts?.threshold ?? DEFAULT_ALERT_THRESHOLD}
            alertsActive={alerts?.active ?? true}
            pricePerWeek={PRICE_PER_WEEK_USD}
          />
        </div>
      </main>
    </div>
  )
}
