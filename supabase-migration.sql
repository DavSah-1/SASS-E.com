-- Supabase Schema Migration: Convert camelCase columns to snake_case
-- Generated automatically from drizzle/schema.ts
-- Execute these statements in Supabase SQL Editor

-- WARNING: This will rename columns in your database.
-- Ensure you have a backup before proceeding.

-- Total tables affected: 89
-- Total columns to rename: 309

-- Table: api_usage_logs (1 columns)
ALTER TABLE api_usage_logs RENAME COLUMN apiName TO api_name;

-- Table: audit_logs (2 columns)
ALTER TABLE audit_logs RENAME COLUMN adminId TO admin_id;
ALTER TABLE audit_logs RENAME COLUMN adminEmail TO admin_email;

-- Table: budget_alerts (5 columns)
ALTER TABLE budget_alerts RENAME COLUMN userId TO user_id;
ALTER TABLE budget_alerts RENAME COLUMN categoryId TO category_id;
ALTER TABLE budget_alerts RENAME COLUMN alertType TO alert_type;
ALTER TABLE budget_alerts RENAME COLUMN isRead TO is_read;
ALTER TABLE budget_alerts RENAME COLUMN createdAt TO created_at;

-- Table: budget_categories (1 columns)
ALTER TABLE budget_categories RENAME COLUMN userId TO user_id;

-- Table: budget_transactions (3 columns)
ALTER TABLE budget_transactions RENAME COLUMN userId TO user_id;
ALTER TABLE budget_transactions RENAME COLUMN categoryId TO category_id;
ALTER TABLE budget_transactions RENAME COLUMN transactionDate TO transaction_date;

-- Table: cleanup_logs (3 columns)
ALTER TABLE cleanup_logs RENAME COLUMN cleanupType TO cleanup_type;
ALTER TABLE cleanup_logs RENAME COLUMN filesDeleted TO files_deleted;
ALTER TABLE cleanup_logs RENAME COLUMN spaceFreedMB TO space_freed_mb;

-- Table: coaching_feedback (3 columns)
ALTER TABLE coaching_feedback RENAME COLUMN recommendationId TO recommendation_id;
ALTER TABLE coaching_feedback RENAME COLUMN userId TO user_id;
ALTER TABLE coaching_feedback RENAME COLUMN createdAt TO created_at;

-- Table: coaching_recommendations (2 columns)
ALTER TABLE coaching_recommendations RENAME COLUMN userId TO user_id;
ALTER TABLE coaching_recommendations RENAME COLUMN recommendationType TO recommendation_type;

-- Table: coaching_sessions (6 columns)
ALTER TABLE coaching_sessions RENAME COLUMN userId TO user_id;
ALTER TABLE coaching_sessions RENAME COLUMN sessionType TO session_type;
ALTER TABLE coaching_sessions RENAME COLUMN relatedDebtId TO related_debt_id;
ALTER TABLE coaching_sessions RENAME COLUMN relatedMilestoneId TO related_milestone_id;
ALTER TABLE coaching_sessions RENAME COLUMN userResponse TO user_response;
ALTER TABLE coaching_sessions RENAME COLUMN createdAt TO created_at;

-- Table: conversation_feedback (4 columns)
ALTER TABLE conversation_feedback RENAME COLUMN conversationId TO conversation_id;
ALTER TABLE conversation_feedback RENAME COLUMN userId TO user_id;
ALTER TABLE conversation_feedback RENAME COLUMN feedbackType TO feedback_type;
ALTER TABLE conversation_feedback RENAME COLUMN createdAt TO created_at;

-- Table: conversation_messages (3 columns)
ALTER TABLE conversation_messages RENAME COLUMN sessionId TO session_id;
ALTER TABLE conversation_messages RENAME COLUMN messageText TO message_text;
ALTER TABLE conversation_messages RENAME COLUMN translatedText TO translated_text;

-- Table: conversation_sessions (1 columns)
ALTER TABLE conversation_sessions RENAME COLUMN userId TO user_id;

