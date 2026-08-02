# matchremote.io

AI-powered remote job matching platform. Users take a 15 question quiz and get personalized job matches.

## Founder & Vision

**Founder:** Johannes Kepp, 36
**Email:** johanneskepp@gmail.com
**GitHub:** johanneskepp

**Vision:** Build a service that generates revenue within 6 months. Heavy focus on SEO from day one. Organic growth is a primary channel, not an afterthought.

**Payment provider:** Stripe direct, Live as of 2026-08-02 (switched from Paddle the same day, Paddle rejected the account, "job boards" are explicitly prohibited under their Acceptable Use Policy, see Current Status). Stripe is not a Merchant of Record, matchremote is the seller of record and handles its own VAT via Stripe Tax. Price is $7/week, tax-inclusive: the customer always pays exactly $7 total, VAT is backed out of that rather than added on top.
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
* Payments: Stripe direct, Live (switched from Paddle 2026-08-02, see Current Status)

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

**Vibe (updated 2026-08-02):** Cool, confident, tool like. Keeps the Duolingo bones (big clickable areas, generous radius, 3D button depth) but the palette is a cool steel grey base with a single navy blue accent. Not playful pastel, not dark fintech, a calm neutral canvas where the one saturated color is always the next action.

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
* `--accent` `#1E3A8A` navy blue, primary brand and every CTA
* `--accent-dark` `#16295F` button 3D shadow and hover
* `--teal` `#1C9AD6` sky blue (variable kept named `--teal` to avoid touching every consumer), secondary accent, links, match percent ring, progress fill
* `--success` `#16A34A` confirmations and checkmarks only

The palette moved from copper orange to navy blue (`ac4acb7 Replace orange
accent with navy blue, teal with sky blue`). `components/Logo.tsx` reads the
CSS variables so it updated automatically, but `app/icon.svg`,
`app/apple-icon.png`, `public/icon.png`, and `public/logo/*.svg` had the old
orange hardcoded and silently kept shipping the wrong favicon, Apple touch
icon, and Organization JSON-LD logo until caught and fixed 2026-08-02, see the
Working entry below. If the palette changes again, grep for hardcoded hex
colors in `app/icon.svg`, `app/apple-icon.png` (regenerate from
`public/logo/matchremote-icon.svg` with `sharp`), and `public/logo/*.svg`,
none of them read the CSS variables.

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

### Search box to quiz

The CTA navigates to a plain `/quiz`, no query params. This used to carry the
typed role and salary target along to prefill those two quiz questions, removed
2026-07-29 on Johannes's explicit instruction: no answer option should ever
arrive pre-selected, regardless of how the visitor got to the quiz. `ROLE_OPTIONS`
and `SALARY_OPTIONS` still live in `lib/quiz-options.ts` and are imported by both
the hero and `app/quiz/page.tsx` so the option lists can't drift apart, but the
matching/prefill helpers (`matchRoleValue`, `isKnownSalaryValue`) were deleted
along with the feature since nothing called them anymore.

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

The quiz always opens with every question unanswered, including from the hero
search box, which no longer carries role/salary along as query params (see
"Search box to quiz" above). No login is required to take the quiz or to see
the two free matches at the end.

## Project Structure

```
app/
  page.tsx           Landing page, see Landing Page Spec above
  HeroSearch.tsx     Client component: hero search box plus animated demo
  faq/page.tsx       FAQ, carries the FAQPage JSON-LD
  quiz/page.tsx      10 screen quiz (grouped/merged down from 15 questions, see below), always opens fully unanswered
  results/page.tsx   Match results, two open then locked, see paywall below
  pricing/page.tsx   Pricing, one plan only
  privacy/page.tsx   GDPR privacy policy, noindex
  terms/page.tsx     Terms of Service, noindex
  about/page.tsx     Founder story, indexed, trust signal for a brand new domain
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
    account/cancel/route.ts           Cancels the Stripe subscription at period end
    account/delete/route.ts           Cancels any active Stripe subscription immediately, deletes the user (cascades to every table), ends the session
    checkout/create-session/route.ts  Creates a Stripe Checkout Session, returns the URL to redirect to
    webhooks/stripe/route.ts          Mirrors Stripe subscription state into subscriptions
  layout.tsx         Root layout. Fonts (next/font), metadata, Organization JSON-LD.
  globals.css        Design system
components/
  MatchCard.tsx      Shared match card, used by both /results and /dashboard
lib/
  quiz-options.ts    Shared role and salary options, used by hero and quiz
  plan.ts            FREE_MATCH_LIMIT, price, score thresholds, default alert threshold
  auth/session.ts    Session cookie, hashing, lookup
  billing/stripe.ts        Stripe API client, cancel helpers
  billing/subscription.ts  isActive plus getAccessState, the single access check
  email/client.ts          Resend init, returns null when the key is missing
  email/otp.ts             Sign in code email
  email/match-notification.ts  Daily new match email
  social/bluesky.ts        Bluesky post client, dynamic import of @atproto/api (see status below), returns null when the app password is missing
  db/
    queries.ts       Supabase CRUD. All typed as `any` for build compatibility.
    schema.sql       Original schema. 7 tables, RLS policies.
    migrations/      001_auth, 002_match_notifications, 003_subscriptions, 004_job_expiry, 005_bluesky_posts
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
  send-match-notifications.ts  Daily new match email, run with npm run notify:matches, --dry-run supported
  post-jobs-to-bluesky.ts     Posts newest unannounced jobs to Bluesky, run with npm run social:bluesky, --dry-run supported (see status below, no account yet)
secrets/
  <service-account>.json   Google service account key, gitignored, never committed
```

## Environment Variables (in Vercel)

* `NEXT_PUBLIC_SUPABASE_URL`
* `NEXT_PUBLIC_SUPABASE_ANON_KEY`
* `SUPABASE_SERVICE_ROLE_KEY`
* `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` (local only, points at the gitignored file in `secrets/`)
* `GOOGLE_SEARCH_CONSOLE_SITE` (`sc-domain:matchremote.io`)

Declared in `.env.example` and required by shipped code. `RESEND_API_KEY` and all
six Paddle Live variables were set 2026-08-02, then **removed the same day**
when Paddle rejected the account, see Current Status for the full story.
`BLUESKY_HANDLE` and `BLUESKY_APP_PASSWORD` are set (2026-08-02, in both
`.env.local` and Vercel Production), see the Bluesky "Working" entry.

**Stripe Live (2026-08-02):** `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`,
`STRIPE_WEBHOOK_SECRET` are Live values, set in both `.env.local` and Vercel
Production. Real checkouts create real subscriptions and charge real cards.
See the "Stripe flipped to Live" Working entry for how this was verified.

## Current Status

Keep this section current after every session. This is the single source of truth for what is done versus not done, check it before starting new work.

### Still blocked, needs Johannes

**Migrations 001 through 004 are done.** Johannes ran `001_auth.sql`,
`002_match_notifications.sql`, `003_subscriptions.sql` and `004_job_expiry.sql`
in the Supabase SQL editor on 2026-07-28, each verified afterwards by probing
the new tables and columns directly. Do not re-run or re-ask.

What is still missing:

