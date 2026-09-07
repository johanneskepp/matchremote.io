-- Stores a source's own structured country restriction list, when it gives
-- one, instead of only the flattened free text location string. Currently
-- only Himalayas provides this (locationRestrictions), every other source
-- has free text only. Run once in the Supabase SQL editor. Safe to re-run.

ALTER TABLE jobs ADD COLUMN IF NOT EXISTS applicant_countries TEXT[];
