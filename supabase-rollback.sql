-- Supabase Schema Rollback: Revert snake_case columns to camelCase
-- Use this if you need to undo the migration

-- WARNING: This will rename columns back to their original names.

-- Table: api_usage_logs
ALTER TABLE api_usage_logs RENAME COLUMN api_name TO apiName;

-- Table: audit_logs
ALTER TABLE audit_logs RENAME COLUMN admin_id TO adminId;
ALTER TABLE audit_logs RENAME COLUMN admin_email TO adminEmail;

-- Table: budget_alerts
ALTER TABLE budget_alerts RENAME COLUMN user_id TO userId;
ALTER TABLE budget_alerts RENAME COLUMN category_id TO categoryId;
ALTER TABLE budget_alerts RENAME COLUMN alert_type TO alertType;
ALTER TABLE budget_alerts RENAME COLUMN is_read TO isRead;
ALTER TABLE budget_alerts RENAME COLUMN created_at TO createdAt;

-- Table: budget_categories
ALTER TABLE budget_categories RENAME COLUMN user_id TO userId;

-- Table: budget_transactions
ALTER TABLE budget_transactions RENAME COLUMN user_id TO userId;
ALTER TABLE budget_transactions RENAME COLUMN category_id TO categoryId;
ALTER TABLE budget_transactions RENAME COLUMN transaction_date TO transactionDate;

-- Table: cleanup_logs
ALTER TABLE cleanup_logs RENAME COLUMN cleanup_type TO cleanupType;
ALTER TABLE cleanup_logs RENAME COLUMN files_deleted TO filesDeleted;
ALTER TABLE cleanup_logs RENAME COLUMN space_freed_mb TO spaceFreedMB;

-- Table: coaching_feedback
ALTER TABLE coaching_feedback RENAME COLUMN recommendation_id TO recommendationId;
ALTER TABLE coaching_feedback RENAME COLUMN user_id TO userId;
ALTER TABLE coaching_feedback RENAME COLUMN created_at TO createdAt;

-- Table: coaching_recommendations
ALTER TABLE coaching_recommendations RENAME COLUMN user_id TO userId;
ALTER TABLE coaching_recommendations RENAME COLUMN recommendation_type TO recommendationType;

-- Table: coaching_sessions
ALTER TABLE coaching_sessions RENAME COLUMN user_id TO userId;
ALTER TABLE coaching_sessions RENAME COLUMN session_type TO sessionType;
ALTER TABLE coaching_sessions RENAME COLUMN related_debt_id TO relatedDebtId;
ALTER TABLE coaching_sessions RENAME COLUMN related_milestone_id TO relatedMilestoneId;
ALTER TABLE coaching_sessions RENAME COLUMN user_response TO userResponse;
ALTER TABLE coaching_sessions RENAME COLUMN created_at TO createdAt;

-- Table: conversation_feedback
ALTER TABLE conversation_feedback RENAME COLUMN conversation_id TO conversationId;
ALTER TABLE conversation_feedback RENAME COLUMN user_id TO userId;
ALTER TABLE conversation_feedback RENAME COLUMN feedback_type TO feedbackType;
ALTER TABLE conversation_feedback RENAME COLUMN created_at TO createdAt;

-- Table: conversation_messages
ALTER TABLE conversation_messages RENAME COLUMN session_id TO sessionId;
ALTER TABLE conversation_messages RENAME COLUMN message_text TO messageText;
ALTER TABLE conversation_messages RENAME COLUMN translated_text TO translatedText;

-- Table: conversation_sessions
ALTER TABLE conversation_sessions RENAME COLUMN user_id TO userId;

-- Table: conversations
ALTER TABLE conversations RENAME COLUMN user_id TO userId;
ALTER TABLE conversations RENAME COLUMN user_message TO userMessage;
ALTER TABLE conversations RENAME COLUMN assistant_response TO assistantResponse;
ALTER TABLE conversations RENAME COLUMN audio_url TO audioUrl;

-- Table: daily_activity_stats
ALTER TABLE daily_activity_stats RENAME COLUMN user_id TO userId;

-- Table: daily_lessons
ALTER TABLE daily_lessons RENAME COLUMN user_id TO userId;

