-- Weekly subscription state, mirrored from Paddle webhooks. Run once in the
-- Supabase SQL editor. Safe to re-run.

CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  paddle_subscription_id TEXT UNIQUE,
  paddle_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'paused', 'canceled', 'past_due', 'trialing')),
  current_period_end TIMESTAMPTZ,
  -- Set when the user cancels: they keep access until current_period_end.
  cancel_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions (status);

-- Only ever written by the Paddle webhook through the service role.
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Which matches each paying user wants emailed. Default matches
-- DEFAULT_ALERT_THRESHOLD in lib/plan.ts.
ALTER TABLE email_alerts ADD COLUMN IF NOT EXISTS threshold INTEGER NOT NULL DEFAULT 60;

-- One alert setting per user, which is also what the upsert in
-- saveAlertSettings conflicts on.
CREATE UNIQUE INDEX IF NOT EXISTS idx_email_alerts_user ON email_alerts (user_id);
