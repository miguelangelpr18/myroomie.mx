# MyRoomie.mx --- Auditoría y Plan de Producción

> Generado: 6 de abril de 2026
> Evaluación general: **7.5/10** en production-readiness

---

## 1. Auditoría Express: Los 3 Mayores Riesgos

### RIESGO 1 (CRITICO): Secrets Expuestos en `.env.local`

El archivo `.env.local` contiene las llaves reales del proyecto (Supabase service role key, Mapbox token, anon key). Si este archivo fue committeado al historial de Git en algún momento, cualquier persona con acceso al repo puede:

- Usar el `SUPABASE_SERVICE_ROLE_KEY` para **bypasear todo el RLS** y leer/modificar/borrar cualquier dato de la base de datos.
- Usar el token de Mapbox para generar uso en tu cuenta y acumular costos.
- Impersonar cualquier usuario del sistema.

**Acción inmediata:** Rotar TODAS las llaves desde los dashboards de Supabase y Mapbox. Verificar con `git log --all --full-history -- .env.local` si el archivo fue committeado. Si lo fue, considerar esas llaves comprometidas sin importar si ya se borró el archivo del repo actual.

### RIESGO 2 (ALTO): Rate Limiting con Fallback Silencioso

El sistema de rate limiting (`lib/rateLimit.ts`) usa Upstash Redis, pero cuando las variables de entorno de Redis no están configuradas, **el rate limit pasa todas las requests sin bloquear nada**. En producción, si Redis se cae o se desconfigura:

- Los endpoints `/api/geo/forward` y `/api/geo/reverse` quedan completamente abiertos.
- Los Server Actions de creación de listings y mensajes se pueden abusar sin límite.
- Un atacante podría crear miles de listings spam o hacer DDoS a Mapbox a través de tu proxy.

**Acción:** Cambiar el fallback a fail-closed (rechazar requests cuando Redis no está disponible) o implementar un rate limit in-memory como respaldo.

### RIESGO 3 (ALTO): Sin Validación en Endpoints de API Pública

Las rutas `/api/geo/forward` y `/api/geo/reverse` no validan los parámetros de entrada. Un atacante puede enviar queries malformados, extremadamente largos, o con caracteres especiales para explotar el proxy hacia Mapbox. Tampoco tienen autenticación --- cualquier persona puede usarlos sin estar logueada.

**Acción:** Agregar validación de input (longitud máxima, regex de caracteres permitidos) y rate limiting específico a estas rutas.

---

## 2. Plan de Acción a Producción (Roadmap por Fases)

### FASE 0: Emergencia de Seguridad (Día 1-2)

| # | Tarea | Detalle |
|---|-------|---------|
| 0.1 | Rotar llaves de Supabase | Ir a Settings > API en el dashboard de Supabase y regenerar anon key + service role key |
| 0.2 | Rotar token de Mapbox | Crear un nuevo token en Mapbox y revocar el actual |
| 0.3 | Auditar historial de Git | `git log --all --full-history -- .env.local` --- si aparece, las llaves anteriores están comprometidas |
| 0.4 | Verificar `.gitignore` | Confirmar que `.env.local` está listado y nunca se volverá a committear |
| 0.5 | Configurar secrets en Vercel | Mover todas las variables a Vercel Environment Variables (Production, Preview, Development) |
| 0.6 | Crear `.env.local.example` | Archivo con placeholders para que otros devs sepan qué variables necesitan |

### FASE 1: Hardening de Seguridad (Semana 1)

| # | Tarea | Detalle |
|---|-------|---------|
| 1.1 | Rate limit fail-closed | Cuando Redis no esté disponible, rechazar requests en lugar de permitirlas todas |
| 1.2 | Validar inputs en `/api/geo/*` | Agregar Zod schemas: max 200 chars, regex de caracteres válidos, coordenadas en rango México |
| 1.3 | Rate limit en rutas geo | Aplicar `checkGeoRateLimit()` a forward y reverse (ej. 30 req/min por IP) |
| 1.4 | Sanitizar errores | Reemplazar `error.message` por mensajes genéricos en español para el usuario; loguear el error real server-side |
| 1.5 | Proteger admin client | Agregar comment/lint rule para prevenir import de `lib/supabase/admin.ts` en componentes client |
| 1.6 | Constraint en DB: no self-threads | `ALTER TABLE threads ADD CONSTRAINT no_self_threads CHECK (user1_id != user2_id)` |
| 1.7 | Constraint: listing_saves unique | `ALTER TABLE listing_saves ADD CONSTRAINT unique_save UNIQUE(user_id, listing_id)` |

