import { supabase, supabaseAdmin } from './supabase'

const sb = supabase as any
const sbAdmin = supabaseAdmin as any

export async function getOrCreateUser(email: string): Promise<any> {
  const { data } = await sbAdmin.from('users').select('*').eq('email', email).single()
  if (data) return data
  const { data: newUser } = await sbAdmin.from('users').insert([{ email }]).select()
  return newUser?.[0]
}

export async function getUserById(id: string): Promise<any | null> {
  const { data } = await sbAdmin.from('users').select('*').eq('id', id).single()
  return data || null
}

export async function updateUser(id: string, updates: any): Promise<any> {
  const { data } = await sbAdmin.from('users').update(updates).eq('id', id).select().single()
  return data
}

export async function saveQuizResponse(userId: string, responses: any): Promise<any> {
  const { data } = await sbAdmin.from('quiz_responses').insert({ user_id: userId, ...responses }).select().single()
  return data
}

export async function getLatestQuizResponse(userId: string): Promise<any | null> {
  const { data } = await sbAdmin.from('quiz_responses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
  return data || null
}

export async function getAllJobs(limit: number = 100): Promise<any[]> {
  const { data } = await sb.from('jobs').select('*').eq('is_active', true).limit(limit)
  return data || []
}

export async function getJobById(id: string): Promise<any | null> {
  const { data } = await sb.from('jobs').select('*').eq('id', id).single()
  return data || null
}

export async function searchJobs(filters: any): Promise<any[]> {
  const { data } = await sb.from('jobs').select('*').eq('is_active', true)
  return data || []
}

export async function createJob(job: any): Promise<any> {
  const { data } = await sbAdmin.from('jobs').insert(job).select().single()
  return data
}

export async function createMatch(userId: string, jobId: string, score: number, reasons: any): Promise<any> {
  const { data } = await sbAdmin.from('matches').upsert({ user_id: userId, job_id: jobId, match_score: score, match_reasons: reasons }).select().single()
  return data
}

export async function getUserMatches(userId: string, limit: number = 20): Promise<any[]> {
  const { data } = await sbAdmin.from('matches').select('*, jobs(*)').eq('user_id', userId).order('match_score', { ascending: false }).limit(limit)
  return data || []
}

export async function getAllUserMatches(userId: string): Promise<any[]> {
  const { data } = await sbAdmin
    .from('matches')
    .select('*, jobs(*)')
    .eq('user_id', userId)
    .order('match_score', { ascending: false })

  // Postgres breaks equal scores in whatever order it likes, which made the
  // shown order wobble between requests and threw away the freshness tiebreak
  // rankJobs applies when the matches are first created. Re-apply it here, on
  // the joined job, so what the user sees is stable and the fresher posting
  // wins a tie.
  return (data || []).sort((a: any, b: any) => {
    if (b.match_score !== a.match_score) return b.match_score - a.match_score
    const aDate = a.jobs?.posted_date ? new Date(a.jobs.posted_date).getTime() : 0
    const bDate = b.jobs?.posted_date ? new Date(b.jobs.posted_date).getTime() : 0
    if (bDate !== aDate) return bDate - aDate
    return (b.jobs?.salary_min ? 1 : 0) - (a.jobs?.salary_min ? 1 : 0)
  })
}

// Every score the user has ever been matched on, which is what the dashboard
// summary and the closing line of each notification email are counted from.
// Deliberately the full history, not just what is currently unseen.
export async function getUserMatchScores(userId: string): Promise<number[]> {
  const { data } = await sbAdmin.from('matches').select('match_score').eq('user_id', userId)
  return (data || []).map((row: any) => row.match_score as number)
}

// Matches that qualify for a notification email: never emailed, never already
// shown to the user, and at or above the threshold they chose. Ordered best
// first so a capped email leads with the strongest fits.
export async function getUnnotifiedMatches(userId: string, threshold: number): Promise<any[]> {
  const { data } = await sbAdmin
    .from('matches')
    .select('*, jobs(*)')
    .eq('user_id', userId)
    .gte('match_score', threshold)
    .is('notified_at', null)
    .is('seen_at', null)
    .order('match_score', { ascending: false })
  return data || []
}

export async function markMatchesNotified(matchIds: string[]): Promise<void> {
  if (matchIds.length === 0) return
  await sbAdmin
    .from('matches')
    .update({ notified_at: new Date().toISOString() })
    .in('id', matchIds)
    .is('notified_at', null)
}

export async function markMatchesSeen(matchIds: string[]): Promise<void> {
  if (matchIds.length === 0) return
  await sbAdmin
    .from('matches')
    .update({ seen_at: new Date().toISOString() })
    .in('id', matchIds)
    .is('seen_at', null)
}

export async function getMatchScore(userId: string, jobId: string): Promise<number | null> {
  const { data } = await sbAdmin.from('matches').select('match_score').eq('user_id', userId).eq('job_id', jobId).single()
  return data?.match_score || null
}

export async function saveJob(userId: string, jobId: string): Promise<void> {
  await sbAdmin.from('saved_jobs').insert({ user_id: userId, job_id: jobId })
}

export async function removeSavedJob(userId: string, jobId: string): Promise<void> {
  await sbAdmin.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
}

export async function getSavedJobs(userId: string): Promise<any[]> {
  const { data } = await sbAdmin.from('saved_jobs').select('*, jobs(*)').eq('user_id', userId).eq('archived', false)
  return data || []
}

export async function createEmailLog(userId: string, email: string, subject: string, emailType: string, resendId?: string): Promise<void> {
  await sbAdmin.from('email_logs').insert({ user_id: userId, email, subject, email_type: emailType, resend_id: resendId })
}

export async function subscribeToAlerts(userId: string, email: string, frequency: string = 'weekly'): Promise<void> {
  await sb.from('email_alerts').upsert({ user_id: userId, email, frequency, active: true })
}

export async function getActiveAlerts(frequency?: string): Promise<any[]> {
  let query = sb.from('email_alerts').select('user_id, email').eq('active', true)
  if (frequency) query = query.eq('frequency', frequency)
  const { data } = await query
  return data || []
}

export async function getSubscription(userId: string): Promise<any | null> {
  const { data } = await sbAdmin.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
  return data || null
}

export async function upsertSubscription(userId: string, fields: any): Promise<void> {
  await sbAdmin
    .from('subscriptions')
    .upsert({ user_id: userId, ...fields, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
}

export async function getSubscriptionByPaddleId(paddleSubscriptionId: string): Promise<any | null> {
  const { data } = await sbAdmin
    .from('subscriptions')
    .select('*')
    .eq('paddle_subscription_id', paddleSubscriptionId)
    .maybeSingle()
  return data || null
}

// Everyone who might still have access. 'canceled' is included on purpose:
// they keep what they paid for until current_period_end, so the caller decides
// with isActive() rather than this query guessing from status alone.
export async function getPayingUsers(): Promise<any[]> {
  const { data } = await sbAdmin
    .from('subscriptions')
    .select('*, users(*)')
    .in('status', ['active', 'trialing', 'canceled'])
  return data || []
}

export async function getAlertSettings(userId: string): Promise<any | null> {
  const { data } = await sbAdmin.from('email_alerts').select('*').eq('user_id', userId).maybeSingle()
  return data || null
}

export async function saveAlertSettings(userId: string, email: string, threshold: number, active: boolean): Promise<void> {
  await sbAdmin
    .from('email_alerts')
    .upsert({ user_id: userId, email, threshold, active, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
}

export async function getUserByEmail(email: string): Promise<any | null> {
  const { data } = await sbAdmin.from('users').select('*').eq('email', email).maybeSingle()
  return data || null
}

export async function getLatestOtpCode(email: string): Promise<any | null> {
  const { data } = await sbAdmin
    .from('otp_codes')
    .select('*')
    .eq('email', email)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data || null
}

export async function createOtpCode(email: string, codeHash: string, expiresAt: Date): Promise<any> {
  const { data } = await sbAdmin
    .from('otp_codes')
    .insert({ email, code_hash: codeHash, expires_at: expiresAt.toISOString() })
    .select()
    .single()
  return data
}

export async function recordOtpAttempt(id: string, attempts: number): Promise<void> {
  await sbAdmin.from('otp_codes').update({ attempts }).eq('id', id)
}

export async function consumeOtpCode(id: string): Promise<void> {
  await sbAdmin.from('otp_codes').update({ consumed_at: new Date().toISOString() }).eq('id', id)
}

export async function createSession(userId: string, tokenHash: string, expiresAt: Date): Promise<any> {
  const { data } = await sbAdmin
    .from('sessions')
    .insert({ user_id: userId, token_hash: tokenHash, expires_at: expiresAt.toISOString() })
    .select()
    .single()
  return data
}

export async function getSessionByTokenHash(tokenHash: string): Promise<any | null> {
  const { data } = await sbAdmin
    .from('sessions')
    .select('*, users(*)')
    .eq('token_hash', tokenHash)
    .maybeSingle()
  return data || null
}

export async function deleteSession(tokenHash: string): Promise<void> {
  await sbAdmin.from('sessions').delete().eq('token_hash', tokenHash)
}

// Moves everything an anonymous quiz taker produced onto the account they just
// verified, so signing in never loses the matches they already saw.
export async function mergeGuestIntoUser(guestId: string, userId: string): Promise<void> {
  if (guestId === userId) return

  const guest = await getUserById(guestId)
  if (!guest || !guest.is_guest) return

  await sbAdmin.from('quiz_responses').update({ user_id: userId }).eq('user_id', guestId)

  // matches has a UNIQUE(user_id, job_id), so a job the real account already
  // matched would collide. Drop those duplicates before reassigning the rest.
  const { data: existing } = await sbAdmin.from('matches').select('job_id').eq('user_id', userId)
  const alreadyMatched: string[] = (existing || []).map((row: any) => row.job_id)
  if (alreadyMatched.length > 0) {
    await sbAdmin.from('matches').delete().eq('user_id', guestId).in('job_id', alreadyMatched)
  }
  await sbAdmin.from('matches').update({ user_id: userId }).eq('user_id', guestId)

  await sbAdmin.from('users').delete().eq('id', guestId)
}
