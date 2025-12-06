CREATE TABLE `budget_categories` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(100) NOT NULL,
	`type` enum('income','expense') NOT NULL,
	`monthlyLimit` int,
	`color` varchar(7) NOT NULL,
	`icon` varchar(50),
	`isDefault` int NOT NULL DEFAULT 0,
	`sortOrder` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `budget_transactions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`categoryId` int NOT NULL,
	`amount` int NOT NULL,
	`transactionDate` timestamp NOT NULL,
	`description` varchar(255),
	`notes` text,
	`isRecurring` int NOT NULL DEFAULT 0,
	`recurringFrequency` enum('weekly','biweekly','monthly','yearly'),
	`tags` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `budget_transactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `monthly_budget_summaries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthYear` varchar(7) NOT NULL,
	`totalIncome` int NOT NULL,
	`totalExpenses` int NOT NULL,
	`totalDebtPayments` int NOT NULL,
	`netCashFlow` int NOT NULL,
	`savingsRate` int NOT NULL,
	`debtPaymentRate` int NOT NULL,
	`availableForExtraPayments` int NOT NULL,
	`budgetHealth` enum('excellent','good','warning','critical') NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `monthly_budget_summaries_id` PRIMARY KEY(`id`)
);