### FASE 2: Performance y Base de Datos (Semana 2)

| # | Tarea | Detalle |
|---|-------|---------|
| 2.1 | Agregar índices a Supabase | `listings(is_active, created_at DESC)`, `listings(featured_until DESC)`, `profiles(featured_until DESC)`, `messages(thread_id, created_at DESC)` |
| 2.2 | Migrar a `next/image` | Reemplazar `<img>` tags por componente `Image` de Next.js para listing images y avatars |
| 2.3 | Limitar `messages.body` | `ALTER TABLE messages ALTER COLUMN body TYPE VARCHAR(5000)` para coincidir con validación |
| 2.4 | Paginar threads | En `/messages`, cambiar de limit 50 a paginación de 20 por página |
| 2.5 | Skeleton UIs | Mejorar los `loading.tsx` con skeletons que reflejen el layout real de cada página |
| 2.6 | Extraer lógica de filtros | Crear `lib/filters/buildExploreQuery.ts` y `buildListingsQuery.ts` para eliminar duplicación |

### FASE 3: Funcionalidad Core Faltante (Semana 3-4)

| # | Tarea | Detalle |
|---|-------|---------|
| 3.1 | Mensajería en tiempo real | Integrar Supabase Realtime para que los mensajes lleguen sin refresh |
| 3.2 | Notificaciones por email | Configurar un servicio de email transaccional (Resend o SendGrid) para alertas de nuevos mensajes |
| 3.3 | Sistema de reportes backend | Conectar el `ReportButton` existente a una tabla `reports` con flujo de moderación |
| 3.4 | Error boundaries | Crear `app/error.tsx` y `app/not-found.tsx` personalizados |
| 3.5 | Sitemap dinámico | Generar sitemap.xml desde listings activos para SEO |
| 3.6 | Structured data (JSON-LD) | Agregar schema.org markup para listings (RoomStay o Offer) |

### FASE 4: Monetización y Escalamiento (Mes 2)

| # | Tarea | Detalle |
|---|-------|---------|
| 4.1 | Integración de pagos | Conectar Stripe o Conekta para la funcionalidad de "Promote" (el backend ya marca `featured_until` pero no cobra) |
| 4.2 | Sistema de verificación | Implementar verificación de email, teléfono (Twilio) y opcionalmente ID |
| 4.3 | Dashboard de admin | Panel para moderación de reportes, listings flaggeados, y métricas |
| 4.4 | Monitoring | Integrar Sentry para errores y Vercel Analytics para performance |
| 4.5 | Tests E2E | Playwright tests para flujos críticos: signup > crear listing > contactar > responder mensaje |

---

## 3. Arquitectura de Agentes (Rules para `.cursor/rules/`)

Propongo 5 agentes especializados. Cada archivo `.mdc` tiene un perfil, restricciones de archivos (globs), y reglas claras para que actúen de forma independiente.

### 3.1 `supabase-dba.mdc` --- Agente de Base de Datos

```markdown
---
description: "Experto en Supabase/PostgreSQL. Maneja esquema, RLS, migraciones, índices y queries."
globs:
  - "sql/**"
  - "supabase/**"
  - "lib/supabase/**"
  - "squema.sql"
---

# Supabase DBA Agent

## Rol
Eres un DBA especializado en Supabase y PostgreSQL para el proyecto MyRoomie.mx.

## Responsabilidades
- Diseñar y revisar esquemas de tablas
- Crear y auditar Row-Level Security (RLS) policies
- Escribir y optimizar migraciones SQL
- Proponer índices basados en patrones de query
- Revisar que las queries desde Server Actions usen correctamente el SDK de Supabase

## Restricciones
- NUNCA toques archivos fuera de sql/, supabase/, o lib/supabase/
- SIEMPRE usa migraciones versionadas (nunca SQL directo en producción)
- SIEMPRE verifica que nuevas tablas tengan RLS habilitado
- NUNCA uses el service_role_key en código que pueda ejecutarse en el cliente
- Cada migración debe ser idempotente (usa IF NOT EXISTS, IF EXISTS)
- Documenta cada migración con un comentario que explique el "por qué"

## Convenciones
- Nombres de tabla: snake_case, plural (listings, profiles, messages)
- Foreign keys: tabla_singular_id (user_id, listing_id)
- Timestamps: siempre TIMESTAMPTZ, nunca TIMESTAMP
- Índices: idx_{tabla}_{columnas}
- RLS policies: {accion}_{tabla}_{quien} (select_listings_public, update_profiles_owner)
```

