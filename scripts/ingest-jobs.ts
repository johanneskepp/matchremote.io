/**
 * Fetches remote job listings from open, ToS-friendly public APIs and upserts
 * them into the `jobs` table. Deliberately skips We Work Remotely: their API
 * terms prohibit storing/scraping job data outside their own API.
 *
 * Usage: npm run ingest:jobs
 */
import { supabaseAdmin } from '../lib/db/supabase'
import type { Database } from '../lib/db/types'
import { deriveTimezoneRegion } from '../lib/utils/timezone-region'
import { inferAsyncScore } from '../lib/utils/async-score'
import { inferIndustries } from '../lib/utils/job-industries'
import { isLikelyRealJob } from '../lib/utils/job-quality'
import {
  LINK_CHECKABLE_SOURCES,
  MAX_JOB_AGE_DAYS,
  isExpiredByAge,
  isExpiredBySource,
  looksGone,
  parseSourceExpiry,
} from '../lib/utils/job-freshness'

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
  // The jobs table's salary columns are integers, some sources (seen on
  // Himalayas) supply a decimal figure.
  return Math.round(value)
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
      const location = fixMojibake(job.location || 'Worldwide')
      const title = fixMojibake(job.position!)
      const description = fixMojibake(stripHtml(job.description || ''))
      return {
        title,
        company: fixMojibake(job.company || 'Unknown'),
        description,
        salary_min: sanitizeSalary(job.salary_min),
        salary_max: sanitizeSalary(job.salary_max),
        timezone: deriveTimezoneRegion(location),
        async_score: inferAsyncScore(description),
        job_type: normalizeJobType(tags.join(' ')),
        location,
        source: 'remoteok',
        url: jobUrl,
        posted_date: job.date || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true,
        tags,
        company_size: null,
        industries: inferIndustries(title, description),
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
      const location = fixMojibake(job.candidate_required_location || 'Worldwide')
      const title = fixMojibake(job.title)
      const description = fixMojibake(stripHtml(job.description || ''))
      return {
        title,
        company: fixMojibake(job.company_name || 'Unknown'),
        description,
        salary_min: sanitizeSalary(min),
        salary_max: sanitizeSalary(max),
        timezone: deriveTimezoneRegion(location),
        async_score: inferAsyncScore(description),
        job_type: normalizeJobType(job.job_type),
        location,
        source: 'remotive',
        url: job.url,
        posted_date: job.publication_date || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true,
        tags: (job.tags || []).map((t) => t.toLowerCase()),
        company_size: null,
        industries: inferIndustries(title, description),
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
    .map((job) => {
      const location = fixMojibake(job.location || 'Worldwide')
      const title = fixMojibake(job.title)
      const description = fixMojibake(stripHtml(job.description || ''))
      return {
      title,
      company: fixMojibake(job.company_name || 'Unknown'),
      description,
      salary_min: null,
      salary_max: null,
      timezone: deriveTimezoneRegion(location),
      async_score: inferAsyncScore(description),
      job_type: normalizeJobType(job.job_types?.[0]),
      location,
      source: 'arbeitnow',
      url: job.url,
      posted_date: new Date(job.created_at * 1000).toISOString(),
      scraped_at: new Date().toISOString(),
      is_active: true,
      tags: (job.tags || []).map((t) => t.toLowerCase()),
      company_size: null,
      industries: inferIndustries(title, description),
      } satisfies JobInsert
    })
}

// --- Jobicy -----------------------------------------------------------------
// Public API, no key required. Its own response includes a "friendlyNotice"
// explicitly inviting third party use, conditioned only on crediting Jobicy
// with a link to the source and linking apply buttons to the original job
// URL, both of which the /jobs/[slug] page already does (job.source, job.url).

interface JobicyJob {
  id: number
  url: string
  jobTitle: string
  companyName: string
  jobIndustry?: string[]
  jobType?: string[]
  jobGeo?: string
  jobDescription?: string
  pubDate?: string
  salaryMin?: number | null
  salaryMax?: number | null
  salaryCurrency?: string | null
  salaryPeriod?: string | null
}

async function fetchJobicy(): Promise<JobInsert[]> {
  const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=200', {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) throw new Error(`Jobicy API failed: ${res.status}`)
  const data: { jobs: JobicyJob[] } = await res.json()

  // Only trust salary figures Jobicy tags as an annual USD amount, converting
  // other currencies or pay periods would mean guessing an exchange rate or
  // hours worked, better to leave salary unknown than fabricate a number.
  const isAnnualUsd = (job: JobicyJob) =>
    job.salaryCurrency === 'USD' && /year|annual/i.test(job.salaryPeriod || '')

  return data.jobs
    .filter((job) => job.id && job.jobTitle && job.url)
    .map((job) => {
      const location = fixMojibake(job.jobGeo || 'Worldwide')
      const title = fixMojibake(job.jobTitle)
      const description = fixMojibake(stripHtml(job.jobDescription || ''))
      return {
        title,
        company: fixMojibake(job.companyName || 'Unknown'),
        description,
        salary_min: isAnnualUsd(job) ? sanitizeSalary(job.salaryMin) : null,
        salary_max: isAnnualUsd(job) ? sanitizeSalary(job.salaryMax) : null,
        timezone: deriveTimezoneRegion(location),
        async_score: inferAsyncScore(description),
        job_type: normalizeJobType(job.jobType?.join(' ')),
        location,
        source: 'jobicy',
        url: job.url,
        posted_date: job.pubDate || new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        is_active: true,
        tags: (job.jobIndustry || []).map((t) => t.toLowerCase()),
        company_size: null,
        industries: inferIndustries(title, description),
      } satisfies JobInsert
    })
}

// --- Himalayas ----------------------------------------------------------
// Public API, no key required. Himalayas's own docs (himalayas.app/api)
// explicitly permit using it to "backfill other remote job boards", our
// exact use case, conditioned on attribution and not redistributing to
// Jooble/Neuvoo/Google Jobs/LinkedIn Jobs, which we don't do.

interface HimalayasJob {
  title: string
  companyName: string
  description?: string
  employmentType?: string
  minSalary?: number | null
  maxSalary?: number | null
  salaryPeriod?: string | null
  currency?: string | null
  locationRestrictions?: string[]
  categories?: string[]
  pubDate?: number
  expiryDate?: number
  applicationLink?: string
  guid?: string
}

async function fetchHimalayas(): Promise<JobInsert[]> {
  // The browse endpoint caps at 20 jobs per request (their limit, not ours),
  // paginate via offset. Capped at 5 pages/100 jobs here to stay in the same
  // rough order of magnitude as the other sources and avoid hammering a free
  // public API we don't have a key or rate limit agreement with.
  const rawJobs: HimalayasJob[] = []
  for (let offset = 0; offset < 100; offset += 20) {
    const res = await fetch(`https://himalayas.app/jobs/api?limit=20&offset=${offset}`, {
      headers: { 'User-Agent': USER_AGENT },
    })
    if (!res.ok) throw new Error(`Himalayas API failed: ${res.status}`)
    const page: { jobs: HimalayasJob[] } = await res.json()
    if (!page.jobs || page.jobs.length === 0) break
    rawJobs.push(...page.jobs)
  }

  const now = Date.now() / 1000
  const isAnnualUsd = (job: HimalayasJob) =>
    job.currency === 'USD' && /year|annual/i.test(job.salaryPeriod || '')

  return rawJobs
    .filter((job) => job.title && (job.applicationLink || job.guid) && (!job.expiryDate || job.expiryDate > now))
    .map((job) => {
      const url = job.applicationLink || job.guid!
      const location = fixMojibake(job.locationRestrictions?.join(', ') || 'Worldwide')
      const title = fixMojibake(job.title)
      const description = fixMojibake(stripHtml(job.description || ''))
      return {
        title,
        company: fixMojibake(job.companyName || 'Unknown'),
        description,
        salary_min: isAnnualUsd(job) ? sanitizeSalary(job.minSalary) : null,
        salary_max: isAnnualUsd(job) ? sanitizeSalary(job.maxSalary) : null,
        timezone: deriveTimezoneRegion(location),
        async_score: inferAsyncScore(description),
        job_type: normalizeJobType(job.employmentType),
        location,
        source: 'himalayas',
        url,
        posted_date: job.pubDate ? new Date(job.pubDate * 1000).toISOString() : new Date().toISOString(),
        scraped_at: new Date().toISOString(),
        // The only source that tells us when a listing stops being valid.
        // Stored so the freshness pass can retire it on their date instead of
        // our generic age rule, and so the page publishes their date to Google.
        expires_at: parseSourceExpiry(job.expiryDate),
        is_active: true,
        tags: (job.categories || []).slice(0, 12).map((t) => t.toLowerCase()),
        company_size: null,
        industries: inferIndustries(title, description),
      } satisfies JobInsert
    })
}

// --- Runner -----------------------------------------------------------------

async function main() {
  const sources: Array<{ name: string; fetcher: () => Promise<JobInsert[]> }> = [
    { name: 'RemoteOK', fetcher: fetchRemoteOk },
    { name: 'Remotive', fetcher: fetchRemotive },
    { name: 'Arbeitnow', fetcher: fetchArbeitnow },
    { name: 'Jobicy', fetcher: fetchJobicy },
    { name: 'Himalayas', fetcher: fetchHimalayas },
  ]

  let allJobs: JobInsert[] = []

  for (const { name, fetcher } of sources) {
    try {
      const jobs = await fetcher()
      const real = jobs.filter((j) => isLikelyRealJob(j.title, j.description ?? '', j.company))
      const dropped = jobs.length - real.length
      console.log(`[${name}] fetched ${jobs.length} jobs, ${dropped} filtered as non-job content, ${real.length} kept`)
      allJobs.push(...real)
    } catch (err) {
      console.error(`[${name}] failed:`, err instanceof Error ? err.message : err)
    }
  }

  // A handful of sources turned out, on manual inspection, to not be real job
  // listings at all: their "description" is scraped nav menu or glossary
  // page content, not a job posting (e.g. "World Veterans" lists brand names
  // like "Walgreens"/"Starbucks" as job titles with identical nav menu text
  // as the description). Confirmed by reading the actual content, not a
  // generic heuristic, so it's a narrow, explicit blocklist rather than
  // something that risks catching real postings.
  const KNOWN_NON_JOB_SOURCES = new Set(['world veterans', 'devtube', 'adconversion'])
  const beforeBlocklist = allJobs.length
  allJobs = allJobs.filter((job) => !KNOWN_NON_JOB_SOURCES.has(job.company.trim().toLowerCase()))
  if (allJobs.length !== beforeBlocklist) {
    console.log(`Dropped ${beforeBlocklist - allJobs.length} entries from known non-job sources (${[...KNOWN_NON_JOB_SOURCES].join(', ')}).`)
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

  await retireStaleJobs(new Set(allJobs.map((job) => job.url)))
}

/**
 * Turns off listings a visitor can no longer apply to.
 *
 * Runs after the upsert so anything the feeds just confirmed is already marked
 * fresh. See lib/utils/job-freshness.ts for why feed absence on its own is not
 * treated as proof that a job is gone.
 *
 * Deactivation is reversible: is_active goes false, the row stays, so a
 * mistake can be undone and nothing is lost.
 */
async function retireStaleJobs(seenUrls: Set<string>) {
  const { data: active, error } = await jobsTable
    .from('jobs')
    .select('id, title, url, source, posted_date, expires_at')
    .eq('is_active', true)

  if (error) {
    console.error('Freshness pass: could not read active jobs:', error.message)
    return
  }

  const rows = active ?? []

  // The source's own expiry wins over our guess wherever we have one.
  const expiredBySource = rows.filter((job: any) => isExpiredBySource(job.expires_at))
  const expiredByAge = rows.filter(
    (job: any) => !job.expires_at && isExpiredByAge(job.posted_date)
  )
  const expired = [...expiredBySource, ...expiredByAge]

  // A job the feed still lists is being asserted as live by its source, so
  // there is nothing to learn from fetching it. Everything else that can
  // answer gets checked.
  const toCheck = rows.filter(
    (job: any) =>
      !expired.includes(job) &&
      !seenUrls.has(job.url) &&
      LINK_CHECKABLE_SOURCES.has(job.source)
  )

  const gone: any[] = []
  for (const job of toCheck) {
    try {
      const res = await fetch(job.url, {
        headers: { 'User-Agent': USER_AGENT },
        redirect: 'follow',
        signal: AbortSignal.timeout(15000),
      })
      const body = res.status === 200 ? await res.text() : ''
      if (looksGone(res.status, body)) gone.push(job)
    } catch {
      // A timeout or network blip is not evidence the listing is gone, so the
      // job keeps its place and gets another chance tomorrow.
    }
    // These are free APIs run by other people, so we go one at a time.
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  const retire = [...new Set([...expired, ...gone])]

  if (retire.length === 0) {
    console.log(
      `Freshness: nothing to retire. ${rows.length} active, ${toCheck.length} link checked, ${rows.filter((j: any) => j.expires_at).length} carry a source expiry, max age ${MAX_JOB_AGE_DAYS} days for the rest.`
    )
    return
  }

  const { error: updateError } = await jobsTable
    .from('jobs')
    .update({ is_active: false })
    .in('id', retire.map((job) => job.id))

  if (updateError) {
    console.error('Freshness: could not deactivate:', updateError.message)
    return
  }

  console.log(
    `Freshness: retired ${retire.length} (${expiredBySource.length} past the source's own expiry, ${expiredByAge.length} older than ${MAX_JOB_AGE_DAYS} days, ${gone.length} confirmed gone by link check of ${toCheck.length}). ${rows.length - retire.length} still active.`
  )
}

main().catch((err) => {
  console.error('Ingestion failed:', err)
  process.exit(1)
})
