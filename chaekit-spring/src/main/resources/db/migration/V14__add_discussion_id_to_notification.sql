ALTER TABLE notification
    ADD COLUMN discussion_id BIGINT,
    ADD CONSTRAINT fk_notification_discussion
        FOREIGN KEY (discussion_id)
            REFERENCES discussion (id); 