# matchremote.io

AI-powered remote job matching platform. Users take a 15 question quiz and get personalized job matches.

## Founder & Vision

**Founder:** Johannes Kepp, 36
**Email:** johanneskepp@gmail.com
**GitHub:** johanneskepp

**Vision:** Build a service that generates revenue within 6 months. Heavy focus on SEO from day one. Organic growth is a primary channel, not an afterthought.

**Payment provider:** Paddle (planned)
**Domain:** matchremote.io (to be purchased)

## Writing Style Rules

**Never use em dashes (—) or en dashes (–). Avoid regular hyphens (-) wherever possible.**

Use commas, periods, colons, or parentheses instead. If two ideas need connecting, use a comma or start a new sentence. This applies to all copy, code comments, commit messages, and communication.

Bad: "Great UX, big buttons, fast loading."
Good: "Great UX with big buttons and fast loading."

Bad: "matchremote is a job board — for remote workers."
Good: "matchremote is a job board for remote workers."

## Live URLs
* Production: https://matchremote-io.vercel.app
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

### Working

* Landing page (Duolingo style design, but needs to be more compact. Too much vertical scroll currently.)
* Quiz with 15 questions, big clickable cards (needs redesign per Quiz UX spec)
* Results page with 6 mock jobs (uses localStorage from quiz)
* Pricing page (3 tiers)
* Deployed on Vercel

### Not yet built

* Real job matching (needs Supabase schema plus seed data)
* Quiz redesign per new spec (shadowed prev and next questions, multi select everywhere)
* SEO fundamentals (sitemap, robots.txt, structured data, meta tags per page)
* Auth flow (magic link login)
* Saved jobs
* Email alerts (Resend integration exists in package.json but not wired)
* Paddle payment integration
* Job scraping (Firecrawl dependency added, not implemented)

### Known issues

* Framework Preset in Vercel Production Overrides shows "Other". Project Settings correctly say "Next.js" but existing production overrides can't be reset from UI. Doesn't affect builds anymore.
* Landing page is too long vertically. Needs restructuring per the no long pages principle.

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

## User Preferences

* Speaks Swedish primarily, some English. Respond in Swedish unless code.
* Prefers step by step guidance when doing manual setup.
* Uses Windows and PowerShell locally.
* Uses Claude Code for direct file editing plus git push. No ZIP handoff needed.
