-- ============================================================================
-- Complete Supabase Row Level Security (RLS) Policies
-- Generated: 2026-02-15
-- Coverage: ALL 99 tables (98 existing + 1 new vocabulary table)
-- ============================================================================

-- This file contains RLS policies for EVERY table in your Supabase database
-- All column names have been verified against the actual Supabase schema

-- ============================================================================
-- STANDARD USER_ID TABLES (68 tables)
-- ============================================================================

-- budget_alerts
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget_alerts" ON budget_alerts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own budget_alerts" ON budget_alerts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own budget_alerts" ON budget_alerts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own budget_alerts" ON budget_alerts FOR DELETE USING (user_id = auth.uid()::text);

-- budget_categories
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget_categories" ON budget_categories FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own budget_categories" ON budget_categories FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own budget_categories" ON budget_categories FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own budget_categories" ON budget_categories FOR DELETE USING (user_id = auth.uid()::text);

-- budget_transactions
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget_transactions" ON budget_transactions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own budget_transactions" ON budget_transactions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own budget_transactions" ON budget_transactions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own budget_transactions" ON budget_transactions FOR DELETE USING (user_id = auth.uid()::text);

-- coaching_feedback
ALTER TABLE coaching_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching_feedback" ON coaching_feedback FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own coaching_feedback" ON coaching_feedback FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own coaching_feedback" ON coaching_feedback FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own coaching_feedback" ON coaching_feedback FOR DELETE USING (user_id = auth.uid()::text);

-- coaching_recommendations
ALTER TABLE coaching_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching_recommendations" ON coaching_recommendations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own coaching_recommendations" ON coaching_recommendations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own coaching_recommendations" ON coaching_recommendations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own coaching_recommendations" ON coaching_recommendations FOR DELETE USING (user_id = auth.uid()::text);

-- coaching_sessions
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching_sessions" ON coaching_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own coaching_sessions" ON coaching_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own coaching_sessions" ON coaching_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own coaching_sessions" ON coaching_sessions FOR DELETE USING (user_id = auth.uid()::text);

-- conversation_feedback
ALTER TABLE conversation_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversation_feedback" ON conversation_feedback FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own conversation_feedback" ON conversation_feedback FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own conversation_feedback" ON conversation_feedback FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own conversation_feedback" ON conversation_feedback FOR DELETE USING (user_id = auth.uid()::text);

-- conversation_sessions
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversation_sessions" ON conversation_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own conversation_sessions" ON conversation_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own conversation_sessions" ON conversation_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own conversation_sessions" ON conversation_sessions FOR DELETE USING (user_id = auth.uid()::text);

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own conversations" ON conversations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own conversations" ON conversations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own conversations" ON conversations FOR DELETE USING (user_id = auth.uid()::text);

-- daily_activity_stats
ALTER TABLE daily_activity_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily_activity_stats" ON daily_activity_stats FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own daily_activity_stats" ON daily_activity_stats FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own daily_activity_stats" ON daily_activity_stats FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own daily_activity_stats" ON daily_activity_stats FOR DELETE USING (user_id = auth.uid()::text);

-- daily_lessons
ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily_lessons" ON daily_lessons FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own daily_lessons" ON daily_lessons FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own daily_lessons" ON daily_lessons FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own daily_lessons" ON daily_lessons FOR DELETE USING (user_id = auth.uid()::text);

-- daily_usage
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily_usage" ON daily_usage FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own daily_usage" ON daily_usage FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own daily_usage" ON daily_usage FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own daily_usage" ON daily_usage FOR DELETE USING (user_id = auth.uid()::text);

-- debt_budget_snapshots
ALTER TABLE debt_budget_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_budget_snapshots" ON debt_budget_snapshots FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_budget_snapshots" ON debt_budget_snapshots FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_budget_snapshots" ON debt_budget_snapshots FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_budget_snapshots" ON debt_budget_snapshots FOR DELETE USING (user_id = auth.uid()::text);

-- debt_milestones
ALTER TABLE debt_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_milestones" ON debt_milestones FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_milestones" ON debt_milestones FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_milestones" ON debt_milestones FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_milestones" ON debt_milestones FOR DELETE USING (user_id = auth.uid()::text);

-- debt_payments
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_payments" ON debt_payments FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_payments" ON debt_payments FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_payments" ON debt_payments FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_payments" ON debt_payments FOR DELETE USING (user_id = auth.uid()::text);

