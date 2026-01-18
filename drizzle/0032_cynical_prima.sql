CREATE TABLE `practice_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicName` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`problemsSolved` int NOT NULL DEFAULT 0,
	`problemsCorrect` int NOT NULL DEFAULT 0,
	`accuracy` int NOT NULL DEFAULT 0,
	`hintsUsed` int NOT NULL DEFAULT 0,
	`duration` int,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `practice_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topic_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicName` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`status` enum('not_started','learning','practicing','mastered') NOT NULL DEFAULT 'not_started',
	`lessonCompleted` int NOT NULL DEFAULT 0,
	`practiceCount` int NOT NULL DEFAULT 0,
	`quizzesTaken` int NOT NULL DEFAULT 0,
	`bestQuizScore` int NOT NULL DEFAULT 0,
	`masteryLevel` int NOT NULL DEFAULT 0,
	`lastStudied` timestamp NOT NULL DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `topic_progress_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `topic_quiz_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`topicName` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`quizType` enum('quick_check','topic_quiz','mixed_review') NOT NULL DEFAULT 'topic_quiz',
	`score` int NOT NULL,
	`totalQuestions` int NOT NULL,
	`correctAnswers` int NOT NULL,
	`timeSpent` int,
	`weakAreas` text,
	`answers` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `topic_quiz_results_id` PRIMARY KEY(`id`)
);
