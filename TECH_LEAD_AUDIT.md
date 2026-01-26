# 🔍 AUDITORÍA TÉCNICA COMPLETA — MyRoomie.mx
**Fecha:** 2024  
**Auditor:** Tech Lead Review  
**Objetivo:** Project Map + Detección de Inconsistencias + Plan de Refactor

---

## 📋 INVENTARIO DE ARCHIVOS

### **A) Core Layout & Routing**

#### `app/layout.tsx`
- **Tipo:** Server Component
- **Qué hace:** Root layout con Header, Footer, metadata
- **Quién lo usa:** Next.js (automático)
- **Riesgos:** ✅ Limpio, sin problemas

#### `app/page.tsx` (Home)
- **Tipo:** Server Component
- **Qué hace:** Landing page con hero, featured listings/profiles, trust section
- **Quién lo usa:** Ruta `/`
- **Riesgos:** ✅ Usa tokens (`bg-brand`, `hover:bg-brandHover`), bien estructurado

#### `app/Header.tsx`
- **Tipo:** Server Component
- **Qué hace:** Header dinámico (con/sin sesión), GlobalSearchBar, UserMenu
- **Quién lo usa:** `app/layout.tsx`
- **Riesgos:** ✅ Consistente, usa tokens

---

### **B) Authentication & Authorization**

#### `lib/auth.ts`
- **Tipo:** Utility (Client-side)
- **Qué hace:** Wrappers de `signIn`, `signUp`, `signOut` usando `createBrowserSupabaseClient`
- **Quién lo usa:** `app/login/page.tsx`, `app/signup/page.tsx`
- **Riesgos:** ✅ Correcto, separación clara

#### `lib/requireAuth.ts`
- **Tipo:** Utility (Server-side)
- **Qué hace:** Verifica sesión, redirige a `/login` con `next` param si no hay sesión
- **Quién lo usa:** `app/dashboard/page.tsx`, `app/app/page.tsx`
- **Riesgos:** ✅ Null guards corregidos recientemente

#### `lib/requireProfile.ts`
- **Tipo:** Utility (Server-side)
- **Qué hace:** Verifica sesión + perfil, redirige a `/login` o `/onboarding/step-1`
- **Quién lo usa:** `app/explore/page.tsx`, `app/messages/page.tsx`, `app/messages/[thread_id]/page.tsx`
- **Riesgos:** ✅ Null guards corregidos

#### `app/login/page.tsx`
- **Tipo:** Client Component
- **Qué hace:** Formulario de login, maneja `intent` y `next` params, redirige post-auth
- **Quién lo usa:** Ruta `/login`
- **Riesgos:** ⚠️ **HARDCODED COLORS:** `bg-[#FF7A18]`, `hover:bg-[#E86F14]`, `focus:ring-[#FF7A18]/30` (líneas 102, 117, 125, 139)
- **TODOs:** Reemplazar por tokens `bg-brand`, `hover:bg-brandHover`, `focus:ring-brand/30`

#### `app/signup/page.tsx`
- **Tipo:** Client Component
- **Qué hace:** Formulario de signup con validación
- **Quién lo usa:** Ruta `/signup`
- **Riesgos:** ⚠️ **HARDCODED COLORS:** `bg-[#FF7A18]`, `hover:bg-[#E86F14]`, `focus:ring-[#FF7A18]/30` (líneas 95, 110, 125, 141, 145, 166)

---

### **C) Supabase Clients**

#### `lib/supabase/server.ts`
- **Tipo:** Utility (Server-side)
- **Qué hace:** Crea Supabase client con SSR cookies usando `@supabase/ssr`
- **Quién lo usa:** Todos los Server Components
- **Riesgos:** ✅ Correcto, patrón estándar

#### `lib/supabase/client.ts`
- **Tipo:** Utility (Client-side)
- **Qué hace:** Crea Supabase client para browser usando `@supabase/ssr`
- **Quién lo usa:** `lib/auth.ts`, Client Components
- **Riesgos:** ✅ Correcto

---

### **D) Explore (Perfiles/Roomies)**

#### `app/explore/page.tsx`
- **Tipo:** Server Component
- **Qué hace:** Lista perfiles con filtros (chips, search, city), verifica perfil para mostrar CTA
- **Quién lo usa:** Ruta `/explore`
- **Riesgos:** ✅ Usa tokens, bien estructurado
- **Nota:** Filtros legacy (`pets=yes/no`) coexisten con chips (`pets=1`), puede confundir