-- Table: conversations (4 columns)
ALTER TABLE conversations RENAME COLUMN userId TO user_id;
ALTER TABLE conversations RENAME COLUMN userMessage TO user_message;
ALTER TABLE conversations RENAME COLUMN assistantResponse TO assistant_response;
ALTER TABLE conversations RENAME COLUMN audioUrl TO audio_url;

-- Table: daily_activity_stats (1 columns)
ALTER TABLE daily_activity_stats RENAME COLUMN userId TO user_id;

-- Table: daily_lessons (1 columns)
ALTER TABLE daily_lessons RENAME COLUMN userId TO user_id;

-- Table: daily_usage (8 columns)
ALTER TABLE daily_usage RENAME COLUMN userId TO user_id;
ALTER TABLE daily_usage RENAME COLUMN voiceAssistantCount TO voice_assistant_count;
ALTER TABLE daily_usage RENAME COLUMN verifiedLearningCount TO verified_learning_count;
ALTER TABLE daily_usage RENAME COLUMN mathTutorCount TO math_tutor_count;
ALTER TABLE daily_usage RENAME COLUMN translateCount TO translate_count;
ALTER TABLE daily_usage RENAME COLUMN imageOcrCount TO image_ocr_count;
ALTER TABLE daily_usage RENAME COLUMN createdAt TO created_at;
ALTER TABLE daily_usage RENAME COLUMN updatedAt TO updated_at;

-- Table: debt_budget_snapshots (2 columns)
ALTER TABLE debt_budget_snapshots RENAME COLUMN userId TO user_id;
ALTER TABLE debt_budget_snapshots RENAME COLUMN monthYear TO month_year;

-- Table: debt_milestones (3 columns)
ALTER TABLE debt_milestones RENAME COLUMN userId TO user_id;
ALTER TABLE debt_milestones RENAME COLUMN debtId TO debt_id;
ALTER TABLE debt_milestones RENAME COLUMN milestoneType TO milestone_type;

-- Table: debt_payments (8 columns)
ALTER TABLE debt_payments RENAME COLUMN debtId TO debt_id;
ALTER TABLE debt_payments RENAME COLUMN userId TO user_id;
ALTER TABLE debt_payments RENAME COLUMN paymentDate TO payment_date;
ALTER TABLE debt_payments RENAME COLUMN paymentType TO payment_type;
ALTER TABLE debt_payments RENAME COLUMN balanceAfter TO balance_after;
ALTER TABLE debt_payments RENAME COLUMN principalPaid TO principal_paid;
ALTER TABLE debt_payments RENAME COLUMN interestPaid TO interest_paid;
ALTER TABLE debt_payments RENAME COLUMN createdAt TO created_at;

-- Table: debt_strategies (9 columns)
ALTER TABLE debt_strategies RENAME COLUMN userId TO user_id;
ALTER TABLE debt_strategies RENAME COLUMN strategyType TO strategy_type;
ALTER TABLE debt_strategies RENAME COLUMN monthlyExtraPayment TO monthly_extra_payment;
ALTER TABLE debt_strategies RENAME COLUMN projectedPayoffDate TO projected_payoff_date;
ALTER TABLE debt_strategies RENAME COLUMN totalInterestPaid TO total_interest_paid;
ALTER TABLE debt_strategies RENAME COLUMN totalInterestSaved TO total_interest_saved;
ALTER TABLE debt_strategies RENAME COLUMN monthsToPayoff TO months_to_payoff;
ALTER TABLE debt_strategies RENAME COLUMN payoffOrder TO payoff_order;
ALTER TABLE debt_strategies RENAME COLUMN calculatedAt TO calculated_at;

-- Table: debts (2 columns)
ALTER TABLE debts RENAME COLUMN userId TO user_id;
ALTER TABLE debts RENAME COLUMN debtName TO debt_name;

-- Table: error_logs (1 columns)
ALTER TABLE error_logs RENAME COLUMN errorType TO error_type;

-- Table: exercise_attempts (2 columns)
ALTER TABLE exercise_attempts RENAME COLUMN userId TO user_id;
ALTER TABLE exercise_attempts RENAME COLUMN exerciseId TO exercise_id;

