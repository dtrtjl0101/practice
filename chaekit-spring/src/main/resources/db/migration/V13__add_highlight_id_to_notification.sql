ALTER TABLE notification
    ADD COLUMN highlight_id BIGINT,
    ADD CONSTRAINT fk_notification_highlight
        FOREIGN KEY (highlight_id)
            REFERENCES highlight (id); 