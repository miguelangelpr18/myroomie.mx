# MyRoomie.mx

> Marketplace web para México que conecta a personas que buscan **roomie** o **cuarto en renta**.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres%20%2B%20RLS-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

🔗 **En producción:** [www.myroomie.mx](https://www.myroomie.mx)

---

## Qué es

MyRoomie.mx es una alternativa moderna a los grupos de Facebook y portales tradicionales para encontrar
roomie o cuarto compartido. Ofrece un flujo limpio —**perfil → búsqueda → filtros → contacto**— con
perfiles estructurados, señales de compatibilidad por estilo de vida y mensajería dentro de la app,
enfocado específicamente en el mercado mexicano.

## Características principales

- 🏠 **Anuncios y perfiles** — Publica un cuarto/depa o un perfil de roomie con fotos e información estructurada.
- 🔎 **Búsqueda con filtros** — Por ciudad, zona, precio y preferencias de convivencia (mascotas, fumar, limpieza, fiestas, horarios).
- 💬 **Mensajería integrada** — Conversaciones entre usuarios sin salir de la plataforma.
- 📍 **Ubicaciones canónicas** — Geocodificación con Mapbox y normalización de zonas (solo México).
- ⭐ **Promoción y guardados** — Anuncios/perfiles destacados (`featured`) y shortlist de favoritos.
- 🛡️ **Seguridad** — Autenticación Supabase, RLS en todas las tablas, validación con Zod, rate limiting (Upstash) y protección anti-bot (Cloudflare Turnstile).

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 14 (App Router, Server Components & Server Actions) |
| Lenguaje | TypeScript |
| UI | Tailwind CSS |
| Backend / DB | Supabase (Postgres, Auth, Storage) con Row Level Security |
| Validación | Zod |
| Geo | Mapbox |
| Rate limiting | Upstash Redis |
| Anti-bot | Cloudflare Turnstile |
| Imágenes | Sharp |
| Testing | Vitest |

## Arquitectura de datos

El esquema completo y las políticas de RLS están documentados y versionados en
[`supabase/migrations/`](supabase/migrations/). Tablas principales:

`locations` · `profiles` · `listings` · `listing_saves` · `threads` · `messages` · `thread_participants` · `reports`

Todas las tablas tienen RLS habilitado (acceso público de lectura donde aplica; escritura restringida al dueño o a los participantes).

## Estructura del proyecto

```
app/            Rutas, páginas, Server Actions y componentes (App Router)
lib/            Clientes Supabase (SSR/cliente/admin) y helpers de auth
supabase/       Migraciones SQL versionadas (fuente de verdad del esquema)
docs/           Documentación de producto y diseño
types/          Tipos compartidos
```

## Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.local.example .env.local   # y rellenar las llaves

# 3. Levantar el servidor de desarrollo
npm run dev
```

Variables requeridas (ver [`.env.local.example`](.env.local.example)): Supabase (URL, anon key, service role key),
Mapbox y, opcionalmente, Upstash Redis para rate limiting.

### Scripts

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | Linter (ESLint / next lint) |
| `npm run test` | Tests con Vitest |
| `npm run db:push` | Aplicar migraciones a Supabase |

## Licencia

Proyecto propietario. © MyRoomie.mx — Todos los derechos reservados. El código se publica con fines
de portafolio; no se concede licencia de uso, copia ni distribución.