-- Table: experiment_steps (5 columns)
ALTER TABLE experiment_steps RENAME COLUMN experimentId TO experiment_id;
ALTER TABLE experiment_steps RENAME COLUMN stepNumber TO step_number;
ALTER TABLE experiment_steps RENAME COLUMN expectedResult TO expected_result;
ALTER TABLE experiment_steps RENAME COLUMN safetyNote TO safety_note;
ALTER TABLE experiment_steps RENAME COLUMN imageUrl TO image_url;

-- Table: fact_access_log (5 columns)
ALTER TABLE fact_access_log RENAME COLUMN userId TO user_id;
ALTER TABLE fact_access_log RENAME COLUMN verifiedFactId TO verified_fact_id;
ALTER TABLE fact_access_log RENAME COLUMN factVersion TO fact_version;
ALTER TABLE fact_access_log RENAME COLUMN accessedAt TO accessed_at;
ALTER TABLE fact_access_log RENAME COLUMN accessSource TO access_source;

-- Table: fact_check_results (4 columns)
ALTER TABLE fact_check_results RENAME COLUMN learningSessionId TO learning_session_id;
ALTER TABLE fact_check_results RENAME COLUMN verificationStatus TO verification_status;
ALTER TABLE fact_check_results RENAME COLUMN confidenceScore TO confidence_score;
ALTER TABLE fact_check_results RENAME COLUMN createdAt TO created_at;

-- Table: fact_update_notifications (5 columns)
ALTER TABLE fact_update_notifications RENAME COLUMN userId TO user_id;
ALTER TABLE fact_update_notifications RENAME COLUMN verifiedFactId TO verified_fact_id;
ALTER TABLE fact_update_notifications RENAME COLUMN oldVersion TO old_version;
ALTER TABLE fact_update_notifications RENAME COLUMN newVersion TO new_version;
ALTER TABLE fact_update_notifications RENAME COLUMN notificationType TO notification_type;

-- Table: finance_articles (1 columns)
ALTER TABLE finance_articles RENAME COLUMN tierId TO tier_id;

-- Table: financial_goals (1 columns)
ALTER TABLE financial_goals RENAME COLUMN userId TO user_id;

-- Table: financial_insights (2 columns)
ALTER TABLE financial_insights RENAME COLUMN userId TO user_id;
ALTER TABLE financial_insights RENAME COLUMN insightType TO insight_type;

-- Table: food_log (1 columns)
ALTER TABLE food_log RENAME COLUMN userId TO user_id;

-- Table: goal_milestones (5 columns)
ALTER TABLE goal_milestones RENAME COLUMN goalId TO goal_id;
ALTER TABLE goal_milestones RENAME COLUMN milestonePercentage TO milestone_percentage;
ALTER TABLE goal_milestones RENAME COLUMN achievedDate TO achieved_date;
ALTER TABLE goal_milestones RENAME COLUMN celebrationShown TO celebration_shown;
ALTER TABLE goal_milestones RENAME COLUMN createdAt TO created_at;

-- Table: goal_progress_history (3 columns)
ALTER TABLE goal_progress_history RENAME COLUMN goalId TO goal_id;
ALTER TABLE goal_progress_history RENAME COLUMN newTotal TO new_total;
ALTER TABLE goal_progress_history RENAME COLUMN progressDate TO progress_date;

-- Table: health_metrics (1 columns)
ALTER TABLE health_metrics RENAME COLUMN userId TO user_id;

-- Table: hub_trials (6 columns)
ALTER TABLE hub_trials RENAME COLUMN userId TO user_id;
ALTER TABLE hub_trials RENAME COLUMN hubId TO hub_id;
ALTER TABLE hub_trials RENAME COLUMN startedAt TO started_at;
ALTER TABLE hub_trials RENAME COLUMN expiresAt TO expires_at;
ALTER TABLE hub_trials RENAME COLUMN createdAt TO created_at;
ALTER TABLE hub_trials RENAME COLUMN updatedAt TO updated_at;

-- Table: hydration_log (1 columns)
ALTER TABLE hydration_log RENAME COLUMN userId TO user_id;