-- Table: daily_usage
ALTER TABLE daily_usage RENAME COLUMN user_id TO userId;
ALTER TABLE daily_usage RENAME COLUMN voice_assistant_count TO voiceAssistantCount;
ALTER TABLE daily_usage RENAME COLUMN verified_learning_count TO verifiedLearningCount;
ALTER TABLE daily_usage RENAME COLUMN math_tutor_count TO mathTutorCount;
ALTER TABLE daily_usage RENAME COLUMN translate_count TO translateCount;
ALTER TABLE daily_usage RENAME COLUMN image_ocr_count TO imageOcrCount;
ALTER TABLE daily_usage RENAME COLUMN created_at TO createdAt;
ALTER TABLE daily_usage RENAME COLUMN updated_at TO updatedAt;

-- Table: debt_budget_snapshots
ALTER TABLE debt_budget_snapshots RENAME COLUMN user_id TO userId;
ALTER TABLE debt_budget_snapshots RENAME COLUMN month_year TO monthYear;

-- Table: debt_milestones
ALTER TABLE debt_milestones RENAME COLUMN user_id TO userId;
ALTER TABLE debt_milestones RENAME COLUMN debt_id TO debtId;
ALTER TABLE debt_milestones RENAME COLUMN milestone_type TO milestoneType;

-- Table: debt_payments
ALTER TABLE debt_payments RENAME COLUMN debt_id TO debtId;
ALTER TABLE debt_payments RENAME COLUMN user_id TO userId;
ALTER TABLE debt_payments RENAME COLUMN payment_date TO paymentDate;
ALTER TABLE debt_payments RENAME COLUMN payment_type TO paymentType;
ALTER TABLE debt_payments RENAME COLUMN balance_after TO balanceAfter;
ALTER TABLE debt_payments RENAME COLUMN principal_paid TO principalPaid;
ALTER TABLE debt_payments RENAME COLUMN interest_paid TO interestPaid;
ALTER TABLE debt_payments RENAME COLUMN created_at TO createdAt;

-- Table: debt_strategies
ALTER TABLE debt_strategies RENAME COLUMN user_id TO userId;
ALTER TABLE debt_strategies RENAME COLUMN strategy_type TO strategyType;
ALTER TABLE debt_strategies RENAME COLUMN monthly_extra_payment TO monthlyExtraPayment;
ALTER TABLE debt_strategies RENAME COLUMN projected_payoff_date TO projectedPayoffDate;
ALTER TABLE debt_strategies RENAME COLUMN total_interest_paid TO totalInterestPaid;
ALTER TABLE debt_strategies RENAME COLUMN total_interest_saved TO totalInterestSaved;
ALTER TABLE debt_strategies RENAME COLUMN months_to_payoff TO monthsToPayoff;
ALTER TABLE debt_strategies RENAME COLUMN payoff_order TO payoffOrder;
ALTER TABLE debt_strategies RENAME COLUMN calculated_at TO calculatedAt;

-- Table: debts
ALTER TABLE debts RENAME COLUMN user_id TO userId;
ALTER TABLE debts RENAME COLUMN debt_name TO debtName;

-- Table: error_logs
ALTER TABLE error_logs RENAME COLUMN error_type TO errorType;

-- Table: exercise_attempts
ALTER TABLE exercise_attempts RENAME COLUMN user_id TO userId;
ALTER TABLE exercise_attempts RENAME COLUMN exercise_id TO exerciseId;

-- Table: experiment_steps
ALTER TABLE experiment_steps RENAME COLUMN experiment_id TO experimentId;
ALTER TABLE experiment_steps RENAME COLUMN step_number TO stepNumber;
ALTER TABLE experiment_steps RENAME COLUMN expected_result TO expectedResult;
ALTER TABLE experiment_steps RENAME COLUMN safety_note TO safetyNote;
ALTER TABLE experiment_steps RENAME COLUMN image_url TO imageUrl;

-- Table: fact_access_log
ALTER TABLE fact_access_log RENAME COLUMN user_id TO userId;
ALTER TABLE fact_access_log RENAME COLUMN verified_fact_id TO verifiedFactId;
ALTER TABLE fact_access_log RENAME COLUMN fact_version TO factVersion;
ALTER TABLE fact_access_log RENAME COLUMN accessed_at TO accessedAt;
ALTER TABLE fact_access_log RENAME COLUMN access_source TO accessSource;

-- Table: fact_check_results
ALTER TABLE fact_check_results RENAME COLUMN learning_session_id TO learningSessionId;
ALTER TABLE fact_check_results RENAME COLUMN verification_status TO verificationStatus;
ALTER TABLE fact_check_results RENAME COLUMN confidence_score TO confidenceScore;
ALTER TABLE fact_check_results RENAME COLUMN created_at TO createdAt;

