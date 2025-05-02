ALTER TABLE publisher_profile
    ADD COLUMN approval_status VARCHAR(255) DEFAULT 'PENDING';

UPDATE publisher_profile
    SET approval_status = CASE
        WHEN accepted = 1 THEN 'APPROVED'
        ELSE 'PENDING'
    END;

-- 4. 기존 boolean 컬럼 삭제
ALTER TABLE publisher_profile DROP COLUMN accepted;