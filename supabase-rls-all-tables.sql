-- ============================================================================
-- Supabase Row Level Security (RLS) Policies - ALL TABLES
-- ============================================================================
-- This file defines RLS policies for ALL 98 tables in Supabase
-- Execute these statements in Supabase SQL Editor
--
-- Standard policy pattern for user-owned data:
-- - SELECT: Users can view their own data
-- - INSERT: Users can create their own data
-- - UPDATE: Users can update their own data
-- - DELETE: Users can delete their own data
-- ============================================================================

-- Helper function to get user ID from auth.uid()
-- This assumes you have a 'users' table with 'open_id' column
-- CREATE OR REPLACE FUNCTION get_user_id_from_auth()
-- RETURNS INTEGER AS $$
--   SELECT id FROM users WHERE open_id = auth.uid()
-- $$ LANGUAGE SQL STABLE;

-- ============================================================================
-- BUDGET & FINANCE MODULE
-- ============================================================================

-- budget_alerts
ALTER TABLE budget_alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget alerts" ON budget_alerts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own budget alerts" ON budget_alerts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own budget alerts" ON budget_alerts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own budget alerts" ON budget_alerts FOR DELETE USING (user_id = auth.uid());

-- budget_categories
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget categories" ON budget_categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own budget categories" ON budget_categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own budget categories" ON budget_categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own budget categories" ON budget_categories FOR DELETE USING (user_id = auth.uid());

-- budget_transactions
ALTER TABLE budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget transactions" ON budget_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own budget transactions" ON budget_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own budget transactions" ON budget_transactions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own budget transactions" ON budget_transactions FOR DELETE USING (user_id = auth.uid());

-- budget_templates (public read, admin write)
ALTER TABLE budget_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view public budget templates" ON budget_templates FOR SELECT USING (is_public = 1);

-- monthly_budget_summaries
ALTER TABLE monthly_budget_summaries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own monthly budget summaries" ON monthly_budget_summaries FOR SELECT USING (user_id = auth.uid());

-- user_budget_templates
ALTER TABLE user_budget_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own budget templates" ON user_budget_templates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own budget templates" ON user_budget_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own budget templates" ON user_budget_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own budget templates" ON user_budget_templates FOR DELETE USING (user_id = auth.uid());

-- recurring_transactions
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own recurring transactions" ON recurring_transactions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own recurring transactions" ON recurring_transactions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own recurring transactions" ON recurring_transactions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own recurring transactions" ON recurring_transactions FOR DELETE USING (user_id = auth.uid());

-- financial_insights
ALTER TABLE financial_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial insights" ON financial_insights FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own financial insights" ON financial_insights FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own financial insights" ON financial_insights FOR DELETE USING (user_id = auth.uid());

-- financial_goals
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own financial goals" ON financial_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own financial goals" ON financial_goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own financial goals" ON financial_goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own financial goals" ON financial_goals FOR DELETE USING (user_id = auth.uid());

-- goal_milestones
ALTER TABLE goal_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goal milestones" ON goal_milestones FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own goal milestones" ON goal_milestones FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own goal milestones" ON goal_milestones FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own goal milestones" ON goal_milestones FOR DELETE USING (user_id = auth.uid());

-- goal_progress_history
ALTER TABLE goal_progress_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own goal progress history" ON goal_progress_history FOR SELECT USING (user_id = auth.uid());

-- split_expenses
ALTER TABLE split_expenses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own split expenses" ON split_expenses FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own split expenses" ON split_expenses FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own split expenses" ON split_expenses FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own split expenses" ON split_expenses FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- SHARED BUDGETS MODULE
-- ============================================================================

-- shared_budgets
ALTER TABLE shared_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budgets they own or are members of" ON shared_budgets FOR SELECT USING (
  owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create shared budgets" ON shared_budgets FOR INSERT WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owners can update their shared budgets" ON shared_budgets FOR UPDATE USING (owner_id = auth.uid());
CREATE POLICY "Owners can delete their shared budgets" ON shared_budgets FOR DELETE USING (owner_id = auth.uid());

