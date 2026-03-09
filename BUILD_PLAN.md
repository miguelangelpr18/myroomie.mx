# MyRoomie.mx — Build Plan para Producción

> Contexto completo del proyecto para sesiones de desarrollo asistido por IA.  
> Stack: Next.js · React · Tailwind CSS · Supabase (Auth + DB + Storage) · PostgreSQL · Leaflet  
> Color principal: `#FF7A18` · Dominio: `https://www.myroomie.mx`

---

## CONTEXTO DEL PROYECTO

MyRoomie.mx es una plataforma para encontrar roommates y habitaciones en renta en México. Alternativa moderna a grupos de Facebook y sitios con UX vieja. Enfocada en UX startup, matching por estilo de vida y búsqueda por ubicación.

**Público objetivo:** 18–35 años · estudiantes, jóvenes profesionistas, personas que se mudan de ciudad.  
**Ciudades prioritarias:** Monterrey · Ciudad de México · Guadalajara.  
**Filosofía de diseño:** moderno, minimalista, startup style. Inspirado en Airbnb, Stripe, Notion.

---

## ESTADO ACTUAL DEL MVP (lo que ya existe)

### Páginas y rutas existentes

| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/` | ✅ Funciona | Landing page básica |
| `/explore` | ✅ Funciona | Grid de perfiles roomie con filtros por badge |
| `/listings` | ✅ Funciona | Grid de anuncios con filtro tipo/precio |
| `/listings/[id]` | ✅ Funciona | Detalle de anuncio |
| `/listings/new` | ✅ Funciona | Crear anuncio (tipo selector + form) |
| `/profiles/[id]` | ✅ Funciona | Detalle de perfil roomie |
| `/onboarding/step-1` | ✅ Funciona | Crear perfil roomie (1 solo paso) |
| `/login` | ✅ Funciona | Login con email/password |
| `/signup` | ✅ Funciona | Registro con email/password |
| `/dashboard` | ✅ Funciona | Panel del usuario autenticado |
| `/messages` | ✅ Funciona | Chat interno (lista + conversación) |
| `/account` | ✅ Funciona | Configuración de cuenta |
| `/shortlist` | ❌ Placeholder | Solo muestra "Coming soon" |
| `/matches` | ❌ Placeholder | Solo muestra "Coming soon" |
| `/promote/profile` | ✅ Funciona | Planes de promoción de perfil |
| `/promote/listing/[id]` | ✅ Funciona | Planes de promoción de anuncio |
| `/legal/terms` | ✅ Funciona | Términos y condiciones |
| `/legal/privacy` | ✅ Funciona | Política de privacidad |
| `/security` | ❌ Placeholder | Solo dice "(placeholder)" |

### Componentes y funcionalidades ya implementadas

- Sistema de autenticación completo con Supabase Auth
- Chat/mensajería en tiempo real (funciona bien)
- Subida de fotos para listings (Supabase Storage)
- Subida de avatar de usuario
- Sistema de promoción/monetización con planes de precios
- Filtros básicos en explore (por lifestyle badge)
- Filtros básicos en listings (tipo de anuncio, precio min/max)
- Onboarding básico de perfil roomie
- Formulario completo de creación de anuncio con amenidades
- Verificaciones placeholder en dashboard y account
- Páginas legales (términos, privacidad)

---

## PROBLEMAS CRÍTICOS A RESOLVER (P0 — Primero)

Estos bloquean que la app se vea profesional. Resolver ANTES de cualquier feature nueva.

### P0-1: Datos de prueba en producción
**Problema:** Hay listings con nombres basura ("fdsjbfnabnb", "adsfadfkdnfjnfjd") y precios irreales ($7,723,762 MXN/mes) visibles en producción.  
**Solución:** Ejecutar queries de limpieza en Supabase para eliminar registros de prueba. Identificarlos por precios > 100,000 o títulos con patrones aleatorios.

### P0-2: Favicon faltante (404)
**Problema:** `GET /favicon.ico` retorna 404. El browser lo muestra en consola como error.  
**Solución:** Agregar `/public/favicon.ico`, `/public/favicon.svg` y meta tags en `app/layout.tsx`:
```tsx
// app/layout.tsx — agregar en metadata
icons: {
  icon: '/favicon.ico',
  shortcut: '/favicon.ico',
  apple: '/apple-touch-icon.png',
}
```

### P0-3: Shortlist y Matches en el menú con "Coming soon"
**Problema:** Dos rutas del menú principal llevan a páginas vacías.  
**Solución:** Opción A (inmediata): quitar del menú. Opción B (recomendada): implementar Guardados funcional (ver Sprint 2).

### P0-4: Página de Seguridad con texto "(placeholder)"
**Problema:** `/security` está en el footer de TODAS las páginas y muestra contenido placeholder.  
**Solución:** Escribir contenido real con consejos de seguridad para conocer roomies.

### P0-5: Mezcla sistemática inglés/español
**Problema:** Más de 20 strings en inglés en una app completamente en español.  
**Lista completa de cambios:**

| Ubicación | Actual | Correcto |
|-----------|--------|----------|
| Menú dropdown usuario | Dashboard | Panel |
| Menú dropdown usuario | Inbox | Mensajes |
| Menú dropdown usuario | Shortlist | Guardados |
| Menú dropdown usuario | Matches | Compatibles |
| Menú dropdown usuario | Account | Mi cuenta |
| Menú dropdown usuario | Log out | Cerrar sesión |
| `/dashboard` heading | Your profile | Tu perfil |
| `/dashboard` heading | Your listings | Tus anuncios |
| `/dashboard` sección | Verifications | Verificaciones |
| `/dashboard` badge | Active | Activo |
| `/dashboard` y `/account` | Verify phone | Verificar teléfono |
| `/dashboard` y `/account` | Verify ID | Verificar identificación |
| `/dashboard` y `/account` | Social media | Redes sociales |
| `/dashboard` y `/account` | Credit check | Reporte de crédito |
| Varios | Coming soon | Próximamente |
| `/account` heading | Account Settings | Configuración de cuenta |
| `/onboarding/step-1` | Display Name | Nombre de perfil |
| `/profiles/[id]` | Messages | Mensajes |

### P0-6: Sin "Olvidé mi contraseña"
**Problema:** No hay forma de recuperar acceso.  
**Solución:** Agregar link en `/login` y crear página `/forgot-password` usando `supabase.auth.resetPasswordForEmail()`.

### P0-7: Title de página siempre "myroomie.mx"
**Problema:** Todas las páginas tienen el mismo `<title>`, malo para SEO y UX.  
**Solución:** Implementar `generateMetadata()` en cada page.tsx con títulos dinámicos.

---

## SPRINT 1 — Limpieza y Base

**Duración estimada:** 1–2 semanas  
**Objetivo:** App sin placeholders, sin datos basura, en español completo, con SEO básico.

### Tareas del Sprint 1

#### 1.1 Limpiar datos de prueba de producción
- Ejecutar en Supabase: eliminar listings con precios > 100,000 MXN o títulos con patrones de prueba
- Eliminar perfiles de prueba con ubicaciones sin sentido
- Conservar solo datos reales

#### 1.2 Agregar favicon y meta tags base
**Archivo:** `app/layout.tsx`
- Agregar favicon.ico en `/public/`
- Agregar Open Graph base en el metadata de layout
- Agregar `apple-touch-icon.png`

#### 1.3 Traducir todos los textos al español
**Archivos afectados:**
- Componente de navbar/dropdown de usuario
- `/app/dashboard/page.tsx`
- `/app/account/page.tsx`
- `/app/shortlist/page.tsx`
- `/app/matches/page.tsx`
- `/app/onboarding/step-1/page.tsx`
- `/app/profiles/[id]/page.tsx`

#### 1.4 Quitar Shortlist y Matches del menú (temporal)
**Archivo:** componente navbar/dropdown
- Eliminar links a `/shortlist` y `/matches` hasta que estén implementados
- O reemplazar con "Próximamente" deshabilitado visualmente

#### 1.5 Crear página de Seguridad con contenido real
**Archivo:** `app/security/page.tsx`
Contenido a incluir:
- Consejos para conocer roomies de forma segura
- Recomendación de videollamada antes de cerrar trato
- Señales de alerta (red flags)
- Cómo reportar usuarios sospechosos
- Políticas de MyRoomie para proteger usuarios

#### 1.6 Agregar "Olvidé mi contraseña"
**Archivos nuevos:** `app/forgot-password/page.tsx`, `app/reset-password/page.tsx`
- Formulario con campo de email
- Llamar `supabase.auth.resetPasswordForEmail(email, { redirectTo })`
- Página de confirmación
- Agregar link en `app/login/page.tsx`

#### 1.7 Implementar títulos dinámicos de página (metadata)
**Archivos afectados:** todos los `page.tsx` con `generateMetadata()`

```tsx
// Ejemplos de títulos
'/' → 'MyRoomie.mx — Encuentra tu roomie ideal en México'
'/explore' → 'Explorar Roomies en México — MyRoomie.mx'
'/listings' → 'Cuartos en Renta con Roomies — MyRoomie.mx'
'/listings/[id]' → '[Título del listing] en [Ciudad] — MyRoomie.mx'
'/profiles/[id]' → 'Perfil de [Nombre] en [Ciudad] — MyRoomie.mx'
'/dashboard' → 'Mi Panel — MyRoomie.mx'
'/messages' → 'Mensajes — MyRoomie.mx'
```

#### 1.8 Implementar Open Graph tags para sharing
**Archivos afectados:** `app/listings/[id]/page.tsx`, `app/profiles/[id]/page.tsx`
- OG title, description, image, url para listings y profiles
- Usar la primera foto del listing o el avatar del perfil como og:image

---

## SPRINT 2 — Features Core Faltantes

**Duración estimada:** 2–3 semanas  
**Objetivo:** Completar funcionalidades básicas que se sienten incompletas.

### Tareas del Sprint 2

#### 2.1 Sistema de Guardados (Favoritos)
**Nueva tabla en Supabase:**
```sql
CREATE TABLE saved_listings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, listing_id)
);
-- RLS: usuario solo puede ver/modificar sus propios guardados
```

**Cambios en UI:**
- Botón ❤️ "Guardar" en `/listings/[id]` que funcione (actualmente redirige a login)
- Botón ❤️ en las cards de listings en `/listings`
- Implementar `/shortlist` mostrando los listings guardados con opción de quitar

#### 2.2 Editar y Eliminar anuncio
**Nueva ruta:** `app/listings/[id]/edit/page.tsx`  
**Cambios en `/listings/[id]`:** cuando el dueño ve su propio listing, mostrar:
```
[Editar anuncio]  [Marcar como rentado]  [Eliminar]  [Promocionar]
```
**Cambios en `/dashboard`:** agregar botones Editar | Ver | Eliminar por cada listing.

#### 2.3 Editar perfil roomie
**Ruta existente para reutilizar:** `/onboarding/step-1` o nueva ruta `app/profiles/edit/page.tsx`  
El usuario debe poder editar: nombre, ubicación, zona, avatar, badges de estilo de vida, bio, edad.

#### 2.4 Carousel de fotos en listing detail
**Archivo:** `app/listings/[id]/page.tsx` o componente `ListingGallery`
- Navegación con flechas prev/next
- Indicador de foto actual (1/3, 2/3...)
- Click para abrir en lightbox (modal fullscreen)
- Fallback si solo hay 1 foto (sin flechas)

#### 2.5 Mostrar amenidades en listing detail
**Problema:** El formulario guarda amenidades pero el detalle NO las muestra.  
**Archivo:** `app/listings/[id]/page.tsx`
- Leer campo de amenidades del listing desde Supabase
- Renderizar badges con íconos: WiFi, Cocina, Lavadora, etc.
- Sección "Lo que incluye este espacio"

#### 2.6 Filtro por ciudad en /explore y /listings
**Archivos:** `app/explore/page.tsx`, `app/listings/page.tsx`
- Agregar dropdown o pills de ciudad: `Todas | Monterrey | CDMX | Guadalajara`
- Filtrar resultados por el campo `city` de la BD
- Mantener el filtro en la URL como query param `?city=monterrey`

#### 2.7 Corregir filtro de precio en /listings
**Problema:** Los inputs de precio tienen `valuemax="0" valuemin="0"` y no funcionan.  
**Archivo:** `app/listings/page.tsx`  
- Revisar el estado y los handlers del filtro de precio
- Asegurar que el query a Supabase incluya `gte('price', min)` y `lte('price', max)`

#### 2.8 Fotos de listings en la sección de anuncios del perfil
**Archivo:** `app/profiles/[id]/page.tsx`  
- La sección "Anuncios publicados" actualmente muestra solo texto
- Agregar la foto principal de cada listing en las cards

#### 2.9 Normalizar formato de fechas
**Problema:** Fechas inconsistentes — algunas muestran `21/1/2026`, otras `16/2/2026`.  
**Solución:** Usar una función utilitaria consistente:
```ts
// utils/formatDate.ts
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-MX', { 
    day: '2-digit', month: 'short', year: 'numeric' 
  }).format(new Date(date))
  // Resultado: "21 ene 2026"
}
```

#### 2.10 Acción diferenciada en listing detail para el dueño
**Archivo:** `app/listings/[id]/page.tsx`  
- Si `session.user.id === listing.user_id`: mostrar acciones de gestión
- Si no: mostrar botones Contactar y Guardar
- El "Contactar" autenticado debe abrir el chat directamente, no redirigir

---

## SPRINT 3 — UX y Crecimiento

**Duración estimada:** 2–3 semanas  
**Objetivo:** Experiencia más rica para retener usuarios y crecer.

### Tareas del Sprint 3

#### 3.1 Landing page mejorada
**Archivo:** `app/page.tsx`

Estructura nueva propuesta:
```
[HERO]
  Headline + Subheadline
  Pills de ciudad: Monterrey | CDMX | Guadalajara
  CTA: [Buscar roomie] [Ver anuncios] [Publicar]
  Stats: X anuncios · X roomies · X ciudades

