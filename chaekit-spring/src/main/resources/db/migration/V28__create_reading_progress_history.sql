CREATE TABLE reading_progress_history (
        id BIGINT NOT NULL AUTO_INCREMENT,
        activity_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        percentage BIGINT NOT NULL,
        created_at datetime(6) DEFAULT NULL,
        modified_at datetime(6) DEFAULT NULL,
        PRIMARY KEY (id),
        KEY idx_reading_progress_history_activity (activity_id),
        KEY idx_reading_progress_history_user (user_id),
        CONSTRAINT FK_reading_progress_history_activity FOREIGN KEY (activity_id) REFERENCES activity(id),
        CONSTRAINT FK_reading_progress_history_user FOREIGN KEY (user_id) REFERENCES user_profile(id)
);