ALTER TABLE highlight_comment
ADD COLUMN parent_id BIGINT DEFAULT NULL,
ADD KEY FK_highlight_comment_parent (parent_id),
ADD CONSTRAINT FK_highlight_comment_parent FOREIGN KEY (parent_id) REFERENCES highlight_comment (id);