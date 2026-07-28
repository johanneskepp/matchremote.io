# matchremote.io

AI-powered remote job matching platform. Users take a 15 question quiz and get personalized job matches.

## Founder & Vision

**Founder:** Johannes Kepp, 36
**Email:** johanneskepp@gmail.com
**GitHub:** johanneskepp

**Vision:** Build a service that generates revenue within 6 months. Heavy focus on SEO from day one. Organic growth is a primary channel, not an afterthought.

**Payment provider:** Paddle (planned)
**Domain:** matchremote.io (purchased and connected via Vercel, DNS hosted at one.com)

## Writing Style Rules

**Never use em dashes (—) or en dashes (–). Avoid regular hyphens (-) wherever possible.**

Use commas, periods, colons, or parentheses instead. If two ideas need connecting, use a comma or start a new sentence. This applies to all copy, code comments, commit messages, and communication.

Bad: "Great UX, big buttons, fast loading."
Good: "Great UX with big buttons and fast loading."

Bad: "matchremote is a job board — for remote workers."
Good: "matchremote is a job board for remote workers."

## Live URLs
* Production: https://matchremote.io (primary, apex domain, connected 2026-07-26)
* Also resolves: https://www.matchremote.io (308 redirects to apex)
* Vercel fallback: https://matchremote-io.vercel.app
* GitHub: https://github.com/johanneskepp/matchremote.io
* Local path: C:\Users\johan\Desktop\matchremote-new

## Tech Stack
* Framework: Next.js 16 (App Router, Turbopack)
* Styling: Custom CSS with design tokens. No Tailwind utility classes in components. Use CSS vars from globals.css.
* Database: Supabase (PostgreSQL). Configured in Vercel env vars.
* Hosting: Vercel. Auto deploys on push to main.
* Language: TypeScript
* Payments: Paddle (planned, not yet integrated)

## SEO Priority

SEO is a top priority from day one. Every design and structure decision should consider:
* Fast page loads (Core Web Vitals)
* Semantic HTML
* Meta tags on every page (title, description, OG)
* Structured data (JobPosting schema when jobs are real)
* Clean URLs, sitemap.xml, robots.txt
* Content first. Job listings and guides should rank.
* No client side rendering for content that should be indexed

Consider building programmatic SEO pages later, for example "Remote [role] jobs in [timezone]", once real job data exists.

## Design System

**Vibe (updated 2026-07-28):** Cool, confident, tool like. Keeps the Duolingo bones (big clickable areas, generous radius, 3D button depth) but the palette is now a cool steel grey base with a single warm copper orange accent. Not playful pastel, not dark fintech, a calm neutral canvas where the one saturated color is always the next action.

### CRITICAL LAYOUT PRINCIPLE. No long vertical scrolling pages.

* Every page should feel like a focused single screen experience where possible
* Content should fit within viewport or require minimal scroll
* Prioritize horizontal layouts, side by side arrangements, and compact but LARGE elements
* Elements should be as big as possible without forcing content off screen
* Strong, simple flow through each page. One clear next action always visible.
* Landing page: hero plus immediate CTA visible without scroll on desktop
* Never build endless marketing pages with 10 sections stacked vertically

### Colors (defined in `app/globals.css` as CSS variables)

* `--bg` `#EDEEF0` cool steel grey page background, not white, not black
* `--surface` `#FFFFFF` cards, headers, footers, raised surfaces
* `--surface-alt` `#DDE0E4` secondary surface, chips, hover states, avatars
* `--ink` `#1A1C20` text
* `--ink-soft` `#5B5F68` muted text
* `--border` `#D3D6DA`
* `--accent` `#FF5A1F` warm copper orange, primary brand and every CTA
* `--accent-dark` `#E14A15` button 3D shadow and hover
* `--teal` `#0F9E96` secondary accent, links, match percent ring, progress fill
* `--success` `#16A34A` confirmations and checkmarks only

The old palette (`--indigo`, `--yellow`, `--bg-warm`, and the landing page's
separate hardcoded dark theme) is fully removed as of 2026-07-28. There is one
palette now, shared by every page.

### Typography

* Display, headings: Bricolage Grotesque (variable font, class `font-display` or h1, h2, h3)
* Body: Inter

Both are loaded via `next/font/google` in `app/layout.tsx` and exposed as
`--font-display` and `--font-body`. Never add a Google Fonts `@import` to
globals.css, and never hardcode a font family name in a component, always
reference the CSS variable.

### Key CSS classes (in globals.css)

* `.btn-big` main CTA button. 64px min height, copper orange, 3D shadow depth.
* `.btn-big.btn-teal` secondary teal variant
* `.btn-big.btn-ghost` white outline variant
* `.option-card` quiz answer card. 80px min height, big emoji plus text.
* `.option-card.selected` selected state
* `.card` generic content card
* `.chip` small pill tag
* `.progress-bar` and `.progress-fill` quiz progress
* `.container` (720px) and `.container-wide` (1100px)

### Design rules

* Big clickable areas. Min 64px height for buttons, 80px for option cards.
* One saturated color per screen. Copper orange is reserved for the primary
  action. Teal is the only other saturated color, used for links, the match
  percent ring, and progress. Everything else is grey.
