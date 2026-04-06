-- Migration: Security Constraints
-- Created: 2026-04-06
-- Description: Adds database-level constraints for data integrity and security

BEGIN;

-- Prevent self-messaging threads
ALTER TABLE threads
  ADD CONSTRAINT chk_threads_no_self
  CHECK (user1_id != user2_id);

-- Prevent duplicate saves (same user saving same listing twice)
-- First check if the constraint already exists
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
ALTER TABLE messages
  ADD CONSTRAINT chk_messages_body_length
  CHECK (length(body) <= 5000);

COMMIT;
