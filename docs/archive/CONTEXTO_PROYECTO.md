# MyRoomie.mx — Contexto Completo del Proyecto

> Documento de referencia para desarrollo, onboarding y asistencia por IA.  
> **Última actualización:** 8 de febrero de 2026

---

## 1. ¿QUÉ ES MYROOMIE.MX?

**MyRoomie.mx** es una plataforma web para conectar personas que buscan compartir departamento o encontrar roomie en México. Es un marketplace bilateral que funciona como punto de encuentro entre:

- **Ofertantes de espacio** — Quienes tienen un cuarto, departamento o casa disponible para rentar.
- **Buscadores de roomie** — Quienes buscan dónde vivir o con quién compartir un espacio.

El proyecto nace como **alternativa moderna** a grupos de Facebook, Craigslist y sitios con UX anticuada, enfocada en experiencia de usuario tipo startup, matching por estilo de vida y búsqueda por ubicación geográfica.

### Propuesta de valor

1. **Matching por estilo de vida** — Filtros y badges que permiten identificar compatibilidad antes de contactar (mascotas, fuma, limpieza, horarios, fiestas).
2. **Perfiles estructurados** — Información clara y comparable, en lugar de posts caóticos en redes sociales.
3. **Mensajería integrada** — Chat directo sin compartir WhatsApp prematuramente; el contacto se da dentro de la plataforma.
4. **100% gratis** — Publicar y buscar es gratuito; la monetización es opcional (planes de promoción para destacar anuncios o perfiles).
5. **Enfoque México** — Pensado para el mercado mexicano: precios en MXN, ciudades prioritarias, español es-MX.

### Tipos de anuncios (listings)

| Tipo | Descripción | Subtype |
|------|-------------|---------|
| **Rento un espacio** | Tengo un cuarto/departamento/casa disponible. Enfoque en el inmueble. | `solo_renta` |
| **Busco roomie** | Busco con quién compartir un espacio que ya tengo o voy a rentar. | `buscar_roomie` |

Los listings incluyen título, descripción, ciudad, zona/colonia, precio (opcional), fotos, amenidades (WiFi, cocina, mascotas, etc.) y preferencias de convivencia.

### Ciudades prioritarias

Monterrey · Ciudad de México · Guadalajara · Puebla · Tijuana (y otras ciudades urbanas de México).

### Flujos de usuario típicos

**Busco un cuarto para rentar**
1. Entro a la landing o directamente a `/listings`.
2. Filtro por ciudad (ej. Monterrey), tipo de anuncio y rango de precio.
3. Veo cards con fotos, precio, zona; hago clic en uno para ver detalle.
4. Leo descripción, amenidades y perfil del anunciante.
5. Si me interesa, guardo en favoritos o contacto por mensaje.
6. La conversación sigue en `/messages` sin dar mi teléfono hasta acordar visita.

**Quiero rentar mi cuarto**
1. Creo cuenta o inicio sesión.
2. Completo perfil (nombre, ciudad, zona, bio) en onboarding.
3. Voy a Publicar anuncio → elijo "Rento un espacio".
4. Lleno formulario: título, descripción, precio, fotos, amenidades.
5. Publico; el anuncio aparece en `/listings` y en mi dashboard.
6. Recibo mensajes de interesados en mi inbox; respondo y coordino visitas.

**Busco roomie para compartir departamento**
1. Creo perfil con mis preferencias (mascotas sí/no, horario día/noche, etc.).
2. Voy a `/explore` para ver otros roomies o publico anuncio "Busco roomie".
3. Filtro por badges de compatibilidad (ej. Pet-friendly, trabajo de día).
4. Contacto a quienes coinciden; conversamos por mensajes.
5. Acordamos videollamada (recomendado en página de Seguridad) y luego visita presencial.

---

## 2. PÚBLICO OBJETIVO Y PERSONAS