### 3.2 `nextjs-ui-expert.mdc` --- Agente de Frontend/UI

```markdown
---
description: "Experto en Next.js 14 App Router, React 18, Tailwind CSS. Maneja componentes, páginas, layouts y estilos."
globs:
  - "app/**/*.tsx"
  - "app/**/*.css"
  - "app/components/**"
  - "tailwind.config.ts"
  - "app/layout.tsx"
---

# Next.js UI Expert Agent

## Rol
Eres un frontend engineer especializado en Next.js 14 (App Router) + React 18 + Tailwind CSS para MyRoomie.mx.

## Responsabilidades
- Crear y modificar componentes React (Server y Client)
- Implementar páginas con el App Router
- Manejar estilos con Tailwind CSS (nunca CSS inline ni styled-components)
- Optimizar imágenes con next/image
- Implementar loading states, error boundaries, y Suspense boundaries
- Asegurar accesibilidad (ARIA labels, semantic HTML, keyboard navigation)

## Restricciones
- NUNCA escribas "use client" a menos que el componente necesite hooks, event handlers, o browser APIs
- NUNCA uses colores hardcodeados (#FF7A18) --- usa los tokens de Tailwind (text-brand, bg-brand)
- NUNCA hagas fetching de datos en componentes client --- usa Server Components o Server Actions
- NUNCA importes lib/supabase/admin.ts en ningún componente
- Cada página nueva DEBE tener su loading.tsx correspondiente
- Formularios siempre validan en servidor (Server Actions) además de cliente

## Convenciones
- Componentes: PascalCase (ListingCard.tsx, UserMenu.tsx)
- Server Components por defecto, Client solo cuando es necesario
- Props tipadas con interface (nunca any)
- Texto siempre en español (es-MX)
- Mobile-first design (Tailwind breakpoints: sm, md, lg)
```

### 3.3 `qa-security.mdc` --- Agente de QA y Seguridad

```markdown
---
description: "Auditor de calidad y seguridad. Revisa vulnerabilidades, valida inputs, ejecuta tests."
globs:
  - "**/*.test.ts"
  - "**/*.test.tsx"
  - "**/*.spec.ts"
  - "app/**/actions.ts"
  - "app/api/**"
  - "middleware.ts"
  - "lib/rateLimit.ts"
  - "lib/validation/**"
  - "vitest.config.ts"
---

# QA & Security Agent

## Rol
Eres un ingeniero de QA y seguridad para MyRoomie.mx. Tu trabajo es encontrar y prevenir vulnerabilidades, y asegurar que el código sea robusto.

## Responsabilidades
- Auditar Server Actions por falta de autenticación o autorización
- Verificar que todo input del usuario pase por Zod validation
- Revisar que los mensajes de error no expongan información del sistema
- Escribir tests unitarios (Vitest) y E2E (Playwright)
- Verificar que el rate limiting esté activo en todos los endpoints públicos
- Auditar RLS policies contra escenarios de ataque

## Restricciones
- NUNCA apruebes código que use `error.message` directamente en respuestas al usuario
- NUNCA apruebes Server Actions sin verificación de autenticación (requireAuthOrRedirect o getUser)
- NUNCA permitas queries con string interpolation (siempre SDK parametrizado)
- SIEMPRE verifica que los archivos de test cubran los edge cases (input vacío, input malicioso, usuario no autenticado)
- Rate limiting DEBE estar en modo fail-closed en producción

## Checklist de Review
1. Autenticación verificada (getUser, no solo getSession)
2. Autorización: .eq('user_id', user.id) en queries de modificación
3. Input validado con Zod antes de tocar la DB
4. Errores genéricos al usuario, error real en console.error
5. Rate limit aplicado a acciones de escritura
6. Sin datos sensibles en URLs o logs
```

