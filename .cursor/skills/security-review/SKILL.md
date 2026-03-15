---
name: security-review
description: Audit authentication, database access (Supabase RLS), secrets, storage, injection, and abuse vectors. Use when the user asks for a security review, security audit, auth review, RLS check, or to find vulnerabilities.
---

# Security Review

## Instructions

Audit the codebase in scope for:

1. **Auth vulnerabilities** — Weak or missing session handling, token in client storage (e.g. localStorage for JWTs), no CSRF protection, broken logout, password/reset flows exposed, privilege escalation paths.
2. **Supabase RLS** — Missing or permissive policies (e.g. `true` allow all), tables without RLS enabled, policies that leak other users’ data, service role key used in client code.
3. **Exposed secrets** — API keys, tokens, or credentials in client bundles, repo, or env files committed; `NEXT_PUBLIC_` used for server-only secrets; missing env validation.
4. **Unsafe storage** — Public buckets without allowlists, uploads without type/size validation, unauthenticated read/write, signed URLs with excessive TTL or scope.
5. **Injection risks** — Raw user input in SQL, `.rpc()` or `.from()` with unsanitized input, XSS via `dangerouslySetInnerHTML` or unescaped output, open redirects.
6. **Abuse vectors** — No rate limiting on auth or API routes, unbounded listing/search, mass enumeration (e.g. by ID), missing moderation hooks for UGC.

## Output format

Return findings with **severity** and **recommended fix**:

- **Critical** — Active exploit (e.g. RLS off, secrets in client, SQL injection). Fix immediately.
- **High** — Serious risk (e.g. weak RLS, auth bypass possible, unsafe storage). Fix before release.
- **Medium** — Notable issue (e.g. missing CSRF, no rate limit on sensitive action). Plan a fix.
- **Low** — Hardening (e.g. stricter RLS, shorter TTLs, validation). Address when possible.

For each finding: severity, short title, 1–2 sentence description, affected area/file, and concrete recommended fix.

## Example

```markdown
## Security audit results

### Critical
- **RLS disabled on `listings`** — Table has no RLS; any client can read/update all rows. Enable RLS and add policies so users only access own or public listings. (`supabase/migrations/`)

### High
- **Service role key in client** — `createClient` uses `service_role` in a client component. Use anon key in client; perform privileged ops in server actions or API routes with service role. (`lib/supabase/client.ts`)

### Medium
- **No rate limit on login** — Auth endpoint has no rate limiting; brute-force possible. Add rate limiting (e.g. Upstash, Vercel KV) per IP/identifier. (`app/api/auth/`)

### Low
- **Storage bucket public read** — `avatars` bucket allows public read without allowlist. Prefer signed URLs or restrict to authenticated reads with path checks. (Supabase Storage policies)
```
