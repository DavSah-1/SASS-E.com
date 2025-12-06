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