### 3.4 `seo-performance.mdc` --- Agente de SEO y Performance

```markdown
---
description: "Optimiza SEO, Core Web Vitals, meta tags, structured data, y carga de assets."
globs:
  - "app/**/page.tsx"
  - "app/**/layout.tsx"
  - "app/robots.ts"
  - "app/sitemap.ts"
  - "next.config.js"
  - "public/**"
  - "app/components/home/**"
---

# SEO & Performance Agent

## Rol
Eres un especialista en SEO técnico y web performance para MyRoomie.mx.

## Responsabilidades
- Optimizar metadata (title, description, Open Graph, Twitter Cards) por página
- Implementar structured data (JSON-LD) para listings
- Generar sitemap.xml dinámico desde la DB
- Optimizar Core Web Vitals (LCP, FID, CLS)
- Configurar robots.txt correctamente
- Asegurar que las imágenes usen next/image con sizes y priority correctos
- Implementar canonical URLs para evitar contenido duplicado

## Restricciones
- NUNCA dejes una página sin metadata específica (título y descripción únicos)
- NUNCA uses <img> directamente --- siempre next/image
- Cada listing debe tener su propia OG image (o fallback)
- URLs canónicas deben incluir www (consistencia con dominio principal)
- Lazy load todo lo que esté below the fold
- Fonts con display: swap (ya implementado, mantener)

## Targets
- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
- Sitemap actualizado cada hora (ISR)
```

### 3.5 `devops-deploy.mdc` --- Agente de DevOps y Deploy

```markdown
---
description: "Maneja deployments, CI/CD, environment variables, monitoring y configuración de Vercel."
globs:
  - ".github/**"
  - "next.config.js"
  - "package.json"
  - "middleware.ts"
  - ".env.local.example"
  - "vitest.config.ts"
---

# DevOps & Deploy Agent

## Rol
Eres un DevOps engineer para MyRoomie.mx, enfocado en CI/CD, Vercel, y operational excellence.

## Responsabilidades
- Configurar GitHub Actions para CI (lint, type-check, tests)
- Manejar environment variables entre ambientes (dev, preview, production)
- Configurar monitoring y alerting (Sentry, Vercel Analytics)
- Optimizar el build de Next.js
- Gestionar dependencias y actualizaciones de seguridad
- Configurar preview deployments para PRs

## Restricciones
- NUNCA commitees secrets o .env.local
- NUNCA hagas deploy directo a producción sin pasar por preview
- SIEMPRE verifica que el build pase limpio antes de merge
- NUNCA desactives ESLint rules sin justificación documentada
- Los secrets van en Vercel Environment Variables, NUNCA en el repo
- Cada PR debe tener preview deployment funcional

## Pipeline Ideal
1. Push a branch -> GitHub Action: lint + type-check + test
2. PR creado -> Vercel Preview Deploy automático
3. Review aprobado -> Merge a main
4. Main -> Vercel Production Deploy automático
5. Post-deploy: health check + Sentry verificación
```

---

## 4. Arquitectura de Habilidades (Skills para `.cursor/skills/`)

### 4.1 `supabase-migration/SKILL.md` --- Generador de Migraciones

