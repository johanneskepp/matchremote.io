import { getAllActiveJobs } from '@/lib/db/queries'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { deriveApplicantCountries } from '@/lib/utils/job-country'
import { formatSalary } from '@/lib/utils/helpers'
import type { Job } from '@/lib/db/types'

// Generic job aggregator XML feed (the format Indeed's classic partner
// ingestion popularized and that Jooble/Careerjet also accept). This only
// builds the feed, it does not register it anywhere, submitting the URL to
// each aggregator's partner program is still a manual one time step.
export const revalidate = 3600

const SITE_URL = 'https://matchremote.io'

const JOB_TYPE_MAP: Record<Job['job_type'], string> = {
  'full-time': 'fulltime',
  'part-time': 'parttime',
  contract: 'contract',
  freelance: 'contract',
}

// CDATA can hold any raw text except the literal sequence "]]>", which would
// otherwise close the section early and corrupt everything after it in a
// naive job description that happens to contain it.
function cdata(value: string): string {
  return `<![CDATA[${value.replace(/]]>/g, ']] >')}]]>`
}

function jobEntry(job: Job): string {
  const url = `${SITE_URL}/jobs/${buildJobSlug(job)}`
  const countries = deriveApplicantCountries(job.location)
  const salary = formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)

  return `  <job>
    <title>${cdata(job.title)}</title>
    <date>${cdata(new Date(job.posted_date).toUTCString())}</date>
    <referencenumber>${cdata(job.id)}</referencenumber>
    <url>${cdata(url)}</url>
    <company>${cdata(job.company)}</company>
    <city>${cdata(job.location || 'Remote')}</city>
    <country>${cdata(countries?.[0] || 'Worldwide')}</country>
    <description>${cdata(job.description)}</description>
    <jobtype>${cdata(JOB_TYPE_MAP[job.job_type])}</jobtype>
    ${job.salary_min ? `<salary>${cdata(salary)}</salary>` : ''}
  </job>`
}

export async function GET() {
  const jobs: Job[] = await getAllActiveJobs()

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<source>
  <publisher>matchremote</publisher>
  <publisherurl>${SITE_URL}</publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${jobs.map(jobEntry).join('\n')}
</source>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