| Persona | Descripción | Casos de uso |
|---------|-------------|--------------|
| **Estudiante** | 18–24 años, se muda por universidad o beca | Buscar cuarto cerca de campus; encontrar roomie para rentar juntos |
| **Joven profesionista** | 25–35 años, primer empleo o cambio de ciudad | Buscar departamento compartido; rentar cuarto propio para reducir gastos |
| **Persona que se muda** | Cualquier edad, cambio de ciudad por trabajo o familia | Explorar opciones antes de llegar; publicar espacio que deja vacante |
| **Propietario / Arrendador** | Tiene inmueble y quiere rentar por cuarto | Publicar anuncio con fotos y amenidades; recibir contactos cualificados |

---

## 3. PROBLEMAS QUE RESUELVE

| Problema | Solución en MyRoomie.mx |
|----------|-------------------------|
| **Falta de verificación** | Perfiles públicos con avatar, bio y preferencias; sistema de reportes |
| **Matching superficial** | Badges de lifestyle (mascotas, fuma, limpieza, horarios) para escanear compatibilidad |
| **Seguridad** | Mensajería integrada; página de consejos de seguridad; sin compartir datos personales hasta acordar |
| **Desorden en Facebook** | Listings estructurados con filtros, precios y búsqueda por ciudad |
| **Sitios con UX vieja** | Diseño moderno, minimalista, responsive; inspirado en Airbnb y Stripe |

---

## 4. ALCANCE ACTUAL (MVP)

### Incluido

- **Perfiles completos** — Nombre, ciudad, zona, avatar, bio, presupuesto, preferencias de lifestyle (mascotas, fuma, limpieza, fiestas, horario).
- **Listings estructurados** — Anuncios con tipo, precio, descripción, fotos, amenidades, ubicación.
- **Mensajería integrada** — Chat entre usuarios; threads vinculados opcionalmente a un listing.
- **Búsqueda y filtros** — Explorar perfiles por ciudad/badge; filtrar listings por ciudad, tipo, precio.
- **Guardados** — Guardar listings favoritos para revisar después.
- **Promoción** — Planes de pago para destacar perfil o anuncio.
- **Reportes** — Reportar anuncios, perfiles o mensajes inapropiados.
- **Autenticación** — Email/password + Google OAuth; recuperación de contraseña.
- **Legal** — Términos, privacidad, seguridad.
- **SEO** — Sitemap, robots.txt, metadata.

### Modelo de monetización

- **Gratis:** Crear perfil, publicar anuncios, buscar, guardar favoritos, mensajería.
- **Opcional — Promoción:** Planes de pago para destacar perfil o anuncio (`featured_until`); los destacados aparecen en la landing y arriba en resultados. Rutas: `/promote/profile`, `/promote/listing/[id]`.

### No incluido (roadmap futuro)

- Matching automático por compatibilidad.
- Reviews/ratings de usuarios.
- Verificación de identidad avanzada.
- Notificaciones push en tiempo real.
- Pagos de renta dentro de la plataforma.

---

## 5. RESUMEN TÉCNICO

- **Dominio:** https://www.myroomie.mx
- **Filosofía de diseño:** moderno, minimalista, startup style (inspirado en Airbnb, Stripe, Notion).
- **Idioma:** 100% español (es-MX).

---

## 6. STACK TÉCNICO

| Capa | Tecnología |
|------|------------|
| Framework | Next.js 14 (App Router) |
| UI | React 18, Tailwind CSS |
| Backend | Supabase (Auth, PostgreSQL, Storage) |
| Validación | Zod (parcial), utilidades propias en `lib/validation` |
| Idioma | 100% español (es-MX) |

### Dependencias principales
- `@supabase/ssr` — Auth con cookies en Server Components
- `@supabase/supabase-js` — Cliente Supabase
- `next` 14.2 — App Router, Server Actions, RSC
- `zod` — Validación (uso limitado)

### Variables de entorno requeridas
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (APIs geo, operaciones privilegiadas)
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (autocompletado de zonas)

---

## 7. ESTRUCTURA DEL PROYECTO

