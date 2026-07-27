/**
 * Fetches remote job listings from open, ToS-friendly public APIs and upserts
 * them into the `jobs` table. Deliberately skips We Work Remotely: their API
 * terms prohibit storing/scraping job data outside their own API.
 *
 * Usage: npm run ingest:jobs
 */
import { supabaseAdmin } from '../lib/db/supabase'
import type { Database } from '../lib/db/types'

type JobInsert = Database['public']['Tables']['jobs']['Insert']
type JobType = JobInsert['job_type']

// lib/db/types.ts is hand-written and lacks the `Relationships` field the
// Supabase client generics require, which collapses `.from('jobs')` to
// `never`. lib/db/queries.ts works around the same issue with `as any`.
const jobsTable = supabaseAdmin as any

const USER_AGENT = 'matchremote.io job ingestion (contact: johanneskepp@gmail.com)'

// Some upstream sources (seen on Arbeitnow's Brazilian/Portuguese listings)
// occasionally emit UTF-8 bytes that were mis-decoded as Latin-1 upstream,
// e.g. "Soluções" arrives as "SoluÃ§Ãµes". Detect the telltale "Ã" marker and
// attempt a round-trip fix, but bail out if it produces replacement chars
// (U+FFFD), which means the text wasn't actually mojibake.
function fixMojibake(text: string): string {
  if (!text.includes('Ã') && !text.includes('Â')) return text
  const repaired = Buffer.from(text, 'latin1').toString('utf8')
  return repaired.includes('�') ? text : repaired
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000)
}

// Below this, a value isn't a real annual salary, it's noise (e.g. an hourly
// rate mislabeled as salary upstream). Prevents "$0k - $0k" style display bugs.
const MIN_PLAUSIBLE_ANNUAL_SALARY = 1000

function sanitizeSalary(value: number | null | undefined): number | null {
  if (!value || value < MIN_PLAUSIBLE_ANNUAL_SALARY) return null
  return value
}

function normalizeJobType(raw: string | undefined | null): JobType {
  const value = (raw || '').toLowerCase().replace(/[\s_]/g, '-')
  if (value.includes('contract')) return 'contract'
  if (value.includes('freelance')) return 'freelance'
  if (value.includes('part')) return 'part-time'
  return 'full-time'
}

function parseSalaryRange(text: string | undefined | null): { min: number | null; max: number | null } {
  if (!text) return { min: null, max: null }
  // Matches "30k", "100,000", "$45000" etc, including the "k" shorthand Remotive uses.
  const matches = [...text.matchAll(/(\d[\d,]*)(\.\d+)?\s*(k)?/gi)]
  const parsed = matches
    .map((m) => {
      const base = parseFloat(`${m[1].replace(/,/g, '')}${m[2] || ''}`)
      if (Number.isNaN(base) || base <= 0) return null
      return m[3] ? Math.round(base * 1000) : base
    })
    .filter((n): n is number => n !== null)

  if (parsed.length === 0) return { min: null, max: null }
  if (parsed.length === 1) return { min: parsed[0], max: parsed[0] }
  return { min: Math.min(...parsed), max: Math.max(...parsed) }
}

// --- RemoteOK ---------------------------------------------------------

interface RemoteOkJob {
  id?: string
  slug?: string
  company?: string
  position?: string
  tags?: string[]
  description?: string
  location?: string
  salary_min?: number
  salary_max?: number
  date?: string
  url?: string
  apply_url?: string
  legal?: string
}