-- Table: fact_update_notifications
ALTER TABLE fact_update_notifications RENAME COLUMN user_id TO userId;
ALTER TABLE fact_update_notifications RENAME COLUMN verified_fact_id TO verifiedFactId;
ALTER TABLE fact_update_notifications RENAME COLUMN old_version TO oldVersion;
ALTER TABLE fact_update_notifications RENAME COLUMN new_version TO newVersion;
ALTER TABLE fact_update_notifications RENAME COLUMN notification_type TO notificationType;

-- Table: finance_articles
ALTER TABLE finance_articles RENAME COLUMN tier_id TO tierId;

-- Table: financial_goals
ALTER TABLE financial_goals RENAME COLUMN user_id TO userId;

-- Table: financial_insights
ALTER TABLE financial_insights RENAME COLUMN user_id TO userId;
ALTER TABLE financial_insights RENAME COLUMN insight_type TO insightType;

-- Table: food_log
ALTER TABLE food_log RENAME COLUMN user_id TO userId;

-- Table: goal_milestones
ALTER TABLE goal_milestones RENAME COLUMN goal_id TO goalId;
ALTER TABLE goal_milestones RENAME COLUMN milestone_percentage TO milestonePercentage;
ALTER TABLE goal_milestones RENAME COLUMN achieved_date TO achievedDate;
ALTER TABLE goal_milestones RENAME COLUMN celebration_shown TO celebrationShown;
ALTER TABLE goal_milestones RENAME COLUMN created_at TO createdAt;

-- Table: goal_progress_history
ALTER TABLE goal_progress_history RENAME COLUMN goal_id TO goalId;
ALTER TABLE goal_progress_history RENAME COLUMN new_total TO newTotal;
ALTER TABLE goal_progress_history RENAME COLUMN progress_date TO progressDate;

-- Table: health_metrics
ALTER TABLE health_metrics RENAME COLUMN user_id TO userId;

-- Table: hub_trials
ALTER TABLE hub_trials RENAME COLUMN user_id TO userId;
ALTER TABLE hub_trials RENAME COLUMN hub_id TO hubId;
ALTER TABLE hub_trials RENAME COLUMN started_at TO startedAt;
ALTER TABLE hub_trials RENAME COLUMN expires_at TO expiresAt;
ALTER TABLE hub_trials RENAME COLUMN created_at TO createdAt;
ALTER TABLE hub_trials RENAME COLUMN updated_at TO updatedAt;

-- Table: hydration_log
ALTER TABLE hydration_log RENAME COLUMN user_id TO userId;

-- Table: iot_command_history
ALTER TABLE iot_command_history RENAME COLUMN user_id TO userId;
ALTER TABLE iot_command_history RENAME COLUMN device_id TO deviceId;

-- Table: iot_devices
ALTER TABLE iot_devices RENAME COLUMN user_id TO userId;
ALTER TABLE iot_devices RENAME COLUMN device_id TO deviceId;

-- Table: journal_entries
ALTER TABLE journal_entries RENAME COLUMN user_id TO userId;

-- Table: lab_quiz_attempts
ALTER TABLE lab_quiz_attempts RENAME COLUMN user_id TO userId;
ALTER TABLE lab_quiz_attempts RENAME COLUMN experiment_id TO experimentId;
ALTER TABLE lab_quiz_attempts RENAME COLUMN total_questions TO totalQuestions;
ALTER TABLE lab_quiz_attempts RENAME COLUMN correct_answers TO correctAnswers;
ALTER TABLE lab_quiz_attempts RENAME COLUMN time_spent TO timeSpent;
ALTER TABLE lab_quiz_attempts RENAME COLUMN attempted_at TO attemptedAt;

-- Table: lab_quiz_questions
ALTER TABLE lab_quiz_questions RENAME COLUMN experiment_id TO experimentId;
ALTER TABLE lab_quiz_questions RENAME COLUMN correct_answer TO correctAnswer;

-- Table: language_achievements
ALTER TABLE language_achievements RENAME COLUMN user_id TO userId;

-- Table: learning_sessions
ALTER TABLE learning_sessions RENAME COLUMN user_id TO userId;

-- Table: learning_sources
ALTER TABLE learning_sources RENAME COLUMN fact_check_result_id TO factCheckResultId;

