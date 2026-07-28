import { NextResponse } from 'next/server'
import { createHash, timingSafeEqual } from 'node:crypto'
import {
  consumeOtpCode,
  getLatestOtpCode,
  getOrCreateUser,
  mergeGuestIntoUser,
  recordOtpAttempt,
  updateUser,
} from '@/lib/db/queries'
import { startSession } from '@/lib/auth/session'
import { isValidEmail } from '@/lib/utils/helpers'

export const dynamic = 'force-dynamic'

const MAX_ATTEMPTS = 5

function hashesMatch(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex')
  const bufB = Buffer.from(b, 'hex')
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

export async function POST(request: Request) {
  try {
    const { email, code, guestUserId } = await request.json()

    if (typeof email !== 'string' || !isValidEmail(email) || typeof code !== 'string') {
      return NextResponse.json({ message: 'Enter your email and the six digit code.' }, { status: 400 })
    }

    const normalized = email.trim().toLowerCase()
    const record = await getLatestOtpCode(normalized)

    if (!record || record.consumed_at) {
      return NextResponse.json({ message: 'That code is no longer valid. Ask for a new one.' }, { status: 400 })
    }

    if (new Date(record.expires_at) < new Date()) {
      return NextResponse.json({ message: 'That code expired. Ask for a new one.' }, { status: 400 })
    }

    if (record.attempts >= MAX_ATTEMPTS) {
      return NextResponse.json({ message: 'Too many tries. Ask for a new code.' }, { status: 429 })
    }

    const submittedHash = createHash('sha256').update(code.trim()).digest('hex')
    if (!hashesMatch(submittedHash, record.code_hash)) {
      const attempts = record.attempts + 1
      await recordOtpAttempt(record.id, attempts)
      const left = MAX_ATTEMPTS - attempts
      return NextResponse.json(
        {
          message: left > 0 ? `Wrong code. ${left} ${left === 1 ? 'try' : 'tries'} left.` : 'Too many tries. Ask for a new code.',
          attemptsLeft: left,
        },
        { status: 400 }
      )
    }

    await consumeOtpCode(record.id)

    const user = await getOrCreateUser(normalized)
    await updateUser(user.id, { is_guest: false, last_login: new Date().toISOString() })

    if (typeof guestUserId === 'string' && guestUserId) {
      await mergeGuestIntoUser(guestUserId, user.id)
    }

    await startSession(user.id)

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('[auth] verify-code error', error)
    return NextResponse.json({ message: 'Something went wrong.' }, { status: 500 })
  }
}
