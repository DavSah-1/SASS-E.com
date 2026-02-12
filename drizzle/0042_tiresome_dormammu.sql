CREATE TABLE `api_usage_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`apiName` varchar(255) NOT NULL,
	`endpoint` varchar(512),
	`method` varchar(10),
	`statusCode` int,
	`duration` int,
	`quotaUsed` int NOT NULL DEFAULT 1,
	`userId` int,
	`success` boolean NOT NULL,
	`errorMessage` text,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `api_usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `error_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`errorType` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`stack` text,
	`context` varchar(255),
	`metadata` text,
	`userId` int,
	`resolved` boolean NOT NULL DEFAULT false,
	`resolvedAt` timestamp,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `error_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `performance_metrics` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`value` int NOT NULL,
	`tags` text,
	`userId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `performance_metrics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `system_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`level` enum('error','warn','info','http','debug') NOT NULL,
	`message` text NOT NULL,
	`context` varchar(255),
	`metadata` text,
	`userId` int,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `system_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_apiName` ON `api_usage_logs` (`apiName`);--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_userId` ON `api_usage_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_success` ON `api_usage_logs` (`success`);--> statement-breakpoint
CREATE INDEX `idx_api_usage_logs_timestamp` ON `api_usage_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_errorType` ON `error_logs` (`errorType`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_context` ON `error_logs` (`context`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_resolved` ON `error_logs` (`resolved`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_timestamp` ON `error_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_error_logs_userId` ON `error_logs` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_performance_metrics_name` ON `performance_metrics` (`name`);--> statement-breakpoint
CREATE INDEX `idx_performance_metrics_timestamp` ON `performance_metrics` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_performance_metrics_userId` ON `performance_metrics` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_level` ON `system_logs` (`level`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_context` ON `system_logs` (`context`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_timestamp` ON `system_logs` (`timestamp`);--> statement-breakpoint
CREATE INDEX `idx_system_logs_userId` ON `system_logs` (`userId`);