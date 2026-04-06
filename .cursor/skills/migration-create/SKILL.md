---
name: migration-create
description: Create a new Supabase migration with proper conventions, RLS, indexes, and corresponding type updates. Use when adding or modifying database tables/columns.
---

# Create Supabase Migration

## Instructions

When asked to create a migration:

1. **Determine the next migration number**: List files in `supabase/migrations/` and use the next sequential number with format `20260101NNNNNN_description.sql`

2. **Write the SQL migration** following these rules:
   - Use `IF NOT EXISTS` / `IF EXISTS` for idempotency
   - If creating a table: MUST include `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` and at least SELECT/INSERT/UPDATE/DELETE policies
   - If adding columns: use `ADD COLUMN IF NOT EXISTS`
   - Add CHECK constraints that match app validation rules in `app/lib/validation/`
   - Add indexes for columns used in WHERE clauses or JOINs
   - Include a header comment: `-- Migration: Description`

3. **Update types**: After creating the migration, update `types/index.ts` to reflect the new schema

4. **Update validators**: If new columns have validation rules, update the relevant file in `app/lib/validation/`

5. **Verification checklist** (print this after creating):
   - [ ] SQL is idempotent (can run twice without error)
   - [ ] RLS policies are present for new tables
   - [ ] CHECK constraints match app validation
   - [ ] `types/index.ts` reflects changes
   - [ ] Validators updated if needed
   - [ ] Indexes added for query patterns

## Example invocation
User: "Agrega una columna `phone_verified` boolean a profiles"
→ Create migration, update Profile type, note any validator changes needed.
