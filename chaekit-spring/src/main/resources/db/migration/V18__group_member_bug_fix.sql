ALTER TABLE group_member
    ADD COLUMN created_at datetime(6) DEFAULT NULL,
    ADD COLUMN modified_at datetime(6) DEFAULT NULL,
    ADD COLUMN approved_at datetime(6) DEFAULT NULL;

UPDATE group_member
SET created_at = NOW(), modified_at = NOW()
WHERE created_at IS NULL OR modified_at IS NULL;