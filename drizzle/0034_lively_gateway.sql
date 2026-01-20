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
ALTER TABLE `users` MODIFY COLUMN `subscriptionTier` enum('free','starter','pro','ultimate') NOT NULL DEFAULT 'free';--> statement-breakpoint
ALTER TABLE `users` ADD `selectedSpecializedPaths` text;--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionPrice` decimal(10,2);--> statement-breakpoint
ALTER TABLE `users` ADD `subscriptionCurrency` varchar(3) DEFAULT 'GBP';