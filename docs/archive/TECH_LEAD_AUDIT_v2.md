# 🔍 AUDITORÍA TÉCNICA COMPLETA v2 — MyRoomie.mx
**Fecha:** 2025-01-27  
**Auditor:** Tech Lead Review  
**Objetivo:** Project Map + Detección de Inconsistencias + Plan de Refactor por Fases

---

## 1) RESUMEN EJECUTIVO

### Estado Actual (Production-Ready)

**✅ Fortalezas:**
- **Auth/SSR:** Flujo sólido con `requireAuth`/`requireProfile`, null guards corregidos
- **Supabase:** Clientes SSR/client bien separados, RLS habilitado en todas las tablas críticas
- **Location System:** Canonicalización con `public.locations`, service role para upsert, México-only validado
- **UI Consistency:** Tokens Tailwind definidos (`brand`, `brandHover`, `ring-brand/30`), layout consistente
- **GlobalSearchBar:** Autocomplete Mapbox, reverse geocoding, clear logic centralizada, CustomEvent para logo
- **Messages:** RLS correcto, thread participants, unread status funcional
- **Explore/Listings:** Filtros funcionando, location_id resolution, featured ordering

**⚠️ Áreas de Mejora:**
- **Hardcoded Colors:** ~20+ archivos aún usan `#FF7A18`/`#E86F14` en vez de tokens
- **Duplicación:** Filtros duplicados entre `explore` y `listings`, lógica de featured repetida
- **Rate Limiting:** Endpoints `/api/geo/*` y `/api/locations/*` sin protección
- **Error Handling:** Algunos errores de API no se muestran consistentemente en UI
- **TypeScript:** Algunos `any` types en filtros, falta tipado estricto en algunos componentes

### Top 10 Issues por Impacto

1. **🔴 ALTO: Hardcoded Colors (20+ archivos)**  
   - **Impacto:** Mantenibilidad, consistencia visual, dificulta rebranding
   - **Riesgo de cambio:** Bajo (solo reemplazo de clases)
   - **Evidencia:** `app/messages/*`, `app/listings/*`, `app/onboarding/*`, `app/promote/*`, etc.
   - **Fix:** Fase 1 (ya parcialmente completada en `login`, `signup`, `explore/FilterChips`, `explore/ResultHeader`)

2. **🟡 MEDIO: Rate Limiting en API Routes**  
   - **Impacto:** Seguridad, costos de Mapbox, posible abuso
   - **Riesgo de cambio:** Medio (requiere middleware/config)
   - **Evidencia:** `app/api/geo/forward/route.ts`, `app/api/geo/reverse/route.ts`
   - **Fix:** Fase 2 (agregar rate limiting con Vercel Edge Config o Upstash)

3. **🟡 MEDIO: Duplicación de Lógica de Filtros**  
   - **Impacto:** Mantenibilidad, bugs por desincronización
   - **Riesgo de cambio:** Medio (refactor requiere testing extensivo)
   - **Evidencia:** `app/explore/page.tsx` (L74-120) vs `app/listings/page.tsx` (L50-100)
   - **Fix:** Fase 3 (extraer helper compartido `lib/filters/buildQuery.ts`)

4. **🟡 MEDIO: TypeScript `any` en Filtros**  
   - **Impacto:** Type safety, posibles runtime errors
   - **Riesgo de cambio:** Bajo (solo tipado)
   - **Evidencia:** `app/components/search/GlobalSearchBar.tsx` (L46, L69-91)
   - **Fix:** Fase 4 (crear tipos `RoomiesFilters`, `ListingsFilters`)

5. **🟢 BAJO: Error Handling Inconsistente**  
   - **Impacto:** UX, debugging
   - **Riesgo de cambio:** Bajo
   - **Evidencia:** Algunos errores de API no se muestran en UI (ej: `locations/upsert` falla silenciosamente)
   - **Fix:** Fase 5 (unificar error handling con componente `ErrorToast`)

6. **🟢 BAJO: Featured Logic Duplicada**  
   - **Impacto:** Mantenibilidad
   - **Riesgo de cambio:** Bajo
   - **Evidencia:** `app/explore/page.tsx` (L120-130) vs `app/listings/page.tsx` (L100-110)
   - **Fix:** Fase 6 (extraer `lib/featured/orderByFeatured.ts`)

7. **🟢 BAJO: Falta Loading States en Algunos Componentes**  
   - **Impacto:** UX
   - **Riesgo de cambio:** Bajo
   - **Evidencia:** `app/explore/page.tsx` tiene `loading.tsx`, pero `app/listings/page.tsx` no
   - **Fix:** Fase 7 (agregar `app/listings/loading.tsx`)

8. **🟢 BAJO: Validación de Inputs Client-Side Solo**  
   - **Impacto:** Seguridad (bypass posible)
   - **Riesgo de cambio:** Medio (requiere validación server-side)
   - **Evidencia:** Formularios en `app/onboarding/*`, `app/listings/new/*`
   - **Fix:** Fase 8 (agregar validación en `actions.ts`)

9. **🟢 BAJO: Logging Mínimo**  
   - **Impacto:** Debugging en producción
   - **Riesgo de cambio:** Bajo
   - **Evidencia:** Solo `console.error` en algunos lugares
   - **Fix:** Fase 9 (agregar logging estructurado con niveles)

10. **🟢 BAJO: Falta Documentación de API Routes**  
    - **Impacto:** Onboarding, mantenibilidad
    - **Riesgo de cambio:** Bajo
    - **Evidencia:** `app/api/*/route.ts` sin JSDoc
    - **Fix:** Fase 10 (agregar JSDoc a todos los endpoints)

### Top 10 Quick Wins

1. ✅ **Reemplazar hardcoded colors restantes** (2-3 horas, bajo riesgo)
2. ✅ **Agregar `loading.tsx` a `/listings`** (15 min, bajo riesgo)
3. ✅ **Tipar filtros en `GlobalSearchBar`** (1 hora, bajo riesgo)
4. ✅ **Agregar JSDoc a API routes** (1 hora, bajo riesgo)
5. ✅ **Unificar error messages en UI** (2 horas, bajo riesgo)
6. ✅ **Agregar `aria-label` faltantes** (1 hora, bajo riesgo)
7. ✅ **Extraer constantes de filtros** (1 hora, bajo riesgo)
8. ✅ **Agregar `rel="noopener"` a links externos** (15 min, bajo riesgo)
9. ✅ **Optimizar imágenes con `next/image`** (2 horas, bajo riesgo)
10. ✅ **Agregar `sitemap.xml` y `robots.txt`** (30 min, bajo riesgo)

---

## 2) INVENTARIO DEL REPO

### `app/` (Next.js App Router)

**Rol:** Rutas, layouts, componentes de página, API routes

