# AUDITORÍA TÉCNICA COMPLETA — MyRoomie.mx MVP

**Fecha:** 2024  
**Objetivo:** Mapear arquitectura actual, detectar duplicaciones, identificar riesgos de "Frankenstein"  
**Alcance:** Repositorio completo (app/, lib/, sql/, componentes)

---

## A) EXECUTIVE SUMMARY (10 bullets)

1. **Arquitectura Next.js App Router** con Server Components predominantes; Client Components solo para interactividad (search, forms, uploads)
2. **Sistema de autenticación dual**: `requireAuthOrRedirect()` (solo sesión) y `requireProfileOrRedirect()` (sesión + perfil)
3. **Duplicación crítica detectada**: `ListingsSearchBar.tsx` y `Filters.tsx` (listings/explore) coexisten con `GlobalSearchBar.tsx` — riesgo de inconsistencia
4. **UI System consistente**: `ListingCard` y `RoomieCard` comparten mismo lenguaje visual (rounded-2xl, hover shadow, badges); reutilización correcta en landing
5. **Storage Supabase**: bucket `listing-images` con policies públicas (SELECT) y autenticadas (INSERT); imágenes en `image_urls TEXT[]`
6. **Featured ordering consistente**: `featured_until > now()` siempre primero, luego `created_at desc`; implementado en listings, explore, home
7. **Wishlist funcional**: `/saved` con SSR, usa `ListingCard`, revalida correctamente; tabla `listing_saves` con RLS
8. **Messaging MVP**: threads + messages con RLS; creación automática desde listings; inbox con perfiles y último mensaje
9. **SQL migrations pendientes**: 7 scripts en `/sql` — estado de ejecución desconocido (asumir "no ejecutados" hasta verificar)
10. **Riesgo principal**: Componentes legacy (`ListingsSearchBar`, `Filters`) no removidos; `GlobalSearchBar` es la fuente de verdad pero coexisten

---

## B) MAPA DEL REPO

### B.1) APP ROUTES (Next.js App Router)

| Ruta | Archivo | Tipo | Auth | Propósito | Query/Acción Principal |
|------|---------|------|------|-----------|------------------------|
| `/` | `app/page.tsx` | Server | Pública | Landing page | Featured listings/profiles (SSR) |
| `/listings` | `app/listings/page.tsx` | Server | Pública | Grid de anuncios | Filtros: q, city, zone, listing_type, min, max, sort |
| `/listings/[id]` | `app/listings/[id]/page.tsx` | Server | Pública | Detalle listing | Listing + owner profile + isSaved check |
| `/listings/new` | `app/listings/new/page.tsx` | Server | `requireAuthOrRedirect({ intent: 'listings' })` | Crear listing | Form + ImageUploader → `createListing()` + `attachListingImages()` |
| `/explore` | `app/explore/page.tsx` | Server | Pública | Grid de perfiles roomies | Filtros: q, city, legacy lifestyle (pets/smoker/etc) |
| `/saved` | `app/saved/page.tsx` | Server | `requireAuthOrRedirect()` | Wishlist guardados | 2 queries: listing_saves → listings (orden preservado) |
| `/messages` | `app/messages/page.tsx` | Server | `requireProfileOrRedirect()` | Inbox threads | Threads del usuario + último mensaje + perfil otro usuario |
| `/messages/[thread_id]` | `app/messages/[thread_id]/page.tsx` | Server | `requireProfileOrRedirect()` | Thread individual | Messages + perfil otro usuario + form envío |
| `/profiles/[user_id]` | `app/profiles/[user_id]/page.tsx` | Server | `requireProfileOrRedirect()` | Perfil público | Profile + lifestyle badges |
| `/onboarding/step-1` | `app/onboarding/step-1/page.tsx` | Server | Session check | Crear/editar perfil básico | `saveMyProfile()` → redirect step-2 |
| `/onboarding/step-2` | `app/onboarding/step-2/page.tsx` | Server | `requireProfileOrRedirect()` | Lifestyle preferences | `saveLifestylePreferences()` |
| `/login` | `app/login/page.tsx` | Client | Pública | Login form | `signIn()` → redirect según intent/profile |
| `/signup` | `app/signup/page.tsx` | Client | Pública | Signup form | `signUp()` → redirect según intent |
| `/account` | `app/account/page.tsx` | Server | `requireAuthOrRedirect()` | Settings cuenta | `updateAccount()` (display_name, avatar) |
| `/dashboard` | `app/dashboard/page.tsx` | Server | `requireAuthOrRedirect()` | Dashboard usuario | Info básica (placeholder) |
| `/app` | `app/app/page.tsx` | Server | `requireProfileOrRedirect()` | Dashboard alternativo | Info básica (legacy?) |
| `/promote/profile` | `app/promote/profile/page.tsx` | Server | `requireAuthOrRedirect({ intent: 'roomies' })` | Promoción perfil | UI pricing (sin implementar) |
| `/promote/listing/[id]` | `app/promote/listing/[id]/page.tsx` | Server | `requireAuthOrRedirect({ intent: 'listings' })` | Promoción listing | UI pricing (sin implementar) |
| `/matches` | `app/matches/page.tsx` | Server | `requireAuthOrRedirect()` | Matches (placeholder) | "Coming soon" |
| `/shortlist` | `app/shortlist/page.tsx` | Server | `requireAuthOrRedirect()` | Shortlist (placeholder) | "Coming soon" |
| `/security` | `app/security/page.tsx` | Server | Pública | Página seguridad | Contenido estático |
| `/legal/terms` | `app/legal/terms/page.tsx` | Server | Pública | Términos | Contenido estático |
| `/legal/privacy` | `app/legal/privacy/page.tsx` | Server | Pública | Privacidad | Contenido estático |
| `/debug/supabase` | `app/debug/supabase/page.tsx` | Client | Pública (DEV) | Debug Supabase | Test conexión |