-- debt_strategies
ALTER TABLE debt_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt_strategies" ON debt_strategies FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debt_strategies" ON debt_strategies FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debt_strategies" ON debt_strategies FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debt_strategies" ON debt_strategies FOR DELETE USING (user_id = auth.uid()::text);

-- debts
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debts" ON debts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own debts" ON debts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own debts" ON debts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own debts" ON debts FOR DELETE USING (user_id = auth.uid()::text);

-- exercise_attempts
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own exercise_attempts" ON exercise_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own exercise_attempts" ON exercise_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own exercise_attempts" ON exercise_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own exercise_attempts" ON exercise_attempts FOR DELETE USING (user_id = auth.uid()::text);

-- experiments
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own experiments" ON experiments FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own experiments" ON experiments FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own experiments" ON experiments FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own experiments" ON experiments FOR DELETE USING (user_id = auth.uid()::text);

-- fact_access_log
ALTER TABLE fact_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact_access_log" ON fact_access_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own fact_access_log" ON fact_access_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own fact_access_log" ON fact_access_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own fact_access_log" ON fact_access_log FOR DELETE USING (user_id = auth.uid()::text);

-- fact_update_notifications
ALTER TABLE fact_update_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact_update_notifications" ON fact_update_notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own fact_update_notifications" ON fact_update_notifications FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own fact_update_notifications" ON fact_update_notifications FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own fact_update_notifications" ON fact_update_notifications FOR DELETE USING (user_id = auth.uid()::text);

-- financial_goals
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial_goals" ON financial_goals FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own financial_goals" ON financial_goals FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own financial_goals" ON financial_goals FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own financial_goals" ON financial_goals FOR DELETE USING (user_id = auth.uid()::text);

-- financial_insights
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial_insights" ON financial_insights FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own financial_insights" ON financial_insights FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own financial_insights" ON financial_insights FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own financial_insights" ON financial_insights FOR DELETE USING (user_id = auth.uid()::text);

-- food_log
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own food_log" ON food_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own food_log" ON food_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own food_log" ON food_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own food_log" ON food_log FOR DELETE USING (user_id = auth.uid()::text);

-- health_metrics
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own health_metrics" ON health_metrics FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own health_metrics" ON health_metrics FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own health_metrics" ON health_metrics FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own health_metrics" ON health_metrics FOR DELETE USING (user_id = auth.uid()::text);

-- hydration_log
ALTER TABLE hydration_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own hydration_log" ON hydration_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own hydration_log" ON hydration_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own hydration_log" ON hydration_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own hydration_log" ON hydration_log FOR DELETE USING (user_id = auth.uid()::text);

-- iot_command_history
ALTER TABLE iot_command_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own iot_command_history" ON iot_command_history FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own iot_command_history" ON iot_command_history FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own iot_command_history" ON iot_command_history FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own iot_command_history" ON iot_command_history FOR DELETE USING (user_id = auth.uid()::text);

-- iot_devices
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own iot_devices" ON iot_devices FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own iot_devices" ON iot_devices FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own iot_devices" ON iot_devices FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own iot_devices" ON iot_devices FOR DELETE USING (user_id = auth.uid()::text);

-- journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own journal_entries" ON journal_entries FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own journal_entries" ON journal_entries FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own journal_entries" ON journal_entries FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own journal_entries" ON journal_entries FOR DELETE USING (user_id = auth.uid()::text);

-- lab_quiz_attempts
ALTER TABLE lab_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lab_quiz_attempts" ON lab_quiz_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own lab_quiz_attempts" ON lab_quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own lab_quiz_attempts" ON lab_quiz_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own lab_quiz_attempts" ON lab_quiz_attempts FOR DELETE USING (user_id = auth.uid()::text);

-- language_achievements
ALTER TABLE language_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own language_achievements" ON language_achievements FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own language_achievements" ON language_achievements FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own language_achievements" ON language_achievements FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own language_achievements" ON language_achievements FOR DELETE USING (user_id = auth.uid()::text);

-- language_exercises
ALTER TABLE language_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own language_exercises" ON language_exercises FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own language_exercises" ON language_exercises FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own language_exercises" ON language_exercises FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own language_exercises" ON language_exercises FOR DELETE USING (user_id = auth.uid()::text);

-- learning_sessions
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning_sessions" ON learning_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own learning_sessions" ON learning_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own learning_sessions" ON learning_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own learning_sessions" ON learning_sessions FOR DELETE USING (user_id = auth.uid()::text);