* 3D shadow effect on buttons (`box-shadow: 0 4px 0 [darker color]`). Presses down on click.
* Never use generic Tailwind utility classes like `bg-blue-500`. Always use the CSS vars.
* Never hardcode `white` or a hex value in a component. Use `var(--surface)`
  and friends so a future palette change stays a one file change.

## Landing Page Spec (rebuilt 2026-07-28)

Audience is someone arriving from LinkedIn or Indeed. They already know what
remote work is. Show the product, do not explain it.

The whole page fits one desktop screen (verified at 1280x800, zero scroll) and
puts the search box plus both example cards above the fold on a 375x812 phone
too. Structure, top to bottom, and nothing else:

1. Thin scrolling ticker of real recently added jobs (`getRecentTickerJobs`).
2. Small right aligned nav (Pricing, Log in).
3. Wordmark plus a tagline of at most seven words.
4. `app/HeroSearch.tsx`: the interactive search box (role free text with a
   datalist of suggestions, salary dropdown) and two example match cards.
5. Footer.

There is deliberately no numbered "how it works" section, no "why matchremote"
section, and no FAQ on this page. The FAQ lives at `/faq` and is linked from
the footer, it carries the FAQPage JSON-LD.

### The hero demo

`HeroSearch` runs a looping CSS plus light JavaScript demo, no video and no new
dependency: the role field types itself out character by character, pauses,
the two cards fade and slide up, the match percentages count from 0 to their
final value, then after a few seconds it rotates to the next of four role
examples. Touching either field stops the demo permanently and hands the
inputs to the visitor. Under `prefers-reduced-motion: reduce` it renders one
static example immediately with no typing, no counting, and no rotation.

The example cards use invented company names and are labelled "Example" on
screen. They are not real listings and must never be presented as such.

### Search box to quiz prefill

The CTA navigates to `/quiz?role=<value>&salary=<value>`. Free text is mapped
onto the quiz's fixed role values by `matchRoleValue` in `lib/quiz-options.ts`
("senior react developer" resolves to engineering). `ROLE_OPTIONS` and
`SALARY_OPTIONS` live in that same file and are imported by both the hero and
`app/quiz/page.tsx`, so the two can never drift apart. The quiz reads the
params via `useSearchParams` (hence the `Suspense` wrapper) and prefills those
two questions. An unrecognised value is ignored silently, the question just
opens unanswered.

## Quiz UX Specification

The quiz is a core experience and needs special design treatment.

### Layout

* Current question is maximized and takes center stage
* Previous and upcoming questions are shown but shadowed and dimmed and smaller (peeking on sides or above and below)
* Shadowed questions show a summary of the user's chosen answers so they can review their progress
* User can toggle back or forward to any question at any time (not just linear)
* All questions allow multiple selections (multi select is the default, even for questions that seem single choice). Give the user freedom.

### Interaction

* Clicking a shadowed question brings it to center
* Big clickable option cards (80px plus height)
* Instant visual feedback on selection
* Progress indicator shows completion, not current position

### Feel

* Like a card deck or carousel that the user navigates
* Never feels like being trapped on one question. Always see context.

### Entry from the landing page

Arriving from the hero search box, the quiz opens with the role and salary
questions already answered, read from `?role=` and `?salary=` via
`useSearchParams` (hence the `Suspense` wrapper). A value that does not map
onto a known option is ignored silently and that question simply opens
unanswered, never an error. No login is required to take the quiz or to see
the two free matches at the end.

## Project Structure

