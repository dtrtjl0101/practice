ALTER TABLE notification
    ADD COLUMN discussion_comment_id BIGINT,
    ADD CONSTRAINT fk_notification_discussion_comment
        FOREIGN KEY (discussion_comment_id)
        REFERENCES discussion_comment (id); 