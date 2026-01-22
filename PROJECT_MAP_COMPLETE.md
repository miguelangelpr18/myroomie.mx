# MyRoomie.mx — Project Map Completo

**Fecha:** 2024  
**Stack:** Next.js 14.2.0 (App Router) + Supabase + TypeScript + Tailwind CSS  
**Propósito:** Mapa completo del repositorio antes de refactorizar Mensajes

---

## ÍNDICE

1. [Estructura General del Proyecto](#1-estructura-general-del-proyecto)
2. [Rutas App Router (Archivo por Archivo)](#2-rutas-app-router-archivo-por-archivo)
3. [Componentes UI](#3-componentes-ui)
4. [Server Actions](#4-server-actions)
5. [Librerías y Utilidades](#5-librerías-y-utilidades)
6. [Base de Datos y Supabase](#6-base-de-datos-y-supabase)
7. [Sistema de Autenticación](#7-sistema-de-autenticación)
8. [Mensajes - Deep Dive](#8-mensajes---deep-dive)
9. [Recomendaciones de Arquitectura para Mensajes](#9-recomendaciones-de-arquitectura-para-mensajes)

---

## 1. ESTRUCTURA GENERAL DEL PROYECTO

```
myroomie.mx/
├── app/                          # Next.js App Router (rutas y componentes)
│   ├── layout.tsx               # Root layout (Header + Footer)
│   ├── page.tsx                 # Landing page (/)
│   ├── Header.tsx               # Header global (Server Component)
│   ├── globals.css              # Estilos globales Tailwind
│   │
│   ├── account/                 # Configuración de cuenta
│   ├── app/                     # Dashboard legacy
│   ├── components/              # Componentes reutilizables
│   ├── dashboard/               # Dashboard principal
│   ├── debug/                   # Debug (solo dev)
│   ├── explore/                 # Explorar perfiles (Roomies)
│   ├── legal/                   # Páginas legales
│   ├── listings/               # Sistema de anuncios
│   ├── login/                   # Login
│   ├── logout/                  # Logout action
│   ├── messages/               # Sistema de mensajería ⭐
│   ├── onboarding/             # Onboarding 2 pasos
│   ├── profiles/               # Perfiles públicos
│   ├── promote/                # Sistema de promoción
│   ├── security/               # Seguridad
│   ├── shortlist/              # Placeholder
│   ├── signup/                 # Registro
│   └── matches/                # Placeholder
│
├── lib/                         # Utilidades y helpers
│   ├── auth.ts                 # Auth client-side
│   ├── requireAuth.ts          # Guard: requiere sesión
│   ├── requireProfile.ts       # Guard: requiere sesión + perfil
│   └── supabase/
│       ├── client.ts           # Browser Supabase client
│       └── server.ts           # Server Supabase client (SSR)
│
├── sql/                        # Migraciones SQL
│   ├── create_profiles_table.sql
│   ├── create_messaging_tables.sql
│   ├── add_featured_until.sql
│   └── add_listing_featured_until.sql
│
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.js
```

---

## 2. RUTAS APP ROUTER (ARCHIVO POR ARCHIVO)

### 2.1. RUTAS PÚBLICAS

#### `/` - Landing Page
- **Archivo:** `app/page.tsx`
- **Tipo:** Server Component
- **Responsabilidad:** Página de inicio con hero, CTAs, featured listings/profiles, secciones de confianza
- **Dependencias:**
  - `app/components/home/HomeFeaturedListings.tsx`
  - `app/components/home/HomeFeaturedProfiles.tsx`
- **Data Fetching:** Ninguna (componentes hijos hacen sus propias queries)
- **Renderiza:** Hero, CTAs, carruseles de destacados, "Cómo funciona", Trust Panel

#### `/listings` - Lista de Anuncios
- **Archivo:** `app/listings/page.tsx`
- **Tipo:** Server Component
- **Responsabilidad:** Lista pública de listings con búsqueda y filtros
- **Queries:**
  ```typescript
  supabase.from('listings')
    .select('id, title, description, city, zone, price_mxn, listing_type, created_at, featured_until, image_urls')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)
  ```
- **Filtros:** `q` (texto), `city`, `zone`, `listing_type`, `min`, `max`, `sort`
- **Componentes:**
  - `app/components/listings/ListingCard.tsx` (Server Component)
  - `app/components/ui/EmptyState.tsx`
- **Ordenamiento:** Featured primero, luego por `sort` param (recent/price_asc/price_desc)

#### `/listings/[id]` - Detalle de Anuncio
- **Archivo:** `app/listings/[id]/page.tsx`
- **Tipo:** Server Component
- **Responsabilidad:** Vista detallada de un listing con imágenes, descripción, perfil del autor
- **Queries:**
  - Listing por `id`
  - Profile del `user_id` del listing
  - `listing_saves` (si hay sesión, para verificar si está guardado)
- **Componentes:**
  - `app/listings/[id]/ContactForm.tsx` (Client Component)
  - `app/listings/[id]/SaveButton.tsx` (Client Component)
  - `app/components/listings/ListingImage.tsx`
  - `app/components/LifestyleBadges.tsx`
- **Features:** Galería de imágenes, botón Contactar, botón Guardar, perfil del autor

#### `/listings/new` - Crear Anuncio
- **Archivo:** `app/listings/new/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireAuthOrRedirect({ intent: 'listings' })` (solo sesión, NO requiere perfil)
- **Responsabilidad:** Formulario para crear nuevo listing
- **Componentes:**
  - `app/listings/new/ListingForm.tsx` (Client Component)
- **Server Actions:**
  - `app/listings/new/actions.ts::createListing()`
- **Validaciones:** title (>=5), description (>=20), city (>=2), zone (>=2), price_mxn (>=0, opcional)

#### `/profiles/[user_id]` - Perfil Público
- **Archivo:** `app/profiles/[user_id]/page.tsx`
- **Tipo:** Server Component
- **Responsabilidad:** Vista pública de perfil con lifestyle badges, listings del usuario
- **Queries:**
  - Profile por `user_id`
  - Listings del usuario (limit 20)
- **Componentes:**
  - `app/profiles/[user_id]/ContactButton.tsx` (Client Component)
  - `app/components/LifestyleBadges.tsx`
  - `app/components/TrustPanel.tsx`
- **Features:** Avatar, badges lifestyle, panel de confianza, lista de listings

#### `/login` - Login
- **Archivo:** `app/login/page.tsx`
- **Tipo:** Client Component (`'use client'`)
- **Responsabilidad:** Formulario de login con manejo de `?intent` param
- **Server Actions:**
  - `app/login/actions.ts::hasProfile()`
- **Librerías:**
  - `lib/auth.ts::signIn()`
- **Flujo:**
  1. Verifica `email_confirmed_at`
  2. Si no confirmado → signOut() + error
  3. Si confirmado → `hasProfile()`
  4. Redirect según perfil e intent:
     - Sin perfil + intent=listings → `/listings/new`
     - Sin perfil + intent=roomies → `/onboarding/step-1`
     - Sin perfil + sin intent → `/signup/intent`
     - Con perfil + intent=listings → `/listings`
     - Con perfil + intent=roomies/null → `/explore`

#### `/signup` - Registro
- **Archivo:** `app/signup/page.tsx`
- **Tipo:** Client Component
- **Responsabilidad:** Formulario de registro
- **Librerías:**
  - `lib/auth.ts::signUp()`
- **Post-signup:** Muestra mensaje "Revisa tu correo para verificar"

#### `/signup/intent` - Selección de Intento
- **Archivo:** `app/signup/intent/page.tsx`
- **Tipo:** Server Component
- **Responsabilidad:** Landing para elegir Roomies vs Listings
- **Comportamiento:**
  - Sin sesión: Links a `/login?intent=roomies` o `/login?intent=listings`
  - Con sesión: Links a `/onboarding/step-1?intent=roomies` o `/listings/new`

### 2.2. RUTAS PROTEGIDAS (REQUIEREN SESIÓN)

#### `/explore` - Explorar Perfiles (Roomies)
- **Archivo:** `app/explore/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireProfileOrRedirect()` (requiere sesión + perfil)
- **Responsabilidad:** Lista de perfiles con filtros de búsqueda
- **Queries:**
  ```typescript
  supabase.from('profiles')
    .select('user_id, display_name, city, zone, avatar_url, featured_until, pets, smoker, cleanliness, parties, schedule')
    .order('featured_until', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(50)
  ```
- **Filtros:** `q` (nombre), `city`, lifestyle filters (legacy, sin UI)
- **Componentes:**
  - `app/components/roomies/RoomieCard.tsx` (Server Component)
  - `app/explore/ContactButton.tsx` (Client Component)
  - `app/components/ui/EmptyState.tsx`
- **Ordenamiento:** Featured primero, luego más recientes

#### `/onboarding/step-1` - Onboarding Básico
- **Archivo:** `app/onboarding/step-1/page.tsx`
- **Tipo:** Server Component
- **Guard:** Verificación manual de sesión (redirect a `/login` si no hay)
- **Responsabilidad:** Crear/editar perfil básico (nombre, ciudad, zona, avatar)
- **Componentes:**
  - `app/onboarding/step-1/OnboardingForm.tsx` (Client Component)
- **Server Actions:**
  - `app/onboarding/step-1/actions.ts::saveMyProfile()`
- **Post-submit:** Redirect a `/onboarding/step-2`

#### `/onboarding/step-2` - Onboarding Lifestyle
- **Archivo:** `app/onboarding/step-2/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireProfileOrRedirect()` (requiere sesión + perfil)
- **Responsabilidad:** Completar preferencias de lifestyle
- **Componentes:**
  - `app/onboarding/step-2/OnboardingLifestyleForm.tsx` (Client Component)
- **Server Actions:**
  - `app/onboarding/step-2/actions.ts::saveMyLifestyle()`
- **Post-submit:** Redirect a `/explore`

#### `/dashboard` - Dashboard Principal
- **Archivo:** `app/dashboard/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireAuthOrRedirect()` (solo sesión)
- **Responsabilidad:** Vista de perfil, listings, promociones activas
- **Queries:**
  - Profile del usuario (con `featured_until`)
  - Listings del usuario (con `featured_until`)
- **Features:**
  - Card "Your profile" con estado de promoción
  - Card "Your listings" con lista y botones "Promocionar"
  - Card "Verifications" (placeholder)

#### `/account` - Configuración de Cuenta
- **Archivo:** `app/account/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireAuthOrRedirect()` (solo sesión)
- **Responsabilidad:** Editar display_name y avatar
- **Componentes:**
  - `app/account/AccountForm.tsx` (Client Component)
- **Server Actions:**
  - `app/account/actions.ts::updateProfile()`
- **Features:** Upload de avatar a Supabase Storage (`avatars/{user_id}/avatar.jpg`)

#### `/promote/profile` - Promocionar Perfil
- **Archivo:** `app/promote/profile/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireAuthOrRedirect({ intent: 'roomies' })`
- **Responsabilidad:** UI de planes de promoción (3, 7, 30 días)
- **Componentes:**
  - `app/promote/profile/PromoteButton.tsx` (Client Component)
- **Server Actions:**
  - `app/promote/profile/actions.ts::activateProfilePromotion(planDays)`
- **Lógica:** Extiende `featured_until` si está activo, sino empieza desde ahora

#### `/promote/listing/[id]` - Promocionar Listing
- **Archivo:** `app/promote/listing/[id]/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireAuthOrRedirect({ intent: 'listings' })`
- **Responsabilidad:** UI de planes de promoción para listing específico
- **Validación:** Verifica ownership del listing
- **Componentes:**
  - `app/promote/listing/[id]/PromoteButton.tsx` (Client Component)
- **Server Actions:**
  - `app/promote/listing/actions.ts::activateListingPromotion(listingId, planDays)`

### 2.3. RUTAS PLACEHOLDER

- `/shortlist` - `app/shortlist/page.tsx` (Server Component, "Coming soon")
- `/matches` - `app/matches/page.tsx` (Server Component, "Coming soon")
- `/saved` - `app/saved/page.tsx` (probablemente placeholder)
- `/security` - `app/security/page.tsx` (Server Component, placeholder)
- `/legal/terms` - `app/legal/terms/page.tsx` (Server Component, placeholder)
- `/legal/privacy` - `app/legal/privacy/page.tsx` (Server Component, placeholder)

### 2.4. RUTAS DEBUG

- `/debug/supabase` - `app/debug/supabase/page.tsx`
  - **Guard:** `notFound()` si `NODE_ENV === 'production'`
  - **Componentes:**
    - `app/debug/supabase/SupabaseDebugClient.tsx` (Client Component)
  - **Server Actions:**
    - `app/debug/supabase/actions.ts`

---

## 3. COMPONENTES UI

### 3.1. COMPONENTES GLOBALES

#### `app/Header.tsx`
- **Tipo:** Server Component
- **Responsabilidad:** Header global con navegación, búsqueda, user menu
- **Renderiza:**
  - Logo (link a `/`)
  - `GlobalSearchBar` (centro)
  - Botón "+" para crear listing (centro)
  - `HeaderModeTabs` (derecha, solo en `/explore` o `/listings`)
  - Links Login/Signup (sin sesión) o Messages + `UserMenu` (con sesión)
- **Data Fetching:**
  - `supabase.auth.getSession()`
  - Si hay sesión: `profiles` para `display_name` y `avatar_url`
- **Usado en:** `app/layout.tsx`

#### `app/components/HeaderModeTabs.tsx`
- **Tipo:** Client Component (`'use client'`)
- **Props:** `{ userId?: string, hasProfile?: boolean }`
- **Responsabilidad:** Tabs Roomies/Listings con CTA contextual
- **Lógica:**
  - Detecta modo desde `?mode` param o `pathname`
  - Solo visible en `/explore` o `/listings`
  - Preserva query params al cambiar modo
  - CTA: "Crear listing" (listings) o "Ver mi perfil"/"Crear perfil" (roomies)
- **Hooks:** `useSearchParams()`, `usePathname()`

#### `app/components/UserMenu.tsx`
- **Tipo:** Client Component
- **Props:** `{ displayName, avatarUrl, userId, initial }`
- **Responsabilidad:** Dropdown menu del usuario
- **Features:**
  - Click fuera para cerrar (useEffect + ref)
  - Links: Dashboard, Inbox, Shortlist, Matches, Account, Log out
  - Logout llama `app/logout/actions.ts::logout()` + `router.replace('/login')` + `router.refresh()`

#### `app/components/search/GlobalSearchBar.tsx`
- **Tipo:** Client Component
- **Props:** `{ mode?: 'listings' | 'roomies' }`
- **Responsabilidad:** Barra de búsqueda global con popover de filtros
- **Lógica:**
  - Detecta modo desde prop o `pathname`
  - Filtros según modo:
    - Roomies: `q`, `city`, `budget_min`, `budget_max`
    - Listings: `q`, `city`, `zone`, `listing_type`, `min`, `max`, `sort`
  - Sincroniza con URL params
  - Overlay para cerrar con click fuera
  - ESC para cerrar
- **Hooks:** `useRouter()`, `useSearchParams()`, `usePathname()`

#### `app/components/LifestyleBadges.tsx`
- **Tipo:** Server Component
- **Props:** `{ profile: LifestyleProfile }`
- **Responsabilidad:** Renderiza badges de lifestyle (pets, smoker, cleanliness, parties, schedule)
- **Usado en:**
  - `app/explore/page.tsx`
  - `app/profiles/[user_id]/page.tsx`
  - `app/listings/[id]/page.tsx`
  - `app/messages/page.tsx`
  - `app/messages/[thread_id]/page.tsx`

#### `app/components/TrustPanel.tsx`
- **Tipo:** Server Component
- **Props:** `{ isOwner?: boolean }`
- **Responsabilidad:** Panel de confianza (ratings + verifications placeholder)
- **Usado en:** `app/profiles/[user_id]/page.tsx`

### 3.2. COMPONENTES UI PRIMITIVOS

#### `app/components/ui/Card.tsx`
- **Tipo:** Server Component
- **Componentes:** `Card`, `CardHeader`, `CardContent`
- **Usado en:** `app/messages/page.tsx`, otros

#### `app/components/ui/EmptyState.tsx`
- **Tipo:** Server Component
- **Props:** `{ title, description?, ctaLabel?, ctaHref?, icon?, variant? }`
- **Usado en:** `app/explore/page.tsx`, `app/listings/page.tsx`, `app/messages/page.tsx`

#### `app/components/ui/Button.tsx`
- **Tipo:** (probablemente Server Component)
- **Usado en:** Varios lugares

#### `app/components/ui/Badge.tsx`
- **Tipo:** (probablemente Server Component)
- **Usado en:** Varios lugares

### 3.3. COMPONENTES POR SECCIÓN

#### Explore
- `app/components/roomies/RoomieCard.tsx` - Card de perfil en grid
- `app/explore/ContactButton.tsx` - Botón contactar (Client Component)

#### Listings
- `app/components/listings/ListingCard.tsx` - Card de listing en grid
- `app/components/listings/ListingImage.tsx` - Componente de imagen con fallback
- `app/components/listings/ImageUploader.tsx` - Upload de imágenes (probablemente)
- `app/listings/[id]/ContactForm.tsx` - Formulario de contacto (Client Component)
- `app/listings/[id]/SaveButton.tsx` - Botón guardar listing (Client Component)

#### Home
- `app/components/home/HomeFeaturedListings.tsx` - Carrusel de listings destacados
- `app/components/home/HomeFeaturedProfiles.tsx` - Carrusel de perfiles destacados
- `app/components/home/FeaturedCarousel.tsx` - Componente de carrusel
- `app/components/home/HomeSearchBar.tsx` - Barra de búsqueda en home
- `app/components/home/HomeSection.tsx` - Sección wrapper

#### Profiles
- `app/profiles/[user_id]/ContactButton.tsx` - Botón contactar desde perfil (Client Component)

---

## 4. SERVER ACTIONS

### 4.1. AUTH & ONBOARDING

#### `app/login/actions.ts`
- `hasProfile()` - Verifica si el usuario tiene perfil

#### `app/logout/actions.ts`
- `logout()` - Cierra sesión (llama `supabase.auth.signOut()`)

#### `app/onboarding/step-1/actions.ts`
- `getMyProfile()` - Obtiene perfil actual (no usado actualmente)
- `saveMyProfile()` - Crea/actualiza perfil básico + upload avatar a Storage

#### `app/onboarding/step-2/actions.ts`
- `getMyLifestyle()` - Obtiene lifestyle actual
- `saveMyLifestyle()` - Actualiza campos de lifestyle

### 4.2. LISTINGS

#### `app/listings/new/actions.ts`
- `createListing()` - Crea nuevo listing
- **Validaciones:** title (>=5), description (>=20), city (>=2), zone (>=2), price_mxn (>=0, opcional)
- **Post-success:** Redirect a `/listings`

#### `app/listings/[id]/actions.ts`
- `getOrCreateListingThread()` - Crea/busca thread para contactar desde listing
- Probablemente wrapper de `findOrCreateThread()` con `listingId`

### 4.3. MESSAGES ⭐

#### `app/messages/actions.ts`
- `findOrCreateThread(otherUserId: string, listingId: string | null)`
  - Normaliza user IDs (ordena para consistencia)
  - Busca thread existente (unique index)
  - Crea si no existe
  - Retorna `{ data: threadId, error: null }` o `{ error: string }`
  
- `sendMessage(threadId: string, body: string)`
  - Valida sesión
  - Valida body (1-5000 chars)
  - Verifica que usuario es participant del thread
  - Inserta mensaje
  - `revalidatePath(\`/messages/${threadId}\`)`
  - Retorna `{ data: messageId, error: null }` o `{ error: string }`

### 4.4. ACCOUNT

#### `app/account/actions.ts`
- `updateProfile()` - Actualiza `display_name` y `avatar_url`
- **Revalidaciones:** `/account`, `/dashboard`, layout (para header)

### 4.5. PROMOTION

#### `app/promote/profile/actions.ts`
- `activateProfilePromotion(planDays: number)`
  - Valida sesión
  - Lee `featured_until` actual
  - Calcula nuevo `featured_until` (extiende si activo, sino empieza desde ahora)
  - Actualiza `profiles.featured_until`
  - **Revalidaciones:** `/dashboard`, `/explore`, `/profiles/${user_id}`

#### `app/promote/listing/actions.ts`
- `activateListingPromotion(listingId: string, planDays: number)`
  - Valida sesión
  - Valida ownership del listing
  - Lee `featured_until` actual
  - Calcula nuevo `featured_until` (extiende si activo, sino empieza desde ahora)
  - Actualiza `listings.featured_until`
  - **Revalidaciones:** `/listings`, `/listings/${listingId}`, `/dashboard`

---

## 5. LIBRERÍAS Y UTILIDADES

### 5.1. AUTH

#### `lib/auth.ts`
- **Tipo:** Client-side functions
- **Funciones:**
  - `signUp(email, password)` - Registro con Supabase Auth
  - `signIn(email, password)` - Login con Supabase Auth
  - `signOut()` - Logout (probablemente no usado, se usa server action)
- **Cliente:** `createBrowserSupabaseClient()`

### 5.2. GUARDS

#### `lib/requireAuth.ts`
- **Función:** `requireAuthOrRedirect(options?: RequireAuthOptions)`
- **Propósito:** Verifica sesión, redirect a `/login` si no hay
- **Options:** `{ intent?: 'listings' | 'roomies' }`
- **Retorna:** `{ user: session.user }` o redirect (no retorna)

#### `lib/requireProfile.ts`
- **Función:** `requireProfileOrRedirect()`
- **Propósito:** Verifica sesión + perfil, redirect si falta alguno
- **Flujo:**
  1. No hay sesión → redirect `/login?intent=roomies`
  2. No hay perfil → redirect `/onboarding/step-1`
  3. OK → retorna `{ user: session.user }`

### 5.3. SUPABASE CLIENTS

#### `lib/supabase/server.ts`
- **Función:** `createServerSupabaseClient()`
- **Propósito:** Cliente Supabase para Server Components y Server Actions
- **Implementación:** `createServerClient()` de `@supabase/ssr` con cookie handlers
- **Cookies:** Usa `cookies()` de Next.js para leer/escribir cookies SSR

#### `lib/supabase/client.ts`
- **Función:** `createBrowserSupabaseClient()`
- **Propósito:** Cliente Supabase para Client Components
- **Implementación:** `createBrowserClient()` de `@supabase/ssr`
- **Cookies:** Automático (navegador)

#### `lib/supabaseClient.ts`
- **Estado:** Legacy, no usado
- **Nota:** Solo usado en `/debug/supabase`

---

## 6. BASE DE DATOS Y SUPABASE

### 6.1. TABLAS

#### `profiles`
- **SQL:** `sql/create_profiles_table.sql`
- **Campos:**
  - `user_id` (UUID, PK, FK → auth.users)
  - `display_name` (TEXT, NOT NULL)
  - `city` (TEXT, NOT NULL)
  - `zone` (TEXT, NOT NULL)
  - `avatar_url` (TEXT, nullable)
  - `pets` (BOOLEAN, nullable)
  - `smoker` (BOOLEAN, nullable)
  - `cleanliness` (SMALLINT 1-3, nullable)
  - `parties` (BOOLEAN, nullable)
  - `schedule` (TEXT 'day'|'night', nullable)
  - `featured_until` (TIMESTAMPTZ, nullable)
  - `created_at`, `updated_at` (TIMESTAMPTZ)
- **RLS:**
  - SELECT: Público
  - INSERT/UPDATE/DELETE: Solo owner (`auth.uid() = user_id`)
- **Índices:** `city`, `zone`, `(city, zone)`

#### `listings`
- **SQL:** No hay archivo SQL (asumido existente)
- **Campos (inferidos):**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → auth.users)
  - `title` (TEXT)
  - `description` (TEXT)
  - `city` (TEXT)
  - `zone` (TEXT)
  - `price_mxn` (INTEGER, nullable)
  - `listing_type` (TEXT: 'room' | 'roommate')
  - `featured_until` (TIMESTAMPTZ, nullable)
  - `image_urls` (JSONB o TEXT[], nullable)
  - `created_at` (TIMESTAMPTZ)
- **RLS:** (asumido)
  - SELECT: Público
  - INSERT/UPDATE/DELETE: Solo owner
- **SQL Migration:** `sql/add_listing_featured_until.sql`

#### `threads`
- **SQL:** `sql/create_messaging_tables.sql`
- **Campos:**
  - `id` (UUID, PK)
  - `user1_id` (UUID, FK → auth.users)
  - `user2_id` (UUID, FK → auth.users)
  - `listing_id` (UUID, FK → listings, nullable)
  - `created_at` (TIMESTAMPTZ)
- **RLS:**
  - SELECT: Solo participantes (`auth.uid() = user1_id OR auth.uid() = user2_id`)
  - INSERT: Solo participantes
  - UPDATE/DELETE: Denegado (MVP)
- **Índices:**
  - `threads_users_idx` (user1_id, user2_id)
  - `threads_unique_idx` UNIQUE (LEAST(user1_id, user2_id), GREATEST(...), COALESCE(listing_id, ...))

#### `messages`
- **SQL:** `sql/create_messaging_tables.sql`
- **Campos:**
  - `id` (UUID, PK)
  - `thread_id` (UUID, FK → threads, CASCADE)
  - `sender_id` (UUID, FK → auth.users)
  - `body` (TEXT, NOT NULL)
  - `created_at` (TIMESTAMPTZ)
- **RLS:**
  - SELECT: Solo si participante del thread (EXISTS subquery)
  - INSERT: `sender_id = auth.uid()` AND participante del thread
  - UPDATE/DELETE: Denegado (MVP)
- **Índices:**
  - `messages_thread_created_idx` (thread_id, created_at)

#### `listing_saves` (probablemente)
- **Inferido de código:** `app/listings/[id]/page.tsx` hace query a `listing_saves`
- **Campos (inferidos):**
  - `id` (UUID, PK)
  - `user_id` (UUID, FK → auth.users)
  - `listing_id` (UUID, FK → listings)
  - `created_at` (TIMESTAMPTZ)
- **SQL:** No encontrado en codebase

### 6.2. STORAGE

#### Bucket: `avatars`
- **Path Pattern:** `{user_id}/avatar.jpg`
- **Política:** Pública (lectura sin auth)
- **Upload:** Client-side usando `createBrowserSupabaseClient()`
- **URL:** `supabase.storage.from('avatars').getPublicUrl(filePath)`

---

## 7. SISTEMA DE AUTENTICACIÓN

### 7.1. FLUJO DE SIGNUP

1. Usuario llena formulario en `/signup`
2. `lib/auth.ts::signUp()` → Supabase Auth
3. Supabase envía email de verificación
4. Usuario hace click en link de email
5. Usuario va a `/login` y llena credenciales
6. `lib/auth.ts::signIn()` → Verifica `email_confirmed_at`
7. Si OK → `router.refresh()` → `hasProfile()` → Redirect según perfil/intent

### 7.2. FLUJO DE LOGIN

1. Usuario llena formulario en `/login`
2. `lib/auth.ts::signIn()` → Verifica `email_confirmed_at`
3. Si no confirmado → `signOut()` + error
4. Si confirmado → `router.refresh()` → `hasProfile()`
5. Redirect:
   - Sin perfil + intent=listings → `/listings/new`
   - Sin perfil + intent=roomies → `/onboarding/step-1`
   - Sin perfil + sin intent → `/signup/intent`
   - Con perfil + intent=listings → `/listings`
   - Con perfil + intent=roomies/null → `/explore`

### 7.3. PROTECCIÓN DE RUTAS

**Patrón:**
- Server Components llaman guards al inicio
- Guards hacen redirect si fallan (no retornan)
- Guards retornan `{ user: session.user }` si OK

**Guards disponibles:**
- `requireAuthOrRedirect()` - Solo sesión
- `requireProfileOrRedirect()` - Sesión + perfil

**Rutas protegidas:**
- `/explore` → `requireProfileOrRedirect()`
- `/messages` → `requireProfileOrRedirect()`
- `/messages/[thread_id]` → `requireProfileOrRedirect()`
- `/listings/new` → `requireAuthOrRedirect({ intent: 'listings' })`
- `/dashboard` → `requireAuthOrRedirect()`
- `/account` → `requireAuthOrRedirect()`
- `/onboarding/step-2` → `requireProfileOrRedirect()`

---

## 8. MENSAJES - DEEP DIVE ⭐

### 8.1. ESTRUCTURA ACTUAL

#### Rutas de Mensajes

**`/messages` - Inbox**
- **Archivo:** `app/messages/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireProfileOrRedirect()`
- **Responsabilidad:** Lista de threads (conversaciones) del usuario

**`/messages/[thread_id]` - Chat Individual**
- **Archivo:** `app/messages/[thread_id]/page.tsx`
- **Tipo:** Server Component
- **Guard:** `requireProfileOrRedirect()`
- **Responsabilidad:** Vista de thread individual con historial de mensajes

#### Server Actions

**`app/messages/actions.ts`**

1. **`findOrCreateThread(otherUserId: string, listingId: string | null)`**
   - **Líneas:** 10-71
   - **Flujo:**
     1. Verifica sesión
     2. Previene self-contact (`currentUserId !== otherUserId`)
     3. Normaliza user IDs (ordena para consistencia con unique index)
     4. Busca thread existente:
        ```typescript
        query = supabase.from('threads')
          .select('id')
          .eq('user1_id', user1Id)
          .eq('user2_id', user2Id)
        if (listingId) {
          query = query.eq('listing_id', listingId)
        } else {
          query = query.is('listing_id', null)
        }
        ```
     5. Si existe → retorna `{ data: existingThread.id }`
     6. Si no existe → crea thread y retorna `{ data: newThread.id }`
   - **Retorna:** `{ data: threadId, error: null }` o `{ error: string }`

2. **`sendMessage(threadId: string, body: string)`**
   - **Líneas:** 76-128
   - **Flujo:**
     1. Verifica sesión
     2. Valida body (1-5000 chars)
     3. Verifica que usuario es participant del thread:
        ```typescript
        const { data: thread } = await supabase
          .from('threads')
          .select('user1_id, user2_id')
          .eq('id', threadId)
          .single()
        if (thread.user1_id !== session.user.id && thread.user2_id !== session.user.id) {
          return { error: 'No tienes permiso...' }
        }
        ```
     4. Inserta mensaje:
        ```typescript
        await supabase.from('messages').insert({
          thread_id: threadId,
          sender_id: session.user.id,
          body: body.trim(),
        })
        ```
     5. `revalidatePath(\`/messages/${threadId}\`)`
   - **Retorna:** `{ data: messageId, error: null }` o `{ error: string }`

#### Componentes

**`app/messages/page.tsx` - Inbox**

**Queries:**
```typescript
// 1. Obtener threads del usuario
const { data: threads } = await supabase
  .from('threads')
  .select('id, user1_id, user2_id, listing_id, created_at')
  .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
  .order('created_at', { ascending: false })
  .limit(50)

// 2. Para cada thread, obtener:
//    - Perfil del otro usuario
//    - Último mensaje
const threadsWithData = await Promise.all(
  threads.map(async (thread) => {
    const otherUserId = thread.user1_id === session.user.id 
      ? thread.user2_id 
      : thread.user1_id
    
    const { data: otherProfile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, pets, smoker, cleanliness, parties, schedule')
      .eq('user_id', otherUserId)
      .single()
    
    const { data: lastMessage } = await supabase
      .from('messages')
      .select('body, created_at')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    
    return { ...thread, otherUser: otherProfile, lastMessage }
  })
)
```

**UI:**
- Lista de cards clickeables (Link a `/messages/${thread.id}`)
- Cada card muestra:
  - Avatar del otro usuario (o inicial)
  - Nombre del otro usuario
  - Lifestyle badges
  - Preview del último mensaje (truncado)
  - Fecha del último mensaje
- EmptyState si no hay threads

**Problemas identificados:**
1. **N+1 queries:** Hace `Promise.all` con queries individuales para cada thread (perfil + último mensaje)
2. **No hay ordenamiento por último mensaje:** Ordena por `created_at` del thread, no por fecha del último mensaje
3. **No hay indicador de no leídos:** No diferencia mensajes leídos/no leídos
4. **No hay búsqueda:** No se puede buscar en threads
5. **Layout simple:** Lista vertical, no split view como Airbnb

**`app/messages/[thread_id]/page.tsx` - Chat Individual**

**Queries:**
```typescript
// 1. Obtener thread y validar participant
const { data: thread } = await supabase
  .from('threads')
  .select('id, user1_id, user2_id, listing_id')
  .eq('id', params.thread_id)
  .single()

// 2. Obtener perfil del otro usuario
const otherUserId = thread.user1_id === session.user.id 
  ? thread.user2_id 
  : thread.user1_id

const { data: otherProfile } = await supabase
  .from('profiles')
  .select('display_name, avatar_url, pets, smoker, cleanliness, parties, schedule')
  .eq('user_id', otherUserId)
  .single()

// 3. Obtener mensajes del thread
const { data: messages } = await supabase
  .from('messages')
  .select('id, sender_id, body, created_at')
  .eq('thread_id', params.thread_id)
  .order('created_at', { ascending: true })
  .limit(100)
```

**UI:**
- Header con:
  - Link "← Volver a mensajes"
  - Card con avatar, nombre, lifestyle badges del otro usuario
  - Link a listing relacionado (si `thread.listing_id` existe)
- Área de mensajes:
  - Scroll vertical (`max-h-[600px] overflow-y-auto`)
  - Mensajes propios: alineados a la derecha, fondo naranja (`bg-[#FF7A18]`)
  - Mensajes del otro: alineados a la izquierda, fondo gris (`bg-gray-100`)
  - Timestamp en cada mensaje
  - EmptyState si no hay mensajes
- `MessageForm` al final

**Problemas identificados:**
1. **No hay scroll automático:** Al enviar mensaje, no scrolla al final
2. **Recarga completa:** `MessageForm` hace `window.location.reload()` después de enviar
3. **No hay realtime:** Requiere refresh para ver nuevos mensajes
4. **Límite de 100 mensajes:** No hay paginación
5. **No hay estados de carga:** No hay skeletons mientras carga

**`app/messages/[thread_id]/MessageForm.tsx` - Formulario de Envío**

**Tipo:** Client Component (`'use client'`)

**Funcionalidad:**
- Textarea con `maxLength={5000}`
- Botón "Enviar" (disabled si vacío o loading)
- Enter para enviar (Shift+Enter para nueva línea)
- Loading state
- Error handling
- **Problema:** Hace `window.location.reload()` después de enviar (línea 40)

**Código relevante:**
```typescript
const handleSubmit = async (e: FormEvent) => {
  e.preventDefault()
  // ... validación
  const { error } = await sendMessage(threadId, message)
  if (error) {
    setErrorMsg('...')
    return
  }
  setMessage('')
  setLoading(false)
  window.location.reload() // ⚠️ Problema: recarga completa
}
```

### 8.2. PUNTOS DE ENTRADA A MENSAJES

**ContactButton Components:**

1. **`app/explore/ContactButton.tsx`**
   - Usado en: `/explore` (cards de perfiles)
   - Llama: `findOrCreateThread(userId, null)` (sin listing)
   - Redirect: `/messages/${threadId}`

2. **`app/profiles/[user_id]/ContactButton.tsx`**
   - Usado en: `/profiles/[user_id]`
   - Llama: `findOrCreateThread(userId, null)` (sin listing)
   - Redirect: `/messages/${threadId}`

3. **`app/listings/[id]/ContactForm.tsx`** (probablemente)
   - Usado en: `/listings/[id]`
   - Llama: `findOrCreateThread(listingUserId, listingId)` (con listing)
   - Redirect: `/messages/${threadId}`

**Patrón común:**
- Todos son Client Components
- Todos llaman `findOrCreateThread()` server action
- Todos manejan loading/error states
- Todos redirigen a `/messages/${threadId}` después de crear/encontrar thread

### 8.3. PROBLEMAS ACTUALES IDENTIFICADOS

#### Problemas de Performance

1. **N+1 Queries en `/messages`:**
   - Hace 1 query para threads
   - Luego hace 2 queries por thread (perfil + último mensaje)
   - Para 20 threads = 1 + (20 * 2) = 41 queries
   - **Solución:** Usar JOINs o agregaciones en Supabase

2. **No hay ordenamiento por último mensaje:**
   - Ordena por `thread.created_at`, no por `lastMessage.created_at`
   - Threads antiguos con mensajes recientes aparecen abajo
   - **Solución:** Ordenar por `MAX(messages.created_at)` o subquery

#### Problemas de UX

3. **Layout simple (lista vertical):**
   - No hay split view como Airbnb
   - En desktop, se pierde contexto al abrir thread
   - **Solución:** Layout 2 columnas (sidebar + panel conversación)

4. **No hay indicador de no leídos:**
   - No diferencia mensajes leídos/no leídos
   - No hay badge de contador en header
   - **Solución:** Agregar campo `read_at` o tabla `message_reads`

5. **No hay búsqueda en threads:**
   - No se puede buscar por nombre de usuario o contenido
   - **Solución:** Agregar input de búsqueda en sidebar

6. **Recarga completa después de enviar:**
   - `MessageForm` hace `window.location.reload()`
   - Pierde scroll position
   - **Solución:** Usar `router.refresh()` o optimistic updates

7. **No hay scroll automático:**
   - Al enviar mensaje, no scrolla al final
   - **Solución:** `useEffect` que scrolla al final cuando cambian mensajes

8. **No hay realtime:**
   - Requiere refresh para ver nuevos mensajes
   - **Solución:** Supabase Realtime subscriptions

#### Problemas de Responsive

9. **Mobile no optimizado:**
   - Mismo layout en mobile y desktop
   - En mobile, debería ser lista → al abrir thread, navegar a `/messages/[id]`
   - **Solución:** Detectar viewport, layout condicional

10. **No hay estados de carga:**
    - No hay skeletons mientras carga threads o mensajes
    - **Solución:** Agregar skeletons con Tailwind

---

## 9. RECOMENDACIONES DE ARQUITECTURA PARA MENSAJES

### 9.1. OBJETIVO: LAYOUT ESTILO AIRBNB

**Características deseadas:**
- **Desktop:** Split view persistente (sidebar izquierdo con threads + panel derecho con conversación)
- **Mobile:** Lista de threads → al abrir thread, navegar a `/messages/[id]` (full screen)
- **Estados vacíos:** Skeletons, empty states
- **Features:** Unread badges, búsqueda, scroll automático

### 9.2. ARQUITECTURA PROPUESTA

#### Opción A: Layout con Query Params (Recomendada)

**Estructura:**
```
/messages                    → Lista de threads (sidebar en desktop, lista en mobile)
/messages?thread={id}        → Split view (desktop) o redirect a /messages/[id] (mobile)
/messages/[thread_id]         → Chat individual (mobile full screen, o panel derecho en desktop)
```

**Ventajas:**
- Mantiene SSR (Server Components)
- URL compartible
- Responsive fácil (detectar viewport, layout condicional)
- No requiere cambios masivos en routing

**Implementación:**
1. `app/messages/page.tsx` lee `?thread` param
2. Si `?thread` existe y es desktop → renderiza split view
3. Si `?thread` existe y es mobile → redirect a `/messages/[thread]`
4. Si no hay `?thread` → renderiza solo sidebar/lista

#### Opción B: Parallel Routes (Avanzada)

**Estructura:**
```
/messages
  ├── @sidebar/              → Sidebar con threads
  └── @chat/                 → Panel de conversación (o default.tsx si no hay thread)
```

**Ventajas:**
- Separación clara de responsabilidades
- Mejor para estados de carga independientes

**Desventajas:**
- Más complejo
- Requiere cambios en estructura de carpetas

### 9.3. CAMBIOS MÍNIMOS (MVP)

#### 1. Optimizar Queries en `/messages`

**Problema:** N+1 queries

**Solución:** Usar agregación en Supabase

```typescript
// Query optimizada (pseudocódigo)
const { data: threads } = await supabase
  .from('threads')
  .select(`
    id,
    user1_id,
    user2_id,
    listing_id,
    created_at,
    other_user:profiles!threads_user2_id_fkey(display_name, avatar_url, ...),
    last_message:messages(created_at, body)
      .order('created_at', { ascending: false })
      .limit(1)
  `)
  .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
  .order('created_at', { ascending: false })
```

**Nota:** Supabase no soporta `MAX()` en ordenamiento directamente. Alternativa: hacer subquery o ordenar en código después de obtener datos.

#### 2. Ordenar por Último Mensaje

**Solución:** Ordenar en código después de obtener datos

```typescript
const sortedThreads = threadsWithData.sort((a, b) => {
  const aDate = a.lastMessage?.created_at || a.created_at
  const bDate = b.lastMessage?.created_at || b.created_at
  return new Date(bDate).getTime() - new Date(aDate).getTime()
})
```

#### 3. Layout 2 Columnas (Desktop)

**Cambios en `app/messages/page.tsx`:**

```typescript
export default async function MessagesPage({ searchParams }: { searchParams: { thread?: string } }) {
  // ... queries existentes ...
  
  const selectedThreadId = searchParams.thread
  
  return (
    <div className="container mx-auto px-4 md:px-8 py-16 max-w-7xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <h1 className="text-2xl font-semibold mb-4">Mensajes</h1>
          {/* Lista de threads */}
        </div>
        
        {/* Panel de conversación */}
        <div className="lg:col-span-2">
          {selectedThreadId ? (
            <ThreadPanel threadId={selectedThreadId} />
          ) : (
            <EmptyState message="Selecciona una conversación" />
          )}
        </div>
      </div>
    </div>
  )
}
```

**Nota:** `ThreadPanel` puede ser un Server Component que hace las mismas queries que `/messages/[thread_id]/page.tsx`.

#### 4. Eliminar `window.location.reload()`

**Cambio en `app/messages/[thread_id]/MessageForm.tsx`:**

```typescript
// Antes:
window.location.reload()

// Después:
router.refresh() // O mejor: usar optimistic updates
```

#### 5. Scroll Automático

**Agregar en `app/messages/[thread_id]/page.tsx`:**

```typescript
'use client' // O crear componente wrapper Client

useEffect(() => {
  const messagesContainer = document.getElementById('messages-container')
  if (messagesContainer) {
    messagesContainer.scrollTop = messagesContainer.scrollHeight
  }
}, [messages])
```

### 9.4. MEJORAS FASE 2

#### 1. Unread Badges

**Cambios en DB:**
- Agregar campo `read_at` a `messages` o tabla `message_reads`
- Query para contar mensajes no leídos por thread

**UI:**
- Badge numérico en sidebar
- Badge en header (icono de mensajes)

#### 2. Búsqueda en Threads

**Agregar input de búsqueda en sidebar:**
- Filtrar threads por nombre de usuario o contenido de último mensaje
- Client-side filtering (o server-side con query param)

#### 3. Realtime Subscriptions

**Usar Supabase Realtime:**
```typescript
const channel = supabase
  .channel(`thread:${threadId}`)
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `thread_id=eq.${threadId}`
  }, (payload) => {
    // Agregar nuevo mensaje a UI
  })
  .subscribe()
```

**Nota:** Requiere convertir componentes a Client Components o usar Server Components con streaming.

#### 4. Paginación de Mensajes

**Agregar "Cargar más" en historial:**
- Query con `range()` para paginación
- Botón "Cargar más" al inicio del historial

#### 5. Estados de Carga (Skeletons)

**Agregar skeletons con Tailwind:**
```typescript
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
</div>
```

### 9.5. LISTA DE CAMBIOS (CHECKLIST)

#### MVP (Cambios Mínimos)

- [ ] Optimizar queries en `/messages` (reducir N+1)
- [ ] Ordenar threads por último mensaje (no por `created_at` del thread)
- [ ] Layout 2 columnas en desktop (`/messages?thread={id}`)
- [ ] Eliminar `window.location.reload()` en `MessageForm`
- [ ] Scroll automático al final al enviar mensaje
- [ ] Responsive: mobile → lista, desktop → split view

#### Fase 2 (Mejoras)

- [ ] Unread badges (contador de no leídos)
- [ ] Búsqueda en threads
- [ ] Realtime subscriptions (mensajes nuevos sin refresh)
- [ ] Paginación de mensajes
- [ ] Skeletons de carga
- [ ] Estados vacíos mejorados

---

## 10. NOTAS FINALES

### Patrones a Preservar

1. **Server Components por defecto:** Mantener SSR siempre que sea posible
2. **Server Actions para mutaciones:** No cambiar a API routes
3. **RLS como seguridad:** No modificar políticas sin revisión
4. **Guards en páginas:** Mantener `requireProfileOrRedirect()` en rutas protegidas
5. **Extension logic en promociones:** No cambiar sin aprobación

### Archivos Críticos para Mensajes

1. `app/messages/page.tsx` - Inbox (necesita optimización)
2. `app/messages/[thread_id]/page.tsx` - Chat individual (necesita mejoras UX)
3. `app/messages/[thread_id]/MessageForm.tsx` - Formulario (necesita eliminar reload)
4. `app/messages/actions.ts` - Server Actions (OK, no cambiar)

### Dependencias Clave

- `@supabase/ssr` - SSR cookies
- `next/navigation` - `useRouter()`, `useSearchParams()`, `usePathname()`
- Tailwind CSS - Estilos

---

**Fin del Project Map Completo**