-- Table: iot_command_history (2 columns)
ALTER TABLE iot_command_history RENAME COLUMN userId TO user_id;
ALTER TABLE iot_command_history RENAME COLUMN deviceId TO device_id;

-- Table: iot_devices (2 columns)
ALTER TABLE iot_devices RENAME COLUMN userId TO user_id;
ALTER TABLE iot_devices RENAME COLUMN deviceId TO device_id;

-- Table: journal_entries (1 columns)
ALTER TABLE journal_entries RENAME COLUMN userId TO user_id;

-- Table: lab_quiz_attempts (6 columns)
ALTER TABLE lab_quiz_attempts RENAME COLUMN userId TO user_id;
ALTER TABLE lab_quiz_attempts RENAME COLUMN experimentId TO experiment_id;
ALTER TABLE lab_quiz_attempts RENAME COLUMN totalQuestions TO total_questions;
ALTER TABLE lab_quiz_attempts RENAME COLUMN correctAnswers TO correct_answers;
ALTER TABLE lab_quiz_attempts RENAME COLUMN timeSpent TO time_spent;
ALTER TABLE lab_quiz_attempts RENAME COLUMN attemptedAt TO attempted_at;

-- Table: lab_quiz_questions (2 columns)
ALTER TABLE lab_quiz_questions RENAME COLUMN experimentId TO experiment_id;
ALTER TABLE lab_quiz_questions RENAME COLUMN correctAnswer TO correct_answer;

-- Table: language_achievements (1 columns)
ALTER TABLE language_achievements RENAME COLUMN userId TO user_id;

-- Table: learning_sessions (1 columns)
ALTER TABLE learning_sessions RENAME COLUMN userId TO user_id;

-- Table: learning_sources (1 columns)
ALTER TABLE learning_sources RENAME COLUMN factCheckResultId TO fact_check_result_id;

-- Table: math_progress (9 columns)
ALTER TABLE math_progress RENAME COLUMN userId TO user_id;
ALTER TABLE math_progress RENAME COLUMN totalProblemsAttempted TO total_problems_attempted;
ALTER TABLE math_progress RENAME COLUMN totalProblemsSolved TO total_problems_solved;
ALTER TABLE math_progress RENAME COLUMN topicsExplored TO topics_explored;
ALTER TABLE math_progress RENAME COLUMN currentStreak TO current_streak;
ALTER TABLE math_progress RENAME COLUMN longestStreak TO longest_streak;
ALTER TABLE math_progress RENAME COLUMN lastPracticeDate TO last_practice_date;
ALTER TABLE math_progress RENAME COLUMN createdAt TO created_at;
ALTER TABLE math_progress RENAME COLUMN updatedAt TO updated_at;

-- Table: math_solutions (4 columns)
ALTER TABLE math_solutions RENAME COLUMN userId TO user_id;
ALTER TABLE math_solutions RENAME COLUMN problemId TO problem_id;
ALTER TABLE math_solutions RENAME COLUMN problemText TO problem_text;
ALTER TABLE math_solutions RENAME COLUMN userAnswer TO user_answer;

-- Table: meditation_sessions (1 columns)
ALTER TABLE meditation_sessions RENAME COLUMN userId TO user_id;

-- Table: monthly_budget_summaries (2 columns)
ALTER TABLE monthly_budget_summaries RENAME COLUMN userId TO user_id;
ALTER TABLE monthly_budget_summaries RENAME COLUMN monthYear TO month_year;

-- Table: mood_log (1 columns)
ALTER TABLE mood_log RENAME COLUMN userId TO user_id;

