-- Moves billing from Paddle to Stripe (Paddle rejected the account: "job
-- boards" are explicitly prohibited under their Acceptable Use Policy).
-- The subscriptions table had zero rows at the time of this migration, so a
-- rename is safe, there is no data to migrate. Run once in the Supabase SQL
-- editor. Safe to re-run.

ALTER TABLE subscriptions RENAME COLUMN paddle_subscription_id TO stripe_subscription_id;
ALTER TABLE subscriptions RENAME COLUMN paddle_customer_id TO stripe_customer_id;