**Estructura:**
```
app/
├── layout.tsx                    # Root layout (Server)
├── page.tsx                      # Home/hero (Server)
├── Header.tsx                    # Header dinámico (Server)
├── globals.css                   # Estilos globales
├── account/                      # Cuenta de usuario
├── api/                          # Route Handlers
│   ├── geo/
│   │   ├── forward/route.ts      # Mapbox autocomplete
│   │   └── reverse/route.ts      # Mapbox reverse geocoding
│   └── locations/
│       └── upsert/route.ts       # Upsert canonical locations (service role)
├── components/                   # Componentes reutilizables
│   ├── home/                     # Componentes del home
│   ├── listings/                 # Cards y componentes de listings
│   ├── roomies/                  # Cards y componentes de roomies
│   ├── search/                   # GlobalSearchBar
│   └── ui/                       # UI primitives (Button, Card, Badge, etc.)
├── explore/                      # Página de exploración de roomies
│   ├── page.tsx                  # Server Component (filtros, query)
│   ├── FilterChips.tsx          # Client Component (chips booleanos)
│   ├── ResultHeader.tsx          # Client Component (count + badges)
│   └── loading.tsx               # Skeleton loading
├── listings/                     # Página de listings
│   ├── page.tsx                  # Server Component
│   ├── new/                      # Crear listing
│   └── [id]/                     # Detalle de listing
├── messages/                     # Sistema de mensajería
│   ├── page.tsx                  # Inbox (Server)
│   ├── ThreadPanel.tsx          # Panel de threads (Server)
│   ├── [thread_id]/page.tsx      # Thread individual (Server)
│   └── actions.ts                # Server Actions (crear thread, enviar mensaje)
├── onboarding/                   # Onboarding de perfiles
│   ├── step-1/                   # Paso 1: Datos básicos
│   └── step-2/                   # Paso 2: Lifestyle
├── profiles/                     # Perfiles de usuario
│   └── [user_id]/page.tsx        # Vista de perfil
├── promote/                      # Promoción de listings/perfiles
└── lib/
    └── search/
        └── clearLocation.ts      # Helpers para limpiar ubicación
```

**Archivos Clave:**
- `app/layout.tsx`: Root layout con Header y Footer
- `app/Header.tsx`: Header dinámico (con/sin sesión), incluye `GlobalSearchBar`
- `app/components/search/GlobalSearchBar.tsx`: Search bar global con autocomplete, geolocation, clear logic
- `app/explore/page.tsx`: Página principal de exploración de roomies
- `app/messages/page.tsx`: Inbox de mensajes
- `app/api/locations/upsert/route.ts`: Upsert de ubicaciones canónicas (service role)

### `lib/` (Utilities)

**Rol:** Helpers, clientes Supabase, guards de auth

**Archivos:**
- `lib/supabase/server.ts`: `createServerSupabaseClient()` (SSR con cookies)
- `lib/supabase/client.ts`: `createBrowserSupabaseClient()` (client-side)
- `lib/requireAuth.ts`: `requireAuthOrRedirect()` (verifica sesión)
- `lib/requireProfile.ts`: `requireProfileOrRedirect()` (verifica sesión + perfil)
- `lib/auth.ts`: Wrappers de `signIn`, `signUp`, `signOut` (client-side)
- `lib/supabaseClient.ts`: ⚠️ **DEPRECATED** (no usar, usar `lib/supabase/*`)

### `sql/` (Migrations)

**Rol:** Migraciones SQL, definición de tablas y RLS

**Archivos:**
- `sql/create_profiles_table.sql`: Tabla `profiles` + RLS
- `sql/create_messaging_tables.sql`: Tablas `threads` + `messages` + RLS
- `sql/create_locations_table.sql`: Tabla `locations` + RLS (canonical locations)
- `sql/create_listing_saves_table.sql`: Tabla `listing_saves` (favoritos)
- `sql/create_thread_participants_table.sql`: Tabla `thread_participants` (migración)
- `sql/add_featured_until.sql`: Agregar columna `featured_until` a `profiles`
- `sql/add_listing_featured_until.sql`: Agregar columna `featured_until` a `listings`
- `sql/add_listing_images.sql`: Agregar columna `image_urls` a `listings`

### `app/components/` (Componentes Reutilizables)

**Rol:** Componentes UI compartidos

**Estructura:**
```
components/
├── ui/                           # Primitives
│   ├── Button.tsx                # Botón reutilizable
│   ├── Card.tsx                  # Card container
│   ├── Badge.tsx                 # Badge/chip
│   └── EmptyState.tsx             # Estado vacío
├── home/                         # Componentes del home
│   ├── HomeFeaturedListings.tsx  # Listings destacados
│   ├── HomeFeaturedProfiles.tsx  # Perfiles destacados
│   └── HomeSearchBar.tsx         # Search bar del home (legacy?)
├── listings/                     # Componentes de listings
│   ├── ListingCard.tsx           # Card de listing
│   ├── ListingImage.tsx          # Imagen de listing
│   └── ImageUploader.tsx         # Upload de imágenes
├── roomies/                      # Componentes de roomies
│   └── RoomieCard.tsx            # Card de perfil
├── search/                       # Search
│   └── GlobalSearchBar.tsx       # Search bar global (autocomplete, geolocation)
├── HeaderModeTabs.tsx            # Tabs de modo (roomies/listings)
├── LifestyleBadges.tsx           # Badges de lifestyle
├── LogoLink.tsx                  # Logo con clear location logic
├── TrustPanel.tsx                # Panel de confianza
└── UserMenu.tsx                  # Menú de usuario
```

---

## 3) MAPA DE RUTAS (Next.js App Router)

| Ruta | `page.tsx` | `loading.tsx` | `layout.tsx` | Tipo | Componentes Usados |
|------|------------|---------------|--------------|------|-------------------|
| `/` | `app/page.tsx` | ❌ | `app/layout.tsx` | Server | `HomeFeaturedProfiles`, `HomeFeaturedListings` |
| `/explore` | `app/explore/page.tsx` | ✅ `app/explore/loading.tsx` | `app/layout.tsx` | Server | `FilterChips`, `ResultHeader`, `RoomieCard`, `EmptyState` |
| `/listings` | `app/listings/page.tsx` | ❌ | `app/layout.tsx` | Server | `ListingCard`, `EmptyState` |
| `/listings/new` | `app/listings/new/page.tsx` | ❌ | `app/layout.tsx` | Server | `ListingForm` |
| `/listings/[id]` | `app/listings/[id]/page.tsx` | ❌ | `app/layout.tsx` | Server | `ContactForm`, `SaveButton` |
| `/messages` | `app/messages/page.tsx` | ❌ | `app/layout.tsx` | Server | `ThreadPanel`, `InboxSearch`, `EmptyState` |
| `/messages/[thread_id]` | `app/messages/[thread_id]/page.tsx` | ❌ | `app/layout.tsx` | Server | `MessageForm`, `AutoScrollToBottom` |
| `/login` | `app/login/page.tsx` | ❌ | `app/layout.tsx` | Client | - |
| `/signup` | `app/signup/page.tsx` | ❌ | `app/layout.tsx` | Client | - |
| `/signup/intent` | `app/signup/intent/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/onboarding/step-1` | `app/onboarding/step-1/page.tsx` | ❌ | `app/layout.tsx` | Server | `OnboardingForm` |
| `/onboarding/step-2` | `app/onboarding/step-2/page.tsx` | ❌ | `app/layout.tsx` | Server | `OnboardingLifestyleForm` |
| `/profiles/[user_id]` | `app/profiles/[user_id]/page.tsx` | ❌ | `app/layout.tsx` | Server | `ContactButton` |
| `/account` | `app/account/page.tsx` | ❌ | `app/layout.tsx` | Server | `AccountForm` |
| `/dashboard` | `app/dashboard/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/promote/profile` | `app/promote/profile/page.tsx` | ❌ | `app/layout.tsx` | Server | `PromoteButton` |
| `/promote/listing/[id]` | `app/promote/listing/[id]/page.tsx` | ❌ | `app/layout.tsx` | Server | `PromoteButton` |
| `/saved` | `app/saved/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/shortlist` | `app/shortlist/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/matches` | `app/matches/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/security` | `app/security/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/legal/terms` | `app/legal/terms/page.tsx` | ❌ | `app/layout.tsx` | Server | - |
| `/legal/privacy` | `app/legal/privacy/page.tsx` | ❌ | `app/layout.tsx` | Server | - |

