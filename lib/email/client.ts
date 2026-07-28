import { Resend } from 'resend'

export const FROM_ADDRESS = 'matchremote <hello@matchremote.io>'

// Returns null when RESEND_API_KEY is not configured, so a missing key is a
// clearly reported failure rather than a crash at module load.
export function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY
  if (!key) return null
  return new Resend(key)
}