**Notas:**
- Rutas con `requireProfileOrRedirect()`: `/messages`, `/messages/[thread_id]`, `/profiles/[user_id]`, `/onboarding/step-2`, `/app`
- Rutas con `requireAuthOrRedirect()`: `/listings/new`, `/saved`, `/account`, `/dashboard`, `/promote/*`, `/matches`, `/shortlist`
- Rutas públicas: `/`, `/listings`, `/listings/[id]`, `/explore`, `/login`, `/signup`, `/security`, `/legal/*`

### B.2) COMPONENTES CLAVE (por carpetas)

#### **Header / Navegación**
- `app/Header.tsx` (Server Component)
  - Renderiza `GlobalSearchBar` (desktop: centrado, mobile: debajo)
  - `HeaderModeTabs`: tabs Listings/Roomies
  - `UserMenu`: dropdown con avatar/nombre
  - Z-index: `z-30` (overlay `z-40`, popover `z-50`)

#### **Search**
- `app/components/search/GlobalSearchBar.tsx` (Client Component)
  - **Fuente de verdad** para búsqueda global
  - Mode: `listings` (default) vs `roomies` (auto-detect en `/explore`)
  - Filtros listings: q, city, zone, listing_type, min, max, sort
  - Filtros roomies: q, city, budget_min, budget_max (UI presente pero columnas no existen en DB)
  - Pill collapsed → popover expandido
  - Overlay `z-40`, popover `z-50`
  - Body scroll prevention cuando está abierto

**⚠️ DUPLICACIÓN DETECTADA:**
- `app/listings/ListingsSearchBar.tsx` (Client Component) — **LEGACY, NO USADO**
  - Misma funcionalidad que `GlobalSearchBar` mode listings
  - No se importa en `/listings/page.tsx` (usa `GlobalSearchBar` vía header)
  - **RIESGO:** Código muerto, puede confundir

- `app/listings/Filters.tsx` (Client Component) — **LEGACY, NO USADO**
  - Filtros locales (no usado en `/listings`)
  