**Notas:**
- Todas las rutas usan `app/layout.tsx` como root layout
- Solo `/explore` tiene `loading.tsx` (skeleton)
- `/login` y `/signup` son Client Components (usan `'use client'`)
- Rutas protegidas usan `requireAuth` o `requireProfile` (ver sección 5)

---

## 4) ARQUITECTURA SUPABASE (SSR + CLIENTS)

### Dónde se Crea Supabase Server Client

**Archivo:** `lib/supabase/server.ts`  
**Función:** `createServerSupabaseClient()`  
**Líneas:** L11-37

**Uso:**
- Todos los Server Components llaman `createServerSupabaseClient()`
- Usa `@supabase/ssr` con cookies de Next.js
- Maneja cookies automáticamente (get/set/remove)

**Ejemplo:**
```typescript
// app/explore/page.tsx (L13)
const supabase = createServerSupabaseClient()
```

### Dónde se Usa Service Role (y Por Qué)

**Archivo:** `app/api/locations/upsert/route.ts`  
**Líneas:** L104-127

**Razón:**
- RLS en `public.locations` requiere autenticación para INSERT
- Pero el upsert debe funcionar sin depender de la sesión del usuario
- Service role bypass RLS, permitiendo upsert desde cualquier request

**Implementación:**
```typescript
const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
})
```

**⚠️ Seguridad:**
- `SUPABASE_SERVICE_ROLE_KEY` solo en `.env.local` (no commitear)
- Validaciones estrictas en el endpoint (provider, place_id, lat/lng ranges)
- No expone secretos al cliente

### Dónde Viven Policies RLS / Migraciones SQL

**Carpeta:** `sql/`

**Políticas RLS Definidas:**

1. **`profiles`** (`sql/create_profiles_table.sql`):
   - SELECT: Público (`USING (true)`)
   - INSERT/UPDATE/DELETE: Owner only (`auth.uid() = user_id`)

2. **`threads`** (`sql/create_messaging_tables.sql`):
   - SELECT: Participants only (`auth.uid() = user1_id OR auth.uid() = user2_id`)
   - INSERT: Participants only
   - UPDATE/DELETE: Denegado (MVP)

3. **`messages`** (`sql/create_messaging_tables.sql`):
   - SELECT: Thread participants only (via EXISTS subquery)
   - INSERT: Sender must be `auth.uid()` AND participant
   - UPDATE/DELETE: Denegado (MVP)

4. **`locations`** (`sql/create_locations_table.sql`):
   - SELECT: Público (`USING (true)`)
   - INSERT: Authenticated only (`WITH CHECK (true)`)
   - UPDATE/DELETE: Denegado (MVP)

5. **`listings`** (no hay SQL en repo, pero debe tener RLS similar a `profiles`)

6. **`listing_saves`** (`sql/create_listing_saves_table.sql`):
   - SELECT/INSERT/DELETE: Owner only

### Tablas Existentes (según SQL en repo)

1. **`public.profiles`**
   - `user_id` (UUID, PK, FK → `auth.users`)
   - `display_name`, `city`, `zone`, `avatar_url`
   - `featured_until` (TIMESTAMPTZ, nullable)
   - `pets`, `smoker`, `cleanliness`, `parties`, `schedule` (lifestyle)
   - `created_at`, `updated_at`

2. **`public.threads`**
   - `id` (UUID, PK)
   - `user1_id`, `user2_id` (UUID, FK → `auth.users`)
   - `listing_id` (UUID, FK → `listings`, nullable)
   - `created_at`

3. **`public.messages`**
   - `id` (UUID, PK)
   - `thread_id` (UUID, FK → `threads`)
   - `sender_id` (UUID, FK → `auth.users`)
   - `body` (TEXT)
   - `created_at`

4. **`public.locations`**
   - `id` (UUID, PK)
   - `provider` (TEXT, default 'mapbox')
   - `place_id` (TEXT, unique con `provider`)
   - `label`, `city`, `region`, `country` (TEXT, nullable)
   - `lat`, `lng` (DOUBLE PRECISION, nullable)
   - `created_at`

5. **`public.listing_saves`**
   - `user_id` (UUID, FK → `auth.users`)
   - `listing_id` (UUID, FK → `listings`)
   - `created_at`
   - PK: `(user_id, listing_id)`

6. **`public.listings`** (no hay SQL en repo, pero se usa en código)
   - Debe tener: `id`, `user_id`, `title`, `description`, `city`, `zone`, `price_mxn`, `listing_type`, `image_urls`, `featured_until`, `created_at`

---

## 5) AUTH / PERFIL / REDIRECTS

### `requireAuth` / `requireProfile` / Middleware

**Archivo:** `lib/requireAuth.ts`  
**Función:** `requireAuthOrRedirect(options?: { intent?: 'listings' | 'roomies' })`  
**Líneas:** L9-55

**Comportamiento:**
1. Obtiene sesión con `supabase.auth.getSession()`
2. Si no hay sesión:
   - Obtiene `referer` header para determinar ruta actual
   - Si es ruta protegida válida (no `/login`, `/signup`, `/`, `/legal/*`):
     - Redirige a `/login?intent=...&next=<currentPath>`
   - Si no es ruta protegida:
     - Redirige a `/login?intent=...`
3. Si hay sesión:
   - Retorna `{ user: session.user }`

**Archivo:** `lib/requireProfile.ts`  
**Función:** `requireProfileOrRedirect()`  
**Líneas:** L5-58

**Comportamiento:**
1. Obtiene sesión (igual que `requireAuth`)
2. Si no hay sesión:
   - Redirige a `/login?intent=roomies&next=...` (igual que `requireAuth`)
3. Si hay sesión pero no perfil:
   - Query `profiles` table: `SELECT user_id WHERE user_id = session.user.id`
   - Si no existe: redirige a `/onboarding/step-1`
4. Si hay sesión Y perfil:
   - Retorna `{ user: session.user }`

**⚠️ Nota:** No hay `middleware.ts` en la raíz. Los guards se llaman manualmente en cada página protegida.

### Flujo Post-Auth (Default `/` y `next=` Solo para Rutas Protegidas)

**Archivo:** `app/login/page.tsx` (Client Component)

**Flujo:**
1. Usuario hace login
2. `lib/auth.ts` → `signIn()` → Supabase
3. Si éxito:
   - Lee `searchParams.next` (si existe y es ruta válida)
   - Si `next` existe: `router.push(next)`
   - Si `intent === 'roomies'` y no hay `next`: `router.push('/explore')`
   - Si `intent === 'listings'` y no hay `next`: `router.push('/listings')`
   - Si no hay `intent` ni `next`: `router.push('/')`

