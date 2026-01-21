# MyRoomie.mx — Technical Audit

**Version:** 2.0 (Post Design Sprint)  
**Last Updated:** After Design Sprint A/B/C  
**Purpose:** Current state audit for development reference

---

## 1. RESUMEN EJECUTIVO

### Producto
MyRoomie.mx es una plataforma de búsqueda de roomies y anuncios de renta construida con Next.js App Router y Supabase.

### Dos Flujos Principales

**Roomies Flow:**
- Usuarios crean perfiles con preferencias de estilo de vida
- Búsqueda en `/explore` con filtros por ciudad, zona y lifestyle
- Requiere perfil completo (onboarding step-1 + step-2)
- Promoción de perfil disponible (`/promote/profile`)

**Listings Flow:**
- Usuarios publican anuncios de renta (cuartos/depas/casas)
- Búsqueda en `/listings` con filtros por tipo, precio, ubicación
- NO requiere perfil completo (solo autenticación)
- Promoción de listing disponible (`/promote/listing/[id]`)

### Estado Actual
- ✅ Autenticación y onboarding completo
- ✅ Sistema de perfiles y listings funcional
- ✅ Mensajería básica (threads + messages)
- ✅ Sistema de promoción (featured) sin pagos
- ✅ Design system unificado (Card/Badge/Button/EmptyState)
- ⚠️ Sin pagos (Stripe no integrado)
- ⚠️ Sin fotos en listings
- ⚠️ Sin realtime (mensajes requieren refresh)
- ⚠️ Sin paginación (límite hard de 50 items)

---

## 2. STACK Y REGLAS CRÍTICAS

### Stack
- **Framework:** Next.js 14.2.0 (App Router)
- **React:** 18.3.0
- **TypeScript:** 5.3.3
- **Styling:** Tailwind CSS 3.4.1
- **Backend:** Supabase (Auth + PostgreSQL + Storage)
- **SSR:** `@supabase/ssr` para cookies server-side

### Reglas Críticas (NO TOCAR)

1. **RLS Policies:** Nunca modificar sin revisión de seguridad. Son la última línea de defensa.
2. **Server Components:** Header y la mayoría de páginas son Server Components. No convertir a Client sin necesidad.
3. **SSR Cookies:** Los handlers de cookies en `lib/supabase/server.ts` deben permanecer como están.
4. **Intent System:** El sistema `?intent=roomies|listings` está integrado. No cambiar sin actualizar todos los redirects.
5. **Extension Logic:** La lógica de extensión de promociones (extiende si activa, inicia desde now si no) es crítica para monetización.

### Patrones que Deben Preservarse

- **Server Actions:** Todas las mutaciones usan Server Actions (`'use server'`)
- **Guards:** `requireAuthOrRedirect()` para sesión, `requireProfileOrRedirect()` para perfil
- **Client Components:** Solo cuando necesario (forms, interactividad, hooks)
- **Error Handling:** Server Actions retornan `{ data, error }` o `{ error }`

---

## 3. ARQUITECTURA DE ACCESO

### requireProfileOrRedirect()

**Archivo:** `lib/requireProfile.ts`

**Qué hace:**
1. Verifica sesión (`supabase.auth.getSession()`)
2. Si no hay sesión → `redirect('/login?intent=roomies')`
3. Si hay sesión pero no perfil → `redirect('/onboarding/step-1')`
4. Si hay sesión Y perfil → retorna `{ user: session.user }`

**Rutas que lo usan:**
- `/explore` — requiere perfil para explorar roomies
- `/profiles/[user_id]` — requiere perfil para ver perfiles
- `/messages` — requiere perfil para mensajería
- `/messages/[thread_id]` — requiere perfil para threads
- `/onboarding/step-2` — requiere perfil para completar lifestyle

### requireAuthOrRedirect()

**Archivo:** `lib/requireAuth.ts`

**Qué hace:**
1. Verifica sesión (`supabase.auth.getSession()`)
2. Si no hay sesión:
   - Si `options?.intent` existe → `redirect('/login?intent=${intent}')`
   - Si no → `redirect('/login')`
3. Si hay sesión → retorna `{ user: session.user }`