-- Table: notification_preferences (23 columns)
ALTER TABLE notification_preferences RENAME COLUMN userId TO user_id;
ALTER TABLE notification_preferences RENAME COLUMN budgetAlertsEnabled TO budget_alerts_enabled;
ALTER TABLE notification_preferences RENAME COLUMN threshold80Enabled TO threshold80_enabled;
ALTER TABLE notification_preferences RENAME COLUMN threshold100Enabled TO threshold100_enabled;
ALTER TABLE notification_preferences RENAME COLUMN exceededEnabled TO exceeded_enabled;
ALTER TABLE notification_preferences RENAME COLUMN weeklySummaryEnabled TO weekly_summary_enabled;
ALTER TABLE notification_preferences RENAME COLUMN monthlySummaryEnabled TO monthly_summary_enabled;
ALTER TABLE notification_preferences RENAME COLUMN insightsEnabled TO insights_enabled;
ALTER TABLE notification_preferences RENAME COLUMN recurringAlertsEnabled TO recurring_alerts_enabled;
ALTER TABLE notification_preferences RENAME COLUMN debtMilestonesEnabled TO debt_milestones_enabled;
ALTER TABLE notification_preferences RENAME COLUMN debtPaymentRemindersEnabled TO debt_payment_reminders_enabled;
ALTER TABLE notification_preferences RENAME COLUMN debtStrategyUpdatesEnabled TO debt_strategy_updates_enabled;
ALTER TABLE notification_preferences RENAME COLUMN learningAchievementsEnabled TO learning_achievements_enabled;
ALTER TABLE notification_preferences RENAME COLUMN streakRemindersEnabled TO streak_reminders_enabled;
ALTER TABLE notification_preferences RENAME COLUMN quizResultsEnabled TO quiz_results_enabled;
ALTER TABLE notification_preferences RENAME COLUMN factUpdatesEnabled TO fact_updates_enabled;
ALTER TABLE notification_preferences RENAME COLUMN systemAlertsEnabled TO system_alerts_enabled;
ALTER TABLE notification_preferences RENAME COLUMN securityAlertsEnabled TO security_alerts_enabled;
ALTER TABLE notification_preferences RENAME COLUMN notificationMethod TO notification_method;
ALTER TABLE notification_preferences RENAME COLUMN quietHoursStart TO quiet_hours_start;
ALTER TABLE notification_preferences RENAME COLUMN quietHoursEnd TO quiet_hours_end;
ALTER TABLE notification_preferences RENAME COLUMN createdAt TO created_at;
ALTER TABLE notification_preferences RENAME COLUMN updatedAt TO updated_at;

-- Table: practice_sessions (2 columns)
ALTER TABLE practice_sessions RENAME COLUMN userId TO user_id;
ALTER TABLE practice_sessions RENAME COLUMN topicName TO topic_name;

-- Table: push_subscriptions (6 columns)
ALTER TABLE push_subscriptions RENAME COLUMN userId TO user_id;
ALTER TABLE push_subscriptions RENAME COLUMN userAgent TO user_agent;
ALTER TABLE push_subscriptions RENAME COLUMN isActive TO is_active;
ALTER TABLE push_subscriptions RENAME COLUMN lastUsed TO last_used;
ALTER TABLE push_subscriptions RENAME COLUMN createdAt TO created_at;
ALTER TABLE push_subscriptions RENAME COLUMN updatedAt TO updated_at;

-- Table: quiz_attempts (6 columns)
ALTER TABLE quiz_attempts RENAME COLUMN quizId TO quiz_id;
ALTER TABLE quiz_attempts RENAME COLUMN userId TO user_id;
ALTER TABLE quiz_attempts RENAME COLUMN correctAnswers TO correct_answers;
ALTER TABLE quiz_attempts RENAME COLUMN totalQuestions TO total_questions;
ALTER TABLE quiz_attempts RENAME COLUMN timeSpent TO time_spent;
ALTER TABLE quiz_attempts RENAME COLUMN createdAt TO created_at;

-- Table: quizzes (2 columns)
ALTER TABLE quizzes RENAME COLUMN userId TO user_id;
ALTER TABLE quizzes RENAME COLUMN learningSessionId TO learning_session_id;

-- Table: quota_usage (1 columns)
ALTER TABLE quota_usage RENAME COLUMN userId TO user_id;

-- Table: recurring_transactions (2 columns)
ALTER TABLE recurring_transactions RENAME COLUMN userId TO user_id;
ALTER TABLE recurring_transactions RENAME COLUMN categoryId TO category_id;

