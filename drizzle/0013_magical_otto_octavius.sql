CREATE TABLE `experiment_steps` (
	`id` int AUTO_INCREMENT NOT NULL,
	`experimentId` int NOT NULL,
	`stepNumber` int NOT NULL,
	`instruction` text NOT NULL,
	`expectedResult` text,
	`safetyNote` text,
	`imageUrl` varchar(512),
	`videoUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experiment_steps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `experiments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(512) NOT NULL,
	`category` enum('physics','chemistry','biology') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`description` text NOT NULL,
	`equipment` text NOT NULL,
	`safetyWarnings` text,
	`duration` int NOT NULL,
	`learningObjectives` text,
	`backgroundInfo` text,
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `experiments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `science_progress` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`totalExperimentsCompleted` int NOT NULL DEFAULT 0,
	`physicsExperiments` int NOT NULL DEFAULT 0,
	`chemistryExperiments` int NOT NULL DEFAULT 0,
	`biologyExperiments` int NOT NULL DEFAULT 0,
	`averageGrade` int NOT NULL DEFAULT 0,
	`totalLabTime` int NOT NULL DEFAULT 0,
	`safetyScore` int NOT NULL DEFAULT 100,
	`lastExperimentDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `science_progress_id` PRIMARY KEY(`id`),
	CONSTRAINT `science_progress_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `user_lab_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`experimentId` int NOT NULL,
	`observations` text NOT NULL,
	`measurements` text,
	`analysis` text,
	`conclusions` text,
	`questionsAnswered` text,
	`completedSteps` text,
	`timeSpent` int,
	`grade` int,
	`feedback` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_lab_results_id` PRIMARY KEY(`id`)
);
