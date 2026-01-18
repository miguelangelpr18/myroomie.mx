# PROJECT.md — myroomie.mx

**Estado:** MVP en desarrollo activo  
**Última actualización:** 2024  
**Stack:** Next.js App Router + Supabase (Auth, DB, Storage)

---

## 1. Visión del producto

### Qué es myroomie.mx

**myroomie.mx** es una plataforma web para conectar personas que buscan compartir departamento o encontrar roomie en México. Es un MVP inspirado fuertemente en **roomies.com**.

### Para quién es

- **Buscadores de roomie**: Personas que buscan alguien para compartir departamento/casa
- **Ofertantes de espacio**: Personas que tienen un cuarto disponible para rentar
- **Usuarios en CDMX y otras ciudades mexicanas**: Enfoque inicial en áreas urbanas principales

### Qué problema resuelve

1. **Falta de verificación**: Plataformas tradicionales (Facebook, Craigslist) no verifican identidades
2. **Matching superficial**: Dificultad para encontrar personas compatibles en lifestyle (mascotas, horarios, limpieza)
3. **Seguridad**: Sin sistema de mensajería integrado y perfiles públicos
4. **Falta de estructura**: No hay flujo claro desde búsqueda hasta contacto

### Qué significa "MVP tipo roomies.com"

- **Perfiles completos**: Información básica (nombre, ciudad, zona) + lifestyle (mascotas, fuma, limpieza, horarios)
- **Listings estructurados**: Anuncios de cuartos disponibles con precios, descripción, ubicación
- **Mensajería integrada**: Sistema de chat entre usuarios (threads/messages)
- **Búsqueda y filtros**: Explorar perfiles y listings por ciudad, zona, tipo, precio
- **Badges de lifestyle**: Chips visuales para escanear rápidamente compatibilidad

**No incluye aún (roadmap):**
- Matching automático por compatibilidad
- Reviews/ratings
- Verificación de identidad avanzada
- Notificaciones en tiempo real
- Pagos/monetización

---

## 2. Stack técnico

### Frontend

**Next.js 14+ (App Router)**
- **Server Components** (por defecto): Renderizado en servidor, acceso directo a Supabase con cookies SSR
- **Client Components** (`'use client'`): Solo cuando se necesita interactividad (formularios, eventos)
- **Server Actions**: Funciones `async` marcadas con `'use server'` para mutaciones (crear listing, enviar mensaje)
- **Routing**: File-based routing en `/app`

**Estilos:**
- **Tailwind CSS**: Utility-first, estilos inline
- Diseño simple y consistente, sin librerías de componentes (no shadcn/ui)

### Backend (Supabase)

**Authentication**
- Email/password con verificación obligatoria
- Session management con cookies SSR (`@supabase/ssr`)
- No middleware (evita loops de redirect)

**Database (PostgreSQL)**
- **Row Level Security (RLS)**: Políticas de acceso a nivel de fila
- **Triggers**: `updated_at` automático en profiles
- **Índices**: Optimización para búsquedas por city/zone

**Storage**
- Bucket `avatars`: Imágenes de perfil (`avatars/{user_id}/avatar.jpg`)
- Política pública de lectura (no requiere auth para ver avatares)

**Mensajería**
- Tablas `threads` y `messages` con RLS
- Anti-duplicados: Unique index en threads por par de usuarios + listing

### Librerías principales

```json
{
  "next": "^14.x",
  "react": "^18.x",
  "@supabase/supabase-js": "^2.39.0",
  "@supabase/ssr": "^0.1.0",
  "typescript": "^5.x",
  "tailwindcss": "^3.x"
}
```

---

## 3. Arquitectura general

### Cómo funciona la sesión (SSR cookies)

**Problema resuelto:**
En Next.js App Router, los Server Components no pueden usar cookies del navegador directamente. Necesitamos sincronizar cookies entre cliente y servidor.

**Solución:**
- **Browser (`lib/supabase/client.ts`)**: Usa `createBrowserClient` de `@supabase/ssr` para componentes client (login, signup, forms)
- **Server (`lib/supabase/server.ts`)**: Usa `createServerClient` de `@supabase/ssr` con `cookies()` de Next.js para Server Components