-- Table: saved_translations (4 columns)
ALTER TABLE saved_translations RENAME COLUMN userId TO user_id;
ALTER TABLE saved_translations RENAME COLUMN originalText TO original_text;
ALTER TABLE saved_translations RENAME COLUMN translatedText TO translated_text;
ALTER TABLE saved_translations RENAME COLUMN sourceLanguage TO source_language;

-- Table: science_progress (11 columns)
ALTER TABLE science_progress RENAME COLUMN userId TO user_id;
ALTER TABLE science_progress RENAME COLUMN totalExperimentsCompleted TO total_experiments_completed;
ALTER TABLE science_progress RENAME COLUMN physicsExperiments TO physics_experiments;
ALTER TABLE science_progress RENAME COLUMN chemistryExperiments TO chemistry_experiments;
ALTER TABLE science_progress RENAME COLUMN biologyExperiments TO biology_experiments;
ALTER TABLE science_progress RENAME COLUMN averageGrade TO average_grade;
ALTER TABLE science_progress RENAME COLUMN totalLabTime TO total_lab_time;
ALTER TABLE science_progress RENAME COLUMN safetyScore TO safety_score;
ALTER TABLE science_progress RENAME COLUMN lastExperimentDate TO last_experiment_date;
ALTER TABLE science_progress RENAME COLUMN createdAt TO created_at;
ALTER TABLE science_progress RENAME COLUMN updatedAt TO updated_at;

-- Table: shared_budget_activity (2 columns)
ALTER TABLE shared_budget_activity RENAME COLUMN sharedBudgetId TO shared_budget_id;
ALTER TABLE shared_budget_activity RENAME COLUMN userId TO user_id;

-- Table: shared_budget_categories (1 columns)
ALTER TABLE shared_budget_categories RENAME COLUMN sharedBudgetId TO shared_budget_id;

-- Table: shared_budget_members (5 columns)
ALTER TABLE shared_budget_members RENAME COLUMN sharedBudgetId TO shared_budget_id;
ALTER TABLE shared_budget_members RENAME COLUMN userId TO user_id;
ALTER TABLE shared_budget_members RENAME COLUMN invitedBy TO invited_by;
ALTER TABLE shared_budget_members RENAME COLUMN invitedAt TO invited_at;
ALTER TABLE shared_budget_members RENAME COLUMN joinedAt TO joined_at;

-- Table: shared_budget_transactions (3 columns)
ALTER TABLE shared_budget_transactions RENAME COLUMN sharedBudgetId TO shared_budget_id;
ALTER TABLE shared_budget_transactions RENAME COLUMN categoryId TO category_id;
ALTER TABLE shared_budget_transactions RENAME COLUMN userId TO user_id;

-- Table: sleep_tracking (1 columns)
ALTER TABLE sleep_tracking RENAME COLUMN userId TO user_id;

-- Table: split_expenses (5 columns)
ALTER TABLE split_expenses RENAME COLUMN transactionId TO transaction_id;
ALTER TABLE split_expenses RENAME COLUMN userId TO user_id;
ALTER TABLE split_expenses RENAME COLUMN isPaid TO is_paid;
ALTER TABLE split_expenses RENAME COLUMN paidAt TO paid_at;
ALTER TABLE split_expenses RENAME COLUMN createdAt TO created_at;

-- Table: study_guides (2 columns)
ALTER TABLE study_guides RENAME COLUMN userId TO user_id;
ALTER TABLE study_guides RENAME COLUMN learningSessionId TO learning_session_id;

-- Table: topic_progress (2 columns)
ALTER TABLE topic_progress RENAME COLUMN userId TO user_id;
ALTER TABLE topic_progress RENAME COLUMN topicName TO topic_name;

-- Table: topic_quiz_results (2 columns)
ALTER TABLE topic_quiz_results RENAME COLUMN userId TO user_id;
ALTER TABLE topic_quiz_results RENAME COLUMN topicName TO topic_name;

-- Table: translate_conversation_participants (3 columns)
ALTER TABLE translate_conversation_participants RENAME COLUMN conversationId TO conversation_id;
ALTER TABLE translate_conversation_participants RENAME COLUMN userId TO user_id;
ALTER TABLE translate_conversation_participants RENAME COLUMN preferredLanguage TO preferred_language;

