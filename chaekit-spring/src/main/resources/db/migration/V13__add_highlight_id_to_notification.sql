ALTER TABLE notification
    ADD COLUMN highlight_id BIGINT,
    ADD CONSTRAINT fk_notification_highlight
        FOREIGN KEY (highlight_id)
            REFERENCES highlight (id)
            ON DELETE SET NULL;
ALTER TABLE notification
    ADD COLUMN discussion_comment_id BIGINT,
    ADD CONSTRAINT fk_notification_discussion_comment
        FOREIGN KEY (discussion_comment_id)
        REFERENCES discussion_comment (id)
        ON DELETE SET NULL;
ALTER TABLE notification
    ADD COLUMN discussion_id BIGINT,
    ADD CONSTRAINT fk_notification_discussion
        FOREIGN KEY (discussion_id)
            REFERENCES discussion (id)
            ON DELETE SET NULL;