[PREVIEW DE CONTENIDO]
  "Anuncios recientes" — 3-4 cards de listings reales
  "Roomies disponibles" — 3-4 cards de perfiles reales

[CÓMO FUNCIONA]
  1. Crea tu perfil o publica tu espacio
  2. Encuentra personas compatibles
  3. Conecta por chat y conoce en persona

[FEATURES]
  Mapa interactivo · Filtros de estilo de vida · Chat directo
  Perfiles detallados · 100% gratis para buscar · Sin intermediarios

[FOOTER REAL]
  Logo · Descripción · Redes sociales · Links legales · Ciudades
```

#### 3.2 Búsqueda funcional en navbar
**Archivo:** componente de búsqueda global
- Al escribir en el searchbar, mostrar resultados en dropdown
- Buscar en: listings (título, ciudad, zona) y perfiles (nombre, ciudad)
- Query Supabase con `.ilike('title', '%query%')` o full-text search
- Al seleccionar resultado, navegar al listing o perfil

#### 3.3 Mapa de ubicación en listing detail
**Archivo:** `app/listings/[id]/page.tsx`  
**Componente nuevo:** `ListingMap.tsx`
- Usar Leaflet (ya instalado en el proyecto)
- Mostrar mapa centrado en la zona/colonia del listing
- NO revelar dirección exacta — mostrar radio de ~500m
- Fallback si no hay coordenadas guardadas

**Para funcionar correctamente**, el formulario de creación también debe guardar lat/lng:
- Geocodificar la ubicación al guardar el listing (usar Nominatim API — gratuito)
- Guardar `lat` y `lng` en la tabla `listings`

#### 3.4 Dashboard con estadísticas básicas
**Archivo:** `app/dashboard/page.tsx`

Agregar sección de stats:
```tsx
// Datos a obtener de Supabase:
// - Suma de views de todos mis listings (si tienes tabla de views)
// - Count de mensajes recibidos esta semana
// - Count de guardados de mis listings
```

Si no hay tabla de views aún, agregar:
```sql
CREATE TABLE listing_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES auth.users(id),
  viewed_at TIMESTAMPTZ DEFAULT now()
);
```

#### 3.5 Indicador de completitud de perfil
**Archivo:** `app/dashboard/page.tsx`

Lógica:
```ts
const profileFields = {
  nombre: !!profile.display_name,        // +20%
  foto: !!profile.avatar_url,            // +20%
  ubicacion: !!profile.city,             // +15%
  bio: !!profile.bio,                    // +15%
  badges: profile.badges?.length > 0,   // +15%
  edad: !!profile.age,                   // +15%
}
const completion = Object.values(profileFields).filter(Boolean).length / 6 * 100
```

Mostrar barra de progreso + sugerencias de qué falta completar.

#### 3.6 Onboarding multi-paso con más datos
**Archivos:** `app/onboarding/step-1/page.tsx`, `app/onboarding/step-2/page.tsx`

**Step 1 (básico):** Nombre, Ubicación, Zona, Avatar, Edad, Ocupación
**Step 2 (estilo de vida):** Selección de lifestyle badges:
```
PET FRIENDLY · NO FUMO · ESTUDIO EN CASA · TRABAJO REMOTO
ORDENADO · TRANQUILO · SOCIAL · NOCTÁMBULO · TEMPRANERO
VEGETARIANO · CON HIJOS · SIN FIESTAS · SOLO FINES DE SEMANA
```
**Step 3 (búsqueda):** Presupuesto máximo, fecha de disponibilidad, preferencias de roomie.

Indicador de progreso: `Paso 1 de 3 ████░░`

#### 3.7 Login con Google
**Archivo:** `app/login/page.tsx`
```tsx
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: { redirectTo: `${window.location.origin}/auth/callback` }
})
```
- Crear `app/auth/callback/route.ts` para el callback
- Agregar botón "Continuar con Google" en login y signup

#### 3.8 Botón de reportar usuario/anuncio
**Archivos:** `app/listings/[id]/page.tsx`, `app/profiles/[id]/page.tsx`

Nueva tabla:
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES auth.users(id),
  reported_type TEXT CHECK (reported_type IN ('listing', 'profile', 'message')),
  reported_id UUID NOT NULL,
  reason TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

UI: link discreto "Reportar" en footer de la página de listing/perfil → modal con razones predefinidas.

#### 3.9 Paginación real
**Archivos:** `app/explore/page.tsx`, `app/listings/page.tsx`
- Usar query con `.range(offset, offset + limit - 1)` en Supabase
- Componente `<Pagination>` con prev/next y números de página
- O implementar scroll infinito con Intersection Observer

#### 3.10 Footer real en toda la app
**Archivo:** componente `Footer.tsx`
```
[Logo MyRoomie.mx]
La plataforma para encontrar roomies en México.

