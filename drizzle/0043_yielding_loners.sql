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
CREATE INDEX `idx_cleanup_logs_createdAt` ON `cleanup_logs` (`createdAt`);--> statement-breakpoint
CREATE INDEX `idx_cleanup_logs_triggeredBy` ON `cleanup_logs` (`triggeredBy`);