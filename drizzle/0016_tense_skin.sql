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