**Flujo:**
1. Usuario hace login en Client Component → Supabase Auth setea cookies HTTP-only
2. `router.refresh()` sincroniza cookies con el servidor
3. Server Components leen cookies con `createServerSupabaseClient()` → `getSession()`

### Diferencia entre `createServerSupabaseClient` y `createBrowserSupabaseClient`

| | `createServerSupabaseClient` | `createBrowserSupabaseClient` |
|---|---|---|
| **Ubicación** | `lib/supabase/server.ts` | `lib/supabase/client.ts` |
| **Cuándo usar** | Server Components, Server Actions | Client Components (forms, eventos) |
| **Cookies** | Lee/escribe con `cookies()` de Next.js | Usa cookies del navegador automáticamente |
| **Ejemplos** | `/explore`, `/listings`, `requireProfileOrRedirect` | `/login`, `/signup`, `OnboardingForm` |

**Regla de oro:**
- Server Component → `createServerSupabaseClient()`
- Client Component que necesita auth → `createBrowserSupabaseClient()`

### Qué hace `requireProfileOrRedirect` y cuándo se usa

**Ubicación:** `lib/requireProfile.ts`

**Función:**
```typescript
export async function requireProfileOrRedirect()
```

**Qué hace:**
1. Crea `createServerSupabaseClient()`
2. Verifica sesión: si no hay `session.user` → `redirect('/login')`
3. Consulta tabla `profiles`: si no existe perfil → `redirect('/onboarding/step-1')`
4. Si todo OK → retorna `{ user: session.user }`

**Cuándo se usa:**
- Rutas protegidas que requieren perfil completo:
  - `/explore` (línea 12)
  - `/app` (línea 7)
  - `/messages` (línea 7)
  - `/messages/[thread_id]` (línea 8)

**No se usa en:**
- `/login`, `/signup` (públicas)
- `/listings` (pública, no requiere perfil)
- `/onboarding/step-1` (verifica sesión manualmente, permite crear perfil)

### Flujo de navegación general

```
Usuario no logueado:
  / → /login → (después de login) → /onboarding/step-1 → /onboarding/step-2 → /explore

Usuario logueado con perfil:
  /explore → /profiles/[user_id] → /messages/[thread_id]
  /listings → /listings/[id] → /profiles/[user_id] → Contactar → /messages/[thread_id]

Header dinámico:
  - Sin sesión: Explore, Listings, Login, Signup
  - Con sesión: Explore, Listings, Messages, [User chip] + Logout
```

---

## 4. Mapa de rutas

| Ruta | Tipo | Descripción | Gate |
|------|------|-------------|------|
| `/` | Pública | Landing page con hero, CTAs, bullets | Ninguno |
| `/login` | Pública | Formulario login (email/password, verificación email) | Ninguno |
| `/signup` | Pública | Formulario registro (email/password, confirmación, términos) | Ninguno |
| `/onboarding/step-1` | Protegida (sesión) | Crear/editar perfil básico (nombre, ciudad, zona, avatar) | Sesión (manual check) |
| `/onboarding/step-2` | Protegida | Completar lifestyle (mascotas, fuma, limpieza, fiestas, horario) | `requireProfileOrRedirect()` |
| `/explore` | Protegida | Lista de perfiles públicos con filtros (q, city, zone) | `requireProfileOrRedirect()` |
| `/profiles/[user_id]` | Pública | Detalle de perfil + lista de listings del usuario | Ninguno |
| `/listings` | Pública | Lista de listings con búsqueda y filtros (q, city, zone, type, min, max, sort) | Ninguno |
| `/listings/new` | Protegida | Formulario crear listing (title, description, city, zone, price, type) | `requireProfileOrRedirect()` |
| `/listings/[id]` | Pública | Detalle de listing + perfil del autor + botón Contactar | Ninguno |
| `/messages` | Protegida | Inbox con lista de threads (conversaciones) | `requireProfileOrRedirect()` |
| `/messages/[thread_id]` | Protegida | Chat thread individual (historial + form enviar mensaje) | `requireProfileOrRedirect()` + validación participant |
| `/debug/supabase` | Pública (dev only) | Página de debug para probar conexión Supabase (bloqueada en producción) | `NODE_ENV === 'production'` → `notFound()` |

