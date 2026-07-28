-- Tracks what the user has already been shown, so a match is never emailed
-- twice and never emailed after they already saw it for free. Run once in the
-- Supabase SQL editor. Safe to re-run.

-- Set when the match was included in a notification email.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;

-- Set when the user actually saw the match in the results page or dashboard.
ALTER TABLE matches ADD COLUMN IF NOT EXISTS seen_at TIMESTAMPTZ;

-- The daily notification job filters on exactly these two being null.
CREATE INDEX IF NOT EXISTS idx_matches_unnotified
  ON matches (user_id, match_score DESC)
  WHERE notified_at IS NULL AND seen_at IS NULL;
