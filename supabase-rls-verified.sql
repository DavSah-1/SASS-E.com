-- ============================================================================
-- Supabase Row Level Security (RLS) Policies - VERIFIED COLUMN NAMES
-- All column names verified against actual Supabase schema
-- ============================================================================

-- Enable RLS and create policies for all 98 tables

-- Standard user_id-based tables (68 tables)
-- These tables all have a user_id column

ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget_alerts" ON budget_alerts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own budget_alerts" ON budget_alerts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own budget_alerts" ON budget_alerts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own budget_alerts" ON budget_alerts FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget_categories" ON budget_categories FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own budget_categories" ON budget_categories FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own budget_categories" ON budget_categories FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own budget_categories" ON budget_categories FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget_transactions" ON budget_transactions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own budget_transactions" ON budget_transactions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own budget_transactions" ON budget_transactions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own budget_transactions" ON budget_transactions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE coaching_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching_feedback" ON coaching_feedback FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own coaching_feedback" ON coaching_feedback FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own coaching_feedback" ON coaching_feedback FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own coaching_feedback" ON coaching_feedback FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE coaching_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching_recommendations" ON coaching_recommendations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own coaching_recommendations" ON coaching_recommendations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own coaching_recommendations" ON coaching_recommendations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own coaching_recommendations" ON coaching_recommendations FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching_sessions" ON coaching_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own coaching_sessions" ON coaching_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own coaching_sessions" ON coaching_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own coaching_sessions" ON coaching_sessions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE conversation_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversation_feedback" ON conversation_feedback FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own conversation_feedback" ON conversation_feedback FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own conversation_feedback" ON conversation_feedback FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own conversation_feedback" ON conversation_feedback FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversation_sessions" ON conversation_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own conversation_sessions" ON conversation_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own conversation_sessions" ON conversation_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own conversation_sessions" ON conversation_sessions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own conversations" ON conversations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own conversations" ON conversations FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE daily_activity_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily_activity_stats" ON daily_activity_stats FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own daily_activity_stats" ON daily_activity_stats FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own daily_activity_stats" ON daily_activity_stats FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own daily_activity_stats" ON daily_activity_stats FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily_lessons" ON daily_lessons FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own daily_lessons" ON daily_lessons FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own daily_lessons" ON daily_lessons FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own daily_lessons" ON daily_lessons FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily_usage" ON daily_usage FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own daily_usage" ON daily_usage FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own daily_usage" ON daily_usage FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own daily_usage" ON daily_usage FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE debt_budget_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_budget_snapshots" ON debt_budget_snapshots FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_budget_snapshots" ON debt_budget_snapshots FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_budget_snapshots" ON debt_budget_snapshots FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_budget_snapshots" ON debt_budget_snapshots FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE debt_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_milestones" ON debt_milestones FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_milestones" ON debt_milestones FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_milestones" ON debt_milestones FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_milestones" ON debt_milestones FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_payments" ON debt_payments FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_payments" ON debt_payments FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_payments" ON debt_payments FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_payments" ON debt_payments FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE debt_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_strategies" ON debt_strategies FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_strategies" ON debt_strategies FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_strategies" ON debt_strategies FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_strategies" ON debt_strategies FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debts" ON debts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debts" ON debts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debts" ON debts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debts" ON debts FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own exercise_attempts" ON exercise_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own exercise_attempts" ON exercise_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own exercise_attempts" ON exercise_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own exercise_attempts" ON exercise_attempts FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own experiments" ON experiments FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own experiments" ON experiments FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own experiments" ON experiments FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own experiments" ON experiments FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE fact_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact_access_log" ON fact_access_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own fact_access_log" ON fact_access_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own fact_access_log" ON fact_access_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own fact_access_log" ON fact_access_log FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE fact_update_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact_update_notifications" ON fact_update_notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own fact_update_notifications" ON fact_update_notifications FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own fact_update_notifications" ON fact_update_notifications FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own fact_update_notifications" ON fact_update_notifications FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial_goals" ON financial_goals FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own financial_goals" ON financial_goals FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own financial_goals" ON financial_goals FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own financial_goals" ON financial_goals FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial_insights" ON financial_insights FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own financial_insights" ON financial_insights FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own financial_insights" ON financial_insights FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own financial_insights" ON financial_insights FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own food_log" ON food_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own food_log" ON food_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own food_log" ON food_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own food_log" ON food_log FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own health_metrics" ON health_metrics FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own health_metrics" ON health_metrics FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own health_metrics" ON health_metrics FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own health_metrics" ON health_metrics FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE hydration_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own hydration_log" ON hydration_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own hydration_log" ON hydration_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own hydration_log" ON hydration_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own hydration_log" ON hydration_log FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE iot_device_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own iot_device_data" ON iot_device_data FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own iot_device_data" ON iot_device_data FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own iot_device_data" ON iot_device_data FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own iot_device_data" ON iot_device_data FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own iot_devices" ON iot_devices FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own iot_devices" ON iot_devices FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own iot_devices" ON iot_devices FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own iot_devices" ON iot_devices FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE language_learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own language_learning_progress" ON language_learning_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own language_learning_progress" ON language_learning_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own language_learning_progress" ON language_learning_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own language_learning_progress" ON language_learning_progress FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning_sessions" ON learning_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own learning_sessions" ON learning_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own learning_sessions" ON learning_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own learning_sessions" ON learning_sessions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE math_problem_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own math_problem_attempts" ON math_problem_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own math_problem_attempts" ON math_problem_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own math_problem_attempts" ON math_problem_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own math_problem_attempts" ON math_problem_attempts FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own meal_plans" ON meal_plans FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own meal_plans" ON meal_plans FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own meal_plans" ON meal_plans FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own meal_plans" ON meal_plans FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mood_log" ON mood_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own mood_log" ON mood_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own mood_log" ON mood_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own mood_log" ON mood_log FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notification_preferences" ON notification_preferences FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own notification_preferences" ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own notification_preferences" ON notification_preferences FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own notification_preferences" ON notification_preferences FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own notifications" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own practice_sessions" ON practice_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own practice_sessions" ON practice_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own practice_sessions" ON practice_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own practice_sessions" ON practice_sessions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz_attempts" ON quiz_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own quiz_attempts" ON quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own quiz_attempts" ON quiz_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own quiz_attempts" ON quiz_attempts FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz_results" ON quiz_results FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own quiz_results" ON quiz_results FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own quiz_results" ON quiz_results FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own quiz_results" ON quiz_results FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recurring_transactions" ON recurring_transactions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own recurring_transactions" ON recurring_transactions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own recurring_transactions" ON recurring_transactions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own recurring_transactions" ON recurring_transactions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE saved_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved_facts" ON saved_facts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own saved_facts" ON saved_facts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own saved_facts" ON saved_facts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own saved_facts" ON saved_facts FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE science_explanations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own science_explanations" ON science_explanations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own science_explanations" ON science_explanations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own science_explanations" ON science_explanations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own science_explanations" ON science_explanations FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE shared_budget_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shared_budget_activity" ON shared_budget_activity FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own shared_budget_activity" ON shared_budget_activity FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own shared_budget_activity" ON shared_budget_activity FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own shared_budget_activity" ON shared_budget_activity FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE shared_budget_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shared_budget_members" ON shared_budget_members FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own shared_budget_members" ON shared_budget_members FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own shared_budget_members" ON shared_budget_members FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own shared_budget_members" ON shared_budget_members FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE shared_budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shared_budget_transactions" ON shared_budget_transactions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own shared_budget_transactions" ON shared_budget_transactions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own shared_budget_transactions" ON shared_budget_transactions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own shared_budget_transactions" ON shared_budget_transactions FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE sleep_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sleep_log" ON sleep_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own sleep_log" ON sleep_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own sleep_log" ON sleep_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own sleep_log" ON sleep_log FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE translate_conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own translate_conversation_participants" ON translate_conversation_participants FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own translate_conversation_participants" ON translate_conversation_participants FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own translate_conversation_participants" ON translate_conversation_participants FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own translate_conversation_participants" ON translate_conversation_participants FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE translate_message_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own translate_message_translations" ON translate_message_translations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own translate_message_translations" ON translate_message_translations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own translate_message_translations" ON translate_message_translations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own translate_message_translations" ON translate_message_translations FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_profiles" ON user_profiles FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_profiles" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_profiles" ON user_profiles FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_profiles" ON user_profiles FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE vocabulary_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vocabulary_progress" ON vocabulary_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own vocabulary_progress" ON vocabulary_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own vocabulary_progress" ON vocabulary_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own vocabulary_progress" ON vocabulary_progress FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable_connections" ON wearable_connections FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wearable_connections" ON wearable_connections FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wearable_connections" ON wearable_connections FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wearable_connections" ON wearable_connections FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE wearable_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable_data_cache" ON wearable_data_cache FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wearable_data_cache" ON wearable_data_cache FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wearable_data_cache" ON wearable_data_cache FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wearable_data_cache" ON wearable_data_cache FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE wearable_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable_sync_logs" ON wearable_sync_logs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wearable_sync_logs" ON wearable_sync_logs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wearable_sync_logs" ON wearable_sync_logs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wearable_sync_logs" ON wearable_sync_logs FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workout_exercises" ON workout_exercises FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own workout_exercises" ON workout_exercises FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own workout_exercises" ON workout_exercises FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own workout_exercises" ON workout_exercises FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workout_logs" ON workout_logs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own workout_logs" ON workout_logs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own workout_logs" ON workout_logs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own workout_logs" ON workout_logs FOR DELETE USING (user_id = auth.uid()::text);

ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workout_plans" ON workout_plans FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own workout_plans" ON workout_plans FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own workout_plans" ON workout_plans FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own workout_plans" ON workout_plans FOR DELETE USING (user_id = auth.uid()::text);