-- Table: math_progress
ALTER TABLE math_progress RENAME COLUMN user_id TO userId;
ALTER TABLE math_progress RENAME COLUMN total_problems_attempted TO totalProblemsAttempted;
ALTER TABLE math_progress RENAME COLUMN total_problems_solved TO totalProblemsSolved;
ALTER TABLE math_progress RENAME COLUMN topics_explored TO topicsExplored;
ALTER TABLE math_progress RENAME COLUMN current_streak TO currentStreak;
ALTER TABLE math_progress RENAME COLUMN longest_streak TO longestStreak;
ALTER TABLE math_progress RENAME COLUMN last_practice_date TO lastPracticeDate;
ALTER TABLE math_progress RENAME COLUMN created_at TO createdAt;
ALTER TABLE math_progress RENAME COLUMN updated_at TO updatedAt;

-- Table: math_solutions
ALTER TABLE math_solutions RENAME COLUMN user_id TO userId;
ALTER TABLE math_solutions RENAME COLUMN problem_id TO problemId;
ALTER TABLE math_solutions RENAME COLUMN problem_text TO problemText;
ALTER TABLE math_solutions RENAME COLUMN user_answer TO userAnswer;

-- Table: meditation_sessions
ALTER TABLE meditation_sessions RENAME COLUMN user_id TO userId;

-- Table: monthly_budget_summaries
ALTER TABLE monthly_budget_summaries RENAME COLUMN user_id TO userId;
ALTER TABLE monthly_budget_summaries RENAME COLUMN month_year TO monthYear;

-- Table: mood_log
ALTER TABLE mood_log RENAME COLUMN user_id TO userId;

-- Table: notification_preferences
ALTER TABLE notification_preferences RENAME COLUMN user_id TO userId;
ALTER TABLE notification_preferences RENAME COLUMN budget_alerts_enabled TO budgetAlertsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN threshold80_enabled TO threshold80Enabled;
ALTER TABLE notification_preferences RENAME COLUMN threshold100_enabled TO threshold100Enabled;
ALTER TABLE notification_preferences RENAME COLUMN exceeded_enabled TO exceededEnabled;
ALTER TABLE notification_preferences RENAME COLUMN weekly_summary_enabled TO weeklySummaryEnabled;
ALTER TABLE notification_preferences RENAME COLUMN monthly_summary_enabled TO monthlySummaryEnabled;
ALTER TABLE notification_preferences RENAME COLUMN insights_enabled TO insightsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN recurring_alerts_enabled TO recurringAlertsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN debt_milestones_enabled TO debtMilestonesEnabled;
ALTER TABLE notification_preferences RENAME COLUMN debt_payment_reminders_enabled TO debtPaymentRemindersEnabled;
ALTER TABLE notification_preferences RENAME COLUMN debt_strategy_updates_enabled TO debtStrategyUpdatesEnabled;
ALTER TABLE notification_preferences RENAME COLUMN learning_achievements_enabled TO learningAchievementsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN streak_reminders_enabled TO streakRemindersEnabled;
ALTER TABLE notification_preferences RENAME COLUMN quiz_results_enabled TO quizResultsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN fact_updates_enabled TO factUpdatesEnabled;
ALTER TABLE notification_preferences RENAME COLUMN system_alerts_enabled TO systemAlertsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN security_alerts_enabled TO securityAlertsEnabled;
ALTER TABLE notification_preferences RENAME COLUMN notification_method TO notificationMethod;
ALTER TABLE notification_preferences RENAME COLUMN quiet_hours_start TO quietHoursStart;
ALTER TABLE notification_preferences RENAME COLUMN quiet_hours_end TO quietHoursEnd;
ALTER TABLE notification_preferences RENAME COLUMN created_at TO createdAt;
ALTER TABLE notification_preferences RENAME COLUMN updated_at TO updatedAt;

-- Table: practice_sessions
ALTER TABLE practice_sessions RENAME COLUMN user_id TO userId;
ALTER TABLE practice_sessions RENAME COLUMN topic_name TO topicName;

-- Table: push_subscriptions
ALTER TABLE push_subscriptions RENAME COLUMN user_id TO userId;
ALTER TABLE push_subscriptions RENAME COLUMN user_agent TO userAgent;
ALTER TABLE push_subscriptions RENAME COLUMN is_active TO isActive;
ALTER TABLE push_subscriptions RENAME COLUMN last_used TO lastUsed;
ALTER TABLE push_subscriptions RENAME COLUMN created_at TO createdAt;
ALTER TABLE push_subscriptions RENAME COLUMN updated_at TO updatedAt;

