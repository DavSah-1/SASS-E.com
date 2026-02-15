CREATE TABLE `api_usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiName` varchar(255) NOT NULL,
	`endpoint` varchar(512),
	`method` varchar(10),
	`statusCode` int,
	`duration` int,
	`quotaUsed` int NOT NULL DEFAULT 1,
	`userId` int,
	`success` boolean NOT NULL,
	`errorMessage` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `audit_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`adminId` int NOT NULL,
	`adminEmail` varchar(320),
	`actionType` varchar(100) NOT NULL,
	`targetUserId` int,
	`targetUserEmail` varchar(320),
	`details` text,
	`ipAddress` varchar(45),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_alerts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int,
	`alertType` enum('threshold_80','threshold_100','exceeded','weekly_summary','monthly_report') NOT NULL,
	`threshold` int,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `budget_alerts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`monthlyLimit` int,
	`color` varchar(7) NOT NULL,
	`icon` varchar(50),
	`isDefault` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100) NOT NULL,
	`description` text NOT NULL,
	`strategy` enum('50_30_20','zero_based','envelope','custom') NOT NULL,
	`isSystemTemplate` int NOT NULL DEFAULT 1,
	`userId` int,
	`allocations` text NOT NULL,
	`categoryMappings` text,
	`icon` varchar(10) DEFAULT '📊',
	`sortOrder` int NOT NULL DEFAULT 0,
	`usageCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`amount` int NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`description` varchar(255),
	`notes` text,
	`isRecurring` int NOT NULL DEFAULT 0,
	`recurringFrequency` enum('weekly','biweekly','monthly','yearly'),
	`tags` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cleanup_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cleanupType` enum('age_based','storage_based','manual') NOT NULL,
	`filesDeleted` int NOT NULL DEFAULT 0,
	`spaceFreedMB` decimal(10,2) NOT NULL DEFAULT '0.00',
	`errors` text,
	`triggeredBy` int,
	`status` enum('success','partial','failed') NOT NULL,
	`executionTimeMs` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `cleanup_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recommendationId` int NOT NULL,
	`userId` int NOT NULL,
	`helpful` int,
	`rating` int,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recommendationType` enum('workout','nutrition','mental_wellness','sleep','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`reasoning` text,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`actionable` int NOT NULL DEFAULT 1,
	`actionUrl` varchar(512),
	`basedOnData` text,
	`viewed` int NOT NULL DEFAULT 0,
	`viewedAt` timestamp,
	`dismissed` int NOT NULL DEFAULT 0,
	`dismissedAt` timestamp,
	`completed` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` enum('welcome','milestone_celebration','payment_logged','missed_payment','strategy_suggestion','progress_update','motivation','setback_recovery') NOT NULL,
	`message` text NOT NULL,
	`sentiment` enum('encouraging','celebratory','supportive','motivational') NOT NULL,
	`relatedDebtId` int,
	`relatedMilestoneId` int,
	`userResponse` enum('helpful','not_helpful','inspiring'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`feedbackType` enum('like','dislike','too_sarcastic','not_sarcastic_enough','helpful','unhelpful') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` int NOT NULL,
	`messageText` text NOT NULL,
	`translatedText` text NOT NULL,
	`language` varchar(50) NOT NULL,
	`sender` enum('user','practice') NOT NULL,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(255) NOT NULL,
	`language1` varchar(50) NOT NULL,
	`language2` varchar(50) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastMessageAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`userMessage` text NOT NULL,
	`assistantResponse` text NOT NULL,
	`audioUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_activity_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`steps` int DEFAULT 0,
	`distance` int DEFAULT 0,
	`calories` int DEFAULT 0,
	`activeMinutes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_activity_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`lessonDate` timestamp NOT NULL,
	`vocabularyItems` text NOT NULL,
	`grammarTopics` text,
	`exercises` text NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`completionTime` int,
	`score` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `daily_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `daily_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` timestamp NOT NULL,
	`voiceAssistantCount` int NOT NULL DEFAULT 0,
	`verifiedLearningCount` int NOT NULL DEFAULT 0,
	`mathTutorCount` int NOT NULL DEFAULT 0,
	`translateCount` int NOT NULL DEFAULT 0,
	`imageOcrCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_budget_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthYear` varchar(7) NOT NULL,
	`totalIncome` int NOT NULL,
	`totalExpenses` int NOT NULL,
	`totalDebtPayments` int NOT NULL,
	`extraPaymentBudget` int NOT NULL,
	`actualExtraPayments` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_budget_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`debtId` int,
	`milestoneType` enum('first_payment','first_extra_payment','25_percent_paid','50_percent_paid','75_percent_paid','debt_paid_off','all_debts_paid','payment_streak_7','payment_streak_30','saved_1000_interest') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`amountSaved` int,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`debtId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`paymentDate` timestamp NOT NULL,
	`paymentType` enum('minimum','extra','lump_sum','automatic') NOT NULL,
	`balanceAfter` int NOT NULL,
	`principalPaid` int NOT NULL,
	`interestPaid` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_strategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`strategyType` enum('snowball','avalanche','custom') NOT NULL,
	`monthlyExtraPayment` int NOT NULL,
	`projectedPayoffDate` timestamp NOT NULL,
	`totalInterestPaid` int NOT NULL,
	`totalInterestSaved` int NOT NULL,
	`monthsToPayoff` int NOT NULL,
	`payoffOrder` text NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_strategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`debtName` varchar(255) NOT NULL,
	`debtType` enum('credit_card','student_loan','personal_loan','auto_loan','mortgage','medical','other') NOT NULL,
	`originalBalance` int NOT NULL,
	`currentBalance` int NOT NULL,
	`interestRate` int NOT NULL,
	`minimumPayment` int NOT NULL,
	`dueDay` int NOT NULL,
	`creditor` varchar(255),
	`accountNumber` varchar(100),
	`status` enum('active','paid_off','closed') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidOffAt` timestamp,
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `error_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorType` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`context` varchar(255),
	`metadata` text,
	`userId` int,
	`resolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `error_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercise_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`userAnswer` text NOT NULL,
	`isCorrect` int NOT NULL,
	`timeSpent` int,
	`hintsUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercise_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiment_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experimentId` int NOT NULL,
	`stepNumber` int NOT NULL,
	`instruction` text NOT NULL,
	`expectedResult` text,
	`safetyNote` text,
	`imageUrl` varchar(512),
	`videoUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experiment_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`category` enum('physics','chemistry','biology') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`description` text NOT NULL,
	`equipment` text NOT NULL,
	`safetyWarnings` text,
	`duration` int NOT NULL,
	`learningObjectives` text,
	`backgroundInfo` text,
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fact_access_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`verifiedFactId` int NOT NULL,
	`factVersion` text NOT NULL,
	`accessedAt` timestamp NOT NULL DEFAULT (now()),
	`accessSource` enum('voice_assistant','learning_hub') NOT NULL,
	CONSTRAINT `fact_access_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fact_check_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learningSessionId` int NOT NULL,
	`claim` text NOT NULL,
	`verificationStatus` enum('verified','disputed','debunked','unverified') NOT NULL,
	`confidenceScore` int NOT NULL,
	`sources` text NOT NULL,
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fact_check_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `fact_update_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`verifiedFactId` int NOT NULL,
	`oldVersion` text NOT NULL,
	`newVersion` text NOT NULL,
	`notificationType` enum('fact_update','debt_milestone','debt_payment_reminder','debt_strategy_update','learning_achievement','streak_reminder','quiz_result','budget_alert','system_alert','security_alert') NOT NULL DEFAULT 'fact_update',
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`batchKey` varchar(255),
	`batchCount` int NOT NULL DEFAULT 1,
	`action_url` varchar(500),
	`action_type` enum('view_details','mark_read','dismiss','custom') DEFAULT 'view_details',
	`action_label` varchar(100) DEFAULT 'View Details',
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`isDismissed` int NOT NULL DEFAULT 0,
	`dismissedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fact_update_notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `finance_articles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`tierId` int NOT NULL,
	`title` varchar(300) NOT NULL,
	`slug` varchar(300) NOT NULL,
	`summary` text NOT NULL,
	`content` text NOT NULL,
	`estimatedReadTime` int NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`tags` text,
	`relatedTools` text,
	`relatedArticles` text,
	`author` varchar(100) NOT NULL DEFAULT 'SASS-E',
	`published` boolean NOT NULL DEFAULT false,
	`viewCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `finance_articles_id` PRIMARY KEY(`id`),
	CONSTRAINT `finance_articles_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `financial_glossary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`term` varchar(200) NOT NULL,
	`definition` text NOT NULL,
	`example` text,
	`relatedTerms` text,
	`category` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_glossary_id` PRIMARY KEY(`id`),
	CONSTRAINT `financial_glossary_term_unique` UNIQUE(`term`)
);
--> statement-breakpoint
CREATE TABLE `financial_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`type` enum('savings','debt_free','emergency_fund','investment','purchase','custom') NOT NULL,
	`targetAmount` int NOT NULL,
	`currentAmount` int NOT NULL DEFAULT 0,
	`targetDate` timestamp,
	`status` enum('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
	`priority` int NOT NULL DEFAULT 0,
	`icon` varchar(10) DEFAULT '🎯',
	`color` varchar(20) DEFAULT '#10b981',
	`isAutoTracked` int NOT NULL DEFAULT 0,
	`linkedCategoryId` int,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `financial_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `financial_insights` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`insightType` enum('spending_pattern','saving_opportunity','cash_flow_prediction','budget_recommendation','trend_analysis') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`actionable` int NOT NULL DEFAULT 1,
	`actionText` varchar(255),
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`relatedCategoryId` int,
	`dataPoints` text,
	`isDismissed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp,
	CONSTRAINT `financial_insights_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`foodName` varchar(255) NOT NULL,
	`barcode` varchar(50),
	`servingSize` varchar(100),
	`servingQuantity` decimal(10,2) DEFAULT '1',
	`calories` decimal(10,2) DEFAULT '0',
	`protein` decimal(10,2) DEFAULT '0',
	`carbs` decimal(10,2) DEFAULT '0',
	`fat` decimal(10,2) DEFAULT '0',
	`fiber` decimal(10,2) DEFAULT '0',
	`sugars` decimal(10,2) DEFAULT '0',
	`saturatedFat` decimal(10,2) DEFAULT '0',
	`sodium` decimal(10,2) DEFAULT '0',
	`cholesterol` decimal(10,2) DEFAULT '0',
	`vitaminA` decimal(10,2),
	`vitaminC` decimal(10,2),
	`calcium` decimal(10,2),
	`iron` decimal(10,2),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `food_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`milestonePercentage` int NOT NULL,
	`achievedDate` timestamp,
	`celebrationShown` int NOT NULL DEFAULT 0,
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goal_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_progress_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`goalId` int NOT NULL,
	`amount` int NOT NULL,
	`newTotal` int NOT NULL,
	`progressDate` timestamp NOT NULL DEFAULT (now()),
	`note` varchar(255),
	`source` enum('manual','auto_budget','auto_debt') NOT NULL DEFAULT 'manual',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `goal_progress_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grammar_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(50) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`explanation` text NOT NULL,
	`examples` text NOT NULL,
	`commonMistakes` text,
	`relatedTopics` text,
	`exercises` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grammar_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`weight` int,
	`bodyFatPercentage` int,
	`muscleMass` int,
	`restingHeartRate` int,
	`bloodPressureSystolic` int,
	`bloodPressureDiastolic` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hub_trials` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`hubId` enum('money','wellness','translation_hub','learning') NOT NULL,
	`status` enum('active','expired','converted') NOT NULL DEFAULT 'active',
	`startedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `hub_trials_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hydration_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`amount` int NOT NULL,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hydration_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iot_command_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`command` varchar(255) NOT NULL,
	`parameters` text,
	`status` enum('success','failed','pending') NOT NULL,
	`errorMessage` text,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iot_command_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iot_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`deviceType` enum('light','thermostat','plug','switch','sensor','lock','camera','speaker','other') NOT NULL,
	`room` varchar(128) DEFAULT 'Uncategorized',
	`manufacturer` varchar(128),
	`model` varchar(128),
	`status` enum('online','offline','error') NOT NULL DEFAULT 'offline',
	`state` text,
	`capabilities` text,
	`connectionType` enum('mqtt','http','websocket','local') NOT NULL,
	`connectionConfig` text,
	`lastSeen` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iot_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `iot_devices_deviceId_unique` UNIQUE(`deviceId`),
	CONSTRAINT `idx_iot_devices_deviceId` UNIQUE(`deviceId`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`prompt` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`experimentId` int NOT NULL,
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`passed` int NOT NULL,
	`answers` text,
	`timeSpent` int,
	`attemptedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_quiz_questions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experimentId` int NOT NULL,
	`question` text NOT NULL,
	`options` text NOT NULL,
	`correctAnswer` int NOT NULL,
	`explanation` text,
	`category` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `lab_quiz_questions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`achievementType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` varchar(512),
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `language_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(50) NOT NULL,
	`exerciseType` enum('translation','fill_blank','multiple_choice','matching','listening','speaking') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`category` varchar(128),
	`prompt` text NOT NULL,
	`options` text,
	`correctAnswer` text NOT NULL,
	`explanation` text,
	`audioUrl` varchar(512),
	`relatedVocabulary` text,
	`relatedGrammar` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `language_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`icon` varchar(100),
	`tier` enum('bronze','silver','gold','platinum') NOT NULL,
	`criteria` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(512) NOT NULL,
	`question` text NOT NULL,
	`explanation` text NOT NULL,
	`confidenceScore` int NOT NULL,
	`sourcesCount` int NOT NULL DEFAULT 0,
	`sessionType` enum('explanation','study_guide','quiz') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`factCheckResultId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`sourceType` enum('academic','news','government','encyclopedia','other') NOT NULL,
	`credibilityScore` int NOT NULL,
	`publishDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_tiers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(200) NOT NULL,
	`description` text NOT NULL,
	`orderIndex` int NOT NULL,
	`icon` varchar(50),
	`unlockCriteria` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `learning_tiers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `math_problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(100) NOT NULL,
	`subtopic` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`problemText` text NOT NULL,
	`solution` text NOT NULL,
	`answer` varchar(255) NOT NULL,
	`hints` text,
	`explanation` text,
	`relatedConcepts` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `math_problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `math_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalProblemsAttempted` int NOT NULL DEFAULT 0,
	`totalProblemsSolved` int NOT NULL DEFAULT 0,
	`topicsExplored` text,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastPracticeDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `math_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `math_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `math_solutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`problemId` int,
	`problemText` text NOT NULL,
	`userAnswer` varchar(255),
	`isCorrect` int,
	`steps` text NOT NULL,
	`hintsUsed` int NOT NULL DEFAULT 0,
	`timeSpent` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `math_solutions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('meditation','breathing','sleep','focus','stress') NOT NULL,
	`duration` int NOT NULL,
	`title` varchar(255),
	`notes` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meditation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_budget_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthYear` varchar(7) NOT NULL,
	`totalIncome` int NOT NULL,
	`totalExpenses` int NOT NULL,
	`totalDebtPayments` int NOT NULL,
	`netCashFlow` int NOT NULL,
	`savingsRate` int NOT NULL,
	`debtPaymentRate` int NOT NULL,
	`availableForExtraPayments` int NOT NULL,
	`budgetHealth` enum('excellent','good','warning','critical') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_budget_summaries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`mood` enum('great','good','okay','bad','terrible') NOT NULL,
	`energy` int DEFAULT 5,
	`stress` int DEFAULT 5,
	`notes` text,
	`factors` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`budgetAlertsEnabled` int NOT NULL DEFAULT 1,
	`threshold80Enabled` int NOT NULL DEFAULT 1,
	`threshold100Enabled` int NOT NULL DEFAULT 1,
	`exceededEnabled` int NOT NULL DEFAULT 1,
	`weeklySummaryEnabled` int NOT NULL DEFAULT 1,
	`monthlySummaryEnabled` int NOT NULL DEFAULT 1,
	`insightsEnabled` int NOT NULL DEFAULT 1,
	`recurringAlertsEnabled` int NOT NULL DEFAULT 1,
	`debtMilestonesEnabled` int NOT NULL DEFAULT 1,
	`debtPaymentRemindersEnabled` int NOT NULL DEFAULT 1,
	`debtStrategyUpdatesEnabled` int NOT NULL DEFAULT 1,
	`learningAchievementsEnabled` int NOT NULL DEFAULT 1,
	`streakRemindersEnabled` int NOT NULL DEFAULT 1,
	`quizResultsEnabled` int NOT NULL DEFAULT 1,
	`factUpdatesEnabled` int NOT NULL DEFAULT 1,
	`systemAlertsEnabled` int NOT NULL DEFAULT 1,
	`securityAlertsEnabled` int NOT NULL DEFAULT 1,
	`notificationMethod` enum('in_app','push','both') NOT NULL DEFAULT 'both',
	`quietHoursStart` int,
	`quietHoursEnd` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`value` int NOT NULL,
	`tags` text,
	`userId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `practice_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicName` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`problemsSolved` int NOT NULL DEFAULT 0,
	`problemsCorrect` int NOT NULL DEFAULT 0,
	`accuracy` int NOT NULL DEFAULT 0,
	`hintsUsed` int NOT NULL DEFAULT 0,
	`duration` int,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practice_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `push_subscriptions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`endpoint` text NOT NULL,
	`p256dh` text NOT NULL,
	`auth` text NOT NULL,
	`userAgent` text,
	`isActive` int NOT NULL DEFAULT 1,
	`lastUsed` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `push_subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `idx_push_subscriptions_endpoint` UNIQUE(`endpoint`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`timeSpent` int,
	`answers` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`learningSessionId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`questions` text NOT NULL,
	`totalQuestions` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quota_usage` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`service` enum('tavily','whisper','llm') NOT NULL,
	`count` int NOT NULL DEFAULT 0,
	`period` varchar(7) NOT NULL,
	`tier` enum('free','starter','pro','ultimate') NOT NULL,
	`resetAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `quota_usage_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `recurring_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`averageAmount` int NOT NULL,
	`frequency` enum('weekly','biweekly','monthly','quarterly','yearly') NOT NULL,
	`nextExpectedDate` timestamp,
	`lastOccurrence` timestamp,
	`confidence` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`isSubscription` int NOT NULL DEFAULT 0,
	`reminderEnabled` int NOT NULL DEFAULT 1,
	`autoAdd` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurring_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `saved_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalText` text NOT NULL,
	`translatedText` text NOT NULL,
	`sourceLanguage` varchar(50) NOT NULL,
	`targetLanguage` varchar(50) NOT NULL,
	`categoryId` int,
	`isFavorite` int NOT NULL DEFAULT 0,
	`usageCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `science_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalExperimentsCompleted` int NOT NULL DEFAULT 0,
	`physicsExperiments` int NOT NULL DEFAULT 0,
	`chemistryExperiments` int NOT NULL DEFAULT 0,
	`biologyExperiments` int NOT NULL DEFAULT 0,
	`averageGrade` int NOT NULL DEFAULT 0,
	`totalLabTime` int NOT NULL DEFAULT 0,
	`safetyScore` int NOT NULL DEFAULT 100,
	`lastExperimentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `science_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `science_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_budget_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(10) DEFAULT '💰',
	`color` varchar(20) DEFAULT '#10b981',
	`monthlyLimit` int NOT NULL DEFAULT 0,
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_budget_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL,
	`invitedBy` int NOT NULL,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`joinedAt` timestamp,
	`status` enum('pending','active','declined','removed') NOT NULL DEFAULT 'pending',
	CONSTRAINT `shared_budget_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`categoryId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`receiptUrl` varchar(512),
	`notes` text,
	`isSplit` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_budget_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`bedtime` varchar(5),
	`wakeTime` varchar(5),
	`duration` int NOT NULL,
	`quality` enum('excellent','good','fair','poor') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleep_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `split_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`isPaid` int NOT NULL DEFAULT 0,
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `split_expenses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`learningSessionId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`topicsCount` int NOT NULL DEFAULT 0,
	`questionsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_guides_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('error','warn','info','http','debug') NOT NULL,
	`message` text NOT NULL,
	`context` varchar(255),
	`metadata` text,
	`userId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topic_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicName` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`status` enum('not_started','learning','practicing','mastered') NOT NULL DEFAULT 'not_started',
	`lessonCompleted` int NOT NULL DEFAULT 0,
	`practiceCount` int NOT NULL DEFAULT 0,
	`quizzesTaken` int NOT NULL DEFAULT 0,
	`bestQuizScore` int NOT NULL DEFAULT 0,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`lastStudied` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topic_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topic_quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicName` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`quizType` enum('quick_check','topic_quiz','mixed_review') NOT NULL DEFAULT 'topic_quiz',
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`timeSpent` int,
	`weakAreas` text,
	`answers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topic_quiz_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translate_conversation_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` text NOT NULL,
	`preferredLanguage` varchar(10) NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translate_conversation_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translate_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareableCode` varchar(64) NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translate_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `translate_conversations_shareableCode_unique` UNIQUE(`shareableCode`)
);
--> statement-breakpoint
CREATE TABLE `translate_message_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` text NOT NULL,
	`translatedText` text NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translate_message_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translate_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`originalText` text NOT NULL,
	`originalLanguage` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translate_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_budget_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`templateId` int NOT NULL,
	`monthlyIncome` int NOT NULL,
	`appliedAllocations` text NOT NULL,
	`appliedAt` timestamp NOT NULL DEFAULT (now()),
	`isActive` int NOT NULL DEFAULT 1,
	CONSTRAINT `user_budget_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_grammar_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`grammarLessonId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`exercisesCompleted` int NOT NULL DEFAULT 0,
	`lastStudied` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_grammar_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_lab_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`experimentId` int NOT NULL,
	`observations` text NOT NULL,
	`measurements` text,
	`analysis` text,
	`conclusions` text,
	`questionsAnswered` text,
	`completedSteps` text,
	`timeSpent` int,
	`grade` int,
	`feedback` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_lab_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_language_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`fluencyScore` int NOT NULL DEFAULT 0,
	`vocabularySize` int NOT NULL DEFAULT 0,
	`grammarTopicsMastered` int NOT NULL DEFAULT 0,
	`exercisesCompleted` int NOT NULL DEFAULT 0,
	`totalStudyTime` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastStudied` timestamp,
	`dailyGoal` int NOT NULL DEFAULT 15,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_language_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_learning_badges` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`badgeId` int NOT NULL,
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_learning_badges_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_learning_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`articleId` int NOT NULL,
	`status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
	`progressPercentage` int NOT NULL DEFAULT 0,
	`timeSpent` int NOT NULL DEFAULT 0,
	`bookmarked` boolean NOT NULL DEFAULT false,
	`lastReadAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_learning_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sarcasmLevel` int NOT NULL DEFAULT 5,
	`totalInteractions` int NOT NULL DEFAULT 0,
	`positiveResponses` int NOT NULL DEFAULT 0,
	`negativeResponses` int NOT NULL DEFAULT 0,
	`averageResponseLength` int NOT NULL DEFAULT 0,
	`preferredTopics` text,
	`interactionPatterns` text,
	`lastInteraction` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_vocabulary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vocabularyItemId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`timesReviewed` int NOT NULL DEFAULT 0,
	`timesCorrect` int NOT NULL DEFAULT 0,
	`timesIncorrect` int NOT NULL DEFAULT 0,
	`lastReviewed` timestamp,
	`nextReview` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_vocabulary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_workout_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutId` int,
	`workoutTitle` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`caloriesBurned` int,
	`notes` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_workout_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`supabaseId` varchar(64) NOT NULL,
	`name` text,
	`email` varchar(320),
	`loginMethod` varchar(64),
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`preferredLanguage` varchar(10) DEFAULT 'en',
	`preferredCurrency` varchar(3) DEFAULT 'USD',
	`subscriptionTier` enum('free','starter','pro','ultimate') NOT NULL DEFAULT 'free',
	`subscriptionStatus` enum('active','inactive','trial') NOT NULL DEFAULT 'inactive',
	`subscriptionPeriod` enum('monthly','six_month','annual') DEFAULT 'monthly',
	`subscriptionExpiresAt` timestamp,
	`selectedSpecializedHubs` text,
	`hubsSelectedAt` timestamp,
	`subscriptionPrice` decimal(10,2),
	`subscriptionCurrency` varchar(3) DEFAULT 'GBP',
	`staySignedIn` boolean NOT NULL DEFAULT false,
	`twoFactorEnabled` boolean NOT NULL DEFAULT false,
	`twoFactorSecret` varchar(255),
	`backupCodes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`lastSignedIn` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_supabaseId_unique` UNIQUE(`supabaseId`),
	CONSTRAINT `idx_users_supabaseId` UNIQUE(`supabaseId`)
);
--> statement-breakpoint
CREATE TABLE `verified_facts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`normalizedQuestion` varchar(512) NOT NULL,
	`answer` text NOT NULL,
	`verificationStatus` enum('verified','disputed','debunked','unverified') NOT NULL,
	`confidenceScore` int NOT NULL,
	`sources` text NOT NULL,
	`verifiedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`accessCount` int NOT NULL DEFAULT 0,
	`lastAccessedAt` timestamp,
	`verifiedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verified_facts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(50) NOT NULL,
	`word` varchar(255) NOT NULL,
	`translation` varchar(255) NOT NULL,
	`pronunciation` varchar(255),
	`partOfSpeech` varchar(100) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`category` varchar(128),
	`exampleSentence` text,
	`exampleTranslation` text,
	`audioUrl` varchar(512),
	`imageUrl` varchar(512),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vocabulary_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('apple_health','google_fit','fitbit','garmin','samsung_health','other') NOT NULL,
	`deviceName` varchar(255),
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`scope` text,
	`isActive` int NOT NULL DEFAULT 1,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wearable_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_data_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`userId` int NOT NULL,
	`dataType` enum('steps','heart_rate','sleep','weight','calories','distance','active_minutes','blood_pressure','blood_glucose','oxygen_saturation') NOT NULL,
	`rawData` text NOT NULL,
	`timestamp` timestamp NOT NULL,
	`processed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_data_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`userId` int NOT NULL,
	`dataType` enum('steps','heart_rate','sleep','weight','calories','distance','active_minutes','blood_pressure','blood_glucose','oxygen_saturation') NOT NULL,
	`recordsProcessed` int NOT NULL DEFAULT 0,
	`status` enum('success','failed','partial') NOT NULL,
	`errorMessage` text,
	`syncStartedAt` timestamp NOT NULL,
	`syncCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_sync_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellbeing_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('medication','hydration','exercise','meditation','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`time` varchar(5),
	`frequency` enum('daily','weekly','custom') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wellbeing_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellness_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`goalType` enum('weight','workout_frequency','nutrition','sleep','meditation','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetValue` varchar(100),
	`currentValue` varchar(100),
	`targetDate` timestamp,
	`status` enum('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
	`progress` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wellness_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellness_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fitnessLevel` enum('beginner','intermediate','advanced') NOT NULL,
	`primaryGoals` text NOT NULL,
	`activityLevel` enum('sedentary','lightly_active','moderately_active','very_active','extremely_active') NOT NULL,
	`sleepHoursPerNight` int,
	`dietPreference` varchar(100),
	`challenges` text,
	`availableEquipment` text,
	`workoutDaysPerWeek` int,
	`workoutDurationPreference` int,
	`medicalConditions` text,
	`injuries` text,
	`preferredWorkoutTypes` text,
	`preferredWorkoutTime` varchar(50),
	`completedOnboarding` int NOT NULL DEFAULT 1,
	`onboardingCompletedAt` timestamp NOT NULL DEFAULT (now()),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wellness_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `wellness_profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('yoga','hiit','strength','pilates','cardio','stretching','other') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`duration` int NOT NULL,
	`equipment` text,
	`focusArea` varchar(100),
	`caloriesBurned` int,
	`instructions` text,
	`videoUrl` varchar(512),
	`audioUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workouts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `translate_conversation_participants` ADD CONSTRAINT `translate_conversation_participants_conversationId_translate_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `translate_conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translate_message_translations` ADD CONSTRAINT `translate_message_translations_messageId_translate_messages_id_fk` FOREIGN KEY (`messageId`) REFERENCES `translate_messages`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `translate_messages` ADD CONSTRAINT `translate_messages_conversationId_translate_conversations_id_fk` FOREIGN KEY (`conversationId`) REFERENCES `translate_conversations`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_apiName` ON `api_usage_logs` (`apiName`);--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_userId` ON `api_usage_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_success` ON `api_usage_logs` (`success`);--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_timestamp` ON `api_usage_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_adminId` ON `audit_logs` (`adminId`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_actionType` ON `audit_logs` (`actionType`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_targetUserId` ON `audit_logs` (`targetUserId`);--> statement-breakpoint
CREATE INDEX `idx_audit_logs_createdAt` ON `audit_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_userId` ON `budget_transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_categoryId` ON `budget_transactions` (`categoryId`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_transactionDate` ON `budget_transactions` (`transactionDate`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_userId_date` ON `budget_transactions` (`userId`,`transactionDate`);--> statement-breakpoint
CREATE INDEX `idx_cleanup_logs_createdAt` ON `cleanup_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_cleanup_logs_triggeredBy` ON `cleanup_logs` (`triggeredBy`);--> statement-breakpoint
CREATE INDEX `idx_conversations_userId` ON `conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_conversations_createdAt` ON `conversations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_conversations_userId_createdAt` ON `conversations` (`userId`,`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_errorType` ON `error_logs` (`errorType`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_context` ON `error_logs` (`context`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_resolved` ON `error_logs` (`resolved`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_timestamp` ON `error_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_userId` ON `error_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_fact_update_notifications_userId` ON `fact_update_notifications` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_fact_update_notifications_batchKey` ON `fact_update_notifications` (`batchKey`);--> statement-breakpoint
CREATE INDEX `idx_fact_update_notifications_type` ON `fact_update_notifications` (`notificationType`);--> statement-breakpoint
CREATE INDEX `idx_financial_goals_userId` ON `financial_goals` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_financial_goals_status` ON `financial_goals` (`status`);--> statement-breakpoint
CREATE INDEX `idx_financial_goals_targetDate` ON `financial_goals` (`targetDate`);--> statement-breakpoint
CREATE INDEX `idx_financial_goals_userId_status` ON `financial_goals` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_iot_command_history_userId` ON `iot_command_history` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_iot_command_history_deviceId` ON `iot_command_history` (`deviceId`);--> statement-breakpoint
CREATE INDEX `idx_iot_command_history_executedAt` ON `iot_command_history` (`executedAt`);--> statement-breakpoint
CREATE INDEX `idx_iot_command_history_userId_deviceId` ON `iot_command_history` (`userId`,`deviceId`);--> statement-breakpoint
CREATE INDEX `idx_iot_devices_userId` ON `iot_devices` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_iot_devices_status` ON `iot_devices` (`status`);--> statement-breakpoint
CREATE INDEX `idx_iot_devices_userId_status` ON `iot_devices` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `idx_performance_metrics_name` ON `performance_metrics` (`name`);--> statement-breakpoint
CREATE INDEX `idx_performance_metrics_timestamp` ON `performance_metrics` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_performance_metrics_userId` ON `performance_metrics` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_push_subscriptions_userId` ON `push_subscriptions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_userId` ON `quiz_attempts` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_quizId` ON `quiz_attempts` (`quizId`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_createdAt` ON `quiz_attempts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_userId_quizId` ON `quiz_attempts` (`userId`,`quizId`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_level` ON `system_logs` (`level`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_context` ON `system_logs` (`context`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_timestamp` ON `system_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_userId` ON `system_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_subscriptionTier` ON `users` (`subscriptionTier`);--> statement-breakpoint
CREATE INDEX `idx_users_subscriptionStatus` ON `users` (`subscriptionStatus`);