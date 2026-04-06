---
name: pre-deploy-check
description: Run a comprehensive pre-deployment checklist before pushing to production. Use before any deploy to Vercel.
---

# Pre-Deploy Checklist

## Instructions

Run through each check and report status:

### 1. Build verification
- Run `npm run build` — must complete without errors
- Run `npm run lint` — must pass
- Run `npm test` if tests exist — must pass

### 2. Security scan
- Verify no `/debug/` or `/test/` routes exist: `find app/ -type d -name "debug" -o -name "test"`
- Verify `SUPABASE_SERVICE_ROLE_KEY` is NOT used in any file under `app/` — only in `lib/supabase/admin.ts`: `grep -r "SUPABASE_SERVICE_ROLE_KEY" app/`
- Verify `.env.local` is NOT tracked: `git ls-files .env.local`
- Verify no hardcoded API keys in source: `grep -r "sk_\|pk\.\|eyJ" app/ lib/ --include="*.ts" --include="*.tsx"`
- Check all server actions start with `getUser()`: `grep -L "getUser" app/**/actions.ts`

### 3. Data integrity
- Compare CHECK constraints in latest migrations against validators in `app/lib/validation/`
- Verify `types/index.ts` matches current DB schema
- Check for TODO/FIXME/HACK comments: `grep -rn "TODO\|FIXME\|HACK" app/ lib/ --include="*.ts" --include="*.tsx"`

### 4. Performance
- Verify all pages with data fetching have `loading.tsx`
- Check that `next/image` is used for user-uploaded images
- Verify no unbounded queries (missing `.limit()`)

### 5. Output format
```
## Pre-Deploy Report — [date]

### PASS
- [item]

### FAIL (must fix before deploy)
- [item]: [reason]

### WARN (fix soon)
- [item]: [reason]
```