```
app/
  page.tsx           Landing page, see Landing Page Spec above
  HeroSearch.tsx     Client component: hero search box plus animated demo
  faq/page.tsx       FAQ, carries the FAQPage JSON-LD
  quiz/page.tsx      15 question quiz, reads role/salary prefill from the URL
  results/page.tsx   Match results, two open then locked, see paywall below
  pricing/page.tsx   Pricing, one plan only
  dashboard/page.tsx        Signed in match list, server component, builds the view models
  dashboard/DashboardMatches.tsx  Client component: score filter, in memory, no refetch
  account/page.tsx          Subscription state, cancel, alert threshold
  account/AccountControls.tsx
  auth/login/page.tsx       Two step email then six digit code
  api/
    matches/route.ts        Returns a user's matches, locked ones stripped server side
    quiz/submit/route.ts    Creates guest user, saves response, ranks jobs
    auth/request-code/route.ts   Generates, hashes and emails the code
    auth/verify-code/route.ts    Verifies, merges guest account, starts session
    auth/logout/route.ts
    auth/me/route.ts
    account/alert-settings/route.ts   Reads and saves the email threshold
    account/cancel/route.ts           Cancels the Paddle subscription
    webhooks/paddle/route.ts          Mirrors Paddle state into subscriptions
  layout.tsx         Root layout. Fonts (next/font), metadata, Organization JSON-LD.
  globals.css        Design system
components/
  MatchCard.tsx      Shared match card, used by both /results and /dashboard
lib/
  quiz-options.ts    Shared role and salary options, used by hero and quiz
  plan.ts            FREE_MATCH_LIMIT, price, score thresholds, default alert threshold
  auth/session.ts    Session cookie, hashing, lookup
  billing/paddle.ts        Paddle API client
  billing/subscription.ts  isActive plus getAccessState, the single access check
  email/client.ts          Resend init, returns null when the key is missing
  email/otp.ts             Sign in code email
  email/match-notification.ts  Daily new match email
  db/
    queries.ts       Supabase CRUD. All typed as `any` for build compatibility.
    schema.sql       Original schema. 7 tables, RLS policies.
    migrations/      001_auth, 002_match_notifications, 003_subscriptions
    supabase.ts      Client init
    types.ts         TypeScript types
  utils/
    helpers.ts       formatSalary, formatDate, etc plus constants
    matching.ts      Scoring algorithm. 7 factors, 0 to 100. Also teaser and timezone badge.
    salary-insight.ts  Median based salary badge, silent when data is too thin
    match-stats.ts     Match count summary, shared by dashboard and email
    job-quality.ts   Filters non-job listings (isLikelyRealJob) out of ingestion
    job-country.ts   Derives an honest applicantLocationRequirements country from free text location, or null
    combo-pages.ts   Which "[role] jobs in [region]" pages currently have enough real data to exist
  seo/
    search-console.ts   Google Search Console plus Indexing API client (service account auth)
scripts/
  ingest-jobs.ts             Job ingestion (see status below)
  cleanup-non-job-listings.ts   One time (rerunnable) soft-deactivation of bad listings via isLikelyRealJob
  seo-report.ts               Pulls GSC search analytics plus sitemap status, run with npm run seo:report
  analyze-combo-pages.ts      Combo page coverage report, run with npm run seo:combo-pages
  check-web-vitals.ts         Lighthouse check against a local prod server, run with npm run check:vitals
secrets/
  <service-account>.json   Google service account key, gitignored, never committed
```

## Environment Variables (in Vercel)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (local only, points at the gitignored file in `secrets/`)
* `GOOGLE_SEARCH_CONSOLE_SITE` (`sc-domain:matchremote.io`)

Declared in `.env.example` and required by shipped code, but **not set anywhere yet**
as of 2026-07-28, which is what blocks sign in and the notification email from
working in production:

* `RESEND_API_KEY` (sign in codes and the daily match email both fail cleanly without it)
* `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET` (checkout and cancel)

## Current Status

Keep this section current after every session. This is the single source of truth for what is done versus not done, check it before starting new work.

### BLOCKED, needs Johannes, do this first

Two manual steps stand between the code on main and a working paid product.
Everything below in "Working" that mentions auth, subscriptions or the daily
email is **written, built and pushed but inert** until these are done. Nothing
crashes meanwhile: every query swallows its error, so a missing table just
means "logged out" and "no subscribers", which fails closed, not open.

1. **Run the three migrations in the Supabase SQL editor**, in order:
   `lib/db/migrations/001_auth.sql`, `002_match_notifications.sql`,
   `003_subscriptions.sql`. Each one is guarded (`IF NOT EXISTS`) and safe to
   re-run. Verified 2026-07-28 that none of them have been applied yet: no
   `otp_codes`, `sessions` or `subscriptions` table exists, and `matches` has
   neither `notified_at` nor `seen_at`. This cannot be done from code, the
   service role key talks to PostgREST, which does not execute DDL.
2. **Set `RESEND_API_KEY`** in `.env.local` and in Vercel. Confirmed live in
   this session: requesting a sign in code returns a clean "Could not send the
   code" to the user and logs `RESEND_API_KEY is not configured` server side.

Paddle keys are a third blocker, but only for checkout and cancel, and
Johannes asked to be consulted before those get wired for real.

### Working

