CREATE TABLE `shared_budget_activity` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`userId` int NOT NULL,
	`action` varchar(100) NOT NULL,
	`details` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shared_budget_activity_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`icon` varchar(10) DEFAULT '💰',
	`color` varchar(20) DEFAULT '#10b981',
	`monthlyLimit` int NOT NULL DEFAULT 0,
	`description` text,
	`createdBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_budget_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`userId` int NOT NULL,
	`role` enum('owner','editor','viewer') NOT NULL,
	`invitedBy` int NOT NULL,
	`invitedAt` timestamp NOT NULL DEFAULT (now()),
	`joinedAt` timestamp,
	`status` enum('pending','active','declined','removed') NOT NULL DEFAULT 'pending',
	CONSTRAINT `shared_budget_members_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budget_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sharedBudgetId` int NOT NULL,
	`categoryId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`description` varchar(255) NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`receiptUrl` varchar(512),
	`notes` text,
	`isSplit` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_budget_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shared_budgets` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`ownerId` int NOT NULL,
	`status` enum('active','archived') NOT NULL DEFAULT 'active',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shared_budgets_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `split_expenses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`transactionId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`isPaid` int NOT NULL DEFAULT 0,
	`paidAt` timestamp,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `split_expenses_id` PRIMARY KEY(`id`)
);