-- shared_budget_members
ALTER TABLE shared_budget_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budget members" ON shared_budget_members FOR SELECT USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()))
);
CREATE POLICY "Owners can add shared budget members" ON shared_budget_members FOR INSERT WITH CHECK (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners can update shared budget members" ON shared_budget_members FOR UPDATE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid())
);
CREATE POLICY "Owners and members can delete shared budget members" ON shared_budget_members FOR DELETE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid()) OR user_id = auth.uid()
);

-- shared_budget_categories
ALTER TABLE shared_budget_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budget categories" ON shared_budget_categories FOR SELECT USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()))
);
CREATE POLICY "Owners and editors can create shared budget categories" ON shared_budget_categories FOR INSERT WITH CHECK (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')))
);
CREATE POLICY "Owners and editors can update shared budget categories" ON shared_budget_categories FOR UPDATE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')))
);
CREATE POLICY "Owners can delete shared budget categories" ON shared_budget_categories FOR DELETE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid())
);

-- shared_budget_transactions
ALTER TABLE shared_budget_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budget transactions" ON shared_budget_transactions FOR SELECT USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()))
);
CREATE POLICY "Owners and editors can create shared budget transactions" ON shared_budget_transactions FOR INSERT WITH CHECK (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')))
);
CREATE POLICY "Owners and editors can update shared budget transactions" ON shared_budget_transactions FOR UPDATE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')))
);
CREATE POLICY "Owners and editors can delete shared budget transactions" ON shared_budget_transactions FOR DELETE USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid() AND role IN ('owner', 'editor')))
);

-- shared_budget_activity
ALTER TABLE shared_budget_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view shared budget activity" ON shared_budget_activity FOR SELECT USING (
  shared_budget_id IN (SELECT id FROM shared_budgets WHERE owner_id = auth.uid() OR id IN (SELECT shared_budget_id FROM shared_budget_members WHERE user_id = auth.uid()))
);

-- ============================================================================
-- DEBT MANAGEMENT MODULE
-- ============================================================================

-- debts
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debts" ON debts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own debts" ON debts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own debts" ON debts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own debts" ON debts FOR DELETE USING (user_id = auth.uid());

-- debt_payments
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt payments" ON debt_payments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own debt payments" ON debt_payments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own debt payments" ON debt_payments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own debt payments" ON debt_payments FOR DELETE USING (user_id = auth.uid());

-- debt_strategies
ALTER TABLE debt_strategies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt strategies" ON debt_strategies FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own debt strategies" ON debt_strategies FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own debt strategies" ON debt_strategies FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own debt strategies" ON debt_strategies FOR DELETE USING (user_id = auth.uid());

-- debt_milestones
ALTER TABLE debt_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt milestones" ON debt_milestones FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own debt milestones" ON debt_milestones FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own debt milestones" ON debt_milestones FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own debt milestones" ON debt_milestones FOR DELETE USING (user_id = auth.uid());

-- debt_budget_snapshots
ALTER TABLE debt_budget_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own debt budget snapshots" ON debt_budget_snapshots FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own debt budget snapshots" ON debt_budget_snapshots FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own debt budget snapshots" ON debt_budget_snapshots FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own debt budget snapshots" ON debt_budget_snapshots FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- COACHING & RECOMMENDATIONS MODULE
-- ============================================================================

-- coaching_sessions
ALTER TABLE coaching_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching sessions" ON coaching_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own coaching sessions" ON coaching_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own coaching sessions" ON coaching_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own coaching sessions" ON coaching_sessions FOR DELETE USING (user_id = auth.uid());

-- coaching_recommendations
ALTER TABLE coaching_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching recommendations" ON coaching_recommendations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own coaching recommendations" ON coaching_recommendations FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own coaching recommendations" ON coaching_recommendations FOR DELETE USING (user_id = auth.uid());

