ALTER TABLE `users` ADD `twoFactorEnabled` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `twoFactorSecret` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `backupCodes` text;