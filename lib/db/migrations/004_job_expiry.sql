-- Source stated expiry for a job listing, when the source actually tells us.
-- Run once in the Supabase SQL editor. Safe to re-run.

-- Himalayas returns an expiryDate on every job in its API, which beats any
-- guess we could make from the posting date. Null for the other four sources,
-- which do not publish one, and those fall back to MAX_JOB_AGE_DAYS in
-- lib/utils/job-freshness.ts.
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;

-- The daily freshness pass looks up active jobs that are already past their
-- stated expiry.
CREATE INDEX IF NOT EXISTS idx_jobs_expires_at
  ON jobs (expires_at)
  WHERE is_active = true AND expires_at IS NOT NULL;
