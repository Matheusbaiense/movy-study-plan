-- Add org_id to audit_logs for per-tenant audit filtering and RLS
ALTER TABLE audit_logs
  ADD COLUMN IF NOT EXISTS org_id uuid REFERENCES organizations (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS audit_logs_org_idx ON audit_logs (org_id)
  WHERE org_id IS NOT NULL;