#### `app/explore/FilterChips.tsx`
- **Tipo:** Client Component
- **Qué hace:** Chips horizontales para filtros booleanos (featured, pets, no_smoker, calm)
- **Quién lo usa:** `app/explore/page.tsx`
- **Riesgos:** ⚠️ **HARDCODED COLORS:** `bg-[#FF7A18]/10`, `border-[#FF7A18]/30`, `text-[#FF7A18]`, `focus-visible:ring-[#FF7A18]/30` (línea 59)
- **TODOs:** Usar tokens `bg-brand/10`, `border-brand/30`, `text-brand`, `focus-visible:ring-brand/30`

#### `app/explore/ResultHeader.tsx`
- **Tipo:** Client Component
- **Qué hace:** Muestra conteo de resultados, badges de filtros activos, botón "Limpiar"
- **Quién lo usa:** `app/explore/page.tsx`
- **Riesgos:** ⚠️ **HARDCODED COLORS:** `bg-[#FF7A18]/10`, `text-[#FF7A18]`, `border-[#FF7A18]/20` (línea 61)

#### `app/explore/loading.tsx`
- **Tipo:** Server Component (Loading UI)
- **Qué hace:** Skeleton para `/explore`
- **Quién lo usa:** Next.js (automático)
- **Riesgos:** ✅ Correcto

---

### **E) Messages (Chat)**

#### `app/messages/page.tsx`
- **Tipo:** Server Component
- **Qué hace:** Split view (sidebar + ThreadPanel), lista threads con unread tracking
- **Quién lo usa:** Ruta `/messages`
- **Riesgos:** ⚠️ **HARDCODED COLORS:** `bg-[#FF7A18]` (líneas 42, 60, 90, 111, 141)
- **TODOs:** Usar `bg-brand`

#### `app/messages/ThreadPanel.tsx`
- **Tipo:** Server Component
- **Qué hace:** Panel derecho con mensajes, header, footer con MessageForm
- **Quién lo usa:** `app/messages/page.tsx`
- **Riesgos:** ✅ Usa tokens, bien estructurado

#### `app/messages/[thread_id]/page.tsx`
- **Tipo:** Server Component
- **Qué hace:** Vista móvil de thread individual
- **Quién lo usa:** Ruta `/messages/[thread_id]`
- **Riesgos:** ✅ Consistente con ThreadPanel

#### `app/messages/actions.ts`
- **Tipo:** Server Actions
- **Qué hace:** `findOrCreateThread`, `sendMessage`, `markThreadAsRead`
- **Quién lo usa:** `app/messages/[thread_id]/MessageForm.tsx`, `app/messages/ThreadPanel.tsx`
- **Riesgos:** ✅ Correcto, usa `profile_id` para unread tracking

#### `app/messages/MessageForm.tsx`
- **Tipo:** Client Component
- **Qué hace:** Formulario para enviar mensajes, usa `router.refresh()` post-submit
- **Quién lo usa:** `app/messages/ThreadPanel.tsx`, `app/messages/[thread_id]/page.tsx`
- **Riesgos:** ✅ Correcto

---

### **F) Listings**

#### `app/listings/page.tsx`
- **Tipo:** Server Component
- **Qué hace:** Lista anuncios con filtros (search, city, zone, type, price, sort)
- **Quién lo usa:** Ruta `/listings`
- **Riesgos:** ⚠️ **HARDCODED COLORS:** `bg-[#FF7A18]`, `hover:bg-[#E86F14]` (línea 133)
- **TODOs:** Usar `bg-brand`, `hover:bg-brandHover`

#### `app/listings/new/page.tsx` + `ListingForm.tsx`
- **Tipo:** Server Component + Client Component
- **Qué hace:** Formulario para crear listing
- **Quién lo usa:** Ruta `/listings/new`
- **Riesgos:** ⚠️ Revisar si usa tokens (no leído completo)

---

### **G) Components**

#### `app/components/ui/Badge.tsx`
- **Tipo:** Client Component
- **Qué hace:** Badge reutilizable con variants (default, subtle, featured)
- **Quién lo usa:** Varios (RoomieCard, listings, etc.)
- **Riesgos:** ✅ Usa tokens (`bg-brandSoft`, `text-brandText`, `border-brandBorder`)

#### `app/components/ui/Button.tsx`
- **Tipo:** Client Component
- **Qué hace:** Button reutilizable con variants (primary, secondary, ghost)
- **Quién lo usa:** Varios
- **Riesgos:** ✅ Usa tokens (`bg-brand`, `hover:bg-brandHover`, `focus:ring-brandBorder`)

