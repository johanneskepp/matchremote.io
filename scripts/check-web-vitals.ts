/**
 * Runs Lighthouse against a small sample of key pages on a locally started
 * production server and flags anything outside Google's "Good" Core Web
 * Vitals thresholds. Meant to run after `npm run build`, before pushing,
 * not as a separate schedule, per Johannes's request to avoid extra agent
 * usage. Intentionally non blocking: this warns rather than hard fails a
 * build, a Lighthouse regression on one page shouldn't by itself stop a
 * push, but it should be visible.
 *
 * Skips itself entirely on Vercel (process.env.VERCEL), Vercel's build
 * containers don't ship a Chrome binary and don't need this, the site's
 * real Vercel Speed Insights covers production. Also skips gracefully if
 * no local Chrome install is found, this is a local safety net, not a
 * required part of the build.
 *
 * Usage: npm run build && npx tsx --env-file=.env.local scripts/check-web-vitals.ts
 */
import { spawn, type ChildProcess } from 'child_process'

// Google's published "Good" thresholds, see web.dev/vitals.
const THRESHOLDS = {
  lcpMs: 2500,
  cls: 0.1,
  tbtMs: 200,
}

const PORT = 4173
const PAGES = ['/', '/quiz', '/remote-jobs/engineering', '/pricing']

function waitForServer(url: string, timeoutMs: number): Promise<void> {
  const start = Date.now()
  return new Promise((resolve, reject) => {
    const tick = async () => {
      try {
        const res = await fetch(url)
        if (res.ok) return resolve()
      } catch {
        // not up yet
      }
      if (Date.now() - start > timeoutMs) return reject(new Error('Server did not start in time'))
      setTimeout(tick, 500)
    }
    tick()
  })
}

async function runLighthouse(url: string, port: number) {
  const lighthouse = (await import('lighthouse')).default
  const result = await lighthouse(url, { port, output: 'json', logLevel: 'silent', onlyCategories: ['performance'] })
  if (!result) throw new Error('Lighthouse returned no result')
  const audits = result.lhr.audits
  return {
    lcpMs: audits['largest-contentful-paint']?.numericValue ?? null,
    cls: audits['cumulative-layout-shift']?.numericValue ?? null,
    tbtMs: audits['total-blocking-time']?.numericValue ?? null,
    score: result.lhr.categories.performance?.score,
  }
}

async function main() {
  if (process.env.VERCEL) {
    console.log('Skipping Core Web Vitals check on Vercel (no Chrome, not needed for a cloud build).')
    return
  }

  let chromeLauncher: typeof import('chrome-launcher')
  try {
    chromeLauncher = await import('chrome-launcher')
  } catch {
    console.warn('chrome-launcher not available, skipping Core Web Vitals check.')
    return
  }

  let server: ChildProcess | null = null
  let chrome: Awaited<ReturnType<typeof chromeLauncher.launch>> | null = null

  try {
    server = spawn(`npx next start -p ${PORT}`, {
      stdio: 'ignore',
      shell: true,
    })

    await waitForServer(`http://localhost:${PORT}`, 30000)

    chrome = await chromeLauncher.launch({ chromeFlags: ['--headless', '--no-sandbox'] })

    let anyFailed = false
    for (const page of PAGES) {
      const url = `http://localhost:${PORT}${page}`
      const { lcpMs, cls, tbtMs, score } = await runLighthouse(url, chrome.port)
      const lcpBad = lcpMs !== null && lcpMs > THRESHOLDS.lcpMs
      const clsBad = cls !== null && cls > THRESHOLDS.cls
      const tbtBad = tbtMs !== null && tbtMs > THRESHOLDS.tbtMs
      const flag = lcpBad || clsBad || tbtBad ? 'WARN' : 'ok'
      if (flag === 'WARN') anyFailed = true
      console.log(
        `[${flag}] ${page}: performance score ${Math.round((score ?? 0) * 100)}, LCP ${Math.round(lcpMs ?? 0)}ms, CLS ${(cls ?? 0).toFixed(3)}, TBT ${Math.round(tbtMs ?? 0)}ms`
      )
    }

    if (anyFailed) {
      console.warn('\nOne or more pages are outside Google\'s "Good" Core Web Vitals thresholds. Not blocking the push, but worth a look.')
    } else {
      console.log('\nAll checked pages are within Core Web Vitals "Good" thresholds.')
    }
  } catch (err) {
    console.warn('Core Web Vitals check could not run, skipping:', err instanceof Error ? err.message : err)
  } finally {
    if (chrome) await chrome.kill()
    if (server) server.kill()
  }
}

main()