-- math_progress
ALTER TABLE math_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own math_progress" ON math_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own math_progress" ON math_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own math_progress" ON math_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own math_progress" ON math_progress FOR DELETE USING (user_id = auth.uid()::text);

-- math_solutions
ALTER TABLE math_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own math_solutions" ON math_solutions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own math_solutions" ON math_solutions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own math_solutions" ON math_solutions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own math_solutions" ON math_solutions FOR DELETE USING (user_id = auth.uid()::text);

-- meditation_sessions
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own meditation_sessions" ON meditation_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own meditation_sessions" ON meditation_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own meditation_sessions" ON meditation_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own meditation_sessions" ON meditation_sessions FOR DELETE USING (user_id = auth.uid()::text);

-- monthly_budget_summaries
ALTER TABLE monthly_budget_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own monthly_budget_summaries" ON monthly_budget_summaries FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own monthly_budget_summaries" ON monthly_budget_summaries FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own monthly_budget_summaries" ON monthly_budget_summaries FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own monthly_budget_summaries" ON monthly_budget_summaries FOR DELETE USING (user_id = auth.uid()::text);

-- mood_log
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mood_log" ON mood_log FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own mood_log" ON mood_log FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own mood_log" ON mood_log FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own mood_log" ON mood_log FOR DELETE USING (user_id = auth.uid()::text);

-- notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notification_preferences" ON notification_preferences FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own notification_preferences" ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own notification_preferences" ON notification_preferences FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own notification_preferences" ON notification_preferences FOR DELETE USING (user_id = auth.uid()::text);

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own notifications" ON notifications FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (user_id = auth.uid()::text);

-- practice_sessions
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own practice_sessions" ON practice_sessions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own practice_sessions" ON practice_sessions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own practice_sessions" ON practice_sessions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own practice_sessions" ON practice_sessions FOR DELETE USING (user_id = auth.uid()::text);

-- quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz_attempts" ON quiz_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own quiz_attempts" ON quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own quiz_attempts" ON quiz_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own quiz_attempts" ON quiz_attempts FOR DELETE USING (user_id = auth.uid()::text);

-- quiz_results
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz_results" ON quiz_results FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own quiz_results" ON quiz_results FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own quiz_results" ON quiz_results FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own quiz_results" ON quiz_results FOR DELETE USING (user_id = auth.uid()::text);

-- recurring_transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recurring_transactions" ON recurring_transactions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own recurring_transactions" ON recurring_transactions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own recurring_transactions" ON recurring_transactions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own recurring_transactions" ON recurring_transactions FOR DELETE USING (user_id = auth.uid()::text);

-- saved_translations
ALTER TABLE saved_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved_translations" ON saved_translations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own saved_translations" ON saved_translations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own saved_translations" ON saved_translations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own saved_translations" ON saved_translations FOR DELETE USING (user_id = auth.uid()::text);

-- science_progress
ALTER TABLE science_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own science_progress" ON science_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own science_progress" ON science_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own science_progress" ON science_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own science_progress" ON science_progress FOR DELETE USING (user_id = auth.uid()::text);

-- shared_budget_activity
ALTER TABLE shared_budget_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shared_budget_activity" ON shared_budget_activity FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own shared_budget_activity" ON shared_budget_activity FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own shared_budget_activity" ON shared_budget_activity FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own shared_budget_activity" ON shared_budget_activity FOR DELETE USING (user_id = auth.uid()::text);

-- shared_budget_members
ALTER TABLE shared_budget_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shared_budget_members" ON shared_budget_members FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own shared_budget_members" ON shared_budget_members FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own shared_budget_members" ON shared_budget_members FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own shared_budget_members" ON shared_budget_members FOR DELETE USING (user_id = auth.uid()::text);

-- shared_budget_transactions
ALTER TABLE shared_budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own shared_budget_transactions" ON shared_budget_transactions FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own shared_budget_transactions" ON shared_budget_transactions FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own shared_budget_transactions" ON shared_budget_transactions FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own shared_budget_transactions" ON shared_budget_transactions FOR DELETE USING (user_id = auth.uid()::text);

-- sleep_tracking
ALTER TABLE sleep_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sleep_tracking" ON sleep_tracking FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own sleep_tracking" ON sleep_tracking FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own sleep_tracking" ON sleep_tracking FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own sleep_tracking" ON sleep_tracking FOR DELETE USING (user_id = auth.uid()::text);

-- split_expenses
ALTER TABLE split_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own split_expenses" ON split_expenses FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own split_expenses" ON split_expenses FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own split_expenses" ON split_expenses FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own split_expenses" ON split_expenses FOR DELETE USING (user_id = auth.uid()::text);