-- Table: translate_conversations (1 columns)
ALTER TABLE translate_conversations RENAME COLUMN shareableCode TO shareable_code;

-- Table: translate_message_translations (4 columns)
ALTER TABLE translate_message_translations RENAME COLUMN messageId TO message_id;
ALTER TABLE translate_message_translations RENAME COLUMN userId TO user_id;
ALTER TABLE translate_message_translations RENAME COLUMN translatedText TO translated_text;
ALTER TABLE translate_message_translations RENAME COLUMN targetLanguage TO target_language;

-- Table: translate_messages (4 columns)
ALTER TABLE translate_messages RENAME COLUMN conversationId TO conversation_id;
ALTER TABLE translate_messages RENAME COLUMN senderId TO sender_id;
ALTER TABLE translate_messages RENAME COLUMN originalText TO original_text;
ALTER TABLE translate_messages RENAME COLUMN originalLanguage TO original_language;

-- Table: translation_categories (1 columns)
ALTER TABLE translation_categories RENAME COLUMN userId TO user_id;

-- Table: user_budget_templates (6 columns)
ALTER TABLE user_budget_templates RENAME COLUMN userId TO user_id;
ALTER TABLE user_budget_templates RENAME COLUMN templateId TO template_id;
ALTER TABLE user_budget_templates RENAME COLUMN monthlyIncome TO monthly_income;
ALTER TABLE user_budget_templates RENAME COLUMN appliedAllocations TO applied_allocations;
ALTER TABLE user_budget_templates RENAME COLUMN appliedAt TO applied_at;
ALTER TABLE user_budget_templates RENAME COLUMN isActive TO is_active;

-- Table: user_grammar_progress (2 columns)
ALTER TABLE user_grammar_progress RENAME COLUMN userId TO user_id;
ALTER TABLE user_grammar_progress RENAME COLUMN grammarLessonId TO grammar_lesson_id;

-- Table: user_lab_results (6 columns)
ALTER TABLE user_lab_results RENAME COLUMN userId TO user_id;
ALTER TABLE user_lab_results RENAME COLUMN experimentId TO experiment_id;
ALTER TABLE user_lab_results RENAME COLUMN questionsAnswered TO questions_answered;
ALTER TABLE user_lab_results RENAME COLUMN completedSteps TO completed_steps;
ALTER TABLE user_lab_results RENAME COLUMN timeSpent TO time_spent;
ALTER TABLE user_lab_results RENAME COLUMN completedAt TO completed_at;

-- Table: user_language_progress (1 columns)
ALTER TABLE user_language_progress RENAME COLUMN userId TO user_id;

-- Table: user_learning_badges (3 columns)
ALTER TABLE user_learning_badges RENAME COLUMN userId TO user_id;
ALTER TABLE user_learning_badges RENAME COLUMN badgeId TO badge_id;
ALTER TABLE user_learning_badges RENAME COLUMN earnedAt TO earned_at;

-- Table: user_learning_progress (8 columns)
ALTER TABLE user_learning_progress RENAME COLUMN userId TO user_id;
ALTER TABLE user_learning_progress RENAME COLUMN articleId TO article_id;
ALTER TABLE user_learning_progress RENAME COLUMN progressPercentage TO progress_percentage;
ALTER TABLE user_learning_progress RENAME COLUMN timeSpent TO time_spent;
ALTER TABLE user_learning_progress RENAME COLUMN lastReadAt TO last_read_at;
ALTER TABLE user_learning_progress RENAME COLUMN completedAt TO completed_at;
ALTER TABLE user_learning_progress RENAME COLUMN createdAt TO created_at;
ALTER TABLE user_learning_progress RENAME COLUMN updatedAt TO updated_at;

