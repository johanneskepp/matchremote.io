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

// One production build asked for the whole catalogue 82 separate times across
// its render workers, 48 of them from a single process, each one paging 5557
// rows of select('*'). That self inflicted congestion is what made individual
// page responses come back truncated. Callers within one process now share a
// single read for a short window instead of racing each other for the same
// rows. The window is far shorter than the hourly revalidate on every page
// that consumes this, so no page can serve staler data than it already would.
const ACTIVE_JOBS_CACHE_MS = 60_000
let activeJobsCache: { at: number; promise: Promise<any[]> } | null = null

// For callers that need literally every active job (matching, sitemap,
// category/combo pages), not just a curated "newest N". Passing a number
// here instead of calling this is how the site previously grew silent gaps
// every time the active job count passed whatever number someone guessed,
// most recently at 300, 500, 1000 and 2000 rows. This has no such ceiling.
export async function getAllActiveJobs(): Promise<any[]> {
  const now = Date.now()
  if (activeJobsCache && now - activeJobsCache.at < ACTIVE_JOBS_CACHE_MS) {
    return activeJobsCache.promise
  }

  const promise = getAllJobs(Number.MAX_SAFE_INTEGER)
  activeJobsCache = { at: now, promise }
  // A failed read must never be the answer every later caller gets for the
  // rest of the window, so the entry is dropped again the moment it rejects.
  promise.catch(() => {
    if (activeJobsCache?.promise === promise) activeJobsCache = null
  })
  return promise
}

const PAGE_ATTEMPTS = 3
// Below this a slice is small enough that its response size is no longer a
// plausible cause, so splitting further would just multiply requests.
const MIN_PAGE_SPAN = 100

function pageRetryDelayMs(attempt: number): number {
  // Backing off matters more than retrying. The failures are congestion from
  // our own parallel render workers, so immediate retries land in the same
  // congested moment and fail together, which is what an earlier attempt at
  // this fix did before it was reverted on 2026-08-28.
  return 400 * 2 ** attempt
}

/**
 * One slice of active jobs, or a thrown error. Never a short read presented
 * as a complete one.
 *
 * The observed failure is a response body that arrives truncated, which the
 * Supabase client surfaces as an error whose message is the partial body. So
 * when a slice keeps failing, the response being asked for is the thing that
 * is too big, and asking again for exactly the same slice is the one retry
 * least likely to work. Halving it and fetching the halves attacks the actual
 * cause, and it converges: by the floor a slice is a fraction of the original
 * payload.
 */
async function fetchActiveJobPage(from: number, to: number): Promise<any[]> {
  let lastError: any = null

  for (let attempt = 0; attempt < PAGE_ATTEMPTS; attempt++) {
    const { data, error } = await sb
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('posted_date', { ascending: false })
      // posted_date is a date, so ties are common and Postgres is free to
      // order them differently per request. Without a unique tiebreak the
      // .range() boundaries below are not stable, so one row can land in two
      // slices while another lands in none, and the same instability then
      // shifts which job sits on which paginated listing page. id is the
      // primary key, so this makes the ordering a deterministic total order.
      .order('id', { ascending: true })
      .range(from, to)

    if (!error) return data ?? []
    lastError = error
    if (attempt < PAGE_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, pageRetryDelayMs(attempt)))
    }
  }

  const span = to - from + 1
  if (span > MIN_PAGE_SPAN) {
    const mid = from + Math.floor(span / 2)
    const firstHalf = await fetchActiveJobPage(from, mid - 1)
    // A short first half means the table ran out inside it, so there is no
    // second half left to ask for.
    if (firstHalf.length < mid - from) return firstHalf
    const secondHalf = await fetchActiveJobPage(mid, to)
    return [...firstHalf, ...secondHalf]
  }

  // Throwing is the whole point. Reading a failed page as "no more rows" is
  // what let a build ship a sitemap missing thousands of job pages with
  // nothing logged, and every caller treats this result as the complete
  // catalogue. A loud failure is recoverable, a quietly truncated one is not.
  throw new Error(
    `getAllJobs: rows ${from} to ${to} failed after ${PAGE_ATTEMPTS} attempts at ` +
      `the smallest slice, refusing to return a truncated catalogue: ` +
      String(lastError?.message).slice(0, 200)
  )
}