**⚠️ Seguridad:**
- `next` solo se usa si es ruta protegida (validado en `requireAuth`/`requireProfile`)
- No se permite `next=/login` o `next=/signup` (loop prevention)

### Lista de Rutas Protegidas Actuales

**Con `requireAuth` (solo sesión):**
- `/dashboard` → `app/dashboard/page.tsx` (L10)
- `/account` → `app/account/page.tsx` (L6)
- `/saved` → `app/saved/page.tsx` (L8)
- `/shortlist` → `app/shortlist/page.tsx` (L4)
- `/matches` → `app/matches/page.tsx` (L4)
- `/listings/new` → `app/listings/new/page.tsx` (L7)
- `/promote/profile` → `app/promote/profile/page.tsx` (L6)
- `/promote/listing/[id]` → `app/promote/listing/[id]/page.tsx` (L12)

**Con `requireProfile` (sesión + perfil):**
- `/explore` → `app/explore/page.tsx` (no usa guard explícito, pero verifica perfil para CTA)
- `/messages` → `app/messages/page.tsx` (L152)
- `/messages/[thread_id]` → `app/messages/[thread_id]/page.tsx` (L14)
- `/profiles/[user_id]` → `app/profiles/[user_id]/page.tsx` (L2, pero no se usa en el código actual)
- `/onboarding/step-2` → `app/onboarding/step-2/page.tsx` (L8)
- `/app` → `app/app/page.tsx` (L5)

**⚠️ Inconsistencia:**
- `/explore` no usa `requireProfile` explícitamente, pero debería (según lógica de negocio)
- `/profiles/[user_id]` importa `requireProfile` pero no lo usa

---

## 6) FEATURES POR MÓDULO

### GlobalSearchBar (Ubicación, location_id, Autocomplete, Clear Logic, Logo Event)

**Source of Truth:**
- `app/components/search/GlobalSearchBar.tsx` (912 líneas)
- `app/lib/search/clearLocation.ts` (helpers compartidos)
- `app/components/LogoLink.tsx` (dispara CustomEvent)

**Data Flow:**
1. **Input Header (L66, L69-91):**
   - Usuario escribe en input del header → `filters.city` se actualiza
   - Si `cityUserEdited === true` y `cityQuery.length >= 3`: debounce 300ms → `GET /api/geo/forward?q=...`

2. **Autocomplete (L130-178):**
   - `useEffect` escucha `cityUserEdited` y `cityQuery`
   - Fetch `/api/geo/forward` → resultados en `cityResults`
   - Usuario selecciona resultado → `handleSelectAutocompleteResult()` (L180-220)
   - `POST /api/locations/upsert` → obtiene `location_id`
   - Guarda `last_location_id`/`label` en `localStorage`
   - Navega con `location_id` en `searchParams`

3. **"Cerca de aquí" (L222-280):**
   - `handleUseCurrentLocation()` → `navigator.geolocation.getCurrentPosition()`
   - `GET /api/geo/reverse?lat=...&lng=...` → obtiene `place_id`, `label`, `city`
   - `POST /api/locations/upsert` → obtiene `location_id`
   - Guarda en `localStorage` y navega

4. **"Reciente" (L94-127):**
   - Al abrir dropdown, lee `last_location_id`/`label` de `localStorage`
   - Si existe, muestra sección "Reciente"
   - Al seleccionar: navega con `location_id`

5. **Clear Logic (L252-288, L290-320):**
   - `clearLocationFromUIAndPersistence()`: limpia `filters.city`, `selectedLocationId`, estados UI, `localStorage`, URL params
   - `handleClear()`: limpia TODO (filtros + ubicación + `localStorage`), navega a `pathname` actual
   - Logo click: dispara CustomEvent `'myroomie:clear-location'` → `GlobalSearchBar` escucha y llama `clearLocationFromUIAndPersistence()`

6. **Logo Event (L275-289):**
   - `useEffect` escucha `'myroomie:clear-location'` (disparado por `LogoLink`)
   - Llama `clearLocationFromUIAndPersistence()` cuando se dispara

**Line Map:**
- L1-65: Imports, props, state inicial
- L66-91: Sincronización con `searchParams`
- L94-127: Leer `localStorage` al abrir dropdown
- L130-178: Autocomplete debounced
- L180-220: Seleccionar resultado de autocomplete
- L222-280: "Cerca de aquí" (geolocation)
- L252-288: `clearLocationFromUIAndPersistence()`
- L290-320: `handleClear()`
- L275-289: Escuchar CustomEvent del logo
- L322-400: `handleSearch()` (navegar con filtros)
- L400+: Render JSX

**Dependencias:**
- `/api/geo/forward` (Mapbox autocomplete)
- `/api/geo/reverse` (Mapbox reverse geocoding)
- `/api/locations/upsert` (canonical locations)
- `localStorage` (persistencia de ubicación)

### Explore (Roomies) (FilterChips, ResultHeader, RoomieCard, Query/Filter)

**Source of Truth:**
- `app/explore/page.tsx` (263 líneas, Server Component)
- `app/explore/FilterChips.tsx` (Client Component)
- `app/explore/ResultHeader.tsx` (Client Component)
- `app/components/roomies/RoomieCard.tsx` (Client Component)

**Data Flow:**
1. **URL Params → Query (L29-57):**
   - Lee `searchParams.q`, `searchParams.location_id`, `searchParams.city`
   - Si `location_id` existe: resuelve en `public.locations` → obtiene `city` (o `label` como fallback)
   - Lee chips: `searchParams.featured`, `searchParams.pets`, `searchParams.no_smoker`, `searchParams.calm`

2. **Query Building (L74-120):**
   - Base: `supabase.from('profiles').select(...)`
   - Si `q`: `query.ilike('display_name', '%q%')`
   - Si `city`: `query.ilike('city', '%city%')`
   - Si `featured === '1'`: `query.not('featured_until', 'is', null).gt('featured_until', 'now()')`
   - Si `pets === '1'`: `query.eq('pets', true)`
   - Si `no_smoker === '1'`: `query.eq('smoker', false)`
   - Si `calm === '1'`: `query.eq('parties', false).eq('cleanliness', 3)`

3. **Featured Ordering (L120-130):**
   - Ordena por `featured_until DESC` (featured primero), luego `created_at DESC`

4. **Render (L140-263):**
   - Header con título, descripción, CTA "Crear mi perfil" (solo si `!hasMyProfile`)
   - Divider sutil
   - `FilterChips` (chips booleanos)
   - `ResultHeader` (count + badges activos + botón "Limpiar")
   - Grid de `RoomieCard` (o `EmptyState` si no hay resultados)

**Line Map:**
- L1-27: Imports, verificar si usuario tiene perfil
- L29-57: Extraer y resolver `searchParams` (location_id → city)
- L59-72: Extraer parámetros de chips y legacy
- L74-120: Construir query con filtros
- L120-130: Ordenar por featured
- L132-138: Ejecutar query
- L140-263: Render JSX

**Dependencias:**
- `GlobalSearchBar` (para aplicar filtros vía URL)
- `public.profiles` (tabla)
- `public.locations` (resolver `location_id`)