**Rutas legales/placeholder:**
- `/legal/terms` - Términos y condiciones (placeholder)
- `/legal/privacy` - Política de privacidad (placeholder)
- `/security` - Información de seguridad (placeholder)

---

## 5. Modelo de datos (resumen)

### Tabla `profiles`

**Descripción:** Perfil público del usuario

**Campos principales:**
- `user_id` (UUID, PK, FK → `auth.users`)
- `display_name` (TEXT, NOT NULL)
- `city` (TEXT, NOT NULL)
- `zone` (TEXT, NOT NULL)
- `avatar_url` (TEXT, nullable)
- `pets` (BOOLEAN, nullable)
- `smoker` (BOOLEAN, nullable)
- `cleanliness` (SMALLINT, 1-3, nullable)
- `parties` (BOOLEAN, nullable)
- `schedule` (TEXT, 'day'\|'night', nullable)
- `created_at` (TIMESTAMPTZ, default NOW())
- `updated_at` (TIMESTAMPTZ, default NOW(), trigger automático)

**RLS:**
- **SELECT**: Público (todos pueden leer para explorar)
- **INSERT/UPDATE/DELETE**: Solo dueño (`auth.uid() = user_id`)

**Índices:**
- `profiles_city_idx`
- `profiles_zone_idx`
- `profiles_city_zone_idx`

### Tabla `listings`

**Descripción:** Anuncios de cuartos disponibles o búsqueda de roomie

**Campos principales:**
- `id` (UUID, PK)
- `user_id` (UUID, FK → `auth.users`)
- `title` (TEXT, NOT NULL)
- `description` (TEXT, NOT NULL)
- `city` (TEXT, NOT NULL)
- `zone` (TEXT, NOT NULL)
- `price_mxn` (INTEGER, nullable)
- `listing_type` (TEXT, 'room'\|'roommate')
- `created_at` (TIMESTAMPTZ, default NOW())
- `updated_at` (TIMESTAMPTZ, default NOW())

**RLS:**
- **SELECT**: Público (todos pueden leer listings)
- **INSERT/UPDATE/DELETE**: Solo dueño (`auth.uid() = user_id`)

### Tabla `threads`

**Descripción:** Conversación entre dos usuarios (opcionalmente vinculada a un listing)

**Campos principales:**
- `id` (UUID, PK)
- `user1_id` (UUID, FK → `auth.users`)
- `user2_id` (UUID, FK → `auth.users`)
- `listing_id` (UUID, FK → `listings`, nullable)
- `created_at` (TIMESTAMPTZ, default NOW())

**RLS:**
- **SELECT**: Solo participantes (`auth.uid() = user1_id OR auth.uid() = user2_id`)
- **INSERT**: Solo participantes
- **UPDATE/DELETE**: Denegado (MVP)

**Índices:**
- `threads_users_idx` (user1_id, user2_id)
- `threads_unique_idx` UNIQUE (LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id), COALESCE(listing_id, default UUID))

### Tabla `messages`

**Descripción:** Mensajes dentro de un thread

**Campos principales:**
- `id` (UUID, PK)
- `thread_id` (UUID, FK → `threads`, CASCADE)
- `sender_id` (UUID, FK → `auth.users`)
- `body` (TEXT, NOT NULL)
- `created_at` (TIMESTAMPTZ, default NOW())

**RLS:**
- **SELECT**: Solo si `auth.uid()` es participante del thread
- **INSERT**: `sender_id` debe ser `auth.uid()` Y participante del thread
- **UPDATE/DELETE**: Denegado (MVP)

**Índices:**
- `messages_thread_created_idx` (thread_id, created_at)

### Relaciones entre tablas

```
auth.users (1) ──> (1) profiles.user_id
auth.users (1) ──> (*) listings.user_id
auth.users (1) ──> (*) threads.user1_id
auth.users (1) ──> (*) threads.user2_id
auth.users (1) ──> (*) messages.sender_id

listings (1) ──> (*) threads.listing_id (nullable)
threads (1) ──> (*) messages.thread_id (CASCADE)
```

---

## 6. Flujo de usuario (end-to-end)

### Usuario nuevo desde signup