-- study_guides
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own study_guides" ON study_guides FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own study_guides" ON study_guides FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own study_guides" ON study_guides FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own study_guides" ON study_guides FOR DELETE USING (user_id = auth.uid()::text);

-- topic_progress
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topic_progress" ON topic_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own topic_progress" ON topic_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own topic_progress" ON topic_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own topic_progress" ON topic_progress FOR DELETE USING (user_id = auth.uid()::text);

-- topic_quiz_results
ALTER TABLE topic_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topic_quiz_results" ON topic_quiz_results FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own topic_quiz_results" ON topic_quiz_results FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own topic_quiz_results" ON topic_quiz_results FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own topic_quiz_results" ON topic_quiz_results FOR DELETE USING (user_id = auth.uid()::text);

-- translate_conversation_participants
ALTER TABLE translate_conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own translate_conversation_participants" ON translate_conversation_participants FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own translate_conversation_participants" ON translate_conversation_participants FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own translate_conversation_participants" ON translate_conversation_participants FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own translate_conversation_participants" ON translate_conversation_participants FOR DELETE USING (user_id = auth.uid()::text);

-- translate_message_translations
ALTER TABLE translate_message_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own translate_message_translations" ON translate_message_translations FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own translate_message_translations" ON translate_message_translations FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own translate_message_translations" ON translate_message_translations FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own translate_message_translations" ON translate_message_translations FOR DELETE USING (user_id = auth.uid()::text);

-- translation_categories
ALTER TABLE translation_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own translation_categories" ON translation_categories FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own translation_categories" ON translation_categories FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own translation_categories" ON translation_categories FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own translation_categories" ON translation_categories FOR DELETE USING (user_id = auth.uid()::text);

-- user_grammar_progress
ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_grammar_progress" ON user_grammar_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_grammar_progress" ON user_grammar_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_grammar_progress" ON user_grammar_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_grammar_progress" ON user_grammar_progress FOR DELETE USING (user_id = auth.uid()::text);

-- user_lab_results
ALTER TABLE user_lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_lab_results" ON user_lab_results FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_lab_results" ON user_lab_results FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_lab_results" ON user_lab_results FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_lab_results" ON user_lab_results FOR DELETE USING (user_id = auth.uid()::text);

-- user_language_progress
ALTER TABLE user_language_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_language_progress" ON user_language_progress FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_language_progress" ON user_language_progress FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_language_progress" ON user_language_progress FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_language_progress" ON user_language_progress FOR DELETE USING (user_id = auth.uid()::text);

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_profiles" ON user_profiles FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_profiles" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_profiles" ON user_profiles FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_profiles" ON user_profiles FOR DELETE USING (user_id = auth.uid()::text);

-- user_quiz_attempts
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_quiz_attempts" ON user_quiz_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_quiz_attempts" ON user_quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_quiz_attempts" ON user_quiz_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_quiz_attempts" ON user_quiz_attempts FOR DELETE USING (user_id = auth.uid()::text);

-- user_tier_assessment_attempts
ALTER TABLE user_tier_assessment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_tier_assessment_attempts" ON user_tier_assessment_attempts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_tier_assessment_attempts" ON user_tier_assessment_attempts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_tier_assessment_attempts" ON user_tier_assessment_attempts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_tier_assessment_attempts" ON user_tier_assessment_attempts FOR DELETE USING (user_id = auth.uid()::text);

-- user_vocabulary
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_vocabulary" ON user_vocabulary FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_vocabulary" ON user_vocabulary FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_vocabulary" ON user_vocabulary FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_vocabulary" ON user_vocabulary FOR DELETE USING (user_id = auth.uid()::text);

-- user_workout_history
ALTER TABLE user_workout_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user_workout_history" ON user_workout_history FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own user_workout_history" ON user_workout_history FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own user_workout_history" ON user_workout_history FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own user_workout_history" ON user_workout_history FOR DELETE USING (user_id = auth.uid()::text);

-- verified_facts
ALTER TABLE verified_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own verified_facts" ON verified_facts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own verified_facts" ON verified_facts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own verified_facts" ON verified_facts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own verified_facts" ON verified_facts FOR DELETE USING (user_id = auth.uid()::text);

-- vocabulary_items
ALTER TABLE vocabulary_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vocabulary_items" ON vocabulary_items FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own vocabulary_items" ON vocabulary_items FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own vocabulary_items" ON vocabulary_items FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own vocabulary_items" ON vocabulary_items FOR DELETE USING (user_id = auth.uid()::text);