-- Table: quiz_attempts
ALTER TABLE quiz_attempts RENAME COLUMN quiz_id TO quizId;
ALTER TABLE quiz_attempts RENAME COLUMN user_id TO userId;
ALTER TABLE quiz_attempts RENAME COLUMN correct_answers TO correctAnswers;
ALTER TABLE quiz_attempts RENAME COLUMN total_questions TO totalQuestions;
ALTER TABLE quiz_attempts RENAME COLUMN time_spent TO timeSpent;
ALTER TABLE quiz_attempts RENAME COLUMN created_at TO createdAt;

-- Table: quizzes
ALTER TABLE quizzes RENAME COLUMN user_id TO userId;
ALTER TABLE quizzes RENAME COLUMN learning_session_id TO learningSessionId;

-- Table: quota_usage
ALTER TABLE quota_usage RENAME COLUMN user_id TO userId;

-- Table: recurring_transactions
ALTER TABLE recurring_transactions RENAME COLUMN user_id TO userId;
ALTER TABLE recurring_transactions RENAME COLUMN category_id TO categoryId;

-- Table: saved_translations
ALTER TABLE saved_translations RENAME COLUMN user_id TO userId;
ALTER TABLE saved_translations RENAME COLUMN original_text TO originalText;
ALTER TABLE saved_translations RENAME COLUMN translated_text TO translatedText;
ALTER TABLE saved_translations RENAME COLUMN source_language TO sourceLanguage;

-- Table: science_progress
ALTER TABLE science_progress RENAME COLUMN user_id TO userId;
ALTER TABLE science_progress RENAME COLUMN total_experiments_completed TO totalExperimentsCompleted;
ALTER TABLE science_progress RENAME COLUMN physics_experiments TO physicsExperiments;
ALTER TABLE science_progress RENAME COLUMN chemistry_experiments TO chemistryExperiments;
ALTER TABLE science_progress RENAME COLUMN biology_experiments TO biologyExperiments;
ALTER TABLE science_progress RENAME COLUMN average_grade TO averageGrade;
ALTER TABLE science_progress RENAME COLUMN total_lab_time TO totalLabTime;
ALTER TABLE science_progress RENAME COLUMN safety_score TO safetyScore;
ALTER TABLE science_progress RENAME COLUMN last_experiment_date TO lastExperimentDate;
ALTER TABLE science_progress RENAME COLUMN created_at TO createdAt;
ALTER TABLE science_progress RENAME COLUMN updated_at TO updatedAt;

-- Table: shared_budget_activity
ALTER TABLE shared_budget_activity RENAME COLUMN shared_budget_id TO sharedBudgetId;
ALTER TABLE shared_budget_activity RENAME COLUMN user_id TO userId;

-- Table: shared_budget_categories
ALTER TABLE shared_budget_categories RENAME COLUMN shared_budget_id TO sharedBudgetId;

-- Table: shared_budget_members
ALTER TABLE shared_budget_members RENAME COLUMN shared_budget_id TO sharedBudgetId;
ALTER TABLE shared_budget_members RENAME COLUMN user_id TO userId;
ALTER TABLE shared_budget_members RENAME COLUMN invited_by TO invitedBy;
ALTER TABLE shared_budget_members RENAME COLUMN invited_at TO invitedAt;
ALTER TABLE shared_budget_members RENAME COLUMN joined_at TO joinedAt;

-- Table: shared_budget_transactions
ALTER TABLE shared_budget_transactions RENAME COLUMN shared_budget_id TO sharedBudgetId;
ALTER TABLE shared_budget_transactions RENAME COLUMN category_id TO categoryId;
ALTER TABLE shared_budget_transactions RENAME COLUMN user_id TO userId;

-- Table: sleep_tracking
ALTER TABLE sleep_tracking RENAME COLUMN user_id TO userId;

-- Table: split_expenses
ALTER TABLE split_expenses RENAME COLUMN transaction_id TO transactionId;
ALTER TABLE split_expenses RENAME COLUMN user_id TO userId;
ALTER TABLE split_expenses RENAME COLUMN is_paid TO isPaid;
ALTER TABLE split_expenses RENAME COLUMN paid_at TO paidAt;
ALTER TABLE split_expenses RENAME COLUMN created_at TO createdAt;

