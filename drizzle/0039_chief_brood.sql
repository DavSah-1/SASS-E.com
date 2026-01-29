ALTER TABLE `users` DROP INDEX `users_manusOpenId_unique`;--> statement-breakpoint
ALTER TABLE `users` ADD `supabaseId` varchar(64) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_supabaseId_unique` UNIQUE(`supabaseId`);--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `manusOpenId`;