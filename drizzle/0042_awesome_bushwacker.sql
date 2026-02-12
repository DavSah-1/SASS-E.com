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
ALTER TABLE `iot_devices` ADD CONSTRAINT `idx_iot_devices_deviceId` UNIQUE(`deviceId`);--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `idx_users_supabaseId` UNIQUE(`supabaseId`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_userId` ON `budget_transactions` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_categoryId` ON `budget_transactions` (`categoryId`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_transactionDate` ON `budget_transactions` (`transactionDate`);--> statement-breakpoint
CREATE INDEX `idx_budget_transactions_userId_date` ON `budget_transactions` (`userId`,`transactionDate`);--> statement-breakpoint
CREATE INDEX `idx_conversations_userId` ON `conversations` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_conversations_createdAt` ON `conversations` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_conversations_userId_createdAt` ON `conversations` (`userId`,`createdAt`);--> statement-breakpoint
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
CREATE INDEX `idx_quiz_attempts_userId` ON `quiz_attempts` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_quizId` ON `quiz_attempts` (`quizId`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_createdAt` ON `quiz_attempts` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_quiz_attempts_userId_quizId` ON `quiz_attempts` (`userId`,`quizId`);--> statement-breakpoint
CREATE INDEX `idx_users_email` ON `users` (`email`);--> statement-breakpoint
CREATE INDEX `idx_users_subscriptionTier` ON `users` (`subscriptionTier`);--> statement-breakpoint
CREATE INDEX `idx_users_subscriptionStatus` ON `users` (`subscriptionStatus`);