#### `app/components/ui/Card.tsx`
- **Tipo:** Client Component
- **Qué hace:** Card wrapper básico
- **Quién lo usa:** RoomieCard, ListingCard
- **Riesgos:** ✅ Correcto

#### `app/components/roomies/RoomieCard.tsx`
- **Tipo:** Client Component
- **Qué hace:** Card de perfil con avatar, nombre, ubicación, LifestyleBadges
- **Quién lo usa:** `app/explore/page.tsx`, `app/components/home/HomeFeaturedProfiles.tsx`
- **Riesgos:** ✅ Usa tokens, bien estructurado (recientemente mejorado)

#### `app/components/listings/ListingCard.tsx`
- **Tipo:** Client Component
- **Qué hace:** Card de listing con imagen, título, precio, tipo
- **Quién lo usa:** `app/listings/page.tsx`, `app/components/home/HomeFeaturedListings.tsx`
- **Riesgos:** ⚠️ Revisar si usa tokens (no leído completo)

#### `app/components/search/GlobalSearchBar.tsx`
- **Tipo:** Client Component
- **Qué hace:** Barra de búsqueda global con popover, maneja mode (listings/roomies)
- **Quién lo usa:** `app/Header.tsx`
- **Riesgos:** ✅ Usa tokens (`bg-brand`, `hover:bg-brandHover`, `focus:ring-brand/30`)

---

### **H) SQL Migrations**

#### `sql/create_profiles_table.sql`
- **Tipo:** SQL Migration
- **Qué hace:** Crea tabla `profiles` con RLS
- **Riesgos:** ✅ Correcto

#### `sql/create_messaging_tables.sql`
- **Tipo:** SQL Migration
- **Qué hace:** Crea `threads` y `messages` con RLS
- **Riesgos:** ✅ Correcto

#### `sql/create_thread_participants_table.sql`
- **Tipo:** SQL Migration
- **Qué hace:** Crea `thread_participants` para unread tracking
- **Riesgos:** ✅ Correcto

#### `sql/migrate_thread_participants_to_profile_id.sql`
- **Tipo:** SQL Migration
- **Qué hace:** Migra `user_id` → `profile_id` en `thread_participants`
- **Riesgos:** ✅ Correcto

---

### **I) Styling**

#### `tailwind.config.ts`
- **Tipo:** Config
- **Qué hace:** Define tokens de color (brand, brandHover, brandSoft, etc.)
- **Riesgos:** ✅ Bien definido

#### `app/globals.css`
- **Tipo:** CSS
- **Qué hace:** Tailwind base + utilities (scrollbar-hide), base styles para h1/h2/h3
- **Riesgos:** ✅ Correcto

---

## 🚨 DETECCIÓN DE INCONSISTENCIAS (FRANKENSTEIN APP)

### **1. COLORS HARDCODEADOS vs TOKENS**

**Problema:** Mezcla de colores hardcodeados (`#FF7A18`, `#E86F14`) y tokens (`bg-brand`, `hover:bg-brandHover`).

**Archivos afectados:**
- `app/login/page.tsx` — 5+ instancias
- `app/signup/page.tsx` — 6+ instancias
- `app/messages/page.tsx` — 5+ instancias
- `app/listings/page.tsx` — 2 instancias
- `app/explore/FilterChips.tsx` — 4 instancias
- `app/explore/ResultHeader.tsx` — 3 instancias

**Impacto:** Alto — Dificulta mantenimiento, cambios de brand requieren buscar/reemplazar manualmente.

---

### **2. DUPLICACIÓN DE LÓGICA DE REDIRECT POST-AUTH**

**Problema:** Lógica de redirect post-login está en `app/login/page.tsx` (Client Component) con múltiples branches:
- `nextParam` → prioridad
- `!profileExists` → `/onboarding/step-1` o `/listings/new` o `/signup/intent`
- `profileExists` → `/listings` o `/`

**Riesgo:** Si cambia el flujo, hay que tocar múltiples lugares.

**Sugerencia:** Centralizar en helper o Server Action.

---

### **3. FILTROS LEGACY vs CHIPS (Explore)**

**Problema:** En `app/explore/page.tsx`, coexisten:
- Filtros legacy: `pets=yes/no`, `smoker=yes/no`, `parties=yes/no`, `cleanliness=1/2/3`, `schedule=day/night`
- Chips nuevos: `featured=1`, `pets=1`, `no_smoker=1`, `calm=1`

