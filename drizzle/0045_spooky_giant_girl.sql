CREATE TABLE `receipt_line_items` (
	`id` int AUTO_INCREMENT NOT NULL,
	`receiptId` int NOT NULL,
	`itemName` varchar(255) NOT NULL,
	`itemDescription` text,
	`quantity` int NOT NULL DEFAULT 1000,
	`unitPrice` int NOT NULL,
	`totalPrice` int NOT NULL,
	`sku` varchar(100),
	`barcode` varchar(100),
	`categoryId` int,
	`subcategory` varchar(100),
	`lineNumber` int,
	`isRefunded` int DEFAULT 0,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `receipt_line_items_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `receipts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`transactionId` int,
	`sharedBudgetTransactionId` int,
	`merchantName` varchar(255) NOT NULL,
	`merchantAddress` text,
	`merchantPhone` varchar(50),
	`receiptDate` timestamp NOT NULL,
	`receiptNumber` varchar(100),
	`paymentMethod` enum('cash','credit_card','debit_card','mobile_payment','other'),
	`subtotal` int,
	`tax` int,
	`tip` int,
	`discount` int,
	`total` int NOT NULL,
	`currency` varchar(3) DEFAULT 'USD',
	`imageUrl` varchar(512) NOT NULL,
	`thumbnailUrl` varchar(512),
	`fileSize` int,
	`mimeType` varchar(50),
	`ocrStatus` enum('pending','processing','completed','failed') DEFAULT 'pending',
	`ocrProvider` varchar(50),
	`ocrRawText` text,
	`ocrConfidence` int,
	`ocrProcessedAt` timestamp,
	`ocrErrorMessage` text,
	`categoryId` int,
	`suggestedCategory` varchar(100),
	`categoryConfidence` int,
	`status` enum('draft','verified','disputed','archived') DEFAULT 'draft',
	`notes` text,
	`tags` text,
	`isReimbursable` int DEFAULT 0,
	`reimbursementStatus` enum('pending','approved','rejected','paid'),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`verifiedAt` timestamp,
	CONSTRAINT `receipts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `idx_receipt_line_items_receipt_id` ON `receipt_line_items` (`receiptId`);--> statement-breakpoint
CREATE INDEX `idx_receipt_line_items_category_id` ON `receipt_line_items` (`categoryId`);--> statement-breakpoint
CREATE INDEX `idx_receipts_user_id` ON `receipts` (`userId`);--> statement-breakpoint
CREATE INDEX `idx_receipts_transaction_id` ON `receipts` (`transactionId`);--> statement-breakpoint
CREATE INDEX `idx_receipts_merchant_name` ON `receipts` (`merchantName`);--> statement-breakpoint
CREATE INDEX `idx_receipts_receipt_date` ON `receipts` (`receiptDate`);--> statement-breakpoint
CREATE INDEX `idx_receipts_ocr_status` ON `receipts` (`ocrStatus`);--> statement-breakpoint
CREATE INDEX `idx_receipts_status` ON `receipts` (`status`);--> statement-breakpoint
CREATE INDEX `idx_receipts_created_at` ON `receipts` (`createdAt`);