Explorar          Legal              Ciudades
Roomies           Términos           Monterrey
Anuncios          Privacidad         CDMX
Publicar          Seguridad          Guadalajara

[Instagram] [TikTok] [Twitter/X]
© 2026 MyRoomie.mx · hola@myroomie.mx
```

---

## SPRINT 4 — Monetización y Escala

**Duración estimada:** 3–4 semanas  
**Objetivo:** Activar ingresos reales y preparar para más ciudades.

### Tareas del Sprint 4

#### 4.1 Integración de pagos con Stripe
**Dependencias:** `stripe`, `@stripe/stripe-js`

Flujo:
1. Usuario hace click en "Promocionar ahora" en `/promote/profile` o `/promote/listing/[id]`
2. Se crea una Stripe Checkout Session en el servidor
3. Usuario es redirigido a Stripe para pago
4. Webhook de Stripe confirma el pago → se activa la promoción en Supabase

```sql
-- Tabla de promociones activas
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  type TEXT CHECK (type IN ('profile', 'listing')),
  target_id UUID, -- profile_id o listing_id
  plan TEXT CHECK (plan IN ('3d', '7d', '30d')),
  stripe_session_id TEXT,
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  active BOOLEAN DEFAULT true
);
```

#### 4.2 Vista de mapa en /listings (toggle Lista/Mapa)
**Archivo:** `app/listings/page.tsx`  
**Componente nuevo:** `ListingsMap.tsx`

Toggle en la parte superior:
```
[≡ Lista]  [🗺 Mapa]
```

En vista mapa:
- Leaflet map centrado en la ciudad seleccionada
- Markers para cada listing con popup mostrando precio y foto mini
- Click en marker → navegar al detalle del listing

#### 4.3 Sistema básico de matches por compatibilidad
**Archivo:** `app/matches/page.tsx`

Lógica de compatibilidad:
```ts
// Calcular score de compatibilidad entre dos perfiles
function calculateCompatibility(myProfile: Profile, otherProfile: Profile): number {
  const myBadges = new Set(myProfile.badges)
  const otherBadges = new Set(otherProfile.badges)
  const intersection = [...myBadges].filter(b => otherBadges.has(b))
  const union = new Set([...myBadges, ...otherBadges])
  return Math.round((intersection.length / union.size) * 100)
}
```

UI: grid de perfiles con % de compatibilidad, ordenados de mayor a menor.

#### 4.4 Sistema de verificación de email (badge)
- Supabase ya tiene `email_confirmed_at` por usuario
- Mostrar badge "Email verificado ✓" en perfiles que tengan el email confirmado
- En `/account`: sección que muestra si el email está verificado, con botón para reenviar verificación si no lo está

#### 4.5 Notificaciones por email
**Servicio:** Resend o SendGrid via Supabase Edge Functions

Notificaciones a implementar:
- Nuevo mensaje recibido (digest diario)
- Alguien vio tu perfil (si está en premium)
- Tu promoción está a punto de expirar (3 días antes)
- Bienvenida al registrarse

#### 4.6 SEO avanzado
- `app/sitemap.ts` — sitemap dinámico con todos los listings y perfiles públicos
- `app/robots.txt` — configurar correctamente
- Structured data (JSON-LD) en listing detail para `ListingPage` schema
- Canonical URLs

#### 4.7 Analytics de dashboard por anuncio
- Mostrar vistas por listing en los últimos 7/30 días
- Gráfica simple (sparkline) de tendencia de vistas
- Requerir tabla `listing_views` del Sprint 3

---

## ESQUEMA DE BASE DE DATOS (referencia)

```sql
-- Tablas principales inferidas del MVP actual