* **Paid product built end to end (2026-07-28): passwordless auth, a real paywall, one weekly plan, a dashboard, and the daily new match email.** This replaced the old magic link scaffolding, the $9/mo three tier pricing, and the frontend only soft paywall, all three of which are gone. Details:
  * **Auth, six digit code, no password ever.** `POST /api/auth/request-code` generates a six digit code, stores only a sha256 hash with a ten minute expiry, and rate limits to one code per email per sixty seconds. `verify-code` allows five wrong attempts before the code must be requested again, then starts a session: 32 random bytes, hashed before storage, in an `httpOnly` `SameSite=Lax` cookie called `mr_session`, thirty day expiry. Signing in merges the anonymous guest account (`guest-<uuid>@guest.matchremote.io`) into the real one via `mergeGuestIntoUser`, which reassigns quiz responses and matches and drops duplicates first, since `matches` has a `UNIQUE(user_id, job_id)`. No login is needed to take the quiz or see the two free matches, only to unlock more or set an email filter.
  * **The paywall is server side, not CSS.** `/api/matches` and `/dashboard` both strip company, title, salary and apply link from locked matches before the payload leaves the server, so opening dev tools or calling the endpoint directly reveals nothing. `FREE_MATCH_LIMIT` is 2. Each locked card still shows its real score plus a teaser built from the same scored dimensions (`getMatchTeaser`), so the lock is concrete rather than a blank tease.
  * **One plan, six dollars a week, recurring automatically.** No upgrade tier exists. `lib/billing/subscription.ts` holds the single access check, `isActive`, which deliberately still grants access to a `canceled` subscription until `current_period_end`, because they paid for that time. Cancelling is a visible button on `/account`, no support contact.
  * **Dashboard** (`/dashboard`, session gated, redirects to `/auth/login?next=/dashboard`): all matches, filter by score (all, 60, 75, 90) done in memory in `DashboardMatches.tsx` so switching never refetches, plus a summary line from `lib/utils/match-stats.ts`.
  * **Daily match email** (`npm run notify:matches`, `--dry-run` supported): for each user with access, sends the matches that clear their own threshold (default 60) and have never been emailed or already seen. Capped at ten per email, the rest lead the next send. `notified_at` is set only after a successful send, so a failure requeues rather than silently burning the matches. The closing summary line comes from the same `matchSummaryLine` the dashboard uses, so the two can never quote different numbers. **The scheduled task for this is deliberately NOT set up yet**, it sends real email to real people and Johannes should approve the cadence first.
  * **"Never the same job twice" is enforced by two columns, not by hoping.** `matches.seen_at` is set the moment a match is shown in full on `/results` or `/dashboard`, `matches.notified_at` the moment it is emailed. The notification query requires both to be null. So a match shown free is never emailed, and an emailed match never comes back around.
  * **Honest badges (del 9).** `getTimezoneBadge` returns null unless both the job and the user have a known region, and never claims a number of overlapping hours, because the data is three coarse buckets (`americas`/`europe`/`asia`) and around half of jobs have none. `lib/utils/salary-insight.ts` compares a job against the **median** of the user's other matches in the same role category, not the mean: caught during verification that a single 200k listing made four ordinary jobs read "20 percent below average", which is arithmetically true and useless. Needs at least three comparable peers with real salary and a gap of at least five percent, otherwise no badge at all. The badge says "typical", not "average", because a median is what it actually computes.
  * `components/MatchCard.tsx` is the one match card, shared by `/results` and `/dashboard`, extracted so the two pages cannot drift.
  * Verified this session: build clean, unit checks on the timezone badge, salary insight and summary line all pass, `/dashboard` correctly 307s to login when signed out, and the sign in form fails with a clean user facing message rather than a crash while `RESEND_API_KEY` is missing. **Not yet verified end to end with a real signed in user, because that needs the migrations above.**
* Custom domain matchremote.io purchased and connected (Vercel + one.com DNS). Apex domain is primary, www redirects to it.
* Landing page redesigned: compact single or two column layout, no long stacked sections. Scrolling recent jobs ticker (mock data) under the header. Hand drawn underline accent on the hero headline, wavy section divider. Color palette toned down deliberately, restrained to indigo plus neutrals, most emoji driven decoration removed after founder feedback that it looked "AI generic" and unprofessional. Numbered circle icons for "How it works", checkmark circles for "Why matchremote", both with proper semantic h2 headings.
* Quiz fully redesigned per the Quiz UX Specification: shadowed prev and next question cards peeking beside the maximized current question (clickable to jump), a dot navigation strip to jump to any of the 15 questions directly, progress bar shows percent answered not position, every question is multi select regardless of whether it looks single choice.
* Pricing page (3 tiers).
* SEO foundations built: app/robots.ts, app/sitemap.ts, root layout metadata (title template, OG, Twitter cards, JSON-LD Organization plus WebSite), per page metadata (home, pricing) and per route layout.tsx metadata for client component pages (quiz, results, auth/login), dynamic OG image generator, noindex on results and auth/login, semantic main and h2 landmarks added to the homepage, FAQ section on the homepage with FAQPage schema for longtail keyword coverage.
* Google Search Console fully set up (2026-07-26): domain property verified via DNS TXT record at one.com, sitemap.xml submitted and processed (3 pages discovered), manual indexing requested for the homepage and /quiz.
* Real Supabase backend wired end to end (2026-07-26): schema.sql executed (all 7 tables), RLS enabled on every table including a public "read active jobs" policy on jobs so the anon key can list jobs while writes stay locked to the service role. Found and fixed a real bug: Vercel's production env vars for Supabase were still placeholder example values (`https://aBcDe.supabase.co`), meaning the live site never actually talked to a database before this session. Now corrected and verified live. lib/utils/quizMapping.ts converts the quiz UI's free form multi select answers into the strict quiz_responses columns the matching engine expects. app/api/quiz/submit creates an anonymous guest user (email like guest-<uuid>@guest.matchremote.io, no real auth yet), saves the mapped quiz response, and runs lib/utils/matching.ts against the jobs table. app/api/matches returns a user's top matches joined with job data. app/quiz and app/results call these real endpoints instead of using localStorage/mock data. Verified working against both local dev and production (matchremote.io) by submitting a real quiz answer and confirming it landed correctly in Supabase, then deleting the test row.
* Results page now shows an honest "No matches yet, we're still building our job database" empty state instead of the old 6 hardcoded mock jobs, since the jobs table is intentionally empty (see below).
* Deployed on Vercel, auto deploy on push to main.

