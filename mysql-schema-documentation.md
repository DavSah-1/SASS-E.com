# MySQL (Admin) Database Schema
================================================================================

Total Tables: 102

================================================================================

## Table List

1. **users** (const: `users`)
2. **conversations** (const: `conversations`)
3. **iot_devices** (const: `iotDevices`)
4. **iot_command_history** (const: `iotCommandHistory`)
5. **user_profiles** (const: `userProfiles`)
6. **conversation_feedback** (const: `conversationFeedback`)
7. **learning_sessions** (const: `learningSessions`)
8. **fact_check_results** (const: `factCheckResults`)
9. **learning_sources** (const: `learningSources`)
10. **study_guides** (const: `studyGuides`)
11. **quizzes** (const: `quizzes`)
12. **quiz_attempts** (const: `quizAttempts`)
13. **vocabulary_items** (const: `vocabularyItems`)
14. **user_vocabulary** (const: `userVocabulary`)
15. **grammar_lessons** (const: `grammarLessons`)
16. **user_grammar_progress** (const: `userGrammarProgress`)
17. **language_exercises** (const: `languageExercises`)
18. **exercise_attempts** (const: `exerciseAttempts`)
19. **user_language_progress** (const: `userLanguageProgress`)
20. **daily_lessons** (const: `dailyLessons`)
21. **language_achievements** (const: `languageAchievements`)
22. **debts** (const: `debts`)
23. **debt_payments** (const: `debtPayments`)
24. **debt_milestones** (const: `debtMilestones`)
25. **debt_strategies** (const: `debtStrategies`)
26. **coaching_sessions** (const: `coachingSessions`)
27. **debt_budget_snapshots** (const: `debtBudgetSnapshots`)
28. **budget_categories** (const: `budgetCategories`)
29. **budget_transactions** (const: `budgetTransactions`)
30. **monthly_budget_summaries** (const: `monthlyBudgetSummaries`)
31. **financial_goals** (const: `financialGoals`)
32. **goal_milestones** (const: `goalMilestones`)
33. **goal_progress_history** (const: `goalProgressHistory`)
34. **math_problems** (const: `mathProblems`)
35. **math_solutions** (const: `mathSolutions`)
36. **math_progress** (const: `mathProgress`)
37. **experiments** (const: `experiments`)
38. **experiment_steps** (const: `experimentSteps`)
39. **user_lab_results** (const: `userLabResults`)
40. **science_progress** (const: `scienceProgress`)
41. **lab_quiz_questions** (const: `labQuizQuestions`)
42. **lab_quiz_attempts** (const: `labQuizAttempts`)
43. **budget_alerts** (const: `budgetAlerts`)
44. **financial_insights** (const: `financialInsights`)
45. **budget_templates** (const: `budgetTemplates`)
46. **user_budget_templates** (const: `userBudgetTemplates`)
47. **notification_preferences** (const: `notificationPreferences`)
48. **push_subscriptions** (const: `pushSubscriptions`)
49. **recurring_transactions** (const: `recurringTransactions`)
50. **shared_budgets** (const: `sharedBudgets`)
51. **shared_budget_members** (const: `sharedBudgetMembers`)
52. **shared_budget_categories** (const: `sharedBudgetCategories`)
53. **shared_budget_transactions** (const: `sharedBudgetTransactions`)
54. **split_expenses** (const: `splitExpenses`)
55. **shared_budget_activity** (const: `sharedBudgetActivity`)
56. **workouts** (const: `workouts`)
57. **user_workout_history** (const: `userWorkoutHistory`)
58. **daily_activity_stats** (const: `dailyActivityStats`)
59. **food_log** (const: `foodLog`)
60. **hydration_log** (const: `hydrationLog`)
61. **meditation_sessions** (const: `meditationSessions`)
62. **mood_log** (const: `moodLog`)
63. **journal_entries** (const: `journalEntries`)
64. **sleep_tracking** (const: `sleepTracking`)
65. **health_metrics** (const: `healthMetrics`)
66. **wellbeing_reminders** (const: `wellbeingReminders`)
67. **wearable_connections** (const: `wearableConnections`)
68. **wearable_sync_logs** (const: `wearableSyncLogs`)
69. **wearable_data_cache** (const: `wearableDataCache`)
70. **wellness_profiles** (const: `wellnessProfiles`)
71. **wellness_goals** (const: `wellnessGoals`)
72. **coaching_recommendations** (const: `coachingRecommendations`)
73. **coaching_feedback** (const: `coachingFeedback`)
74. **verified_facts** (const: `verifiedFacts`)
75. **fact_access_log** (const: `factAccessLog`)
76. **fact_update_notifications** (const: `factUpdateNotifications`)
77. **translation_categories** (const: `translationCategories`)
78. **saved_translations** (const: `savedTranslations`)
79. **conversation_sessions** (const: `conversationSessions`)
80. **conversation_messages** (const: `conversationMessages`)
81. **topic_progress** (const: `topicProgress`)
82. **topic_quiz_results** (const: `topicQuizResults`)
83. **practice_sessions** (const: `practiceSessions`)
84. **translate_conversations** (const: `translateConversations`)
85. **translate_conversation_participants** (const: `translateConversationParticipants`)
86. **translate_messages** (const: `translateMessages`)
87. **translate_message_translations** (const: `translateMessageTranslations`)
88. **daily_usage** (const: `dailyUsage`)
89. **learning_tiers** (const: `learningTiers`)
90. **finance_articles** (const: `financeArticles`)
91. **user_learning_progress** (const: `userLearningProgress`)
92. **financial_glossary** (const: `financialGlossary`)
93. **learning_badges** (const: `learningBadges`)
94. **user_learning_badges** (const: `userLearningBadges`)
95. **hub_trials** (const: `hubTrials`)
96. **quota_usage** (const: `quotaUsage`)
97. **cleanup_logs** (const: `cleanupLogs`)
98. **system_logs** (const: `systemLogs`)
99. **performance_metrics** (const: `performanceMetrics`)
100. **error_logs** (const: `errorLogs`)
101. **api_usage_logs** (const: `apiUsageLogs`)
102. **audit_logs** (const: `auditLogs`)

