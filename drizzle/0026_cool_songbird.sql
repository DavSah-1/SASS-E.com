CREATE TABLE `verified_facts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`question` text NOT NULL,
	`normalizedQuestion` varchar(512) NOT NULL,
	`answer` text NOT NULL,
	`verificationStatus` enum('verified','disputed','debunked','unverified') NOT NULL,
	`confidenceScore` int NOT NULL,
	`sources` text NOT NULL,
	`verifiedAt` timestamp NOT NULL DEFAULT (now()),
	`expiresAt` timestamp NOT NULL,
	`accessCount` int NOT NULL DEFAULT 0,
	`lastAccessedAt` timestamp,
	`verifiedByUserId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verified_facts_id` PRIMARY KEY(`id`)
);
