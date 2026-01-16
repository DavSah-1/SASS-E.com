CREATE TABLE `saved_translations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`originalText` text NOT NULL,
	`translatedText` text NOT NULL,
	`sourceLanguage` varchar(50) NOT NULL,
	`targetLanguage` varchar(50) NOT NULL,
	`categoryId` int,
	`isFavorite` int NOT NULL DEFAULT 0,
	`usageCount` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`lastUsedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `saved_translations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `translation_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `translation_categories_id` PRIMARY KEY(`id`)
);
