import { supabase, supabaseAdmin } from './supabase'
import type { User, QuizResponse, Job, Match } from './types'

// ==================== USERS ====================
export async function getOrCreateUser(email: string): Promise<User> {
  console.log('[DB] Getting or creating user:', email)
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (data) {
    console.log('[DB] User found:', email)
    return data
  }

  // Create new user
  const { data: newUser, error: createError } = await supabase
    .from('users')
    .insert({ email })
    .select()
    .single()

  if (createError) {
    console.error('[DB] Error creating user:', createError)
    throw createError
  }

  console.log('[DB] User created:', email)
  return newUser
}

export async function getUserById(id: string): Promise<User | null> {
  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single()

  return data || null
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  console.log('[DB] Updating user:', id)
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ==================== QUIZ RESPONSES ====================
export async function saveQuizResponse(userId: string, responses: Omit<QuizResponse, 'id' | 'created_at' | 'updated_at'>): Promise<QuizResponse> {
  console.log('[DB] Saving quiz response for user:', userId)
  
  const { data, error } = await supabase
    .from('quiz_responses')
    .insert({
      user_id: userId,
      ...responses,
    })
    .select()
    .single()

  if (error) {
    console.error('[DB] Error saving quiz response:', error)
    throw error
  }

  console.log('[DB] Quiz response saved')
  return data
}

export async function getLatestQuizResponse(userId: string): Promise<QuizResponse | null> {
  const { data } = await supabase
    .from('quiz_responses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return data || null
}

// ==================== JOBS ====================
export async function getAllJobs(limit: number = 100, offset: number = 0): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('[DB] Error fetching jobs:', error)
    return []
  }

  return data || []
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  return data || null
}

export async function searchJobs(filters: {
  minSalary?: number
  maxSalary?: number
  jobType?: string
  timezone?: string
  keywords?: string
}): Promise<Job[]> {
  let query = supabase
    .from('jobs')
    .select('*')
    .eq('is_active', true)

  if (filters.minSalary) {
    query = query.gte('salary_max', filters.minSalary)
  }

  if (filters.maxSalary) {
    query = query.lte('salary_min', filters.maxSalary)
  }

  if (filters.jobType) {
    query = query.eq('job_type', filters.jobType)
  }

  if (filters.timezone) {
    query = query.contains('timezone', filters.timezone)
  }

  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('[DB] Error searching jobs:', error)
    return []
  }

  return data || []
}

export async function createJob(job: Omit<Job, 'id' | 'created_at' | 'updated_at'>): Promise<Job> {
  console.log('[DB] Creating job:', job.title)
  
  const { data, error } = await supabaseAdmin
    .from('jobs')
    .insert(job)
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating job:', error)
    throw error
  }

  console.log('[DB] Job created:', job.title)
  return data
}

// ==================== MATCHES ====================
export async function createMatch(userId: string, jobId: string, score: number, reasons: Record<string, any>): Promise<Match> {
  console.log('[DB] Creating match - User:', userId, 'Job:', jobId, 'Score:', score)
  
  const { data, error } = await supabase
    .from('matches')
    .upsert({
      user_id: userId,
      job_id: jobId,
      match_score: score,
      match_reasons: reasons,
    })
    .select()
    .single()

  if (error) {
    console.error('[DB] Error creating match:', error)
    throw error
  }

  return data
}

export async function getUserMatches(userId: string, limit: number = 20): Promise<Array<Match & { jobs: Job }>> {
  const { data, error } = await supabase
    .from('matches')
    .select('*, jobs(*)')
    .eq('user_id', userId)
    .order('match_score', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('[DB] Error fetching matches:', error)
    return []
  }

  return data || []
}

export async function getMatchScore(userId: string, jobId: string): Promise<number | null> {
  const { data } = await supabase
    .from('matches')
    .select('match_score')
    .eq('user_id', userId)
    .eq('job_id', jobId)
    .single()

  return data?.match_score || null
}

// ==================== SAVED JOBS ====================
export async function saveJob(userId: string, jobId: string): Promise<void> {
  console.log('[DB] Saving job for user:', userId)
  
  const { error } = await supabase
    .from('saved_jobs')
    .insert({
      user_id: userId,
      job_id: jobId,
    })

  if (error && error.code !== '23505') { // Ignore duplicate key errors
    console.error('[DB] Error saving job:', error)
    throw error
  }
}

export async function removeSavedJob(userId: string, jobId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_jobs')
    .delete()
    .eq('user_id', userId)
    .eq('job_id', jobId)

  if (error) throw error
}

export async function getSavedJobs(userId: string): Promise<Array<{ jobs: Job }>> {
  const { data, error } = await supabase
    .from('saved_jobs')
    .select('*, jobs(*)')
    .eq('user_id', userId)
    .eq('archived', false)

  if (error) {
    console.error('[DB] Error fetching saved jobs:', error)
    return []
  }

  return data || []
}

// ==================== EMAIL ====================
export async function createEmailLog(
  userId: string,
  email: string,
  subject: string,
  emailType: string,
  resendId?: string
): Promise<void> {
  const { error } = await supabaseAdmin
    .from('email_logs')
    .insert({
      user_id: userId,
      email,
      subject,
      email_type: emailType,
      resend_id: resendId,
    })

  if (error) {
    console.error('[DB] Error creating email log:', error)
  }
}

export async function subscribeToAlerts(userId: string, email: string, frequency: 'daily' | 'weekly' = 'weekly'): Promise<void> {
  console.log('[DB] Subscribing user to alerts:', userId)
  
  const { error } = await supabase
    .from('email_alerts')
    .upsert({
      user_id: userId,
      email,
      frequency,
      active: true,
    })

  if (error) {
    console.error('[DB] Error subscribing to alerts:', error)
    throw error
  }
}

export async function getActiveAlerts(frequency?: string): Promise<Array<{ user_id: string; email: string }>> {
  let query = supabase
    .from('email_alerts')
    .select('user_id, email')
    .eq('active', true)

  if (frequency) {
    query = query.eq('frequency', frequency)
  }

  const { data, error } = await query

  if (error) {
    console.error('[DB] Error fetching active alerts:', error)
    return []
  }

  return data || []
}
