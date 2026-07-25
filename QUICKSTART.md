# matchremote - Quick Start Guide

Get up and running with matchremote in 5 minutes.

## Prerequisites

- Node.js 18+
- Supabase account (free at https://supabase.com)
- Code editor (VS Code recommended)

## Step 1: Clone & Setup (1 min)

```bash
cd /home/claude/matchremote
cp .env.example .env.local
```

## Step 2: Get Supabase Credentials (2 min)

1. Go to https://supabase.com
2. Create a new project
3. Go to Settings → API
4. Copy these values to `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL` (Project URL)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (anon public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role secret)

## Step 3: Setup Database (1 min)

1. In Supabase, go to SQL Editor
2. Create new query
3. Copy-paste contents of `lib/db/schema.sql`
4. Run the query
5. ✅ Database tables created!

## Step 4: Run Locally (1 min)

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## Test the Flow

1. Click "Take Quiz" or "Start the Quiz"
2. Answer all 15 questions
3. Click "See Results"
4. View your top 20 matched jobs
5. ✅ Success!

## Environment Variables

Your `.env.local` should look like:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Common Issues

### Port 3000 already in use
```bash
# Run on different port
npm run dev -- -p 3001
```

### Supabase connection fails
- Verify URL format: `https://xxxx.supabase.co`
- Check anon key isn't truncated
- Ensure `.env.local` exists in root directory

### Database schema doesn't run
- Ensure all SQL is selected and copied
- Check for truncated SQL in Supabase editor
- Run query one more time

### Quiz submits but no results
- Check browser console for errors
- Verify Supabase credentials are correct
- Check Supabase logs for connection errors

## Next Steps

✅ **You're ready to:**
- Customize the quiz questions
- Add real jobs to database
- Add authentication (Phase 2)
- Deploy to Vercel

📚 **Read more:**
- [Full Setup Guide](SETUP.md)
- [Project Summary](PROJECT_SUMMARY.md)
- [Deployment Checklist](DEPLOYMENT_CHECKLIST.md)

## Deployment

Ready to go live? See [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

```bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Deploy to Vercel
vercel

# 3. Add environment variables in Vercel dashboard
# 4. Set custom domain

# Done! 🚀
```

## Database Troubleshooting

### Reset database (careful!)

```sql
-- Drop all tables
DROP TABLE IF EXISTS email_alerts CASCADE;
DROP TABLE IF EXISTS email_logs CASCADE;
DROP TABLE IF EXISTS saved_jobs CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;
DROP TABLE IF EXISTS quiz_responses CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Then re-run schema.sql
```

## Files You'll Edit

### For Custom Quiz
- `app/quiz/page.tsx` - Questions and flow

### For Custom Styling
- `app/globals.css` - Global styles
- `components/` - Component styles

### For Matching Algorithm
- `lib/utils/matching.ts` - Scoring logic

### For Database
- `lib/db/queries.ts` - Database operations
- `lib/db/schema.sql` - Table definitions

## Project Structure

```
matchremote/
├── app/           # Pages (landing, quiz, results, etc)
├── components/    # React components
├── lib/
│   ├── db/       # Database code
│   └── utils/    # Utilities & matching
├── public/        # Static files
└── styles/        # Global CSS
```

## Key Files

| File | Purpose |
|------|---------|
| `app/page.tsx` | Landing page |
| `app/quiz/page.tsx` | Quiz page (15 questions) |
| `app/results/page.tsx` | Results with matches |
| `lib/utils/matching.ts` | Matching algorithm |
| `lib/db/schema.sql` | Database schema |

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Run production server
npm run lint             # Run ESLint

# Database
# None needed! Just use Supabase dashboard
```

## Need Help?

1. Check [SETUP.md](SETUP.md) for detailed guide
2. Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture
3. Search [Supabase Docs](https://supabase.com/docs)
4. Check [Next.js Docs](https://nextjs.org/docs)

---

**You're all set!** 🎉

Start with `npm run dev` and visit http://localhost:3000
