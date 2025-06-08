ALTER TABLE member
  CHANGE COLUMN username email VARCHAR(255) NOT NULL,
  ADD CONSTRAINT unique_email UNIQUE (email);