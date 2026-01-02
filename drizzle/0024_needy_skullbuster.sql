CREATE TABLE `wearable_connections` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`provider` enum('apple_health','google_fit','fitbit','garmin','samsung_health','other') NOT NULL,
	`deviceName` varchar(255),
	`accessToken` text,
	`refreshToken` text,
	`tokenExpiresAt` timestamp,
	`scope` text,
	`isActive` int NOT NULL DEFAULT 1,
	`lastSyncAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `wearable_connections_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_data_cache` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`userId` int NOT NULL,
	`dataType` enum('steps','heart_rate','sleep','weight','calories','distance','active_minutes','blood_pressure','blood_glucose','oxygen_saturation') NOT NULL,
	`rawData` text NOT NULL,
	`timestamp` timestamp NOT NULL,
	`processed` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_data_cache_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wearable_sync_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`connectionId` int NOT NULL,
	`userId` int NOT NULL,
	`dataType` enum('steps','heart_rate','sleep','weight','calories','distance','active_minutes','blood_pressure','blood_glucose','oxygen_saturation') NOT NULL,
	`recordsProcessed` int NOT NULL DEFAULT 0,
	`status` enum('success','failed','partial') NOT NULL,
	`errorMessage` text,
	`syncStartedAt` timestamp NOT NULL,
	`syncCompletedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wearable_sync_logs_id` PRIMARY KEY(`id`)
);
