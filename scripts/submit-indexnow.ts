/**
 * Pushes the newest active job pages (plus the site's static pages, on the
 * first run) through IndexNow, the Bing/Yandex equivalent of Google's
 * Indexing API already used elsewhere in this project. IndexNow accepts up
 * to 10,000 URLs per call, this defaults to a much smaller batch since only
 * genuinely new/changed pages need pushing, not the whole catalogue every
 * run.
 *
 * Usage:
 *   npm run seo:indexnow                      submit the newest 200 job pages
 *   npm run seo:indexnow -- --dry-run          print the URLs, submit nothing
 *   npm run seo:indexnow -- --limit=50         submit fewer/more job pages
 *   npm run seo:indexnow -- --include-static   also submit the static marketing pages
 */
import { getAllJobs } from '../lib/db/queries'
import { buildJobSlug } from '../lib/utils/job-slug'
import { submitUrlsToIndexNow } from '../lib/seo/indexnow'

const SITE_URL = 'https://matchremote.io'

const dryRun = process.argv.includes('--dry-run')
const includeStatic = process.argv.includes('--include-static')
const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 200

const STATIC_PAGES = ['/', '/quiz', '/pricing', '/about', '/faq', '/remote-jobs', '/remote-jobs/all']

async function main() {
  const jobs = await getAllJobs(Number.isFinite(limit) && limit > 0 ? limit : 200)
  const jobUrls = jobs.map((job) => `${SITE_URL}/jobs/${buildJobSlug(job)}`)
  const urls = includeStatic ? [...STATIC_PAGES.map((p) => `${SITE_URL}${p}`), ...jobUrls] : jobUrls

  console.log(`${urls.length} url(s) to submit${includeStatic ? ' (including static pages)' : ''}.`)

  if (dryRun) {
    console.log('DRY RUN, nothing will actually be submitted.\n')
    urls.slice(0, 10).forEach((u) => console.log(u))
    if (urls.length > 10) console.log(`...and ${urls.length - 10} more`)
    return
  }

  const result = await submitUrlsToIndexNow(urls)
  if (!result.ok) {
    console.error(`IndexNow submission failed: ${result.error}`)
    process.exit(1)
  }
  console.log(`Done. Submitted ${urls.length} url(s), IndexNow responded ${result.status}.`)
}

main().catch((error) => {
  console.error('[seo:indexnow] fatal', error)
  process.exit(1)
})
