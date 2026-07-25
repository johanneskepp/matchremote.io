import { NextRequest, NextResponse } from 'next/server'
import { saveQuizResponse, getAllJobs, createMatch, getOrCreateUser } from '@/lib/db/queries'
import { rankJobs } from '@/lib/utils/matching'
import type { QuizResponse } from '@/lib/db/types'

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Quiz submit endpoint called')

    const body = await request.json()
    console.log('[API] Received quiz data:', body)

    const {
      timezone,
      asyncNeed,
      meetingTolerance,
      isParent,
      isNeurodiv,
      salaryMin,
      salaryMax,
      skills,
      experienceLevel,
      companySizePref,
      workSchedule,
      industryPref,
      remoteOnly,
    } = body

    // Validate required fields
    if (!timezone || !salaryMin || !salaryMax) {
      console.log('[API] Missing required fields')
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // For MVP, we'll use a temporary user ID from session/email
    // In production, this would come from authenticated user
    const userEmail = body.email || `visitor-${Date.now()}@matchremote.local`
    console.log('[API] Getting or creating user:', userEmail)

    const user = await getOrCreateUser(userEmail)
    console.log('[API] User:', user.id)

    // Save quiz response
    const quizResponse: Omit<QuizResponse, 'id' | 'created_at' | 'updated_at'> = {
      user_id: user.id,
      timezone,
      async_need: asyncNeed,
      meeting_tolerance: meetingTolerance,
      is_parent: isParent,
      is_neurodiv: isNeurodiv,
      salary_min: salaryMin,
      salary_max: salaryMax,
      skills: skills || [],
      experience_level: experienceLevel,
      company_size_pref: companySizePref || [],
      work_schedule: workSchedule,
      industry_pref: industryPref || [],
      remote_only: remoteOnly,
    }

    console.log('[API] Saving quiz response...')
    const savedResponse = await saveQuizResponse(user.id, quizResponse)
    console.log('[API] Quiz saved:', savedResponse.id)

    // Get all jobs
    console.log('[API] Fetching all jobs...')
    const jobs = await getAllJobs(500)
    console.log('[API] Fetched', jobs.length, 'jobs')

    if (jobs.length === 0) {
      console.log('[API] No jobs available, returning empty results')
      return NextResponse.json({
        userId: user.id,
        quizId: savedResponse.id,
        matches: [],
        matchCount: 0,
      })
    }

    // Rank jobs based on user preferences
    console.log('[API] Ranking jobs...')
    const rankedJobs = rankJobs(jobs, savedResponse)
    const topMatches = rankedJobs.slice(0, 20)

    console.log('[API] Top match scores:', topMatches.map(j => `${j.title}(${j.matchScore})`).join(', '))

    // Save matches to database
    console.log('[API] Saving', topMatches.length, 'matches...')
    for (const job of topMatches) {
      try {
        await createMatch(user.id, job.id, job.matchScore, job.matchReasons)
      } catch (error) {
        console.error('[API] Error saving match:', error)
      }
    }

    console.log('[API] Quiz processed successfully')

    return NextResponse.json({
      userId: user.id,
      quizId: savedResponse.id,
      matchCount: topMatches.length,
      topMatches: topMatches.map(job => ({
        id: job.id,
        title: job.title,
        company: job.company,
        matchScore: job.matchScore,
      })),
    })
  } catch (error) {
    console.error('[API] Error processing quiz:', error)
    return NextResponse.json(
      { error: 'Failed to process quiz' },
      { status: 500 }
    )
  }
}
