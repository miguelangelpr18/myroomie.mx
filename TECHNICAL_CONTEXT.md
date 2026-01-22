# MyRoomie.mx — Technical Context Document

**Version:** 1.0  
**Last Updated:** Based on current codebase state  
**Purpose:** Complete technical reference for future development

---

## 1. PROJECT OVERVIEW

### Product Description
MyRoomie.mx is a roommate and rental listing platform built with Next.js App Router and Supabase. The platform serves two main user flows:

1. **Roomies Flow**: Users create profiles to find compatible roommates. Profiles include lifestyle preferences (pets, smoking, cleanliness, parties, schedule) and location (city, zone).

2. **Listings Flow**: Users create rental listings (rooms, apartments, houses) or search for available rentals. Listings include title, description, location, price, and type (room rental vs. roommate search).

### Main User Types
- **Roomie Seekers**: Users looking for roommates (require profile completion)
- **Property Owners/Listers**: Users posting rental listings (can post without full profile)
- **Both**: Users can have both a profile and listings on the same account

### Core Features Implemented

#### Authentication & Onboarding
- Email/password authentication via Supabase Auth
- Email verification required before login
- Two-step onboarding:
  - Step 1: Basic profile (display_name, city, zone, avatar upload)
  - Step 2: Lifestyle preferences (pets, smoker, cleanliness, parties, schedule)
- Intent-based routing (`?intent=roomies` | `?intent=listings`)

#### Profile Management
- Public profiles at `/profiles/[user_id]`
- Profile editing in `/account` (display_name, avatar)
- Lifestyle badges display (pets, smoker, cleanliness, parties, schedule)
- Trust panel with ratings placeholder and verifications placeholder

#### Listings System
- Public listings browse at `/listings`
- Create listing at `/listings/new` (protected, requires auth only)
- Listing detail pages at `/listings/[id]`
- Search and filters (text, city, zone, type, price range, sort)
- URL-based filter persistence

#### Messaging System
- Thread-based messaging
- Threads created automatically when users contact each other
- Messages displayed in inbox (`/messages`) and thread view (`/messages/[thread_id]`)
- Threads can be associated with listings or be general (no listing)

#### Promotion System (Monetization)
- **Profile Promotion**: Promotes user's profile in `/explore` results
- **Listing Promotion**: Promotes specific listing in `/listings` results
- Extension logic: If promotion is active, new promotion extends from current `featured_until` date
- Pricing plans: 3 days ($99), 7 days ($199), 30 days ($499) — placeholders, no actual payments
- Featured items appear first in search results with "Destacado" badge

### Problem It Solves
- **Roommate Matching**: Helps people find compatible roommates based on lifestyle preferences and location
- **Rental Discovery**: Connects property owners with potential tenants
- **Trust Building**: Profile system with lifestyle badges and (planned) verifications
- **Communication**: Private messaging between users

### Current Monetization
- **No payments implemented yet** — all promotion features are free placeholders
- Two promotion types:
  1. **Profile Promotion** (`/promote/profile`): Promotes profile in Roomies explore
  2. **Listing Promotion** (`/promote/listing/[id]`): Promotes specific listing in listings page
- Extension system allows stacking promotions (if active, extends; if expired/null, starts from now)

---

## 2. TECH STACK & ARCHITECTURE

### Framework
- **Next.js 14.2.0** with App Router
- **React 18.3.0**
- **TypeScript 5.3.3**
- **Tailwind CSS 3.4.1** for styling

### Server Components vs Client Components

#### Server Components (Default)
- Most pages are Server Components
- Data fetching happens server-side
- Direct database queries using `createServerSupabaseClient()`
- Examples:
  - `app/Header.tsx` (Server Component)
  - `app/explore/page.tsx` (Server Component)
  - `app/listings/page.tsx` (Server Component)
  - `app/dashboard/page.tsx` (Server Component)
  - `app/profiles/[user_id]/page.tsx` (Server Component)

#### Client Components (`'use client'`)
- Used for:
  - Forms with state management
  - Interactive UI (dropdowns, modals)
  - Event handlers (onClick, onChange)
  - URL parameter reading (`useSearchParams`, `usePathname`)
- Examples:
  - `app/components/HeaderModeTabs.tsx` (Client Component)
  - `app/components/UserMenu.tsx` (Client Component)
  - `app/login/page.tsx` (Client Component)
  - `app/onboarding/step-1/OnboardingForm.tsx` (Client Component)
  - `app/listings/new/ListingForm.tsx` (Client Component)

### Supabase Usage

#### Authentication
- **Provider**: Supabase Auth
- **Method**: Email/password
- **Email Verification**: Required (`email_confirmed_at` must exist)
- **Session Management**: SSR cookies via `@supabase/ssr`

#### Database
- **Provider**: Supabase PostgreSQL
- **Tables**:
  - `profiles` (user profiles for Roomies)
  - `listings` (rental listings)
  - `threads` (message threads)
  - `messages` (individual messages)
- **RLS (Row Level Security)**: Enabled on all tables
- **Access Pattern**: Server-side queries using `createServerSupabaseClient()`

#### Storage
- **Bucket**: `avatars`
- **Path Pattern**: `{user_id}/avatar.jpg`
- **Upload Method**: Client-side using `createBrowserSupabaseClient()`
- **Access**: Public URLs via `getPublicUrl()`

#### SSR Cookies
- **Library**: `@supabase/ssr`
- **Server Client**: `lib/supabase/server.ts` uses `createServerClient` with cookie handlers
- **Browser Client**: `lib/supabase/client.ts` uses `createBrowserClient`
- **Cookie Management**: Automatic via `@supabase/ssr` cookie handlers

### Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-anon-key>
```

**Location**: `.env.local` (not committed to git)

**Usage**:
- Both variables are read in `lib/supabase/server.ts` and `lib/supabase/client.ts`
- Missing variables throw error at runtime

### RLS (Row Level Security)

**CRITICAL**: RLS policies must NOT be changed without careful consideration. They are the primary security mechanism.

**Current RLS Behavior**:

1. **profiles**:
   - SELECT: Public (anyone can read)
   - INSERT/UPDATE/DELETE: Owner only (`auth.uid() = user_id`)

2. **listings**:
   - SELECT: Public (anyone can read)
   - INSERT/UPDATE/DELETE: Owner only (`auth.uid() = user_id`)

3. **threads**:
   - SELECT: Participants only (`auth.uid() = user1_id OR auth.uid() = user2_id`)
   - INSERT: Participants only
   - UPDATE/DELETE: Denied (MVP: no editing/deleting threads)

4. **messages**:
   - SELECT: Thread participants only (via EXISTS subquery)
   - INSERT: Sender must be `auth.uid()` AND participant
   - UPDATE/DELETE: Denied (MVP: no editing/deleting messages)

**Why RLS Must Not Be Changed**:
- It's the last line of defense if application code has bugs
- It prevents unauthorized data access at the database level
- Changing RLS can break existing functionality or create security holes

---

## 3. AUTH & ACCESS GATES

### lib/requireProfile.ts

**Function**: `requireProfileOrRedirect()`

**Purpose**: Ensures user has both session AND a complete profile (for Roomies flow).

**Exact Behavior**:

1. **No Session**:
   - Calls `supabase.auth.getSession()`
   - If `!session?.user || error`:
     - Redirects to `/login?intent=roomies`
     - Does NOT return

2. **Has Session, No Profile**:
   - Queries `profiles` table: `SELECT user_id WHERE user_id = session.user.id`
   - If `!profile || profileError`:
     - Redirects to `/onboarding/step-1`
     - Does NOT return

3. **Has Session AND Profile**:
   - Returns `{ user: session.user }`
   - Page continues rendering

**Used In**:
- `app/explore/page.tsx` (requires profile to explore roomies)
- `app/profiles/[user_id]/page.tsx` (requires profile to view profiles)
- `app/messages/page.tsx` (requires profile for messaging)
- `app/messages/[thread_id]/page.tsx` (requires profile for messaging)

**Flow Diagram**:
```
User accesses /explore
  ↓
