ALTER TABLE ebook_purchase
    ADD COLUMN cfi varchar(255) DEFAULT NULL,
    ADD COLUMN percentage BIGINT DEFAULT NULL;
