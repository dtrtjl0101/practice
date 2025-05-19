CREATE TABLE `group_chat` (
                              `id` bigint NOT NULL AUTO_INCREMENT,
                              `created_at` datetime(6) DEFAULT NULL,
                              `modified_at` datetime(6) DEFAULT NULL,
                              `content` varchar(1000) COLLATE utf8mb4_general_ci NOT NULL,
                              `author_id` bigint DEFAULT NULL,
                              `group_id` bigint DEFAULT NULL,
                              PRIMARY KEY (`id`),
                              KEY `FK_group_chat_author` (`author_id`),
                              KEY `FK_group_chat_group` (`group_id`),
                              CONSTRAINT `FK_group_chat_author` FOREIGN KEY (`author_id`) REFERENCES `user_profile` (`id`),
                              CONSTRAINT `FK_group_chat_group` FOREIGN KEY (`group_id`) REFERENCES `reading_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;