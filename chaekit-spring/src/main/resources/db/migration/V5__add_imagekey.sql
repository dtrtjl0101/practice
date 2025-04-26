ALTER TABLE ebook ADD COLUMN cover_image_key varchar(255) DEFAULT null;
ALTER TABLE reading_group ADD COLUMN group_image_key varchar(255) DEFAULT null;
ALTER TABLE user_profile ADD COLUMN profile_image_key varchar(255) DEFAULT null;
ALTER TABLE publisher_profile ADD COLUMN profile_image_key varchar(255) DEFAULT null;