```
myroomie.mx/
├── app/
│   ├── layout.tsx              # Layout raíz, metadata, Header, Footer
│   ├── page.tsx                # Landing
│   ├── globals.css
│   ├── Header.tsx              # Navbar (server component)
│   ├── auth/callback/route.ts  # OAuth Google callback
│   ├── api/
│   │   ├── search/route.ts     # Búsqueda listings + profiles (QuickSearchDropdown)
│   │   ├── geo/
│   │   │   ├── forward/route.ts
│   │   │   ├── reverse/route.ts
│   │   │   └── zones/route.ts  # Autocompletado zonas (Mapbox)
│   │   └── locations/upsert/route.ts
│   ├── account/                # Configuración de cuenta
│   ├── dashboard/              # Panel del usuario
│   ├── explore/                # Grid roomies con filtros
│   ├── forgot-password/        # Recuperar contraseña
│   ├── legal/
│   │   ├── terms/
│   │   ├── privacy/
│   │   └── safety/
│   ├── listings/
│   │   ├── page.tsx            # Grid anuncios
│   │   ├── new/                # Crear anuncio
│   │   └── [id]/
│   │       ├── page.tsx        # Detalle
│   │       ├── edit/           # Editar anuncio
│   │       ├── OwnerActions.tsx
│   │       ├── SaveButton.tsx
│   │       ├── ContactForm.tsx
│   │       └── actions.ts
│   ├── login/                  # Iniciar sesión
│   ├── signup/                 # Registro
│   ├── reset-password/         # Nueva contraseña tras link
│   ├── messages/               # Chat interno
│   ├── profiles/
│   │   ├── [user_id]/          # Perfil público
│   │   └── edit/               # Editar perfil
│   ├── onboarding/
│   │   ├── step-1/             # Crear perfil base
│   │   └── step-2/             # Estilo de vida (opcional)
│   ├── promote/
│   │   ├── profile/            # Planes promoción perfil
│   │   └── listing/[id]/       # Planes promoción anuncio
│   ├── saved/                  # Listings guardados
│   ├── shortlist/              # Redirect → /saved
│   ├── matches/                # Placeholder "Próximamente"
│   ├── security/               # Consejos de seguridad
│   ├── sitemap.ts              # Sitemap dinámico
│   └── robots.ts               # robots.txt
├── lib/
│   ├── supabase/
│   │   ├── server.ts           # createServerSupabaseClient (cookies)
│   │   └── client.ts           # createBrowserSupabaseClient
│   ├── auth.ts                 # signUp, signIn, signOut
│   ├── requireAuth.ts          # requireAuthOrRedirect
│   ├── requireProfile.ts       # requireProfileOrRedirect (perfil en profiles)
│   ├── utils/
│   │   └── formatDate.ts       # formatDate, formatDateShort (es-MX)
│   └── rateLimit.ts            # checkGeoRateLimit (APIs geo)
├── app/components/
│   ├── Footer.tsx
│   ├── HeaderModeTabs.tsx      # Tabs Anuncios / Roomies
│   ├── UserMenu.tsx            # Dropdown usuario autenticado
│   ├── LogoLink.tsx
│   ├── CityPills.tsx           # Filtro ciudad (explore, listings)
│   ├── ReportButton.tsx
│   ├── TrustPanel.tsx
│   ├── LifestyleBadges.tsx
│   ├── search/
│   │   ├── QuickSearchDropdown.tsx  # Búsqueda navbar (debounced)
│   │   ├── GlobalSearchBar.tsx      # Búsqueda avanzada (no expuesto en UI)
│   │   ├── FilterPopovers.tsx
│   │   ├── SearchInput.tsx
│   │   └── LocationPicker.tsx
│   ├── home/
│   │   ├── HomeFeaturedListings.tsx   # Con fallback a recientes
│   │   ├── HomeFeaturedProfiles.tsx   # Con fallback a recientes
│   │   ├── HomeSection.tsx
│   │   ├── HomeSearchBar.tsx
│   │   └── FeaturedCarousel.tsx
│   ├── listings/
│   │   ├── ListingCard.tsx
│   │   ├── ListingGallery.tsx  # Carousel, lightbox, thumbnails
│   │   ├── ListingImage.tsx
│   │   └── ImageUploader.tsx
│   ├── roomies/
│   │   └── RoomieCard.tsx
│   └── ui/
│       ├── Badge.tsx
│       ├── Button.tsx
│       ├── Pagination.tsx
│       ├── AmenitiesSelector.tsx
│       └── EmptyState.tsx
├── app/lib/
│   ├── validation/
│   │   ├── listing.ts
│   │   └── profile.ts
│   ├── search/
│   │   ├── clearLocation.ts
│   │   └── validation.ts
│   └── rateLimit.ts
├── sql/                        # Migraciones manuales
├── public/
│   ├── favicon.ico
│   └── favicon.svg
├── tailwind.config.ts
├── next.config.js
├── package.json
└── BUILD_PLAN.md
```