-- Tabla de perfiles (roomies)
profiles (
  id UUID PRIMARY KEY,  -- mismo que auth.users.id
  display_name TEXT,
  city TEXT,
  neighborhood TEXT,
  avatar_url TEXT,
  badges TEXT[],        -- array de lifestyle badges
  bio TEXT,             -- FALTA AGREGAR
  age INTEGER,          -- FALTA AGREGAR
  occupation TEXT,      -- FALTA AGREGAR
  budget_max INTEGER,   -- FALTA AGREGAR
  available_from DATE,  -- FALTA AGREGAR
  created_at TIMESTAMPTZ
)

-- Tabla de anuncios
listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  type TEXT,            -- 'rento_cuarto' | 'busco_depa'
  title TEXT,
  description TEXT,
  city TEXT,
  neighborhood TEXT,
  price INTEGER,
  amenities TEXT[],     -- array de amenidades seleccionadas
  photos TEXT[],        -- URLs de fotos en Storage
  lat FLOAT,            -- FALTA AGREGAR
  lng FLOAT,            -- FALTA AGREGAR
  available_from DATE,  -- FALTA AGREGAR
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ
)

-- Tabla de mensajes
messages / conversations (ya implementada, estructura desconocida)

-- Tablas a AGREGAR:
saved_listings, listing_views, reports, promotions
```

---

## COMPONENTES REUTILIZABLES A CREAR/MEJORAR

### Nuevos componentes

| Componente | Uso | Props principales |
|-----------|-----|-------------------|
| `<ListingGallery>` | Carousel de fotos en listing detail | `photos: string[]` |
| `<ListingMap>` | Mapa de ubicación en listing detail | `lat, lng, neighborhood` |
| `<ListingsMapView>` | Vista de mapa con todos los listings | `listings: Listing[]` |
| `<ProfileCard>` | Card de perfil mejorada con más datos | `profile: Profile` |
| `<ListingCard>` | Card de listing con amenidades/guardado | `listing: Listing, saved?: boolean` |
| `<ProfileCompletion>` | Barra de progreso del perfil | `profile: Profile` |
| `<StatsBar>` | Estadísticas del dashboard | `views, messages, saved` |
| `<Pagination>` | Paginación reutilizable | `page, total, limit, onChange` |
| `<ReportModal>` | Modal de reportar | `targetType, targetId` |
| `<Footer>` | Footer completo de la app | — |

### Componentes a mejorar

| Componente | Mejora necesaria |
|-----------|-----------------|
| Navbar/Header | Hacer consistente en todas las páginas, traducir menú usuario |
| `<ProfileCard>` en explore | Agregar edad, presupuesto, más info |
| Avatar placeholder | Usar inicial + color generado por hash del nombre |
| File upload (avatar) | Reemplazar input nativo con drag-and-drop estilizado |

---

## CONVENCIONES DE CÓDIGO

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── forgot-password/page.tsx
│   └── reset-password/page.tsx
├── (protected)/          ← rutas que requieren auth
│   ├── dashboard/page.tsx
│   ├── messages/page.tsx
│   ├── account/page.tsx
│   ├── shortlist/page.tsx
│   └── matches/page.tsx
├── explore/page.tsx
├── listings/
│   ├── page.tsx
│   ├── new/page.tsx
│   └── [id]/
│       ├── page.tsx
│       └── edit/page.tsx
├── profiles/[id]/page.tsx
├── onboarding/
│   ├── step-1/page.tsx
│   └── step-2/page.tsx
├── promote/
│   ├── profile/page.tsx
│   └── listing/[id]/page.tsx
├── legal/
│   ├── terms/page.tsx
│   └── privacy/page.tsx
├── security/page.tsx
└── layout.tsx

components/
├── ui/              ← componentes base (Button, Input, Badge, Modal, etc.)
├── listings/        ← ListingCard, ListingGallery, ListingMap, ListingsMapView
├── profiles/        ← ProfileCard, ProfileCompletion
├── layout/          ← Navbar, Footer, Sidebar
└── shared/          ← Pagination, ReportModal, StatsBar
```