* **Job ingestion sources expanded, and fully automated, daily (2026-07-28).** Added two more sources to `scripts/ingest-jobs.ts` after checking each one's actual terms live (not assumed): **Jobicy** (`jobicy.com/api/v2/remote-jobs`, no key, their own API response includes an explicit "friendlyNotice" inviting third party use provided Jobicy is credited and apply buttons link to the original job, which the site already does) and **Himalayas** (`himalayas.app/jobs/api`, no key, their published API docs explicitly permit using it to "backfill other remote job boards", exactly this use case, provided we don't redistribute their listings to Jooble/Neuvoo/Google Jobs/LinkedIn Jobs, which we don't). Himalayas paginates 20 jobs per request (their hard limit, not configurable), capped at 100/day here to stay in the same order of magnitude as the other sources and avoid hammering a free API with no rate limit agreement. **Working Nomads was investigated and deliberately excluded**: its `exposed_jobs` endpoint is public but undocumented, no equivalent explicit permission was found, same reasoning as the existing We Work Remotely exclusion, revisit if they publish clear terms. Real bug caught during testing: Himalayas sometimes returns salary as a decimal (e.g. `188089.2`), which broke the upsert since the `jobs` table's salary columns are integers, `sanitizeSalary` in `scripts/ingest-jobs.ts` now rounds. **394 active jobs live** as of this session (127 RemoteOK, 100 Jobicy, 99 Himalayas, 37 Remotive, 31 Arbeitnow). A new daily scheduled task, `daily-job-ingestion` (6am local, Claude Code's own local scheduler, not in this repo), runs `npm run ingest:jobs` automatically every morning, before the SEO agents run later so they analyze fresh data. This task deliberately does not touch git, ingestion writes straight to Supabase and the site picks it up within an hour via existing ISR revalidation, no deploy needed, it only commits code if it finds and fixes an actual bug in the ingestion script itself.

### Reminder: revisit Google Search Console when new pages exist

Search Console is set up for the current 3 static pages only (/, /quiz, /pricing). Whenever new indexable pages are added, most importantly the programmatic "[role] jobs in [timezone]" pages and any real job detail pages once real job data exists, come back and: confirm they appear in app/sitemap.ts, wait for Search Console to pick up the updated sitemap (or resubmit it), and manually request indexing for at least the first batch so they get crawled quickly instead of waiting for the next natural crawl.

### Not yet built

* ~~Real job data~~ Done (2026-07-27), see ingestion entry below. The landing page ticker (`app/page.tsx`) now pulls its 6 "recent jobs" from the real `jobs` table too (most recent salaried listing per company), falling back to the old mock list only if fewer than 3 salaried rows exist.
* Job ingestion script written and run successfully (2026-07-27): `scripts/ingest-jobs.ts`, run with `npm run ingest:jobs`. `.env.local` set up via `vercel env pull` (project linked as `johannes-kepp-s-projects/matchremote-io`) plus the Supabase keys pasted in manually. Originally 3 sources (RemoteOK, Remotive, Arbeitnow), **now 5, see the 2026-07-28 entry below for the current source list, job counts, and the now-automated daily schedule.** RemoteOK's spammy low quality entries noted here as a future concern were confirmed as a real problem and fixed on 2026-07-28, see the SEO status entries above.
* **Timezone fixed (2026-07-27), was previously a dead feature.** None of the three sources give a clean timezone, so `jobs.timezone` was null on every row and the homepage's "Timezone-aware / No 3am meetings" claim was aspirational, not real. Fixed by deriving the same 3 broad regions the quiz already collects (americas/europe/asia, see the "timezone" question in `app/quiz/page.tsx`) from each job's free-text location via keyword matching in `lib/utils/timezone-region.ts`, wired into `scripts/ingest-jobs.ts`. Also found and fixed a second, deeper bug while doing this: `lib/utils/matching.ts`'s `isCompatibleTimezone` compared against offset abbreviations like `CET`/`PST`, which the quiz never actually produces (it only ever stores `americas`/`europe`/`asia`), so timezone scoring was silently broken end to end regardless of job data quality. Rewrote it as a simple region-adjacency check (americas↔europe and europe↔asia get partial credit, americas↔asia doesn't). After re-running `npm run ingest:jobs`, 75 of 156 active jobs now have a real region (48 americas, 20 europe, 9 asia); the remaining 81 are "Worldwide"/unclassifiable and correctly left null (neutral partial credit, not a wrong guess).
* JobPosting structured data and programmatic category pages built (2026-07-27):
  * `app/jobs/[slug]/page.tsx`: per-job detail page with full JobPosting JSON-LD (title, description, datePosted, employmentType, hiringOrganization, baseSalary when known, jobLocationType TELECOMMUTE). Slugs are `slugify(title-company)-<job id>`, parsed back via `lib/utils/job-slug.ts`. `applicantLocationRequirements` (a specific Country) is deliberately omitted, none of the three sources give clean structured location data, see the timezone gap noted above. ISR via `revalidate = 3600` plus `dynamicParams = true` so newly ingested jobs render on demand without a full rebuild.
  * `app/remote-jobs/page.tsx` and `app/remote-jobs/[category]/page.tsx`: category index and 6 role pages (engineering, design, product, marketing, sales, operations), mirroring the quiz's own role options in `app/quiz/page.tsx`. Categorization is `lib/utils/job-categories.ts`, matches on **job title only**, deliberately not `tags`/`industries`. RemoteOK's `tags` field turned out to be unreliable per-job metadata (a "Graduate Analyst" post came tagged "vfx", "illustrator", "architecture"), matching against it produced false positives like "Clinical Pharmacist" showing up under Engineering. Caught and fixed during verification.
  * `app/sitemap.ts` now includes the 6 category pages plus one entry per active job (155 as of this session).
  * True "[role] jobs in [timezone]" combo pages are not built. With `timezone` null on every ingested job (see gap above), those pages would either be empty or force a fake distinction, worse for SEO than the role-only pages. Revisit once a source gives structured location/timezone data.
  * Two more bugs caught during verification, both fixed in `scripts/ingest-jobs.ts`: (1) some listings had tiny non-zero salary values (looked like a mislabeled hourly rate) that rendered as "$0k - $0k", now floored via `sanitizeSalary` (anything under $1,000/year is treated as unknown); (2) some Arbeitnow listings (seen on Brazilian/Portuguese postings, e.g. "TOTVS") arrived as classic UTF-8-decoded-as-Latin-1 mojibake ("SoluÃ§Ãµes" instead of "Soluções"), now repaired by `fixMojibake` with a safety check that bails out if the repair would introduce U+FFFD replacement characters.
