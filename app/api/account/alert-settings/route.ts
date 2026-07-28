import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { getAlertSettings, saveAlertSettings } from '@/lib/db/queries'
import { DEFAULT_ALERT_THRESHOLD, SCORE_THRESHOLDS } from '@/lib/plan'

export const dynamic = 'force-dynamic'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 })

  const settings = await getAlertSettings(user.id)
  return NextResponse.json({
    threshold: settings?.threshold ?? DEFAULT_ALERT_THRESHOLD,
    active: settings?.active ?? true,
  })
}

export async function PATCH(request: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ message: 'Not signed in' }, { status: 401 })

  const { threshold, active } = await request.json()

  if (!SCORE_THRESHOLDS.includes(threshold)) {
    return NextResponse.json({ message: 'Pick one of the offered thresholds.' }, { status: 400 })
  }

  await saveAlertSettings(user.id, user.email, threshold, active !== false)
  return NextResponse.json({ success: true })
}
