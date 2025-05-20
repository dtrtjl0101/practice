UPDATE ebook_purchase SET percentage = 0 WHERE percentage IS NULL;

ALTER TABLE ebook_purchase
    MODIFY COLUMN percentage BIGINT NOT NULL;
