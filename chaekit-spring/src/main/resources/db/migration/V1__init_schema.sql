CREATE TABLE `member` (
                          `created_at` datetime(6) DEFAULT NULL,
                          `id` bigint NOT NULL AUTO_INCREMENT,
                          `modified_at` datetime(6) DEFAULT NULL,
                          `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                          `username` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                          `role` enum('ROLE_ADMIN','ROLE_PUBLISHER','ROLE_USER') COLLATE utf8mb4_general_ci NOT NULL,
                          PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `user_profile` (
                                `created_at` datetime(6) DEFAULT NULL,
                                `id` bigint NOT NULL AUTO_INCREMENT,
                                `member_id` bigint NOT NULL,
                                `modified_at` datetime(6) DEFAULT NULL,
                                `nickname` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                PRIMARY KEY (`id`),
                                UNIQUE KEY `UKbcl0c68e9qsw1qgkoo1u1mtsb` (`member_id`),
                                CONSTRAINT `FK1041ipglc9uppwvdggk5i3a1r` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `reading_group` (
                                 `id` bigint NOT NULL AUTO_INCREMENT,
                                 `created_at` datetime(6) DEFAULT NULL,
                                 `modified_at` datetime(6) DEFAULT NULL,
                                 `description` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                 `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                 `group_leader_id` bigint NOT NULL,
                                 PRIMARY KEY (`id`),
                                 KEY `FK3j0broaq1aa9hyomi23f5bv74` (`group_leader_id`),
                                 CONSTRAINT `FK3j0broaq1aa9hyomi23f5bv74` FOREIGN KEY (`group_leader_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `publisher_profile` (
                                     `accepted` bit(1) NOT NULL,
                                     `created_at` datetime(6) DEFAULT NULL,
                                     `id` bigint NOT NULL AUTO_INCREMENT,
                                     `member_id` bigint NOT NULL,
                                     `modified_at` datetime(6) DEFAULT NULL,
                                     `publisher_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                     PRIMARY KEY (`id`),
                                     UNIQUE KEY `UKlx33eo0cjfx2vnemp0ddmqpcn` (`member_id`),
                                     CONSTRAINT `FKp572d0j0y3l44ig7jaf9pi9ep` FOREIGN KEY (`member_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ebook` (
                         `created_at` datetime(6) DEFAULT NULL,
                         `id` bigint NOT NULL AUTO_INCREMENT,
                         `modified_at` datetime(6) DEFAULT NULL,
                         `publisher_id` bigint DEFAULT NULL,
                         `size` bigint NOT NULL,
                         `author` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
                         `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
                         `file_key` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                         `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                         PRIMARY KEY (`id`),
                         KEY `FK4c0e4rpnkldvcpvwx4hn2ouu9` (`publisher_id`),
                         CONSTRAINT `FK4c0e4rpnkldvcpvwx4hn2ouu9` FOREIGN KEY (`publisher_id`) REFERENCES `publisher_profile` (`id`),
                         CONSTRAINT `FKfxsj468a7v1h63gc6jdbwhovu` FOREIGN KEY (`publisher_id`) REFERENCES `member` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `activity` (
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `created_at` datetime(6) DEFAULT NULL,
                            `modified_at` datetime(6) DEFAULT NULL,
                            `book_id` bigint DEFAULT NULL,
                            `group_id` bigint DEFAULT NULL,
                            `description` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
                            `end_time` date NOT NULL,
                            `start_time` date NOT NULL,
                            PRIMARY KEY (`id`),
                            KEY `FKmfxe1l971a2nsy0penc0mjo3b` (`book_id`),
                            KEY `FKj6jv9t2u93uhmv0aco2lf18jd` (`group_id`),
                            CONSTRAINT `FKj6jv9t2u93uhmv0aco2lf18jd` FOREIGN KEY (`group_id`) REFERENCES `reading_group` (`id`),
                            CONSTRAINT `FKmfxe1l971a2nsy0penc0mjo3b` FOREIGN KEY (`book_id`) REFERENCES `ebook` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `activity_member` (
                                   `id` bigint NOT NULL AUTO_INCREMENT,
                                   `created_at` datetime(6) DEFAULT NULL,
                                   `modified_at` datetime(6) DEFAULT NULL,
                                   `activity_id` bigint DEFAULT NULL,
                                   `user_id` bigint DEFAULT NULL,
                                   PRIMARY KEY (`id`),
                                   KEY `FKskdmikk616xfedne9obhu6bkk` (`activity_id`),
                                   KEY `FKomoi8xrmqvcx9y8q4wmp9vpx5` (`user_id`),
                                   CONSTRAINT `FKomoi8xrmqvcx9y8q4wmp9vpx5` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`),
                                   CONSTRAINT `FKskdmikk616xfedne9obhu6bkk` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `discussion` (
                              `id` bigint NOT NULL AUTO_INCREMENT,
                              `created_at` datetime(6) DEFAULT NULL,
                              `modified_at` datetime(6) DEFAULT NULL,
                              `content` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                              `title` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                              `activity_id` bigint DEFAULT NULL,
                              `author_id` bigint DEFAULT NULL,
                              PRIMARY KEY (`id`),
                              KEY `FKoq0iurojetjx1fesdu6dvu9a1` (`activity_id`),
                              KEY `FKfq7dq84r4jx7gkdimc4y7xe4s` (`author_id`),
                              CONSTRAINT `FKfq7dq84r4jx7gkdimc4y7xe4s` FOREIGN KEY (`author_id`) REFERENCES `user_profile` (`id`),
                              CONSTRAINT `FKoq0iurojetjx1fesdu6dvu9a1` FOREIGN KEY (`activity_id`) REFERENCES `activity` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `discussion_comment` (
                                      `id` bigint NOT NULL AUTO_INCREMENT,
                                      `created_at` datetime(6) DEFAULT NULL,
                                      `modified_at` datetime(6) DEFAULT NULL,
                                      `content` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                      `author_id` bigint DEFAULT NULL,
                                      `discussion_id` bigint DEFAULT NULL,
                                      PRIMARY KEY (`id`),
                                      KEY `FKjsnx6b4ujamu0409et7q4tm16` (`author_id`),
                                      KEY `FKgxxniud1i4tselxhyl7q1s7ph` (`discussion_id`),
                                      CONSTRAINT `FKgxxniud1i4tselxhyl7q1s7ph` FOREIGN KEY (`discussion_id`) REFERENCES `discussion` (`id`),
                                      CONSTRAINT `FKjsnx6b4ujamu0409et7q4tm16` FOREIGN KEY (`author_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `group_member` (
                                `id` bigint NOT NULL AUTO_INCREMENT,
                                `group_id` bigint NOT NULL,
                                `user_id` bigint NOT NULL,
                                PRIMARY KEY (`id`),
                                KEY `FKbgxm8nsntg2indd3mivf3mjn7` (`group_id`),
                                KEY `FKob9xunk26yff126j7my006t9s` (`user_id`),
                                CONSTRAINT `FKbgxm8nsntg2indd3mivf3mjn7` FOREIGN KEY (`group_id`) REFERENCES `reading_group` (`id`),
                                CONSTRAINT `FKob9xunk26yff126j7my006t9s` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `group_tag` (
                             `id` bigint NOT NULL AUTO_INCREMENT,
                             `created_at` datetime(6) DEFAULT NULL,
                             `modified_at` datetime(6) DEFAULT NULL,
                             `tag_name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                             `reading_group_id` bigint DEFAULT NULL,
                             PRIMARY KEY (`id`),
                             KEY `FKf0vlo4rmt8mo2l39i93kpd08j` (`reading_group_id`),
                             CONSTRAINT `FKf0vlo4rmt8mo2l39i93kpd08j` FOREIGN KEY (`reading_group_id`) REFERENCES `reading_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `highlight` (
                             `id` bigint NOT NULL AUTO_INCREMENT,
                             `created_at` datetime(6) DEFAULT NULL,
                             `modified_at` datetime(6) DEFAULT NULL,
                             `cfi` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                             `memo` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
                             `spine` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                             `author_id` bigint DEFAULT NULL,
                             `book_id` bigint DEFAULT NULL,
                             PRIMARY KEY (`id`),
                             KEY `FKpb8bjqu0yxjx5it47jw2wcg04` (`author_id`),
                             KEY `FK3bcqe7pk1il1x4nh1yoqi0me3` (`book_id`),
                             CONSTRAINT `FK3bcqe7pk1il1x4nh1yoqi0me3` FOREIGN KEY (`book_id`) REFERENCES `ebook` (`id`),
                             CONSTRAINT `FKpb8bjqu0yxjx5it47jw2wcg04` FOREIGN KEY (`author_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `highlight_comment` (
                                     `id` bigint NOT NULL AUTO_INCREMENT,
                                     `created_at` datetime(6) DEFAULT NULL,
                                     `modified_at` datetime(6) DEFAULT NULL,
                                     `content` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                     `author_id` bigint DEFAULT NULL,
                                     `highlight_id` bigint DEFAULT NULL,
                                     PRIMARY KEY (`id`),
                                     KEY `FKpcs6qn7wkbwquxx2ftu1wqyr8` (`author_id`),
                                     KEY `FK2etvn5jl0xwbbsqns74sihkys` (`highlight_id`),
                                     CONSTRAINT `FK2etvn5jl0xwbbsqns74sihkys` FOREIGN KEY (`highlight_id`) REFERENCES `highlight` (`id`),
                                     CONSTRAINT `FKpcs6qn7wkbwquxx2ftu1wqyr8` FOREIGN KEY (`author_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `highlight_reaction` (
                                      `id` bigint NOT NULL AUTO_INCREMENT,
                                      `created_at` datetime(6) DEFAULT NULL,
                                      `modified_at` datetime(6) DEFAULT NULL,
                                      `reaction_type` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
                                      `author_id` bigint DEFAULT NULL,
                                      `highlight_id` bigint DEFAULT NULL,
                                      PRIMARY KEY (`id`),
                                      KEY `FK3n9d7fd7vlromgqm46ds8regv` (`author_id`),
                                      KEY `FKrpdq32v6xftuap8uknnwfsepf` (`highlight_id`),
                                      CONSTRAINT `FK3n9d7fd7vlromgqm46ds8regv` FOREIGN KEY (`author_id`) REFERENCES `user_profile` (`id`),
                                      CONSTRAINT `FKrpdq32v6xftuap8uknnwfsepf` FOREIGN KEY (`highlight_id`) REFERENCES `highlight` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `purchase` (
                            `id` bigint NOT NULL AUTO_INCREMENT,
                            `created_at` datetime(6) DEFAULT NULL,
                            `modified_at` datetime(6) DEFAULT NULL,
                            `price` bigint NOT NULL,
                            `book_id` bigint DEFAULT NULL,
                            `user_id` bigint DEFAULT NULL,
                            PRIMARY KEY (`id`),
                            KEY `FK4nuc9vlqq3mpg1daih5yt0udl` (`book_id`),
                            KEY `FKgh2l5l355obrhv46qyhgfwaln` (`user_id`),
                            CONSTRAINT `FK4nuc9vlqq3mpg1daih5yt0udl` FOREIGN KEY (`book_id`) REFERENCES `ebook` (`id`),
                            CONSTRAINT `FKgh2l5l355obrhv46qyhgfwaln` FOREIGN KEY (`user_id`) REFERENCES `user_profile` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;