async function fetchRemoteOk(): Promise<JobInsert[]> {
  const res = await fetch('https://remoteok.com/api', {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`RemoteOK API failed: ${res.status}`)
  const raw: RemoteOkJob[] = await res.json()

  return raw
    .filter((job) => job.id && job.position && job.url && !job.legal)
    .map((job) => {
      const jobUrl = job.apply_url || job.url!
      const tags = (job.tags || []).map((t) => t.toLowerCase())
      return {
        title: fixMojibake(job.position!),
        company: fixMojibake(job.company || 'Unknown'),
        description: fixMojibake(stripHtml(job.description || '')),
        salary_min: sanitizeSalary(job.salary_min),
        salary_max: sanitizeSalary(job.salary_max),
        timezone: null,
        async_score: null,
        job_type: normalizeJobType(tags.join(' ')),
        location: fixMojibake(job.location || 'Worldwide'),
        source: 'remoteok',
        url: jobUrl,
        posted_date: job.date || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true,
        tags,
        company_size: null,
        industries: [],
      } satisfies JobInsert
    })
}

// --- Remotive -----------------------------------------------------------

interface RemotiveJob {
  id: number
  url: string
  title: string
  company_name: string
  category?: string
  tags?: string[]
  job_type?: string
  publication_date?: string
  candidate_required_location?: string
  salary?: string
  description?: string
}

async function fetchRemotive(): Promise<JobInsert[]> {
  const res = await fetch('https://remotive.com/api/remote-jobs', {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`Remotive API failed: ${res.status}`)
  const data: { jobs: RemotiveJob[] } = await res.json()

  return data.jobs
    .filter((job) => job.url && job.title)
    .map((job) => {
      const { min, max } = parseSalaryRange(job.salary)
      return {
        title: fixMojibake(job.title),
        company: fixMojibake(job.company_name || 'Unknown'),
        description: fixMojibake(stripHtml(job.description || '')),
        salary_min: sanitizeSalary(min),
        salary_max: sanitizeSalary(max),
        timezone: null,
        async_score: null,
        job_type: normalizeJobType(job.job_type),
        location: fixMojibake(job.candidate_required_location || 'Worldwide'),
        source: 'remotive',
        url: job.url,
        posted_date: job.publication_date || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true,
        tags: (job.tags || []).map((t) => t.toLowerCase()),
        company_size: null,
        industries: job.category ? [job.category] : [],
      } satisfies JobInsert
    })
}

// --- Arbeitnow ------------------------------------------------------------

interface ArbeitnowJob {
  slug: string
  company_name: string
  title: string
  description?: string
  remote: boolean
  url: string
  tags?: string[]
  job_types?: string[]
  location?: string
  created_at: number
}

async function fetchArbeitnow(): Promise<JobInsert[]> {
  const res = await fetch('https://www.arbeitnow.com/api/job-board-api', {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`Arbeitnow API failed: ${res.status}`)
  const data: { data: ArbeitnowJob[] } = await res.json()

  return data.data
    .filter((job) => job.remote && job.url && job.title)
    .map((job) => ({
      title: fixMojibake(job.title),
      company: fixMojibake(job.company_name || 'Unknown'),
      description: fixMojibake(stripHtml(job.description || '')),
      salary_min: null,
      salary_max: null,
      timezone: null,
      async_score: null,
      job_type: normalizeJobType(job.job_types?.[0]),
      location: fixMojibake(job.location || 'Worldwide'),
      source: 'arbeitnow',
      url: job.url,
      posted_date: new Date(job.created_at * 1000).toISOString(),
      scraped_at: new Date().toISOString(),
      is_active: true,
      tags: (job.tags || []).map((t) => t.toLowerCase()),
      company_size: null,
      industries: [],
    } satisfies JobInsert))
}

// --- Runner -----------------------------------------------------------------

async function main() {
  const sources: Array<{ name: string; fetcher: () => Promise<JobInsert[]> }> = [
    { name: 'RemoteOK', fetcher: fetchRemoteOk },
    { name: 'Remotive', fetcher: fetchRemotive },
    { name: 'Arbeitnow', fetcher: fetchArbeitnow },
  ]

  const allJobs: JobInsert[] = []

  for (const { name, fetcher } of sources) {
    try {
      const jobs = await fetcher()
      console.log(`[${name}] fetched ${jobs.length} jobs`)
      allJobs.push(...jobs)
    } catch (err) {
      console.error(`[${name}] failed:`, err instanceof Error ? err.message : err)
    }
  }

  if (allJobs.length === 0) {
    console.error('No jobs fetched from any source, aborting write.')
    process.exit(1)
  }

  console.log(`Upserting ${allJobs.length} jobs into Supabase (conflict target: url)...`)

  const BATCH_SIZE = 200
  let upserted = 0

  for (let i = 0; i < allJobs.length; i += BATCH_SIZE) {
    const batch = allJobs.slice(i, i + BATCH_SIZE)
    const { error, count } = await jobsTable
      .from('jobs')
      .upsert(batch, { onConflict: 'url', count: 'exact' })

    if (error) {
      console.error(`Batch ${i / BATCH_SIZE + 1} failed:`, error.message)
      continue
    }
    upserted += count ?? batch.length
  }

  console.log(`Done. Upserted ~${upserted} jobs.`)
}

main().catch((err) => {
  console.error('Ingestion failed:', err)
  process.exit(1)
})
