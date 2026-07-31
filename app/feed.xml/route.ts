import { getAllJobs } from '@/lib/db/queries'
import { buildJobSlug } from '@/lib/utils/job-slug'
import { formatSalary, truncateText } from '@/lib/utils/helpers'
import type { Job } from '@/lib/db/types'

// Standard RSS 2.0 feed of the newest active jobs. Remote work newsletters
// and community Slack/Discord bots commonly pull job listings from a feed
// like this, it is a low effort, low risk distribution surface compared to
// posting into communities directly.
export const revalidate = 3600

const SITE_URL = 'https://matchremote.io'
const FEED_SIZE = 50

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function jobItem(job: Job): string {
  const url = `${SITE_URL}/jobs/${buildJobSlug(job)}`
  const salary = formatSalary(job.salary_min ?? undefined, job.salary_max ?? undefined)
  const description = `${job.company} · ${salary}. ${truncateText(job.description, 300)}`

  return `    <item>
      <title>${escapeXml(job.title)} at ${escapeXml(job.company)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(job.posted_date).toUTCString()}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`
}

export async function GET() {
  const jobs: Job[] = await getAllJobs(500)
  const newest = [...jobs]
    .sort((a, b) => new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime())
    .slice(0, FEED_SIZE)

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/rss-style.xsl"?>
<rss version="2.0">
  <channel>
    <title>matchremote: new remote jobs</title>
    <link>${SITE_URL}</link>
    <description>The newest remote jobs added to matchremote, across engineering, design, product, marketing, sales, operations, and finance.</description>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${newest.map(jobItem).join('\n')}
  </channel>
</rss>`

  return new Response(body, {
    headers: {
      // Chrome downgrades application/rss+xml straight to a plain text
      // response and skips its normal XML document view entirely, which
      // silently drops the xml-stylesheet below along with it. application/xml
      // gets the real XML view (confirmed against jobs-feed.xml, which already
      // used it), and feed readers parse by the <rss> root element rather than
      // by this header, so this is still a perfectly standard RSS content type.
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