### Listings (Filters y Query)

**Source of Truth:**
- `app/listings/page.tsx` (218 líneas, Server Component)
- `app/listings/Filters.tsx` (Client Component, no usado actualmente?)
- `app/components/listings/ListingCard.tsx` (Client Component)

**Data Flow:**
1. **URL Params → Query (L16-48):**
   - Lee `searchParams.q`, `searchParams.location_id`, `searchParams.city`, `searchParams.zone`, `searchParams.listing_type`, `searchParams.min`, `searchParams.max`, `searchParams.sort`
   - Si `location_id` existe: resuelve en `public.locations` → obtiene `city`

2. **Query Building (L50-110):**
   - Base: `supabase.from('listings').select(...)`
   - Si `q`: `query.or('title.ilike.%q%,description.ilike.%q%')`
   - Si `city`: `query.ilike('city', '%city%')`
   - Si `zone`: `query.ilike('zone', '%zone%')`
   - Si `listing_type !== 'all'`: `query.eq('listing_type', listing_type)`
   - Si `min`: `query.gte('price_mxn', min)`
   - Si `max`: `query.lte('price_mxn', max)`

3. **Sorting (L110-120):**
   - Si `sort === 'price_asc'`: `query.order('price_mxn', { ascending: true })`
   - Si `sort === 'price_desc'`: `query.order('price_mxn', { ascending: false })`
   - Si `sort === 'recent'`: `query.order('created_at', { ascending: false })`
   - Featured primero: `query.order('featured_until', { ascending: false, nullsFirst: false })`

4. **Render (L140-218):**
   - Header con título, descripción, botón "Publicar anuncio"
   - Grid de `ListingCard` (o `EmptyState` si no hay resultados)

**Line Map:**
- L1-14: Imports, obtener sesión
- L16-48: Extraer y resolver `searchParams`
- L50-110: Construir query con filtros
- L110-120: Aplicar sorting
- L122-138: Ejecutar query
- L140-218: Render JSX

**Dependencias:**
- `GlobalSearchBar` (para aplicar filtros vía URL)
- `public.listings` (tabla)
- `public.locations` (resolver `location_id`)

**⚠️ Inconsistencia:**
- `app/listings/Filters.tsx` existe pero no se usa en `app/listings/page.tsx` (filtros vienen de `GlobalSearchBar`)

### Messages (Threads, Read Status, RLS/thread_participants)

**Source of Truth:**
- `app/messages/page.tsx` (330 líneas, Server Component)
- `app/messages/ThreadPanel.tsx` (Server Component)
- `app/messages/[thread_id]/page.tsx` (173 líneas, Server Component)
- `app/messages/actions.ts` (Server Actions)

**Data Flow:**
1. **Inbox (`/messages`) (L152-330):**
   - `requireProfileOrRedirect()` → verifica sesión + perfil
   - Query threads: `SELECT threads.*, profiles (other user), messages (last message), thread_participants (last_read_at)`
   - Filtra threads donde `user1_id = currentUserId OR user2_id = currentUserId`
   - Calcula `isUnread`: `lastMessage.sender_id !== currentProfileId AND lastMsgAt > lastReadAt`
   - Render lista de threads con `ThreadRow` (componente interno)

2. **Thread Individual (`/messages/[thread_id]`) (L14-173):**
   - `requireProfileOrRedirect()` → verifica sesión + perfil
   - Query thread: `SELECT threads.*, profiles (both users)`
   - Query messages: `SELECT messages.* WHERE thread_id = ... ORDER BY created_at ASC`
   - Render mensajes con burbujas (sender vs receiver)
   - `MessageForm` para enviar nuevo mensaje

3. **Server Actions (`app/messages/actions.ts`):**
   - `createThread()`: Crea thread si no existe (usa unique index para prevenir duplicados)
   - `sendMessage()`: Inserta mensaje en thread (RLS valida que sender sea participant)

**Line Map (`app/messages/page.tsx`):**
- L1-12: Imports, componente interno `ThreadRow`
- L152-170: `requireProfileOrRedirect()`
- L172-250: Query threads con last message y last read
- L252-330: Render JSX (lista de threads)

**Line Map (`app/messages/[thread_id]/page.tsx`):**
- L1-13: Imports, `requireProfileOrRedirect()`
- L15-80: Query thread y messages
- L82-173: Render JSX (mensajes + form)

**RLS:**
- `threads`: SELECT solo si `auth.uid() = user1_id OR auth.uid() = user2_id`
- `messages`: SELECT solo si `auth.uid()` es participant del thread (via EXISTS subquery)
- `messages`: INSERT solo si `sender_id = auth.uid()` AND `auth.uid()` es participant

**Dependencias:**
- `public.threads` (tabla)
- `public.messages` (tabla)
- `public.profiles` (para obtener datos del otro usuario)
- `public.thread_participants` (para `last_read_at`, si se usa)

### Home (Hero, Destacados, CTA, Footer)

**Source of Truth:**
- `app/page.tsx` (216 líneas, Server Component)
- `app/components/home/HomeFeaturedListings.tsx` (Server Component)
- `app/components/home/HomeFeaturedProfiles.tsx` (Server Component)

**Data Flow:**
1. **Hero (L10-33):**
   - Título, descripción, CTAs ("Buscar roomie" → `/explore`, "Publicar anuncio" → `/listings/new`)

2. **Featured Listings (L36):**
   - `HomeFeaturedListings` → query `listings` con `featured_until > NOW()`, ordena por `featured_until DESC`, limita 6
   - Render carousel con `FeaturedCarousel`

3. **Featured Profiles (L39):**
   - `HomeFeaturedProfiles` → query `profiles` con `featured_until > NOW()`, ordena por `featured_until DESC`, limita 6
   - Render grid con `RoomieCard`

4. **How It Works (L42-166):**
   - Sección estática con pasos

5. **Trust Panel (L168-216):**
   - `TrustPanel` → sección de confianza

**Line Map:**
- L1-4: Imports
- L6-33: Hero section
- L36: Featured Listings
- L39: Featured Profiles
- L42-166: How It Works
- L168-216: Trust Panel

**Dependencias:**
- `public.listings` (featured listings)
- `public.profiles` (featured profiles)

---

## 7) UI SYSTEM / TOKENS / ESTILO

### Tokens Tailwind Usados

**Definidos en `tailwind.config.ts` (L11-19):**
- `brand`: `#FF7A18` (naranja principal)
- `brandHover`: `#E96A0F` (hover state)
- `brandSoft`: `#FFF1E8` (fondo suave)
- `brandBorder`: `#FFD6BD` (borde suave)
- `brandText`: `#A63C00` (texto oscuro)
- `ink`: `#111827` (texto principal)
- `muted`: `#6B7280` (texto secundario)

**Uso en Código:**
- `bg-brand`, `hover:bg-brandHover`: Botones primarios
- `text-brand`: Texto de marca
- `ring-brand/30`, `focus:ring-brand/30`: Focus rings
- `border-brand/30`, `border-brand/20`: Bordes sutiles
- `bg-brand/10`: Fondos suaves

### Dónde Hay Hardcodes

