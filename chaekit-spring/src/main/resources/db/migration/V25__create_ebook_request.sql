CREATE TABLE ebook_request (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description VARCHAR(10000),
    size BIGINT NOT NULL,
    price INT NOT NULL,
    file_key VARCHAR(255) NOT NULL,
    cover_image_key VARCHAR(255),
    publisher_id BIGINT NOT NULL,
    
    ebook_id BIGINT DEFAULT NULL,
    status VARCHAR(255) NOT NULL,
    reject_reason VARCHAR(1000),
    
    created_at DATETIME(6) DEFAULT NULL,
    modified_at DATETIME(6) DEFAULT NULL,

    CONSTRAINT `FK_ebook_request_publisher` FOREIGN KEY (publisher_id) REFERENCES publisher_profile (id),
    CONSTRAINT `FK_ebook_request_ebook` FOREIGN KEY (ebook_id) REFERENCES ebook (id)
);
