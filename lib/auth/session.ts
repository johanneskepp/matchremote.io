import { createHash, randomBytes } from 'node:crypto'
import { cookies } from 'next/headers'
import { createSession, deleteSession, getSessionByTokenHash } from '@/lib/db/queries'

export const SESSION_COOKIE = 'mr_session'
const SESSION_DAYS = 30

export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export async function startSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)

  await createSession(userId, hashToken(token), expiresAt)

  const store = await cookies()
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

export async function endSession(): Promise<void> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (token) await deleteSession(hashToken(token))
  store.delete(SESSION_COOKIE)
}

export async function getSessionUser(): Promise<any | null> {
  const store = await cookies()
  const token = store.get(SESSION_COOKIE)?.value
  if (!token) return null

  const session = await getSessionByTokenHash(hashToken(token))
  if (!session) return null

  if (new Date(session.expires_at) < new Date()) {
    await deleteSession(session.token_hash)
    return null
  }

  return session.users ?? null
}