**Conflicto:** `pets=1` (chip) vs `pets=yes/no` (legacy) — hay lógica para evitar conflicto, pero es frágil.

**Riesgo:** Medio — URLs legacy pueden seguir funcionando, pero confunde.

---

### **4. GLOBAL SEARCH BAR: FILTROS DUPLICADOS**

**Problema:** `GlobalSearchBar` maneja filtros para `listings` y `roomies`, pero:
- `roomies` usa `budget_min/budget_max` (que NO existen en `profiles` table según comentario en `app/explore/page.tsx`)
- `listings` usa `min/max` (correcto para `listings` table)

**Riesgo:** Medio — `budget_min/budget_max` en `/explore` no hace nada, pero aparece en UI.

---

### **5. TIPOS NULLABLES SIN GUARDS CONSISTENTES**

**Problema:** Algunos lugares usan `?.` y otros asumen que existe.

**Ejemplos:**
- `app/messages/page.tsx` — `lastMessage` puede ser `null`, pero se accede a `lastMessage.sender_id` sin guard (corregido recientemente)
- `app/Header.tsx` — `profile?.display_name` bien manejado

**Riesgo:** Bajo-Medio — Ya se corrigieron algunos, pero puede haber más.

---

### **6. ESTILOS MEZCLADOS (CONTAINER vs MAX-W)**

**Problema:** Algunos usan `container mx-auto`, otros `max-w-7xl mx-auto`:
- `app/page.tsx` (home): `max-w-7xl`
- `app/explore/page.tsx`: `max-w-7xl`
- `app/listings/page.tsx`: `container mx-auto`

**Riesgo:** Bajo — Funciona, pero inconsistente visualmente.

---

### **7. COMPONENTES UI DUPLICADOS**

**Problema:** Hay `app/components/ui/Button.tsx` pero muchos lugares usan `<button>` directo con clases.

**Ejemplos:**
- `app/login/page.tsx` — botón directo
- `app/signup/page.tsx` — botón directo
- `app/listings/page.tsx` — Link con clases de botón

**Riesgo:** Bajo-Medio — Funciona, pero pierde consistencia de variantes.

---

### **8. FEATURES "PROMETIDAS" EN UI PERO NO IMPLEMENTADAS**

**Problema:** Home page menciona "Reviews" y "Verificación" en Trust Section, pero no hay implementación visible.

**Riesgo:** Bajo — Marketing, pero puede confundir usuarios.

---

## 🔥 TOP 10 ISSUES (ORDENADOS POR IMPACTO)

### **1. COLORS HARDCODEADOS (CRÍTICO)**
- **Impacto:** Alto
- **Archivos:** 6+ archivos
- **Fix:** Buscar/reemplazar `#FF7A18` → `bg-brand`, `#E86F14` → `hover:bg-brandHover`, `#FF7A18/30` → `brand/30`
- **Tiempo:** 1-2 horas

### **2. FILTROS LEGACY vs CHIPS (MEDIO)**
- **Impacto:** Medio
- **Archivos:** `app/explore/page.tsx`
- **Fix:** Deprecar legacy, documentar migración, o mantener pero clarificar
- **Tiempo:** 2-3 horas

### **3. GLOBAL SEARCH BAR: BUDGET FILTERS FANTASMA (MEDIO)**
- **Impacto:** Medio
- **Archivos:** `app/components/search/GlobalSearchBar.tsx`, `app/explore/page.tsx`
- **Fix:** Remover `budget_min/budget_max` de UI o implementar en backend
- **Tiempo:** 1 hora

### **4. REDIRECT POST-AUTH DUPLICADO (MEDIO)**
- **Impacto:** Medio
- **Archivos:** `app/login/page.tsx`
- **Fix:** Centralizar en helper/Server Action
- **Tiempo:** 2 horas

### **5. BUTTON COMPONENT NO USADO (BAJO-MEDIO)**
- **Impacto:** Bajo-Medio
- **Archivos:** Múltiples
- **Fix:** Migrar botones directos a `<Button>` o documentar cuándo usar cada uno
- **Tiempo:** 3-4 horas

### **6. CONTAINER vs MAX-W INCONSISTENTE (BAJO)**
- **Impacto:** Bajo
- **Archivos:** Múltiples pages
- **Fix:** Estandarizar a `max-w-7xl` o crear wrapper component
- **Tiempo:** 1 hora

