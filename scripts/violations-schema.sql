-- ============================================================
-- Employee Violation Management + Branch Evaluation
-- Run this ONCE in the Supabase SQL Editor.
-- ============================================================

-- Violations logged by managers against employees, each with a SAR deduction
CREATE TABLE IF NOT EXISTS violations (
  id            SERIAL PRIMARY KEY,
  employee_id   INT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  employee_name TEXT,                       -- denormalized for safe reporting
  branch        TEXT,
  violation     TEXT NOT NULL,              -- free-text description
  comment       TEXT,                       -- manager's detailed comment
  deduction_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  period        TEXT NOT NULL,              -- 'YYYY-MM' month the deduction applies to
  logged_by     TEXT,                       -- manager email
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_violations_employee ON violations(employee_id);
CREATE INDEX IF NOT EXISTS idx_violations_period   ON violations(period);
CREATE INDEX IF NOT EXISTS idx_violations_branch   ON violations(branch);

-- Branch performance evaluations by managers (1-5 rating + comment)
CREATE TABLE IF NOT EXISTS branch_evaluations (
  id           SERIAL PRIMARY KEY,
  branch       TEXT NOT NULL,
  rating       INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment      TEXT,
  period       TEXT NOT NULL,               -- 'YYYY-MM'
  evaluated_by TEXT,                         -- manager email
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_branch_eval_period ON branch_evaluations(period);
CREATE INDEX IF NOT EXISTS idx_branch_eval_branch ON branch_evaluations(branch);

-- Match the permission model used by the rest of the app (anon key reads/writes)
GRANT ALL ON violations, branch_evaluations TO anon, service_role;
GRANT ALL ON SEQUENCE violations_id_seq, branch_evaluations_id_seq TO anon, service_role;