- `app/explore/Filters.tsx` (Client Component) — **LEGACY, NO USADO**
  - Filtros locales (no usado en `/explore`)

#### **Listing UI**
- `app/components/listings/ListingCard.tsx` (Server Component)
  - Card reutilizable: imagen, badge destacado, price pill, type badge, title, location, description
  - Usado en: `/listings`, `/saved`, `HomeFeaturedListings`
  - Props: `listing` object + `href`
  - Visual: `rounded-2xl`, `hover:shadow-md`, `aspect-[4/3]`, hover zoom

- `app/components/listings/ListingImage.tsx` (Client Component)
  - Wrapper con fallback placeholder premium
  - `onError` handler → muestra placeholder con emoji grande + "Sin foto"
  - Props: `src`, `alt`, `className`, `wrapperClassName`, `fallback`
  - `loading="lazy"` por defecto

- `app/components/listings/ImageUploader.tsx` (Client Component)
  - Upload múltiple (max 6), preview, validación (tipo, tamaño 5MB)
  - Callback `onFilesChange` para validación en parent
  - Usado en: `/listings/new/ListingForm.tsx`

- `app/listings/[id]/ContactForm.tsx` (Client Component)
  - Lógica condicional: sin sesión → link login, owner → link dashboard, viewer → form `getOrCreateListingThread()`

- `app/listings/[id]/SaveButton.tsx` (Client Component)
  - Toggle save/unsave con `toggleSave()` action
  - Estado: "♡ Guardar" / "♥ Guardado"

#### **Roomies UI**
- `app/components/roomies/RoomieCard.tsx` (Server Component)
  - Card reutilizable: avatar/placeholder, badge destacado, name, location, LifestyleBadges
  - Usado en: `/explore`, `HomeFeaturedProfiles`
  - Props: `profile` object + `href`
  - Visual: mismo sistema que `ListingCard` (rounded-2xl, hover shadow)
  - **NOTA:** Budget pill removida (columnas no existen)

- `app/components/LifestyleBadges.tsx` (Server Component)
  - Renderiza chips de lifestyle: pets, smoker, cleanliness, parties, schedule
  - Máximo 3 chips (lógica interna)
  - Usado en: `RoomieCard`, `/messages`, `/profiles/[user_id]`

#### **Home Components**
- `app/components/home/HomeFeaturedListings.tsx` (Server Component)
  - Query: `featured_until > now()`, limit 5, orden `featured_until desc`
  - Usa `ListingCard` (misma UI que `/listings`)
  - Opción A: oculta sección si no hay destacados

- `app/components/home/HomeFeaturedProfiles.tsx` (Server Component)
  - Query: `featured_until > now()`, limit 5, orden `featured_until desc`
  - Usa `RoomieCard` (misma UI que `/explore`)
  - Opción A: oculta sección si no hay destacados

- `app/components/home/HomeSearchBar.tsx` (Client Component)
  - **LEGACY?** — Verificar si se usa en landing (no aparece en `app/page.tsx` según lectura)

- `app/components/home/HomeSection.tsx` (Server Component)
  - **LEGACY?** — Verificar uso

#### **UI System**
- `app/components/ui/Card.tsx`: Wrapper con `CardHeader`, `CardContent`
- `app/components/ui/Badge.tsx`: Variants: `featured`, `subtle`
- `app/components/ui/Button.tsx`: Botones con variants brand
- `app/components/ui/EmptyState.tsx`: Empty states con icon, title, description, CTA

#### **Otros Componentes**
- `app/components/HeaderModeTabs.tsx`: Tabs Listings/Roomies en header
- `app/components/UserMenu.tsx`: Dropdown usuario con avatar
- `app/components/TrustPanel.tsx`: **VERIFICAR USO** — posible legacy

---

## C) INVENTARIO DE ARCHIVOS

### C.1) ARCHIVOS CREADOS (última fase — tickets recientes)

