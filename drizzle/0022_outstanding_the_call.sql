ALTER TABLE `food_log` MODIFY COLUMN `calories` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` MODIFY COLUMN `protein` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` MODIFY COLUMN `carbs` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` MODIFY COLUMN `fat` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` ADD `barcode` varchar(50);--> statement-breakpoint
ALTER TABLE `food_log` ADD `servingQuantity` decimal(10,2) DEFAULT '1';--> statement-breakpoint
ALTER TABLE `food_log` ADD `fiber` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` ADD `sugars` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` ADD `saturatedFat` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` ADD `sodium` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` ADD `cholesterol` decimal(10,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `food_log` ADD `vitaminA` decimal(10,2);--> statement-breakpoint
ALTER TABLE `food_log` ADD `vitaminC` decimal(10,2);--> statement-breakpoint
ALTER TABLE `food_log` ADD `calcium` decimal(10,2);--> statement-breakpoint
ALTER TABLE `food_log` ADD `iron` decimal(10,2);