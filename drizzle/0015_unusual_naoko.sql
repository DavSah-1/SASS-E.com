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