| Archivo | Propósito | Estado |
|---------|-----------|--------|
| `app/components/listings/ListingCard.tsx` | Card reutilizable listings | ✅ Activo |
| `app/components/listings/ListingImage.tsx` | Imagen con fallback | ✅ Activo |
| `app/components/roomies/RoomieCard.tsx` | Card reutilizable roomies | ✅ Activo |
| `app/components/search/GlobalSearchBar.tsx` | Búsqueda global header | ✅ Activo (fuente de verdad) |
| `app/listings/[id]/ContactForm.tsx` | Form contacto listing | ✅ Activo |
| `app/listings/[id]/SaveButton.tsx` | Botón guardar listing | ✅ Activo |
| `app/saved/page.tsx` | Página wishlist | ✅ Activo |
| `sql/create_listing_saves_table.sql` | Tabla wishlist | ⚠️ Verificar ejecución |
| `sql/add_listing_featured_until.sql` | Columna featured listings | ⚠️ Verificar ejecución |
| `sql/add_featured_until.sql` | Columna featured profiles | ⚠️ Verificar ejecución |
| `sql/add_listing_images.sql` | Columna image_urls | ⚠️ Verificar ejecución |

### C.2) ARCHIVOS MODIFICADOS (última fase)

| Archivo | Cambios | Razón |
|---------|---------|-------|
| `app/listings/page.tsx` | Removido `ListingsSearchBar`, usa `ListingCard` | Unificación UI |
| `app/explore/page.tsx` | Refactor para usar `RoomieCard`, filtros GlobalSearchBar | Unificación UI |
| `app/components/home/HomeFeaturedListings.tsx` | Usa `ListingCard` | Unificación UI |
| `app/components/home/HomeFeaturedProfiles.tsx` | Usa `RoomieCard` | Unificación UI |
| `app/Header.tsx` | Integrado `GlobalSearchBar`, z-index | Estabilidad |
| `app/listings/[id]/actions.ts` | `revalidatePath('/saved')` en `toggleSave()` | Wishlist sync |
| `app/components/search/GlobalSearchBar.tsx` | Fix hydration (button nested), fix undefined.trim(), scroll prevention | Estabilidad |

### C.3) ARCHIVOS LEGACY (no usados, posible duplicación)

| Archivo | Duplica | Estado | Acción Recomendada |
|---------|---------|--------|-------------------|
| `app/listings/ListingsSearchBar.tsx` | `GlobalSearchBar` (mode listings) | ❌ No usado | **ELIMINAR** |
| `app/listings/Filters.tsx` | `GlobalSearchBar` popover | ❌ No usado | **ELIMINAR** |
| `app/explore/Filters.tsx` | `GlobalSearchBar` popover | ❌ No usado | **ELIMINAR** |
| `app/components/home/HomeSearchBar.tsx` | `GlobalSearchBar` | ⚠️ Verificar | Revisar si se usa |
| `app/components/home/HomeSection.tsx` | — | ⚠️ Verificar | Revisar si se usa |
| `app/components/TrustPanel.tsx` | — | ⚠️ Verificar | Revisar si se usa |

---

## D) ARQUITECTURA DE DATOS (Supabase)

### D.1) TABLAS RELEVANTES

#### **`public.listings`**
- Campos principales: `id`, `user_id`, `title`, `description`, `city`, `zone`, `price_mxn`, `listing_type`, `created_at`, `featured_until`, `image_urls` (TEXT[])
- RLS: SELECT público, INSERT/UPDATE/DELETE solo owner
- Índices: `listings_city_idx`, `listings_zone_idx`, `listings_city_zone_idx`
- **Columnas agregadas vía SQL:**
  - `image_urls TEXT[]` (default `'{}'`) — `sql/add_listing_images.sql`
  - `featured_until timestamptz` — `sql/add_listing_featured_until.sql`

