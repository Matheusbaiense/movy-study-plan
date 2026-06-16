-- Add optional expiry to share tokens so links can be time-bounded.
-- NULL means never expires (current default behaviour preserved).
ALTER TABLE public.study_plans
  ADD COLUMN IF NOT EXISTS share_token_expires_at timestamptz DEFAULT NULL;

CREATE INDEX IF NOT EXISTS study_plans_share_token_expires_idx
  ON public.study_plans (share_token_expires_at)
  WHERE share_token IS NOT NULL;
