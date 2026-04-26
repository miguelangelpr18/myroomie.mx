# MyRoomie.mx — Contexto completo

> Documento unificado: producto, stack, repo, entorno de desarrollo y análisis del sitio en producción.  
> **Generado:** 6 de abril de 2026

---

## 1. Finalidad del proyecto

**MyRoomie.mx** es un marketplace bilateral para **México** que conecta:

- Quienes **ofrecen** un cuarto o espacio compartido.
- Quienes **buscan** cuarto o **roomie** compatible.

**Objetivo de producto:** superar la experiencia de grupos de Facebook, Marketplace y sitios viejos, con flujo claro (perfil → búsqueda/filtros → contacto), **mensajería dentro de la app**, perfiles y listings estructurados y señales de estilo de vida (mascotas, fumar, limpieza, horarios, etc.). Enfoque en ciudades como Monterrey, CDMX, Guadalajara, Puebla, Tijuana.

**Modelo:** uso principal **gratis**; **promoción opcional** (destacar perfil o anuncio) como vía de monetización.

Documentación relacionada en el repo: `PROJECT.md`, `CONTEXTO_PROYECTO.md`.

---

## 2. Stack y servicios en producción

| Capa | Tecnología |
|------|------------|
| Frontend | **Next.js 14** (App Router), **React 18**, **Tailwind CSS** |
| Backend / datos | **Supabase** (Auth, PostgreSQL, Storage) |
| Hosting | Típicamente **Vercel** (assets bajo `/_next/static/` en el sitio en vivo) |
| Imágenes | **Next/Image** + **Supabase Storage** (`listing-images`, `avatars`) |
| Validación | **Zod** (uso parcial) |
| Rate limiting (APIs geo) | **Upstash Redis** + `@upstash/ratelimit` |
| Mapas / geo | **Mapbox** (`NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`) |

**Variables de entorno** (referencia): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.

---

## 3. Repositorio GitHub

- **Remoto:** `https://github.com/miguelangelpr18/myroomie.mx.git`
- Código fuente del producto desplegado en **https://www.myroomie.mx/**

---

## 4. Uso del proyecto (desarrollo)

| Comando | Uso |
|---------|-----|
| `npm run dev` | Servidor de desarrollo Next.js |
| `npm run build` / `npm run start` | Build y servidor producción local |
| `npm run lint` | ESLint |
| `npm run db:diff` / `npm run db:push` | Supabase CLI (esquema) |

**Arquitectura (resumen):**

- Server Components + Server Actions para datos y mutaciones.
- Cliente Supabase en navegador (`lib/supabase/client.ts`) y en servidor con cookies (`lib/supabase/server.ts`).
- `middleware.ts`: refresca la sesión con `supabase.auth.getUser()` en rutas que coinciden el matcher (excluye estáticos e imágenes).

**Rutas principales:** `/`, `/explore`, `/listings`, `/listings/[id]`, `/listings/new`, `/profiles/[user_id]`, `/messages`, `/saved`, `/promote/...`, `/legal/...`, `/security`, auth (`/login`, `/signup`, etc.). Detalle en `CONTEXTO_PROYECTO.md`.

---

## 5. Agents, plugins y conexiones (Cursor / MCP)

En el **repositorio** no hay un motor de agents del producto; hay **configuración para asistencia de IA en Cursor**:

- **Reglas:** `.cursor/rules/myroomie-project-context.mdc`
- **Skills locales:** `.cursor/skills/code-review/SKILL.md`, `.cursor/skills/security-review/SKILL.md`

En el IDE pueden habilitarse MCPs según el workspace, por ejemplo:

- **Chrome DevTools** — navegación, snapshot (a11y), red, consola.
- **cursor-ide-browser** — automatización de navegador (otros flujos del workspace).
- **GitHub, Supabase, Vercel, Mapbox**, etc. — según estén conectados.

Los plugins/skills de Vercel en Cursor son guías para deploy y Next.js; no sustituyen las dependencias en `package.json`.

---

## 6. Análisis del sitio en producción — https://www.myroomie.mx/

*(Inspección vía Chrome DevTools MCP: documento, árbol de accesibilidad, red, consola.)*

### 6.1 Documento y metadatos

- **Título:** `MyRoomie.mx — Encuentra tu roomie ideal` (alineado con `metadata` en `app/page.tsx`).

### 6.2 Estructura lógica de la UI

1. **`banner` (header)**  
   - Marca → `/`.  
   - Combobox **“Búsqueda rápida”**.  
   - **Publicar anuncio** → `/listings/new`.  
   - **Mensajes** → `/messages`.  
   - Menú de usuario (si hay sesión).

2. **`main` (landing)**  
   - Claim “100% gratis · Sin intermediarios”.  
   - H1 y subtítulo.  
   - CTAs: **Buscar roomie** (`/explore`), **Ver anuncios** (`/listings`), **Publicar espacio** (`/listings/new`).  
   - Métricas (conteos desde servidor).  
   - Pills de ciudad → `/listings?city=...`.  
   - **Anuncios recientes** (cards con precio MXN, tipo, ciudad/zona, fecha).  
   - **Roomies recientes** → `/profiles/[uuid]`.  
   - **Cómo funciona** (3 pasos) + beneficios (gratis, zona, filtros, seguridad).

3. **`contentinfo` (footer)**  
   - Explorar, legal, seguridad, ciudades, `mailto:hola@myroomie.mx`, copyright.

**Lógica de producto:** conversión hacia explore / listings / publicar; prueba social con números; descubrimiento por ciudad; contenido dinámico desde Supabase.

### 6.3 Red (Next.js + RSC)

Tras cargar `/`:

- `GET https://www.myroomie.mx/` → 200.
- Assets: `/_next/static/css/...`, `/_next/static/chunks/...` (incl. `app/page`, `app/layout`, errores).
- Prefetch RSC: `GET` con `?_rsc=...` hacia `/listings/new`, `/messages`, `/explore`, `/listings`, `/listings?city=...`, y detalles `/listings/<uuid>`.

**Interpretación:** Next.js **precarga** rutas enlazadas (App Router + React Server Components).

### 6.4 Medios e integración backend

Imágenes vía `/_next/image?url=...` apuntando a **Supabase Storage** (`listing-images`, `avatars`): datos reales + optimización Next Image.

### 6.5 Consola

- Posible issue de accesibilidad: *“A form field element should have an id or name attribute”* (p. ej. búsqueda rápida). Revisar `id`/`name` en inputs relacionados.

---

## 7. Flujo técnico de la home (diagrama)

```mermaid
flowchart LR
  subgraph browser [Navegador]
    A[GET /] --> B[HTML + RSC]
    B --> C[Chunks JS y CSS]
    C --> D[Prefetch _rsc]
    D --> E[/_next/image]
  end
  subgraph supabase [Supabase]
    E --> F[Storage]
    B --> G[(PostgreSQL vía server)]
  end
```

---

## 8. Resumen en una línea

**MyRoomie.mx** es un **marketplace de roomies y rentas de cuarto en México**, construido con **Next.js 14 + Supabase**, en **https://www.myroomie.mx/**, con **GitHub** como repositorio; la home **lee datos de la DB**, **enlaza a catálogo y perfiles**, **precarga rutas con `_rsc`** y sirve fotos con **Next Image + Supabase Storage**.

---

## 9. Enlaces

- Producción: [https://www.myroomie.mx/](https://www.myroomie.mx/)
- Repositorio: [https://github.com/miguelangelpr18/myroomie.mx](https://github.com/miguelangelpr18/myroomie.mx)