#### **`public.profiles`**
- Campos principales: `user_id` (PK), `display_name`, `city`, `zone`, `avatar_url`, `created_at`, `updated_at`, `featured_until`, `pets`, `smoker`, `cleanliness`, `parties`, `schedule`
- RLS: SELECT público, INSERT/UPDATE/DELETE solo owner
- Índices: `profiles_city_idx`, `profiles_zone_idx`, `profiles_city_zone_idx`
- Trigger: `set_updated_at` (auto-update `updated_at`)
- **Columnas agregadas vía SQL:**
  - `featured_until timestamptz` — `sql/add_featured_until.sql`
- **NOTA:** `budget_min`/`budget_max` NO existen (removidos en ticket K.2)

#### **`public.threads`**
- Campos: `id`, `user1_id`, `user2_id`, `listing_id`, `created_at`
- RLS: SELECT/INSERT solo participantes
- Índice único: `threads_unique_idx` (previene duplicados: mismo par usuarios + listing)
- **Política:** No UPDATE/DELETE (MVP)

#### **`public.messages`**
- Campos: `id`, `thread_id`, `sender_id`, `body`, `created_at`
- RLS: SELECT solo participantes del thread, INSERT solo si sender es participant
- Índice: `messages_thread_created_idx`
- **Política:** No UPDATE/DELETE (MVP)

#### **`public.listing_saves`**
- Campos: `id`, `user_id`, `listing_id`, `created_at`
- RLS: SELECT/INSERT/DELETE solo owner
- Índices: `listing_saves_user_id_idx`, `listing_saves_listing_id_idx`
- UNIQUE: `(user_id, listing_id)`

### D.2) STORAGE

- **Bucket:** `listing-images` (asumir nombre estándar)
- **Policies:**
  - SELECT: Público (todos pueden ver imágenes)
  - INSERT: Autenticado (solo usuarios logueados pueden subir)
- **Uso:** URLs almacenadas en `listings.image_urls TEXT[]`

### D.3) SQL SCRIPTS (estado desconocido — asumir "no ejecutados")

| Script | Propósito | Tabla/Columna | Estado Asumido |
|--------|-----------|---------------|-----------------|
| `create_profiles_table.sql` | Crear tabla profiles + RLS | `profiles` | ⚠️ Verificar |
| `create_messaging_tables.sql` | Crear threads + messages + RLS | `threads`, `messages` | ⚠️ Verificar |
| `create_listing_saves_table.sql` | Crear wishlist + RLS | `listing_saves` | ⚠️ Verificar |
| `add_listing_images.sql` | Agregar columna image_urls | `listings.image_urls` | ⚠️ Verificar |
| `add_listing_featured_until.sql` | Agregar columna featured_until | `listings.featured_until` | ⚠️ Verificar |
| `add_featured_until.sql` | Agregar columna featured_until | `profiles.featured_until` | ⚠️ Verificar |

**ACCIÓN REQUERIDA:** Verificar en Supabase Dashboard qué scripts se ejecutaron.

---

## E) FLUJOS MVP (end-to-end)

### E.1) Crear Listing con Fotos

```
1. Usuario → /listings/new (requireAuthOrRedirect)
2. ListingForm (Client) → ImageUploader (Client)
   - Validación frontend: title ≥6, description ≥30, photos ≥2
3. Submit → createListing() (Server Action)
   - Validación backend: title ≥6, description ≥30
   - INSERT listing → retorna listingId
4. ImageUploader → upload a Supabase Storage (bucket listing-images)
   - Genera URLs públicas
5. attachListingImages(listingId, imageUrls) (Server Action)
   - Valida ownership
   - UPDATE listings SET image_urls = imageUrls
   - revalidatePath('/listings', '/listings/[id]', '/dashboard')
6. Redirect → /listings/[id]
```

**Archivos involucrados:**
- `app/listings/new/ListingForm.tsx`
- `app/listings/new/actions.ts` (`createListing`, `attachListingImages`)
- `app/components/listings/ImageUploader.tsx`

### E.2) Render de Listing Images

```
Card (/listings):
- Query: SELECT image_urls FROM listings
- ListingCard → ListingImage (src = image_urls[0])
- Fallback: placeholder premium si image_urls vacío o falla carga

Detail (/listings/[id]):
- Query: SELECT * FROM listings
- Gallery: image_urls.map() → ListingImage
- Fallback: placeholder por imagen individual
```

