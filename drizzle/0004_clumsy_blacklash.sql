CREATE TABLE `fact_check_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`learningSessionId` int NOT NULL,
	`claim` text NOT NULL,
	`verificationStatus` enum('verified','disputed','debunked','unverified') NOT NULL,
	`confidenceScore` int NOT NULL,
	`sources` text NOT NULL,
	`explanation` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `fact_check_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topic` varchar(512) NOT NULL,
	`question` text NOT NULL,
	`explanation` text NOT NULL,
	`confidenceScore` int NOT NULL,
	`sourcesCount` int NOT NULL DEFAULT 0,
	`sessionType` enum('explanation','study_guide','quiz') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `learning_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`factCheckResultId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`url` varchar(1024) NOT NULL,
	`sourceType` enum('academic','news','government','encyclopedia','other') NOT NULL,
	`credibilityScore` int NOT NULL,
	`publishDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `learning_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quiz_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`quizId` int NOT NULL,
	`userId` int NOT NULL,
	`score` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`timeSpent` int,
	`answers` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quiz_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `quizzes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`learningSessionId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`questions` text NOT NULL,
	`totalQuestions` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `quizzes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `study_guides` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`learningSessionId` int NOT NULL,
	`title` varchar(512) NOT NULL,
	`content` text NOT NULL,
	`topicsCount` int NOT NULL DEFAULT 0,
	`questionsCount` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `study_guides_id` PRIMARY KEY(`id`)
);