**Rutas que lo usan:**
- `/listings/new` — requiere auth (NO requiere perfil)
- `/dashboard` — requiere auth
- `/account` — requiere auth
- `/promote/profile` — requiere auth
- `/promote/listing/[id]` — requiere auth

### Intent System

**Login Intent (`?intent=roomies|listings`):**
- Preserva el intent del usuario cuando se redirige a login
- Después de login exitoso, redirige según:
  - Sin perfil + `intent=listings` → `/listings/new`
  - Sin perfil + `intent=roomies` → `/onboarding/step-1`
  - Sin perfil + `intent=null` → `/signup/intent`
  - Con perfil + `intent=listings` → `/listings`
  - Con perfil + `intent=roomies/null` → `/explore`

**Signup Intent (`/signup/intent`):**
- Página de selección de flujo principal
- Si no hay sesión: muestra cards con links a `/login?intent=...`
- Si hay sesión: muestra cards con links directos a onboarding/listings

**Preservación de Intent:**
- `requireProfileOrRedirect()` siempre redirige con `?intent=roomies`
- `requireAuthOrRedirect({ intent: 'listings' })` preserva intent en login

---

## 4. ROUTING MAP

| Ruta | Tipo | Guard | Qué Muestra / Qué Hace |
|------|------|-------|------------------------|
| `/` | Server | None | Landing page pública |
| `/explore` | Server | `requireProfileOrRedirect()` | Lista de perfiles roomies con filtros |
| `/listings` | Server | None | Lista de anuncios públicos con filtros |
| `/listings/new` | Server | `requireAuthOrRedirect({ intent: 'listings' })` | Formulario crear listing |
| `/listings/[id]` | Server | None | Detalle de listing + botón contactar |
| `/profiles/[user_id]` | Server | None | Perfil público + listings del usuario |
| `/messages` | Server | `requireProfileOrRedirect()` | Inbox (lista de threads) |
| `/messages/[thread_id]` | Server | `requireProfileOrRedirect()` | Thread individual + form enviar mensaje |
| `/dashboard` | Server | `requireAuthOrRedirect()` | Dashboard usuario (perfil + listings + verifications) |
| `/account` | Server | `requireAuthOrRedirect()` | Settings (display_name + avatar) |
| `/onboarding/step-1` | Server | Session check | Formulario perfil básico |
| `/onboarding/step-2` | Server | `requireProfileOrRedirect()` | Formulario lifestyle preferences |
| `/promote/profile` | Server | `requireAuthOrRedirect({ intent: 'roomies' })` | UI promoción perfil (pricing cards) |
| `/promote/listing/[id]` | Server | `requireAuthOrRedirect({ intent: 'listings' })` | UI promoción listing (pricing cards) |
| `/login` | Client | None | Formulario login con intent handling |
| `/signup` | Client | None | Formulario registro |
| `/signup/intent` | Server | None | Selección de flujo (Roomies vs Listings) |
| `/shortlist` | Server | `requireAuthOrRedirect()` | Placeholder (Coming soon) |
| `/matches` | Server | `requireAuthOrRedirect()` | Placeholder (Coming soon) |
| `/legal/privacy` | Server | None | Privacy policy |
| `/legal/terms` | Server | None | Terms of service |

---

## 5. UI SYSTEM (Design Sprint A/B/C)

### Componentes Base (`app/components/ui/`)

#### Card.tsx
**Componentes exportados:**
- `Card` — wrapper principal
- `CardHeader` — header con padding
- `CardContent` — contenido con padding

**Estilos:**
- Card: `rounded-xl border border-neutral-200 bg-white shadow-sm`
- CardHeader: `p-4`
- CardContent: `p-4 pt-0`

**Dónde se usa:**
- `app/explore/page.tsx` — cards de perfiles
- `app/listings/page.tsx` — cards de listings
- `app/dashboard/page.tsx` — cards de dashboard
- `app/messages/page.tsx` — cards de threads

#### Badge.tsx
**Props:**
- `variant?: 'default' | 'subtle' | 'featured'`
- `children: ReactNode`
- `className?: string`

**Variantes:**
- `default`: `border-neutral-200 text-neutral-700 bg-white`
- `subtle`: `border-transparent bg-neutral-100 text-neutral-700`
- `featured`: `border-orange-200 bg-orange-50 text-orange-700`