1. ~~The daily scheduled task for `npm run notify:matches`~~ **Done (2026-08-02).** Johannes approved the cadence, scheduled task `daily-match-notifications` now runs every day at 07:03 local, see the Working entry below. Do not re-ask.
3. ~~Migration `005_bluesky_posts.sql`, Bluesky account, env vars, scheduled task~~ **All done (2026-08-02).** See the Working entry below. Do not re-ask about any of it.
4. ~~Stripe account, Test mode product, checkout verification, Live flip~~ **All done (2026-08-02).** Built, verified in Test mode, then flipped to Live the same day on Johannes's explicit request. See the "Stripe flipped to Live" Working entry below. Do not re-ask about any of it.

### Working

* **Job descriptions shortened and made readable for all future ingestion, existing rows left alone (2026-08-02).** Johannes flagged that `/jobs/[slug]` descriptions were unreadably long, screenshotted a real example: a multi thousand character wall of text with zero paragraph breaks. Root cause in `scripts/ingest-jobs.ts`: `stripHtml` collapsed every HTML tag, including `<p>`, `<br>`, and `<li>`, to a single space, destroying whatever paragraph structure the source actually had, then capped at 5000 characters, so listings routinely stored several thousand characters of run together text. Two fixes, both ingest side only, per Johannes's explicit instruction not to touch the 1200+ jobs already live:
  * **`stripHtml` now converts block level tags to real line breaks** (`<br>`/`<hr>` to `\n`, closing `</p>`/`</div>`/`</li>`/`</h1-6>` to `\n`, `<li>` to a `• ` bullet) instead of flattening everything to spaces, so any source that actually sends structured HTML renders as real paragraphs on the job page, which already uses `white-space: pre-wrap`, no page level change needed.
  * **New `truncateDescription`, capped at 600 characters**, applied at all five source functions (RemoteOK, Remotive, Arbeitnow, Jobicy, Himalayas). Cuts at the nearest sentence end, falling back to a paragraph break, falling back to a word boundary, so it never chops off mid word, and always ends with "…", the "Apply on [source]" link remains the way to read the full original posting. Verified against a real world sample matching the screenshot's structure: a 919 character cleaned description correctly trimmed to 562 characters at a clean sentence boundary.
  * **Known limitation, not fixed**: if a source's description field is genuinely flat plain text with no HTML markup at all (Himalayas looks like it may do this for some listings, based on the screenshotted example), the paragraph preserving fix has nothing to convert, only the length cap helps there. Cutting length alone is still a large readability win, but revisit if Himalayas listings specifically still read as a run-on wall of (shorter) text.
  * **Minor known tradeoff**: `lib/utils/matching.ts`'s experience level scoring (15 of 100 match points) still scans the stored `description` for seniority keywords, so a keyword that used to sit past character 600 in a long posting is no longer visible to that one scoring dimension. Title keywords are weighted higher specifically for this reason (a title hit is worth more than a body hit), and role/skills matching was already made title driven in an earlier session, so the impact should be small, not verified with a live rescore since no real quiz submissions have run against freshly ingested jobs yet.
  * Not yet run against production: this only takes effect the next time `daily-job-ingestion` runs (06:09 local) or `npm run ingest:jobs` is triggered manually, today's ingestion already happened before this change.
* **Payments moved from Paddle to Stripe (2026-08-02): Paddle rejected the account, migration to Stripe in progress.** Same day Paddle went Live (see the entries further below), Johannes submitted `matchremote.io` for Paddle's required checkout domain approval. Paddle's review team rejected it outright: their automated email flagged the product category as "Advertising and Marketing / Job Boards" and quoted their own Acceptable Use Policy, which explicitly names "Advertising Services, including but not limited to **job boards**" as prohibited, not just restricted. Verified this was not a one-off by checking the two other mainstream indie-friendly Merchant of Record providers directly against their own published policies: **Lemon Squeezy** and **Polar.sh** both also explicitly name "job boards" as a prohibited category. This appears to be a shared, deliberate norm among MoR providers (they carry legal/financial responsibility for every transaction, and recruitment-adjacent products are apparently a bright line for all of them), not something an appeal or a rephrased business description was likely to overturn given the "job board" language is company-name-explicit in all three policies, so an appeal was not pursued. Confirmed **Stripe direct is not on Stripe's own restricted/prohibited business list** (`stripe.com/legal/restricted-businesses`), the practical path forward, at the cost of matchremote becoming its own seller of record: VAT/sales tax registration and remittance is now matchremote's own legal responsibility rather than Paddle's, mitigated by turning on Stripe Tax at checkout (automatic calculation, not automatic registration, Johannes still needs to register where required).
  * **Code rebuilt end to end the same day**, all still using Stripe's Test mode, nothing Live yet: `lib/billing/stripe.ts` (new, replaces `lib/billing/paddle.ts`, deleted), `app/api/checkout/create-session/route.ts` (new) creates a Stripe Checkout Session server side and returns its URL, `components/CheckoutButton.tsx` now just redirects the browser there (`window.location.href`) instead of opening Paddle's embedded overlay, meaning **no client-side Stripe library and no domain-approval step at all**, sidestepping the entire class of problem that sank Paddle. `app/api/webhooks/stripe/route.ts` (new, replaces `app/api/webhooks/paddle/route.ts`, deleted) verifies Stripe's signature and mirrors `customer.subscription.*` events into the `subscriptions` table, matched to a matchremote account via `subscription_data.metadata.userId` set at checkout creation, no separate lookup table needed. `cancelStripeSubscription` (used by `/api/account/cancel`) cancels at period end, matching the existing "you keep access until the date you paid for" UX promise; a separate `cancelStripeSubscriptionImmediately` (used only by `/api/account/delete`) cancels right away since there is no account left to keep access on.
  * **`lib/db/migrations/006_stripe_billing.sql`** renames `subscriptions.paddle_subscription_id`/`paddle_customer_id` to `stripe_subscription_id`/`stripe_customer_id`. Confirmed the table had zero rows before renaming (checked live, not assumed), so this was a safe rename with no data migration needed. Run in the Supabase SQL editor same day, verified afterwards by querying the renamed columns directly (200, not a column-does-not-exist error).
  * **Legal pages and copy updated to match**: `app/terms/page.tsx`'s "Subscriptions and billing" and "Refund policy" sections rewritten (matchremote is now the seller of record, not Paddle; refunds are matchremote's own policy now, not deferred to a third party's buyer terms). `app/privacy/page.tsx`'s payment data and sub-processor sections swapped Paddle for Stripe. `AccountControls.tsx`'s "Billing is handled by Paddle" line updated to Stripe.
  * **`@paddle/paddle-js` uninstalled, `stripe` (server SDK) installed.** No client-side Stripe package needed given the redirect-based Checkout flow.
