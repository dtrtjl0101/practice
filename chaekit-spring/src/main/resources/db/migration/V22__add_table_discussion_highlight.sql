CREATE TABLE `discussion_highlight` (
    `id` bigint NOT NULL AUTO_INCREMENT,
    `discussion_id` bigint NOT NULL,
    `highlight_id` bigint NOT NULL,
    `created_at` datetime(6) DEFAULT NULL,
    `modified_at` datetime(6) DEFAULT NULL,

    PRIMARY KEY (`id`),
    KEY `FK_discussion_highlight_to_discussion` (`discussion_id`),
    KEY `FK_discussion_highlight_to_highlight` (`highlight_id`),
    CONSTRAINT `FK_discussion_highlight_to_discussion` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`id`),
    CONSTRAINT `FK_discussion_highlight_to_highlight` FOREIGN KEY (`highlight_id`) REFERENCES `highlight` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