**Dónde se usa:**
- `app/explore/page.tsx` — badge "Destacado" en perfiles
- `app/listings/page.tsx` — badges tipo y destacado
- `app/dashboard/page.tsx` — badges "Active" y "Destacado"

#### Button.tsx
**Props:**
- `variant?: 'primary' | 'secondary' | 'ghost'`
- `size?: 'sm' | 'md'`
- `loading?: boolean`
- `disabled?: boolean`

**Variantes:**
- `primary`: `bg-orange-600 text-white hover:bg-orange-700`
- `secondary`: `border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50`
- `ghost`: `bg-transparent text-neutral-700 hover:bg-neutral-100`

**Sizes:**
- `sm`: `h-9 px-3 text-sm`
- `md`: `h-10 px-4 text-sm`

**Dónde se usa:**
- `app/dashboard/page.tsx` — botones de verificaciones (disabled)
- Nota: En dashboard, los Links usan clases inline en lugar de Button component

#### EmptyState.tsx
**Props:**
- `title: string` (requerido)
- `description?: string`
- `ctaLabel?: string`
- `ctaHref?: string`
- `icon?: 'search' | 'messages' | 'listings' | 'profile'`
- `variant?: 'default' | 'compact'`

**Variantes:**
- `default`: `p-8`, icono `text-3xl`, título `text-lg`
- `compact`: `p-5`, icono `text-2xl`, título `text-base`

**Iconos (emojis):**
- `search`: 🔎
- `messages`: 💬
- `listings`: 🏠
- `profile`: 👤

**Dónde se usa:**
- `app/explore/page.tsx` — cuando no hay perfiles
- `app/listings/page.tsx` — cuando no hay listings
- `app/messages/page.tsx` — cuando no hay threads
- `app/dashboard/page.tsx` — cuando no hay perfil o listings (variant compact)

### Reglas de Estilo (Design System)

**Colores:**
- Brand orange: `orange-600` (primary), `orange-700` (hover)
- Text: `neutral-900` (primary), `neutral-700` (secondary), `neutral-600` (muted), `neutral-500` (meta)
- Borders: `neutral-200`
- Backgrounds: `white`, `neutral-50` (subtle)

**Spacing:**
- Container padding: `px-4 md:px-8`
- Grid gaps: `gap-4 md:gap-6`
- Card padding: `p-4` (header), `p-4 pt-0` (content)

**Tipografía:**
- Page titles: `text-2xl font-semibold tracking-tight`
- Card titles: `text-lg font-medium`
- Meta text: `text-xs text-neutral-500`

**Borders/Radius:**
- Cards: `rounded-xl`
- Buttons: `rounded-lg`
- Badges: `rounded-full`

**Focus States:**
- Links clickables: `focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2`
- Aplicado en: cards de perfiles, listings, threads

---

## 6. HEADER & NAVIGATION (Design Sprint B)

### Header.tsx (Server Component)

**Estructura:**
- Wrapper: `h-16 border-b border-neutral-200 bg-white`
- Contenedor: `mx-auto flex h-16 items-center justify-between gap-4 px-4 md:px-8`
- Logo: `text-xl font-semibold tracking-tight text-neutral-900 hover:text-neutral-700`

**Datos que obtiene:**
- Sesión: `supabase.auth.getSession()`
- Perfil (si hay sesión): `profiles.display_name, avatar_url`

**Render condicional:**
- Sin sesión: HeaderModeTabs + links Login/Signup
- Con sesión: HeaderModeTabs + link Messages + UserMenu

### HeaderModeTabs.tsx (Client Component)

**Props:**
- `userId?: string`
- `hasProfile?: boolean`

**Lógica:**
- Detecta mode desde `searchParams.get('mode')` o infiere de `pathname`
- Solo visible en `/explore` o `/listings`
- `buildHref()` preserva todos los query params excepto `mode`

**UI (Design Sprint B):**
- Contenedor tabs: `inline-flex items-center rounded-xl border border-neutral-200 bg-neutral-50 p-1`
- Tab base: `rounded-lg px-3 py-1.5 text-sm font-medium transition-colors`
- Tab inactive: `text-neutral-600 hover:text-neutral-900`
- Tab active: `bg-white text-neutral-900 shadow-sm`

