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
import {
  companyNameFromSlug,
  isLikelyRealJob,
  isPlaceholderCompany,
  KNOWN_NON_JOB_COMPANIES,
} from '../lib/utils/job-quality'
import { decodeHtmlEntities, htmlToPlainText } from '../lib/utils/html-entities'
import { repairMojibake } from '../lib/utils/mojibake'
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

/**
 * How hard we are willing to lean on each source during the link check pass.
 *
 * `workers` requests run at a time, each pausing `delayMs` between its own
 * requests, and at most `budget` listings are checked per run.
 *
 * Measured against the live sources on 2026-08-11:
 *
 * - RemoteOK answered 60 of 60 at four at a time with no complaint, and the
 *   others are small enough that the question never arises, so they take the
 *   default.
 * - Jobicy refuses with 429 after roughly a dozen requests at 2.5 a second, and
 *   we had been reading that as "checked" for as long as the pass has existed.
 *   At one request every two seconds it answered 30 of 30 with no throttling at
 *   all, and 11 of those were a 410, real dead listings we had never managed to
 *   see. So the fix is to go slower there rather than to give up: its whole
 *   queue no longer fits in one run, so `dailySlice` spreads it across days.
 *
 * Arbeitnow joined that list on 2026-08-15. It had taken the default happily
 * while it was small, then started refusing partway through the pass once its
 * queue reached 138, and the circuit breaker gave up with 76 unchecked. It is
 * a short window limit rather than a daily quota: immediately after being
 * refused 15 times in a row it answered 8 of 8 at one request every two
 * seconds, then 19 of 20 at one a second (the twentieth was a network blip,
 * not a 429). One a second is ten times slower than the default that failed
 * and clears its whole queue in a little over two minutes, so that is what it
 * gets. The 20 request sample is smaller than the budget it justifies, so
 * treat the number as measured rather than proven, the per source line in the
 * freshness summary is what will say whether it holds.
 */
type SourcePacing = { workers: number; delayMs: number; budget: number }

const DEFAULT_PACING: SourcePacing = { workers: 4, delayMs: 400, budget: Infinity }

const PACING_BY_SOURCE: Record<string, SourcePacing> = {
  jobicy: { workers: 1, delayMs: 2000, budget: 150 },
  arbeitnow: { workers: 1, delayMs: 1000, budget: 150 },
}

/**
 * The slice of a source's queue to check on this particular day.
 *
 * A source we cannot check in full in one run still gets fully checked, just
 * over several days instead of every day: each run takes the next window and
 * wraps around at the end. The day number drives it rather than a stored
 * cursor, so this needs no new column and no migration, and rerunning the same
 * day rechecks the same listings, which is what an idempotent ingestion should
 * do.
 */
function dailySlice<T>(queue: T[], budget: number, now: Date = new Date()): T[] {
  if (queue.length <= budget) return queue

  const dayNumber = Math.floor(now.getTime() / 86400000)
  const start = (dayNumber * budget) % queue.length
  const slice = queue.slice(start, start + budget)

  // Wrap past the end so the last window of a cycle is still a full one.
  if (slice.length < budget) slice.push(...queue.slice(0, budget - slice.length))

  return slice
}

// Title, company and location are plain text fields, but the sources hand them
// to us HTML escaped anyway: RemoteOK sends "MARINE PAINTER &amp; BLASTER",
// Jobicy sends "Johnson &#038; Johnson", Himalayas sends "&#x28;Contractor&#x29;".
// Left as they arrive, that text renders literally in the h1 and the title tag,
// goes to Google as the JobPosting title and hiringOrganization, and turns into
// the words "amp" and "038" in the URL slug, since slugify drops "&" and ";"
// but keeps the entity body. The same fields also arrive mis-decoded, so a
// Chinese city name lands as a run of Latin-1 letters, which repairMojibake
// puts back. Descriptions get both treatments inside stripHtml, after the tags
// come out.
function cleanText(text: string): string {
  return repairMojibake(decodeHtmlEntities(text))
}

// htmlToPlainText is shared with scripts/repair-html-entities.ts and
// scripts/repair-mojibake.ts, which re-clean the rows that landed before the
// sources' double escaping and mis-decoding were handled. It decodes entities
// and repairs mojibake itself, so neither needs doing again out here.
function stripHtml(html: string): string {
  return htmlToPlainText(html).slice(0, 5000)
}

// Job descriptions from these sources routinely run several thousand
// characters, most of it boilerplate (company history, generic benefits
// lists). Johannes asked for future listings to be much shorter and easier
// to scan, existing rows are left as they are. Cuts at the nearest sentence
// or paragraph break rather than mid word, and always leaves the "Apply on
// [source]" link as the way to read the full original posting.
const DESCRIPTION_MAX_LENGTH = 600