================================================================================

## Detailed Table Definitions


### users → `users`
Line: 10


### conversations → `conversations`
Line: 52


### iotDevices → `iot_devices`
Line: 71


### iotCommandHistory → `iot_command_history`
Line: 101


### userProfiles → `user_profiles`
Line: 123


### conversationFeedback → `conversation_feedback`
Line: 144


### learningSessions → `learning_sessions`
Line: 160


### factCheckResults → `fact_check_results`
Line: 178


### learningSources → `learning_sources`
Line: 195


### studyGuides → `study_guides`
Line: 212


### quizzes → `quizzes`
Line: 230


### quizAttempts → `quiz_attempts`
Line: 246


### vocabularyItems → `vocabulary_items`
Line: 269


### userVocabulary → `user_vocabulary`
Line: 292


### grammarLessons → `grammar_lessons`
Line: 313


### userGrammarProgress → `user_grammar_progress`
Line: 333


### languageExercises → `language_exercises`
Line: 352


### exerciseAttempts → `exercise_attempts`
Line: 374


### userLanguageProgress → `user_language_progress`
Line: 392


### dailyLessons → `daily_lessons`
Line: 416


### languageAchievements → `language_achievements`
Line: 437


### debts → `debts`
Line: 454


### debtPayments → `debt_payments`
Line: 479


### debtMilestones → `debt_milestones`
Line: 499


### debtStrategies → `debt_strategies`
Line: 527


### coachingSessions → `coaching_sessions`
Line: 546


### debtBudgetSnapshots → `debt_budget_snapshots`
Line: 573


### budgetCategories → `budget_categories`
Line: 592


### budgetTransactions → `budget_transactions`
Line: 612


### monthlyBudgetSummaries → `monthly_budget_summaries`
Line: 638


### financialGoals → `financial_goals`
Line: 661


### goalMilestones → `goal_milestones`
Line: 692


### goalProgressHistory → `goal_progress_history`
Line: 708


### mathProblems → `math_problems`
Line: 725


### mathSolutions → `math_solutions`
Line: 745


