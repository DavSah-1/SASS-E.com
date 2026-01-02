CREATE TABLE `coaching_feedback` (
	`id` int AUTO_INCREMENT NOT NULL,
	`recommendationId` int NOT NULL,
	`userId` int NOT NULL,
	`helpful` int,
	`rating` int,
	`comment` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_feedback_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `coaching_recommendations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`recommendationType` enum('workout','nutrition','mental_wellness','sleep','general') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text NOT NULL,
	`reasoning` text,
	`priority` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`actionable` int NOT NULL DEFAULT 1,
	`actionUrl` varchar(512),
	`basedOnData` text,
	`viewed` int NOT NULL DEFAULT 0,
	`viewedAt` timestamp,
	`dismissed` int NOT NULL DEFAULT 0,
	`dismissedAt` timestamp,
	`completed` int NOT NULL DEFAULT 0,
	`completedAt` timestamp,
	`expiresAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_recommendations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellness_goals` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`goalType` enum('weight','workout_frequency','nutrition','sleep','meditation','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`targetValue` varchar(100),
	`currentValue` varchar(100),
	`targetDate` timestamp,
	`status` enum('active','completed','paused','abandoned') NOT NULL DEFAULT 'active',
	`progress` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wellness_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellness_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`fitnessLevel` enum('beginner','intermediate','advanced') NOT NULL,
	`primaryGoals` text NOT NULL,
	`activityLevel` enum('sedentary','lightly_active','moderately_active','very_active','extremely_active') NOT NULL,
	`sleepHoursPerNight` int,
	`dietPreference` varchar(100),
	`challenges` text,
	`availableEquipment` text,
	`workoutDaysPerWeek` int,
	`workoutDurationPreference` int,
	`medicalConditions` text,
	`injuries` text,
	`preferredWorkoutTypes` text,
	`preferredWorkoutTime` varchar(50),
	`completedOnboarding` int NOT NULL DEFAULT 1,
	`onboardingCompletedAt` timestamp NOT NULL DEFAULT (now()),
	`lastUpdated` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wellness_profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `wellness_profiles_userId_unique` UNIQUE(`userId`)
);