function truncateDescription(text: string, maxLength: number = DESCRIPTION_MAX_LENGTH): string {
  if (text.length <= maxLength) return text

  const slice = text.slice(0, maxLength)
  const lastParagraphBreak = slice.lastIndexOf('\n')
  const lastSentenceEnd = Math.max(slice.lastIndexOf('. '), slice.lastIndexOf('.\n'))
  const lastWordBreak = slice.lastIndexOf(' ')

  const cutAt =
    lastSentenceEnd > maxLength * 0.4
      ? lastSentenceEnd + 1
      : lastParagraphBreak > maxLength * 0.4
        ? lastParagraphBreak
        : lastWordBreak

  return slice.slice(0, cutAt > 0 ? cutAt : maxLength).trim() + '…'
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
      const location = cleanText(job.location || 'Worldwide')
      const title = cleanText(job.position!)
      const description = truncateDescription(stripHtml(job.description || ''))
      return {
        title,
        company: cleanText(job.company || 'Unknown'),
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
      const location = cleanText(job.candidate_required_location || 'Worldwide')
      const title = cleanText(job.title)
      const description = truncateDescription(stripHtml(job.description || ''))
      return {
        title,
        company: cleanText(job.company_name || 'Unknown'),
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
      const location = cleanText(job.location || 'Worldwide')
      const title = cleanText(job.title)
      const description = truncateDescription(stripHtml(job.description || ''))
      return {
      title,
      company: cleanText(job.company_name || 'Unknown'),
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
      const location = cleanText(job.jobGeo || 'Worldwide')
      const title = cleanText(job.jobTitle)
      const description = truncateDescription(stripHtml(job.jobDescription || ''))
      return {
        title,
        company: cleanText(job.companyName || 'Unknown'),
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
  companySlug?: string
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

// Himalayas' API intermittently returns the literal string "name" as
// companyName while companySlug on the very same record stays correct.
// Measured live on 2026-08-14: 60 of the 100 jobs in one window were affected,
// and about 20 rows a day had been landing in the catalogue that way since
// 2026-07-28. Recover the employer from the slug rather than trusting the
// broken field, since every one of those pages otherwise renders "at name" and
// publishes it as the JobPosting hiringOrganization.
function himalayasCompany(job: HimalayasJob): string {
  const given = cleanText(job.companyName || '').trim()
  if (given && !isPlaceholderCompany(given)) return given

  const slug = (job.companySlug || '').trim()
  if (slug) return companyNameFromSlug(slug)

  return 'Unknown'
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
      const location = cleanText(job.locationRestrictions?.join(', ') || 'Worldwide')
      const title = cleanText(job.title)
      const description = truncateDescription(stripHtml(job.description || ''))
      return {
        title,
        company: himalayasCompany(job),
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

  // Narrow, explicit blocklist of companies confirmed by reading their actual
  // content to be scraped page furniture rather than an employer with real
  // vacancies. Defined in lib/utils/job-quality.ts so this script and
  // scripts/cleanup-non-job-listings.ts can never fall out of sync.
  const beforeBlocklist = allJobs.length
  allJobs = allJobs.filter((job) => !KNOWN_NON_JOB_COMPANIES.has(job.company.trim().toLowerCase()))
  if (allJobs.length !== beforeBlocklist) {
    console.log(`Dropped ${beforeBlocklist - allJobs.length} entries from known non-job sources (${[...KNOWN_NON_JOB_COMPANIES].join(', ')}).`)
  }

  if (allJobs.length === 0) {
    console.error('No jobs fetched from any source, aborting write.')
    process.exit(1)
  }

  // The same listing sometimes reaches us twice with an identical apply URL
  // (e.g. syndicated through more than one source, or an overlapping page from
  // Himalayas's pagination). A single upsert statement errors ("ON CONFLICT DO
  // UPDATE command cannot affect row a second time") if its conflict target
  // repeats within one call, which previously failed the entire batch that
  // duplicate landed in. Dedupe by url first, keeping the last occurrence.
  const beforeDedupe = allJobs.length
  allJobs = [...new Map(allJobs.map((job) => [job.url, job])).values()]
  if (allJobs.length !== beforeDedupe) {
    console.log(`Deduped ${beforeDedupe - allJobs.length} jobs sharing a url with another entry.`)
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
  // Supabase's PostgREST caps any single request at 1000 rows server side
  // regardless of whether `.limit()` is called, it silently truncates rather
  // than erroring. The active count passed 1000 on 2026-08-02 (1371 at the
  // time this was found), which meant everything past the first page was
  // never even considered for retirement. Page through until nothing more
  // comes back.
  const rows: any[] = []
  let from = 0
  const pageSize = 1000

  while (true) {
    const { data, error } = await jobsTable
      .from('jobs')
      .select('id, title, url, source, posted_date, expires_at')
      .eq('is_active', true)
      .range(from, from + pageSize - 1)

    if (error) {
      console.error('Freshness pass: could not read active jobs:', error.message)
      return
    }
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < pageSize) break
    from += pageSize
  }

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

  // These are free APIs run by other people, so the rate against any single one
  // of them stays low. That used to mean one request at a time globally, which
  // was fine at a few hundred active jobs and stopped being fine at 2670: on
  // 2026-08-11 this pass alone took roughly 18 minutes, and it grows every day
  // the catalogue does. Checks are now grouped by source, because separate
  // servers cost each other nothing by being asked at the same time, and each
  // source is paced to what it has actually been measured to tolerate.
  //
  // A source that answers nothing but 429 has stopped telling us anything, so
  // we stop asking rather than spend the rest of the run being refused. The
  // pacing above is set so this should not trigger, it is here so a source
  // tightening its limit costs us one wasted minute rather than a whole run.
  const GIVE_UP_AFTER_THROTTLES = 15

  const queuesBySource = new Map<string, any[]>()
  for (const job of toCheck) {
    const queue = queuesBySource.get(job.source)
    if (queue) queue.push(job)
    else queuesBySource.set(job.source, [job])
  }

  const gone: any[] = []
  // Kept per source rather than as three running totals: pacing is set per
  // source, so "38 refused" across the whole pass says nothing about which
  // source to slow down, which is the only decision these numbers inform.
  type SourceCheckStats = { checked: number; throttled: number; deferred: number }
  const statsBySource = new Map<string, SourceCheckStats>()
  const checkStartedAt = Date.now()

  await Promise.all(
    [...queuesBySource.entries()].map(async ([source, queue]) => {
      const stats: SourceCheckStats = { checked: 0, throttled: 0, deferred: 0 }
      statsBySource.set(source, stats)

      // Supabase returns rows in no guaranteed order, and the rotation below is
      // only fair if the queue looks the same from one day to the next.
      queue.sort((a: any, b: any) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

      const pacing = PACING_BY_SOURCE[source] ?? DEFAULT_PACING
      const slice = dailySlice(queue, pacing.budget)
      stats.deferred += queue.length - slice.length

      let next = 0
      let consecutiveThrottles = 0
      const takeNext = () =>
        consecutiveThrottles >= GIVE_UP_AFTER_THROTTLES || next >= slice.length
          ? null
          : slice[next++]

      const worker = async () => {
        for (let job = takeNext(); job; job = takeNext()) {
          try {
            const res = await fetch(job.url, {
              headers: { 'User-Agent': USER_AGENT },
              redirect: 'follow',
              signal: AbortSignal.timeout(15000),
            })
            if (res.status === 429) {
              // Being refused is not evidence about the listing either way, so
              // it stays put and comes around again on a later day.
              consecutiveThrottles++
              stats.throttled++
            } else {
              consecutiveThrottles = 0
              stats.checked++
              const body = res.status === 200 ? await res.text() : ''
              if (looksGone(res.status, body)) gone.push(job)
            }
          } catch {
            // A timeout or network blip is not evidence the listing is gone, so
            // the job keeps its place and gets another chance tomorrow.
          }
          await new Promise((resolve) => setTimeout(resolve, pacing.delayMs))
        }
      }

      await Promise.all(
        Array.from({ length: Math.min(pacing.workers, slice.length) }, worker)
      )

      // Whatever giving up left untouched is waiting its turn just like the
      // jobs that never made it into today's slice, so it is counted the same
      // way. Without this the summary silently loses track of them.
      stats.deferred += slice.length - next
    })
  )

  const checkSeconds = Math.round((Date.now() - checkStartedAt) / 1000)

  const sum = (pick: (stats: SourceCheckStats) => number) =>
    [...statsBySource.values()].reduce((total, stats) => total + pick(stats), 0)

  const checkedCount = sum((s) => s.checked)
  const throttledCount = sum((s) => s.throttled)
  const deferredCount = sum((s) => s.deferred)

  // A source that answered everything needs no explaining, so only the ones
  // that refused or ran out of budget are broken out. That is the whole point
  // of the split: it names where pacing needs changing.
  const strained = [...statsBySource.entries()]
    .filter(([, s]) => s.throttled > 0 || s.deferred > 0)
    .map(
      ([source, s]) =>
        `${source} ${s.checked} checked, ${s.throttled} refused, ${s.deferred} held`
    )

  // Reported separately on purpose: a listing that was refused or held back is
  // not one we learned anything about, and counting it as checked would make
  // the freshness pass look like it covers more than it does.
  const checkSummary =
    `${checkedCount} of ${toCheck.length} link checked in ${checkSeconds}s` +
    (throttledCount > 0 ? `, ${throttledCount} refused as rate limited` : '') +
    (deferredCount > 0 ? `, ${deferredCount} held for a later day` : '') +
    (strained.length > 0 ? ` (${strained.join('; ')})` : '')

  const retire = [...new Set([...expired, ...gone])]

  if (retire.length === 0) {
    console.log(
      `Freshness: nothing to retire. ${rows.length} active, ${checkSummary}, ${rows.filter((j: any) => j.expires_at).length} carry a source expiry, max age ${MAX_JOB_AGE_DAYS} days for the rest.`
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
    `Freshness: retired ${retire.length} (${expiredBySource.length} past the source's own expiry, ${expiredByAge.length} older than ${MAX_JOB_AGE_DAYS} days, ${gone.length} confirmed gone by link check). ${rows.length - retire.length} still active. ${checkSummary}.`
  )
}

main().catch((err) => {
  console.error('Ingestion failed:', err)
  process.exit(1)
})
