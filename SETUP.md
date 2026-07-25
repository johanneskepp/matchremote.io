# matchremote - Setup Guide

Welcome to matchremote! This guide will walk you through setting up the project locally and deploying it to Vercel.

## Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Stripe account (for premium features)
- Resend account (for emails)
- Vercel account (for deployment)

## Local Development Setup

### 1. Environment Configuration

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual API keys and URLs.

### 2. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to Settings → API to find your credentials
3. Copy the URL and anon key to your `.env.local`

#### Create Database Schema

1. Go to Supabase SQL Editor
2. Open and run the SQL from `lib/db/schema.sql`
3. This creates all tables with proper indexes and RLS policies

Alternatively, use the Supabase CLI:

```bash
npm install -g supabase
supabase link --project-ref your-project-id
supabase db push
```

### 3. Stripe Setup (Optional for MVP)

1. Create a Stripe account at https://stripe.com
2. Get your keys from the dashboard
3. Add to `.env.local`:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`

### 4. Resend Setup (Optional for MVP)

1. Sign up at https://resend.com
2. Get your API key
3. Add `RESEND_API_KEY` to `.env.local`

### 5. Run Locally

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
matchremote/
├── app/
│   ├── api/              # API routes
│   │   ├── quiz/submit   # Quiz submission endpoint
│   │   ├── matches       # Fetch user matches
│   │   └── jobs/         # Job-related endpoints
│   ├── quiz/             # Quiz page
│   ├── results/          # Results page
│   ├── pricing/          # Pricing page
│   ├── auth/             # Authentication pages
│   ├── jobs/             # Job detail pages
│   └── layout.tsx        # Root layout
├── components/           # Reusable components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── HeroSection.tsx
│   ├── QuizCard.tsx
│   └── JobCard.tsx
├── lib/
│   ├── db/
│   │   ├── supabase.ts   # Supabase client
│   │   ├── queries.ts    # DB functions
│   │   ├── types.ts      # TypeScript types
│   │   └── schema.sql    # Database schema
│   └── utils/
│       ├── matching.ts   # Matching algorithm
│       └── helpers.ts    # Utility functions
├── public/               # Static files
├── styles/               # Global styles
└── README.md
```

## Key Features

### 1. Quiz (MVP Critical)

- 15-question interactive quiz
- Saves responses to Supabase
- Triggers matching algorithm

**Location:** `/quiz`
**API:** `POST /api/quiz/submit`

### 2. Intelligent Matching

The matching algorithm scores jobs 0-100 based on:
- Async-friendliness (20 pts)
- Salary alignment (20 pts)
- Skills match (15 pts)
- Experience level (15 pts)
- Timezone fit (10 pts)
- Schedule flexibility (10 pts)
- Industry preference (10 pts)

**Location:** `lib/utils/matching.ts`

### 3. Job Display

Jobs are displayed with:
- Match score (color-coded)
- Key metrics (salary, timezone, type)
- Save functionality
- Direct links to job source

**Component:** `JobCard.tsx`

## Database Schema

### Users Table
- `id` (UUID primary key)
- `email` (text unique)
- `plan` (free | premium)
- `stripe_customer_id` (optional)

### Quiz Responses Table
Stores user preferences from the quiz

### Jobs Table
Stores job listings from various sources

### Matches Table
User → Job matches with calculated scores

### Saved Jobs Table
Jobs saved by users

### Email Logs Table
Tracks email history for analytics

## API Endpoints

### Quiz
- `POST /api/quiz/submit` - Submit quiz and calculate matches

### Matches
- `GET /api/matches` - Fetch user's matches

### Jobs
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/[id]` - Get single job
- `POST /api/jobs/save` - Save job

### Auth (MVP: Magic Links)
- `POST /api/auth/magic-link` - Send magic link
- `POST /api/auth/verify` - Verify magic link

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial matchremote commit"
git branch -M main
git remote add origin https://github.com/yourusername/matchremote.git
git push -u origin main
```

### 2. Deploy to Vercel

```bash
npm i -g vercel
vercel
```

Or connect via Vercel dashboard: https://vercel.com

### 3. Configure Environment Variables

In Vercel dashboard:
- Settings → Environment Variables
- Add all variables from `.env.local`

### 4. Set Custom Domain

- Settings → Domains
- Add your domain (e.g., matchremote.io)
- Follow DNS configuration instructions

## Running Database Migrations

After making schema changes:

```bash
# Export schema
supabase db pull

# Commit changes
git add migrations/
git commit -m "Add new schema"

# Deploy on production
vercel env pull
supabase link --project-ref production-id
supabase db push
```

## Monitoring & Debugging

### Supabase Console
- Monitor API calls in Real Time
- View database queries
- Check authentication logs
- Monitor storage

### Vercel Analytics
- Function metrics
- Performance monitoring
- Error tracking

### Console Logs

The app uses `console.log` with prefixes for easier debugging:
- `[API]` - API routes
- `[DB]` - Database operations
- `[Quiz]` - Quiz-related
- `[Matching]` - Matching algorithm
- `[Results]` - Results page

## Troubleshooting

### Quiz submit returns 404
- Ensure API route exists at `app/api/quiz/submit/route.ts`
- Check `next.config.ts` for any route conflicts

### Matches not showing
- Verify `getUserMatches` in queries.ts
- Check Supabase RLS policies allow user to read their matches
- Look at browser console for fetch errors

### Environment variables not loading
- Restart dev server: `npm run dev`
- Ensure `.env.local` is in root directory
- Verify variable names match exactly (case-sensitive)

## Next Steps for Production

1. **Authentication**
   - Implement Supabase Auth with magic links
   - Add OAuth (Google, GitHub)
   - Setup password recovery

2. **Email Alerts**
   - Implement with Resend
   - Create email templates
   - Setup scheduled jobs

3. **Job Scraping**
   - Implement Firecrawl integration
   - Setup daily job scraping
   - Deduplicate jobs

4. **Premium Features**
   - Implement Stripe checkout
   - Setup subscription management
   - Add feature gates

5. **Analytics**
   - Setup Vercel Analytics
   - Track user flow
   - Monitor matching quality

## Support

For questions or issues:
- Check Supabase documentation: https://supabase.com/docs
- Vercel deployment guide: https://vercel.com/docs
- Open an issue on GitHub

## License

MIT
