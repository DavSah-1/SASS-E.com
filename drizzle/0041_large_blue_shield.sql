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