**Archivos con `#FF7A18` o `#E86F14` (20+ archivos):**
- `app/messages/ThreadPanel.tsx` (L100, L114, L158)
- `app/messages/[thread_id]/page.tsx` (L47, L86, L101, L111, L145)
- `app/messages/[thread_id]/MessageForm.tsx` (L67, L76)
- `app/messages/InboxSearch.tsx` (L9)
- `app/listings/page.tsx` (L158)
- `app/listings/Filters.tsx` (L81, L95, L109, L121, L140, L155, L167, L179)
- `app/explore/Filters.tsx` (L65, L79, L93, L101)
- `app/explore/page.tsx` (L192) - ⚠️ Parcial: usa `bg-brand` pero `focus:ring-[#FF7A18]/30`
- `app/signup/intent/page.tsx` (L25, L39, L58, L82, L96)
- `app/promote/listing/[id]/PromoteButton.tsx` (L51)
- `app/promote/listing/[id]/page.tsx` (L47, L83, L97, L111, L139, L153, L167, L184, L186, L200, L214, L228, L249, L256)
- `app/promote/profile/page.tsx` (L32, L46, L60, L88, L102, L116, L133, L135, L149, L163, L177, L198)
- `app/promote/profile/PromoteButton.tsx` (L50)
- `app/onboarding/step-2/OnboardingLifestyleForm.tsx` (L136, L221)
- `app/onboarding/step-1/OnboardingForm.tsx` (L171, L189, L207, L223, L255)
- `app/components/TrustPanel.tsx` (L127)
- `app/account/AccountForm.tsx` (L174, L190, L210)
- `app/dashboard/page.tsx` (L61)
- `app/components/UserMenu.tsx` (L69)
- `app/profiles/[user_id]/page.tsx` (L39, L65, L80, L88, L123)
- `app/profiles/[user_id]/ContactButton.tsx` (L46)
- `app/explore/ContactButton.tsx` (L47)
- `app/debug/supabase/SupabaseDebugClient.tsx` (L43)

**Archivos Ya Migrados a Tokens:**
- ✅ `app/login/page.tsx` (completado en FASE 1)
- ✅ `app/signup/page.tsx` (completado en FASE 1)
- ✅ `app/explore/FilterChips.tsx` (completado en FASE 1)
- ✅ `app/explore/ResultHeader.tsx` (completado en FASE 1B)
- ✅ `app/messages/page.tsx` (completado en FASE 1B, pero hay algunos hardcodes restantes)

### Componentes Duplicados

**No hay duplicación significativa de componentes**, pero hay:
- `app/components/home/HomeSearchBar.tsx` (legacy? no se usa en `app/page.tsx`)
- `app/listings/Filters.tsx` (no se usa, filtros vienen de `GlobalSearchBar`)

### Estándares de Accesibilidad

**✅ Implementado:**
- `focus-visible:ring-2 focus-visible:ring-brand/30`: Focus rings consistentes
- `aria-label` en botones sin texto (ej: botón "+" en header)
- `aria-pressed` en `FilterChips` (chips toggle)
- `role="button"` en elementos clickeables sin semántica

**⚠️ Mejorable:**
- Algunos links externos no tienen `rel="noopener"`
- Falta `alt` descriptivo en algunas imágenes
- Algunos formularios no tienen `aria-describedby` para errores

---

## 8) SEGURIDAD Y PRODUCCIÓN

### Env Vars Usadas (Qué Requiere Vercel)

**Requeridas:**
- `NEXT_PUBLIC_SUPABASE_URL` (público, usado en client y server)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (público, usado en client y server)
- `SUPABASE_SERVICE_ROLE_KEY` (secreto, solo en server, usado en `/api/locations/upsert`)
- `MAPBOX_TOKEN` (secreto, solo en server, usado en `/api/geo/*`)

**⚠️ Nota:** `NEXT_PUBLIC_*` se expone al cliente. `SUPABASE_SERVICE_ROLE_KEY` y `MAPBOX_TOKEN` NO deben tener prefijo `NEXT_PUBLIC_` (correcto).

### Endpoints Públicos (Rate Limiting Recomendado)

**Endpoints sin autenticación:**
- `GET /api/geo/forward` (autocomplete Mapbox)
- `GET /api/geo/reverse` (reverse geocoding Mapbox)
- `POST /api/locations/upsert` (upsert locations, usa service role)

**⚠️ Riesgo:**
- Sin rate limiting, posibles abusos → costos de Mapbox
- `POST /api/locations/upsert` puede ser spameado (aunque tiene validaciones estrictas)

**Recomendación:**
- Agregar rate limiting con Vercel Edge Config o Upstash
- Limitar a 10 requests/min por IP para `/api/geo/*`
- Limitar a 5 requests/min por IP para `/api/locations/upsert`

### Posibles Leaks (NEXT_PUBLIC Mal Usado)

**✅ Correcto:**
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son públicos por diseño (necesarios en client)
- `SUPABASE_SERVICE_ROLE_KEY` y `MAPBOX_TOKEN` NO tienen prefijo `NEXT_PUBLIC_` (correcto)

**⚠️ Verificar:**
- No hay otros secrets con prefijo `NEXT_PUBLIC_` en el código

### Validaciones de Inputs Server-Side

**✅ Implementado:**
- `/api/locations/upsert`: Validaciones estrictas (provider, place_id, label, lat/lng ranges, prefixes)
- `/api/geo/forward`: Validación de `q` (string, length)
- `/api/geo/reverse`: Validación de `lat`/`lng` (number, ranges)

**⚠️ Mejorable:**
- Formularios en `app/onboarding/*` y `app/listings/new/*` tienen validación client-side, pero falta validación server-side en `actions.ts`
- `searchParams` en páginas no siempre se validan (ej: `parseInt` sin validar `isNaN`)

### Logging Mínimo Recomendado

**Actual:**
- Solo `console.error` en algunos lugares (ej: `app/api/locations/upsert/route.ts` L152, `app/explore/page.tsx` L54)

**Recomendación:**
- Agregar logging estructurado con niveles (info, warn, error)
- Usar servicio de logging (ej: Vercel Logs, Sentry) para producción
- Loggear: errores de API, fallos de autenticación, queries lentos

---

## 9) HALLAZGOS (Lista Priorizada)

### Issues

1. **🔴 ALTO: Hardcoded Colors (20+ archivos)**
   - **Evidencia:** Ver sección 7
   - **Fix:** Fase 1 (continuar migración a tokens)

2. **🟡 MEDIO: Rate Limiting en API Routes**
   - **Evidencia:** `app/api/geo/forward/route.ts`, `app/api/geo/reverse/route.ts`, `app/api/locations/upsert/route.ts`
   - **Fix:** Fase 2 (agregar rate limiting)

3. **🟡 MEDIO: Duplicación de Lógica de Filtros**
   - **Evidencia:** `app/explore/page.tsx` (L74-120) vs `app/listings/page.tsx` (L50-100)
   - **Fix:** Fase 3 (extraer helper compartido)

4. **🟡 MEDIO: TypeScript `any` en Filtros**
   - **Evidencia:** `app/components/search/GlobalSearchBar.tsx` (L46, L69-91)
   - **Fix:** Fase 4 (tipar filtros)

