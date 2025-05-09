CREATE TABLE credit_wallet (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    balance BIGINT NOT NULL,
    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES user_profile(id)
);

CREATE TABLE credit_transaction (
    id BIGINT NOT NULL AUTO_INCREMENT,
    wallet_id BIGINT NOT NULL,
    transaction_type VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    description VARCHAR(255) DEFAULT NULL,
    created_at datetime(6) DEFAULT NULL,
    modified_at datetime(6) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (wallet_id) REFERENCES credit_wallet(id)
);