**Reglas:**
- Usar Tailwind CSS para todos los estilos
- Color principal: `#FF7A18` (orange-500 en Tailwind no es exacto, usar `[#FF7A18]` o CSS variable)
- Todos los textos visibles al usuario en **español**
- Supabase client del lado del servidor vía `createServerClient` (no exponer en client components innecesariamente)
- RLS habilitado en todas las tablas de Supabase

---

## PREGUNTAS PENDIENTES DE CONFIRMAR

Antes de implementar ciertas features, confirmar:

1. **¿Cuál es la estructura exacta de la tabla de listings?** (para agregar campos lat/lng, available_from, room_type)
2. **¿Cuál es la estructura del sistema de mensajes?** (tables: conversations, messages, participants)
3. **¿Las promos ya tienen integración con algún payment provider?** ¿O son solo UI sin backend?
4. **¿Existe alguna lógica de "promoted" que ordene los resultados?** ¿O es placeholder?
5. **¿Hay tabla de `badges` o son strings libres en un array?**
6. **¿El campo `amenities` en listings ya existe en la BD?** ¿O solo en el formulario del frontend?
7. **¿Cuál es el proveedor de email para notificaciones transaccionales?**

---

## INSTRUCCIONES PARA SESIONES DE DESARROLLO

Cuando trabajes en este proyecto, sigue estas reglas:

1. **Siempre analizar el contexto del producto** antes de proponer cambios
2. **Mantener consistencia** con el stack: Next.js App Router + Tailwind + Supabase
3. **Todo texto al usuario en español**, sin mezcla de idiomas
4. **Usar el color `#FF7A18`** como color principal de la marca
5. **Proporcionar código completo** de los archivos modificados
6. **Indicar qué archivos se modifican** en cada cambio
7. **Incluir las queries de Supabase necesarias** (tablas nuevas, RLS policies)
8. **Pensar en mobile-first** para todos los nuevos componentes
9. **No agregar comentarios obvios** en el código — solo los que explican lógica no evidente
10. **Priorizar UX sobre features** — menos cosas pero que funcionen perfecto

---

*MyRoomie.mx Build Plan v1.0 — Generado el 8 de marzo de 2026*
