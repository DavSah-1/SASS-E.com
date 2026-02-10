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
