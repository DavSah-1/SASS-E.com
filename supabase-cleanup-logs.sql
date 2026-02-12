-- Create cleanup type enum
DO $$ BEGIN
  CREATE TYPE cleanup_type AS ENUM ('age_based', 'storage_based', 'manual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create cleanup status enum
DO $$ BEGIN
  CREATE TYPE cleanup_status AS ENUM ('success', 'partial', 'failed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create cleanup_logs table
CREATE TABLE IF NOT EXISTS cleanup_logs (
  id SERIAL PRIMARY KEY,
  cleanup_type cleanup_type NOT NULL,
  files_deleted INTEGER DEFAULT 0 NOT NULL,
  space_freed_mb TEXT DEFAULT '0.00' NOT NULL,
  errors JSONB,
  triggered_by TEXT,
  status cleanup_status NOT NULL,
  execution_time_ms INTEGER,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Create index on created_at for efficient querying
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_created_at ON cleanup_logs(created_at DESC);

-- Create index on triggered_by for user-specific queries
CREATE INDEX IF NOT EXISTS idx_cleanup_logs_triggered_by ON cleanup_logs(triggered_by);

-- Enable RLS
ALTER TABLE cleanup_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can read cleanup logs
CREATE POLICY "Admin users can read all cleanup logs"
  ON cleanup_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- RLS Policy: Only admins can insert cleanup logs
CREATE POLICY "Admin users can insert cleanup logs"
  ON cleanup_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Grant permissions
GRANT SELECT, INSERT ON cleanup_logs TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE cleanup_logs_id_seq TO authenticated;
