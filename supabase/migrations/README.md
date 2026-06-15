# Supabase Migrations

All schema changes are tracked here. Apply to production with:

```bash
npm run db:push
```

## Migration history

| File | Description |
|---|---|
| `20260101000001_create_locations.sql` | `locations` table + RLS |
| `20260101000002_create_profiles.sql` | `profiles` table + RLS + `handle_updated_at` trigger |
| `20260101000003_create_listings.sql` | `listings` table + RLS |
| `20260101000004_create_listing_saves.sql` | `listing_saves` table + RLS |
| `20260101000005_create_messaging.sql` | `threads` + `messages` tables + RLS |
| `20260101000006_create_thread_participants.sql` | `thread_participants` table + RLS (profile_id FK) |
| `20260101000007_add_listing_images.sql` | `listings.image_urls` column |
| `20260101000008_add_location_id.sql` | `location_id` FK on `listings` and `profiles` |
| `20260101000009_add_listing_subtype_and_amenities.sql` | `listing_subtype`, `lifestyle_prefs`, `amenities`, `budget_min/max` |
| `20260101000010_add_featured_until.sql` | `featured_until` on `profiles` and `listings` |
| `20260101000011_add_profile_lifestyle_and_listing_active.sql` | Lifestyle columns on `profiles`, `is_active` on `listings` |
| `20260101000012_create_reports.sql` | `reports` table + RLS |
| `20260101000013_fix_age_constraint.sql` | Adjust age check constraint on `profiles` |
| `20260101000014_add_performance_indexes.sql` | Indexes for listings/profiles/messages/saves/threads query patterns |
| `20260101000015_add_security_constraints.sql` | No self-threads, unique saves, message body length check |

## RLS status (all tables)

| Table | RLS Enabled | Policies |
|---|---|---|
| `locations` | Yes | SELECT public, INSERT authenticated, UPDATE/DELETE blocked |
| `profiles` | Yes | SELECT public, INSERT/UPDATE/DELETE owner only (`auth.uid() = user_id`) |
| `listings` | Yes | SELECT public, INSERT/UPDATE/DELETE owner only (`auth.uid() = user_id`) |
| `listing_saves` | Yes | SELECT/INSERT/DELETE owner only |
| `threads` | Yes | SELECT/INSERT participants only (`user1_id` or `user2_id`) |
| `messages` | Yes | SELECT/INSERT participants only (via EXISTS on `threads`) |
| `thread_participants` | Yes | SELECT/INSERT/UPDATE/DELETE profile owner only (via EXISTS on `profiles`) |

## Notes

- Migrations use `IF NOT EXISTS` / `IF EXISTS` guards — safe to re-run.
- The `listings` table was previously created directly in the Supabase dashboard with no tracked file. Migration 003 reconstructs it from a production column snapshot and confirmed app code behavior.
- `is_active` is used in the app but was absent from the original column snapshot — added in migration 011. **Verify this column exists in production before deploying migration 011.**
