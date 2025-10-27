CREATE TABLE `conversation_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`feedbackType` enum('like','dislike','too_sarcastic','not_sarcastic_enough','helpful','unhelpful') NOT NULL,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `conversation_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sarcasmLevel` int NOT NULL DEFAULT 5,
	`totalInteractions` int NOT NULL DEFAULT 0,
	`positiveResponses` int NOT NULL DEFAULT 0,
	`negativeResponses` int NOT NULL DEFAULT 0,
	`averageResponseLength` int NOT NULL DEFAULT 0,
	`preferredTopics` text,
	`interactionPatterns` text,
	`lastInteraction` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_profiles_userId_unique` UNIQUE(`userId`)
);
