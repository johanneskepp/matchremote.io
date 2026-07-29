import { FROM_ADDRESS, getResend } from './client'
import { formatSalary } from '@/lib/utils/helpers'

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://matchremote.io'

export type NotifiableMatch = {
  score: number
  teaser: string
  title: string
  company: string
  location: string
  salaryMin: number | null
  salaryMax: number | null
  url: string
}

function subjectFor(matches: NotifiableMatch[]): string {
  const count = matches.length
  const noun = count === 1 ? 'new match' : 'new matches'
  const best = Math.max(...matches.map((m) => m.score))
  return `${count} ${noun} for you, top fit ${best}%`
}

function textBody(matches: NotifiableMatch[], summary: string): string {
  const lines: string[] = [
    matches.length === 1
      ? 'One job came in that fits what you told us.'
      : `${matches.length} jobs came in that fit what you told us.`,
    '',
  ]

  for (const match of matches) {
    lines.push(`${match.score}%  ${match.title}`)
    lines.push(`${match.company} · ${match.location} · ${formatSalary(match.salaryMin ?? undefined, match.salaryMax ?? undefined)}`)
    lines.push(match.teaser)
    lines.push(match.url)
    lines.push('')
  }

  lines.push(summary)
  lines.push('')
  lines.push(`See everything: ${SITE_URL}/dashboard`)
  lines.push(`Change which matches reach you: ${SITE_URL}/account`)

  return lines.join('\n')
}

function htmlBody(matches: NotifiableMatch[], summary: string): string {
  const cards = matches
    .map(
      (match) => `
        <tr><td style="padding: 0 0 18px;">
          <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #D3D6DA; border-radius: 14px;">
            <tr><td style="padding: 18px 20px;">
              <span style="display: inline-block; background: #1C9AD6; color: #ffffff; font-size: 13px; font-weight: 700; border-radius: 999px; padding: 3px 10px;">${match.score}% match</span>
              <p style="font-size: 18px; font-weight: 700; margin: 12px 0 4px; color: #1A1C20;">${match.title}</p>
              <p style="font-size: 14px; color: #5B5F68; margin: 0 0 4px;">${match.company} · ${match.location}</p>
              <p style="font-size: 15px; font-weight: 700; color: #1E3A8A; margin: 0 0 10px;">${formatSalary(match.salaryMin ?? undefined, match.salaryMax ?? undefined)}</p>
              <p style="font-size: 14px; color: #5B5F68; margin: 0 0 14px;">${match.teaser}</p>
              <a href="${match.url}" style="display: inline-block; background: #1E3A8A; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; border-radius: 10px; padding: 11px 20px;">View job</a>
            </td></tr>
          </table>
        </td></tr>`
    )
    .join('')

  return `
    <div style="font-family: -apple-system, Segoe UI, sans-serif; max-width: 560px; margin: 0 auto; padding: 28px 20px; color: #1A1C20; background: #EDEEF0;">
      <p style="font-size: 16px; margin: 0 0 22px;">
        ${matches.length === 1 ? 'One job came in that fits what you told us.' : `${matches.length} jobs came in that fit what you told us.`}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0">${cards}</table>
      <p style="font-size: 15px; font-weight: 600; margin: 8px 0 20px;">${summary}</p>
      <p style="font-size: 14px; color: #5B5F68; margin: 0 0 6px;">
        <a href="${SITE_URL}/dashboard" style="color: #1C9AD6;">See everything in your dashboard</a>
      </p>
      <p style="font-size: 13px; color: #5B5F68; margin: 0;">
        <a href="${SITE_URL}/account" style="color: #5B5F68;">Change which matches reach you</a>
      </p>
    </div>
  `
}

export async function sendMatchNotification(
  email: string,
  matches: NotifiableMatch[],
  summary: string
): Promise<{ ok: boolean; id?: string; subject: string; error?: string }> {
  const subject = subjectFor(matches)

  const resend = getResend()
  if (!resend) {
    return { ok: false, subject, error: 'RESEND_API_KEY is not configured' }
  }

  const { data, error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject,
    text: textBody(matches, summary),
    html: htmlBody(matches, summary),
  })

  if (error) return { ok: false, subject, error: error.message }
  return { ok: true, id: data?.id, subject }
}