---

## 8. BASE DE DATOS (Supabase)

**Proyecto ID:** `urispaxtwquqoqsiyedf`  
**RLS:** Habilitado en todas las tablas.

### Tablas

| Tabla | Descripción | Filas (aprox) |
|-------|-------------|---------------|
| `profiles` | Perfiles roomie (display_name, city, zone, bio, lifestyle) | ~3 |
| `listings` | Anuncios (room / roommate) | ~3 |
| `threads` | Hilos de mensajería entre 2 usuarios | ~6 |
| `messages` | Mensajes dentro de un thread | ~11 |
| `listing_saves` | Guardados (user_id, listing_id) | ~1 |
| `locations` | Ubicaciones geocodificadas | ~10 |
| `reports` | Reportes de usuarios (listing/profile/message) | 0 |

### Esquema detallado

**profiles**
- `user_id` (uuid, PK, FK auth.users)
- `display_name`, `city`, `zone`, `avatar_url`
- `bio`, `budget_min`, `budget_max`
- `location_id` (FK locations)
- `pets`, `smoker`, `parties`, `cleanliness`, `schedule`
- `featured_until`, `created_at`, `updated_at`

**listings**
- `id` (uuid, PK)
- `user_id` (FK profiles)
- `listing_type`: `'room'` | `'roommate'`
- `listing_subtype`: `'solo_renta'` | `'buscar_roomie'`
- `title`, `description`, `price_mxn`
- `city`, `zone`, `location_id`
- `image_urls` (text[])
- `amenities` (text[])
- `lifestyle_prefs` (jsonb)
- `is_active`, `featured_until`
- `created_at`, `updated_at`

**threads**
- `id`, `user1_id`, `user2_id`, `listing_id` (nullable), `created_at`

**messages**
- `id`, `thread_id`, `sender_id`, `body`, `created_at`

**listing_saves**
- `id`, `user_id`, `listing_id`, `created_at`

**locations**
- `id`, `provider`, `place_id`, `label`, `city`, `region`, `country`, `lat`, `lng`, `created_at`

**reports**
- `id`, `reporter_id`, `reported_type`, `reported_id`, `reason`, `details`, `created_at`

### Índices recomendados (ya implementados)
- `listings`: `(city)`, `(created_at)`, `(is_active)`
- `profiles`: `(city)`
- `listing_saves`: `(user_id)`

---

## 9. RUTAS Y PÁGINAS

| Ruta | Protección | Descripción |
|------|------------|-------------|
| `/` | Pública | Landing con stats, pills ciudad, destacados/recientes |
| `/explore` | Pública | Grid roomies con filtros por badge |
| `/listings` | Pública | Grid anuncios con filtros (ciudad, tipo, precio) |
| `/listings/[id]` | Pública | Detalle anuncio (galería, amenidades, owner actions) |
| `/listings/new` | Auth + Profile | Crear anuncio |
| `/listings/[id]/edit` | Owner | Editar anuncio propio |
| `/profiles/[user_id]` | Pública | Perfil público roomie |
| `/profiles/edit` | Auth + Profile | Editar perfil propio |
| `/onboarding/step-1` | Auth | Crear perfil (obligatorio si no existe) |
| `/onboarding/step-2` | Auth + Profile | Estilo de vida (opcional) |
| `/login` | Pública | Email/password + Google |
| `/signup` | Pública | Registro |
| `/forgot-password` | Pública | Recuperar contraseña |
| `/reset-password` | Pública | Nueva contraseña tras link |
| `/dashboard` | Auth + Profile | Panel del usuario |
| `/messages` | Auth + Profile | Chat interno |
| `/messages/[thread_id]` | Auth + Profile | Conversación |
| `/saved` | Auth + Profile | Listings guardados |
| `/shortlist` | Redirect | → `/saved` |
| `/matches` | Auth + Profile | Placeholder "Próximamente" |
| `/account` | Auth + Profile | Configuración de cuenta |
| `/promote/profile` | Auth + Profile | Planes promoción perfil |
| `/promote/listing/[id]` | Owner | Planes promoción anuncio |
| `/legal/terms` | Pública | Términos de uso |
| `/legal/privacy` | Pública | Privacidad |
| `/legal/safety` | Pública | (si existe) |
| `/security` | Pública | Consejos de seguridad |

