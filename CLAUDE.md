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

**Vibe:** Duolingo style. Playful but professional. Big clickable areas, warm colors, personality.

### CRITICAL LAYOUT PRINCIPLE. No long vertical scrolling pages.

* Every page should feel like a focused single screen experience where possible
* Content should fit within viewport or require minimal scroll
* Prioritize horizontal layouts, side by side arrangements, and compact but LARGE elements
* Elements should be as big as possible without forcing content off screen
* Strong, simple flow through each page. One clear next action always visible.
* Landing page: hero plus immediate CTA visible without scroll on desktop
* Never build endless marketing pages with 10 sections stacked vertically

### Colors (defined in `app/globals.css` as CSS variables)

* `--bg` `#FAFAF5` off white background
* `--bg-warm` `#FFE9E3` soft pink accent bg
* `--ink` `#1A1614` text (soft black)
* `--ink-soft` `#5C5854` muted text
* `--indigo` `#3D3AE0` primary brand
* `--indigo-dark` `#2E2CB8` button shadow
* `--yellow` `#FFB627` accent (energetic)
* `--yellow-dark` `#E89E15`
* `--success` `#22C55E`
* `--border` `#E8E4DC`

### Typography

* Display: Fraunces (serif, for headings, class: `font-display` or h1, h2, h3)
* Body: Inter (default)

### Key CSS classes (in globals.css)

* `.btn-big` main CTA button. 64px min height, 3D shadow depth like Duolingo.
* `.btn-big.btn-yellow` yellow variant
* `.btn-big.btn-ghost` white outline variant
* `.option-card` quiz answer card. 80px min height, big emoji plus text.
* `.option-card.selected` selected state
* `.card` generic content card
* `.chip` small pill tag
* `.progress-bar` and `.progress-fill` quiz progress
* `.container` (720px) and `.container-wide` (1100px)

### Design rules

* Big clickable areas. Min 64px height for buttons, 80px for option cards.
* Emojis as visual anchors. Every option, every step has one.
* 3D shadow effect on buttons (`box-shadow: 0 4px 0 [darker color]`). Presses down on click.
* Serif for personality (Fraunces), sans for readability (Inter).
* Never use generic Tailwind utility classes like `bg-blue-500`. Always use the CSS vars.

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

## Project Structure

```
app/
  page.tsx           Landing page
  quiz/page.tsx      15 question quiz (needs redesign per Quiz UX spec above)
  results/page.tsx   Match results (currently mock data)
  pricing/page.tsx   3 tier pricing
  auth/login/page.tsx
  api/
    matches/route.ts        Stubbed. Returns empty.
    quiz/submit/route.ts    Stubbed. Returns success.
  layout.tsx         Root layout. Minimal. No header or footer. Pages own their chrome.
  globals.css        Design system
lib/
  db/
    queries.ts       Supabase CRUD. All typed as `any` for build compatibility.
    schema.sql       Full DB schema. 8 tables, RLS policies.
    supabase.ts      Client init
    types.ts         TypeScript types
  utils/
    helpers.ts       formatSalary, formatDate, etc plus constants
    matching.ts      Scoring algorithm. 7 factors, 0 to 100.
```

## Environment Variables (in Vercel)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`

## Current Status

Keep this section current after every session. This is the single source of truth for what is done versus not done, check it before starting new work.

### Working

* Custom domain matchremote.io purchased and connected (Vercel + one.com DNS). Apex domain is primary, www redirects to it.
* Landing page redesigned: compact single or two column layout, no long stacked sections. Scrolling recent jobs ticker (mock data) under the header. Hand drawn underline accent on the hero headline, wavy section divider. Color palette toned down deliberately, restrained to indigo plus neutrals, most emoji driven decoration removed after founder feedback that it looked "AI generic" and unprofessional. Numbered circle icons for "How it works", checkmark circles for "Why matchremote", both with proper semantic h2 headings.
* Quiz fully redesigned per the Quiz UX Specification: shadowed prev and next question cards peeking beside the maximized current question (clickable to jump), a dot navigation strip to jump to any of the 15 questions directly, progress bar shows percent answered not position, every question is multi select regardless of whether it looks single choice.
* Pricing page (3 tiers).
* SEO foundations built: app/robots.ts, app/sitemap.ts, root layout metadata (title template, OG, Twitter cards, JSON-LD Organization plus WebSite), per page metadata (home, pricing) and per route layout.tsx metadata for client component pages (quiz, results, auth/login), dynamic OG image generator, noindex on results and auth/login, semantic main and h2 landmarks added to the homepage, FAQ section on the homepage with FAQPage schema for longtail keyword coverage.
* Google Search Console fully set up (2026-07-26): domain property verified via DNS TXT record at one.com, sitemap.xml submitted and processed (3 pages discovered), manual indexing requested for the homepage and /quiz.
* Real Supabase backend wired end to end (2026-07-26): schema.sql executed (all 7 tables), RLS enabled on every table including a public "read active jobs" policy on jobs so the anon key can list jobs while writes stay locked to the service role. Found and fixed a real bug: Vercel's production env vars for Supabase were still placeholder example values (`https://aBcDe.supabase.co`), meaning the live site never actually talked to a database before this session. Now corrected and verified live. lib/utils/quizMapping.ts converts the quiz UI's free form multi select answers into the strict quiz_responses columns the matching engine expects. app/api/quiz/submit creates an anonymous guest user (email like guest-<uuid>@guest.matchremote.io, no real auth yet), saves the mapped quiz response, and runs lib/utils/matching.ts against the jobs table. app/api/matches returns a user's top matches joined with job data. app/quiz and app/results call these real endpoints instead of using localStorage/mock data. Verified working against both local dev and production (matchremote.io) by submitting a real quiz answer and confirming it landed correctly in Supabase, then deleting the test row.
* Results page now shows an honest "No matches yet, we're still building our job database" empty state instead of the old 6 hardcoded mock jobs, since the jobs table is intentionally empty (see below).
* Deployed on Vercel, auto deploy on push to main.