* **Stripe Test mode built out end to end and fully verified the same day (2026-08-02).** Johannes created the Stripe account and pasted the Test mode secret key in chat. From there Claude Code drove the rest directly through the Stripe API rather than the dashboard: created the `matchremote` product and its $7/week price (`stripe.products.create` / `stripe.prices.create`), created a webhook endpoint pointed at `https://matchremote.io/api/webhooks/stripe` listening for `customer.subscription.*` (`stripe.webhookEndpoints.create`, which also returns the signing secret directly, no dashboard copy paste needed), and wrote all three values into `.env.local` and Vercel Production (Test mode keys, safe to have live since they only touch Stripe's Test ledger, exactly the same reasoning as testing the Paddle Sandbox build against the real webhook endpoint).
  * **Real bug hit and fixed during setup: Checkout Sessions failed with "the product tax code is missing"** because `automatic_tax: { enabled: true }` (Stripe Tax) requires every product to carry a tax code once enabled, which product creation does not set by default. Queried Stripe's own `taxCodes.list` API rather than guessing, picked `txcd_10103000` ("Software as a service (SaaS) - personal use", matches matchremote exactly: cloud software, no download, individual not business use), set it on the product with `stripe.products.update`.
  * **Verified with a real Test mode checkout completed in the browser, not just a database check.** Created a throwaway account and session the same way prior sessions did, called `/api/checkout/create-session` against production, got back a real `checkout.stripe.com` URL, opened it in the browser tool and filled in Stripe's official test card (4242 4242 4242 4242) plus expiry/CVC/name. Checkout correctly showed **Stripe Tax already applying 25% Swedish VAT automatically** ($7.00 subtotal, $1.75 tax, $8.75 total), confirming the tax code fix actually worked, not just that the error went away. Also found and honestly checked Stripe's own "I am an AI agent acting on behalf of someone else" disclosure checkbox before submitting, since that is exactly what was happening. After paying, the webhook fired against the real production endpoint and a real `subscriptions` row appeared with `status: active`, a real `stripe_subscription_id`/`stripe_customer_id`, and `current_period_end` 7 days out; the user's `plan` flipped to `premium`; `/account` correctly rendered "Active" when fetched with that session's cookie. **All test artifacts cleaned up immediately after**: the Stripe Test subscription cancelled via the API, the throwaway user deleted from Supabase, nothing fake left behind.
  * Not done at the time, on purpose: no Live keys requested or used yet. **Both the tax-inclusive pricing change and the Live flip happened right after, same day, see the next entry.**
* **Stripe switched to tax-inclusive pricing and flipped to Live, both same session (2026-08-02).** Johannes explicitly asked for two things: the $7 price should already include VAT rather than adding it on top, and to go Live immediately.
  * **Tax-inclusive price.** Stripe prices are immutable once created, so a new Price object was created on the same product with `tax_behavior: 'inclusive'` (the original exclusive-tax price deactivated, not deleted, Stripe prices can't be deleted once used). Verified with a real Test mode checkout session opened in the browser: the summary showed **Delsumma $7.00, Summa som ska betalas idag $7.00**, confirming the customer is charged exactly $7 total regardless of location, VAT is backed out of that $7 for Stripe's own reporting rather than stacked on top. `STRIPE_PRICE_ID` updated to the new inclusive price id, old one deactivated.
  * **Live flip.** Johannes switched the Stripe dashboard to Live mode (the account was already fully activated, `charges_enabled: true`, confirmed via `stripe.accounts.retrieve()`, no business/payout details were still missing) and pasted the Live secret key in chat. Claude Code created the Live product, the Live tax-inclusive price, and a Live webhook endpoint the same way as Test mode, entirely via the Stripe API (`stripe.products.create`, `stripe.prices.create`, `stripe.webhookEndpoints.create`), then wrote all three Live values into `.env.local` and Vercel Production via `vercel env rm` plus `vercel env add` (replacing the Test values, not adding alongside them) and deployed with `vercel --prod`.
  * **Verified against real Live infrastructure without spending real money.** Three checks, each against the actual Live API/endpoint, none of them completing a real purchase (no real card was used or available, and completing one would be a genuine purchase, not something to do on the founder's behalf without him doing it himself): (1) `stripe.accounts.retrieve()` confirmed `charges_enabled: true` on the Live account before touching anything. (2) A webhook event was built by hand and signed with `stripe.webhooks.generateTestHeaderString` using the real Live `STRIPE_WEBHOOK_SECRET`, then posted to `https://matchremote.io/api/webhooks/stripe`, confirmed `200 {"received":true}` and a real `subscriptions` row appeared for a throwaway test user, proving signature verification and the DB write path both work against Live infrastructure. (3) A real Checkout Session was created against production with `/api/checkout/create-session`, confirmed the returned URL was a genuine Live `checkout.stripe.com` session (no `cs_test_` prefix), proving session creation works Live, then left uncompleted so it expires with no charge. **All throwaway test users deleted immediately after each check.**
  * **matchremote.io now takes real payments, $7/week, VAT-inclusive.** No real end user has completed a purchase yet (nobody has signed up and paid since the flip), only the plumbing is proven, same caveat every previous Live flip in this file has had.
* **Bluesky bot fully live end to end (2026-08-02), first real posts went out.** Johannes created the real `@matchremote.bsky.social` account and an app password, pasted both in chat, Claude Code wrote `BLUESKY_HANDLE`/`BLUESKY_APP_PASSWORD` into `.env.local` and Vercel Production directly via `vercel env add` (same pattern as the Paddle Live keys). Migration `005_bluesky_posts.sql` (adds `jobs.posted_to_bluesky_at`) was run in the Supabase SQL editor, confirmed by querying the column directly (200 instead of the prior 42703 error). `npm run social:bluesky -- --dry-run` then found 5 real postable jobs, then the real (non dry run) command was run with Johannes's explicit go ahead since it posts real public content: **all 5 posted successfully**, verified independently by querying Bluesky's own public API (`app.bsky.feed.getAuthorFeed`) and seeing all 5 posts live on the real account, not just trusting the script's own success message. Scheduled task `daily-bluesky-posts` now runs every day at 08:02 local, posts up to 5 never-before-posted active jobs, matches the existing `notify:matches` pattern (script never edited by the automated run, failures just requeue for tomorrow, no git operations).
* **Stale orange brand assets found and fixed while preparing a Bluesky profile picture (2026-08-02).** The live site's actual icon mark (`components/Logo.tsx`) already reads `var(--accent)`, which the `ac4acb7` commit changed to navy blue (`#1E3A8A`) with sky blue (`#1C9AD6`) some time ago, confirmed by fetching the live homepage and finding `fill="var(--accent)"` in the rendered SVG. But three static, non-variable brand asset files never got updated in that commit and were still hardcoded to the old copper orange (`#FF5A1F`) and old teal (`#0F9E96`): `app/icon.svg` (the actual favicon Next.js serves), `app/apple-icon.png`, and `public/icon.png` (referenced by absolute URL in the Organization JSON-LD in `app/layout.tsx`), plus the standalone `public/logo/matchremote-icon.svg` and `matchremote-logo.svg` used for anything shared outside the app itself (like a Bluesky profile picture). All five fixed to the current navy/sky blue palette, the two PNGs regenerated from the corrected SVG with `sharp` (already a dependency) rather than hand exported, so they exactly match. This CLAUDE.md file's own Colors section is separately still stale (says copper orange as current), that section needs a rewrite the next time anyone touches the design system, not done here since it was out of scope for an icon fix.
* **Automation audit: real 1000 row Supabase cap found and fixed, sitemap and matching were both silently truncated (2026-08-02).** Johannes asked whether the daily job ingestion and SEO automation were actually doing well, specifically whether stale listings really get cleaned up and whether "1200 active jobs" was real. Checked live against the database rather than trusting prior notes:
  * **The numbers are real and healthy.** 1227 active jobs, 43 retired (deactivated, not deleted), 1270 ever ingested, split 309 RemoteOK / 319 Jobicy / 498 Himalayas / 34 Remotive / 67 Arbeitnow, matching exactly. `jobs.url` is a DB level `UNIQUE` constraint, so duplicate listings are structurally impossible, not just unlikely. Zero active jobs are older than the 40 day cutoff and zero are past their own source-provided expiry date, so the retirement logic from the 2026-07-28 session is working correctly, there was simply nothing eligible to retire yet since the pipeline is only about a week old (a job has to reach 40 days old before that logic ever touches it). The growth from 394 active jobs (2026-07-28) to 1227 now is expected accumulation, not a bug, and should start plateauing once the pipeline itself passes 40 days old.
  * **Real bug found while checking why: `app/sitemap.ts` called `getAllJobs(300)`, an arbitrary cap that used to be roughly the whole catalogue and quietly became "the newest or oldest 300 of 1227, in no defined order" as the catalogue grew, meaning roughly 900 real, live job pages had no sitemap entry at all and no realistic path to being discovered by Google.** Raised the sitemap's call to `getAllJobs(5000)` to fix the immediate symptom, then found the actual root cause while verifying: `lib/db/queries.ts`'s `getAllJobs` hit **Supabase's own PostgREST server side cap of 1000 rows per request** (a project setting, not something the client's `.limit()` can override, confirmed directly against the REST API: asked for 5000, got back exactly 1000 with `content-range: 0-999/1227`, HTTP 206 not 200). `getAllJobs` now pages through in 1000 row chunks via `.range()` until it reaches the requested limit or runs out of rows, so this cannot silently reoccur as the catalogue keeps growing, no dashboard setting to remember. Also added `.order('posted_date', { ascending: false })`, previously unordered so which jobs made it into any capped result was arbitrary.
  * **This was not just a sitemap problem.** `app/api/quiz/submit/route.ts` calls the same `getAllJobs(2000)` to rank jobs for every quiz submission, meaning **every match calculated since jobs passed 1000 active (this week) silently excluded up to roughly 227 real jobs from consideration**, no error, no sign anything was wrong. Fixed by the same pagination change, no route level change needed.
  * **Verified against the live build, not just read for correctness:** rebuilt and served the production build locally, sitemap URL count went from 328 to 1255 (roughly 1227 jobs plus the 6 static, 6 category, and combo pages, matches expectations), confirmed `feed.xml` and `jobs-feed.xml` (both already under 1000, so unaffected) still return 200 with real items.
  * **SEO automation itself is running as designed and finding real things**, not busywork: today's `seo-auto-optimize` run (2026-08-02) found and deactivated 6 junk listings and caught a separate real bug (deactivated jobs were still serving JobPosting structured data, since fixed, see the entry below). Search Console still shows only 10 impressions and 0 clicks over the last month with 0 pages showing as indexed, that is expected for a one week old domain regardless of technical quality, nothing today's automation could have changed, indexing takes Google weeks regardless. No cadence change needed, `seo-auto-optimize` already reduces to every 2 weeks automatically on 2026-08-18 per the standing plan.
* **Self-service account deletion and an About page, same status-check follow up round (2026-08-02).**
  * **`app/api/account/delete/route.ts`** (new): cancels any active Paddle subscription first (refuses to proceed and asks the user to retry if that cancel call fails, so a deleted account can never keep billing a card), then deletes the `users` row. Every other table (`quiz_responses`, `matches`, `saved_jobs`, `email_logs`, `email_alerts`, `subscriptions`, `sessions`) has `ON DELETE CASCADE` back to `users.id` already in the schema, so one delete call cleans up everywhere, confirmed by checking every migration file rather than assuming. `lib/db/queries.ts` gained a matching `deleteUser`. `AccountControls.tsx` got a "Delete my account and all my data" control with the same click-to-confirm pattern already used for cancelling a subscription, styled distinctly (red) since it is destructive and, unlike cancel, irreversible.
  * **Verified against a real throwaway account, not just read for correctness:** inserted a real `users` row, a `sessions` row with a known token, and a `quiz_responses` row directly via the REST API, hit the live endpoint with that session cookie, got back `{"success":true}`, then queried all three tables directly and confirmed all three came back empty. This is also what closes out the "no self-service deletion" gap the privacy policy used to describe as email-only, `app/privacy/page.tsx` updated to say so.
  * **`app/about/page.tsx`** (new, indexed, unlike privacy/terms): a short founder story, solo builder, based in Sweden, explains the actual thesis (timezone/salary/work-style matching beats keyword matching) and is upfront that the site is brand new and still small. Linked from every footer and added to `app/sitemap.ts`. This is a trust signal deliberately aimed at the biggest gap the status check surfaced, a week old domain with zero social proof asking people to trust it with an email address and, soon, a subscription.
* **GDPR compliance pages built, daily match email turned on, stale pricing bug note corrected (2026-08-02, status check follow up).** Johannes asked for a full status review, see the "status check" summary he was given: 11 total users, 0 paying, 10 Search Console impressions and 0 indexed pages in the last month, essentially zero organic traffic since the domain is a week old. Out of that review, three concrete things were actioned immediately:
  * **`app/privacy/page.tsx` and `app/terms/page.tsx`** (new, both `noindex`, following the same header/footer pattern as `/faq`). Privacy policy covers: who the controller is (Johannes Kepp, Sweden), what is collected (email, quiz answers, the `mr_session` cookie, no analytics/tracking cookies), legal basis (contract plus legitimate interest, no marketing consent needed since email alerts are a feature the user opts into themselves), named sub-processors (Supabase, Paddle, Resend, Vercel) with a note on non-EU transfers being covered by Standard Contractual Clauses, retention, and GDPR rights including the right to complain to Sweden's IMY. Terms of Service covers subscription billing, and explicitly discloses **Paddle.com Market Limited as the Merchant of Record** (the legally required disclosure Paddle sellers must make, since Paddle, not matchremote, is the seller on the receipt and handles VAT/refunds), a "what matchremote is not" section (not an employer, jobs sourced from third parties, scores are estimates not guarantees), acceptable use, liability, and Sweden as governing law. Terms imports `PRICE_PER_WEEK_USD` from `lib/plan.ts` rather than hardcoding the price, specifically to avoid a repeat of the `$6`/`$7` staleness bug below.
  * **Linked from every existing footer** (home, FAQ, pricing, job detail pages, all three remote-jobs category pages) and from `AccountControls.tsx` directly under the Subscribe button ("By subscribing you agree to our Terms and Privacy Policy. Billing is handled by Paddle."), which is the actual point of payment, not just a buried footer link. Not done: Paddle's own dashboard has a business/checkout settings field for a seller's privacy and terms URLs, that's a Paddle dashboard setting Johannes should confirm is filled in, not something reachable from the codebase.
  * **The known "$6 a week" pricing bug flagged in the Paddle Sandbox entry above turned out to already be fixed** by an earlier commit (`51ebb2c Increase pricing from $6 to $7 per week`) that this file's notes had not been updated to reflect. Verified by grepping the current `app/pricing/page.tsx` for a hardcoded `$6`, none found, it already reads `PRICE_PER_WEEK_USD`. No code change was needed here, only correcting the stale note.
  * **`npm run notify:matches` (the daily new-match email) is now running automatically**, scheduled task `daily-match-notifications`, 07:03 local every day, right after the 6am job ingestion. Verified with `--dry-run` first (0 subscription rows, 0 active access, matches the real 0-paying-users state, so it is safe, nothing to accidentally spam). Deliberately conservative: the task prompt tells it to never edit the notification scripts and to just report failures rather than retry-and-fix live, since this sends real email.
* **SEO agent run, data quality and a real structured data bug (2026-08-02).** Search Console data is still too sparse to optimize on (10 impressions, 0 clicks over the last month, `highImpressionLowCtr` empty), so this run focused on data quality instead:
  * **New pattern of junk listings found and fixed.** 6 active rows were placeholder or non-job content: a literal `test` title with Lorem Ipsum body, `Job Details` and `Jop posting title` template placeholders (also Lorem Ipsum), a Spanish language blog post about Y Combinator with no employer attached, and two generic "open application" forms with no role (`Spontaneous application`, French `Postuler chez nous`). `lib/utils/job-quality.ts` now also rejects Lorem Ipsum bodies, French application form boilerplate, and a short exact match list of template placeholder titles. Ran the existing `scripts/cleanup-non-job-listings.ts` against production, which deactivated all 6.
  * **Real bug found while checking why one of those 6 would keep serving JobPosting markup after deactivation: `/jobs/[slug]` never checked `is_active` at all.** `getJobById` intentionally returns any row regardless of status (other callers need that), but the job detail page called it directly and rendered full JobPosting JSON-LD for deactivated jobs with no gate. That means every soft-deactivated listing since the 2026-07-28 non-job cleanup and the 2026-07-28 stale-listing retirement work has stayed live and publicly indexable at its direct URL the whole time, structured data included. Fixed in `app/jobs/[slug]/page.tsx`: `loadJob` now returns null (triggering a real 404 via `notFound()`) when the job is inactive, same as when it does not exist. Sitemap and listing pages were never affected, only direct or already indexed URLs to deactivated jobs.
  * Pushed the 15 most recently ingested `/jobs/[slug]` pages through the Indexing API, well under the per run quota, since coverage looks thin (325 URLs submitted in the sitemap, only a handful with any Search Console impressions yet).
  * `npm run check:vitals` still shows all 4 sampled pages with LCP a few hundred ms over Google's "Good" threshold (2.5 to 2.7s, scores 95 to 97), consistent with prior runs and not caused by this session's changes, worth a dedicated look if it does not self resolve.
* **Paddle checkout built end to end and verified in Sandbox (2026-08-02).** Before this session only the receiving side existed (the webhook route and `cancelPaddleSubscription`), there was no actual checkout trigger anywhere, `/pricing`'s "Subscribe" button just linked to `/account`, which itself only ever showed static text. Real gap, not just missing config.
  * **Shared Paddle seller account.** Johannes's Paddle account already runs another live product (Finnely). Paddle sellers are account wide, notification destinations receive every subscription event for every product on the account, so the webhook at `app/api/webhooks/paddle/route.ts` now hard ignores any event whose `custom_data.app !== 'matchremote'` before touching the database, verified by sending a signed test event with no `app` field and confirming it created zero rows. `components/CheckoutButton.tsx` always sets `customData: { userId, app: 'matchremote' }` when opening checkout, that tag is what makes the isolation possible.
  * **`components/CheckoutButton.tsx`** (new): a client component using `@paddle/paddle-js`'s `initializePaddle` plus `Checkout.open`, given the user's id and email as props. Wired into `app/account/AccountControls.tsx` in place of the old "Upgrading is not open yet" placeholder text, `app/account/page.tsx` now passes `user.id` and `user.email` down.
  * **`lib/billing/paddle.ts`**: `PADDLE_API_BASE` now switches between `sandbox-api.paddle.com` and `api.paddle.com` based on `PADDLE_ENVIRONMENT`, previously hardcoded to the live API even for a sandbox key, which would have made `cancelPaddleSubscription` fail confusingly once cancel was ever tested.
  * **Env vars added, Sandbox only, local `.env.local` only, deliberately not in Vercel yet**: `PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_ENVIRONMENT`, `NEXT_PUBLIC_PADDLE_CLIENT_TOKEN`, `NEXT_PUBLIC_PADDLE_PRICE_ID`, `PADDLE_API_KEY` (scoped to Subscriptions Read plus Write only, least privilege), `PADDLE_WEBHOOK_SECRET`.
  * **Verified live against the real Paddle Sandbox API and the real database** (local dev points at the same Supabase project as production, there is no separate dev database in this project): the API key was confirmed against `GET /subscriptions` (200, empty list). Signed in as Johannes locally, opened `/account`, clicked Subscribe, and confirmed via the rendered iframe's own payload that the Sandbox checkout overlay loaded with the correct price id, his email, and `custom_data` carrying both his real user id and `app: matchremote`. Completing an actual card entry inside Paddle's cross origin iframe is not something browser automation can drive (by design, it's a different origin), so the last mile, an actual test card submission, was verified a different way: a webhook event was signed with the real secret and posted to the local webhook endpoint, confirmed it flipped `/account` to "Active, $7 a week, next charge 9 August 2026" with a working Cancel button, exactly what a real completed checkout would trigger. A second signed event without `app: matchremote` was posted and confirmed to create zero rows, proving the Finnely isolation guard. **All test rows were deleted and the test user's plan reset to `free` immediately after**, nothing fake was left in the live database.
  * **Known issue flagged here originally, confirmed already fixed (2026-08-02):** a later commit (`51ebb2c Increase pricing from $6 to $7 per week`) already updated `app/pricing/page.tsx` to read `PRICE_PER_WEEK_USD` from `lib/plan.ts` everywhere, including the meta description. Verified by grepping the current file for a hardcoded `$6`, none found. Do not re-flag this.
  * Not done at the time, on purpose: no real transaction had been completed through Paddle's actual card form and Live keys had not been requested yet. **Both now done, see the next entry.**
* **Paddle flipped from Sandbox to Live (2026-08-02, same day as the Sandbox build above).** Johannes created the real product/price in Paddle's Live catalog ($7/week) and generated a Live client token, a Live API key (scoped to Subscriptions), and a Live webhook secret from a new Live notification destination, all pasted in chat and written straight into `.env.local` and Vercel (Production, all marked Sensitive) by Claude Code directly, no manual dashboard copy paste needed on the Vercel side. `PADDLE_ENVIRONMENT` and `NEXT_PUBLIC_PADDLE_ENVIRONMENT` both set to `production`. `lib/billing/paddle.ts`'s existing sandbox/live switch (built the same day, see above) needed no changes, it was already environment aware. **Verified against the real Live infrastructure, not assumed:** the Live API key was confirmed with `GET https://api.paddle.com/subscriptions` (200, empty list, the real production endpoint, not sandbox). Ran `vercel env add` for all six variables via the Vercel CLI (already authenticated, project already linked), then `vercel --prod` to deploy, confirmed `Aliased https://matchremote.io` in the output. After deploy, a webhook event was signed with the real Live `PADDLE_WEBHOOK_SECRET` and posted straight to `https://matchremote.io/api/webhooks/paddle` with `custom_data.app` deliberately set to a non-matchremote value, confirmed `200 {"received":true}`, proving signature verification works against the Live secret in production while the Finnely isolation guard kept it from touching any real data, zero cleanup needed. **matchremote.io now runs on Paddle Live: real checkouts create real subscriptions and charge real cards.** No real end user transaction has been completed yet (nobody has signed up and paid since the flip), only the plumbing is proven, same caveat as the Sandbox verification had.
* **`RESEND_API_KEY` configured, sign in and match emails now actually deliver (2026-08-02).** Resend domain verification set up for `matchremote.io` at one.com (SPF TXT on `send.matchremote.io`, MX on `send.matchremote.io`, DKIM TXT on `resend._domainkey.matchremote.io`, DMARC TXT on `_dmarc.matchremote.io`), verified via DNS lookup before touching Resend. Key added to `.env.local` and to Vercel (Production environment, marked Sensitive). **Verified live, not just assumed from the dashboard**, per the established pattern in this file: a direct call to the Resend API confirmed the key and domain work (returned a real message id), then `POST https://matchremote.io/api/auth/request-code` was called against production with Johannes's real email and returned `{"success":true}`, a real sign in code delivered to his inbox. One retry was needed, the first call right after the redeploy 502'd ("Could not send the code"), most likely the deployment and the env var save landed within the same minute and the first request hit before both were fully live; it resolved on its own within a couple of minutes with no other change.
* **Distribution automation, round 1: job feed syndication (2026-07-30).** Discussed with Johannes that SEO alone is unlikely to bring visitors within 6 months for a brand new domain with zero backlinks, and that some distribution needs to be automatable without risking a spam flag (ruled out autonomous Reddit/LinkedIn posting for that reason, see the conversation). Two feeds shipped as a first, low risk step:
  * **`app/jobs-feed.xml/route.ts`**: a generic job aggregator XML feed in the format Indeed's classic partner ingestion popularized and that Jooble/Careerjet also accept (`<source><job>title/date/referencenumber/url/company/city/country/description/jobtype/salary</job></source>`). Pulls from `getAllJobs(500)`, revalidates hourly. **This only builds the feed, it does not register it anywhere**, submitting `https://matchremote.io/jobs-feed.xml` through each aggregator's partner/publisher signup form is still a manual one time step Johannes needs to do per platform, no API exists for that part.
  * **`app/feed.xml/route.ts`**: a standard RSS 2.0 feed of the 50 newest active jobs, sorted by `posted_date`. Lower effort target than the aggregator feed, remote work newsletters and community bots commonly pull job listings from a feed like this. Linked from the homepage footer ("RSS") and declared in `app/layout.tsx`'s metadata `alternates.types` for feed reader autodiscovery.
  * Both verified locally: valid XML/RSS, real job data and links resolving to real `/jobs/[slug]` pages, hourly revalidation via the same `getAllJobs` the rest of the site already uses so the daily ingestion keeps both feeds current with zero extra maintenance.
* **Distribution automation, round 2: Bluesky posting bot (2026-07-30).** `scripts/post-jobs-to-bluesky.ts` (`npm run social:bluesky`, `--dry-run` supported) posts the newest active jobs never announced before to the matchremote Bluesky account, one line per job with a real link back to its `/jobs/[slug]` page, capped at 5 per run on purpose since a brand new account with no followers yet reads as spam if it posts a wall of jobs at once. `lib/db/migrations/005_bluesky_posts.sql` adds `jobs.posted_to_bluesky_at`, set only after a post actually succeeds (same "mark after success" pattern as `notified_at`/`seen_at`), so a failure leaves the job queued for the next run instead of silently skipping it forever. `lib/social/bluesky.ts` mirrors `lib/email/client.ts`'s convention: returns a clean "not configured" result rather than crashing when `BLUESKY_HANDLE`/`BLUESKY_APP_PASSWORD` are missing.
  * **Real, non-obvious bug hit and fixed while building this: `@atproto/api` is ESM-only and its dependency `multiformats@13` dropped its CommonJS build entirely, but this project's scripts run through the `tsx` CLI which compiles everything to CommonJS.** A plain top level `import` of `@atproto/api` crashed with `ERR_PACKAGE_PATH_NOT_EXPORTED: Package subpath './cid' is not defined`, confirmed by tracing it to tsx's own CJS-style path-alias resolver hook (triggered by this project's `tsconfig.json` `paths: {"@/*": ["./*"]}`) intercepting even bare package specifiers and refusing to see multiformats' ESM-only `"import"` export condition. Renaming the script to `.mts` did not fix it (tsx's resolver hook still intercepts it the same way). The actual fix: `lib/social/bluesky.ts` loads `@atproto/api` with a dynamic `await import(...)` instead of a static import, since a genuine dynamic `import()` call goes through Node's real ESM resolver even from a CommonJS file, which is the one path that correctly honors the package's conditions. Confirmed fixed by running the script directly (`npm run social:bluesky -- --dry-run`) and watching the error disappear.
  * **Verified end to end short of an actual post**, since there is no Bluesky account yet: typecheck clean, `npm run social:bluesky -- --dry-run` runs and correctly reports "BLUESKY_HANDLE or BLUESKY_APP_PASSWORD is not configured, nothing to do" with real credentials absent, and with dummy credentials substituted it correctly reaches the database query (confirmed separately, see below, that migration 005 is the reason it finds nothing yet, not a bug in the query).
  * Account creation and the recurring scheduled task were left for Johannes at the time this was written, **both done 2026-08-02, see the Bluesky "Working" entry above, do not re-flag.** Still outstanding: the actual partner registrations for the XML feed from round 1.
* **Quiz redesigned for a more confident, less "playful" feel and cut from 15 steps to 10 (2026-07-29).** Johannes felt the quiz read as childish (a 64px decorative emoji on every question, an emoji on every option card, cutesy copy like "Yes, show me my matches! ✨") and wanted it to feel more powerful, plus fewer "Continue" clicks. Changes in `app/quiz/page.tsx` and `app/globals.css`:
  * All decorative emoji removed (question header emoji, per option emoji, side card emoji). The selected state keeps a plain circular checkmark. `option-card` and `quiz-side-card` corner radius tightened (20px to 10px) and the hover lift removed, sharper and flatter rather than bouncy. Copy tightened, no exclamation marks ("See your matches" instead of "Yes, show me my matches! ✨").
  * **The separate `meetings` question was merged into `work_style`.** Both fed the matching engine independently (`async_need` and `meeting_tolerance` in `lib/utils/quizMapping.ts`) but measure the same underlying thing, so `mapMeetingTolerance` now derives its value from the same async/sync answer as `mapAsyncNeed`, one fewer screen, no lost signal.
  * **Real finding while doing this: `job_type`, `must_haves`, `management`, `growth`, `benefits_priority`, and `when` were being collected by the quiz UI but `lib/utils/quizMapping.ts` never read any of them, confirmed by grepping for `answers.<field>` outside the quiz page itself.** They were pure UI weight with zero effect on matching. Rather than delete all of them (Johannes may still want some for future filtering/personalization), five are now grouped three-per-screen as compact mini questions ("A couple quick ones", "What matters most") instead of one full screen each.
  * **`must_haves` ("What's non negotiable", 6 options) removed entirely (2026-07-29), on Johannes's explicit instruction.** It was already known to be dead weight for matching (see above), so the question is gone from the quiz, not just grouped. `when` (its former screen partner) is back to being its own standalone screen since it was the only field left there. Net effect versus the original 15: cutting `meetings` and `must_haves` entirely, plus grouping `job_type`/`management` and `growth`/`benefits_priority`, gets the visitor through in 10 screens instead of 15.
  * The old standalone final "Ready to see your matches?" confirmation screen (a single button, no real answer) is gone. The last real question's button now reads "See your matches" and submits directly.
  * Net result: 15 screens down to 10. Verified in the browser: grouped screens correctly require every sub question answered before the progress counter and Continue button unlock, dot navigation and the shadowed prev/next side cards still work, and the final screen submits correctly.
* **Quiz never arrives pre-answered (2026-07-29).** Johannes flagged an option showing pre-selected inside the quiz. Confirmed the only source was the intentional hero-search-to-quiz prefill (`?role=`/`?salary=` on the URL, built in an earlier session), verified nothing pre-selects on a bare `/quiz` load. Removed on his explicit instruction that no answer should ever be pre-marked, regardless of entry point: `app/quiz/page.tsx` no longer reads `useSearchParams` (dropped the `Suspense` wrapper it existed for), `HeroSearch.tsx`'s CTA now pushes to a plain `/quiz`, and the now-unused `matchRoleValue`/`isKnownSalaryValue` helpers were deleted from `lib/quiz-options.ts`. Verified with old-style `/quiz?role=engineering&salary=130000` links too, in case a stale bookmark or the old OG/share text still has them, still opens with zero options selected.
* **Stale listings now get retired, daily (2026-07-28).** Johannes asked whether jobs that can no longer be applied to are kept out of the daily runs. They were not: `scripts/ingest-jobs.ts` only ever set `is_active: true` and nothing anywhere set it false, so dead listings accumulated forever. Measured before fixing: **78 of 394 active jobs (20%) were not in that day's feeds** yet stayed live on the site.
  * **Feed absence is deliberately not treated as proof a job is gone.** RemoteOK's API returns its most recent 100 while we hold ~141 active RemoteOK jobs. Measured: the 68 sitting outside its feed had a **median age of 4 days and none older than 7**, so they are fresh jobs that fell out of a window which churns in a week, not dead ones. Retiring on feed absence would delete almost entirely live listings.
  * **Each source was probed with an invented job URL to see whether it signals removal at all.** Jobicy and RemoteOK answer 404, Arbeitnow and Remotive answer 410. So all four do remove pages and say so, and `LINK_CHECKABLE_SOURCES` covers all four. **Himalayas answers 403 to any request from us** and is excluded, which costs nothing because it hands us a real expiry date instead.
  * **RemoteOK is the one genuine blind spot, and it was measured with a control group.** Its pages for jobs inside and outside its feed were indistinguishable: both render the title and a live "Apply now" button. RemoteOK keeps job pages up permanently for SEO. For those ~141 jobs the age rule is realistically the only lever, and the honest fix if it ever matters is to down weight RemoteOK as a source rather than build more detection against data that does not exist.
  * **Himalayas publishes `expiryDate` on 100% of its jobs and we were ignoring it.** Now stored in `jobs.expires_at` (migration `004_job_expiry.sql`) and it takes precedence over the age heuristic in both retirement and `validThrough`. Real spread on live data: 19 to 60 days out, median 59, differing from our 40 day guess by up to 20 days **in both directions**, so this is materially more accurate than the fallback for roughly a quarter of the catalogue. `parseSourceExpiry` sanity checks the value (rejects milliseconds passed as seconds, zero, and anything over two years out) so a format change on their side cannot quietly expire the whole source.
  * **Age is the fallback for sources that publish no expiry.** `MAX_JOB_AGE_DAYS = 40`, chosen by Johannes. A job with no posting date is left alone rather than guessed into expiry, and a network timeout during a link check is never read as "gone", so the job gets another chance the next day.
  * Retirement is reversible: `is_active` goes false, the row stays.
  * **`validThrough` added to the JobPosting JSON-LD** on `app/jobs/[slug]/page.tsx`. Without it Google had no way to know when we consider a listing expired, and serving JobPosting markup for filled roles is exactly what earns a structured data penalty. Same family of problem as the non-job listings cleaned up earlier.
  * Verified across two real ingestion runs. First run (before the expiry column): **1 job retired by link check**, independently re-checked afterwards and it does return 404. Second run (after migration 004): 315 upserted, **110 link checked, 99 carrying a source expiry, 0 already expired sitting active, 0 absurd dates**, and a Himalayas job page confirmed publishing the source's own `2026-08-16` rather than the 40 day guess of `2026-09-06`. The daily `daily-job-ingestion` scheduled task picks all of this up with no change needed, its output now carries an extra "Freshness:" line.
* **Matching engine rebalanced so results actually differentiate (2026-07-28).** Johannes reported many matches landing on exactly 74% with identical reasons, and getting Brazil and Mexico listings after answering Europe. Measured against all 394 live jobs with that same profile: 394 jobs produced only **53 distinct scores, and just 7 across the entire top 20**. Causes found and fixed, all of them real defects rather than an inherent limit:
  * **Role matching was searching the whole description.** `skillsMatch` substring searched the user's role word anywhere in the body, so "partnering across marketing, product, engineering, and content" scored a **Senior SEO Manager a full 15 of 15 for someone seeking engineering work**, and it was the top result. 47 of its 92 engineering "matches" were roles the title does not support. Replaced with a graded, title driven score reusing `jobMatchesCategory` from `lib/utils/job-categories.ts`, which already existed for exactly this reason. A title naming the role twice ("Senior Backend Engineer") now beats one naming it once, which beats a description only mention, which beats a job clearly in another discipline. Every job in the top 10 is now genuinely an engineering role.
  * **Forty of the hundred points were effectively constant.** `asyncAlignment` gave exactly 12 of 20 to **365 of 394 jobs** and `scheduleFit` gave full marks to 336 of them. Weights are now `skillsMatch 25, locationFit 20, salaryMatch 20, experienceMatch 15, industryPreference 10, asyncAlignment 5, scheduleFit 5`. Async was cut rather than rebuilt because `lib/utils/async-score.ts` infers nearly the same value for every listing, so it is a tie level nudge, not a signal.
  * **Salary and industry are now continuous instead of tiered/binary**, since both have genuinely fine grained data.
  * **`timezoneFit` became `locationFit`, and covers eligibility before hours.** A listing naming countries is stating where it can hire, not expressing a timezone preference. New `deriveJobRegions` in `lib/utils/job-country.ts` reads countries first and falls back to the coarse ingested region. A job open to the user's own region scores 20, an unrestricted one 13, a merely adjacent region 6, a non adjacent one 1. Johannes chose strong down weighting over a hard filter, so those jobs rank far below but do not disappear. Result for the Europe profile: top 20 went from **americas 12 / europe 6** to **europe 13 / americas 5**. There were 59 European jobs being buried.
  * **Real bug found while doing this, and it was already live in production SEO data:** `deriveApplicantCountries` used naive substring matching, so **every job located in "Ukraine" claimed United Kingdom**, because "ukraine" contains "uk". That wrong country was going into the `applicantLocationRequirements` we publish to Google in JobPosting structured data, not just into on screen copy. Fixed with whole word matching (`(^|[^a-z])keyword([^a-z]|$)`, which also handles "u.s." and stops "Indiana" matching India). Verified against the live table: 4 affected rows, now correct.
  * **Explanations no longer repeat.** They were generated by walking a fixed list in a fixed order and emitting the first phrases over a threshold, so any two jobs strong on the same dimensions read word for word identically. Now dimensions are ranked by the share of their own weight the job earned, so a job carried by pay reads differently from one carried by location, and `getMatchExplanation` takes an optional context to name the actual country, pay and industry instead of generic phrasing.
  * **`diversifyTop` picks the free pair**, used by both `/api/matches` and `/dashboard`: no two openings from the same company, and no two showing the identical percentage, searched within a window of 8 so a genuinely worse match can never be promoted. Nothing is rescored.
  * **Two silent limits fixed**: quiz submit matched against `getAllJobs(200)`, an arbitrary 200 of 394 jobs, now effectively all of them; and `getAllUserMatches` re-sorted by score alone, discarding the freshness tiebreak and making the displayed order wobble between requests, now stably sorted by score, then posting date, then whether pay is published.
  * Verified end to end in the browser: top 20 distinct scores went 7 to 12, the two free cards came back at 86% and 82% from different companies, both European, with visibly different reason lists. **Existing stored matches keep their old scores**, the new algorithm only applies to quiz submissions from now on. There are no real users yet, only test guests, so no rescore was needed.
* **Paid product built end to end (2026-07-28): passwordless auth, a real paywall, one weekly plan, a dashboard, and the daily new match email.** This replaced the old magic link scaffolding, the $9/mo three tier pricing, and the frontend only soft paywall, all three of which are gone. Details:
  * **Auth, six digit code, no password ever.** `POST /api/auth/request-code` generates a six digit code, stores only a sha256 hash with a ten minute expiry, and rate limits to one code per email per sixty seconds. `verify-code` allows five wrong attempts before the code must be requested again, then starts a session: 32 random bytes, hashed before storage, in an `httpOnly` `SameSite=Lax` cookie called `mr_session`, thirty day expiry. Signing in merges the anonymous guest account (`guest-<uuid>@guest.matchremote.io`) into the real one via `mergeGuestIntoUser`, which reassigns quiz responses and matches and drops duplicates first, since `matches` has a `UNIQUE(user_id, job_id)`. No login is needed to take the quiz or see the two free matches, only to unlock more or set an email filter.
  * **The paywall is server side, not CSS.** `/api/matches` and `/dashboard` both strip company, title, salary and apply link from locked matches before the payload leaves the server, so opening dev tools or calling the endpoint directly reveals nothing. `FREE_MATCH_LIMIT` is 2. Each locked card still shows its real score plus a teaser built from the same scored dimensions (`getMatchTeaser`), so the lock is concrete rather than a blank tease.
  * **One plan, six dollars a week, recurring automatically.** No upgrade tier exists. `lib/billing/subscription.ts` holds the single access check, `isActive`, which deliberately still grants access to a `canceled` subscription until `current_period_end`, because they paid for that time. Cancelling is a visible button on `/account`, no support contact.
  * **Dashboard** (`/dashboard`, session gated, redirects to `/auth/login?next=/dashboard`): all matches, filter by score (all, 60, 75, 90) done in memory in `DashboardMatches.tsx` so switching never refetches, plus a summary line from `lib/utils/match-stats.ts`.
  * **Daily match email** (`npm run notify:matches`, `--dry-run` supported): for each user with access, sends the matches that clear their own threshold (default 60) and have never been emailed or already seen. Capped at ten per email, the rest lead the next send. `notified_at` is set only after a successful send, so a failure requeues rather than silently burning the matches. The closing summary line comes from the same `matchSummaryLine` the dashboard uses, so the two can never quote different numbers. **The scheduled task for this is deliberately NOT set up yet**, it sends real email to real people and Johannes should approve the cadence first.
  * **"Never the same job twice" is enforced by two columns, not by hoping.** `matches.seen_at` is set the moment a match is shown in full on `/results` or `/dashboard`, `matches.notified_at` the moment it is emailed. The notification query requires both to be null. So a match shown free is never emailed, and an emailed match never comes back around.
  * **Honest badges (del 9).** `getTimezoneBadge` returns null unless both the job and the user have a known region, and never claims a number of overlapping hours, because the data is three coarse buckets (`americas`/`europe`/`asia`) and around half of jobs have none. `lib/utils/salary-insight.ts` compares a job against the **median** of the user's other matches in the same role category, not the mean: caught during verification that a single 200k listing made four ordinary jobs read "20 percent below average", which is arithmetically true and useless. Needs at least three comparable peers with real salary and a gap of at least five percent, otherwise no badge at all. The badge says "typical", not "average", because a median is what it actually computes.
  * `components/MatchCard.tsx` is the one match card, shared by `/results` and `/dashboard`, extracted so the two pages cannot drift.
  * **Verified end to end against the real database (2026-07-28), after the migrations ran.** Full journey walked in the browser: hero prefill (`/quiz?role=engineering&salary=130000` opened with 2 of 15 already answered), quiz submit, `/results` (exactly 2 open, 18 locked). Confirmed by calling `/api/matches` directly that a locked card's payload contains only `id`, `locked`, `matchScore` and `teaser`, no company, salary or url, so the paywall is genuinely server side. Sign in: two wrong codes counted down correctly ("4 tries left", "3 tries left"), the right code created the session, and the `mr_session` cookie was confirmed invisible to JavaScript, so `httpOnly` really is set. The guest merge worked: guest row deleted, its 20 matches and 1 quiz response reassigned, `is_guest` false on the new account, and the 2 matches shown free were already carrying `seen_at`. Dashboard as a non paying user showed 2 open plus 18 locked; after inserting a test subscription it showed all 20 open with no upgrade banner. Filter counts were right (All 20, over 60 20, over 75 1, over 90 0) and switching was instant with no refetch. Badges behaved honestly under real data: 17 of 20 got a timezone badge (3 jobs have no region), only 2 of 20 got a salary badge (the rest lack salary or enough peers). Email: with everything seen, the dry run correctly sent nothing; after inserting one fresh 88% match it picked up exactly that one and nothing else, and raising the threshold to 90 correctly dropped it again. Account page showed the active subscription, next charge date and a visible cancel button. All test rows were deleted afterwards, database back to 6 users and 120 matches.
  * Note on the interaction between `seen_at` and the email: opening the dashboard marks every match currently shown as seen, so an engaged paying user will not be emailed about matches they already scrolled past. Only genuinely new matches (created later by the daily ingestion, `seen_at` and `notified_at` both null) trigger an email. This is intended, the email is for what you have not seen, not a digest of what you have.
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