-- coaching_feedback
ALTER TABLE coaching_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own coaching feedback" ON coaching_feedback FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own coaching feedback" ON coaching_feedback FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- CONVERSATIONS & VOICE ASSISTANT MODULE
-- ============================================================================

-- conversations
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own conversations" ON conversations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own conversations" ON conversations FOR DELETE USING (user_id = auth.uid());

-- conversation_sessions
ALTER TABLE conversation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversation sessions" ON conversation_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own conversation sessions" ON conversation_sessions FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own conversation sessions" ON conversation_sessions FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own conversation sessions" ON conversation_sessions FOR DELETE USING (user_id = auth.uid());

-- conversation_messages
ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages from their sessions" ON conversation_messages FOR SELECT USING (
  session_id IN (SELECT id FROM conversation_sessions WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create messages in their sessions" ON conversation_messages FOR INSERT WITH CHECK (
  session_id IN (SELECT id FROM conversation_sessions WHERE user_id = auth.uid())
);

-- conversation_feedback
ALTER TABLE conversation_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own conversation feedback" ON conversation_feedback FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own conversation feedback" ON conversation_feedback FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- TRANSLATION MODULE
-- ============================================================================

-- translate_conversations
ALTER TABLE translate_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view translate conversations they created or joined" ON translate_conversations FOR SELECT USING (
  created_by = auth.uid() OR id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create translate conversations" ON translate_conversations FOR INSERT WITH CHECK (created_by = auth.uid());
CREATE POLICY "Creators can update their translate conversations" ON translate_conversations FOR UPDATE USING (created_by = auth.uid());
CREATE POLICY "Creators can delete their translate conversations" ON translate_conversations FOR DELETE USING (created_by = auth.uid());

-- translate_conversation_participants
ALTER TABLE translate_conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view participants in their conversations" ON translate_conversation_participants FOR SELECT USING (
  conversation_id IN (SELECT id FROM translate_conversations WHERE created_by = auth.uid() OR id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid()))
);
CREATE POLICY "Users can join conversations" ON translate_conversation_participants FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can leave conversations" ON translate_conversation_participants FOR DELETE USING (user_id = auth.uid());

-- translate_messages
ALTER TABLE translate_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their conversations" ON translate_messages FOR SELECT USING (
  conversation_id IN (SELECT id FROM translate_conversations WHERE created_by = auth.uid() OR id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid()))
);
CREATE POLICY "Participants can create messages" ON translate_messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND conversation_id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid())
);

-- translate_message_translations
ALTER TABLE translate_message_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view message translations in their conversations" ON translate_message_translations FOR SELECT USING (
  message_id IN (SELECT id FROM translate_messages WHERE conversation_id IN (SELECT id FROM translate_conversations WHERE created_by = auth.uid() OR id IN (SELECT conversation_id FROM translate_conversation_participants WHERE user_id = auth.uid())))
);

-- saved_translations
ALTER TABLE saved_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own saved translations" ON saved_translations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own saved translations" ON saved_translations FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete their own saved translations" ON saved_translations FOR DELETE USING (user_id = auth.uid());

-- translation_categories
ALTER TABLE translation_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own translation categories" ON translation_categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own translation categories" ON translation_categories FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own translation categories" ON translation_categories FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own translation categories" ON translation_categories FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- LEARNING & EDUCATION MODULE
-- ============================================================================

-- learning_sessions
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning sessions" ON learning_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own learning sessions" ON learning_sessions FOR INSERT WITH CHECK (user_id = auth.uid());

-- learning_sources (public read)
ALTER TABLE learning_sources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view learning sources" ON learning_sources FOR SELECT USING (true);

-- learning_badges
ALTER TABLE learning_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view learning badges" ON learning_badges FOR SELECT USING (true);

-- user_learning_badges
ALTER TABLE user_learning_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning badges" ON user_learning_badges FOR SELECT USING (user_id = auth.uid());

-- user_learning_progress
ALTER TABLE user_learning_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own learning progress" ON user_learning_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own learning progress" ON user_learning_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own learning progress" ON user_learning_progress FOR UPDATE USING (user_id = auth.uid());