-- Table: user_profiles (11 columns)
ALTER TABLE user_profiles RENAME COLUMN userId TO user_id;
ALTER TABLE user_profiles RENAME COLUMN sarcasmLevel TO sarcasm_level;
ALTER TABLE user_profiles RENAME COLUMN totalInteractions TO total_interactions;
ALTER TABLE user_profiles RENAME COLUMN positiveResponses TO positive_responses;
ALTER TABLE user_profiles RENAME COLUMN negativeResponses TO negative_responses;
ALTER TABLE user_profiles RENAME COLUMN averageResponseLength TO average_response_length;
ALTER TABLE user_profiles RENAME COLUMN preferredTopics TO preferred_topics;
ALTER TABLE user_profiles RENAME COLUMN interactionPatterns TO interaction_patterns;
ALTER TABLE user_profiles RENAME COLUMN lastInteraction TO last_interaction;
ALTER TABLE user_profiles RENAME COLUMN createdAt TO created_at;
ALTER TABLE user_profiles RENAME COLUMN updatedAt TO updated_at;

-- Table: user_vocabulary (2 columns)
ALTER TABLE user_vocabulary RENAME COLUMN userId TO user_id;
ALTER TABLE user_vocabulary RENAME COLUMN vocabularyItemId TO vocabulary_item_id;

-- Table: user_workout_history (3 columns)
ALTER TABLE user_workout_history RENAME COLUMN userId TO user_id;
ALTER TABLE user_workout_history RENAME COLUMN workoutId TO workout_id;
ALTER TABLE user_workout_history RENAME COLUMN workoutTitle TO workout_title;

-- Table: users (1 columns)
ALTER TABLE users RENAME COLUMN supabaseId TO supabase_id;

-- Table: verified_facts (1 columns)
ALTER TABLE verified_facts RENAME COLUMN normalizedQuestion TO normalized_question;

-- Table: wearable_connections (2 columns)
ALTER TABLE wearable_connections RENAME COLUMN userId TO user_id;
ALTER TABLE wearable_connections RENAME COLUMN deviceName TO device_name;

-- Table: wearable_data_cache (5 columns)
ALTER TABLE wearable_data_cache RENAME COLUMN connectionId TO connection_id;
ALTER TABLE wearable_data_cache RENAME COLUMN userId TO user_id;
ALTER TABLE wearable_data_cache RENAME COLUMN dataType TO data_type;
ALTER TABLE wearable_data_cache RENAME COLUMN rawData TO raw_data;
ALTER TABLE wearable_data_cache RENAME COLUMN createdAt TO created_at;

-- Table: wearable_sync_logs (8 columns)
ALTER TABLE wearable_sync_logs RENAME COLUMN connectionId TO connection_id;
ALTER TABLE wearable_sync_logs RENAME COLUMN userId TO user_id;
ALTER TABLE wearable_sync_logs RENAME COLUMN dataType TO data_type;
ALTER TABLE wearable_sync_logs RENAME COLUMN recordsProcessed TO records_processed;
ALTER TABLE wearable_sync_logs RENAME COLUMN errorMessage TO error_message;
ALTER TABLE wearable_sync_logs RENAME COLUMN syncStartedAt TO sync_started_at;
ALTER TABLE wearable_sync_logs RENAME COLUMN syncCompletedAt TO sync_completed_at;
ALTER TABLE wearable_sync_logs RENAME COLUMN createdAt TO created_at;

-- Table: wellbeing_reminders (1 columns)
ALTER TABLE wellbeing_reminders RENAME COLUMN userId TO user_id;

-- Table: wellness_goals (2 columns)
ALTER TABLE wellness_goals RENAME COLUMN userId TO user_id;
ALTER TABLE wellness_goals RENAME COLUMN goalType TO goal_type;

-- Table: wellness_profiles (6 columns)
ALTER TABLE wellness_profiles RENAME COLUMN userId TO user_id;
ALTER TABLE wellness_profiles RENAME COLUMN fitnessLevel TO fitness_level;
ALTER TABLE wellness_profiles RENAME COLUMN primaryGoals TO primary_goals;
ALTER TABLE wellness_profiles RENAME COLUMN activityLevel TO activity_level;
ALTER TABLE wellness_profiles RENAME COLUMN sleepHoursPerNight TO sleep_hours_per_night;
ALTER TABLE wellness_profiles RENAME COLUMN dietPreference TO diet_preference;
