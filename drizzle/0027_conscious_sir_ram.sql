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
CREATE TABLE `fact_update_notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`verifiedFactId` int NOT NULL,
	`oldVersion` text NOT NULL,
	`newVersion` text NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`isRead` int NOT NULL DEFAULT 0,
	`readAt` timestamp,
	`isDismissed` int NOT NULL DEFAULT 0,
	`dismissedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fact_update_notifications_id` PRIMARY KEY(`id`)
);