```markdown
---
name: supabase-migration
description: "Genera migraciones SQL seguras para Supabase con RLS, índices y rollback."
---

# Supabase Migration Generator

## Uso
Cuando necesites crear o modificar tablas, índices, o RLS policies.

## Template de Migración

Cada migración debe seguir este formato:

-- Migration: {nombre_descriptivo}
-- Created: {fecha}
-- Description: {qué hace y por qué}

-- UP
BEGIN;
  -- Cambios aquí (CREATE TABLE, ALTER TABLE, CREATE INDEX, etc.)
  -- Siempre IF NOT EXISTS para idempotencia
COMMIT;

-- DOWN (rollback)
BEGIN;
  -- Revertir cambios (DROP TABLE IF EXISTS, etc.)
COMMIT;

## Checklist Automático
Antes de considerar la migración completa, verificar:
1. Todas las tablas nuevas tienen RLS habilitado (ALTER TABLE x ENABLE ROW LEVEL SECURITY)
2. Hay al least una policy SELECT para cada tabla
3. Las policies de INSERT/UPDATE/DELETE verifican auth.uid()
4. Los índices cubren las queries más comunes
5. Los FKs tienen ON DELETE apropiado (CASCADE para datos del usuario, SET NULL para referencias opcionales)
6. Timestamps usan TIMESTAMPTZ

## Naming Convention
- Archivo: sql/{numero}_{descripcion}.sql (ej: sql/015_add_reports_table.sql)
- Índices: idx_{tabla}_{columnas}
- Constraints: chk_{tabla}_{descripcion}, uq_{tabla}_{columnas}
- Policies: {accion}_{tabla}_{quien}
```

### 4.2 `server-action-scaffolder/SKILL.md` --- Scaffolder de Server Actions

```markdown
---
name: server-action-scaffolder
description: "Crea Server Actions seguras con validación Zod, auth, rate limiting, y manejo de errores."
---

# Server Action Scaffolder

## Uso
Cuando necesites crear una nueva Server Action para cualquier funcionalidad.

## Template Base

'use server'

import { createClient } from '@/lib/supabase/server'
import { checkActionRateLimit } from '@/lib/rateLimit'
import { z } from 'zod'

const MySchema = z.object({
  // Definir schema aquí
})

export async function myAction(formData: FormData) {
  // 1. Auth
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (!user) return { error: 'Debes iniciar sesión.' }

  // 2. Rate limit
  const rl = await checkActionRateLimit(user.id, 'my-action', { max: 10, window: '1m' })
  if (!rl.success) return { error: 'Demasiadas solicitudes. Espera un momento.' }

  // 3. Validar input
  const parsed = MySchema.safeParse({ /* ... */ })
  if (!parsed.success) return { error: 'Datos inválidos.' }

  // 4. Ejecutar
  const { error } = await supabase.from('table').insert({ ...parsed.data, user_id: user.id })

  // 5. Manejar resultado
  if (error) {
    console.error('myAction failed:', error)
    return { error: 'Ocurrió un error. Intenta de nuevo.' }
  }
  return { success: true }
}

## Reglas
- SIEMPRE usar getUser() (no getSession)
- SIEMPRE validar con Zod antes de tocar la DB
- NUNCA exponer error.message al usuario
- SIEMPRE incluir rate limiting en acciones de escritura
- SIEMPRE incluir user_id en el WHERE de updates/deletes
```

### 4.3 `component-generator/SKILL.md` --- Generador de Componentes UI

```markdown
---
name: component-generator
description: "Genera componentes React consistentes con el design system de MyRoomie.mx."
---

# Component Generator

## Uso
Cuando necesites crear un nuevo componente UI que sea consistente con el resto de la app.

## Design Tokens
- Color primario (brand): #FF7A18 (usar clase Tailwind: text-brand, bg-brand, border-brand)
- Fondo: white / gray-50
- Texto: gray-900 (principal), gray-600 (secundario)
- Border radius: rounded-xl (cards), rounded-lg (botones), rounded-full (avatars)
- Sombras: shadow-sm (default), shadow-md (hover), shadow-lg (modals)
- Espaciado: p-4 (cards), gap-4 (grids), space-y-2 (stacks)

## Tipos de Componente

### Server Component (default)
Para componentes que solo muestran datos. Sin "use client", sin hooks, sin event handlers.

### Client Component
Solo cuando necesitas: useState, useEffect, onClick, onChange, useRouter, o browser APIs.
Agregar "use client" en la primera línea.

## Checklist
1. Props tipadas con interface (no any)
2. Texto en español (es-MX)
3. Accesibilidad: aria-labels en botones de solo icono, alt en imágenes
4. Responsive: mobile-first con breakpoints sm/md/lg
5. Loading state si hace fetch
6. Empty state si puede no tener datos
7. Error handling visible al usuario
```

---

## 5. Estrategia de Prompting (Minimizar Tokens)

### Principio General

En lugar de dar contexto completo en cada prompt, usa un sistema de "invocación por agente" donde el contexto lo carga el archivo `.mdc` automáticamente.

