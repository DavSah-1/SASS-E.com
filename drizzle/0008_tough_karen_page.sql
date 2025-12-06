CREATE TABLE `coaching_sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`sessionType` enum('welcome','milestone_celebration','payment_logged','missed_payment','strategy_suggestion','progress_update','motivation','setback_recovery') NOT NULL,
	`message` text NOT NULL,
	`sentiment` enum('encouraging','celebratory','supportive','motivational') NOT NULL,
	`relatedDebtId` int,
	`relatedMilestoneId` int,
	`userResponse` enum('helpful','not_helpful','inspiring'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `coaching_sessions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_budget_snapshots` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`monthYear` varchar(7) NOT NULL,
	`totalIncome` int NOT NULL,
	`totalExpenses` int NOT NULL,
	`totalDebtPayments` int NOT NULL,
	`extraPaymentBudget` int NOT NULL,
	`actualExtraPayments` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_budget_snapshots_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_milestones` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`debtId` int,
	`milestoneType` enum('first_payment','first_extra_payment','25_percent_paid','50_percent_paid','75_percent_paid','debt_paid_off','all_debts_paid','payment_streak_7','payment_streak_30','saved_1000_interest') NOT NULL,
	`title` varchar(255) NOT NULL,
	`description` text,
	`amountSaved` int,
	`achievedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_milestones_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`debtId` int NOT NULL,
	`userId` int NOT NULL,
	`amount` int NOT NULL,
	`paymentDate` timestamp NOT NULL,
	`paymentType` enum('minimum','extra','lump_sum','automatic') NOT NULL,
	`balanceAfter` int NOT NULL,
	`principalPaid` int NOT NULL,
	`interestPaid` int NOT NULL,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debt_strategies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`strategyType` enum('snowball','avalanche','custom') NOT NULL,
	`monthlyExtraPayment` int NOT NULL,
	`projectedPayoffDate` timestamp NOT NULL,
	`totalInterestPaid` int NOT NULL,
	`totalInterestSaved` int NOT NULL,
	`monthsToPayoff` int NOT NULL,
	`payoffOrder` text NOT NULL,
	`calculatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `debt_strategies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `debts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`debtName` varchar(255) NOT NULL,
	`debtType` enum('credit_card','student_loan','personal_loan','auto_loan','mortgage','medical','other') NOT NULL,
	`originalBalance` int NOT NULL,
	`currentBalance` int NOT NULL,
	`interestRate` int NOT NULL,
	`minimumPayment` int NOT NULL,
	`dueDay` int NOT NULL,
	`creditor` varchar(255),
	`accountNumber` varchar(100),
	`status` enum('active','paid_off','closed') NOT NULL DEFAULT 'active',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`paidOffAt` timestamp,
	CONSTRAINT `debts_id` PRIMARY KEY(`id`)
);