export async function getAllJobs(limit: number = 100): Promise<any[]> {
  // Supabase's PostgREST caps any single request at 1000 rows server side
  // (the project's Max Rows setting) regardless of what .limit() asks for,
  // it silently truncates rather than erroring. Page through in 1000 row
  // chunks so a limit above that actually returns that many rows.
  const pageSize = 1000
  const rows: any[] = []
  let from = 0

  while (rows.length < limit) {
    const to = Math.min(from + pageSize, limit) - 1
    const data = await fetchActiveJobPage(from, to)

    if (data.length === 0) break
    rows.push(...data)
    if (data.length < to - from + 1) break
    from += pageSize
  }

  return rows
}

// The homepage ticker shows 6 salaried listings, one per company. It used to
// reach that through getAllJobs, which selects every column, so rendering 6
// lines pulled 385 KB of rows and 39% of that was job descriptions the ticker
// never reads. Naming the five columns it does read brings the same 300 row
// window down to 42 KB. The window stays at 300 because the ticker dedupes by
// company and needs a pool to dedupe from, not because it needs the rows.
export async function getRecentSalariedJobs(limit: number = 300): Promise<any[]> {
  const { data } = await sb
    .from('jobs')
    .select('title, company, salary_min, salary_max, posted_date')
    .eq('is_active', true)
    .not('salary_min', 'is', null)
    .order('posted_date', { ascending: false })
    .order('id', { ascending: true })
    .range(0, limit - 1)
  return data || []
}

export async function getJobById(id: string): Promise<any | null> {
  const { data } = await sb.from('jobs').select('*').eq('id', id).single()
  return data || null
}

// Sources fan one posting out into one row per eligible country, so a job page
// needs its own duplicate group to work out which copy carries the canonical.
// Matching the title exactly is what keeps this a superset of the group the
// sitemap computes, see lib/utils/job-duplicates.ts for why that matters.
export async function getActiveJobsByTitle(title: string): Promise<any[]> {
  const { data } = await sb.from('jobs').select('*').eq('is_active', true).eq('title', title)
  return data || []
}

export async function searchJobs(filters: any): Promise<any[]> {
  const { data } = await sb.from('jobs').select('*').eq('is_active', true)
  return data || []
}

export async function createJob(job: any): Promise<any> {
  const { data } = await sbAdmin.from('jobs').insert(job).select().single()
  return data
}

// Active jobs never announced on the Bluesky distribution bot, newest first
// so a capped run always leads with the freshest postings.
export async function getJobsToPostToBluesky(limit: number = 5): Promise<any[]> {
  const { data } = await sbAdmin
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .is('posted_to_bluesky_at', null)
    .order('posted_date', { ascending: false })
    .limit(limit)
  return data || []
}

export async function markJobsPostedToBluesky(jobIds: string[]): Promise<void> {
  if (jobIds.length === 0) return
  await sbAdmin
    .from('jobs')
    .update({ posted_to_bluesky_at: new Date().toISOString() })
    .in('id', jobIds)
    .is('posted_to_bluesky_at', null)
}

// Active jobs never announced on the Mastodon distribution bot, newest first
// so a capped run always leads with the freshest postings.
export async function getJobsToPostToMastodon(limit: number = 5): Promise<any[]> {
  const { data } = await sbAdmin
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .is('posted_to_mastodon_at', null)
    .order('posted_date', { ascending: false })
    .limit(limit)
  return data || []
}

export async function markJobsPostedToMastodon(jobIds: string[]): Promise<void> {
  if (jobIds.length === 0) return
  await sbAdmin
    .from('jobs')
    .update({ posted_to_mastodon_at: new Date().toISOString() })
    .in('id', jobIds)
    .is('posted_to_mastodon_at', null)
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

export async function deleteUser(userId: string): Promise<void> {
  // otp_codes is keyed by email, not user_id (a code can exist before an
  // account does), so it has no foreign key and cannot cascade, delete it
  // explicitly or a deleted user's email and past sign-in codes linger
  // forever, contradicting the privacy policy's deletion promise.
  const { data: user } = await sbAdmin.from('users').select('email').eq('id', userId).maybeSingle()
  if (user?.email) {
    await sbAdmin.from('otp_codes').delete().eq('email', user.email)
  }

  // Cascades to quiz_responses, matches, saved_jobs, email_logs, email_alerts,
  // subscriptions, and sessions, every one of those FKs is ON DELETE CASCADE.
  await sbAdmin.from('users').delete().eq('id', userId)
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

export async function getSubscriptionByStripeId(stripeSubscriptionId: string): Promise<any | null> {
  const { data } = await sbAdmin
    .from('subscriptions')
    .select('*')
    .eq('stripe_subscription_id', stripeSubscriptionId)
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