-- Table: study_guides
ALTER TABLE study_guides RENAME COLUMN user_id TO userId;
ALTER TABLE study_guides RENAME COLUMN learning_session_id TO learningSessionId;

-- Table: topic_progress
ALTER TABLE topic_progress RENAME COLUMN user_id TO userId;
ALTER TABLE topic_progress RENAME COLUMN topic_name TO topicName;

-- Table: topic_quiz_results
ALTER TABLE topic_quiz_results RENAME COLUMN user_id TO userId;
ALTER TABLE topic_quiz_results RENAME COLUMN topic_name TO topicName;

-- Table: translate_conversation_participants
ALTER TABLE translate_conversation_participants RENAME COLUMN conversation_id TO conversationId;
ALTER TABLE translate_conversation_participants RENAME COLUMN user_id TO userId;
ALTER TABLE translate_conversation_participants RENAME COLUMN preferred_language TO preferredLanguage;

-- Table: translate_conversations
ALTER TABLE translate_conversations RENAME COLUMN shareable_code TO shareableCode;

-- Table: translate_message_translations
ALTER TABLE translate_message_translations RENAME COLUMN message_id TO messageId;
ALTER TABLE translate_message_translations RENAME COLUMN user_id TO userId;
ALTER TABLE translate_message_translations RENAME COLUMN translated_text TO translatedText;
ALTER TABLE translate_message_translations RENAME COLUMN target_language TO targetLanguage;

-- Table: translate_messages
ALTER TABLE translate_messages RENAME COLUMN conversation_id TO conversationId;
ALTER TABLE translate_messages RENAME COLUMN sender_id TO senderId;
ALTER TABLE translate_messages RENAME COLUMN original_text TO originalText;
ALTER TABLE translate_messages RENAME COLUMN original_language TO originalLanguage;

-- Table: translation_categories
ALTER TABLE translation_categories RENAME COLUMN user_id TO userId;

-- Table: user_budget_templates
ALTER TABLE user_budget_templates RENAME COLUMN user_id TO userId;
ALTER TABLE user_budget_templates RENAME COLUMN template_id TO templateId;
ALTER TABLE user_budget_templates RENAME COLUMN monthly_income TO monthlyIncome;
ALTER TABLE user_budget_templates RENAME COLUMN applied_allocations TO appliedAllocations;
ALTER TABLE user_budget_templates RENAME COLUMN applied_at TO appliedAt;
ALTER TABLE user_budget_templates RENAME COLUMN is_active TO isActive;

-- Table: user_grammar_progress
ALTER TABLE user_grammar_progress RENAME COLUMN user_id TO userId;
ALTER TABLE user_grammar_progress RENAME COLUMN grammar_lesson_id TO grammarLessonId;

-- Table: user_lab_results
ALTER TABLE user_lab_results RENAME COLUMN user_id TO userId;
ALTER TABLE user_lab_results RENAME COLUMN experiment_id TO experimentId;
ALTER TABLE user_lab_results RENAME COLUMN questions_answered TO questionsAnswered;
ALTER TABLE user_lab_results RENAME COLUMN completed_steps TO completedSteps;
ALTER TABLE user_lab_results RENAME COLUMN time_spent TO timeSpent;
ALTER TABLE user_lab_results RENAME COLUMN completed_at TO completedAt;

-- Table: user_language_progress
ALTER TABLE user_language_progress RENAME COLUMN user_id TO userId;

-- Table: user_learning_badges
ALTER TABLE user_learning_badges RENAME COLUMN user_id TO userId;
ALTER TABLE user_learning_badges RENAME COLUMN badge_id TO badgeId;
ALTER TABLE user_learning_badges RENAME COLUMN earned_at TO earnedAt;

-- Table: user_learning_progress
ALTER TABLE user_learning_progress RENAME COLUMN user_id TO userId;
ALTER TABLE user_learning_progress RENAME COLUMN article_id TO articleId;
ALTER TABLE user_learning_progress RENAME COLUMN progress_percentage TO progressPercentage;
ALTER TABLE user_learning_progress RENAME COLUMN time_spent TO timeSpent;
ALTER TABLE user_learning_progress RENAME COLUMN last_read_at TO lastReadAt;
ALTER TABLE user_learning_progress RENAME COLUMN completed_at TO completedAt;
ALTER TABLE user_learning_progress RENAME COLUMN created_at TO createdAt;
ALTER TABLE user_learning_progress RENAME COLUMN updated_at TO updatedAt;