* Manual follow-up needed from Johannes: resubmit the sitemap in Google Search Console and request indexing for a few of the new `/remote-jobs/*` and `/jobs/*` URLs. This has to happen from the GSC dashboard, no API access is configured for it in this session.
* **Matching engine overhauled to remove structural score caps (2026-07-27).** Found via user question: 46 of 158 jobs were missing salary, timezone, AND industries simultaneously, and every single job had `async_score = null` (no source provides one), which meant literally no job could ever score 100%, the ceiling was a hard 90 max, and jobs missing multiple fields capped around 60-70%. Fixed with two changes:
  1. Two new inference helpers run at ingest time: `lib/utils/async-score.ts` (keyword-based 1-10 async-friendliness score from the description, e.g. "async"/"core hours" vs "daily standup"/"real-time collaboration") and `lib/utils/job-industries.ts` (infers the quiz's own 8 industry codes, saas/fintech/health/edu/ecommerce/ai/climate/gaming, from title plus description). This also fixed a silent bug: Remotive's raw `category` field ("Artificial Intelligence") never actually matched the quiz's short codes ("ai") in `matching.ts`'s substring check, so industry matching was broken for anyone who used it.
  2. `lib/utils/matching.ts`'s `calculateMatchScore` no longer divides by a fixed 100. Each dimension (async/salary/experience/skills/timezone/schedule/industry) is now tracked as applicable or not; missing data (no salary, no timezone, no industry signal) excludes that dimension from BOTH the earned points and the max-possible denominator, instead of previously giving a flat "partial credit" that permanently capped the ceiling. The `reasons` object returned to callers is unchanged (still raw points on the original 20/20/15/15/10/10/10 scale), so `getMatchExplanation`'s thresholds didn't need touching.
  Verified end to end: re-ran `npm run ingest:jobs` (156 of 158 jobs now have a real `async_score`, 85 now have `industries`, still 46 missing all three of salary/timezone/industries but their score is no longer capped for it), submitted a real quiz answer, and confirmed the math by hand against the raw `matches.match_reasons` row (a job with no salary scored 89% as 71 earned / 80 applicable points, not the old fixed-100 denominator).
  **Follow-up same session:** Johannes correctly pushed back that a job with completely unknown salary shouldn't be able to claim a 100% "perfect" match either, that's a false promise. Added a confidence factor on top of the renormalized percentage: `confidence = 0.5 + 0.5 * (applicable weight / total weight)`, final `score = round(rawPercent * confidence)`. Missing only salary (20/100 of the weight) now caps the ceiling around 90%, missing salary + timezone + industry together caps it around 80%, full data still reaches 100%. Re-verified with the same test job: the no-salary listing that scored 89% under the uncapped version now scores 80%.
* Saved jobs (the `saved_jobs` table exists, nothing writes to it yet).
* Paddle payment integration. **Correction (2026-07-27):** an earlier pass through this file (same session) wrongly concluded Stripe was the real provider because unused `stripe`, `@stripe/stripe-js`, `@stripe/react-stripe-js` packages were sitting in `package.json` even though the docs already said Paddle. Those packages were leftover cruft, never actually used anywhere in the app (`grep` for stripe usage only turned up the `users.stripe_customer_id` column name). Removed via `npm uninstall`, and `.env.example` updated to Paddle env var names (`NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `PADDLE_API_KEY`, `PADDLE_WEBHOOK_SECRET`). Paddle is the confirmed, correct provider going forward. One remaining loose end: the `users.stripe_customer_id` column in `schema.sql`/`lib/db/types.ts` is still named after Stripe, rename it to `paddle_customer_id` via a migration whenever Paddle actually gets wired up, not touched now since it's a live production column and this was a docs/dependency cleanup pass, not a schema change.

* **First real SEO pass done manually with Johannes (2026-07-28), before the autonomous agent's first scheduled run.** Found and fixed a real data quality problem while looking at the first Search Console report: 28 of 158 active jobs (18%) were not real job postings at all, RemoteOK's feed occasionally scrapes non-job content (recruiting page boilerplate, blog posts, even three companies, "World Veterans", "DevTube", "AdConversion", whose "jobs" turned out to be nav menu or glossary text). These were publishing JobPosting structured data on non-job content, a real risk for a Google structured data spam penalty. Fixed with `lib/utils/job-quality.ts` (`isLikelyRealJob`, a title/description heuristic) wired into `scripts/ingest-jobs.ts` going forward, plus a small explicit blocklist for the three confirmed-bad sources, and a one time `scripts/cleanup-non-job-listings.ts` that soft deactivated (`is_active=false`, reversible) the 28 existing bad rows. 130 real jobs remain active. Also: deleted 3 stray sitemap submissions in Search Console that were individual page URLs mistakenly submitted as sitemaps (`/remote-jobs`, `/pricing`, `/`, all erroring), confirmed via URL inspection that the homepage is actually indexed despite the sitemap report's lagging "0 indexed" stat, added a "Finance & Accounting" category (`lib/utils/job-categories.ts`, 8 real jobs, mostly German bookkeeping/accounting roles that had nowhere to go before) and widened the Operations & Support category's keywords to catch support/success/admin roles across languages, dropping uncategorized real jobs from 66 to 45 of 130. Added breadcrumb navigation plus BreadcrumbList JSON-LD on `/jobs/[slug]` and `/remote-jobs/[category]`, and a "browse more X jobs" link from job pages back to their category, closing an internal linking gap (job pages previously only linked to home and the quiz). Pushed 20 job pages through the Indexing API. Added `public/llms.txt` describing the site for AI assistants/LLM crawlers, per Johannes's goal of ranking in LLM-surfaced answers, not just classic search. Known residual gap: a handful of low quality titles ("Terri Jago", "Dubai UAE", "URBAN") are borderline enough that the quality filter deliberately leaves them alone to avoid false-positiving real short job titles (e.g. "Caretaker", "Team Member" are real), worth another look if it becomes noticeable.
* **Autonomous SEO agent set up (2026-07-28).** A Google Cloud service account (`seo-automation@matchremote-seo.iam.gserviceaccount.com`, project `matchremote-seo`) has `siteOwner` access to matchremote.io in Search Console, key stored locally at `secrets/` (gitignored, never in the repo). `lib/seo/search-console.ts` wraps the Search Console API (search analytics, sitemaps) and the Indexing API (only valid for `/jobs/[slug]` pages, since those carry JobPosting schema, per Google's terms). `npm run seo:report` prints a JSON report (top queries/pages, high impression low CTR pages, sitemap health).
* **SEO/LLM visibility automation expanded (2026-07-28), three local scheduled tasks now run this (Claude Code's own scheduler under `C:\Users\johan\.claude\scheduled-tasks\`, only fires while the app is open, not in this repo), all with Johannes's standing authorization to push straight to main without asking, all build gated:**
  * `seo-auto-optimize`, every 2 days: reacts to fresh Search Console data (CTR, position, sitemap health, indexing gaps).
  * `seo-programmatic-pages`, weekly (Mondays 10am), deliberately less often since job volume doesn't change dramatically day to day: runs `npm run seo:combo-pages` and widens job categorization or reviews the combo page threshold as real data grows.
  * `seo-cadence-switch-to-biweekly`, one time (2026-08-18): drops `seo-auto-optimize` from every 2 days to every 2 weeks per Johannes's original request, its stored replacement prompt is kept in sync with `seo-auto-optimize`'s current prompt by hand whenever the latter changes.
  * GEO/LLM answer monitoring (querying OpenAI/Gemini/Perplexity APIs to check if matchremote gets mentioned) was scoped but deliberately not built, Johannes has no LLM API keys yet, revisit when he does, it is the only piece of this automation with a real per-run external cost.
* **First real SEO pass, done manually with Johannes, session 1 (2026-07-28).** Found and fixed a real data quality problem while looking at the first Search Console report: 30 of 158 active jobs (19%) were not real job postings at all (recruiting page boilerplate, blog posts, a scraped textile product description, a scraped job application form, three companies, "World Veterans", "DevTube", "AdConversion", whose "jobs" turned out to be nav menu or glossary text). These were publishing JobPosting structured data on non-job content, confirmed as a real, live Google Search Console error (not just a warning) via the Rich Results Test, see below. Fixed with `lib/utils/job-quality.ts` (`isLikelyRealJob`, a title/description heuristic) wired into `scripts/ingest-jobs.ts` going forward, plus a small explicit blocklist for the three confirmed-bad sources, and a one time `scripts/cleanup-non-job-listings.ts` that soft deactivated (`is_active=false`, reversible) the bad rows. 128 real jobs remain active. Also: deleted 3 stray sitemap submissions in Search Console that were individual page URLs mistakenly submitted as sitemaps, confirmed via URL inspection that the homepage is actually indexed despite the sitemap report's lagging "0 indexed" stat, added a "Finance & Accounting" category (8 real jobs) and widened Operations & Support, dropping uncategorized real jobs from 66 to 45 of 130. Added breadcrumb navigation plus BreadcrumbList JSON-LD on `/jobs/[slug]` and `/remote-jobs/[category]`, and a "browse more X jobs" link from job pages back to their category. Pushed 20 job pages through the Indexing API. Added `public/llms.txt` for AI assistants/LLM crawlers.
* **SEO pass session 2 (2026-07-28), structured data audit plus programmatic SEO:**
  * **Real bug found and fixed via Google's Rich Results Test (browser verified, not just read about):** every `/jobs/[slug]` page set `jobLocationType: TELECOMMUTE` without the `applicantLocationRequirements` Google requires alongside it, confirmed live as "1 critical issue" on a real production job page, not a cosmetic warning. `lib/utils/job-country.ts` (`deriveApplicantCountries`) now honestly derives a country from the job's free text location when the text names one unambiguously (about half of listings), those jobs get the full compliant TELECOMMUTE + applicantLocationRequirements markup, the rest omit jobLocationType entirely rather than claim something unbacked. **Manual verification for Johannes:** paste any `/jobs/...` URL into https://search.google.com/test/rich-results (or the "Code" tab there to paste raw HTML/JSON-LD without deploying) to check Rich Results eligibility any time, the JobPosting/Organization/WebSite/FAQPage schema already on the site (built in earlier sessions) all passed this audit except the one bug above.
  * Two more non-job listings caught during this audit and deactivated: "URBAN" (a scraped textile product description) and "RSM" (a scraped job application form with no actual job content), both slipped through as single all-caps words, `isAllCapsSlogan` in `lib/utils/job-quality.ts` now also catches single word all-caps titles, not just 2-4 word phrases. 128 real jobs remain active.
  * `public/llms.txt` expanded with a "Data available" section and contact info (johanneskepp@gmail.com).
  * **Programmatic "[role] jobs in [region]" combo pages built** (`app/remote-jobs/[category]/[timezone]/page.tsx`, previously explicitly skipped for lack of data, see the old "Not yet built" note this replaces). `lib/utils/combo-pages.ts` only surfaces a combo once real job volume clears `MIN_COMBO_JOBS` (5), via `generateStaticParams` plus `dynamicParams=false` so thin/unbuilt combos 404 instead of rendering empty, pages appear and disappear automatically as job data grows, no manual page creation needed going forward. 3 combos qualify today: engineering/americas (15), operations/americas (13), engineering/europe (7). `app/sitemap.ts` and the category pages (region chip links) both stay in sync with this automatically. `npm run seo:combo-pages` reports current coverage plus which combos are close to unlocking, this is what the new weekly `seo-programmatic-pages` scheduled task runs.
  * **Core Web Vitals check added** (`scripts/check-web-vitals.ts`, `npm run check:vitals`): runs Lighthouse against a local production server for a handful of key pages, warns (does not hard block) if any page falls outside Google's "Good" LCP/CLS/TBT thresholds. Deliberately not a postbuild hook on `npm run build`, that would also run inside Vercel's cloud build where there's no Chrome binary and no need for it, risking breaking every deploy. Instead it's wired as an explicit extra step inside the two SEO scheduled tasks' existing build gate (after `npm run build` succeeds, before commit), so it adds no new scheduled Claude Code usage. All 4 sampled pages currently pass (scores 97-99).

### Known issues

* Framework Preset in Vercel Production Overrides shows "Other". Project Settings correctly say "Next.js" but existing production overrides can't be reset from UI. Doesn't affect builds anymore.

## Deployment Flow

Auto deploys on push to `main`:

```
git add .
git commit -m "message"
git push
```

## Design Philosophy Summary

The user (Johannes) explicitly wants:

* NOT generic AI looking design. No cream plus terracotta, no acid green on black, no broadsheet columns.
* Duolingo energy. Playful, engaging, but trustworthy.
* BIG text, BIG buttons, BIG clickable areas. But without forcing long vertical scroll.
* No long vertical pages. Content fits within viewport where possible.
* Strong, simple flow through each page. One clear next action always visible.
* Emojis as functional design elements, not decoration.
* SEO first. Every choice considers organic discoverability.
* No em dashes, no en dashes. Avoid regular hyphens in copy.

When making design changes: reach for warmth, personality, and clarity. Bigger is better. Fewer sections stacked vertically is better.

**Update (2026-07-28):** the palette was replaced wholesale. Earlier feedback was that the design got too "fun" and "AI generic" (rainbow tinted cards, sticker style rotated boxes, emoji everywhere), then a dark fintech landing page was tried and also dropped. Current and only direction: cool steel grey canvas, copper orange for the one primary action, teal as the single supporting accent, everything else neutral. Keep the Duolingo bones (big buttons, generous radius) but restrain color hard. Reduce emoji density, prefer numbered circles or checkmarks over decorative emoji icons. When in doubt, favor the more restrained, professional looking option.

## User Preferences

* Speaks Swedish primarily, some English. Respond in Swedish unless code.
* Prefers step by step guidance when doing manual setup.
* Uses Windows and PowerShell locally.
* Uses Claude Code for direct file editing plus git push. No ZIP handoff needed.
