-- Performance indexes for common query patterns

-- HR: joining time_entries on invoice_id (N+1 risk in invoice detail views)
CREATE INDEX IF NOT EXISTS time_entries_invoice_idx
  ON time_entries (invoice_id)
  WHERE invoice_id IS NOT NULL;

-- CRM/Timeline: filtering proposal_events by contact
CREATE INDEX IF NOT EXISTS proposal_events_contact_idx
  ON proposal_events (contact_id)
  WHERE contact_id IS NOT NULL;

-- CRM/Timeline: filtering proposal_events by actor (audit trail queries)
CREATE INDEX IF NOT EXISTS proposal_events_actor_idx
  ON proposal_events (actor_id);

-- Portfolio: filtering courses by campus
CREATE INDEX IF NOT EXISTS courses_campus_idx
  ON courses (campus_id)
  WHERE campus_id IS NOT NULL;
