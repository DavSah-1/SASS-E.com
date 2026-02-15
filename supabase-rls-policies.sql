-- ============================================================================
-- Supabase Row Level Security (RLS) Policies
-- ============================================================================
-- This file defines RLS policies for user data isolation in Supabase (PostgreSQL)
-- Execute these statements in Supabase SQL Editor
--
-- Modules covered:
-- 1. Sharing (shared_budgets, shared_budget_members, shared_budget_categories, shared_budget_transactions, shared_budget_activity)
-- 2. Wearable (wearable_connections, wearable_sync_logs, wearable_data_cache)
-- 3. Alerts (budget_alerts)
-- 4. Recurring (recurring_transactions)
--
-- Note: Insights and Receipts modules don't have dedicated tables
-- ============================================================================

-- ============================================================================
-- 1. SHARING MODULE - Shared Budget Tables
-- ============================================================================

-- Enable RLS on shared_budgets
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view shared budgets they own or are members of
CREATE POLICY "Users can view their shared budgets"
ON shared_budgets FOR SELECT
USING (
  owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  OR id IN (
    SELECT shared_budget_id 
    FROM shared_budget_members 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: Users can create shared budgets
CREATE POLICY "Users can create shared budgets"
ON shared_budgets FOR INSERT
WITH CHECK (
  owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Only owners can update shared budgets
CREATE POLICY "Owners can update their shared budgets"
ON shared_budgets FOR UPDATE
USING (
  owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Only owners can delete shared budgets
CREATE POLICY "Owners can delete their shared budgets"
ON shared_budgets FOR DELETE
USING (
  owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- Enable RLS on shared_budget_members
ALTER TABLE shared_budget_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view members of budgets they have access to
CREATE POLICY "Users can view shared budget members"
ON shared_budget_members FOR SELECT
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
  OR user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Budget owners can add members
CREATE POLICY "Budget owners can add members"
ON shared_budget_members FOR INSERT
WITH CHECK (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: Budget owners can update member permissions
CREATE POLICY "Budget owners can update members"
ON shared_budget_members FOR UPDATE
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: Budget owners and members themselves can remove membership
CREATE POLICY "Budget owners and members can remove membership"
ON shared_budget_members FOR DELETE
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
  OR user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- Enable RLS on shared_budget_categories
ALTER TABLE shared_budget_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view categories of budgets they have access to
CREATE POLICY "Users can view shared budget categories"
ON shared_budget_categories FOR SELECT
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
      OR id IN (
        SELECT shared_budget_id 
        FROM shared_budget_members 
        WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      )
  )
);

-- Policy: Budget members with edit permission can create categories
CREATE POLICY "Budget members can create categories"
ON shared_budget_categories FOR INSERT
WITH CHECK (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
  OR shared_budget_id IN (
    SELECT shared_budget_id 
    FROM shared_budget_members 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      AND role IN ('editor', 'admin')
  )
);

-- Policy: Budget members with edit permission can update categories
CREATE POLICY "Budget members can update categories"
ON shared_budget_categories FOR UPDATE
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
  OR shared_budget_id IN (
    SELECT shared_budget_id 
    FROM shared_budget_members 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      AND role IN ('editor', 'admin')
  )
);

-- Policy: Only budget owners can delete categories
CREATE POLICY "Budget owners can delete categories"
ON shared_budget_categories FOR DELETE
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- ============================================================================
-- Enable RLS on shared_budget_transactions
ALTER TABLE shared_budget_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view transactions of budgets they have access to
CREATE POLICY "Users can view shared budget transactions"
ON shared_budget_transactions FOR SELECT
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
      OR id IN (
        SELECT shared_budget_id 
        FROM shared_budget_members 
        WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      )
  )
);

-- Policy: Budget members with edit permission can create transactions
CREATE POLICY "Budget members can create transactions"
ON shared_budget_transactions FOR INSERT
WITH CHECK (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
  OR shared_budget_id IN (
    SELECT shared_budget_id 
    FROM shared_budget_members 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      AND role IN ('editor', 'admin')
  )
);

-- Policy: Users can update their own transactions or if they have edit permission
CREATE POLICY "Users can update shared budget transactions"
ON shared_budget_transactions FOR UPDATE
USING (
  added_by = (SELECT id FROM users WHERE open_id = auth.uid())
  OR shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
  OR shared_budget_id IN (
    SELECT shared_budget_id 
    FROM shared_budget_members 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      AND role IN ('editor', 'admin')
  )
);

-- Policy: Users can delete their own transactions or budget owners can delete any
CREATE POLICY "Users can delete shared budget transactions"
ON shared_budget_transactions FOR DELETE
USING (
  added_by = (SELECT id FROM users WHERE open_id = auth.uid())
  OR shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- ============================================================================
-- Enable RLS on shared_budget_activity
ALTER TABLE shared_budget_activity ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view activity of budgets they have access to
CREATE POLICY "Users can view shared budget activity"
ON shared_budget_activity FOR SELECT
USING (
  shared_budget_id IN (
    SELECT id FROM shared_budgets 
    WHERE owner_id = (SELECT id FROM users WHERE open_id = auth.uid())
      OR id IN (
        SELECT shared_budget_id 
        FROM shared_budget_members 
        WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
      )
  )
);

-- Policy: Activity logs are created automatically (no INSERT policy needed for users)
-- Policy: Activity logs cannot be updated or deleted by users (audit trail)

-- ============================================================================
-- 2. WEARABLE MODULE - Wearable Device Integration
-- ============================================================================

-- Enable RLS on wearable_connections
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own wearable connections
CREATE POLICY "Users can view their own wearable connections"
ON wearable_connections FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can create their own wearable connections
CREATE POLICY "Users can create their own wearable connections"
ON wearable_connections FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can update their own wearable connections
CREATE POLICY "Users can update their own wearable connections"
ON wearable_connections FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can delete their own wearable connections
CREATE POLICY "Users can delete their own wearable connections"
ON wearable_connections FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- Enable RLS on wearable_sync_logs
ALTER TABLE wearable_sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view sync logs for their own connections
CREATE POLICY "Users can view their own wearable sync logs"
ON wearable_sync_logs FOR SELECT
USING (
  connection_id IN (
    SELECT id FROM wearable_connections 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: System creates sync logs (users don't need INSERT permission)
-- Policy: Sync logs cannot be updated or deleted by users (audit trail)

-- ============================================================================
-- Enable RLS on wearable_data_cache
ALTER TABLE wearable_data_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view cached data for their own connections
CREATE POLICY "Users can view their own wearable data cache"
ON wearable_data_cache FOR SELECT
USING (
  connection_id IN (
    SELECT id FROM wearable_connections 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: System manages cache (users don't need write permissions)

-- ============================================================================
-- 3. ALERTS MODULE - Budget Alerts
-- ============================================================================

-- Enable RLS on budget_alerts
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own budget alerts
CREATE POLICY "Users can view their own budget alerts"
ON budget_alerts FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can create their own budget alerts
CREATE POLICY "Users can create their own budget alerts"
ON budget_alerts FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can update their own budget alerts (e.g., mark as read)
CREATE POLICY "Users can update their own budget alerts"
ON budget_alerts FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can delete their own budget alerts
CREATE POLICY "Users can delete their own budget alerts"
ON budget_alerts FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- 4. RECURRING MODULE - Recurring Transactions
-- ============================================================================

-- Enable RLS on recurring_transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own recurring transactions
CREATE POLICY "Users can view their own recurring transactions"
ON recurring_transactions FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can create their own recurring transactions
CREATE POLICY "Users can create their own recurring transactions"
ON recurring_transactions FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can update their own recurring transactions
CREATE POLICY "Users can update their own recurring transactions"
ON recurring_transactions FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can delete their own recurring transactions
CREATE POLICY "Users can delete their own recurring transactions"
ON recurring_transactions FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- 5. INSIGHTS MODULE - Financial Insights
-- ============================================================================

-- Enable RLS on financial_insights
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own financial insights
CREATE POLICY "Users can view their own financial insights"
ON financial_insights FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: System creates insights (users don't need INSERT permission)
-- Policy: Users can update their own insights (e.g., dismiss)
CREATE POLICY "Users can update their own financial insights"
ON financial_insights FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can delete their own insights
CREATE POLICY "Users can delete their own financial insights"
ON financial_insights FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- 6. RECEIPTS MODULE - Receipt Management
-- ============================================================================

-- Enable RLS on receipts
ALTER TABLE receipts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own receipts
CREATE POLICY "Users can view their own receipts"
ON receipts FOR SELECT
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can create their own receipts
CREATE POLICY "Users can create their own receipts"
ON receipts FOR INSERT
WITH CHECK (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can update their own receipts
CREATE POLICY "Users can update their own receipts"
ON receipts FOR UPDATE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- Policy: Users can delete their own receipts
CREATE POLICY "Users can delete their own receipts"
ON receipts FOR DELETE
USING (
  user_id = (SELECT id FROM users WHERE open_id = auth.uid())
);

-- ============================================================================
-- Enable RLS on receipt_line_items
ALTER TABLE receipt_line_items ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view line items for their own receipts
CREATE POLICY "Users can view their own receipt line items"
ON receipt_line_items FOR SELECT
USING (
  receipt_id IN (
    SELECT id FROM receipts 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: Users can create line items for their own receipts
CREATE POLICY "Users can create their own receipt line items"
ON receipt_line_items FOR INSERT
WITH CHECK (
  receipt_id IN (
    SELECT id FROM receipts 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: Users can update line items for their own receipts
CREATE POLICY "Users can update their own receipt line items"
ON receipt_line_items FOR UPDATE
USING (
  receipt_id IN (
    SELECT id FROM receipts 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- Policy: Users can delete line items for their own receipts
CREATE POLICY "Users can delete their own receipt line items"
ON receipt_line_items FOR DELETE
USING (
  receipt_id IN (
    SELECT id FROM receipts 
    WHERE user_id = (SELECT id FROM users WHERE open_id = auth.uid())
  )
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify RLS policies are active:
--
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';
--
-- ============================================================================