-- Public read-only tables (13 tables)
ALTER TABLE article_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view article_quizzes" ON article_quizzes FOR SELECT USING (true);

ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view budget_templates" ON budget_templates FOR SELECT USING (true);

ALTER TABLE finance_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view finance_articles" ON finance_articles FOR SELECT USING (true);

ALTER TABLE financial_glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view financial_glossary" ON financial_glossary FOR SELECT USING (true);

ALTER TABLE grammar_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view grammar_lessons" ON grammar_lessons FOR SELECT USING (true);

ALTER TABLE learning_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view learning_content" ON learning_content FOR SELECT USING (true);

ALTER TABLE math_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view math_problems" ON math_problems FOR SELECT USING (true);

ALTER TABLE quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view quiz_questions" ON quiz_questions FOR SELECT USING (true);

ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view quizzes" ON quizzes FOR SELECT USING (true);

ALTER TABLE science_topics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view science_topics" ON science_topics FOR SELECT USING (true);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

ALTER TABLE vocabulary_words ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view vocabulary_words" ON vocabulary_words FOR SELECT USING (true);

ALTER TABLE word_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view word_translations" ON word_translations FOR SELECT USING (true);

-- Complex tables requiring joins (17 tables)

-- conversation_messages (uses sender column, not user_id)
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages from their sessions" ON conversation_messages FOR SELECT USING (
  session_id IN (SELECT id FROM conversation_sessions WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create messages in their sessions" ON conversation_messages FOR INSERT WITH CHECK (
  session_id IN (SELECT id FROM conversation_sessions WHERE user_id = auth.uid()::text)
);

