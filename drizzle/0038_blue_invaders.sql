-- Migration already partially applied
-- Skip index drop if it doesn't exist, add manusOpenId if it doesn't exist
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `manusOpenId` varchar(64);
-- Update constraint only if column exists and constraint doesn't
