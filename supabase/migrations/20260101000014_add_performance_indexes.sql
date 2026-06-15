-- Migration 014: Performance Indexes
-- Description: Adds indexes for common query patterns to improve page load times

BEGIN;

-- Listings: filter by active status + sort by date (used on /listings page)
CREATE INDEX IF NOT EXISTS idx_listings_active_created
  ON listings (is_active, created_at DESC);

-- Listings: sort featured first (used for featured_until ordering)
CREATE INDEX IF NOT EXISTS idx_listings_featured
  ON listings (featured_until DESC NULLS LAST);

-- Profiles: sort featured first (used on /explore page)
CREATE INDEX IF NOT EXISTS idx_profiles_featured
  ON profiles (featured_until DESC NULLS LAST);

-- Messages: fetch by thread sorted by date (used on /messages/[thread_id])
CREATE INDEX IF NOT EXISTS idx_messages_thread_created
  ON messages (thread_id, created_at DESC);

-- Listing saves: lookup by user (used on /saved page)
CREATE INDEX IF NOT EXISTS idx_listing_saves_user
  ON listing_saves (user_id);

-- Threads: lookup by participants (used when finding existing threads)
CREATE INDEX IF NOT EXISTS idx_threads_users
  ON threads (user1_id, user2_id);

COMMIT;