### Protección
- **requireAuthOrRedirect()** — Solo verifica sesión.
- **requireProfileOrRedirect()** — Verifica sesión + perfil en `profiles`; si no hay perfil → `/onboarding/step-1`.
- **No hay middleware de Next.js** — Los guards se llaman manualmente en cada página protegida.

---

## 10. AUTENTICACIÓN

### Flujos
1. **Email/password:** `signUp`, `signIn` en `lib/auth.ts`. Después del login, si no hay perfil → redirect a `/onboarding/step-1`.
2. **Google OAuth:** Login con `signInWithOAuth`, callback en `app/auth/callback/route.ts`. Intercambia `code` por sesión, verifica perfil, redirect a `next` o onboarding.
3. **Forgot/Reset password:** `/forgot-password` envía email con Supabase; `/reset-password` recibe token y actualiza contraseña.

### Clientes Supabase
- **Server:** `createServerSupabaseClient()` — usa cookies para sesión.
- **Browser:** `createBrowserSupabaseClient()` — para client components y Server Actions que requieren sesión del usuario.

---

## 11. SERVER ACTIONS PRINCIPALES

| Archivo | Funciones |
|---------|-----------|
| `app/listings/[id]/actions.ts` | `updateListing`, `deleteListing`, `toggleListingActive`, `getOrCreateListingThread`, `toggleSave` |
| `app/listings/new/actions.ts` | `createListing`, `attachListingImages` |
| `app/onboarding/step-1/actions.ts` | `getMyProfile`, `saveMyProfile` |
| `app/onboarding/step-2/actions.ts` | `getMyLifestyle`, `saveMyLifestyle` |
| `app/profiles/edit/actions.ts` | `updateProfile` |
| `app/account/actions.ts` | `updateProfile` (config cuenta) |
| `app/messages/actions.ts` | `findOrCreateThread`, `sendMessage`, `markThreadAsRead` |
| `app/login/actions.ts` | `hasProfile` |
| `app/logout/actions.ts` | `logout` |
| `app/promote/profile/actions.ts` | `activateProfilePromotion` |
| `app/promote/listing/actions.ts` | `activateListingPromotion` |

---

## 12. API ROUTES

| Ruta | Método | Descripción |
|------|--------|-------------|
| `/api/search` | GET | `q` → listings + profiles (máx 5 cada uno) |
| `/api/geo/zones` | GET | `q`, `location_id` → zonas (Mapbox, rate limited) |
| `/api/geo/forward` | GET | Geocoding forward |
| `/api/geo/reverse` | GET | Geocoding reverse |
| `/api/locations/upsert` | POST | Crear/actualizar location |

---

## 13. VALIDACIÓN

### Listings (`app/lib/validation/listing.ts`)
- **Título:** 10–80 caracteres
- **Descripción:** 30–2000 caracteres
- **Precio:** 500–80,000 MXN (entero, opcional)
- **Ciudad/Zona:** 2–80 caracteres (o `location_id` válido)
- **listing_type:** `'room'` | `'roommate'`
- **listing_subtype:** `'solo_renta'` | `'buscar_roomie'`

### Perfiles (`app/lib/validation/profile.ts`)
- **display_name:** 2–40 caracteres
- **bio:** 30–400 si se proporciona
- **age:** 18–99 si se proporciona
- **cleanliness:** 1–3
- **schedule:** `'day'` | `'night'`

---

## 14. DISEÑO Y ESTILOS

### Colores (Tailwind)
- **brand:** `#FF7A18`
- **brandHover:** `#E96A0F`
- **brandSoft:** `#FFF1E8`
- **brandBorder:** `#FFD6BD`
- **brandText:** `#A63C00`
- **ink:** `#111827`
- **muted:** `#6B7280`

