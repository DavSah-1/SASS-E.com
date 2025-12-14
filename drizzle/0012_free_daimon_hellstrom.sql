CREATE TABLE `math_problems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`topic` varchar(100) NOT NULL,
	`subtopic` varchar(100),
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`problemText` text NOT NULL,
	`solution` text NOT NULL,
	`answer` varchar(255) NOT NULL,
	`hints` text,
	`explanation` text,
	`relatedConcepts` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `math_problems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `math_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalProblemsAttempted` int NOT NULL DEFAULT 0,
	`totalProblemsSolved` int NOT NULL DEFAULT 0,
	`topicsExplored` text,
	`currentStreak` int NOT NULL DEFAULT 0,
	`longestStreak` int NOT NULL DEFAULT 0,
	`lastPracticeDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `math_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `math_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `math_solutions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`problemId` int,
	`problemText` text NOT NULL,
	`userAnswer` varchar(255),
	`isCorrect` int,
	`steps` text NOT NULL,
	`hintsUsed` int NOT NULL DEFAULT 0,
	`timeSpent` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `math_solutions_id` PRIMARY KEY(`id`)
);
