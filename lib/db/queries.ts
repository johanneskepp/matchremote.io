import { supabase, supabaseAdmin } from './supabase'

const sb = supabase as any
const sbAdmin = supabaseAdmin as any

export async function getOrCreateUser(email: string): Promise<any> {
  const { data } = await sb.from('users').select('*').eq('email', email).single()
  if (data) return data
  const { data: newUser } = await sb.from('users').insert([{ email }]).select()
  return newUser?.[0]
}

export async function getUserById(id: string): Promise<any | null> {
  const { data } = await sb.from('users').select('*').eq('id', id).single()
  return data || null
}

export async function updateUser(id: string, updates: any): Promise<any> {
  const { data } = await sb.from('users').update(updates).eq('id', id).select().single()
  return data
}

export async function saveQuizResponse(userId: string, responses: any): Promise<any> {
  const { data } = await sb.from('quiz_responses').insert({ user_id: userId, ...responses }).select().single()
  return data
}

export async function getLatestQuizResponse(userId: string): Promise<any | null> {
  const { data } = await sb.from('quiz_responses').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(1).single()
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
  const { data } = await sb.from('matches').upsert({ user_id: userId, job_id: jobId, match_score: score, match_reasons: reasons }).select().single()
  return data
}

export async function getUserMatches(userId: string, limit: number = 20): Promise<any[]> {
  const { data } = await sb.from('matches').select('*, jobs(*)').eq('user_id', userId).order('match_score', { ascending: false }).limit(limit)
  return data || []
}

export async function getMatchScore(userId: string, jobId: string): Promise<number | null> {
  const { data } = await sb.from('matches').select('match_score').eq('user_id', userId).eq('job_id', jobId).single()
  return data?.match_score || null
}

export async function saveJob(userId: string, jobId: string): Promise<void> {
  await sb.from('saved_jobs').insert({ user_id: userId, job_id: jobId })
}

export async function removeSavedJob(userId: string, jobId: string): Promise<void> {
  await sb.from('saved_jobs').delete().eq('user_id', userId).eq('job_id', jobId)
}

export async function getSavedJobs(userId: string): Promise<any[]> {
  const { data } = await sb.from('saved_jobs').select('*, jobs(*)').eq('user_id', userId).eq('archived', false)
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