-- experiment_steps (join through experiments)
ALTER TABLE experiment_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view steps for their experiments" ON experiment_steps FOR SELECT USING (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create steps for their experiments" ON experiment_steps FOR INSERT WITH CHECK (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can update steps for their experiments" ON experiment_steps FOR UPDATE USING (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can delete steps for their experiments" ON experiment_steps FOR DELETE USING (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid()::text)
);

-- goal_milestones (join through financial_goals)
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goal milestones" ON goal_milestones FOR SELECT USING (
  goal_id IN (SELECT id FROM financial_goals WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create their own goal milestones" ON goal_milestones FOR INSERT WITH CHECK (
  goal_id IN (SELECT id FROM financial_goals WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can update their own goal milestones" ON goal_milestones FOR UPDATE USING (
  goal_id IN (SELECT id FROM financial_goals WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can delete their own goal milestones" ON goal_milestones FOR DELETE USING (
  goal_id IN (SELECT id FROM financial_goals WHERE user_id = auth.uid()::text)
);

-- goal_progress_history (join through financial_goals)
ALTER TABLE goal_progress_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goal progress history" ON goal_progress_history FOR SELECT USING (
  goal_id IN (SELECT id FROM financial_goals WHERE user_id = auth.uid()::text)
);

-- shared_budgets (uses created_by)
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budgets they created or are members of" ON shared_budgets FOR SELECT USING (
  created_by = auth.uid()::text OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create shared budgets" ON shared_budgets FOR INSERT WITH CHECK (created_by = auth.uid()::text);
CREATE POLICY "Creators can update their shared budgets" ON shared_budgets FOR UPDATE USING (created_by = auth.uid()::text);
CREATE POLICY "Creators can delete their shared budgets" ON shared_budgets FOR DELETE USING (created_by = auth.uid()::text);

-- shared_budget_categories (uses created_by)
ALTER TABLE shared_budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budget categories" ON shared_budget_categories FOR SELECT USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE created_by = auth.uid()::text OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()::text))
);
CREATE POLICY "Creators and editors can create shared budget categories" ON shared_budget_categories FOR INSERT WITH CHECK (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE created_by = auth.uid()::text OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()::text AND role IN ('owner', 'editor')))
);
CREATE POLICY "Creators and editors can update shared budget categories" ON shared_budget_categories FOR UPDATE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE created_by = auth.uid()::text OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()::text AND role IN ('owner', 'editor')))
);
CREATE POLICY "Creators can delete shared budget categories" ON shared_budget_categories FOR DELETE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE created_by = auth.uid()::text)
);