requireProfileOrRedirect() called
  ↓
Has session? ──NO──→ redirect(/login?intent=roomies)
  ↓ YES
Has profile? ──NO──→ redirect(/onboarding/step-1)
  ↓ YES
Return { user } → Page renders
```

### lib/requireAuth.ts

**Function**: `requireAuthOrRedirect(options?: RequireAuthOptions)`

**Interface**:
```typescript
interface RequireAuthOptions {
  intent?: 'listings' | 'roomies'
}
```

**Purpose**: Ensures user has session only (does NOT require profile).

**Exact Behavior**:

1. **No Session**:
   - Calls `supabase.auth.getSession()`
   - If `!session?.user || error`:
     - If `options?.intent` exists:
       - Redirects to `/login?intent=${options.intent}`
     - Else:
       - Redirects to `/login`
     - Does NOT return

2. **Has Session**:
   - Returns `{ user: session.user }`
   - Page continues rendering

**Used In**:
- `app/listings/new/page.tsx` (requires auth only, not profile)
- `app/dashboard/page.tsx` (requires auth only)
- `app/account/page.tsx` (requires auth only)
- `app/promote/profile/page.tsx` (requires auth only)
- `app/promote/listing/[id]/page.tsx` (requires auth only)

**Flow Diagram**:
```
User accesses /listings/new
  ↓
requireAuthOrRedirect({ intent: 'listings' }) called
  ↓
Has session? ──NO──→ redirect(/login?intent=listings)
  ↓ YES
Return { user } → Page renders
```

### Login Intent System

**Query Parameter**: `?intent=roomies` | `?intent=listings`

**Purpose**: Preserves user's intent when redirecting to login, so they can be sent to the correct page after authentication.

**Implementation**: `app/login/page.tsx` (Client Component)

**Flow**:

1. **Read Intent**:
   ```typescript
   const intentParam = searchParams.get('intent')
   const intent = intentParam === 'listings' || intentParam === 'roomies' ? intentParam : null
   ```

2. **After Successful Login**:
   - Verifies email is confirmed
   - Calls `hasProfile()` server action
   - Redirects based on `profileExists` and `intent`:

   **Without Profile**:
   - `intent === 'listings'` → `/listings/new`
   - `intent === 'roomies'` → `/onboarding/step-1`
   - `intent === null` → `/signup/intent`

   **With Profile**:
   - `intent === 'listings'` → `/listings`
   - `intent === 'roomies'` or `null` → `/explore`

**Flow Diagram**:
```
User tries to access protected route
  ↓
No session → redirect(/login?intent=roomies)
  ↓
User logs in successfully
  ↓
Email confirmed? ──NO──→ Show error, signOut()
  ↓ YES
hasProfile() called
  ↓
Has profile? ──NO──→
  ├─ intent=listings → /listings/new
  ├─ intent=roomies → /onboarding/step-1
  └─ intent=null → /signup/intent
  ↓
Has profile? ──YES──→
  ├─ intent=listings → /listings
  └─ intent=roomies/null → /explore