-- topic_progress
ALTER TABLE topic_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topic progress" ON topic_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own topic progress" ON topic_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own topic progress" ON topic_progress FOR UPDATE USING (user_id = auth.uid());

-- quiz_results
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz results" ON quiz_results FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own quiz results" ON quiz_results FOR INSERT WITH CHECK (user_id = auth.uid());

-- topic_quiz_results
ALTER TABLE topic_quiz_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own topic quiz results" ON topic_quiz_results FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own topic quiz results" ON topic_quiz_results FOR INSERT WITH CHECK (user_id = auth.uid());

-- daily_lessons
ALTER TABLE daily_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily lessons" ON daily_lessons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own daily lessons" ON daily_lessons FOR UPDATE USING (user_id = auth.uid());

-- practice_sessions
ALTER TABLE practice_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own practice sessions" ON practice_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own practice sessions" ON practice_sessions FOR INSERT WITH CHECK (user_id = auth.uid());

-- study_guides
ALTER TABLE study_guides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own study guides" ON study_guides FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own study guides" ON study_guides FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own study guides" ON study_guides FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own study guides" ON study_guides FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- LANGUAGE LEARNING MODULE
-- ============================================================================

-- user_language_progress
ALTER TABLE user_language_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own language progress" ON user_language_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own language progress" ON user_language_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own language progress" ON user_language_progress FOR UPDATE USING (user_id = auth.uid());

-- user_vocabulary
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own vocabulary" ON user_vocabulary FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own vocabulary" ON user_vocabulary FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own vocabulary" ON user_vocabulary FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own vocabulary" ON user_vocabulary FOR DELETE USING (user_id = auth.uid());

-- vocabulary_items (public read)
ALTER TABLE vocabulary_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view vocabulary items" ON vocabulary_items FOR SELECT USING (true);

-- language_exercises (public read)
ALTER TABLE language_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view language exercises" ON language_exercises FOR SELECT USING (true);

-- language_achievements
ALTER TABLE language_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own language achievements" ON language_achievements FOR SELECT USING (user_id = auth.uid());

-- grammar_lessons (public read)
ALTER TABLE grammar_lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view grammar lessons" ON grammar_lessons FOR SELECT USING (true);

-- user_grammar_progress
ALTER TABLE user_grammar_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own grammar progress" ON user_grammar_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own grammar progress" ON user_grammar_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own grammar progress" ON user_grammar_progress FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- MATH & SCIENCE MODULE
-- ============================================================================

-- math_problems
ALTER TABLE math_problems ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own math problems" ON math_problems FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own math problems" ON math_problems FOR INSERT WITH CHECK (user_id = auth.uid());

-- math_solutions
ALTER TABLE math_solutions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own math solutions" ON math_solutions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own math solutions" ON math_solutions FOR INSERT WITH CHECK (user_id = auth.uid());

-- math_progress
ALTER TABLE math_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own math progress" ON math_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own math progress" ON math_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own math progress" ON math_progress FOR UPDATE USING (user_id = auth.uid());

-- science_progress
ALTER TABLE science_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own science progress" ON science_progress FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own science progress" ON science_progress FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own science progress" ON science_progress FOR UPDATE USING (user_id = auth.uid());

-- experiments
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own experiments" ON experiments FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own experiments" ON experiments FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own experiments" ON experiments FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own experiments" ON experiments FOR DELETE USING (user_id = auth.uid());

-- experiment_steps
ALTER TABLE experiment_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view steps for their experiments" ON experiment_steps FOR SELECT USING (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create steps for their experiments" ON experiment_steps FOR INSERT WITH CHECK (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid())
);
CREATE POLICY "Users can update steps for their experiments" ON experiment_steps FOR UPDATE USING (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid())
);
CREATE POLICY "Users can delete steps for their experiments" ON experiment_steps FOR DELETE USING (
  experiment_id IN (SELECT id FROM experiments WHERE user_id = auth.uid())
);

-- ============================================================================
-- QUIZ & ASSESSMENT MODULE
-- ============================================================================