### **7. TIPOS NULLABLES (BAJO)**
- **Impacto:** Bajo (ya corregidos algunos)
- **Archivos:** Varios
- **Fix:** Auditoría completa con TypeScript strict, agregar guards
- **Tiempo:** 2-3 horas

### **8. FEATURES PROMETIDAS NO IMPLEMENTADAS (BAJO)**
- **Impacto:** Bajo (marketing)
- **Archivos:** `app/page.tsx`
- **Fix:** Remover o implementar
- **Tiempo:** 1 hora (remover) o 1-2 semanas (implementar)

### **9. LIFESTYLE BADGES: LÓGICA DE CONVERSIÓN (BAJO)**
- **Impacto:** Bajo
- **Archivos:** `app/components/roomies/RoomieCard.tsx`
- **Fix:** Centralizar conversión `cleanliness: string → number` en helper
- **Tiempo:** 1 hora

### **10. SQL MIGRATIONS: FALTA VERSIONING (BAJO)**
- **Impacto:** Bajo
- **Archivos:** `sql/*.sql`
- **Fix:** Agregar timestamps o usar herramienta de migraciones
- **Tiempo:** 1 hora (documentar) o 2-3 horas (setup herramienta)

---

## 📐 ARQUITECTURA ACTUAL (DIAGRAMA EN TEXTO)

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App Router                        │
│  (Server Components por defecto, Client con 'use client')  │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
   ┌────▼────┐         ┌─────▼─────┐        ┌─────▼─────┐
   │  Pages  │         │ Components│        │   Lib     │
   │         │         │           │        │           │
   │ /       │         │ UI (Badge,│        │ auth.ts    │
   │ /explore│         │ Button,   │        │ requireAuth│
   │ /listings│        │ Card)     │        │ requireProf│
   │ /messages│        │ RoomieCard│        │ supabase/  │
   │ /login  │         │ ListingCard│       │   server   │
   │ /signup │         │ GlobalSearch│       │   client   │
   └────┬────┘         └─────┬─────┘        └─────┬─────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                    ┌─────────▼─────────┐
                    │   Supabase (SSR)   │
                    │                    │
                    │  - Auth (cookies)  │
                    │  - Database (RLS)  │
                    │  - Storage         │
                    └────────────────────┘
```

**Flujo de Autenticación:**
```
Usuario → /login → signIn() → router.refresh() → hasProfile() → 
  ├─ Sin perfil → /onboarding/step-1
  └─ Con perfil → / (home)
```

**Flujo de Mensajes:**
```
Usuario → /messages → requireProfileOrRedirect() → 
  ├─ Sin sesión → /login?next=/messages
  └─ Con sesión → Fetch threads → ThreadPanel (si thread seleccionado)
```

---

## 🛠️ PLAN DE REFACTOR POR FASES

### **FASE 1: COLORS TOKENS (CRÍTICO)**
**Objetivo:** Eliminar todos los colores hardcodeados, usar tokens de Tailwind.

**Archivos a tocar:**
- `app/login/page.tsx`
- `app/signup/page.tsx`
- `app/messages/page.tsx`
- `app/listings/page.tsx`
- `app/explore/FilterChips.tsx`
- `app/explore/ResultHeader.tsx`

**Cambios:**
- `#FF7A18` → `bg-brand` / `text-brand` / `border-brand`
- `#E86F14` → `hover:bg-brandHover`
- `#FF7A18/30` → `brand/30` (opacity)
- `#FF7A18/10` → `brand/10`
- `#FF7A18/20` → `brand/20`

**Riesgo:** Bajo — Solo cambios de clases CSS.

**Checklist de prueba:**
- [ ] Login page: botón y links naranjas
- [ ] Signup page: botón y links naranjas
- [ ] Messages: unread dots, selected bar, avatares
- [ ] Listings: botón "Publicar anuncio"
- [ ] Explore FilterChips: estado activo
- [ ] Explore ResultHeader: badges de filtros

**Tiempo estimado:** 1-2 horas

---

### **FASE 2: CENTRALIZAR REDIRECT POST-AUTH**
**Objetivo:** Mover lógica de redirect post-login a helper/Server Action.

**Archivos a tocar:**
- `lib/auth.ts` (agregar `getPostAuthRedirect()`)
- `app/login/page.tsx` (usar helper)

