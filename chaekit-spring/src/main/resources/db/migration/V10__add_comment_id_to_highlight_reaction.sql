ALTER TABLE highlight_reaction
ADD COLUMN comment_id BIGINT DEFAULT NULL,
ADD KEY FK_highlight_reaction_comment (comment_id),
ADD CONSTRAINT FK_highlight_reaction_comment FOREIGN KEY (comment_id) REFERENCES highlight_comment (id);