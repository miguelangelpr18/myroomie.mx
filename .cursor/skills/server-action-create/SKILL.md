---
name: server-action-create
description: Create a new server action following MyRoomie.mx security and validation patterns. Use when implementing new mutations or data operations.
---

# Create Server Action

## Instructions

When creating a new server action:

1. **File location**: Place in the relevant route folder as `actions.ts` (e.g., `app/feature/actions.ts`)

2. **Template** (follow this structure exactly):
   ```typescript
   'use server'

   import { createServerSupabaseClient } from '@/lib/supabase/server'
   import { revalidatePath } from 'next/cache'

   export async function actionName(input: InputType) {
     const supabase = createServerSupabaseClient()

     // 1. Authenticate
     const { data: { user }, error: authError } = await supabase.auth.getUser()
     if (!user || authError) {
       return { error: 'No autorizado. Por favor inicia sesión.' }
     }

     // 2. Validate input with centralized validator
     // import from app/lib/validation/...

     // 3. Perform DB operation with .eq('user_id', user.id)
     const { data, error } = await supabase
       .from('table')
       .update({ ... })
       .eq('user_id', user.id)  // ownership in the mutation query itself
       .select()
       .single()

     if (error) {
       return { error: 'Mensaje amigable en español.' }
     }

     // 4. Revalidate affected paths
     revalidatePath('/affected-path')

     return { data, error: null }
   }
   ```

3. **Security checklist** (mandatory, print after creating):
   - [ ] Starts with `'use server'`
   - [ ] Uses `getUser()` not `getSession()`
   - [ ] Validates ALL input before DB operations
   - [ ] Uses `.eq('user_id', user.id)` in the mutation query (not separate SELECT)
   - [ ] Returns `{ error: string }` on failure, never throws
   - [ ] Calls `revalidatePath()` for affected pages
   - [ ] No service role key usage (uses `createServerSupabaseClient()`)

4. **Rate limiting**: If the action is user-facing and could be abused (message send, listing create), add rate limiting using `app/lib/rateLimit.ts`

## What NOT to do
- Never use `redirect()` inside try/catch (Next.js quirk — redirect throws)
- Never return raw Supabase error messages to the client
- Never skip auth check even for "read" actions that need user context
