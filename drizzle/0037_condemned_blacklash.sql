-- Rename openId column to supabaseId
ALTER TABLE `users` CHANGE COLUMN `openId` `supabaseId` varchar(64) NOT NULL;
