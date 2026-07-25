# Deployment Checklist - matchremote

Complete this checklist before deploying to production.

## Pre-Deployment (Local)

### Code Quality
- [ ] Run `npm run build` and verify no errors
- [ ] Run TypeScript: `npx tsc --noEmit`
- [ ] All console.log prefixes are consistent
- [ ] No hardcoded API keys in code
- [ ] All TODO comments are addressed

### Environment & Secrets
- [ ] `.env.example` updated with all required variables
- [ ] `.env.local` has all real values
- [ ] `.env.local` is in `.gitignore` (should be)
- [ ] No sensitive data in version control
- [ ] All API keys are valid and active

### Testing
- [ ] Landing page loads without errors
- [ ] Quiz questions display correctly
- [ ] All 15 questions have proper validation
- [ ] Quiz submission works end-to-end
- [ ] Results page displays top 20 matches
- [ ] Job cards render with all data
- [ ] Mobile responsiveness tested
- [ ] All links work (internal and external)

### Database
- [ ] Supabase project created
- [ ] Schema SQL executed successfully
- [ ] All tables exist with proper indexes
- [ ] RLS policies configured correctly
- [ ] Test user created (if needed)

### API Routes
- [ ] `POST /api/quiz/submit` tested
- [ ] `GET /api/matches` tested
- [ ] All endpoints return proper JSON
- [ ] Error handling works correctly
- [ ] Console logs show on execution

## Vercel Deployment

### Repository Setup
- [ ] Code pushed to GitHub (main branch)
- [ ] GitHub repo is public/accessible
- [ ] Branch protection rules added
- [ ] `.gitignore` contains `.env.local`

### Vercel Configuration
- [ ] Vercel account created
- [ ] Project connected to GitHub repo
- [ ] Framework detected as Next.js
- [ ] Build command: `npm run build`
- [ ] Output directory: `.next`

### Environment Variables
- [ ] All variables added to Vercel
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL` (Vercel URL)
  - [ ] Optional: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] Optional: `STRIPE_SECRET_KEY`
  - [ ] Optional: `RESEND_API_KEY`
  - [ ] Optional: `FIRECRAWL_API_KEY`
- [ ] Variables are same as local (except APP_URL)
- [ ] No typos in variable names

### First Deployment
- [ ] Initial build succeeds
- [ ] Deployment completes without errors
- [ ] Preview URL is accessible
- [ ] Landing page loads correctly
- [ ] Quiz page works in preview
- [ ] Database queries work from Vercel
- [ ] No console errors in browser

### Performance
- [ ] Page load time is acceptable
- [ ] Lighthouse score checked
- [ ] Images optimized
- [ ] CSS minified
- [ ] JavaScript bundled efficiently

## Custom Domain

### Domain Configuration
- [ ] Domain registered (or transfer prepared)
- [ ] Domain verified in Vercel
- [ ] DNS records added:
  - [ ] CNAME to vercel.com
  - [ ] Or A records to Vercel IPs
- [ ] SSL certificate generated
- [ ] HTTPS redirect configured
- [ ] Domain working (https://matchremote.io)

### Verification
- [ ] Visit domain in browser
- [ ] All resources load (no mixed content)
- [ ] Quiz works end-to-end
- [ ] Database operations work
- [ ] No redirect loops

## Post-Deployment Monitoring

### First 24 Hours
- [ ] Monitor Vercel error logs
- [ ] Check Supabase logs for queries
- [ ] Monitor database performance
- [ ] Check email deliverability (if enabled)
- [ ] Set up error alerts

### Ongoing
- [ ] Setup Vercel Analytics
- [ ] Monitor API response times
- [ ] Setup Supabase alerts
- [ ] Create error tracking (Sentry optional)
- [ ] Monitor resource usage

## Optional Features (Phase 2+)

### Email
- [ ] Resend account configured
- [ ] Email templates created
- [ ] Unsubscribe handled
- [ ] SPF/DKIM records added

### Payments (Stripe)
- [ ] Stripe test mode working
- [ ] Stripe prod keys configured
- [ ] Webhook endpoints created
- [ ] Error handling for payment failures

### Job Scraping (Firecrawl)
- [ ] Firecrawl API key valid
- [ ] Test job scraping works
- [ ] Duplicate detection working
- [ ] Scheduled scraping setup

## Security Checklist

- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using parameterized queries)
- [ ] XSS protection via React/Tailwind
- [ ] CSRF tokens for forms (if applicable)
- [ ] Secrets never exposed in logs
- [ ] RLS policies enforced
- [ ] Headers security (Content-Security-Policy)

## Rollback Plan

- [ ] Previous version deployable
- [ ] Database backup strategy
- [ ] Rollback procedure documented
- [ ] DNS rollback plan
- [ ] Team knows how to execute rollback

## Launch Preparation

### Marketing
- [ ] Launch announcement written
- [ ] Social media posts scheduled
- [ ] Email list prepared (if any)
- [ ] Product Hunt post planned (optional)

### Support
- [ ] Support email setup
- [ ] FAQ page updated
- [ ] Error messaging user-friendly
- [ ] Support process documented

### Documentation
- [ ] README updated with live URL
- [ ] SETUP.md reviewed and accurate
- [ ] API docs updated
- [ ] Deployment guide complete

## Sign-Off

- [ ] Product Owner: Approved
- [ ] Tech Lead: Reviewed
- [ ] QA: Tested
- [ ] DevOps: Infrastructure ready
- [ ] CEO/Founder: Go ahead

**Deployment Date**: _______________
**Deployed By**: _______________
**Status**: ☐ Ready ☐ Approved ☐ Deployed

---

## Quick Rollback Commands

```bash
# Vercel Rollback
vercel rollback

# Database Rollback
supabase db reset --version=<previous-version>

# DNS Rollback
# Update DNS records back to previous provider
```

## Post-Launch Monitoring

Monitor these metrics:
- API response times
- Database query performance
- Error rates
- User conversion (quiz → results)
- Page load times
- Stripe payment success rate (if enabled)
- Email delivery rate (if enabled)

Set alerts if:
- Error rate > 1%
- API response time > 2 seconds
- Database connection errors
- Vercel deployment failures