### mathProgress → `math_progress`
Line: 764


### experiments → `experiments`
Line: 783


### experimentSteps → `experiment_steps`
Line: 804


### userLabResults → `user_lab_results`
Line: 822


### scienceProgress → `science_progress`
Line: 844


### labQuizQuestions → `lab_quiz_questions`
Line: 865


### labQuizAttempts → `lab_quiz_attempts`
Line: 882


### budgetAlerts → `budget_alerts`
Line: 901


### financialInsights → `financial_insights`
Line: 918


### budgetTemplates → `budget_templates`
Line: 940


### userBudgetTemplates → `user_budget_templates`
Line: 962


### notificationPreferences → `notification_preferences`
Line: 978


### pushSubscriptions → `push_subscriptions`
Line: 1016


### recurringTransactions → `recurring_transactions`
Line: 1038


### sharedBudgets → `shared_budgets`
Line: 1063


### sharedBudgetMembers → `shared_budget_members`
Line: 1079


### sharedBudgetCategories → `shared_budget_categories`
Line: 1096


### sharedBudgetTransactions → `shared_budget_transactions`
Line: 1115


### splitExpenses → `split_expenses`
Line: 1136


### sharedBudgetActivity → `shared_budget_activity`
Line: 1153


### workouts → `workouts`
Line: 1175


### userWorkoutHistory → `user_workout_history`
Line: 1198


### dailyActivityStats → `daily_activity_stats`
Line: 1215


### foodLog → `food_log`
Line: 1233


### hydrationLog → `hydration_log`
Line: 1267


### meditationSessions → `meditation_sessions`
Line: 1281


### moodLog → `mood_log`
Line: 1297


### journalEntries → `journal_entries`
Line: 1315


### sleepTracking → `sleep_tracking`
Line: 1332


### healthMetrics → `health_metrics`
Line: 1350


### wellbeingReminders → `wellbeing_reminders`
Line: 1370


### wearableConnections → `wearable_connections`
Line: 1388


### wearableSyncLogs → `wearable_sync_logs`
Line: 1409


### wearableDataCache → `wearable_data_cache`
Line: 1428


### wellnessProfiles → `wellness_profiles`
Line: 1445


### wellnessGoals → `wellness_goals`
Line: 1479


### coachingRecommendations → `coaching_recommendations`
Line: 1501


### coachingFeedback → `coaching_feedback`
Line: 1531


### verifiedFacts → `verified_facts`
Line: 1549


### factAccessLog → `fact_access_log`
Line: 1584


### factUpdateNotifications → `fact_update_notifications`
Line: 1601


### translationCategories → `translation_categories`
Line: 1648


### savedTranslations → `saved_translations`
Line: 1662


### conversationSessions → `conversation_sessions`
Line: 1682


### conversationMessages → `conversation_messages`
Line: 1698


### topicProgress → `topic_progress`
Line: 1714


### topicQuizResults → `topic_quiz_results`
Line: 1736


### practiceSessions → `practice_sessions`
Line: 1757


### translateConversations → `translate_conversations`
Line: 1776


### translateConversationParticipants → `translate_conversation_participants`
Line: 1793


### translateMessages → `translate_messages`
Line: 1807


### translateMessageTranslations → `translate_message_translations`
Line: 1822


### dailyUsage → `daily_usage`
Line: 1837


### learningTiers → `learning_tiers`
Line: 1861


### financeArticles → `finance_articles`
Line: 1878


### userLearningProgress → `user_learning_progress`
Line: 1903


### financialGlossary → `financial_glossary`
Line: 1923


### learningBadges → `learning_badges`
Line: 1941


### userLearningBadges → `user_learning_badges`
Line: 1957


### hubTrials → `hub_trials`
Line: 1971


### quotaUsage → `quota_usage`
Line: 1991


### cleanupLogs → `cleanup_logs`
Line: 2011


### systemLogs → `system_logs`
Line: 2032


### performanceMetrics → `performance_metrics`
Line: 2053


### errorLogs → `error_logs`
Line: 2072


### apiUsageLogs → `api_usage_logs`
Line: 2097


### auditLogs → `audit_logs`
Line: 2122
