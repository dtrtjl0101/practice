ALTER TABLE `highlight`
ADD COLUMN `activity_id` bigint DEFAULT NULL,
ADD KEY `FK_highlight_activity` (`activity_id`),
ADD CONSTRAINT `FK_highlight_activity` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`);