```

### Signup Intent Flow

**Route**: `/signup/intent`

**Purpose**: Landing page for users to choose their primary intent (Roomies vs Listings).

**Behavior**:

1. **No Session**:
   - Shows two cards: "Buscar roomie" and "Rentar cuarto/depa/casa"
   - Cards link to `/login?intent=roomies` and `/login?intent=listings`
   - Shows CTAs: "Iniciar sesión" and "Crear cuenta"

2. **Has Session**:
   - Shows same two cards
   - "Buscar roomie" → `/onboarding/step-1?intent=roomies`
   - "Rentar cuarto/depa/casa" → `/listings/new`

**Integration**:
- Login redirects to `/signup/intent` when `!profileExists && intent === null`
- This ensures users without a clear intent are prompted to choose

---

## 4. ROUTING MAP

### Public Routes (No Authentication Required)

#### `/` (Home)
- **File**: `app/page.tsx`
- **Type**: Server Component
- **Purpose**: Landing page
- **Data**: None
- **Actions**: None

#### `/listings`
- **File**: `app/listings/page.tsx`
- **Type**: Server Component
- **Purpose**: Browse all listings (public)
- **Guard**: None
- **Data Reads**:
  - `listings` table: `id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until`
  - Filters: `q` (text search), `city`, `zone`, `listing_type`, `min`, `max`, `sort`
- **Ordering**: Featured first (`featured_until desc nulls last`), then by sort param
- **Actions**: None (read-only)
- **Features**: Search, filters, sorting, featured badges

#### `/listings/[id]`
- **File**: `app/listings/[id]/page.tsx`
- **Type**: Server Component
- **Purpose**: View single listing detail
- **Guard**: None (public)
- **Data Reads**:
  - `listings` table: All columns for `id = params.id`
  - `profiles` table: Author's profile (display_name, avatar_url, city, zone, lifestyle fields)
- **Actions**: 
  - ContactButton: Creates/finds thread and redirects to `/messages/[thread_id]`
- **Features**: Shows listing details, author info, lifestyle badges, "Contactar" button

#### `/profiles/[user_id]`
- **File**: `app/profiles/[user_id]/page.tsx`
- **Type**: Server Component
- **Purpose**: View user's public profile
- **Guard**: None (public)
- **Data Reads**:
  - `profiles` table: All profile fields including lifestyle
  - `listings` table: User's listings (limit 20, ordered by created_at desc)
- **Actions**:
  - ContactButton: Creates/finds thread (no listing_id) and redirects to `/messages/[thread_id]`
- **Features**: Profile header, lifestyle badges, trust panel, user's listings list

#### `/login`
- **File**: `app/login/page.tsx`
- **Type**: Client Component
- **Purpose**: User login
- **Guard**: None
- **Data**: Reads `?intent` query param
- **Actions**: 
  - `signIn()` from `lib/auth.ts`
  - `hasProfile()` server action
  - Redirects based on profile existence and intent

#### `/signup`
- **File**: `app/signup/page.tsx`
- **Type**: Client Component
- **Purpose**: User registration
- **Guard**: None
- **Actions**: `signUp()` from `lib/auth.ts`
- **Post-Signup**: Shows success message, user must verify email

#### `/signup/intent`
- **File**: `app/signup/intent/page.tsx`
- **Type**: Server Component
- **Purpose**: Choose primary intent (Roomies vs Listings)
- **Guard**: None
- **Behavior**: Different UI based on session state (see Signup Intent Flow above)

#### `/legal/privacy`
- **File**: `app/legal/privacy/page.tsx`
- **Type**: Server Component
- **Purpose**: Privacy policy page
- **Guard**: None

#### `/legal/terms`
- **File**: `app/legal/terms/page.tsx`
- **Type**: Server Component
- **Purpose**: Terms of service page
- **Guard**: None

### Protected Routes (Authentication Required)

#### `/explore`
- **File**: `app/explore/page.tsx`
- **Type**: Server Component
- **Guard**: `requireProfileOrRedirect()` (requires session + profile)
- **Purpose**: Browse roomie profiles
- **Data Reads**:
  - `profiles` table: `user_id, display_name, city, zone, avatar_url, pets, smoker, cleanliness, parties, schedule, featured_until`
  - Filters: `q` (name search), `city`, `zone`, lifestyle filters
- **Ordering**: Featured first (`featured_until desc nulls last`), then by created_at
- **Actions**: 
  - ContactButton: Creates/finds thread and redirects to `/messages/[thread_id]`
- **Features**: Search, filters, lifestyle filters, featured badges

#### `/listings/new`
- **File**: `app/listings/new/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect({ intent: 'listings' })` (requires session only, NOT profile)
- **Purpose**: Create new listing
- **Data**: None (form only)
- **Actions**: 
  - `createListing()` server action in `app/listings/new/actions.ts`
  - Validates: title (>=5), description (>=20), city (>=2), zone (>=2), price_mxn (optional, >=0)
  - On success: redirects to `/listings`

#### `/dashboard`
- **File**: `app/dashboard/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect()` (requires session only)
- **Purpose**: User dashboard
- **Data Reads**:
  - `profiles` table: `user_id, display_name, avatar_url, featured_until`
  - `listings` table: User's listings with `featured_until`
- **Features**:
  - "Your profile" card: Shows profile status, promotion status, links to profile and promote
  - "Your listings" card: Lists user's listings with "Promocionar anuncio" buttons
  - "Verifications" card: Placeholder (coming soon)

#### `/account`
- **File**: `app/account/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect()` (requires session only)
- **Purpose**: Account settings
- **Data Reads**:
  - `profiles` table: `display_name, avatar_url`
  - Session: `email`
- **Actions**: 
  - `updateProfile()` server action in `app/account/actions.ts`
  - Updates: `display_name`, `avatar_url` (via upload to Storage)
  - Revalidates: `/account`, `/dashboard`, layout (for header)

#### `/onboarding/step-1`
- **File**: `app/onboarding/step-1/page.tsx`
- **Type**: Server Component
- **Guard**: Session check (redirects to `/login` if no session)
- **Purpose**: Create/update basic profile
- **Data Reads**: Current profile (if exists)
- **Actions**: 
  - `saveMyProfile()` server action
  - Uploads avatar to Storage (`avatars/{user_id}/avatar.jpg`)
  - On success: redirects to `/onboarding/step-2`

#### `/onboarding/step-2`
- **File**: `app/onboarding/step-2/page.tsx`
- **Type**: Server Component
- **Guard**: `requireProfileOrRedirect()` (requires session + profile)
- **Purpose**: Complete lifestyle preferences
- **Data Reads**: Current lifestyle data from profile
- **Actions**: 
  - `saveMyLifestyle()` server action
  - Updates: `pets`, `smoker`, `cleanliness`, `parties`, `schedule`
  - On success: redirects to `/explore`

#### `/messages`
- **File**: `app/messages/page.tsx`
- **Type**: Server Component
- **Guard**: `requireProfileOrRedirect()` (requires session + profile)
- **Purpose**: Inbox (list of user's threads)
- **Data Reads**:
  - `threads` table: User's threads (where `user1_id` or `user2_id` = session.user.id)
  - Joins with `profiles` to get other user's info
  - Joins with `messages` to get last message
- **Features**: Shows thread list with other user's name, last message preview, lifestyle badges

#### `/messages/[thread_id]`
- **File**: `app/messages/[thread_id]/page.tsx`
- **Type**: Server Component
- **Guard**: `requireProfileOrRedirect()` (requires session + profile)
- **Purpose**: View and send messages in a thread
- **Data Reads**:
  - `threads` table: Thread by `id`, validates user is participant
  - `messages` table: All messages in thread (ordered by created_at)
  - `profiles` table: Other participant's profile (with lifestyle)
- **Actions**: 
  - `sendMessage()` server action
  - Validates: user is participant, message body (1-5000 chars)
  - On success: inserts message, revalidates path

#### `/promote/profile`
- **File**: `app/promote/profile/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect({ intent: 'roomies' })` (requires session only)
- **Purpose**: Promote user's profile in Roomies explore
- **Data**: None (pricing UI only)
- **Actions**: 
  - `activateProfilePromotion(planDays)` server action
  - Extends existing promotion if active, otherwise starts from now
  - Updates `profiles.featured_until`
  - Revalidates: `/dashboard`, `/explore`, `/profiles/[user_id]`

#### `/promote/listing/[id]`
- **File**: `app/promote/listing/[id]/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect({ intent: 'listings' })` (requires session only)
- **Purpose**: Promote specific listing in listings page
- **Data Reads**: 
  - `listings` table: Listing by `id`
  - Validates: Listing exists AND `user_id = session.user.id`
- **Actions**: 
  - `activateListingPromotion(listingId, planDays)` server action
  - Validates ownership
  - Extends existing promotion if active, otherwise starts from now
  - Updates `listings.featured_until`
  - Revalidates: `/listings`, `/listings/[id]`, `/dashboard`

#### `/shortlist`
- **File**: `app/shortlist/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect()` (requires session only)
- **Purpose**: Placeholder (Coming soon)
- **Data**: None

#### `/matches`
- **File**: `app/matches/page.tsx`
- **Type**: Server Component
- **Guard**: `requireAuthOrRedirect()` (requires session only)
- **Purpose**: Placeholder (Coming soon)
- **Data**: None

#### `/app`
- **File**: `app/app/page.tsx`
- **Type**: Server Component
- **Guard**: `requireProfileOrRedirect()` (requires session + profile)
- **Purpose**: Legacy dashboard (still functional)
- **Data**: User info

#### `/debug/supabase`
- **File**: `app/debug/supabase/page.tsx`
- **Type**: Server Component
- **Guard**: `notFound()` in production
- **Purpose**: Debug Supabase connection (development only)
- **Behavior**: 
  - Production: Returns 404
  - Development: Shows Supabase debug UI

#### `/security`
- **File**: `app/security/page.tsx`
- **Type**: Server Component
- **Purpose**: Security page (placeholder)

---

## 5. HEADER & NAVIGATION SYSTEM

### Header Component

**File**: `app/Header.tsx`  
**Type**: Server Component  
**Location**: Rendered in `app/layout.tsx`

**Structure**:

1. **No Session State**:
   - Logo: `myroomie.mx` (link to `/`)
   - `<HeaderModeTabs />` (without props)
   - Links: "Login", "Signup"

2. **With Session State**:
   - Logo: `myroomie.mx` (link to `/`)
   - `<HeaderModeTabs />` (with `userId` and `hasProfile` props)
   - Link: "Messages"
   - `<UserMenu />` (avatar/initial + dropdown)

**Data Fetching**:
- Calls `supabase.auth.getSession()` to check session
- If session exists, queries `profiles` for `display_name` and `avatar_url`
- Passes data to `UserMenu` and `HeaderModeTabs`

### HeaderModeTabs Component

**File**: `app/components/HeaderModeTabs.tsx`  
**Type**: Client Component  
**Props**: `{ userId?: string, hasProfile?: boolean }`

**Mode Detection**:

1. **Query Param Priority**: If `?mode=listings` or `?mode=roomies` exists, use it
2. **Pathname Inference**: If no mode param:
   - `pathname === '/listings'` → `mode = 'listings'`
   - Otherwise → `mode = 'roomies'` (default)

**Visibility**:
- Only shows on `/explore` or `/listings` pages
- Returns `null` on other pages

**buildHref Helper**:
- Preserves all query params except `mode`
- Sets new `mode` param
- Base path: `/listings` for listings mode, `/explore` for roomies mode

**CTA Logic**:

- **Listings Mode**:
  - Always shows: "Crear listing" → `/listings/new`

- **Roomies Mode**:
  - If `hasProfile && userId`: "Ver mi perfil" → `/profiles/${userId}`
  - Else: "Crear perfil roomie" → `/onboarding/step-1`

**Usage**:
- Rendered in `app/Header.tsx`
- Receives props from Header (which queries profile)

### UserMenu Component

**File**: `app/components/UserMenu.tsx`  
**Type**: Client Component  
**Props**: `{ displayName, avatarUrl, userId, initial }`

**Features**:
- Dropdown menu (opens on avatar click)
- Click outside to close (useEffect + ref)
- Menu items:
  - Dashboard → `/dashboard`
  - Inbox → `/messages`
  - Shortlist → `/shortlist` (placeholder)
  - Matches → `/matches` (placeholder)
  - Account → `/account`
  - Log out → Calls `logout()` server action, then `router.replace('/login')` + `router.refresh()`

**Logout Flow**:
1. Calls `app/logout/actions.ts::logout()` (server action)
2. Server action calls `supabase.auth.signOut()` (clears SSR cookies)
3. Client: `router.replace('/login')` + `router.refresh()`
4. Header re-renders as "not logged in" state

---

## 6. DATABASE SCHEMA (ACTUAL)

### Table: `profiles`

**Purpose**: User profiles for Roomies flow

**Columns**:
- `user_id` (UUID, PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE)
- `display_name` (TEXT, NOT NULL)
- `city` (TEXT, NOT NULL)
- `zone` (TEXT, NOT NULL)
- `avatar_url` (TEXT, nullable)
- `pets` (BOOLEAN, nullable) — Added in step-2
- `smoker` (BOOLEAN, nullable) — Added in step-2
- `cleanliness` (SMALLINT, nullable) — Added in step-2, values: 1, 2, or 3
- `parties` (BOOLEAN, nullable) — Added in step-2
- `schedule` (TEXT, nullable) — Added in step-2, values: 'day' or 'night'
- `featured_until` (TIMESTAMPTZ, nullable) — Added in STEP_08B
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Indexes**:
- `profiles_city_idx` on `city`
- `profiles_zone_idx` on `zone`
- `profiles_city_zone_idx` on `(city, zone)`

**RLS Policies**:
- SELECT: Public (anyone can read)
- INSERT: Owner only (`auth.uid() = user_id`)
- UPDATE: Owner only (`auth.uid() = user_id`)
- DELETE: Owner only (`auth.uid() = user_id`)

**Triggers**:
- `set_updated_at`: Updates `updated_at` on UPDATE

**SQL Migration**: `sql/create_profiles_table.sql`  
**Featured Migration**: `sql/add_featured_until.sql`

### Table: `listings`

**Purpose**: Rental listings (rooms, apartments, houses)

**Columns** (inferred from code):
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `user_id` (UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE)
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `city` (TEXT, NOT NULL)
- `zone` (TEXT, NOT NULL)
- `price_mxn` (INTEGER, nullable)
- `listing_type` (TEXT, NOT NULL) — Values: 'room' or 'roommate'
- `featured_until` (TIMESTAMPTZ, nullable) — Added in STEP_09A
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Note**: Table creation SQL not found in codebase, but structure inferred from usage.

**RLS Policies** (assumed, not verified in code):
- SELECT: Public (anyone can read)
- INSERT: Owner only (`auth.uid() = user_id`)
- UPDATE: Owner only (`auth.uid() = user_id`)
- DELETE: Owner only (`auth.uid() = user_id`)

**SQL Migration**: `sql/add_listing_featured_until.sql`

### Table: `threads`

**Purpose**: Message threads between users

**Columns**:
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `user1_id` (UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE)
- `user2_id` (UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE)
- `listing_id` (UUID, nullable, REFERENCES listings(id) ON DELETE SET NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Indexes**:
- `threads_users_idx` on `(user1_id, user2_id)`
- `threads_unique_idx` (UNIQUE) on `(LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id), COALESCE(listing_id, '00000000-0000-0000-0000-000000000000'::uuid))`

**RLS Policies**:
- SELECT: Participants only (`auth.uid() = user1_id OR auth.uid() = user2_id`)
- INSERT: Participants only (`auth.uid() = user1_id OR auth.uid() = user2_id`)
- UPDATE/DELETE: Denied (MVP: no editing/deleting threads)

**SQL Migration**: `sql/create_messaging_tables.sql`

### Table: `messages`

**Purpose**: Individual messages within threads

**Columns**:
- `id` (UUID, PRIMARY KEY, DEFAULT gen_random_uuid())
- `thread_id` (UUID, NOT NULL, REFERENCES threads(id) ON DELETE CASCADE)
- `sender_id` (UUID, NOT NULL, REFERENCES auth.users(id) ON DELETE CASCADE)
- `body` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT NOW())

**Indexes**:
- `messages_thread_created_idx` on `(thread_id, created_at)`

**RLS Policies**:
- SELECT: Thread participants only (via EXISTS subquery checking threads table)
- INSERT: Sender must be `auth.uid()` AND participant of thread
- UPDATE/DELETE: Denied (MVP: no editing/deleting messages)

**SQL Migration**: `sql/create_messaging_tables.sql`

### SQL Migrations Required

**Must be executed in Supabase SQL Editor** (in order):

1. `sql/create_profiles_table.sql` — Creates profiles table with RLS
2. `sql/create_messaging_tables.sql` — Creates threads and messages tables with RLS
3. `sql/add_featured_until.sql` — Adds `featured_until` to profiles
4. `sql/add_listing_featured_until.sql` — Adds `featured_until` to listings

**Note**: `listings` table creation SQL not found in codebase. It must exist in Supabase but SQL file may be missing.

### Critical Columns for Monetization

- `profiles.featured_until`: Controls profile promotion in `/explore`
- `listings.featured_until`: Controls listing promotion in `/listings`

Both columns are `TIMESTAMPTZ` and nullable. When `featured_until > NOW()`, the item is considered "featured" and appears first in results.

---

## 7. FEATURED / PROMOTION SYSTEM

### Promote Profile

**Page**: `app/promote/profile/page.tsx`  
**Server Action**: `app/promote/profile/actions.ts::activateProfilePromotion(planDays: number)`

**How It Works**:

1. **User Access**: `/promote/profile` (protected by `requireAuthOrRedirect({ intent: 'roomies' })`)

2. **UI**: Shows 3 pricing plans:
   - 3 days ($99 MXN placeholder)
   - 7 days ($199 MXN placeholder)
   - 30 days ($499 MXN placeholder) — Badge "Mejor valor"

3. **Activation Flow**:
   - User clicks "Promocionar ahora" on a plan
   - Client component (`PromoteButton`) calls `activateProfilePromotion(planDays)`
   - Server action:
     - Validates session
     - Validates `planDays` (1-365)
     - **Reads current `featured_until`** from `profiles` table
     - **Calculates `baseDate`**:
       - If `featured_until` exists AND `featured_until > now()`: `baseDate = featured_until`
       - Else: `baseDate = now()`
     - **Calculates new `featured_until`**: `baseDate + planDays days`
     - Updates `profiles.featured_until = new featured_until`
     - Revalidates: `/dashboard`, `/explore`, `/profiles/${user_id}`

4. **Extension Logic** (CRITICAL):
   - If promotion is active (future date), new promotion **extends** from that date
   - If promotion expired or null, new promotion **starts from now**
   - This allows "stacking" promotions

**Where It Affects Ordering**:
- `app/explore/page.tsx`:
  - Orders by `featured_until desc nulls last`
  - Additional sorting in code: Featured first, then by `featured_until desc` among featured

**Where It Affects UI**:
- `app/explore/page.tsx`: Shows "Destacado" badge on profile cards
- `app/profiles/[user_id]/page.tsx`: Shows "Destacado" badge in profile header
- `app/dashboard/page.tsx`: Shows "Promoción activa hasta: {date}" in profile card

### Promote Listing

**Page**: `app/promote/listing/[id]/page.tsx`  
**Server Action**: `app/promote/listing/actions.ts::activateListingPromotion(listingId: string, planDays: number)`

**How It Works**:

1. **User Access**: `/promote/listing/[id]` (protected by `requireAuthOrRedirect({ intent: 'listings' })`)

2. **Ownership Validation**:
   - Loads listing by `id`
   - If not found: `notFound()`
   - If `listing.user_id !== session.user.id`: Shows error "No autorizado"
   - Only proceeds if user owns the listing

3. **UI**: Same pricing plans as profile promotion

4. **Activation Flow**:
   - Similar to profile promotion
   - **Reads `featured_until`** from `listings` table (already loaded for ownership check)
   - **Extension logic**: Same as profile (extends if active, starts from now if not)
   - Updates `listings.featured_until`
   - Revalidates: `/listings`, `/listings/[id]`, `/dashboard`

**Entry Points**:
- `app/dashboard/page.tsx`: "Promocionar anuncio" button next to each listing

**Where It Affects Ordering**:
- `app/listings/page.tsx`:
  - Orders by `featured_until desc nulls last`
  - Additional sorting in code: Featured first, then by `featured_until desc` among featured

**Where It Affects UI**:
- `app/listings/page.tsx`: Shows "Destacado" badge on listing cards
- `app/listings/[id]/page.tsx`: Shows "Destacado" badge in listing header
- `app/dashboard/page.tsx`: Shows "Destacado hasta: {date}" in listing cards

### Extension Logic Details

**Code Pattern** (same in both actions):

```typescript
// Read current featured_until
const currentFeaturedUntil = existingRecord?.featured_until 
  ? new Date(existingRecord.featured_until) 
  : null

