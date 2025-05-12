ALTER TABLE credit_transaction RENAME TO credit_payment_transaction;

CREATE TABLE credit_usage_transaction (
    id BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    wallet_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    credit_amount INT NOT NULL,

    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    FOREIGN KEY (wallet_id) REFERENCES credit_wallet(id)
);

ALTER TABLE purchase RENAME TO ebook_purchase;
ALTER TABLE ebook_purchase
    ADD COLUMN credit_usage_transaction_id BIGINT NOT NULL,
    ADD KEY `FK_ebook_purchase_to_transaction` (`credit_usage_transaction_id`),
    ADD CONSTRAINT `FK_ebook_purchase_to_transaction` FOREIGN KEY (`credit_usage_transaction_id`) REFERENCES `credit_usage_transaction` (`id`);