1. **Landing (`/`)** → Click "Crear perfil" → `/signup`
2. **Signup (`/signup`)**:
   - Llenar email, password, confirm password, checkbox términos
   - Click "Registrarse"
   - Mensaje: "Revisa tu correo para verificar"
3. **Email verification**: Click en link de Supabase
4. **Login (`/login`)**:
   - Email/password
   - Verifica `email_confirmed_at`
   - Si OK → `router.refresh()` → `hasProfile()` → redirect a `/onboarding/step-1`

### Onboarding step-1 → step-2

1. **Step-1 (`/onboarding/step-1`)**:
   - Form: display_name, city, zone, avatar (file upload)
   - Guardar → `saveMyProfile()` → redirect a `/onboarding/step-2`
2. **Step-2 (`/onboarding/step-2`)**:
   - Form: pets (Sí/No), smoker (Sí/No), cleanliness (1-3), parties (Sí/No), schedule (Día/Noche)
   - Guardar → `saveMyLifestyle()` → redirect a `/explore`

### Explore / Listings

1. **Explore (`/explore`)**:
   - Lista de perfiles con avatar, nombre, ciudad, zona, badges de lifestyle
   - Filtros: búsqueda por nombre (q), city, zone
   - Click en perfil → `/profiles/[user_id]`
2. **Listings (`/listings`)**:
   - Lista de listings con badge tipo, título, descripción, precio, ciudad, zona
   - Filtros: q, city, zone, listing_type, min, max, sort (recent/price_asc/price_desc)
   - Click en listing → `/listings/[id]`

### Contactar → chat

1. **Desde listing (`/listings/[id]`)**:
   - Click "Contactar" → `findOrCreateThread(listingUserId, listingId)`
   - Crea/busca thread → redirect a `/messages/[thread_id]`
2. **Desde perfil (`/profiles/[user_id]`)**:
   - Click "Contactar" → `findOrCreateThread(userId, null)`
   - Crea/busca thread → redirect a `/messages/[thread_id]`
3. **Chat (`/messages/[thread_id]`)**:
   - Historial de mensajes (burbujas: azul propio, gris otro)
   - Form textarea + botón "Enviar"
   - `sendMessage(threadId, body)` → `revalidatePath()`

### Logout

1. Click "Logout" en header → `logout()` (server action) → `router.replace('/login')` + `router.refresh()`
2. Header actualiza: desaparece user chip, Messages, muestra Login/Signup

---

## 7. Estado actual del MVP

### ✅ Qué ya está implementado

**Autenticación completa:**
- ✅ Signup con email/password + verificación obligatoria
- ✅ Login con validación de email confirmado
- ✅ Logout con limpieza de cookies SSR
- ✅ Header dinámico (muestra estado según sesión)
- ✅ Redirect post-login inteligente (step-1 si no tiene perfil, explore si tiene)

**Onboarding completo:**
- ✅ Step-1: Perfil básico (nombre, ciudad, zona, avatar upload)
- ✅ Step-2: Lifestyle (mascotas, fuma, limpieza, fiestas, horario)
- ✅ Flujo: step-1 → step-2 → explore

**Exploración de perfiles:**
- ✅ `/explore`: Lista de perfiles con avatar, nombre, ciudad, zona
- ✅ Filtros: búsqueda por nombre, city, zone (URL persistente)
- ✅ Badges de lifestyle en cards
- ✅ `/profiles/[user_id]`: Detalle completo + lista de listings del usuario

**Listings:**
- ✅ `/listings`: Lista pública con filtros avanzados (q, city, zone, type, min, max, sort)
- ✅ `/listings/new`: Crear listing (protegido)
- ✅ `/listings/[id]`: Detalle completo + perfil del autor + badges lifestyle

**Mensajería:**
- ✅ `/messages`: Inbox con lista de threads + último mensaje
- ✅ `/messages/[thread_id]`: Chat completo con historial + form enviar
- ✅ `findOrCreateThread()`: Crea o encuentra thread existente (anti-duplicados)
- ✅ `sendMessage()`: Envía mensaje con validación de participant

**Storage:**
- ✅ Avatar upload a Supabase Storage (`avatars` bucket)
- ✅ URLs públicas para mostrar imágenes

