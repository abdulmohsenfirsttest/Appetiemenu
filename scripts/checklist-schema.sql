-- ============================================================
-- Daily Branch Inspection Checklist
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================

CREATE TABLE IF NOT EXISTS branch_checklists (
  id            SERIAL PRIMARY KEY,
  branch        TEXT NOT NULL,
  check_date    DATE NOT NULL,
  shift         TEXT,                       -- optional: Morning / Night
  results       JSONB NOT NULL DEFAULT '{}',-- { itemKey: true|false }
  checked_count INT  NOT NULL DEFAULT 0,
  total_count   INT  NOT NULL DEFAULT 0,
  notes         TEXT,
  completed_by  TEXT,                        -- manager email
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checklist_branch ON branch_checklists(branch);
CREATE INDEX IF NOT EXISTS idx_checklist_date   ON branch_checklists(check_date);

GRANT ALL ON branch_checklists TO anon, service_role;
GRANT ALL ON SEQUENCE branch_checklists_id_seq TO anon, service_role;
