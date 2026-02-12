-- Add indexes to Supabase database tables for query optimization
-- These indexes improve performance for user-specific queries with RLS policies

-- Users table indexes (if exists in Supabase)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Conversations table indexes
CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_user_id_created_at ON conversations(user_id, created_at);

-- IoT Devices table indexes
CREATE INDEX IF NOT EXISTS idx_iot_devices_user_id ON iot_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_devices_status ON iot_devices(status);
CREATE INDEX IF NOT EXISTS idx_iot_devices_user_id_status ON iot_devices(user_id, status);

-- IoT Command History table indexes
CREATE INDEX IF NOT EXISTS idx_iot_command_history_user_id ON iot_command_history(user_id);
CREATE INDEX IF NOT EXISTS idx_iot_command_history_device_id ON iot_command_history(device_id);
CREATE INDEX IF NOT EXISTS idx_iot_command_history_executed_at ON iot_command_history(executed_at);
CREATE INDEX IF NOT EXISTS idx_iot_command_history_user_id_device_id ON iot_command_history(user_id, device_id);

-- Quiz Attempts table indexes
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_created_at ON quiz_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id_quiz_id ON quiz_attempts(user_id, quiz_id);

-- Budget Transactions table indexes
CREATE INDEX IF NOT EXISTS idx_budget_transactions_user_id ON budget_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_category_id ON budget_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_transaction_date ON budget_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_budget_transactions_user_id_date ON budget_transactions(user_id, transaction_date);

-- Financial Goals table indexes
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id ON financial_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_financial_goals_status ON financial_goals(status);
CREATE INDEX IF NOT EXISTS idx_financial_goals_target_date ON financial_goals(target_date);
CREATE INDEX IF NOT EXISTS idx_financial_goals_user_id_status ON financial_goals(user_id, status);

-- Quota Usage table indexes (already exists, but adding for completeness)
CREATE INDEX IF NOT EXISTS idx_quota_usage_user_id_period_service ON quota_usage(user_id, period, service);
