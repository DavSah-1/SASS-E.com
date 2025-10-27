CREATE TABLE `iot_command_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`command` varchar(255) NOT NULL,
	`parameters` text,
	`status` enum('success','failed','pending') NOT NULL,
	`errorMessage` text,
	`executedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `iot_command_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `iot_devices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`deviceId` varchar(128) NOT NULL,
	`deviceName` varchar(255) NOT NULL,
	`deviceType` enum('light','thermostat','plug','switch','sensor','lock','camera','speaker','other') NOT NULL,
	`manufacturer` varchar(128),
	`model` varchar(128),
	`status` enum('online','offline','error') NOT NULL DEFAULT 'offline',
	`state` text,
	`capabilities` text,
	`connectionType` enum('mqtt','http','websocket','local') NOT NULL,
	`connectionConfig` text,
	`lastSeen` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `iot_devices_id` PRIMARY KEY(`id`),
	CONSTRAINT `iot_devices_deviceId_unique` UNIQUE(`deviceId`)
);