5. **🟢 BAJO: Falta `loading.tsx` en `/listings`**
   - **Evidencia:** `app/listings/page.tsx` no tiene `loading.tsx`
   - **Fix:** Fase 7 (agregar skeleton)

6. **🟢 BAJO: Validación Server-Side en Formularios**
   - **Evidencia:** `app/onboarding/*/actions.ts`, `app/listings/new/actions.ts`
   - **Fix:** Fase 8 (agregar validación)

7. **🟢 BAJO: Error Handling Inconsistente**
   - **Evidencia:** Algunos errores de API no se muestran en UI
   - **Fix:** Fase 5 (unificar error handling)

8. **🟢 BAJO: Featured Logic Duplicada**
   - **Evidencia:** `app/explore/page.tsx` (L120-130) vs `app/listings/page.tsx` (L100-110)
   - **Fix:** Fase 6 (extraer helper)

9. **🟢 BAJO: Logging Mínimo**
   - **Evidencia:** Solo `console.error` en algunos lugares
   - **Fix:** Fase 9 (agregar logging estructurado)

10. **🟢 BAJO: Falta Documentación de API Routes**
    - **Evidencia:** `app/api/*/route.ts` sin JSDoc
    - **Fix:** Fase 10 (agregar JSDoc)

### Bugs

1. **🟡 MEDIO: `/explore` no usa `requireProfile` explícitamente**
   - **Evidencia:** `app/explore/page.tsx` verifica perfil para CTA, pero no redirige si no hay perfil
   - **Fix:** Agregar `requireProfileOrRedirect()` al inicio de la función

2. **🟢 BAJO: `app/listings/Filters.tsx` no se usa**
   - **Evidencia:** Archivo existe pero no se importa en `app/listings/page.tsx`
   - **Fix:** Eliminar archivo o integrarlo

3. **🟢 BAJO: `app/components/home/HomeSearchBar.tsx` no se usa**
   - **Evidencia:** Archivo existe pero no se importa en `app/page.tsx`
   - **Fix:** Eliminar archivo o integrarlo

### Tech Debt

1. **🟡 MEDIO: `lib/supabaseClient.ts` está deprecated**
   - **Evidencia:** Archivo existe pero no se usa (debería usarse `lib/supabase/*`)
   - **Fix:** Eliminar archivo

2. **🟢 BAJO: Algunos `searchParams` no se validan correctamente**
   - **Evidencia:** `parseInt` sin validar `isNaN` en algunos lugares
   - **Fix:** Agregar validación

---

## 10) PLAN POR FASES

### Fase 1: Eliminar Hardcoded Colors Restantes
**Objetivo:** Migrar todos los archivos que usan `#FF7A18`/`#E86F14` a tokens Tailwind.

**Archivos (20+):**
- `app/messages/*` (3 archivos)
- `app/listings/*` (2 archivos)
- `app/onboarding/*` (2 archivos)
- `app/promote/*` (3 archivos)
- `app/account/*` (1 archivo)
- `app/profiles/*` (2 archivos)
- `app/components/*` (2 archivos)
- `app/dashboard/*` (1 archivo)
- `app/debug/*` (1 archivo)

**Riesgo:** Bajo (solo reemplazo de clases)

**Edge Cases:**
- Algunos archivos usan `bg-[#FF7A18]` en avatares/placeholders (verificar que `bg-brand` funcione igual)
- Algunos usan `text-[#FF7A18]` en links (usar `text-brand`)

**Cómo Probar:**
1. Reemplazar todos los hardcodes
2. `npm run build` debe pasar
3. `grep -r "#FF7A18\|#E86F14" app/` debe retornar 0 resultados
4. Probar UI manualmente: botones, links, focus rings deben verse igual

**Definition of Done:**
- ✅ 0 instancias de `#FF7A18` o `#E86F14` en `app/`
- ✅ Build pasa sin errores
- ✅ UI se ve igual (solo cambió el código, no el diseño)

---

### Fase 2: Rate Limiting en API Routes
**Objetivo:** Agregar rate limiting a `/api/geo/*` y `/api/locations/upsert` para prevenir abusos.

**Archivos (1-2):**
- Crear `lib/rateLimit.ts` (helper)
- Modificar `app/api/geo/forward/route.ts`
- Modificar `app/api/geo/reverse/route.ts`
- Modificar `app/api/locations/upsert/route.ts`

**Riesgo:** Medio (requiere config de Vercel/Upstash)

**Edge Cases:**
- Rate limiting debe funcionar en edge runtime
- No debe bloquear usuarios legítimos
- Debe retornar 429 con mensaje claro

**Cómo Probar:**
1. Hacer 11 requests rápidos a `/api/geo/forward` → 11vo debe retornar 429
2. Esperar 1 minuto → siguiente request debe pasar
3. Verificar logs en Vercel

**Definition of Done:**
- ✅ Rate limiting implementado (10 req/min para geo, 5 req/min para locations)
- ✅ Retorna 429 con `{ error: "Rate limit exceeded" }`
- ✅ No bloquea usuarios legítimos

---

### Fase 3: Extraer Helper Compartido para Filtros
**Objetivo:** Eliminar duplicación de lógica de filtros entre `explore` y `listings`.

**Archivos (3):**
- Crear `lib/filters/buildQuery.ts` (helper genérico)
- Modificar `app/explore/page.tsx` (usar helper)
- Modificar `app/listings/page.tsx` (usar helper)

**Riesgo:** Medio (refactor requiere testing extensivo)

**Edge Cases:**
- Helper debe soportar ambos modos (roomies/listings)
- Debe mantener compatibilidad con filtros legacy
- Debe preservar featured ordering

**Cómo Probar:**
1. Probar todos los filtros en `/explore` (chips, city, q, location_id)
2. Probar todos los filtros en `/listings` (city, zone, type, min/max, sort)
3. Verificar que featured ordering funciona igual
4. Verificar que location_id resolution funciona igual

**Definition of Done:**
- ✅ Helper compartido creado
- ✅ Duplicación eliminada
- ✅ Todos los filtros funcionan igual que antes
- ✅ Tests manuales pasan

---

### Fase 4: Tipar Filtros en GlobalSearchBar
**Objetivo:** Eliminar `any` types en filtros, crear tipos `RoomiesFilters` y `ListingsFilters`.

**Archivos (1):**
- Modificar `app/components/search/GlobalSearchBar.tsx`

**Riesgo:** Bajo (solo tipado)

**Edge Cases:**
- Tipos deben ser compatibles con `searchParams` (string | string[] | undefined)
- Debe mantener compatibilidad con legacy params

**Cómo Probar:**
1. `npm run build` debe pasar sin errores de TypeScript
2. Probar filtros en UI (debe funcionar igual)

**Definition of Done:**
- ✅ Tipos `RoomiesFilters` y `ListingsFilters` creados
- ✅ 0 `any` types en filtros
- ✅ Build pasa sin errores

---

### Fase 5: Unificar Error Handling
**Objetivo:** Crear componente `ErrorToast` y usarlo consistentemente en toda la app.

**Archivos (2-3):**
- Crear `app/components/ui/ErrorToast.tsx`
- Modificar `app/components/search/GlobalSearchBar.tsx` (usar ErrorToast)
- Modificar otros componentes que muestran errores

**Riesgo:** Bajo