-- quizzes (public read)
ALTER TABLE quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view quizzes" ON quizzes FOR SELECT USING (true);

-- quiz_attempts
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own quiz attempts" ON quiz_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own quiz attempts" ON quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- user_quiz_attempts
ALTER TABLE user_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user quiz attempts" ON user_quiz_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own user quiz attempts" ON user_quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- tier_assessments (public read)
ALTER TABLE tier_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view tier assessments" ON tier_assessments FOR SELECT USING (true);

-- user_tier_assessment_attempts
ALTER TABLE user_tier_assessment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tier assessment attempts" ON user_tier_assessment_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own tier assessment attempts" ON user_tier_assessment_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- lab_quiz_questions (public read)
ALTER TABLE lab_quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view lab quiz questions" ON lab_quiz_questions FOR SELECT USING (true);

-- lab_quiz_attempts
ALTER TABLE lab_quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lab quiz attempts" ON lab_quiz_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own lab quiz attempts" ON lab_quiz_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- user_lab_results
ALTER TABLE user_lab_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own lab results" ON user_lab_results FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own lab results" ON user_lab_results FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- FINANCE ARTICLES & EDUCATION MODULE
-- ============================================================================

-- finance_articles (public read)
ALTER TABLE finance_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view finance articles" ON finance_articles FOR SELECT USING (true);

-- article_quizzes (public read)
ALTER TABLE article_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view article quizzes" ON article_quizzes FOR SELECT USING (true);

-- financial_glossary (public read)
ALTER TABLE financial_glossary ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view financial glossary" ON financial_glossary FOR SELECT USING (true);

-- ============================================================================
-- HEALTH & WELLNESS MODULE
-- ============================================================================

-- wellness_profiles
ALTER TABLE wellness_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wellness profiles" ON wellness_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own wellness profiles" ON wellness_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own wellness profiles" ON wellness_profiles FOR UPDATE USING (user_id = auth.uid());

-- wellness_goals
ALTER TABLE wellness_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wellness goals" ON wellness_goals FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own wellness goals" ON wellness_goals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own wellness goals" ON wellness_goals FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own wellness goals" ON wellness_goals FOR DELETE USING (user_id = auth.uid());

-- wellbeing_reminders
ALTER TABLE wellbeing_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wellbeing reminders" ON wellbeing_reminders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own wellbeing reminders" ON wellbeing_reminders FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own wellbeing reminders" ON wellbeing_reminders FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own wellbeing reminders" ON wellbeing_reminders FOR DELETE USING (user_id = auth.uid());

-- health_metrics
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own health metrics" ON health_metrics FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own health metrics" ON health_metrics FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own health metrics" ON health_metrics FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own health metrics" ON health_metrics FOR DELETE USING (user_id = auth.uid());

-- hydration_log
ALTER TABLE hydration_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own hydration log" ON hydration_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own hydration log" ON hydration_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own hydration log" ON hydration_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own hydration log" ON hydration_log FOR DELETE USING (user_id = auth.uid());

-- food_log
ALTER TABLE food_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own food log" ON food_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own food log" ON food_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own food log" ON food_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own food log" ON food_log FOR DELETE USING (user_id = auth.uid());

-- sleep_tracking
ALTER TABLE sleep_tracking ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sleep tracking" ON sleep_tracking FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own sleep tracking" ON sleep_tracking FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own sleep tracking" ON sleep_tracking FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own sleep tracking" ON sleep_tracking FOR DELETE USING (user_id = auth.uid());

-- mood_log
ALTER TABLE mood_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own mood log" ON mood_log FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own mood log" ON mood_log FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own mood log" ON mood_log FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own mood log" ON mood_log FOR DELETE USING (user_id = auth.uid());

-- meditation_sessions
ALTER TABLE meditation_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own meditation sessions" ON meditation_sessions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own meditation sessions" ON meditation_sessions FOR INSERT WITH CHECK (user_id = auth.uid());

-- journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own journal entries" ON journal_entries FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own journal entries" ON journal_entries FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own journal entries" ON journal_entries FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own journal entries" ON journal_entries FOR DELETE USING (user_id = auth.uid());

-- ============================================================================
-- FITNESS & WORKOUTS MODULE
-- ============================================================================

-- workouts
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workouts" ON workouts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own workouts" ON workouts FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own workouts" ON workouts FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own workouts" ON workouts FOR DELETE USING (user_id = auth.uid());

-- exercise_attempts
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own exercise attempts" ON exercise_attempts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own exercise attempts" ON exercise_attempts FOR INSERT WITH CHECK (user_id = auth.uid());

-- user_workout_history
ALTER TABLE user_workout_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own workout history" ON user_workout_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own workout history" ON user_workout_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- daily_activity_stats
ALTER TABLE daily_activity_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily activity stats" ON daily_activity_stats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own daily activity stats" ON daily_activity_stats FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own daily activity stats" ON daily_activity_stats FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- WEARABLE DEVICES MODULE
-- ============================================================================

-- wearable_connections
ALTER TABLE wearable_connections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable connections" ON wearable_connections FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own wearable connections" ON wearable_connections FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own wearable connections" ON wearable_connections FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own wearable connections" ON wearable_connections FOR DELETE USING (user_id = auth.uid());

-- wearable_sync_logs
ALTER TABLE wearable_sync_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable sync logs" ON wearable_sync_logs FOR SELECT USING (user_id = auth.uid());

-- wearable_data_cache
ALTER TABLE wearable_data_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own wearable data cache" ON wearable_data_cache FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- IOT DEVICES MODULE
-- ============================================================================

-- iot_devices
ALTER TABLE iot_devices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own iot devices" ON iot_devices FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own iot devices" ON iot_devices FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own iot devices" ON iot_devices FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own iot devices" ON iot_devices FOR DELETE USING (user_id = auth.uid());

-- iot_command_history
ALTER TABLE iot_command_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own iot command history" ON iot_command_history FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own iot command history" ON iot_command_history FOR INSERT WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- NOTIFICATIONS & PREFERENCES MODULE
-- ============================================================================

-- notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own notifications" ON notifications FOR DELETE USING (user_id = auth.uid());

-- notification_preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notification preferences" ON notification_preferences FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own notification preferences" ON notification_preferences FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own notification preferences" ON notification_preferences FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- FACT CHECKING MODULE
-- ============================================================================

-- verified_facts (public read)
ALTER TABLE verified_facts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view verified facts" ON verified_facts FOR SELECT USING (true);

-- fact_check_results
ALTER TABLE fact_check_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact check results" ON fact_check_results FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own fact check results" ON fact_check_results FOR INSERT WITH CHECK (user_id = auth.uid());

-- fact_access_log
ALTER TABLE fact_access_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact access log" ON fact_access_log FOR SELECT USING (user_id = auth.uid());

-- fact_update_notifications
ALTER TABLE fact_update_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own fact update notifications" ON fact_update_notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own fact update notifications" ON fact_update_notifications FOR UPDATE USING (user_id = auth.uid());

-- ============================================================================
-- USER PROFILES & USAGE MODULE
-- ============================================================================

-- users (public read for basic info)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (open_id = auth.uid());
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (open_id = auth.uid());

-- user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own user profiles" ON user_profiles FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create their own user profiles" ON user_profiles FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own user profiles" ON user_profiles FOR UPDATE USING (user_id = auth.uid());

-- daily_usage
ALTER TABLE daily_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own daily usage" ON daily_usage FOR SELECT USING (user_id = auth.uid());

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these queries to verify RLS policies are active:
--
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
-- SELECT schemaname, tablename, policyname FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
--
-- Count policies per table:
-- SELECT tablename, COUNT(*) as policy_count FROM pg_policies WHERE schemaname = 'public' GROUP BY tablename ORDER BY tablename;
--
-- Tables without RLS enabled:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND rowsecurity = false ORDER BY tablename;
--
-- ============================================================================
