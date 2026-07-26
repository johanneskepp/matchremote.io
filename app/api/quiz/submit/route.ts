import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateUser, updateUser, saveQuizResponse, getAllJobs, createMatch } from '@/lib/db/queries'
import { mapQuizAnswersToResponse } from '@/lib/utils/quizMapping'
import { rankJobs } from '@/lib/utils/matching'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const answers = body?.answers

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ success: false, message: 'Missing answers' }, { status: 400 })
    }

    const email = `guest-${crypto.randomUUID()}@guest.matchremote.io`
    const user = await getOrCreateUser(email)

    if (!user?.id) {
      return NextResponse.json({ success: false, message: 'Could not create user' }, { status: 500 })
    }

    await updateUser(user.id, { preferences: answers })

    const quizResponse = mapQuizAnswersToResponse(answers)
    await saveQuizResponse(user.id, quizResponse)

    const jobs = await getAllJobs(200)
    if (jobs.length > 0) {
      const ranked = rankJobs(jobs, quizResponse as any)
      await Promise.all(
        ranked.slice(0, 20).map((job) => createMatch(user.id, job.id, job.matchScore, job.matchReasons))
      )
    }

    return NextResponse.json({ success: true, userId: user.id })
  } catch (error) {
    console.error('[quiz/submit] error', error)
    return NextResponse.json({ success: false, message: 'Something went wrong' }, { status: 500 })
  }
}