// Calculate baseDate
const baseDate = 
  currentFeaturedUntil && currentFeaturedUntil > now 
    ? currentFeaturedUntil  // Extend from existing
    : now                    // Start from now

// Calculate new featured_until
const featuredUntil = new Date(
  baseDate.getTime() + planDays * 24 * 60 * 60 * 1000
)
```

**Examples**:
- User promotes profile for 7 days → `featured_until = now + 7 days`
- User promotes again for 10 days while active → `featured_until = (now + 7) + 10 = now + 17 days`
- User promotes after expiration → `featured_until = now + 10 days` (starts fresh)

---

## 8. DASHBOARD & ACCOUNT

### Dashboard Structure

**File**: `app/dashboard/page.tsx`  
**Guard**: `requireAuthOrRedirect()` (session only, no profile required)

**Layout**:

1. **Header**: "Dashboard" title

2. **Grid (2 columns on desktop)**:

   **Card 1: "Your profile"**
   - If profile exists:
     - Avatar + display name
     - "Active" badge
     - Promotion status:
       - If featured: "Promoción activa hasta: {date}" (orange background)
       - If not featured: "No tienes promoción activa" (gray background)
     - Buttons:
       - "Ver mi perfil" → `/profiles/${user_id}`
       - "Promocionar perfil (Roomies)" → `/promote/profile`
   - If no profile:
     - "Aún no has completado tu perfil"
     - "Completar perfil" → `/onboarding/step-1`

   **Card 2: "Your listings"**
   - If no listings:
     - "Aún no has creado ningún listing"
     - "Crear listing" → `/listings/new`
   - If has listings:
     - List of listings (limit 20)
     - Each listing shows:
       - Type badge (Rento cuarto / Busco roomie)
       - "Destacado" badge if featured
       - Title, city, zone, price
       - "Destacado hasta: {date}" if featured
       - "Promocionar anuncio" button → `/promote/listing/[id]`
     - Listing title/info is clickable → `/listings/[id]`

3. **Card 3: "Verifications"** (full width)
   - Placeholder items (all disabled):
     - Verify phone
     - Verify ID
     - Social media
     - Credit check
   - All show "Coming soon"

### Account Settings

**File**: `app/account/page.tsx`  
**Guard**: `requireAuthOrRedirect()` (session only)

**Structure**:

1. **Header**: "Account Settings"

2. **Account Form** (`app/account/AccountForm.tsx` - Client Component):
   - Email (read-only, disabled)
   - Display name (editable, 2-40 chars)
   - Avatar upload:
     - File input (accepts images)
     - Validation: image type, max 2MB
     - Preview shown
     - Uploads to `avatars/{user_id}/avatar.jpg` (upsert)
     - Gets public URL

3. **Server Action** (`app/account/actions.ts::updateProfile()`):
   - Validates session
   - Validates `display_name` (2-40 chars)
   - Updates `profiles` table: `display_name`, `avatar_url`
   - Revalidates: `/account`, `/dashboard`, layout (for header update)

4. **Verifications Section** (same placeholder as dashboard)

**Avatar Upload Flow**:
1. User selects file in Client Component
2. Client validates: image type, < 2MB
3. Client creates preview (FileReader)
4. On submit:
   - Client calls `createBrowserSupabaseClient()`
   - Uploads to Storage: `avatars/{user_id}/avatar.jpg` (upsert: true)
   - Gets public URL: `supabase.storage.from('avatars').getPublicUrl(filePath)`
   - Calls `updateProfile()` server action with URL
   - Server updates `profiles.avatar_url`
   - `revalidatePath('/', 'layout')` updates header

---

## 9. MESSAGING SYSTEM

### Threads vs Messages

**Threads** (`threads` table):
- Represents a conversation between two users
- Can be associated with a listing (`listing_id` nullable)
- Unique constraint prevents duplicate threads (same user pair + same listing)

**Messages** (`messages` table):
- Individual messages within a thread
- Belongs to one thread
- Has a sender (`sender_id`)

### Thread Creation

**Server Action**: `app/messages/actions.ts::findOrCreateThread(otherUserId: string, listingId: string | null)`

**Logic**:

1. **Validates Session**: Must be logged in

2. **Prevents Self-Contact**: `currentUserId !== otherUserId`

3. **Normalizes User IDs**: 
   - Sorts user IDs: `user1Id = min(currentUserId, otherUserId)`, `user2Id = max(...)`
   - This ensures consistent thread lookup regardless of who initiates

4. **Searches Existing Thread**:
   - Query: `threads WHERE user1_id = user1Id AND user2_id = user2Id AND listing_id = listingId (or IS NULL)`
   - Uses unique index for fast lookup

5. **Creates If Not Exists**:
   - If found: Returns existing `thread.id`
   - If not found: Inserts new thread, returns new `thread.id`

**Usage**:
- Called from ContactButton components
- Redirects to `/messages/[thread_id]` after creation/finding

### Ownership and Access Control

**RLS Policies Handle Access**:
- Users can only see threads where they are `user1_id` or `user2_id`
- Users can only see messages in threads they participate in
- Users can only send messages if they are thread participants

**Application-Level Validation**:
- `sendMessage()` validates user is participant before inserting
- `app/messages/[thread_id]/page.tsx` validates user is participant (shows `notFound()` if not)

### Message Display

**Inbox** (`/messages`):
- Lists user's threads
- Shows: Other user's name, last message preview, lifestyle badges
- Links to `/messages/[thread_id]`

**Thread View** (`/messages/[thread_id]`):
- Shows all messages in thread (ordered by `created_at`)
- Shows other participant's profile info (with lifestyle badges)
- Message form at bottom (`MessageForm.tsx` - Client Component)
- On send: Calls `sendMessage()` server action, revalidates path

### ContactButton Components

**Three Variants**:

1. **`app/explore/ContactButton.tsx`**:
   - Used in `/explore` profile cards
   - Calls `findOrCreateThread(userId, null)` (no listing)
   - Redirects to `/messages/[thread_id]`
   - Hides if viewing own profile

2. **`app/profiles/[user_id]/ContactButton.tsx`**:
   - Used in profile detail page
   - Calls `findOrCreateThread(userId, null)` (no listing)
   - Redirects to `/messages/[thread_id]`
   - Hides if viewing own profile

3. **`app/listings/[id]/ContactButton.tsx`**:
   - Used in listing detail page
   - Calls `findOrCreateThread(listingUserId, listingId)` (with listing)
   - Redirects to `/messages/[thread_id]`
   - Always shown (can't contact yourself from listing)

**Common Behavior**:
- All are Client Components
- All call `findOrCreateThread()` server action
- All redirect to thread after creation/finding
- All handle errors (show UI error message)

---

## 10. UI COMPONENTS MAP

### Header
- **File**: `app/Header.tsx`
- **Type**: Server Component
- **Purpose**: Main site header with navigation
- **Used In**: `app/layout.tsx` (root layout)
- **Features**: 
  - Session-aware (shows different UI for logged in vs logged out)
  - Embeds `HeaderModeTabs` and `UserMenu`
  - Queries profile for user info

### HeaderModeTabs
- **File**: `app/components/HeaderModeTabs.tsx`
- **Type**: Client Component
- **Purpose**: Roomies/Listings tabs with contextual CTA
- **Props**: `{ userId?: string, hasProfile?: boolean }`
- **Used In**: `app/Header.tsx`
- **Features**:
  - Mode detection (query param or pathname inference)
  - Preserves query params when switching modes
  - Contextual CTA based on mode and profile status
  - Only visible on `/explore` or `/listings`

### UserMenu
- **File**: `app/components/UserMenu.tsx`
- **Type**: Client Component
- **Purpose**: User avatar dropdown menu
- **Props**: `{ displayName, avatarUrl, userId, initial }`
- **Used In**: `app/Header.tsx` (when logged in)
- **Features**:
  - Dropdown with navigation links
  - Logout functionality (calls server action)
  - Click outside to close

### LifestyleBadges
- **File**: `app/components/LifestyleBadges.tsx`
- **Type**: Server Component
- **Purpose**: Display lifestyle preferences as badges
- **Props**: `{ profile: LifestyleProfile }`
- **Used In**: 
  - `app/explore/page.tsx` (profile cards)
  - `app/profiles/[user_id]/page.tsx` (profile header)
  - `app/listings/[id]/page.tsx` (author section)
  - `app/messages/page.tsx` (thread list)
  - `app/messages/[thread_id]/page.tsx` (thread header)
- **Features**:
  - Shows badges for: pets, smoker, cleanliness, parties, schedule
  - Only shows if value is not null
  - Consistent styling (gray chips)

### TrustPanel
- **File**: `app/components/TrustPanel.tsx`
- **Type**: Server Component
- **Purpose**: Display trust indicators (ratings + verifications)
- **Props**: `{ isOwner?: boolean }`
- **Used In**: `app/profiles/[user_id]/page.tsx`
- **Features**:
  - Rating placeholder (5 empty stars + "Sin reseñas aún")
  - Verifications grid (4 disabled cards: phone, ID, social, credit check)
  - CTA to `/account` if `isOwner === true`

### ContactButton (Multiple Variants)

**Explore ContactButton**:
- **File**: `app/explore/ContactButton.tsx`
- **Type**: Client Component
- **Used In**: `app/explore/page.tsx`
- **Behavior**: Creates thread with `listing_id = null`, redirects to messages

**Profile ContactButton**:
- **File**: `app/profiles/[user_id]/ContactButton.tsx`
- **Type**: Client Component
- **Used In**: `app/profiles/[user_id]/page.tsx`
- **Behavior**: Creates thread with `listing_id = null`, redirects to messages

**Listing ContactButton**:
- **File**: `app/listings/[id]/ContactButton.tsx`
- **Type**: Client Component
- **Used In**: `app/listings/[id]/page.tsx`
- **Behavior**: Creates thread with `listing_id = listing.id`, redirects to messages

### PromoteButton (Profile)
- **File**: `app/promote/profile/PromoteButton.tsx`
- **Type**: Client Component
- **Purpose**: Button to activate profile promotion
- **Props**: `{ planName: string, planDays: number }`
- **Used In**: `app/promote/profile/page.tsx`
- **Features**:
  - Calls `activateProfilePromotion(planDays)` server action
  - Shows loading state ("Activando...")
  - Shows success/error messages
  - Refreshes page on success

### PromoteButton (Listing)
- **File**: `app/promote/listing/[id]/PromoteButton.tsx`
- **Type**: Client Component
- **Purpose**: Button to activate listing promotion
- **Props**: `{ listingId: string, planName: string, planDays: number }`
- **Used In**: `app/promote/listing/[id]/page.tsx`
- **Features**:
  - Calls `activateListingPromotion(listingId, planDays)` server action
  - Shows loading state ("Activando...")
  - Shows success/error messages
  - Refreshes page on success

### Filters Components

**Explore Filters**:
- **File**: `app/explore/Filters.tsx`
- **Type**: Client Component
- **Purpose**: Search and filter UI for profiles
- **Used In**: `app/explore/page.tsx`
- **Features**: Text search (q), city, zone filters

**Listings Filters**:
- **File**: `app/listings/Filters.tsx`
- **Type**: Client Component
- **Purpose**: Search and filter UI for listings
- **Used In**: `app/listings/page.tsx`
- **Features**: Text search (q), city, zone, type, price range, sort

---

## 11. FILE STRUCTURE SUMMARY

```
myroomie.mx/
├── app/                          # Next.js App Router
│   ├── account/                  # Account settings
│   │   ├── AccountForm.tsx       # Client form component
│   │   ├── actions.ts           # updateProfile() server action
│   │   └── page.tsx             # Account settings page
│   ├── app/                     # Legacy dashboard
│   │   ├── LogoutButton.tsx     # Client logout button
│   │   └── page.tsx             # Legacy dashboard page
│   ├── components/               # Reusable components
│   │   ├── HeaderModeTabs.tsx   # Roomies/Listings tabs (Client)
│   │   ├── LifestyleBadges.tsx  # Lifestyle display (Server)
│   │   ├── TrustPanel.tsx       # Trust indicators (Server)
│   │   └── UserMenu.tsx         # User dropdown (Client)
│   ├── dashboard/                # Main dashboard
│   │   └── page.tsx             # Dashboard page (Server)
│   ├── debug/                   # Debug routes (dev only)
│   │   └── supabase/
│   │       ├── actions.ts       # Debug server actions
│   │       ├── page.tsx         # Debug page (notFound in prod)
│   │       └── SupabaseDebugClient.tsx
│   ├── explore/                 # Roomies browse
│   │   ├── ContactButton.tsx    # Contact from explore (Client)
│   │   ├── Filters.tsx          # Search/filter UI (Client)
│   │   └── page.tsx             # Explore page (Server)
│   ├── Header.tsx               # Main header (Server)
│   ├── layout.tsx               # Root layout
│   ├── listings/                # Listings system
│   │   ├── [id]/                # Listing detail
│   │   │   ├── ContactButton.tsx
│   │   │   └── page.tsx
│   │   ├── Filters.tsx          # Listings filters (Client)
│   │   ├── new/                 # Create listing
│   │   │   ├── actions.ts       # createListing() server action
│   │   │   ├── ListingForm.tsx  # Create form (Client)
│   │   │   └── page.tsx
│   │   └── page.tsx             # Listings browse (Server)
│   ├── login/                   # Login page
│   │   ├── actions.ts           # hasProfile() server action
│   │   └── page.tsx             # Login form (Client)
│   ├── logout/                  # Logout action
│   │   └── actions.ts           # logout() server action
│   ├── messages/                # Messaging system
│   │   ├── [thread_id]/         # Thread view
│   │   │   ├── MessageForm.tsx  # Send message form (Client)
│   │   │   └── page.tsx
│   │   ├── actions.ts           # findOrCreateThread(), sendMessage()
│   │   └── page.tsx             # Inbox (Server)
│   ├── onboarding/              # Profile onboarding
│   │   ├── step-1/              # Basic profile
│   │   │   ├── actions.ts       # getMyProfile(), saveMyProfile()
│   │   │   ├── OnboardingForm.tsx # Profile form (Client)
│   │   │   └── page.tsx
│   │   └── step-2/              # Lifestyle preferences
│   │       ├── actions.ts       # getMyLifestyle(), saveMyLifestyle()
│   │       ├── OnboardingLifestyleForm.tsx
│   │       └── page.tsx
│   ├── profiles/                # Public profiles
│   │   └── [user_id]/
│   │       ├── ContactButton.tsx
│   │       └── page.tsx
│   ├── promote/                 # Promotion system
│   │   ├── listing/             # Listing promotion
│   │   │   ├── [id]/
│   │   │   │   ├── PromoteButton.tsx
│   │   │   │   └── page.tsx
│   │   │   └── actions.ts       # activateListingPromotion()
│   │   └── profile/             # Profile promotion
│   │       ├── actions.ts       # activateProfilePromotion()
│   │       ├── page.tsx
│   │       └── PromoteButton.tsx
│   ├── shortlist/              # Placeholder
│   │   └── page.tsx
│   ├── matches/                 # Placeholder
│   │   └── page.tsx
│   ├── signup/                  # Signup flow
│   │   ├── intent/              # Intent selection
│   │   │   └── page.tsx
│   │   └── page.tsx             # Signup form
│   ├── globals.css              # Global styles
│   ├── page.tsx                 # Home page
│   └── ... (other routes)
├── lib/                         # Shared utilities
│   ├── auth.ts                  # Client auth functions (signUp, signIn, signOut)
│   ├── requireAuth.ts          # requireAuthOrRedirect() guard
│   ├── requireProfile.ts       # requireProfileOrRedirect() guard
│   └── supabase/
│       ├── client.ts            # Browser Supabase client
│       └── server.ts             # Server Supabase client (SSR)
├── sql/                         # Database migrations
│   ├── add_featured_until.sql   # Add featured_until to profiles
│   ├── add_listing_featured_until.sql
│   ├── create_messaging_tables.sql
│   └── create_profiles_table.sql
├── tailwind.config.ts           # Tailwind config (brand colors)
├── package.json                 # Dependencies
└── tsconfig.json                # TypeScript config
```

### Important Files

**Critical for Auth**:
- `lib/requireAuth.ts` — Session-only guard
- `lib/requireProfile.ts` — Session + profile guard
- `lib/supabase/server.ts` — SSR client creation
- `app/login/page.tsx` — Login with intent handling

**Critical for Data**:
- `lib/supabase/server.ts` — Server-side Supabase client
- All `actions.ts` files — Server actions for mutations

**Critical for Navigation**:
- `app/Header.tsx` — Main navigation
- `app/components/HeaderModeTabs.tsx` — Mode switching
- `app/components/UserMenu.tsx` — User menu

**Critical for Monetization**:
- `app/promote/profile/actions.ts` — Profile promotion logic
- `app/promote/listing/actions.ts` — Listing promotion logic
- Both use extension logic (extends if active, starts from now if not)

---

## 12. CURRENT STATE & CONSTRAINTS

### What Must NOT Be Refactored

1. **RLS Policies**: Never modify RLS policies without careful security review. They are the last line of defense.

2. **Server Component Pattern**: Header and most pages are Server Components. Do not convert to Client Components unnecessarily.

3. **SSR Cookie Management**: The `@supabase/ssr` cookie handlers in `lib/supabase/server.ts` must remain as-is. They handle edge cases automatically.

4. **Intent System**: The `?intent=roomies|listings` query param system is integrated throughout. Changing it would break redirects.

5. **Extension Logic**: The promotion extension logic (extends if active, starts from now if not) is critical for monetization. Do not change without understanding business impact.

### Patterns That Must Be Preserved

1. **Server Actions Pattern**:
   - All mutations use Server Actions (`'use server'`)
   - Server Actions validate session first
   - Server Actions use `createServerSupabaseClient()`
   - Server Actions call `revalidatePath()` after mutations

2. **Guard Pattern**:
   - Use `requireAuthOrRedirect()` for routes needing session only
   - Use `requireProfileOrRedirect()` for routes needing profile
   - Guards are called at the start of Server Components
   - Guards redirect (do not return) if condition fails

3. **Client Component Pattern**:
   - Only use `'use client'` when needed (forms, interactivity, hooks)
   - Keep Server Components as default
   - Pass data from Server to Client via props

4. **Error Handling**:
   - Server Actions return `{ data, error }` or `{ error }`
   - Client Components show error messages in UI
   - Use `notFound()` for missing resources
   - Use friendly error messages for users

### Assumptions Future Code Must Respect

1. **No Middleware**: The app does not use Next.js middleware. All auth checks are in page components or guards.

2. **No Realtime**: Supabase Realtime is not used. All data is fetched server-side or via Server Actions.

3. **No Notifications**: Push notifications or in-app notifications are not implemented.

4. **RLS is Trusted**: Application code assumes RLS will prevent unauthorized access. Still validates in code, but RLS is the final authority.

5. **Featured System**: The `featured_until` column controls promotion. Always check `featured_until > NOW()` to determine if featured.

6. **Intent Preservation**: When redirecting to login, always pass `intent` param if available.

### Known Limitations

1. **No Payments**: All promotion features are free placeholders. Stripe/payments not integrated.

2. **No Ratings/Reviews**: TrustPanel shows placeholder. No actual rating system.

3. **No Verifications**: All verification features are "Coming soon" placeholders.

4. **No Realtime Messaging**: Messages require page refresh to see new messages.

5. **No File Attachments**: Messages are text-only.

6. **No Search Indexing**: Search uses ILIKE (not full-text search).

7. **No Pagination**: Results limited to 50 items (explore, listings).

8. **No Image Upload for Listings**: Listings are text-only (no photos).

9. **Placeholder Routes**: `/shortlist`, `/matches`, `/promote/profile` (promote button in dashboard) are placeholders.

10. **Debug Route**: `/debug/supabase` only works in development (returns 404 in production).

---

## 13. RECOMMENDED NEXT STEPS (FROM CODE PERSPECTIVE)

### Safe to Build Next

1. **Stripe Integration**:
   - Add Stripe to `package.json`
   - Create server actions for payment processing
   - Update `activateProfilePromotion()` and `activateListingPromotion()` to:
     - Create Stripe checkout session
     - Verify payment before updating `featured_until`
   - Add webhook handler for payment confirmation
   - **Safe because**: Promotion logic is already isolated in server actions

2. **Ratings/Reviews System**:
   - Create `reviews` table (user_id, reviewed_user_id, rating, comment, created_at)
   - Add RLS policies (public read, owner write)
   - Create UI to submit reviews (after thread completion?)
   - Update TrustPanel to show actual ratings
   - **Safe because**: TrustPanel is already a placeholder component

3. **Image Upload for Listings**:
   - Create Storage bucket `listing-images`
   - Add `images` JSONB column to `listings` table
   - Update `ListingForm` to handle multiple image uploads
   - Display images in listing cards and detail pages
   - **Safe because**: Listing creation flow is already established

4. **Pagination**:
   - Add `page` query param to `/explore` and `/listings`
   - Update queries to use `range()` for pagination
   - Add "Load more" or page numbers UI
   - **Safe because**: Only affects query logic, not data structure

### Sensitive Areas

1. **RLS Policies**: 
   - **DO NOT** modify without security review
   - **DO NOT** disable RLS
   - If adding new tables, follow existing RLS patterns

2. **Auth Guards**:
   - **DO NOT** remove guards from protected routes
   - **DO NOT** change redirect logic without updating all dependent routes
   - If adding new guards, follow `requireAuthOrRedirect()` pattern

3. **Featured Extension Logic**:
   - **DO NOT** change extension logic without business approval
   - Current logic allows "stacking" promotions (extends if active)
   - Changing to "reset" behavior would affect user expectations

4. **Intent System**:
   - **DO NOT** remove `intent` param handling
   - **DO NOT** change redirect destinations without updating login flow
   - If adding new intents, update `app/login/page.tsx` redirect logic

### Before Adding Stripe

1. **Create Payment Records Table**:
   ```sql
   CREATE TABLE payments (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     user_id UUID REFERENCES auth.users(id),
     listing_id UUID REFERENCES listings(id), -- nullable
     profile_promotion BOOLEAN DEFAULT false,
     amount INTEGER NOT NULL, -- in cents
     stripe_payment_intent_id TEXT,
     status TEXT, -- pending, completed, failed
     created_at TIMESTAMPTZ DEFAULT NOW()
   );
   ```

2. **Add RLS Policies**:
   - SELECT: Owner only
   - INSERT: Owner only
   - UPDATE: System only (via webhook)

3. **Update Promotion Actions**:
   - After payment verification, update `featured_until`
   - Record payment in `payments` table
   - Handle payment failures gracefully

4. **Add Webhook Handler**:
   - Create API route: `app/api/webhooks/stripe/route.ts`
   - Verify webhook signature
   - Update payment status
   - Activate promotion on successful payment

### Production-Ready vs MVP-Only

**Production-Ready**:
- Authentication flow
- Profile creation and editing
- Listing creation and browsing
- Messaging system (basic)
- Promotion system (logic, not payments)
- Search and filters
- Featured ordering

**MVP-Only (Needs Work)**:
- Payments (not implemented)
- Ratings/Reviews (placeholders)
- Verifications (placeholders)
- Realtime messaging (requires refresh)
- Image uploads for listings (not implemented)
- Pagination (hard limit of 50)
- `/shortlist` and `/matches` (placeholders)

---

## APPENDIX: QUICK REFERENCE

### Common Patterns

**Server Component with Data Fetching**:
```typescript
export default async function MyPage() {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase.from('table').select('*')
  return <div>...</div>
}
```

**Server Action**:
```typescript
'use server'
export async function myAction() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }
  // ... do work
  revalidatePath('/path')
  return { data, error: null }
}
```

**Client Component with Server Action**:
```typescript
'use client'
export default function MyForm() {
  const [loading, setLoading] = useState(false)
  const handleSubmit = async () => {
    setLoading(true)
    const { error } = await myServerAction()
    if (error) { /* show error */ }
    setLoading(false)
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Environment Setup

1. Create `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Run SQL migrations in Supabase (in order):
   - `sql/create_profiles_table.sql`
   - `sql/create_messaging_tables.sql`
   - `sql/add_featured_until.sql`
   - `sql/add_listing_featured_until.sql`

3. Create Storage bucket: `avatars` (public)

4. Install dependencies: `npm install`

5. Run dev server: `npm run dev`

---

**End of Technical Context Document**



