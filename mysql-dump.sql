-- MySQL Database Dump
-- Generated: 2026-02-15T18:57:25.950Z
-- Total Tables: 104
-- ============================================================================

-- Table: __drizzle_migrations
CREATE TABLE `__drizzle_migrations` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `hash` text NOT NULL,
  `created_at` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `id` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=1620268;

-- Table: api_usage_logs
CREATE TABLE `api_usage_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `apiName` varchar(255) NOT NULL,
  `endpoint` varchar(512) DEFAULT NULL,
  `method` varchar(10) DEFAULT NULL,
  `statusCode` int(11) DEFAULT NULL,
  `duration` int(11) DEFAULT NULL,
  `quotaUsed` int(11) NOT NULL DEFAULT '1',
  `userId` int(11) DEFAULT NULL,
  `success` tinyint(1) NOT NULL,
  `errorMessage` text DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_api_usage_logs_apiName` (`apiName`),
  KEY `idx_api_usage_logs_userId` (`userId`),
  KEY `idx_api_usage_logs_success` (`success`),
  KEY `idx_api_usage_logs_timestamp` (`timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: audit_logs
CREATE TABLE `audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `adminId` int(11) NOT NULL,
  `adminEmail` varchar(320) DEFAULT NULL,
  `actionType` varchar(100) NOT NULL,
  `targetUserId` int(11) DEFAULT NULL,
  `targetUserEmail` varchar(320) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `ipAddress` varchar(45) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_audit_logs_adminId` (`adminId`),
  KEY `idx_audit_logs_actionType` (`actionType`),
  KEY `idx_audit_logs_targetUserId` (`targetUserId`),
  KEY `idx_audit_logs_createdAt` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: budget_alerts
CREATE TABLE `budget_alerts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `alertType` enum('threshold_80','threshold_100','exceeded','weekly_summary','monthly_report') NOT NULL,
  `threshold` int(11) DEFAULT NULL,
  `message` text NOT NULL,
  `isRead` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: budget_categories
CREATE TABLE `budget_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('income','expense') NOT NULL,
  `monthlyLimit` int(11) DEFAULT NULL,
  `color` varchar(7) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `isDefault` int(11) NOT NULL DEFAULT '0',
  `sortOrder` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=510001;

-- Table: budget_templates
CREATE TABLE `budget_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text NOT NULL,
  `strategy` enum('50_30_20','zero_based','envelope','custom') NOT NULL,
  `isSystemTemplate` int(11) NOT NULL DEFAULT '1',
  `userId` int(11) DEFAULT NULL,
  `allocations` text NOT NULL,
  `categoryMappings` text DEFAULT NULL,
  `icon` varchar(10) DEFAULT '📊',
  `sortOrder` int(11) NOT NULL DEFAULT '0',
  `usageCount` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: budget_transactions
CREATE TABLE `budget_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `transactionDate` timestamp NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `isRecurring` int(11) NOT NULL DEFAULT '0',
  `recurringFrequency` enum('weekly','biweekly','monthly','yearly') DEFAULT NULL,
  `tags` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: cleanup_logs
CREATE TABLE `cleanup_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cleanupType` enum('age_based','storage_based','manual') COLLATE utf8mb4_unicode_ci NOT NULL,
  `filesDeleted` int(11) NOT NULL DEFAULT '0',
  `spaceFreedMB` decimal(10,2) NOT NULL DEFAULT '0',
  `errors` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `triggeredBy` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('success','partial','failed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'success',
  `executionTimeMs` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_cleanup_logs_createdAt` (`createdAt`),
  KEY `idx_cleanup_logs_triggeredBy` (`triggeredBy`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci AUTO_INCREMENT=60001;

-- Table: coaching_feedback
CREATE TABLE `coaching_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `recommendationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `helpful` int(11) DEFAULT NULL,
  `rating` int(11) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: coaching_recommendations
CREATE TABLE `coaching_recommendations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `recommendationType` enum('workout','nutrition','mental_wellness','sleep','general') NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `reasoning` text DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `actionable` int(11) NOT NULL DEFAULT '1',
  `actionUrl` varchar(512) DEFAULT NULL,
  `basedOnData` text DEFAULT NULL,
  `viewed` int(11) NOT NULL DEFAULT '0',
  `viewedAt` timestamp NULL DEFAULT NULL,
  `dismissed` int(11) NOT NULL DEFAULT '0',
  `dismissedAt` timestamp NULL DEFAULT NULL,
  `completed` int(11) NOT NULL DEFAULT '0',
  `completedAt` timestamp NULL DEFAULT NULL,
  `expiresAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: coaching_sessions
CREATE TABLE `coaching_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `sessionType` enum('welcome','milestone_celebration','payment_logged','missed_payment','strategy_suggestion','progress_update','motivation','setback_recovery') NOT NULL,
  `message` text NOT NULL,
  `sentiment` enum('encouraging','celebratory','supportive','motivational') NOT NULL,
  `relatedDebtId` int(11) DEFAULT NULL,
  `relatedMilestoneId` int(11) DEFAULT NULL,
  `userResponse` enum('helpful','not_helpful','inspiring') DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;

-- Table: conversation_feedback
CREATE TABLE `conversation_feedback` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `feedbackType` enum('like','dislike','too_sarcastic','not_sarcastic_enough','helpful','unhelpful') NOT NULL,
  `comment` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;

-- Table: conversation_messages
CREATE TABLE `conversation_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sessionId` int(11) NOT NULL,
  `messageText` text NOT NULL,
  `translatedText` text NOT NULL,
  `language` varchar(50) NOT NULL,
  `sender` enum('user','practice') NOT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: conversation_sessions
CREATE TABLE `conversation_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `language1` varchar(50) NOT NULL,
  `language2` varchar(50) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastMessageAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: conversations
CREATE TABLE `conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `userMessage` text NOT NULL,
  `assistantResponse` text NOT NULL,
  `audioUrl` varchar(512) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=2280001;

-- Table: daily_activity_stats
CREATE TABLE `daily_activity_stats` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `steps` int(11) DEFAULT '0',
  `distance` int(11) DEFAULT '0',
  `calories` int(11) DEFAULT '0',
  `activeMinutes` int(11) DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: daily_lessons
CREATE TABLE `daily_lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `language` varchar(50) NOT NULL,
  `lessonDate` timestamp NOT NULL,
  `vocabularyItems` text NOT NULL,
  `grammarTopics` text DEFAULT NULL,
  `exercises` text NOT NULL,
  `completed` int(11) NOT NULL DEFAULT '0',
  `completionTime` int(11) DEFAULT NULL,
  `score` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: daily_usage
CREATE TABLE `daily_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` timestamp NOT NULL,
  `voiceAssistantCount` int(11) NOT NULL DEFAULT '0',
  `verifiedLearningCount` int(11) NOT NULL DEFAULT '0',
  `mathTutorCount` int(11) NOT NULL DEFAULT '0',
  `translateCount` int(11) NOT NULL DEFAULT '0',
  `imageOcrCount` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001;

-- Table: debt_budget_snapshots
CREATE TABLE `debt_budget_snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `monthYear` varchar(7) NOT NULL,
  `totalIncome` int(11) NOT NULL,
  `totalExpenses` int(11) NOT NULL,
  `totalDebtPayments` int(11) NOT NULL,
  `extraPaymentBudget` int(11) NOT NULL,
  `actualExtraPayments` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;

-- Table: debt_milestones
CREATE TABLE `debt_milestones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `debtId` int(11) DEFAULT NULL,
  `milestoneType` enum('first_payment','first_extra_payment','25_percent_paid','50_percent_paid','75_percent_paid','debt_paid_off','all_debts_paid','payment_streak_7','payment_streak_30','saved_1000_interest') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amountSaved` int(11) DEFAULT NULL,
  `achievedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: debt_payments
CREATE TABLE `debt_payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `debtId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `paymentDate` timestamp NOT NULL,
  `paymentType` enum('minimum','extra','lump_sum','automatic') NOT NULL,
  `balanceAfter` int(11) NOT NULL,
  `principalPaid` int(11) NOT NULL,
  `interestPaid` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;

-- Table: debt_strategies
CREATE TABLE `debt_strategies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `strategyType` enum('snowball','avalanche','custom') NOT NULL,
  `monthlyExtraPayment` int(11) NOT NULL,
  `projectedPayoffDate` timestamp NOT NULL,
  `totalInterestPaid` int(11) NOT NULL,
  `totalInterestSaved` int(11) NOT NULL,
  `monthsToPayoff` int(11) NOT NULL,
  `payoffOrder` text NOT NULL,
  `calculatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;

-- Table: debts
CREATE TABLE `debts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `debtName` varchar(255) NOT NULL,
  `debtType` enum('credit_card','student_loan','personal_loan','auto_loan','mortgage','medical','other') NOT NULL,
  `originalBalance` int(11) NOT NULL,
  `currentBalance` int(11) NOT NULL,
  `interestRate` int(11) NOT NULL,
  `minimumPayment` int(11) NOT NULL,
  `dueDay` int(11) NOT NULL,
  `creditor` varchar(255) DEFAULT NULL,
  `accountNumber` varchar(100) DEFAULT NULL,
  `status` enum('active','paid_off','closed') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `paidOffAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=270001;

-- Table: error_logs
CREATE TABLE `error_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `errorType` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `stack` text DEFAULT NULL,
  `context` varchar(255) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `resolved` tinyint(1) NOT NULL DEFAULT '0',
  `resolvedAt` timestamp NULL DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_error_logs_errorType` (`errorType`),
  KEY `idx_error_logs_context` (`context`),
  KEY `idx_error_logs_resolved` (`resolved`),
  KEY `idx_error_logs_timestamp` (`timestamp`),
  KEY `idx_error_logs_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: exercise_attempts
CREATE TABLE `exercise_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `exerciseId` int(11) NOT NULL,
  `language` varchar(50) NOT NULL,
  `userAnswer` text NOT NULL,
  `isCorrect` int(11) NOT NULL,
  `timeSpent` int(11) DEFAULT NULL,
  `hintsUsed` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: experiment_steps
CREATE TABLE `experiment_steps` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `experimentId` int(11) NOT NULL,
  `stepNumber` int(11) NOT NULL,
  `instruction` text NOT NULL,
  `expectedResult` text DEFAULT NULL,
  `safetyNote` text DEFAULT NULL,
  `imageUrl` varchar(512) DEFAULT NULL,
  `videoUrl` varchar(512) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: experiments
CREATE TABLE `experiments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(512) NOT NULL,
  `category` enum('physics','chemistry','biology') NOT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `description` text NOT NULL,
  `equipment` text NOT NULL,
  `safetyWarnings` text DEFAULT NULL,
  `duration` int(11) NOT NULL,
  `learningObjectives` text DEFAULT NULL,
  `backgroundInfo` text DEFAULT NULL,
  `imageUrl` varchar(512) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: fact_access_log
CREATE TABLE `fact_access_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `verifiedFactId` int(11) NOT NULL,
  `factVersion` text NOT NULL,
  `accessedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `accessSource` enum('voice_assistant','learning_hub') NOT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=660001;

-- Table: fact_check_results
CREATE TABLE `fact_check_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `learningSessionId` int(11) NOT NULL,
  `claim` text NOT NULL,
  `verificationStatus` enum('verified','disputed','debunked','unverified') NOT NULL,
  `confidenceScore` int(11) NOT NULL,
  `sources` text NOT NULL,
  `explanation` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=210001;

-- Table: fact_update_notifications
CREATE TABLE `fact_update_notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `verifiedFactId` int(11) NOT NULL,
  `oldVersion` text NOT NULL,
  `newVersion` text NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `isRead` int(11) NOT NULL DEFAULT '0',
  `readAt` timestamp NULL DEFAULT NULL,
  `isDismissed` int(11) NOT NULL DEFAULT '0',
  `dismissedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notificationType` enum('fact_update','debt_milestone','debt_payment_reminder','debt_strategy_update','learning_achievement','streak_reminder','quiz_result','budget_alert','system_alert','security_alert') NOT NULL DEFAULT 'fact_update',
  `batchKey` varchar(255) DEFAULT NULL,
  `batchCount` int(11) NOT NULL DEFAULT '1',
  `action_url` varchar(500) DEFAULT NULL,
  `action_type` enum('view_details','mark_read','dismiss','custom') DEFAULT 'view_details',
  `action_label` varchar(100) DEFAULT 'View Details',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_fact_update_notifications_batchKey` (`batchKey`),
  KEY `idx_fact_update_notifications_type` (`notificationType`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=630001;

-- Table: finance_articles
CREATE TABLE `finance_articles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tierId` int(11) NOT NULL,
  `title` varchar(300) NOT NULL,
  `slug` varchar(300) NOT NULL,
  `summary` text NOT NULL,
  `content` text NOT NULL,
  `estimatedReadTime` int(11) NOT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `tags` text DEFAULT NULL,
  `relatedTools` text DEFAULT NULL,
  `relatedArticles` text DEFAULT NULL,
  `author` varchar(100) NOT NULL DEFAULT 'SASS-E',
  `published` tinyint(1) NOT NULL DEFAULT '0',
  `viewCount` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `slug` (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: financial_glossary
CREATE TABLE `financial_glossary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `term` varchar(200) NOT NULL,
  `definition` text NOT NULL,
  `example` text DEFAULT NULL,
  `relatedTerms` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `term` (`term`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: financial_goals
CREATE TABLE `financial_goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('savings','debt_free','emergency_fund','investment','purchase','custom') NOT NULL,
  `targetAmount` int(11) NOT NULL,
  `currentAmount` int(11) NOT NULL DEFAULT '0',
  `targetDate` timestamp NULL DEFAULT NULL,
  `status` enum('active','completed','paused','cancelled') NOT NULL DEFAULT 'active',
  `priority` int(11) NOT NULL DEFAULT '0',
  `icon` varchar(10) DEFAULT '🎯',
  `color` varchar(20) DEFAULT '#10b981',
  `isAutoTracked` int(11) NOT NULL DEFAULT '0',
  `linkedCategoryId` int(11) DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: financial_insights
CREATE TABLE `financial_insights` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `insightType` enum('spending_pattern','saving_opportunity','cash_flow_prediction','budget_recommendation','trend_analysis') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `actionable` int(11) NOT NULL DEFAULT '1',
  `actionText` varchar(255) DEFAULT NULL,
  `priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
  `relatedCategoryId` int(11) DEFAULT NULL,
  `dataPoints` text DEFAULT NULL,
  `isDismissed` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: food_log
CREATE TABLE `food_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
  `foodName` varchar(255) NOT NULL,
  `servingSize` varchar(100) DEFAULT NULL,
  `calories` decimal(10,2) DEFAULT '0',
  `protein` decimal(10,2) DEFAULT '0',
  `carbs` decimal(10,2) DEFAULT '0',
  `fat` decimal(10,2) DEFAULT '0',
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `barcode` varchar(50) DEFAULT NULL,
  `servingQuantity` decimal(10,2) DEFAULT '1',
  `fiber` decimal(10,2) DEFAULT '0',
  `sugars` decimal(10,2) DEFAULT '0',
  `saturatedFat` decimal(10,2) DEFAULT '0',
  `sodium` decimal(10,2) DEFAULT '0',
  `cholesterol` decimal(10,2) DEFAULT '0',
  `vitaminA` decimal(10,2) DEFAULT NULL,
  `vitaminC` decimal(10,2) DEFAULT NULL,
  `calcium` decimal(10,2) DEFAULT NULL,
  `iron` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: goal_milestones
CREATE TABLE `goal_milestones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goalId` int(11) NOT NULL,
  `milestonePercentage` int(11) NOT NULL,
  `achievedDate` timestamp NULL DEFAULT NULL,
  `celebrationShown` int(11) NOT NULL DEFAULT '0',
  `message` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: goal_progress_history
CREATE TABLE `goal_progress_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `goalId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `newTotal` int(11) NOT NULL,
  `progressDate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `note` varchar(255) DEFAULT NULL,
  `source` enum('manual','auto_budget','auto_debt') NOT NULL DEFAULT 'manual',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: grammar_lessons
CREATE TABLE `grammar_lessons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `language` varchar(50) NOT NULL,
  `topic` varchar(255) NOT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `explanation` text NOT NULL,
  `examples` text NOT NULL,
  `commonMistakes` text DEFAULT NULL,
  `relatedTopics` text DEFAULT NULL,
  `exercises` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: health_metrics
CREATE TABLE `health_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `weight` int(11) DEFAULT NULL,
  `bodyFatPercentage` int(11) DEFAULT NULL,
  `muscleMass` int(11) DEFAULT NULL,
  `restingHeartRate` int(11) DEFAULT NULL,
  `bloodPressureSystolic` int(11) DEFAULT NULL,
  `bloodPressureDiastolic` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: hub_trials
CREATE TABLE `hub_trials` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `hubId` enum('money','wellness','translation_hub','learning') NOT NULL,
  `status` enum('active','expired','converted') NOT NULL DEFAULT 'active',
  `startedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: hydration_log
CREATE TABLE `hydration_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `amount` int(11) NOT NULL,
  `loggedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: iot_command_history
CREATE TABLE `iot_command_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `deviceId` varchar(128) NOT NULL,
  `command` varchar(255) NOT NULL,
  `parameters` text DEFAULT NULL,
  `status` enum('success','failed','pending') NOT NULL,
  `errorMessage` text DEFAULT NULL,
  `executedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: iot_devices
CREATE TABLE `iot_devices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `deviceId` varchar(128) NOT NULL,
  `deviceName` varchar(255) NOT NULL,
  `deviceType` enum('light','thermostat','plug','switch','sensor','lock','camera','speaker','other') NOT NULL,
  `manufacturer` varchar(128) DEFAULT NULL,
  `model` varchar(128) DEFAULT NULL,
  `status` enum('online','offline','error') NOT NULL DEFAULT 'offline',
  `state` text DEFAULT NULL,
  `capabilities` text DEFAULT NULL,
  `connectionType` enum('mqtt','http','websocket','local') NOT NULL,
  `connectionConfig` text DEFAULT NULL,
  `lastSeen` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `room` varchar(128) DEFAULT 'Uncategorized',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `iot_devices_deviceId_unique` (`deviceId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=390001;

-- Table: journal_entries
CREATE TABLE `journal_entries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `prompt` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: lab_quiz_attempts
CREATE TABLE `lab_quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `experimentId` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `totalQuestions` int(11) NOT NULL,
  `correctAnswers` int(11) NOT NULL,
  `passed` int(11) NOT NULL,
  `answers` text DEFAULT NULL,
  `timeSpent` int(11) DEFAULT NULL,
  `attemptedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: lab_quiz_questions
CREATE TABLE `lab_quiz_questions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `experimentId` int(11) NOT NULL,
  `question` text NOT NULL,
  `options` text NOT NULL,
  `correctAnswer` int(11) NOT NULL,
  `explanation` text DEFAULT NULL,
  `category` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: language_achievements
CREATE TABLE `language_achievements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `language` varchar(50) NOT NULL,
  `achievementType` varchar(128) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `iconUrl` varchar(512) DEFAULT NULL,
  `earnedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: language_exercises
CREATE TABLE `language_exercises` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `language` varchar(50) NOT NULL,
  `exerciseType` enum('translation','fill_blank','multiple_choice','matching','listening','speaking') NOT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `category` varchar(128) DEFAULT NULL,
  `prompt` text NOT NULL,
  `options` text DEFAULT NULL,
  `correctAnswer` text NOT NULL,
  `explanation` text DEFAULT NULL,
  `audioUrl` varchar(512) DEFAULT NULL,
  `relatedVocabulary` text DEFAULT NULL,
  `relatedGrammar` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: learning_badges
CREATE TABLE `learning_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `icon` varchar(100) DEFAULT NULL,
  `tier` enum('bronze','silver','gold','platinum') NOT NULL,
  `criteria` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: learning_sessions
CREATE TABLE `learning_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `topic` varchar(512) NOT NULL,
  `question` text NOT NULL,
  `explanation` text NOT NULL,
  `confidenceScore` int(11) NOT NULL,
  `sourcesCount` int(11) NOT NULL DEFAULT '0',
  `sessionType` enum('explanation','study_guide','quiz') NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=210001;

-- Table: learning_sources
CREATE TABLE `learning_sources` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `factCheckResultId` int(11) NOT NULL,
  `title` varchar(512) NOT NULL,
  `url` varchar(1024) NOT NULL,
  `sourceType` enum('academic','news','government','encyclopedia','other') NOT NULL,
  `credibilityScore` int(11) NOT NULL,
  `publishDate` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=210001;

-- Table: learning_tiers
CREATE TABLE `learning_tiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(200) NOT NULL,
  `description` text NOT NULL,
  `orderIndex` int(11) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `unlockCriteria` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: math_problems
CREATE TABLE `math_problems` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `topic` varchar(100) NOT NULL,
  `subtopic` varchar(100) DEFAULT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `problemText` text NOT NULL,
  `solution` text NOT NULL,
  `answer` varchar(255) NOT NULL,
  `hints` text DEFAULT NULL,
  `explanation` text DEFAULT NULL,
  `relatedConcepts` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: math_progress
CREATE TABLE `math_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `totalProblemsAttempted` int(11) NOT NULL DEFAULT '0',
  `totalProblemsSolved` int(11) NOT NULL DEFAULT '0',
  `topicsExplored` text DEFAULT NULL,
  `currentStreak` int(11) NOT NULL DEFAULT '0',
  `longestStreak` int(11) NOT NULL DEFAULT '0',
  `lastPracticeDate` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `math_progress_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: math_solutions
CREATE TABLE `math_solutions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `problemId` int(11) DEFAULT NULL,
  `problemText` text NOT NULL,
  `userAnswer` varchar(255) DEFAULT NULL,
  `isCorrect` int(11) DEFAULT NULL,
  `steps` text NOT NULL,
  `hintsUsed` int(11) NOT NULL DEFAULT '0',
  `timeSpent` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: meditation_sessions
CREATE TABLE `meditation_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `type` enum('meditation','breathing','sleep','focus','stress') NOT NULL,
  `duration` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: monthly_budget_summaries
CREATE TABLE `monthly_budget_summaries` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `monthYear` varchar(7) NOT NULL,
  `totalIncome` int(11) NOT NULL,
  `totalExpenses` int(11) NOT NULL,
  `totalDebtPayments` int(11) NOT NULL,
  `netCashFlow` int(11) NOT NULL,
  `savingsRate` int(11) NOT NULL,
  `debtPaymentRate` int(11) NOT NULL,
  `availableForExtraPayments` int(11) NOT NULL,
  `budgetHealth` enum('excellent','good','warning','critical') NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: mood_log
CREATE TABLE `mood_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `mood` enum('great','good','okay','bad','terrible') NOT NULL,
  `energy` int(11) DEFAULT '5',
  `stress` int(11) DEFAULT '5',
  `notes` text DEFAULT NULL,
  `factors` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: notification_preferences
CREATE TABLE `notification_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `budgetAlertsEnabled` int(11) NOT NULL DEFAULT '1',
  `threshold80Enabled` int(11) NOT NULL DEFAULT '1',
  `threshold100Enabled` int(11) NOT NULL DEFAULT '1',
  `exceededEnabled` int(11) NOT NULL DEFAULT '1',
  `weeklySummaryEnabled` int(11) NOT NULL DEFAULT '1',
  `monthlySummaryEnabled` int(11) NOT NULL DEFAULT '1',
  `insightsEnabled` int(11) NOT NULL DEFAULT '1',
  `recurringAlertsEnabled` int(11) NOT NULL DEFAULT '1',
  `notificationMethod` enum('in_app','push','both') NOT NULL DEFAULT 'both',
  `quietHoursStart` int(11) DEFAULT NULL,
  `quietHoursEnd` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `debtMilestonesEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Debt payoff milestones',
  `debtPaymentRemindersEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Payment due reminders',
  `debtStrategyUpdatesEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Strategy recommendations',
  `learningAchievementsEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Learning milestones',
  `streakRemindersEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Daily practice reminders',
  `quizResultsEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Quiz completion notifications',
  `factUpdatesEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Verified fact updates',
  `systemAlertsEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Important system updates',
  `securityAlertsEnabled` int(11) NOT NULL DEFAULT '1' COMMENT 'Security-related alerts',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `notification_preferences_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: performance_metrics
CREATE TABLE `performance_metrics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `value` int(11) NOT NULL,
  `tags` text DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_performance_metrics_name` (`name`),
  KEY `idx_performance_metrics_timestamp` (`timestamp`),
  KEY `idx_performance_metrics_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: practice_sessions
CREATE TABLE `practice_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `topicName` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `problemsSolved` int(11) NOT NULL DEFAULT '0',
  `problemsCorrect` int(11) NOT NULL DEFAULT '0',
  `accuracy` int(11) NOT NULL DEFAULT '0',
  `hintsUsed` int(11) NOT NULL DEFAULT '0',
  `duration` int(11) DEFAULT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: push_subscriptions
CREATE TABLE `push_subscriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `endpoint` text NOT NULL,
  `p256dh` text NOT NULL,
  `auth` text NOT NULL,
  `userAgent` text DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT '1',
  `lastUsed` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_push_subscriptions_userId` (`userId`),
  UNIQUE KEY `idx_push_subscriptions_endpoint` (`endpoint`(255))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: quiz_attempts
CREATE TABLE `quiz_attempts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `quizId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `score` int(11) NOT NULL,
  `correctAnswers` int(11) NOT NULL,
  `totalQuestions` int(11) NOT NULL,
  `timeSpent` int(11) DEFAULT NULL,
  `answers` text NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: quizzes
CREATE TABLE `quizzes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `learningSessionId` int(11) NOT NULL,
  `title` varchar(512) NOT NULL,
  `questions` text NOT NULL,
  `totalQuestions` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: receipt_line_items
CREATE TABLE `receipt_line_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `receiptId` int(11) NOT NULL,
  `itemName` varchar(255) NOT NULL,
  `itemDescription` text DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1000',
  `unitPrice` int(11) NOT NULL,
  `totalPrice` int(11) NOT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `subcategory` varchar(100) DEFAULT NULL,
  `lineNumber` int(11) DEFAULT NULL,
  `isRefunded` int(11) DEFAULT '0',
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_receipt_line_items_receipt_id` (`receiptId`),
  KEY `idx_receipt_line_items_category_id` (`categoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: receipts
CREATE TABLE `receipts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `transactionId` int(11) DEFAULT NULL,
  `sharedBudgetTransactionId` int(11) DEFAULT NULL,
  `merchantName` varchar(255) NOT NULL,
  `merchantAddress` text DEFAULT NULL,
  `merchantPhone` varchar(50) DEFAULT NULL,
  `receiptDate` timestamp NOT NULL,
  `receiptNumber` varchar(100) DEFAULT NULL,
  `paymentMethod` enum('cash','credit_card','debit_card','mobile_payment','other') DEFAULT NULL,
  `subtotal` int(11) DEFAULT NULL,
  `tax` int(11) DEFAULT NULL,
  `tip` int(11) DEFAULT NULL,
  `discount` int(11) DEFAULT NULL,
  `total` int(11) NOT NULL,
  `currency` varchar(3) DEFAULT 'USD',
  `imageUrl` varchar(512) NOT NULL,
  `thumbnailUrl` varchar(512) DEFAULT NULL,
  `fileSize` int(11) DEFAULT NULL,
  `mimeType` varchar(50) DEFAULT NULL,
  `ocrStatus` enum('pending','processing','completed','failed') DEFAULT 'pending',
  `ocrProvider` varchar(50) DEFAULT NULL,
  `ocrRawText` text DEFAULT NULL,
  `ocrConfidence` int(11) DEFAULT NULL,
  `ocrProcessedAt` timestamp NULL DEFAULT NULL,
  `ocrErrorMessage` text DEFAULT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `suggestedCategory` varchar(100) DEFAULT NULL,
  `categoryConfidence` int(11) DEFAULT NULL,
  `status` enum('draft','verified','disputed','archived') DEFAULT 'draft',
  `notes` text DEFAULT NULL,
  `tags` text DEFAULT NULL,
  `isReimbursable` int(11) DEFAULT '0',
  `reimbursementStatus` enum('pending','approved','rejected','paid') DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `verifiedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_receipts_user_id` (`userId`),
  KEY `idx_receipts_transaction_id` (`transactionId`),
  KEY `idx_receipts_merchant_name` (`merchantName`),
  KEY `idx_receipts_receipt_date` (`receiptDate`),
  KEY `idx_receipts_ocr_status` (`ocrStatus`),
  KEY `idx_receipts_status` (`status`),
  KEY `idx_receipts_created_at` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: recurring_transactions
CREATE TABLE `recurring_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `averageAmount` int(11) NOT NULL,
  `frequency` enum('weekly','biweekly','monthly','quarterly','yearly') NOT NULL,
  `nextExpectedDate` timestamp NULL DEFAULT NULL,
  `lastOccurrence` timestamp NULL DEFAULT NULL,
  `confidence` int(11) NOT NULL,
  `isActive` int(11) NOT NULL DEFAULT '1',
  `isSubscription` int(11) NOT NULL DEFAULT '0',
  `reminderEnabled` int(11) NOT NULL DEFAULT '1',
  `autoAdd` int(11) NOT NULL DEFAULT '0',
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: saved_translations
CREATE TABLE `saved_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `originalText` text NOT NULL,
  `translatedText` text NOT NULL,
  `sourceLanguage` varchar(50) NOT NULL,
  `targetLanguage` varchar(50) NOT NULL,
  `categoryId` int(11) DEFAULT NULL,
  `isFavorite` int(11) NOT NULL DEFAULT '0',
  `usageCount` int(11) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUsedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: science_progress
CREATE TABLE `science_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `totalExperimentsCompleted` int(11) NOT NULL DEFAULT '0',
  `physicsExperiments` int(11) NOT NULL DEFAULT '0',
  `chemistryExperiments` int(11) NOT NULL DEFAULT '0',
  `biologyExperiments` int(11) NOT NULL DEFAULT '0',
  `averageGrade` int(11) NOT NULL DEFAULT '0',
  `totalLabTime` int(11) NOT NULL DEFAULT '0',
  `safetyScore` int(11) NOT NULL DEFAULT '100',
  `lastExperimentDate` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `science_progress_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: shared_budget_activity
CREATE TABLE `shared_budget_activity` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sharedBudgetId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `action` varchar(100) NOT NULL,
  `details` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: shared_budget_categories
CREATE TABLE `shared_budget_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sharedBudgetId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(10) DEFAULT '💰',
  `color` varchar(20) DEFAULT '#10b981',
  `monthlyLimit` int(11) NOT NULL DEFAULT '0',
  `description` text DEFAULT NULL,
  `createdBy` int(11) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: shared_budget_members
CREATE TABLE `shared_budget_members` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sharedBudgetId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `role` enum('owner','editor','viewer') NOT NULL,
  `invitedBy` int(11) NOT NULL,
  `invitedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `joinedAt` timestamp NULL DEFAULT NULL,
  `status` enum('pending','active','declined','removed') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: shared_budget_transactions
CREATE TABLE `shared_budget_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sharedBudgetId` int(11) NOT NULL,
  `categoryId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `description` varchar(255) NOT NULL,
  `transactionDate` timestamp NOT NULL,
  `receiptUrl` varchar(512) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `isSplit` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: shared_budgets
CREATE TABLE `shared_budgets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `ownerId` int(11) NOT NULL,
  `status` enum('active','archived') NOT NULL DEFAULT 'active',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: sleep_tracking
CREATE TABLE `sleep_tracking` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `date` varchar(10) NOT NULL,
  `bedtime` varchar(5) DEFAULT NULL,
  `wakeTime` varchar(5) DEFAULT NULL,
  `duration` int(11) NOT NULL,
  `quality` enum('excellent','good','fair','poor') NOT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: split_expenses
CREATE TABLE `split_expenses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `transactionId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `amount` int(11) NOT NULL,
  `isPaid` int(11) NOT NULL DEFAULT '0',
  `paidAt` timestamp NULL DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: study_guides
CREATE TABLE `study_guides` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `learningSessionId` int(11) NOT NULL,
  `title` varchar(512) NOT NULL,
  `content` text NOT NULL,
  `topicsCount` int(11) NOT NULL DEFAULT '0',
  `questionsCount` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: system_logs
CREATE TABLE `system_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `level` enum('error','warn','info','http','debug') NOT NULL,
  `message` text NOT NULL,
  `context` varchar(255) DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_system_logs_level` (`level`),
  KEY `idx_system_logs_context` (`context`),
  KEY `idx_system_logs_timestamp` (`timestamp`),
  KEY `idx_system_logs_userId` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: topic_progress
CREATE TABLE `topic_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `topicName` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `status` enum('not_started','learning','practicing','mastered') NOT NULL DEFAULT 'not_started',
  `lessonCompleted` int(11) NOT NULL DEFAULT '0',
  `practiceCount` int(11) NOT NULL DEFAULT '0',
  `quizzesTaken` int(11) NOT NULL DEFAULT '0',
  `bestQuizScore` int(11) NOT NULL DEFAULT '0',
  `masteryLevel` int(11) NOT NULL DEFAULT '0',
  `lastStudied` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: topic_quiz_results
CREATE TABLE `topic_quiz_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `topicName` varchar(255) NOT NULL,
  `category` varchar(100) NOT NULL,
  `quizType` enum('quick_check','topic_quiz','mixed_review') NOT NULL DEFAULT 'topic_quiz',
  `score` int(11) NOT NULL,
  `totalQuestions` int(11) NOT NULL,
  `correctAnswers` int(11) NOT NULL,
  `timeSpent` int(11) DEFAULT NULL,
  `weakAreas` text DEFAULT NULL,
  `answers` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: translate_conversation_participants
CREATE TABLE `translate_conversation_participants` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversationId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `preferredLanguage` varchar(10) NOT NULL,
  `joinedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_tc_participants_conv` (`conversationId`),
  CONSTRAINT `fk_tc_participants_conv` FOREIGN KEY (`conversationId`) REFERENCES `8mC6ZNEwokHKmKSGT6E4hn`.`translate_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: translate_conversations
CREATE TABLE `translate_conversations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `shareableCode` varchar(64) NOT NULL,
  `creatorId` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT '1',
  `expiresAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `translate_conversations_shareableCode_unique` (`shareableCode`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: translate_message_translations
CREATE TABLE `translate_message_translations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `messageId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `translatedText` text NOT NULL,
  `targetLanguage` varchar(10) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_tc_msg_translations` (`messageId`),
  CONSTRAINT `fk_tc_msg_translations` FOREIGN KEY (`messageId`) REFERENCES `8mC6ZNEwokHKmKSGT6E4hn`.`translate_messages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: translate_messages
CREATE TABLE `translate_messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `conversationId` int(11) NOT NULL,
  `senderId` int(11) NOT NULL,
  `originalText` text NOT NULL,
  `originalLanguage` varchar(10) NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `fk_tc_messages_conv` (`conversationId`),
  CONSTRAINT `fk_tc_messages_conv` FOREIGN KEY (`conversationId`) REFERENCES `8mC6ZNEwokHKmKSGT6E4hn`.`translate_conversations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: translation_categories
CREATE TABLE `translation_categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: user_budget_templates
CREATE TABLE `user_budget_templates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `templateId` int(11) NOT NULL,
  `monthlyIncome` int(11) NOT NULL,
  `appliedAllocations` text NOT NULL,
  `appliedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `isActive` int(11) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: user_grammar_progress
CREATE TABLE `user_grammar_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `grammarLessonId` int(11) NOT NULL,
  `language` varchar(50) NOT NULL,
  `completed` int(11) NOT NULL DEFAULT '0',
  `masteryLevel` int(11) NOT NULL DEFAULT '0',
  `exercisesCompleted` int(11) NOT NULL DEFAULT '0',
  `lastStudied` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: user_lab_results
CREATE TABLE `user_lab_results` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `experimentId` int(11) NOT NULL,
  `observations` text NOT NULL,
  `measurements` text DEFAULT NULL,
  `analysis` text DEFAULT NULL,
  `conclusions` text DEFAULT NULL,
  `questionsAnswered` text DEFAULT NULL,
  `completedSteps` text DEFAULT NULL,
  `timeSpent` int(11) DEFAULT NULL,
  `grade` int(11) DEFAULT NULL,
  `feedback` text DEFAULT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: user_language_progress
CREATE TABLE `user_language_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `language` varchar(50) NOT NULL,
  `level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
  `fluencyScore` int(11) NOT NULL DEFAULT '0',
  `vocabularySize` int(11) NOT NULL DEFAULT '0',
  `grammarTopicsMastered` int(11) NOT NULL DEFAULT '0',
  `exercisesCompleted` int(11) NOT NULL DEFAULT '0',
  `totalStudyTime` int(11) NOT NULL DEFAULT '0',
  `currentStreak` int(11) NOT NULL DEFAULT '0',
  `longestStreak` int(11) NOT NULL DEFAULT '0',
  `lastStudied` timestamp NULL DEFAULT NULL,
  `dailyGoal` int(11) NOT NULL DEFAULT '15',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=540001;

-- Table: user_learning_badges
CREATE TABLE `user_learning_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `badgeId` int(11) NOT NULL,
  `earnedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: user_learning_progress
CREATE TABLE `user_learning_progress` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `articleId` int(11) NOT NULL,
  `status` enum('not_started','in_progress','completed') NOT NULL DEFAULT 'not_started',
  `progressPercentage` int(11) NOT NULL DEFAULT '0',
  `timeSpent` int(11) NOT NULL DEFAULT '0',
  `bookmarked` tinyint(1) NOT NULL DEFAULT '0',
  `lastReadAt` timestamp NULL DEFAULT NULL,
  `completedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: user_profiles
CREATE TABLE `user_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `sarcasmLevel` int(11) NOT NULL DEFAULT '5',
  `totalInteractions` int(11) NOT NULL DEFAULT '0',
  `positiveResponses` int(11) NOT NULL DEFAULT '0',
  `negativeResponses` int(11) NOT NULL DEFAULT '0',
  `averageResponseLength` int(11) NOT NULL DEFAULT '0',
  `preferredTopics` text DEFAULT NULL,
  `interactionPatterns` text DEFAULT NULL,
  `lastInteraction` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `user_profiles_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=90001;

-- Table: user_vocabulary
CREATE TABLE `user_vocabulary` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `vocabularyItemId` int(11) NOT NULL,
  `language` varchar(50) NOT NULL,
  `masteryLevel` int(11) NOT NULL DEFAULT '0',
  `timesReviewed` int(11) NOT NULL DEFAULT '0',
  `timesCorrect` int(11) NOT NULL DEFAULT '0',
  `timesIncorrect` int(11) NOT NULL DEFAULT '0',
  `lastReviewed` timestamp NULL DEFAULT NULL,
  `nextReview` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=420001;

-- Table: user_workout_history
CREATE TABLE `user_workout_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `workoutId` int(11) DEFAULT NULL,
  `workoutTitle` varchar(255) NOT NULL,
  `duration` int(11) NOT NULL,
  `caloriesBurned` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `completedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `supabaseId` varchar(64) NOT NULL,
  `name` text DEFAULT NULL,
  `email` varchar(320) DEFAULT NULL,
  `loginMethod` varchar(64) DEFAULT NULL,
  `role` enum('user','admin') NOT NULL DEFAULT 'user',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `lastSignedIn` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `preferredLanguage` varchar(10) DEFAULT 'en',
  `subscriptionTier` enum('free','starter','pro','ultimate') NOT NULL DEFAULT 'free',
  `subscriptionStatus` enum('active','inactive','trial') NOT NULL DEFAULT 'inactive',
  `subscriptionExpiresAt` timestamp NULL DEFAULT NULL,
  `preferredCurrency` varchar(3) DEFAULT 'USD',
  `staySignedIn` tinyint(1) NOT NULL DEFAULT '0',
  `twoFactorEnabled` tinyint(1) NOT NULL DEFAULT '0',
  `twoFactorSecret` varchar(255) DEFAULT NULL,
  `backupCodes` text DEFAULT NULL,
  `subscriptionPrice` decimal(10,2) DEFAULT NULL,
  `subscriptionCurrency` varchar(3) DEFAULT 'GBP',
  `selectedSpecializedHubs` text DEFAULT NULL,
  `hubsSelectedAt` timestamp NULL DEFAULT NULL,
  `subscriptionPeriod` enum('monthly','six_month','annual') DEFAULT 'monthly',
  `manusOpenId` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  KEY `idx_users_email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=23610001;

-- Table: verified_facts
CREATE TABLE `verified_facts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `question` text NOT NULL,
  `normalizedQuestion` varchar(512) NOT NULL,
  `answer` text NOT NULL,
  `verificationStatus` enum('verified','disputed','debunked','unverified') NOT NULL,
  `confidenceScore` int(11) NOT NULL,
  `sources` text NOT NULL,
  `verifiedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `expiresAt` timestamp NOT NULL,
  `accessCount` int(11) NOT NULL DEFAULT '0',
  `lastAccessedAt` timestamp NULL DEFAULT NULL,
  `verifiedByUserId` int(11) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: vocabulary_items
CREATE TABLE `vocabulary_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `language` varchar(50) NOT NULL,
  `word` varchar(255) NOT NULL,
  `translation` varchar(255) NOT NULL,
  `pronunciation` varchar(255) DEFAULT NULL,
  `partOfSpeech` varchar(100) NOT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `category` varchar(128) DEFAULT NULL,
  `exampleSentence` text DEFAULT NULL,
  `exampleTranslation` text DEFAULT NULL,
  `audioUrl` varchar(512) DEFAULT NULL,
  `imageUrl` varchar(512) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=60001;

-- Table: wearable_connections
CREATE TABLE `wearable_connections` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `provider` enum('apple_health','google_fit','fitbit','garmin','samsung_health','other') NOT NULL,
  `deviceName` varchar(255) DEFAULT NULL,
  `accessToken` text DEFAULT NULL,
  `refreshToken` text DEFAULT NULL,
  `tokenExpiresAt` timestamp NULL DEFAULT NULL,
  `scope` text DEFAULT NULL,
  `isActive` int(11) NOT NULL DEFAULT '1',
  `lastSyncAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: wearable_data_cache
CREATE TABLE `wearable_data_cache` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `connectionId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `dataType` enum('steps','heart_rate','sleep','weight','calories','distance','active_minutes','blood_pressure','blood_glucose','oxygen_saturation') NOT NULL,
  `rawData` text NOT NULL,
  `timestamp` timestamp NOT NULL,
  `processed` int(11) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: wearable_sync_logs
CREATE TABLE `wearable_sync_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `connectionId` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `dataType` enum('steps','heart_rate','sleep','weight','calories','distance','active_minutes','blood_pressure','blood_glucose','oxygen_saturation') NOT NULL,
  `recordsProcessed` int(11) NOT NULL DEFAULT '0',
  `status` enum('success','failed','partial') NOT NULL,
  `errorMessage` text DEFAULT NULL,
  `syncStartedAt` timestamp NOT NULL,
  `syncCompletedAt` timestamp NULL DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: wellbeing_reminders
CREATE TABLE `wellbeing_reminders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `type` enum('medication','hydration','exercise','meditation','custom') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `time` varchar(5) DEFAULT NULL,
  `frequency` enum('daily','weekly','custom') NOT NULL,
  `isActive` int(11) NOT NULL DEFAULT '1',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: wellness_goals
CREATE TABLE `wellness_goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `goalType` enum('weight','workout_frequency','nutrition','sleep','meditation','custom') NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `targetValue` varchar(100) DEFAULT NULL,
  `currentValue` varchar(100) DEFAULT NULL,
  `targetDate` timestamp NULL DEFAULT NULL,
  `status` enum('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
  `progress` int(11) DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `completedAt` timestamp NULL DEFAULT NULL,
  `lastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- Table: wellness_profiles
CREATE TABLE `wellness_profiles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) NOT NULL,
  `fitnessLevel` enum('beginner','intermediate','advanced') NOT NULL,
  `primaryGoals` text NOT NULL,
  `activityLevel` enum('sedentary','lightly_active','moderately_active','very_active','extremely_active') NOT NULL,
  `sleepHoursPerNight` int(11) DEFAULT NULL,
  `dietPreference` varchar(100) DEFAULT NULL,
  `challenges` text DEFAULT NULL,
  `availableEquipment` text DEFAULT NULL,
  `workoutDaysPerWeek` int(11) DEFAULT NULL,
  `workoutDurationPreference` int(11) DEFAULT NULL,
  `medicalConditions` text DEFAULT NULL,
  `injuries` text DEFAULT NULL,
  `preferredWorkoutTypes` text DEFAULT NULL,
  `preferredWorkoutTime` varchar(50) DEFAULT NULL,
  `completedOnboarding` int(11) NOT NULL DEFAULT '1',
  `onboardingCompletedAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `lastUpdated` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */,
  UNIQUE KEY `wellness_profiles_userId_unique` (`userId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;

-- Table: workouts
CREATE TABLE `workouts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('yoga','hiit','strength','pilates','cardio','stretching','other') NOT NULL,
  `difficulty` enum('beginner','intermediate','advanced') NOT NULL,
  `duration` int(11) NOT NULL,
  `equipment` text DEFAULT NULL,
  `focusArea` varchar(100) DEFAULT NULL,
  `videoUrl` varchar(512) DEFAULT NULL,
  `audioUrl` varchar(512) DEFAULT NULL,
  `thumbnailUrl` varchar(512) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `caloriesBurned` int(11) DEFAULT NULL,
  `instructions` text DEFAULT NULL,
  PRIMARY KEY (`id`) /*T![clustered_index] CLUSTERED */
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin AUTO_INCREMENT=30001;
