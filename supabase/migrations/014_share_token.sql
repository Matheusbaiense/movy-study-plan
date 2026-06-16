-- 014_share_token.sql
-- Adds share_token to study_plans for public proposal links (SPLIT 5).
-- Each proposal gets a unique UUID token that serves as the public access credential.
-- Access is server-side via service role; no anon RLS policy needed.

ALTER TABLE study_plans
  ADD COLUMN IF NOT EXISTS share_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE UNIQUE INDEX IF NOT EXISTS study_plans_share_token_idx
  ON study_plans (share_token);

COMMENT ON COLUMN study_plans.share_token IS
  'Opaque UUID used as the public shareable link token. Changing it invalidates the existing link.';
