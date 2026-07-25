# matchremote - AI-Powered Remote Job Matching

Find your perfect remote job in minutes. We match you with opportunities based on your timezone, async needs, skills, and preferences using intelligent AI-powered scoring.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## ✨ Features

- **AI-Powered Matching** - Smart algorithm scores 1000s of jobs against your profile
- **Async-Aware** - Finds jobs that match your timezone and async work needs
- **Skill-Based** - Matches based on your technical skills and experience
- **Quick Quiz** - 15-question quiz takes ~5 minutes
- **Save & Track** - Save favorite jobs and get email alerts
- **Mobile-First** - Fully responsive design

## 📋 MVP Scope

### Phase 1: Core (Weeks 1-2) ✅
- [x] Landing page with hero
- [x] 15-question quiz
- [x] Matching algorithm
- [x] Results display with top 20 matches
- [x] Job card component
- [x] Header & footer
- [x] Database schema

### Phase 2: Auth & Polish (Weeks 3-4)
- [ ] Magic link authentication
- [ ] User dashboard
- [ ] Save jobs functionality
- [ ] Email alerts with Resend
- [ ] Basic analytics

### Phase 3: Monetization (Weeks 5-6)
- [ ] Stripe payment integration
- [ ] Premium tier features
- [ ] Subscription management
- [ ] Feature gates

### Phase 4: Scale (Weeks 7+)
- [ ] Job scraping with Firecrawl
- [ ] Multi-source job ingestion
- [ ] Performance optimization
- [ ] Admin dashboard

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Magic Links)
- **Payments**: Stripe
- **Email**: Resend
- **Job Scraping**: Firecrawl
- **Deployment**: Vercel

## 📊 Matching Algorithm

Jobs are scored 0-100 based on:

| Factor | Weight | Details |
|--------|--------|---------|
| Async Score | 20% | How async-friendly is the role |
| Salary | 20% | Does salary match expectations |
| Skills | 15% | Do your skills align |
| Experience | 15% | Right level for your experience |
| Timezone | 10% | Timezone compatibility |
| Schedule | 10% | Work schedule flexibility |
| Industry | 10% | Industry preference match |

## 📁 Project Structure

```
matchremote/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── quiz/              # Quiz page
│   ├── results/           # Results display
│   ├── pricing/           # Pricing page
│   ├── auth/              # Auth pages
│   └── jobs/              # Job detail pages
├── components/            # Reusable React components
├── lib/
│   ├── db/               # Database utilities
│   │   ├── supabase.ts   # Client setup
│   │   ├── queries.ts    # DB functions
│   │   ├── types.ts      # TypeScript types
│   │   └── schema.sql    # Database schema
│   └── utils/            # Helper functions
│       ├── matching.ts   # Matching algorithm
│       └── helpers.ts    # Utilities
├── public/               # Static assets
└── styles/              # Global CSS
```

## 🗄 Database

### Core Tables
- `users` - User accounts
- `quiz_responses` - Quiz answers for matching
- `jobs` - Job listings
- `matches` - User-job matches with scores
- `saved_jobs` - Bookmarked jobs
- `email_logs` - Email tracking
- `email_alerts` - Alert subscriptions

[Full schema](lib/db/schema.sql)

## 🔌 API Endpoints

### Quiz
```
POST /api/quiz/submit
{
  timezone: string
  asyncNeed: 1-10
  salaryMin: number
  salaryMax: number
  skills: string[]
  ...
}
```

### Matches
```
GET /api/matches?userId=xxx
Returns: { matches: [], total: number }
```

### Jobs
```
GET /api/jobs
GET /api/jobs/:id
POST /api/jobs/save
```

## 🚢 Deployment

### One-Click Vercel Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/matchremote)

### Manual Deployment

```bash
# Push to GitHub
git push origin main

# Deploy to Vercel
vercel

# Add environment variables in Vercel dashboard
# Configure custom domain
```

See [SETUP.md](SETUP.md) for detailed instructions.

## 🔑 Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Optional:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `FIRECRAWL_API_KEY`

See [.env.example](.env.example) for all options.

## 📈 Monitoring

- **Supabase Dashboard** - Database, auth, storage
- **Vercel Analytics** - Performance, errors
- **Stripe Dashboard** - Payments, subscriptions
- **Console Logs** - Prefixed with `[API]`, `[DB]`, etc.

## 🤝 Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🎯 Roadmap

- [ ] Week 1-2: Core MVP
- [ ] Week 3-4: Auth & UX polish
- [ ] Week 5-6: Monetization
- [ ] Week 7+: Scale & optimize

## 💬 Support

- **Issues**: GitHub Issues
- **Docs**: [SETUP.md](SETUP.md)
- **Email**: support@matchremote.io

---

**Status**: MVP in development

**Last Updated**: July 2026

**Live Demo**: Coming soon