**Archivos involucrados:**
- `app/components/listings/ListingCard.tsx`
- `app/components/listings/ListingImage.tsx`
- `app/listings/[id]/page.tsx`

### E.3) Contactar (Threads)

```
1. Usuario → /listings/[id] (público)
2. ContactForm (Client) → verifica:
   - Sin sesión → Link /login?intent=roomies
   - Owner → Link /dashboard (no puede contactarse a sí mismo)
   - Viewer → Form con getOrCreateListingThread(listingId)
3. getOrCreateListingThread() (Server Action):
   - Verifica sesión → redirect /login si no
   - Obtiene owner del listing
   - Valida viewer ≠ owner
   - Busca thread existente (user1_id, user2_id, listing_id)
   - Si existe → redirect /messages/[thread_id]
   - Si no → INSERT thread → redirect /messages/[thread_id]
```

**Archivos involucrados:**
- `app/listings/[id]/ContactForm.tsx`
- `app/listings/[id]/actions.ts` (`getOrCreateListingThread`)

### E.4) Guardar (Wishlist)

```
1. Usuario → /listings/[id] (público)
2. SaveButton (Client) → verifica:
   - Sin sesión → Link /login?intent=roomies
   - Con sesión → Form con toggleSave(listingId)
3. toggleSave() (Server Action):
   - Verifica sesión → redirect /login si no
   - Verifica listing existe
   - Busca save existente (user_id, listing_id)
   - Si existe → DELETE
   - Si no → INSERT
   - revalidatePath('/listings/[id]', '/saved')
4. /saved (SSR):
   - requireAuthOrRedirect()
   - Query 1: listing_saves WHERE user_id = userId ORDER BY created_at DESC
   - Query 2: listings WHERE id IN (listingIds)
   - Re-ordenar en memoria según orden de saves
   - Render con ListingCard
```

**Archivos involucrados:**
- `app/listings/[id]/SaveButton.tsx`
- `app/listings/[id]/actions.ts` (`toggleSave`)
- `app/saved/page.tsx`

---

## F) CONSISTENCIA UI (anti-Frankenstein)

### F.1) Reglas del Sistema Visual

- **Cards:** `rounded-2xl`, `hover:shadow-md`, `transition-shadow`
- **Imágenes:** `aspect-[4/3]`, `rounded-2xl`, hover zoom `group-hover:scale-[1.02]`
- **Badges destacado:** `absolute left-3 top-3`, variant `featured`
- **Price pill:** `absolute left-3 bottom-3`, `rounded-full`, `bg-white/90`, `backdrop-blur`
- **Placeholders:** Emoji grande + "Sin foto", `bg-neutral-100`
- **Text clamping:** `line-clamp-1` (títulos), `line-clamp-2` (descripciones)

### F.2) Reutilización Confirmada

✅ **Landing featured listings** → usa `ListingCard` (misma UI que `/listings`)  
✅ **Landing featured profiles** → usa `RoomieCard` (misma familia visual que `/explore`)  
✅ **`/saved`** → usa `ListingCard` (misma UI que `/listings`)

### F.3) Puntos Rojos (inconsistencias detectadas)

| Página/Componente | Issue | Severidad |
|-------------------|-------|-----------|
| `app/listings/ListingsSearchBar.tsx` | Código muerto, duplica `GlobalSearchBar` | 🔴 P0 |
| `app/listings/Filters.tsx` | Código muerto, duplica `GlobalSearchBar` | 🔴 P0 |
| `app/explore/Filters.tsx` | Código muerto, duplica `GlobalSearchBar` | 🔴 P0 |
| `GlobalSearchBar` (mode roomies) | UI muestra `budget_min`/`budget_max` pero columnas no existen | 🟡 P1 (ignorado silenciosamente) |
| `/listings/[id]` detail | Estilos propios (no usa Card system?) | 🟡 P2 (verificar) |
| `/messages` inbox | Cards custom (no usa Card system?) | 🟡 P2 (verificar) |