### Convención
- Usar tokens `brand`, `brandHover`, etc. en lugar de `orange-*` hardcodeados.

### Imágenes
- `next.config.js` incluye hostname Supabase para `next/image`.
- Supabase Storage: bucket público para avatares y fotos de listings.

---

## 15. AMENIDADES

Lista fija en `AmenitiesSelector.tsx`:
- Esenciales: WiFi, Cocina, Lavadora, Refrigerador
- Habitación: Cama, Clóset, Escritorio, Baño Propio
- Comodidades: Aire Acondicionado, Calefacción, Estacionamiento
- Reglas: Pet-friendly, Smoke-friendly, Elevador, Seguridad 24/7

---

## 16. COMPONENTES CLAVE

- **QuickSearchDropdown:** Búsqueda debounced en navbar; llama `/api/search`, muestra resultados Anuncios/Roomies.
- **ListingGallery:** Carousel, lightbox, thumbnails en detalle de listing.
- **CityPills:** Filtro por ciudad en explore y listings.
- **Pagination:** `.range()` para paginación en explore y listings.
- **OwnerActions:** Editar, Marcar rentado, Promocionar, Eliminar (solo dueño del listing).
- **ReportButton:** Modal para reportar listing/profile/message; inserta en `reports`.
- **formatDate / formatDateShort:** Formato es-MX ("21 ene 2026").

---

## 17. SEO

- **sitemap.ts:** Páginas estáticas + listings activos + perfiles (máx 500 cada uno).
- **robots.ts:** Allow `/`, disallow `/dashboard`, `/account`, `/messages`, `/saved`, `/profiles/edit`.
- **Metadata:** `generateMetadata` en páginas principales; template `%s — MyRoomie.mx`.
- **Open Graph:** Configurado en layout.

---

## 18. FLUJOS IMPORTANTES

### Crear anuncio
1. `/listings/new` → Seleccionar tipo (room/roommate) + subtype.
2. `ListingForm` con título, descripción, ciudad, zona, precio, fotos, amenidades, lifestyle.
3. `createListing` → insert en `listings`, luego `attachListingImages` si hay fotos.

### Editar/Eliminar anuncio
- `OwnerActions` en detalle → Editar (`/listings/[id]/edit`), Marcar rentado (`toggleListingActive`), Promocionar, Eliminar (`deleteListing`).
- Al eliminar: se borran en orden `messages` → `threads` → `listing_saves` → `listing` (por constraints).

### Guardados
- `SaveButton` en detalle → `toggleSave` (insert/delete en `listing_saves`).
- `/saved` muestra listings guardados con metadata.

### Mensajería
- `getOrCreateListingThread` o `findOrCreateThread` → crea thread si no existe.
- `sendMessage` inserta en `messages`.
- Tiempo real opcional con Supabase Realtime (si está configurado).

### Login con Google
1. `signInWithOAuth({ provider: 'google' })` con `redirectTo` incluyendo `next`.
2. Callback `/auth/callback` recibe `code`, `exchangeCodeForSession`, verifica perfil, redirect.

---

## 19. ARCHIVOS DE REFERENCIA

- **BUILD_PLAN.md** — Plan de producción, sprints, auditorías.
- **PROJECT.md** — Visión y decisiones de producto.
- **TECHNICAL_AUDIT*.md** — Auditorías técnicas previas.
- **AMENITIES_SELECTOR.md** — Documentación del selector de amenidades.

---

## 20. DECISIONES TÉCNICAS IMPORTANTES

1. **Sin middleware:** Evita loops de redirect; cada página protegida usa `requireAuthOrRedirect` o `requireProfileOrRedirect`.
2. **Shortlist unificado en /saved:** `/shortlist` redirige a `/saved`; menú muestra "Guardados".
3. **Fallback en landing:** Si no hay destacados (`featured_until`), se muestran recientes en lugar de sección vacía.
4. **Formato de fechas:** Usar `formatDate` / `formatDateShort` de `lib/utils/formatDate.ts` para consistencia.
5. **Supabase Storage:** Configurar en `next.config.js` para usar `next/image` con URLs de Supabase.

---

*Documento generado para sesiones de desarrollo y asistencia por IA.*
