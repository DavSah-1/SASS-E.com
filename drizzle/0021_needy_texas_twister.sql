CREATE TABLE `daily_activity_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`steps` int DEFAULT 0,
	`distance` int DEFAULT 0,
	`calories` int DEFAULT 0,
	`activeMinutes` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `daily_activity_stats_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `food_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`mealType` enum('breakfast','lunch','dinner','snack') NOT NULL,
	`foodName` varchar(255) NOT NULL,
	`servingSize` varchar(100),
	`calories` int DEFAULT 0,
	`protein` int DEFAULT 0,
	`carbs` int DEFAULT 0,
	`fat` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `food_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`weight` int,
	`bodyFatPercentage` int,
	`muscleMass` int,
	`restingHeartRate` int,
	`bloodPressureSystolic` int,
	`bloodPressureDiastolic` int,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `health_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `hydration_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`amount` int NOT NULL,
	`loggedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `hydration_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `journal_entries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`title` varchar(255),
	`content` text NOT NULL,
	`prompt` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `journal_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meditation_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('meditation','breathing','sleep','focus','stress') NOT NULL,
	`duration` int NOT NULL,
	`title` varchar(255),
	`notes` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `meditation_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `mood_log` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`mood` enum('great','good','okay','bad','terrible') NOT NULL,
	`energy` int DEFAULT 5,
	`stress` int DEFAULT 5,
	`notes` text,
	`factors` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mood_log_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sleep_tracking` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`date` varchar(10) NOT NULL,
	`bedtime` varchar(5),
	`wakeTime` varchar(5),
	`duration` int NOT NULL,
	`quality` enum('excellent','good','fair','poor') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `sleep_tracking_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_workout_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`workoutId` int,
	`workoutTitle` varchar(255) NOT NULL,
	`duration` int NOT NULL,
	`caloriesBurned` int,
	`notes` text,
	`completedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `user_workout_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wellbeing_reminders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`type` enum('medication','hydration','exercise','meditation','custom') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`time` varchar(5),
	`frequency` enum('daily','weekly','custom') NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wellbeing_reminders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `workouts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`type` enum('yoga','hiit','strength','pilates','cardio','stretching','other') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`duration` int NOT NULL,
	`equipment` text,
	`focusArea` varchar(100),
	`videoUrl` varchar(512),
	`audioUrl` varchar(512),
	`thumbnailUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `workouts_id` PRIMARY KEY(`id`)
);