**CTA Contextual:**
- Listings mode: "Crear listing" → `/listings/new`
- Roomies mode:
  - Con perfil: "Ver mi perfil" → `/profiles/${userId}`
  - Sin perfil: "Crear perfil roomie" → `/onboarding/step-1`
- Estilo: `inline-flex h-10 items-center justify-center rounded-lg bg-orange-600 px-4 text-sm font-medium text-white hover:bg-orange-700`

### UserMenu.tsx (Client Component)

**Props:**
- `displayName: string`
- `avatarUrl: string | null`
- `userId: string`
- `initial: string`

**UI (Design Sprint B):**
- Avatar button: `ring-1 ring-neutral-200 hover:ring-neutral-300 transition`
- Dropdown: `absolute right-0 mt-2 w-56 rounded-xl border border-neutral-200 bg-white p-2 shadow-lg`
- Items: `rounded-lg px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900 transition`
- Separador: `my-1 border-t border-neutral-200`
- Logout: `text-neutral-700 hover:bg-neutral-50` (sin rojo agresivo)

**Items:**
- Dashboard → `/dashboard`
- Inbox → `/messages`
- Shortlist → `/shortlist` (placeholder)
- Matches → `/matches` (placeholder)
- Account → `/account`
- Log out → `logout()` server action

---

## 7. DATA LAYER (Supabase)

### Tablas

#### profiles
**Columnas clave:**
- `user_id` (UUID, PK, FK → auth.users)
- `display_name`, `city`, `zone`, `avatar_url`
- `pets`, `smoker`, `cleanliness`, `parties`, `schedule` (lifestyle)
- `featured_until` (TIMESTAMPTZ, nullable) — **monetización**
- `created_at`, `updated_at`

**RLS:**
- SELECT: Público
- INSERT/UPDATE/DELETE: Owner only

#### listings
**Columnas clave:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → auth.users)
- `title`, `description`, `city`, `zone`
- `price_mxn` (INTEGER, nullable)
- `listing_type` ('room' | 'roommate')
- `featured_until` (TIMESTAMPTZ, nullable) — **monetización**
- `created_at`

**RLS:**
- SELECT: Público
- INSERT/UPDATE/DELETE: Owner only

#### threads
**Columnas clave:**
- `id` (UUID, PK)
- `user1_id`, `user2_id` (UUID, FK → auth.users)
- `listing_id` (UUID, nullable, FK → listings)
- `created_at`

**RLS:**
- SELECT/INSERT: Participants only
- UPDATE/DELETE: Denied (MVP)

#### messages
**Columnas clave:**
- `id` (UUID, PK)
- `thread_id` (UUID, FK → threads)
- `sender_id` (UUID, FK → auth.users)
- `body` (TEXT)
- `created_at`

**RLS:**
- SELECT: Thread participants only
- INSERT: Sender must be participant
- UPDATE/DELETE: Denied (MVP)

### Storage

**Bucket:** `avatars`
**Path:** `{user_id}/avatar.jpg`
**Access:** Public URLs via `getPublicUrl()`

---

## 8. MONETIZACIÓN (Promote System)

### Profile Promotion

**Ruta:** `/promote/profile`  
**Server Action:** `app/promote/profile/actions.ts::activateProfilePromotion(planDays: number)`

**Lógica:**
1. Valida sesión
2. Lee `profiles.featured_until` actual
3. Calcula `baseDate`:
   - Si `featured_until > now()` → `baseDate = featured_until` (extiende)
   - Si no → `baseDate = now()` (inicia)
4. Calcula nuevo `featured_until = baseDate + planDays días`
5. Actualiza `profiles.featured_until`
6. Revalida: `/dashboard`, `/explore`, `/profiles/${user_id}`

**Pricing (placeholders, sin pagos):**
- 3 días: $99 MXN
- 7 días: $199 MXN
- 30 días: $499 MXN (badge "Mejor valor")

**Efecto:**
- Perfiles featured aparecen primero en `/explore`
- Badge "Destacado" visible en cards y perfil público

### Listing Promotion

**Ruta:** `/promote/listing/[id]`  
**Server Action:** `app/promote/listing/actions.ts::activateListingPromotion(listingId: string, planDays: number)`

