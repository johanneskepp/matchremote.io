-- Tracks which jobs have already been posted to the Mastodon distribution bot,
-- so a job is only ever announced once no matter how many times the script
-- runs. Run once in the Supabase SQL editor. Safe to re-run.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS posted_to_mastodon_at TIMESTAMPTZ;

-- The distribution script looks up active jobs that have never been posted.
CREATE INDEX IF NOT EXISTS idx_jobs_posted_to_mastodon_at
  ON jobs (posted_to_mastodon_at)
  WHERE is_active = true AND posted_to_mastodon_at IS NULL;