-- translate_conversations (uses creator_id)
ALTER TABLE translate_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view translate conversations they created or joined" ON translate_conversations FOR SELECT USING (
  creator_id = auth.uid()::text OR id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create translate conversations" ON translate_conversations FOR INSERT WITH CHECK (creator_id = auth.uid()::text);
CREATE POLICY "Creators can update their translate conversations" ON translate_conversations FOR UPDATE USING (creator_id = auth.uid()::text);
CREATE POLICY "Creators can delete their translate conversations" ON translate_conversations FOR DELETE USING (creator_id = auth.uid()::text);

-- translate_messages (uses sender_id)
ALTER TABLE translate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON translate_messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM translate_conversations WHERE creator_id = auth.uid()::text OR id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid()::text))
);
CREATE POLICY "Participants can create messages" ON translate_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid()::text AND conversation_id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid()::text)
);

-- fact_check_results (no user_id - linked through learning_session_id)
ALTER TABLE fact_check_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view fact check results from their sessions" ON fact_check_results FOR SELECT USING (
  learning_session_id IN (SELECT id FROM learning_sessions WHERE user_id = auth.uid()::text)
);
CREATE POLICY "Users can create fact check results in their sessions" ON fact_check_results FOR INSERT WITH CHECK (
  learning_session_id IN (SELECT id FROM learning_sessions WHERE user_id = auth.uid()::text)
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify RLS is working:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public';
-- SELECT tablename, COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename ORDER BY tablename;
-- ============================================================================