### Reminder: revisit Google Search Console when new pages exist

Search Console is set up for the current 3 static pages only (/, /quiz, /pricing). Whenever new indexable pages are added, most importantly the programmatic "[role] jobs in [timezone]" pages and any real job detail pages once real job data exists, come back and: confirm they appear in app/sitemap.ts, wait for Search Console to pick up the updated sitemap (or resubmit it), and manually request indexing for at least the first batch so they get crawled quickly instead of waiting for the next natural crawl.

### Not yet built

* Real job data. The jobs table exists and is fully wired into matching and results, but is deliberately empty, no jobs have been seeded or scraped yet. The only job data anywhere on the site is the landing page ticker, which is explicitly mock/decorative and separate from the real jobs table. As soon as rows exist in jobs (is_active = true), real users will start seeing real matches with no further code changes needed.
* Job ingestion script written and run successfully (2026-07-27): `scripts/ingest-jobs.ts`, run with `npm run ingest:jobs`. Pulls from RemoteOK, Remotive and Arbeitnow (all official public APIs, no ToS issues), normalizes to the `jobs` schema, and upserts on `url` so re-running is safe. We Work Remotely is deliberately excluded, their API terms prohibit storing scraped job data outside their own API. `.env.local` set up via `vercel env pull` (project linked as `johannes-kepp-s-projects/matchremote-io`) plus the Supabase keys pasted in manually. **153 real jobs are now live in the `jobs` table** (100 RemoteOK, 36 Remotive, 17 Arbeitnow), confirmed via direct query. Known gaps: none of the three sources give a clean `timezone` value in the format the quiz/matching engine expects, so `timezone` is left null on all ingested jobs for now (matching.ts already handles this gracefully with partial credit); `industries` is only populated for Remotive (has a `category` field); RemoteOK's feed occasionally includes spammy/low-quality entries (odd titles like "Joe Armstrong" under the same company), no filtering applied yet, worth revisiting if it becomes noticeable to users.
* JobPosting structured data and programmatic category pages built (2026-07-27):
  * `app/jobs/[slug]/page.tsx`: per-job detail page with full JobPosting JSON-LD (title, description, datePosted, employmentType, hiringOrganization, baseSalary when known, jobLocationType TELECOMMUTE). Slugs are `slugify(title-company)-<job id>`, parsed back via `lib/utils/job-slug.ts`. `applicantLocationRequirements` (a specific Country) is deliberately omitted, none of the three sources give clean structured location data, see the timezone gap noted above. ISR via `revalidate = 3600` plus `dynamicParams = true` so newly ingested jobs render on demand without a full rebuild.
  * `app/remote-jobs/page.tsx` and `app/remote-jobs/[category]/page.tsx`: category index and 6 role pages (engineering, design, product, marketing, sales, operations), mirroring the quiz's own role options in `app/quiz/page.tsx`. Categorization is `lib/utils/job-categories.ts`, matches on **job title only**, deliberately not `tags`/`industries`. RemoteOK's `tags` field turned out to be unreliable per-job metadata (a "Graduate Analyst" post came tagged "vfx", "illustrator", "architecture"), matching against it produced false positives like "Clinical Pharmacist" showing up under Engineering. Caught and fixed during verification.
  * `app/sitemap.ts` now includes the 6 category pages plus one entry per active job (155 as of this session).
  * True "[role] jobs in [timezone]" combo pages are not built. With `timezone` null on every ingested job (see gap above), those pages would either be empty or force a fake distinction, worse for SEO than the role-only pages. Revisit once a source gives structured location/timezone data.
  * Two more bugs caught during verification, both fixed in `scripts/ingest-jobs.ts`: (1) some listings had tiny non-zero salary values (looked like a mislabeled hourly rate) that rendered as "$0k - $0k", now floored via `sanitizeSalary` (anything under $1,000/year is treated as unknown); (2) some Arbeitnow listings (seen on Brazilian/Portuguese postings, e.g. "TOTVS") arrived as classic UTF-8-decoded-as-Latin-1 mojibake ("SoluÃ§Ãµes" instead of "Soluções"), now repaired by `fixMojibake` with a safety check that bails out if the repair would introduce U+FFFD replacement characters.
* Manual follow-up needed from Johannes: resubmit the sitemap in Google Search Console and request indexing for a few of the new `/remote-jobs/*` and `/jobs/*` URLs. This has to happen from the GSC dashboard, no API access is configured for it in this session.
* Auth flow (magic link login).
* Saved jobs.
* Email alerts (Resend integration exists in package.json but not wired).
* Paddle payment integration.

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

**Update (2026-07):** founder pushed back on the color palette and decoration getting too "fun" and "AI generic" (rainbow tinted cards, sticker style rotated boxes, emoji everywhere). Current direction: keep the Duolingo bones (big buttons, generous radius, playful headline treatment) but restrain color to indigo plus neutrals for most UI chrome, save saturated color for the one primary CTA. Reduce emoji density, prefer numbered circles or checkmarks over decorative emoji icons for lists. When in doubt, favor the more restrained, professional looking option.

## User Preferences

* Speaks Swedish primarily, some English. Respond in Swedish unless code.
* Prefers step by step guidance when doing manual setup.
* Uses Windows and PowerShell locally.
* Uses Claude Code for direct file editing plus git push. No ZIP handoff needed.
