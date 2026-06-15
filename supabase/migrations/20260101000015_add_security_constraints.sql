-- Migration 015: Security Constraints
-- Description: Adds database-level constraints for data integrity and security

BEGIN;

-- Prevent self-messaging threads
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_threads_no_self'
  ) THEN
    ALTER TABLE threads
      ADD CONSTRAINT chk_threads_no_self
      CHECK (user1_id != user2_id);
  END IF;
END $$;

-- Prevent duplicate saves (same user saving same listing twice)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'uq_listing_saves_user_listing'
  ) THEN
    ALTER TABLE listing_saves
      ADD CONSTRAINT uq_listing_saves_user_listing
      UNIQUE (user_id, listing_id);
  END IF;
END $$;

-- Add length constraint to messages body
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'chk_messages_body_length'
  ) THEN
    ALTER TABLE messages
      ADD CONSTRAINT chk_messages_body_length
      CHECK (length(body) <= 5000);
  END IF;
END $$;

COMMIT;