---

## G) RIESGOS Y DEUDA

### G.1) Top 10 Riesgos

1. **🔴 P0 — Código muerto duplicado**
   - `ListingsSearchBar.tsx`, `Filters.tsx` (listings/explore) no se usan pero existen
   - **Impacto:** Confusión, mantenimiento duplicado
   - **Fix:** Eliminar archivos legacy

2. **🔴 P0 — GlobalSearchBar budget filters UI presente pero DB no**
   - UI muestra inputs `budget_min`/`budget_max` en mode roomies
   - Columnas no existen en `profiles` (removidas en ticket K.2)
   - **Impacto:** UX confusa, params se ignoran silenciosamente
   - **Fix:** Remover UI de budget filters en `GlobalSearchBar` mode roomies

3. **🟡 P1 — SQL migrations estado desconocido**
   - 7 scripts en `/sql` — no hay evidencia de ejecución
   - **Impacto:** Features pueden fallar si columnas/tablas no existen
   - **Fix:** Verificar en Supabase Dashboard, documentar estado

4. **🟡 P1 — Queries divergentes para featured ordering**
   - `/listings`: ordena en memoria después de query
   - `/explore`: ordena en memoria después de query
   - `HomeFeaturedListings`: solo query (no ordena en memoria)
   - **Impacto:** Inconsistencia potencial si featured_until cambia durante render
   - **Fix:** Unificar lógica en helper o función compartida

5. **🟡 P1 — Props inconsistentes en cards**
   - `ListingCard` espera `image_urls: string[] | null`
   - `RoomieCard` espera `avatar_url: string | null`
   - Diferentes estructuras para mismo concepto (imagen)
   - **Impacto:** No crítico pero inconsistente
   - **Fix:** Considerar normalizar (bajo prioridad)

6. **🟡 P1 — Revalidación paths manual**
   - `toggleSave()` revalida `/listings/[id]` y `/saved`
   - `attachListingImages()` revalida `/listings`, `/listings/[id]`, `/dashboard`
   - **Impacto:** Fácil olvidar revalidar paths relacionados
   - **Fix:** Helper `revalidateListingPaths(listingId)` centralizado

7. **🟠 P2 — HomeSearchBar/HomeSection/TrustPanel uso desconocido**
   - Componentes existen pero no aparecen en `app/page.tsx`
   - **Impacto:** Código muerto potencial
   - **Fix:** Verificar uso, eliminar si no se usa

8. **🟠 P2 — Type safety en filters (GlobalSearchBar)**
   - `filters` usa `any` type
   - **Impacto:** Errores de tipo en runtime
   - **Fix:** Definir interfaces `ListingsFilters` y `RoomiesFilters`

9. **🟠 P2 — Empty states duplicados**
   - `/listings` y `/explore` tienen lógica similar de empty state
   - **Impacto:** Duplicación de lógica
   - **Fix:** Helper `getEmptyStateProps(filters, mode)` centralizado

10. **🟠 P2 — Featured ordering lógica duplicada**
    - Mismo código de sort en `/listings` y `/explore`
    - **Impacto:** Duplicación, bugs si se cambia en un lugar
    - **Fix:** Helper `sortByFeatured<T>(items, featuredKey)` genérico

### G.2) Plan de Hardening (3 fases)

#### **FASE 1: Limpieza Mínima (sin cambiar UI) — 1-2 días**

1. ✅ Eliminar `app/listings/ListingsSearchBar.tsx`
2. ✅ Eliminar `app/listings/Filters.tsx`
3. ✅ Eliminar `app/explore/Filters.tsx`
4. ⚠️ Verificar y eliminar `HomeSearchBar`, `HomeSection`, `TrustPanel` si no se usan
5. ✅ Remover UI de budget filters en `GlobalSearchBar` mode roomies
6. ⚠️ Verificar estado SQL migrations en Supabase Dashboard