-- Table: user_profiles
ALTER TABLE user_profiles RENAME COLUMN user_id TO userId;
ALTER TABLE user_profiles RENAME COLUMN sarcasm_level TO sarcasmLevel;
ALTER TABLE user_profiles RENAME COLUMN total_interactions TO totalInteractions;
ALTER TABLE user_profiles RENAME COLUMN positive_responses TO positiveResponses;
ALTER TABLE user_profiles RENAME COLUMN negative_responses TO negativeResponses;
ALTER TABLE user_profiles RENAME COLUMN average_response_length TO averageResponseLength;
ALTER TABLE user_profiles RENAME COLUMN preferred_topics TO preferredTopics;
ALTER TABLE user_profiles RENAME COLUMN interaction_patterns TO interactionPatterns;
ALTER TABLE user_profiles RENAME COLUMN last_interaction TO lastInteraction;
ALTER TABLE user_profiles RENAME COLUMN created_at TO createdAt;
ALTER TABLE user_profiles RENAME COLUMN updated_at TO updatedAt;

-- Table: user_vocabulary
ALTER TABLE user_vocabulary RENAME COLUMN user_id TO userId;
ALTER TABLE user_vocabulary RENAME COLUMN vocabulary_item_id TO vocabularyItemId;

-- Table: user_workout_history
ALTER TABLE user_workout_history RENAME COLUMN user_id TO userId;
ALTER TABLE user_workout_history RENAME COLUMN workout_id TO workoutId;
ALTER TABLE user_workout_history RENAME COLUMN workout_title TO workoutTitle;

-- Table: users
ALTER TABLE users RENAME COLUMN supabase_id TO supabaseId;

-- Table: verified_facts
ALTER TABLE verified_facts RENAME COLUMN normalized_question TO normalizedQuestion;

-- Table: wearable_connections
ALTER TABLE wearable_connections RENAME COLUMN user_id TO userId;
ALTER TABLE wearable_connections RENAME COLUMN device_name TO deviceName;

-- Table: wearable_data_cache
ALTER TABLE wearable_data_cache RENAME COLUMN connection_id TO connectionId;
ALTER TABLE wearable_data_cache RENAME COLUMN user_id TO userId;
ALTER TABLE wearable_data_cache RENAME COLUMN data_type TO dataType;
ALTER TABLE wearable_data_cache RENAME COLUMN raw_data TO rawData;
ALTER TABLE wearable_data_cache RENAME COLUMN created_at TO createdAt;

-- Table: wearable_sync_logs
ALTER TABLE wearable_sync_logs RENAME COLUMN connection_id TO connectionId;
ALTER TABLE wearable_sync_logs RENAME COLUMN user_id TO userId;
ALTER TABLE wearable_sync_logs RENAME COLUMN data_type TO dataType;
ALTER TABLE wearable_sync_logs RENAME COLUMN records_processed TO recordsProcessed;
ALTER TABLE wearable_sync_logs RENAME COLUMN error_message TO errorMessage;
ALTER TABLE wearable_sync_logs RENAME COLUMN sync_started_at TO syncStartedAt;
ALTER TABLE wearable_sync_logs RENAME COLUMN sync_completed_at TO syncCompletedAt;
ALTER TABLE wearable_sync_logs RENAME COLUMN created_at TO createdAt;

-- Table: wellbeing_reminders
ALTER TABLE wellbeing_reminders RENAME COLUMN user_id TO userId;

-- Table: wellness_goals
ALTER TABLE wellness_goals RENAME COLUMN user_id TO userId;
ALTER TABLE wellness_goals RENAME COLUMN goal_type TO goalType;

-- Table: wellness_profiles
ALTER TABLE wellness_profiles RENAME COLUMN user_id TO userId;
ALTER TABLE wellness_profiles RENAME COLUMN fitness_level TO fitnessLevel;
ALTER TABLE wellness_profiles RENAME COLUMN primary_goals TO primaryGoals;
ALTER TABLE wellness_profiles RENAME COLUMN activity_level TO activityLevel;
ALTER TABLE wellness_profiles RENAME COLUMN sleep_hours_per_night TO sleepHoursPerNight;
ALTER TABLE wellness_profiles RENAME COLUMN diet_preference TO dietPreference;
