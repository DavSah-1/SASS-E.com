CREATE TABLE `translate_conversation_participants` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`userId` int NOT NULL,
	`preferredLanguage` varchar(10) NOT NULL,
	`joinedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translate_conversation_participants_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translate_conversations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`shareableCode` varchar(64) NOT NULL,
	`creatorId` int NOT NULL,
	`title` varchar(255),
	`isActive` int NOT NULL DEFAULT 1,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `translate_conversations_id` PRIMARY KEY(`id`),
	CONSTRAINT `translate_conversations_shareableCode_unique` UNIQUE(`shareableCode`)
);
--> statement-breakpoint
CREATE TABLE `translate_message_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`messageId` int NOT NULL,
	`userId` int NOT NULL,
	`translatedText` text NOT NULL,
	`targetLanguage` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translate_message_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translate_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`conversationId` int NOT NULL,
	`senderId` int NOT NULL,
	`originalText` text NOT NULL,
	`originalLanguage` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translate_messages_id` PRIMARY KEY(`id`)
);
