import { NextResponse } from 'next/server'
import { createHash, randomInt } from 'node:crypto'
import { createOtpCode, getLatestOtpCode } from '@/lib/db/queries'
import { sendOtpEmail } from '@/lib/email/otp'
import { isValidEmail } from '@/lib/utils/helpers'

export const dynamic = 'force-dynamic'

const RESEND_COOLDOWN_MS = 60 * 1000
const CODE_TTL_MS = 10 * 60 * 1000

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ message: 'Enter a valid email address.' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()

    const latest = await getLatestOtpCode(normalized)
    if (latest) {
      const age = Date.now() - new Date(latest.created_at).getTime()
      if (age < RESEND_COOLDOWN_MS) {
        const retryIn = Math.ceil((RESEND_COOLDOWN_MS - age) / 1000)
        return NextResponse.json(
          { message: `Wait ${retryIn} seconds before asking for a new code.`, retryIn },
          { status: 429 }
        )
      }
    }

    const code = String(randomInt(0, 1_000_000)).padStart(6, '0')
    const codeHash = createHash('sha256').update(code).digest('hex')
    await createOtpCode(normalized, codeHash, new Date(Date.now() + CODE_TTL_MS))

    const sent = await sendOtpEmail(normalized, code)
    if (!sent.ok) {
      console.error('[auth] failed to send code', sent.error)
      return NextResponse.json({ message: 'Could not send the code. Try again in a moment.' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[auth] request-code error', error)
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 })
  }
}