**Seguridad:**
- ✅ RLS habilitado en todas las tablas
- ✅ Políticas correctas (SELECT público para perfiles/listings, INSERT/UPDATE/DELETE solo dueño)
- ✅ `/debug/supabase` bloqueada en producción (`notFound()`)

### ✅ Qué funciona completamente

- ✅ Flujo completo: Signup → Verify → Login → Onboarding → Explore → Contactar → Chat
- ✅ Búsqueda y filtros en `/explore` y `/listings` (URL compartible)
- ✅ Badges de lifestyle visibles en explore, profiles, listing detail
- ✅ Mensajería bidireccional funcional
- ✅ Avatar upload y visualización
- ✅ Protección de rutas (`requireProfileOrRedirect()`)
- ✅ Logout limpia sesión SSR correctamente

### ⏳ Qué está pendiente

**Funcionalidad:**
- ⏳ Búsqueda/filtros avanzados por lifestyle (mascotas, fuma, horario, etc.)
- ⏳ Matching automático por compatibilidad
- ⏳ Edición de listings existentes
- ⏳ Eliminación de listings
- ⏳ Eliminación de mensajes/threads
- ⏳ Notificaciones en tiempo real (realtime subscriptions)
- ⏳ Reviews/ratings de usuarios
- ⏳ Verificación de identidad avanzada

**UX:**
- ⏳ Páginas legales (Términos, Privacidad, Seguridad) tienen contenido placeholder
- ⏳ No hay feedback visual de mensajes leídos/no leídos
- ⏳ No hay indicador de mensajes nuevos en header
- ⏳ Dashboard `/app` existe pero es básico (solo muestra email/ID)

**Técnico:**
- ⏳ `lib/supabaseClient.ts` es legacy (solo usado en `/debug/supabase`)
- ⏳ Función `getMyProfile()` en `onboarding/step-1/actions.ts` no se usa
- ⏳ Validaciones de tipos más estrictas (algunos campos nullable podrían ser opcionales)

---

## 8. Roadmap siguiente (alto nivel)

### Mejoras de matching (lifestyle)

- Filtros por lifestyle en `/explore` (mascotas, fuma, limpieza, horario)
- Algoritmo de compatibilidad: score basado en coincidencias de lifestyle
- Sugerencias de perfiles compatibles en dashboard

### Filtros avanzados

- Búsqueda geográfica (mapa, radio de búsqueda)
- Filtros de precio en `/explore` (rango del usuario)
- Ordenamiento por compatibilidad en lugar de solo fecha/precio

### UX tipo roomies.com

- Paginación en listas (actualmente limit 50)
- Infinite scroll o "Cargar más"
- Preview de mensaje más rico (texto truncado inteligente)
- Indicador de "en línea" / última actividad

### Notificaciones / realtime

- Realtime subscriptions de Supabase para mensajes nuevos
- Notificaciones push (opcional)
- Badge de contador de mensajes no leídos en header
- Sonido/feedback al recibir mensaje

### Moderación / reportes

- Sistema de reportes de usuarios/listings
- Moderación manual de contenido
- Flagging automático de palabras clave
- Política de uso y términos reales

### Monetización (placeholder)

- Planes premium (verificación extra, destacar listing)
- Pagos con Stripe/mercado pago
- Comisiones por transacciones exitosas
- Ads para listings destacados

---

## Notas finales

**Para desarrolladores:**
- Este proyecto usa **cambios mínimos** y **sin refactors masivos** como principio
- Mantener App Router + Server Components siempre que sea posible
- No usar middleware (evita loops de redirect)
- Reutilizar `requireProfileOrRedirect()` para rutas protegidas

**Para product managers:**
- MVP funcional para validación de mercado
- Enfoque en onboarding completo y mensajería básica
- Roadmap prioriza matching y UX sobre features premium

**Para diseñadores:**
- Estilo simple y consistente (Tailwind utility-first)
- Badges de lifestyle para escaneo rápido
- Cards clickeables con hover states
- Responsive básico (grid adaptativo)

---

**Mantenido por:** Equipo myroomie.mx  
**Repositorio:** `git@github.com:miguelangelpr18/myroomie.mx.git`

