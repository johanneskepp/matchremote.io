import { FROM_ADDRESS, getResend } from './client'

export async function sendOtpEmail(email: string, code: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const resend = getResend()
  if (!resend) {
    return { ok: false, error: 'RESEND_API_KEY is not configured' }
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: `${code} is your matchremote code`,
    text: [
      `Your matchremote sign in code is ${code}`,
      '',
      'It expires in 10 minutes and can only be used once.',
      'If you did not ask for this code you can ignore this email.',
    ].join('\n'),
    html: `
      <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 440px; margin: 0 auto; padding: 32px 24px; color: #1A1C20;">
        <p style="font-size: 15px; margin: 0 0 24px;">Your matchremote sign in code:</p>
        <p style="font-size: 38px; font-weight: 700; letter-spacing: 0.16em; margin: 0 0 24px; color: #FF5A1F;">${code}</p>
        <p style="font-size: 14px; color: #5B5F68; margin: 0 0 8px;">It expires in 10 minutes and can only be used once.</p>
        <p style="font-size: 14px; color: #5B5F68; margin: 0;">If you did not ask for this code you can ignore this email.</p>
      </div>
    `,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true, id: data?.id }
}
