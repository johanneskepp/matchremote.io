import { NextRequest, NextResponse } from 'next/server'
import { getAllUserMatches, getLatestQuizResponse, markMatchesSeen } from '@/lib/db/queries'
import { getSessionUser } from '@/lib/auth/session'
import { formatSalary } from '@/lib/utils/helpers'
import { diversifyTop, getMatchExplanation, getMatchTeaser } from '@/lib/utils/matching'
import { FREE_MATCH_LIMIT } from '@/lib/plan'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const paramUserId = request.nextUrl.searchParams.get('userId')

  try {
    const sessionUser = await getSessionUser()
    const userId = sessionUser?.id ?? paramUserId

    if (!userId) {
      return NextResponse.json({ matches: [], message: 'Missing userId' }, { status: 400 })
    }

    // Locked matches are stripped server side rather than blurred in CSS, so
    // opening dev tools or calling this endpoint directly does not reveal them.
    const unlocked = sessionUser?.plan === 'premium'
    const scored = (await getAllUserMatches(userId)).filter((row: any) => row.jobs)

    // The two shown for free are the only ones a visitor ever sees, so they
    // should not be two openings at the same company or two rows showing the
    // identical percentage. Nothing is rescored, a job only moves ahead of one
    // scoring the same or less.
    const rows = diversifyTop(
      scored,
      FREE_MATCH_LIMIT,
      (row: any) => ({ score: row.match_score, company: row.jobs?.company })
    )

    // Lets the explanations name the actual country, pay and industry instead
    // of the same generic sentences on every card.
    const quiz = await getLatestQuizResponse(userId)

    const matches = rows.map((row: any, index: number) => {
      const job = row.jobs
      const teaser = getMatchTeaser(row.match_reasons || {})
      const visible = unlocked || index < FREE_MATCH_LIMIT

      if (!visible) {
        return {
          id: row.id,
          locked: true,
          matchScore: row.match_score,
          teaser,
        }
      }

      return {
        id: job.id,
        locked: false,
        title: job.title,
        company: job.company,
        location: job.location || (job.timezone ? `Remote (${job.timezone})` : 'Remote'),
        salary: formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined),
        tags: job.tags || [],
        matchScore: row.match_score,
        teaser,
        matchReasons: getMatchExplanation(row.match_reasons || {}, row.match_score, {
          job,
          user: { timezone: quiz?.timezone, industry_pref: quiz?.industry_pref },
        }),
        description: job.description,
        url: job.url,
      }
    })

    // Anything shown in full counts as seen, which keeps it out of future
    // notification emails.
    await markMatchesSeen(
      rows.filter((_: any, i: number) => unlocked || i < FREE_MATCH_LIMIT).map((row: any) => row.id)
    )

    return NextResponse.json({ matches, unlocked, freeLimit: FREE_MATCH_LIMIT })
  } catch (error) {
    console.error('[matches] error', error)
    return NextResponse.json({ matches: [], message: 'Something went wrong' }, { status: 500 })
  }
}
