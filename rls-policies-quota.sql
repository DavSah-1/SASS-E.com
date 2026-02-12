-- RLS Policies for quota_usage table
-- Users can only read/write their own quota records

-- Enable RLS on quota_usage table
ALTER TABLE quota_usage ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own quota usage
CREATE POLICY user_view_own_quota ON quota_usage
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Users can insert only their own quota records
CREATE POLICY user_insert_own_quota ON quota_usage
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy: Users can update only their own quota records
CREATE POLICY user_update_own_quota ON quota_usage
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Users cannot delete quota records (admin-only via service key)
-- No DELETE policy means users cannot delete, but service key can

-- Note: Admin users with service key bypass RLS entirely
