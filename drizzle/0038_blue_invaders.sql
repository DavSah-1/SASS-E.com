ALTER TABLE `users` DROP INDEX `users_supabaseId_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `manusOpenId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_manusOpenId_unique` UNIQUE(`manusOpenId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `supabaseId`;