**Lógica:**
1. Valida sesión
2. Valida ownership (`listing.user_id === session.user.id`)
3. Lee `listings.featured_until` actual
4. Misma lógica de extensión que profile promotion
5. Actualiza `listings.featured_until`
6. Revalida: `/listings`, `/listings/${id}`, `/dashboard`

**Efecto:**
- Listings featured aparecen primero en `/listings`
- Badge "Destacado" visible en cards y detalle

### Extension Logic (CRÍTICA)

**Regla:** Si promoción está activa (fecha futura), nueva promoción **extiende** desde esa fecha. Si expiró o es null, **inicia desde now**.

**Ejemplo:**
- Usuario promueve perfil por 7 días → `featured_until = now + 7`
- Usuario promueve de nuevo por 10 días (mientras está activo) → `featured_until = (now + 7) + 10 = now + 17`
- Usuario promueve después de expirar → `featured_until = now + 10` (inicia fresco)

---

## 9. MENSAJERÍA

### Threads

**Server Action:** `app/messages/actions.ts::findOrCreateThread(otherUserId: string, listingId: string | null)`

**Lógica:**
1. Valida sesión
2. Previene self-contact
3. Normaliza user IDs (ordena para consistencia)
4. Busca thread existente (mismo par de usuarios + mismo listing)
5. Si existe → retorna `thread.id`
6. Si no existe → crea thread, retorna nuevo `thread.id`

**Uso:**
- ContactButton en `/explore` → `findOrCreateThread(userId, null)`
- ContactButton en `/profiles/[user_id]` → `findOrCreateThread(userId, null)`
- ContactButton en `/listings/[id]` → `findOrCreateThread(listingUserId, listingId)`

### Messages

**Server Action:** `app/messages/actions.ts::sendMessage(threadId: string, body: string)`

**Lógica:**
1. Valida sesión
2. Valida que usuario es participant del thread
3. Valida body (1-5000 caracteres)
4. Inserta mensaje
5. Revalida `/messages/${threadId}`

**RLS:**
- Solo participantes pueden ver/enviar mensajes
- No se pueden editar/eliminar (MVP)

---

## 10. ESTADO ACTUAL (Checklist)

### ✅ Listo para Producción

- [x] Autenticación completa (email/password + verificación)
- [x] Onboarding de perfiles (2 pasos)
- [x] Creación y búsqueda de listings
- [x] Sistema de mensajería básico
- [x] Promoción de perfiles y listings (lógica, sin pagos)
- [x] Design system unificado (Card/Badge/Button/EmptyState)
- [x] Header y navegación pulidos
- [x] Empty states consistentes
- [x] Focus states para accesibilidad
- [x] RLS activo y funcionando
- [x] SSR con Supabase funcionando

### ⚠️ Limitaciones Actuales

- [ ] **Sin pagos:** Promociones son placeholders (no hay Stripe)
- [ ] **Sin fotos en listings:** Listings son texto-only
- [ ] **Sin realtime:** Mensajes requieren refresh de página
- [ ] **Sin paginación:** Límite hard de 50 items en queries
- [ ] **Sin ratings/reviews:** TrustPanel es placeholder
- [ ] **Sin verifications:** Todas las verificaciones son "Coming soon"
- [ ] **Sin búsqueda full-text:** Usa ILIKE (no PostgreSQL full-text search)
- [ ] **Placeholder routes:** `/shortlist`, `/matches` no implementados

### 🔄 MVP vs Producción

**MVP-Ready:**
- Autenticación, perfiles, listings, mensajería básica
- Promoción (lógica, no pagos)
- Design system y UI polish

**Necesita Trabajo:**
- Integración de pagos (Stripe)
- Upload de fotos para listings
- Realtime messaging (Supabase Realtime)
- Paginación en resultados
- Sistema de ratings/reviews
- Verificaciones reales

---

## 11. "DO NOT TOUCH" LIST

### Crítico (NO Refactorizar)

1. **RLS Policies:**
   - `profiles`, `listings`, `threads`, `messages`
   - Son la última línea de defensa de seguridad
   - Cambiar requiere revisión de seguridad completa

2. **Extension Logic (Promociones):**
   - `activateProfilePromotion()` y `activateListingPromotion()`
   - La lógica de extensión acumulable es crítica para monetización
   - Cambiar afectaría expectativas de usuarios

