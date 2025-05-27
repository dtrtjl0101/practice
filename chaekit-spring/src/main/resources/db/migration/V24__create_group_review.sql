CREATE TABLE group_review (
    id BIGINT NOT NULL AUTO_INCREMENT,
    group_id BIGINT NOT NULL,
    activity_id BIGINT NOT NULL,
    author_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    KEY `FK_group_review_activity` (activity_id),
    KEY `FK_group_review_author` (author_id),
    PRIMARY KEY (id),
    CONSTRAINT `FK_group_review_activity` FOREIGN KEY (activity_id) REFERENCES chaekit.`activity` (id),
    CONSTRAINT `FK_group_review_author` FOREIGN KEY (author_id) REFERENCES `user_profile` (id)
);

CREATE TABLE group_review_tag (
    id BIGINT NOT NULL AUTO_INCREMENT,
    group_review_id BIGINT NOT NULL,
    tag varchar(255) NOT NULL,
    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id),

    KEY `idx_group_review_tag_review` (`group_review_id`),
    KEY `idx_group_review_tag_tag` (`tag`),
    KEY `idx_group_review_tag_review_tag` (`group_review_id`, `tag`),
    UNIQUE KEY `uk_group_review_tag_review_tag` (`group_review_id`, `tag`),

    CONSTRAINT `FK_group_review_tag_group_review`
        FOREIGN KEY (group_review_id) REFERENCES `group_review` (id)
);