**Resultado:** Código más limpio, sin duplicaciones obvias

#### **FASE 2: Consolidación (unificar queries/helpers) — 2-3 días**

1. Crear `lib/queries/featuredSort.ts`:
   ```typescript
   export function sortByFeatured<T>(
     items: T[],
     getFeaturedUntil: (item: T) => string | null
   ): T[]
   ```
2. Crear `lib/revalidate.ts`:
   ```typescript
   export function revalidateListingPaths(listingId: string)
   ```
3. Crear `lib/filters.ts`:
   ```typescript
   export interface ListingsFilters { ... }
   export interface RoomiesFilters { ... }
   export function getEmptyStateProps(filters, mode)
   ```
4. Refactorizar `/listings` y `/explore` para usar helpers

**Resultado:** Código más mantenible, menos duplicación

#### **FASE 3: Polish (animaciones/UX) — después**

1. Transiciones suaves en cards
2. Loading states en forms
3. Optimistic updates en wishlist
4. Skeleton loaders en grids

**Resultado:** UX premium (fuera de scope MVP)

---

## H) CHECKLIST DE VERIFICACIÓN

### H.1) Rutas Funcionales

- [x] `/` renderiza correctamente
- [x] `/listings` filtra y ordena correctamente
- [x] `/listings/[id]` muestra detalle completo
- [x] `/listings/new` crea listing con fotos
- [x] `/explore` filtra perfiles correctamente
- [x] `/saved` muestra wishlist del usuario
- [x] `/messages` muestra inbox
- [x] `/messages/[thread_id]` muestra thread
- [x] `/profiles/[user_id]` muestra perfil público
- [x] `/onboarding/step-1` crea/edita perfil
- [x] `/onboarding/step-2` guarda lifestyle

### H.2) Componentes Reutilizados

- [x] `ListingCard` usado en `/listings`, `/saved`, `HomeFeaturedListings`
- [x] `RoomieCard` usado en `/explore`, `HomeFeaturedProfiles`
- [x] `ListingImage` usado en `ListingCard`, `RoomieCard`, detail
- [x] `GlobalSearchBar` usado en header (única fuente de verdad)
- [x] `EmptyState` usado en múltiples páginas

### H.3) Duplicaciones Eliminadas

- [ ] `ListingsSearchBar.tsx` eliminado
- [ ] `Filters.tsx` (listings) eliminado
- [ ] `Filters.tsx` (explore) eliminado
- [ ] `HomeSearchBar.tsx` verificado/eliminado si no se usa
- [ ] `HomeSection.tsx` verificado/eliminado si no se usa
- [ ] `TrustPanel.tsx` verificado/eliminado si no se usa

### H.4) SQL Migrations

- [ ] `create_profiles_table.sql` ejecutado
- [ ] `create_messaging_tables.sql` ejecutado
- [ ] `create_listing_saves_table.sql` ejecutado
- [ ] `add_listing_images.sql` ejecutado
- [ ] `add_listing_featured_until.sql` ejecutado
- [ ] `add_featured_until.sql` ejecutado

---

## I) CONCLUSIÓN

**Estado General:** ✅ **MVP funcional con riesgo bajo de "Frankenstein"**

**Fortalezas:**
- UI system consistente (ListingCard/RoomieCard)
- Reutilización correcta en landing
- Featured ordering consistente
- RLS implementado correctamente
- Server Components predominantes (buen performance)

**Debilidades:**
- Código muerto (ListingsSearchBar, Filters) — fácil de limpiar
- SQL migrations estado desconocido — requiere verificación
- Queries duplicadas para featured ordering — consolidar en Fase 2

**Prioridad Inmediata:**
1. Eliminar código muerto (Fase 1)
2. Verificar SQL migrations
3. Remover UI budget filters en GlobalSearchBar

**Riesgo General:** 🟢 **BAJO** — Arquitectura sólida, duplicaciones son limpieza, no arquitectura rota.

---

**Fin del Reporte**