3. **Intent System:**
   - `?intent=roomies|listings` en login/signup
   - `requireProfileOrRedirect()` siempre usa `?intent=roomies`
   - Cambiar rompería redirects en múltiples lugares

4. **SSR Cookie Handlers:**
   - `lib/supabase/server.ts` — handlers de cookies
   - Manejan edge cases automáticamente
   - Cambiar puede romper autenticación SSR

5. **buildHref en HeaderModeTabs:**
   - Preserva query params excepto `mode`
   - Cambiar rompería filtros al cambiar tabs

### Sensible (Revisar Antes de Cambiar)

1. **Server Component Pattern:**
   - Header y mayoría de páginas son Server Components
   - No convertir a Client sin necesidad real

2. **Guard Pattern:**
   - `requireAuthOrRedirect()` y `requireProfileOrRedirect()`
   - Siguen patrón consistente
   - Si se agregan nuevos guards, seguir este patrón

3. **Server Actions Pattern:**
   - Todas las mutaciones usan Server Actions
   - Retornan `{ data, error }` o `{ error }`
   - Mantener consistencia

---

## 12. DESIGN SPRINT (A/B/C) — Cambios Recientes

### Ticket A: Design System Light

**Componentes creados:**
- `app/components/ui/Card.tsx` — Card, CardHeader, CardContent
- `app/components/ui/Badge.tsx` — Badge con variantes
- `app/components/ui/Button.tsx` — Button con variantes y sizes

**Páginas actualizadas:**
- `app/explore/page.tsx` — cards de perfiles con Card component
- `app/listings/page.tsx` — cards de listings con Card component
- `app/dashboard/page.tsx` — cards de dashboard con Card component
- `app/messages/page.tsx` — cards de threads con Card component

**Cambios visuales:**
- Spacing unificado: `px-4 md:px-8`, `gap-4 md:gap-6`
- Tipografía consistente: títulos `text-2xl font-semibold tracking-tight`
- Colores: paleta `neutral-*` consistente
- Badges: sistema unificado con variantes

### Ticket B: Header + Tabs + CTA Polish

**Archivos modificados:**
- `app/Header.tsx` — altura fija `h-16`, border y padding consistentes
- `app/components/HeaderModeTabs.tsx` — segmented control style
- `app/components/UserMenu.tsx` — dropdown premium

**Cambios visuales:**
- Header: altura fija, border sutil, padding responsive
- Tabs: estilo segmented control con active state claro
- CTA: estilos consistentes con Button primary
- Dropdown: estilos refinados con transiciones suaves

**Lógica intacta:**
- Detección de mode, buildHref, preservación de query params
- Items y rutas de UserMenu sin cambios

### Ticket C: Empty States + Micro-interactions

**Componente creado:**
- `app/components/ui/EmptyState.tsx` — componente reutilizable

**Páginas actualizadas:**
- `app/explore/page.tsx` — EmptyState cuando no hay perfiles
- `app/listings/page.tsx` — EmptyState cuando no hay listings
- `app/messages/page.tsx` — EmptyState cuando no hay threads
- `app/dashboard/page.tsx` — EmptyState compact para perfil/listings vacíos

**Focus States agregados:**
- Links que envuelven Cards ahora tienen focus ring
- `focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-offset-2`
- Visible al navegar con teclado (Tab)

**Mejoras de accesibilidad:**
- Focus states en elementos clickables
- Empty states con CTAs accesibles

---

## APPENDIX: QUICK REFERENCE

### Componentes UI Import Paths

```typescript
// Card
import { Card, CardHeader, CardContent } from '@/app/components/ui/Card'

// Badge
import Badge from '@/app/components/ui/Badge'

// Button
import Button from '@/app/components/ui/Button'

// EmptyState
import EmptyState from '@/app/components/ui/EmptyState'
```

### Guards Import Paths

```typescript
// Require session only
import { requireAuthOrRedirect } from '@/lib/requireAuth'

// Require session + profile
import { requireProfileOrRedirect } from '@/lib/requireProfile'
```

### Server Actions Common Pattern

```typescript
'use server'

export async function myAction() {
  const supabase = createServerSupabaseClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return { error: 'No autorizado' }
  
  // ... do work ...
  
  revalidatePath('/path')
  return { data, error: null }
}
```

### Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=<your-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-key>
```

---

**End of Technical Audit**

