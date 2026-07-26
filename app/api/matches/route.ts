import { NextRequest, NextResponse } from 'next/server'
import { getUserMatches } from '@/lib/db/queries'
import { formatSalary } from '@/lib/utils/helpers'
import { getMatchExplanation } from '@/lib/utils/matching'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get('userId')

  if (!userId) {
    return NextResponse.json({ matches: [], message: 'Missing userId' }, { status: 400 })
  }

  try {
    const rows = await getUserMatches(userId, 20)

    const matches = rows
      .filter((row: any) => row.jobs)
      .map((row: any) => {
        const job = row.jobs
        return {
          id: job.id,
          title: job.title,
          company: job.company,
          location: job.location || (job.timezone ? `Remote (${job.timezone})` : 'Remote'),
          salary: formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined),
          tags: job.tags || [],
          matchScore: row.match_score,
          matchReasons: getMatchExplanation(row.match_reasons || {}, row.match_score),
          description: job.description,
          url: job.url,
        }
      })

    return NextResponse.json({ matches })
  } catch (error) {
    console.error('[matches] error', error)
    return NextResponse.json({ matches: [], message: 'Something went wrong' }, { status: 500 })
  }
}
