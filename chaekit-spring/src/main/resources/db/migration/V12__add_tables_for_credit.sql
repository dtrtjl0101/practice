CREATE TABLE credit_wallet (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE ,
    balance BIGINT NOT NULL,
    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user_profile(id)
);

CREATE TABLE credit_transaction (
    id BIGINT NOT NULL AUTO_INCREMENT,
    tid VARCHAR(20) NOT NULL,
    order_id VARCHAR(36) NOT NULL,
    credit_product_id INT NOT NULL,
    credit_product_name VARCHAR(255) NOT NULL,
    wallet_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    credit_amount INT NOT NULL,
    payment_amount INT NOT NULL,
    approved_at datetime(6) DEFAULT NULL,
    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (wallet_id) REFERENCES credit_wallet(id)
);

INSERT INTO credit_wallet (user_id, balance, created_at, modified_at)
SELECT u.id, 0, NOW(6), NOW(6)
FROM user_profile u
    LEFT JOIN credit_wallet w ON u.id = w.user_id
WHERE w.user_id IS NULL;