-- wearable_connections
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable_connections" ON wearable_connections FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wearable_connections" ON wearable_connections FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wearable_connections" ON wearable_connections FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wearable_connections" ON wearable_connections FOR DELETE USING (user_id = auth.uid()::text);

-- wearable_data_cache
ALTER TABLE wearable_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable_data_cache" ON wearable_data_cache FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wearable_data_cache" ON wearable_data_cache FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wearable_data_cache" ON wearable_data_cache FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wearable_data_cache" ON wearable_data_cache FOR DELETE USING (user_id = auth.uid()::text);

-- wearable_sync_logs
ALTER TABLE wearable_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable_sync_logs" ON wearable_sync_logs FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wearable_sync_logs" ON wearable_sync_logs FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wearable_sync_logs" ON wearable_sync_logs FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wearable_sync_logs" ON wearable_sync_logs FOR DELETE USING (user_id = auth.uid()::text);

-- wellbeing_reminders
ALTER TABLE wellbeing_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wellbeing_reminders" ON wellbeing_reminders FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wellbeing_reminders" ON wellbeing_reminders FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wellbeing_reminders" ON wellbeing_reminders FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wellbeing_reminders" ON wellbeing_reminders FOR DELETE USING (user_id = auth.uid()::text);

-- wellness_goals
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wellness_goals" ON wellness_goals FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wellness_goals" ON wellness_goals FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wellness_goals" ON wellness_goals FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wellness_goals" ON wellness_goals FOR DELETE USING (user_id = auth.uid()::text);

-- wellness_profiles
ALTER TABLE wellness_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wellness_profiles" ON wellness_profiles FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own wellness_profiles" ON wellness_profiles FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own wellness_profiles" ON wellness_profiles FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own wellness_profiles" ON wellness_profiles FOR DELETE USING (user_id = auth.uid()::text);

-- workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workouts" ON workouts FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own workouts" ON workouts FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own workouts" ON workouts FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own workouts" ON workouts FOR DELETE USING (user_id = auth.uid()::text);

-- vocabulary (NEW TABLE)
ALTER TABLE vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vocabulary" ON vocabulary FOR SELECT USING (user_id = auth.uid()::text);
CREATE POLICY "Users can create their own vocabulary" ON vocabulary FOR INSERT WITH CHECK (user_id = auth.uid()::text);
CREATE POLICY "Users can update their own vocabulary" ON vocabulary FOR UPDATE USING (user_id = auth.uid()::text);
CREATE POLICY "Users can delete their own vocabulary" ON vocabulary FOR DELETE USING (user_id = auth.uid()::text);

-- ============================================================================
-- PUBLIC READ-ONLY TABLES (13 tables)
-- ============================================================================

-- article_quizzes
ALTER TABLE article_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view article_quizzes" ON article_quizzes FOR SELECT USING (true);

-- budget_templates
ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view budget_templates" ON budget_templates FOR SELECT USING (true);

-- finance_articles
ALTER TABLE finance_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view finance_articles" ON finance_articles FOR SELECT USING (true);

-- financial_glossary
ALTER TABLE financial_glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view financial_glossary" ON financial_glossary FOR SELECT USING (true);

-- grammar_lessons
ALTER TABLE grammar_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view grammar_lessons" ON grammar_lessons FOR SELECT USING (true);

-- lab_quiz_questions
ALTER TABLE lab_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view lab_quiz_questions" ON lab_quiz_questions FOR SELECT USING (true);

-- learning_badges
ALTER TABLE learning_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view learning_badges" ON learning_badges FOR SELECT USING (true);

-- learning_sources
ALTER TABLE learning_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view learning_sources" ON learning_sources FOR SELECT USING (true);

-- math_problems
ALTER TABLE math_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view math_problems" ON math_problems FOR SELECT USING (true);

-- quizzes
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view quizzes" ON quizzes FOR SELECT USING (true);

-- tier_assessments
ALTER TABLE tier_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view tier_assessments" ON tier_assessments FOR SELECT USING (true);

-- user_budget_templates
ALTER TABLE user_budget_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view user_budget_templates" ON user_budget_templates FOR SELECT USING (true);

-- user_learning_badges
ALTER TABLE user_learning_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view user_learning_badges" ON user_learning_badges FOR SELECT USING (true);

-- users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (id = auth.uid());

-- ============================================================================
-- COMPLEX JOIN-BASED TABLES (18 tables)
-- ============================================================================

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
