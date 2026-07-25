import { NextRequest, NextResponse } from 'next/server'
import { getUserMatches } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    console.log('[API] Matches endpoint called')

    // In production, get userId from authenticated session
    // For MVP, we'll use a temp ID from storage or query param
    const userId = request.nextUrl.searchParams.get('userId') || 'temp-user'

    console.log('[API] Fetching matches for user:', userId)

    const matches = await getUserMatches(userId, 20)
    console.log('[API] Got', matches.length, 'matches')

    // Transform data for frontend
    const formattedMatches = matches.map(match => ({
      id: match.jobs?.id || match.job_id,
      title: match.jobs?.title || 'Unknown',
      company: match.jobs?.company || 'Unknown',
      description: match.jobs?.description || '',
      salary_min: match.jobs?.salary_min,
      salary_max: match.jobs?.salary_max,
      location: match.jobs?.location,
      timezone: match.jobs?.timezone,
      job_type: match.jobs?.job_type || 'full-time',
      posted_date: match.jobs?.posted_date || new Date().toISOString(),
      url: match.jobs?.url || '#',
      matchScore: match.match_score,
      matchReasons: match.match_reasons,
    }))

    return NextResponse.json({
      userId,
      matches: formattedMatches,
      total: formattedMatches.length,
    })
  } catch (error) {
    console.error('[API] Error fetching matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    )
  }
}