**Cambios:**
```typescript
// lib/auth.ts
export async function getPostAuthRedirect(
  hasProfile: boolean,
  intent?: 'listings' | 'roomies' | null,
  next?: string | null
): Promise<string> {
  if (next) return next
  if (!hasProfile) {
    if (intent === 'listings') return '/listings/new'
    if (intent === 'roomies') return '/onboarding/step-1'
    return '/signup/intent'
  }
  if (intent === 'listings') return '/listings'
  return '/'
}
```

**Riesgo:** Medio — Cambia flujo crítico.

**Checklist de prueba:**
- [ ] Login sin perfil, sin intent → `/signup/intent`
- [ ] Login sin perfil, intent=listings → `/listings/new`
- [ ] Login sin perfil, intent=roomies → `/onboarding/step-1`
- [ ] Login con perfil, sin intent → `/`
- [ ] Login con perfil, intent=listings → `/listings`
- [ ] Login con perfil, next=/messages → `/messages`

**Tiempo estimado:** 2 horas

---

### **FASE 3: LIMPIAR FILTROS LEGACY (Explore)**
**Objetivo:** Deprecar filtros legacy o documentarlos claramente.

**Archivos a tocar:**
- `app/explore/page.tsx`

**Opciones:**
- **A) Deprecar:** Remover lógica legacy, solo chips
- **B) Documentar:** Agregar comentario claro, mantener compatibilidad

**Recomendación:** Opción B (mantener compatibilidad, pero documentar).

**Riesgo:** Bajo-Medio — Puede romper URLs compartidas.

**Checklist de prueba:**
- [ ] `/explore?pets=1` (chip) funciona
- [ ] `/explore?pets=yes` (legacy) funciona
- [ ] `/explore?pets=1&pets=yes` (conflicto) → chip gana

**Tiempo estimado:** 1 hora (documentar) o 2-3 horas (remover)

---

### **FASE 4: REMOVER BUDGET FILTERS FANTASMA**
**Objetivo:** Remover `budget_min/budget_max` de GlobalSearchBar para mode `roomies`.

**Archivos a tocar:**
- `app/components/search/GlobalSearchBar.tsx`
- `app/explore/page.tsx` (verificar que no se usen)

**Cambios:**
- Remover `budget_min`, `budget_max` del estado y UI cuando `mode === 'roomies'`
- Mantener solo `q`, `city` para roomies

**Riesgo:** Bajo — Feature no implementada.

**Checklist de prueba:**
- [ ] GlobalSearchBar en `/explore` no muestra budget inputs
- [ ] GlobalSearchBar en `/listings` muestra price inputs
- [ ] URLs con `budget_min/budget_max` se ignoran silenciosamente

**Tiempo estimado:** 1 hora

---

### **FASE 5: ESTANDARIZAR CONTAINERS**
**Objetivo:** Usar `max-w-7xl` consistentemente o crear wrapper.

**Archivos a tocar:**
- `app/listings/page.tsx` (cambiar `container` → `max-w-7xl`)
- Opcional: Crear `app/components/layout/PageContainer.tsx`

**Riesgo:** Bajo — Solo layout.

**Checklist de prueba:**
- [ ] `/listings` tiene mismo ancho que `/explore` y `/`
- [ ] Responsive funciona igual

**Tiempo estimado:** 30 minutos

---

## 📊 RESUMEN EJECUTIVO

### **Estado Actual:**
- ✅ Arquitectura sólida (Next.js App Router + Supabase SSR)
- ✅ Separación clara Server/Client Components
- ✅ RLS implementado correctamente
- ⚠️ Inconsistencias de estilos (colors hardcodeados)
- ⚠️ Lógica duplicada (redirects, filtros)

### **Riesgos Principales:**
1. **Mantenibilidad:** Colors hardcodeados dificultan cambios de brand
2. **Consistencia:** Filtros legacy vs chips puede confundir
3. **Complejidad:** Redirect post-auth tiene múltiples branches

### **Recomendación:**
**Priorizar FASE 1 (Colors Tokens)** — Impacto alto, riesgo bajo, tiempo corto.

Luego **FASE 2 (Redirect Centralizado)** — Mejora mantenibilidad.

Las demás fases son opcionales según prioridades del negocio.

---

## ✅ CHECKLIST FINAL

- [x] Inventario completo de archivos
- [x] Detección de inconsistencias
- [x] Top 10 issues identificados
- [x] Arquitectura documentada
- [x] Plan de refactor por fases
- [x] Estimaciones de tiempo
- [x] Checklists de prueba

---

**Fin del Reporte**