**Edge Cases:**
- ErrorToast debe ser dismissible
- Debe funcionar en Server y Client Components (si es necesario)

**Cómo Probar:**
1. Simular errores en API (ej: desconectar internet, invalidar token)
2. Verificar que errores se muestran consistentemente
3. Verificar que son dismissibles

**Definition of Done:**
- ✅ ErrorToast creado y usado consistentemente
- ✅ Errores de API se muestran en UI
- ✅ UX mejorada (errores claros y accionables)

---

### Fase 6: Extraer Helper para Featured Ordering
**Objetivo:** Eliminar duplicación de lógica de ordenamiento por featured.

**Archivos (3):**
- Crear `lib/featured/orderByFeatured.ts`
- Modificar `app/explore/page.tsx` (usar helper)
- Modificar `app/listings/page.tsx` (usar helper)

**Riesgo:** Bajo

**Edge Cases:**
- Helper debe soportar ambos tipos (profiles/listings)
- Debe preservar ordenamiento secundario (created_at)

**Cómo Probar:**
1. Verificar que featured items aparecen primero en `/explore`
2. Verificar que featured items aparecen primero en `/listings`
3. Verificar que ordenamiento secundario funciona igual

**Definition of Done:**
- ✅ Helper compartido creado
- ✅ Duplicación eliminada
- ✅ Featured ordering funciona igual que antes

---

### Fase 7: Agregar `loading.tsx` a `/listings`
**Objetivo:** Mejorar UX agregando skeleton loading a `/listings`.

**Archivos (1):**
- Crear `app/listings/loading.tsx`

**Riesgo:** Bajo

**Edge Cases:**
- Skeleton debe coincidir con el layout de `ListingCard`
- Debe funcionar en mobile y desktop

**Cómo Probar:**
1. Navegar a `/listings` con throttling de red (DevTools)
2. Verificar que skeleton aparece durante loading
3. Verificar que se ve bien en mobile y desktop

**Definition of Done:**
- ✅ `loading.tsx` creado
- ✅ Skeleton se ve bien
- ✅ UX mejorada

---

### Fase 8: Validación Server-Side en Formularios
**Objetivo:** Agregar validación server-side en `actions.ts` de formularios.

**Archivos (3-4):**
- Modificar `app/onboarding/step-1/actions.ts`
- Modificar `app/onboarding/step-2/actions.ts`
- Modificar `app/listings/new/actions.ts`
- Modificar `app/account/actions.ts` (si aplica)

**Riesgo:** Medio (requiere testing extensivo)

**Edge Cases:**
- Validación debe ser igual a client-side (o más estricta)
- Debe retornar errores en formato consistente
- Debe prevenir SQL injection (aunque Supabase ya lo hace)

**Cómo Probar:**
1. Enviar formularios con datos inválidos (bypass client-side validation)
2. Verificar que server rechaza y retorna errores
3. Verificar que errores se muestran en UI

**Definition of Done:**
- ✅ Validación server-side implementada
- ✅ Errores se muestran consistentemente
- ✅ Seguridad mejorada

---

### Fase 9: Agregar Logging Estructurado
**Objetivo:** Implementar logging estructurado con niveles para debugging en producción.

**Archivos (2-3):**
- Crear `lib/logger.ts` (helper)
- Modificar `app/api/*/route.ts` (usar logger)
- Modificar otros lugares críticos (auth, queries lentos)

**Riesgo:** Bajo

**Edge Cases:**
- Logger debe funcionar en edge runtime
- No debe exponer secrets en logs
- Debe integrarse con Vercel Logs o Sentry

**Cómo Probar:**
1. Generar errores y verificar que se loggean
2. Verificar logs en Vercel dashboard
3. Verificar que no se exponen secrets

**Definition of Done:**
- ✅ Logger estructurado implementado
- ✅ Logs se ven en Vercel/Sentry
- ✅ No se exponen secrets

---

### Fase 10: Documentación de API Routes
**Objetivo:** Agregar JSDoc a todos los endpoints de API.

**Archivos (3):**
- Modificar `app/api/geo/forward/route.ts`
- Modificar `app/api/geo/reverse/route.ts`
- Modificar `app/api/locations/upsert/route.ts`

**Riesgo:** Bajo

**Edge Cases:**
- JSDoc debe ser claro y completo
- Debe incluir ejemplos de request/response

**Cómo Probar:**
1. Verificar que JSDoc se ve en IDE
2. Verificar que es claro y útil

**Definition of Done:**
- ✅ Todos los endpoints tienen JSDoc
- ✅ Documentación es clara y completa

---

## CHANGELOG DEL REPORTE

### Qué Revisé

1. ✅ **Estructura del Repo:** Recorrí todas las carpetas principales (`app/`, `lib/`, `sql/`)
2. ✅ **Rutas Next.js:** Identifiqué todas las rutas y sus `page.tsx`/`layout.tsx`
3. ✅ **Componentes:** Mapeé todos los componentes en `app/components/`
4. ✅ **Supabase:** Revisé clientes SSR/client, service role usage, RLS policies
5. ✅ **Auth Flow:** Revisé `requireAuth`/`requireProfile`, redirects post-auth
6. ✅ **Features Principales:** Analicé GlobalSearchBar, Explore, Listings, Messages, Home
7. ✅ **UI System:** Revisé tokens Tailwind, hardcoded colors, accesibilidad
8. ✅ **Seguridad:** Revisé env vars, rate limiting, validaciones, posibles leaks
9. ✅ **API Routes:** Revisé `/api/geo/*` y `/api/locations/*`
10. ✅ **SQL Migrations:** Revisé todas las migraciones y políticas RLS

### Qué No Pude Revisar y Por Qué

1. **❌ Middleware de Next.js:** No existe `middleware.ts` en la raíz (los guards se llaman manualmente)
2. **❌ Tests:** No hay carpeta `__tests__/` o `tests/` (no hay tests automatizados)
3. **❌ CI/CD:** No hay `.github/workflows/` o config de CI (no se revisó pipeline)
4. **❌ Database Schema Completo:** Solo revisé SQL en `sql/`, pero puede haber tablas creadas manualmente en Supabase (ej: `listings` no tiene SQL en repo)
5. **❌ Environment Variables en Producción:** Solo revisé qué vars se usan, no sus valores reales (no tengo acceso a Vercel dashboard)
6. **❌ Performance Metrics:** No revisé métricas de performance (Lighthouse, Core Web Vitals)
7. **❌ Analytics:** No revisé si hay analytics implementado (Google Analytics, etc.)
8. **❌ Error Tracking:** No revisé si hay error tracking (Sentry, etc.) más allá de `console.error`

### Notas Adicionales

- **Auditoría Basada en Código:** Esta auditoría se basa únicamente en el código fuente disponible. No se revisó:
  - Configuración de Vercel (rate limiting, edge config, etc.)
  - Configuración de Supabase (policies adicionales, triggers, funciones)
  - Logs de producción
  - Métricas de uso

- **Recomendación:** Para una auditoría completa de producción, se recomienda:
  1. Revisar logs de Vercel/Supabase
  2. Revisar métricas de performance
  3. Revisar configuración de infraestructura
  4. Revisar políticas de seguridad adicionales

---

**Fin del Reporte**

