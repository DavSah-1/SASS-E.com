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
	`notificationMethod` enum('in_app','push','both') NOT NULL DEFAULT 'both',
	`quietHoursStart` int,
	`quietHoursEnd` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_preferences_userId_unique` UNIQUE(`userId`)
);
