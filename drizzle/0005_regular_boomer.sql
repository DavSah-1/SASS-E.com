CREATE TABLE `daily_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`lessonDate` timestamp NOT NULL,
	`vocabularyItems` text NOT NULL,
	`grammarTopics` text,
	`exercises` text NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`completionTime` int,
	`score` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `daily_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercise_attempts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`exerciseId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`userAnswer` text NOT NULL,
	`isCorrect` int NOT NULL,
	`timeSpent` int,
	`hintsUsed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `exercise_attempts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `grammar_lessons` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(50) NOT NULL,
	`topic` varchar(255) NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`explanation` text NOT NULL,
	`examples` text NOT NULL,
	`commonMistakes` text,
	`relatedTopics` text,
	`exercises` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `grammar_lessons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_achievements` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`achievementType` varchar(128) NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`iconUrl` varchar(512),
	`earnedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `language_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `language_exercises` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(50) NOT NULL,
	`exerciseType` enum('translation','fill_blank','multiple_choice','matching','listening','speaking') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`category` varchar(128),
	`prompt` text NOT NULL,
	`options` text,
	`correctAnswer` text NOT NULL,
	`explanation` text,
	`audioUrl` varchar(512),
	`relatedVocabulary` text,
	`relatedGrammar` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `language_exercises_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_grammar_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`grammarLessonId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`completed` int NOT NULL DEFAULT 0,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`exercisesCompleted` int NOT NULL DEFAULT 0,
	`lastStudied` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_grammar_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_language_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
	`fluencyScore` int NOT NULL DEFAULT 0,
	`vocabularySize` int NOT NULL DEFAULT 0,
	`grammarTopicsMastered` int NOT NULL DEFAULT 0,
	`exercisesCompleted` int NOT NULL DEFAULT 0,
	`totalStudyTime` int NOT NULL DEFAULT 0,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastStudied` timestamp,
	`dailyGoal` int NOT NULL DEFAULT 15,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_language_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_vocabulary` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`vocabularyItemId` int NOT NULL,
	`language` varchar(50) NOT NULL,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`timesReviewed` int NOT NULL DEFAULT 0,
	`timesCorrect` int NOT NULL DEFAULT 0,
	`timesIncorrect` int NOT NULL DEFAULT 0,
	`lastReviewed` timestamp,
	`nextReview` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_vocabulary_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `vocabulary_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`language` varchar(50) NOT NULL,
	`word` varchar(255) NOT NULL,
	`translation` varchar(255) NOT NULL,
	`pronunciation` varchar(255),
	`partOfSpeech` enum('noun','verb','adjective','adverb','preposition','conjunction','pronoun','interjection') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`category` varchar(128),
	`exampleSentence` text,
	`exampleTranslation` text,
	`audioUrl` varchar(512),
	`imageUrl` varchar(512),
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `vocabulary_items_id` PRIMARY KEY(`id`)
);
