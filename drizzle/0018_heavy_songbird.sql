CREATE TABLE `recurring_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`averageAmount` int NOT NULL,
	`frequency` enum('weekly','biweekly','monthly','quarterly','yearly') NOT NULL,
	`nextExpectedDate` timestamp,
	`lastOccurrence` timestamp,
	`confidence` int NOT NULL,
	`isActive` int NOT NULL DEFAULT 1,
	`isSubscription` int NOT NULL DEFAULT 0,
	`reminderEnabled` int NOT NULL DEFAULT 1,
	`autoAdd` int NOT NULL DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `recurring_transactions_id` PRIMARY KEY(`id`)
);
