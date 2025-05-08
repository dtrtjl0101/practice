ALTER TABLE discussion_comment
    ADD COLUMN is_deleted bit DEFAULT 0 NOT NULL,
    ADD COLUMN is_edited bit DEFAULT 0 NOT NULL,
    ADD COLUMN stance varchar(255) NOT NULL,
    ADD COLUMN parent_id bigint DEFAULT NULL,
    ADD KEY `FK_discussion_comment` (`parent_id`),
ADD CONSTRAINT `FK_discussion_comment` FOREIGN KEY (`parent_id`) REFERENCES `discussion_comment` (`id`);

ALTER TABLE discussion
    ADD COLUMN is_debate bit DEFAULT 0 NOT NULL;