### Patrones de Invocación Eficientes

**Para tareas de base de datos:**
```
@supabase-dba Crea migración: tabla `reports` con campos reporter_id, reported_id,
reason (enum), status (enum), listing_id (nullable). RLS: solo el reporter puede crear,
solo admin puede leer.
```

**Para componentes UI:**
```
@nextjs-ui-expert Crea componente ReportModal. Trigger: botón en listing detail.
Campos: razón (select), descripción (textarea). Submit via Server Action reportListing.
```

**Para revisión de seguridad:**
```
@qa-security Revisa app/listings/new/actions.ts. Busca: auth bypass,
input sin validar, error leaks, rate limit faltante.
```

**Para SEO:**
```
@seo-performance Agrega metadata + JSON-LD a app/listings/[id]/page.tsx.
Tipo: RoomStay/Offer. Campos dinámicos: título, precio, ciudad, imágenes.
```

**Para deploy:**
```
@devops-deploy Configura GitHub Action: en PR a main, ejecutar lint + type-check +
vitest. Bloquear merge si falla.
```

### Tips para Minimizar Tokens

1. **Sé específico y conciso:** En lugar de "mejora la página de listings", di "en app/listings/page.tsx, agrega paginación con componente Pagination existente".

2. **Referencia archivos exactos:** Siempre incluye la ruta del archivo. El agente no necesita buscar.

3. **Una tarea por prompt:** No mezcles "arregla el bug Y agrega feature X". Son dos prompts separados.

4. **Usa el scaffolder:** Para cosas repetitivas (nuevo Server Action, nuevo componente), invoca el skill correspondiente en vez de explicar el patrón cada vez.

5. **Prefiere instrucciones imperativas:** "Agrega índice idx_listings_active en (is_active, created_at DESC)" es mejor que "creo que necesitamos optimizar las queries de listings".

6. **No repitas contexto del proyecto:** Los archivos `.mdc` ya tienen el contexto. No agregues "estamos usando Next.js 14 con Supabase..." en cada prompt.

---

## 6. Resumen de Hallazgos del Código

### Lo que funciona bien

- **Auth sólido:** `requireAuthOrRedirect()` valida JWT con `getUser()` (no solo cookies). Intent system post-login bien implementado.
- **RLS policies:** Todas las tablas críticas tienen RLS habilitado con policies sensibles (profiles: owner-only write, messages: participant-only).
- **Security headers:** HSTS, X-Frame-Options DENY, nosniff, Permissions-Policy bien configurados en `next.config.js`.
- **Server Actions pattern:** Consistente, con validación Zod parcial y ownership checks atómicos.
- **Rate limiting:** Implementado para acciones de escritura (5 creates/min, 20 messages/min).
- **Validación de imágenes:** `isValidStorageUrl()` asegura que solo se acepten URLs de Supabase Storage.

### Lo que necesita trabajo

- **20+ archivos con colores hardcodeados** (#FF7A18) en vez de tokens Tailwind.
- **Lógica de filtros duplicada** entre `/explore/page.tsx` y `/listings/page.tsx`.
- **Tipos `any`** en `GlobalSearchBar.tsx` y otros componentes.
- **Sin tests de integración ni E2E** (solo tests unitarios de validación).
- **Imágenes sin optimizar** (uso de `<img>` en vez de `next/image`).
- **Mensajería requiere refresh** para ver nuevos mensajes (sin Realtime).
- **Sin custom error pages** (`error.tsx`, `not-found.tsx`).
- **Sin sitemap.xml dinámico** ni structured data para SEO.

---

## 7. Prioridades Inmediatas (Quick Wins)

Estas son mejoras que se pueden hacer en menos de 2 horas cada una y tienen alto impacto:

1. Rotar todas las API keys (0 horas de código, solo dashboard)
2. Crear `.env.local.example` con placeholders
3. Agregar `app/error.tsx` y `app/not-found.tsx` personalizados
4. Reemplazar colores hardcodeados por tokens Tailwind
5. Agregar los 4 índices de DB mencionados en Fase 2
6. Cambiar el fallback del rate limiter a fail-closed
7. Sanitizar mensajes de error en los 5 archivos `actions.ts`
