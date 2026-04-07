# MyRoomie.mx - Testing Report
**Fecha:** 2026-04-06
**Tester:** Claude Code (Automated QA)

---

## Resumen Ejecutivo

Se realizaron pruebas end-to-end del sitio https://www.myroomie.mx/ combinando:
- Inspección de código fuente (Next.js 14 + Supabase + TypeScript)
- Fetch HTTP de páginas en producción
- Análisis de rutas, formularios, API endpoints y seguridad

---

## 1. PRUEBAS DE RUTAS Y NAVEGACION

### URLs que FUNCIONAN (HTTP 200)
| Ruta | Descripcion | Estado |
|------|-------------|--------|
| `/` | Homepage | OK |
| `/login` | Inicio de sesion | OK |
| `/signup` | Registro de cuenta | OK |
| `/listings` | Listado de anuncios | OK |
| `/explore` | Explorar perfiles roomies | OK |
| `/security` | Guia de seguridad | OK |
| `/legal/terms` | Terminos de servicio | OK |
| `/legal/privacy` | Politica de privacidad | OK |

### URLs que FALLAN (HTTP 404) - CRITICO
| URL esperada | URL real | Problema |
|-------------|----------|----------|
| `/registro` | `/signup` | No existe ruta en espanol |
| `/anuncios` | `/listings` | No existe ruta en espanol |
| `/roomies` | `/explore` | No existe ruta en espanol |
| `/como-funciona` | N/A (seccion en homepage) | No existe como pagina independiente |

**Impacto:** Si se comparten URLs en espanol (marketing, redes sociales, SEO), todos los enlaces estan rotos. Se necesitan redirects o rutas alias.

---

## 2. PRUEBAS DE AUTENTICACION

### 2.1 Registro (`/signup`)
| Test | Resultado | Notas |
|------|-----------|-------|
| Formulario visible | PASS | Email, password, confirmar password |
| Checkbox terminos | PASS | Link a `/legal/terms` |
| Checkbox privacidad | PASS | Link a `/legal/privacy` |
| Validacion password (min 8 chars, 1 mayuscula, 1 numero) | PASS (codigo) | Zod schema validado |
| Google OAuth en signup | FAIL | No disponible, solo en login |
| Campo nombre en registro | FAIL | No se pide nombre al registrarse |
| CAPTCHA/bot prevention | FAIL | No existe proteccion anti-bot |
| Rate limiting en signup | NO TESTEADO | No hay rate limit en signup action |

### 2.2 Login (`/login`)
| Test | Resultado | Notas |
|------|-----------|-------|
| Email + Password login | PASS | Formulario funcional |
| Google OAuth login | PASS | Boton "Continuar con Google" |
| Link a forgot password | PASS | Redirige a `/forgot-password` |
| Link a registro | PASS | Redirige a `/signup` |
| Redirect post-login | PASS (codigo) | Logica de redirect con param `next` |
| Open redirect protection | PASS (codigo) | Solo acepta rutas relativas internas |

### 2.3 Onboarding Post-Registro
| Test | Resultado | Notas |
|------|-----------|-------|
| Step 1: Perfil basico | PASS (codigo) | Nombre, ciudad, zona, bio, edad |
| Step 2: Preferencias lifestyle | PASS (codigo) | Mascotas, fumador, fiestas, limpieza, horario |
| Redirect a onboarding si no hay perfil | PASS (codigo) | `requireProfileOrRedirect()` |

---

## 3. PRUEBAS DE LISTINGS (ANUNCIOS)

### 3.1 Ver Listings (`/listings`)
| Test | Resultado | Notas |
|------|-----------|-------|
| Carga de listings | PASS | 3 listings visibles |
| Filtro por ciudad | PASS | Tabs: Todas, Monterrey, CDMX, Guadalajara |
| Filtro por tipo | PASS | "Rento cuarto" / "Busco compartir depa" |
| Filtro por precio | PASS | Inputs min/max con boton "Aplicar" |
| Paginacion | PASS (UI) | Controles visibles, pero solo 3 resultados |
| Busqueda por texto | PARCIAL | Input visible pero funcionalidad limitada |

### 3.2 Crear Listing (`/listings/new`)
| Test | Resultado | Notas |
|------|-----------|-------|
| Requiere autenticacion | PASS (codigo) | `requireAuthOrRedirect()` |
| Requiere perfil | PASS (codigo) | `requireProfileOrRedirect()` |
| Validacion titulo (5-80 chars) | PASS (codigo) | Zod schema |
| Validacion descripcion (30-1500 chars) | PASS (codigo) | Zod schema |
| Validacion precio (500-80,000 MXN) | PASS (codigo) | Zod schema |
| Upload imagenes (max 10) | PASS (codigo) | Supabase Storage |
| Validacion URLs imagenes | PASS (codigo) | Solo URLs de Supabase Storage |
| Rate limit creacion (5 req/60s) | PASS (codigo) | Upstash Redis |
| Amenities selector | PASS (codigo) | Array de amenidades |

### 3.3 Editar/Eliminar Listing
| Test | Resultado | Notas |
|------|-----------|-------|
| Solo owner puede editar | PASS (codigo) | RLS policy + server validation |
| Solo owner puede eliminar | PASS (codigo) | RLS policy |

---

## 4. PRUEBAS DE PERFILES (ROOMIES)

### 4.1 Explorar Perfiles (`/explore`)
| Test | Resultado | Notas |
|------|-----------|-------|
| Carga de perfiles | PASS | 3 perfiles visibles |
| Filtro por ciudad | PASS | Tabs disponibles |
| Filtros lifestyle | PASS | Badges: mascotas, fumador, fiestas, horario, limpieza |
| Paginacion | PASS (UI) | Controles visibles |

### 4.2 Perfil Publico (`/profiles/[user_id]`)
| Test | Resultado | Notas |
|------|-----------|-------|
| Ruta existe | PASS (codigo) | Server component |
| Muestra info publica | PASS (codigo) | Nombre, ciudad, bio, lifestyle |
| Boton contactar | PASS (codigo) | Inicia thread de mensajes |

### 4.3 Calidad de Datos (Produccion)
| Test | Resultado | Notas |
|------|-----------|-------|
| Diversidad de perfiles | FAIL | Solo variaciones de "Miguel Pena" |
| Fotos de perfil | FAIL | 2 de 3 perfiles sin foto |
| Normalizacion de nombres | FAIL | "miguel pena" vs "miguel pena" inconsistente |

---

## 5. PRUEBAS DE MENSAJERIA

| Test | Resultado | Notas |
|------|-----------|-------|
| Lista de threads (`/messages`) | PASS (codigo) | Muestra conversaciones activas |
| Ver thread individual | PASS (codigo) | Mensajes ordenados cronologicamente |
| Enviar mensaje | PASS (codigo) | Server action con validacion |
| Rate limit mensajes (20/60s) | PASS (codigo) | Upstash Redis |
| Solo participantes ven mensajes | PASS (codigo) | RLS policy |
| Auto-scroll a ultimo mensaje | PASS (codigo) | `scrollIntoView` implementado |
| Crear thread desde listing | PASS (codigo) | `findOrCreateThread()` |
| Notificaciones de nuevo mensaje | FAIL | No existe sistema de notificaciones |

---

## 6. PRUEBAS DE API

| Endpoint | Metodo | Rate Limit | Resultado |
|----------|--------|------------|-----------|
| `/api/geo/forward` | GET | 40/60s | PASS (codigo) |
| `/api/geo/reverse` | GET | 40/60s | PASS (codigo) |
| `/api/geo/zones` | GET | 40/60s | PASS (codigo) |
| `/api/locations/upsert` | POST | N/A | PASS (codigo) |
| `/api/search` | GET | N/A | PASS (codigo) |
| `/auth/callback` | POST | N/A | PASS (codigo) |

---

## 7. PRUEBAS DE SEGURIDAD

| Test | Resultado | Notas |
|------|-----------|-------|
| RLS en todas las tablas | PASS | profiles, listings, threads, messages, locations, listing_saves |
| Security headers (X-Frame-Options, HSTS, etc) | PASS | Configurados en next.config.js |
| SQL injection prevention | PASS | Sanitizacion de queries + Supabase PostgREST |
| Open redirect prevention | PASS | Validacion de param `next` en login |
| Image URL validation | PASS | Solo acepta URLs de Supabase Storage |
| Rate limiting en APIs criticas | PASS | Geo, mensajes, creacion listings |
| Rate limiting en signup/login | FAIL | No hay rate limit en auth actions |
| CAPTCHA | FAIL | No implementado en ningun formulario |
| Verificacion de identidad | PENDIENTE | Documentado como "en desarrollo" |
| CSRF Protection | PASS | Server actions de Next.js |

---

## 8. PRUEBAS DE UX/UI

| Test | Resultado | Notas |
|------|-----------|-------|
| Responsive design | PASS | Tailwind responsive classes |
| Loading states | PASS | Skeletons visibles en listings |
| Empty states | PASS | Componente EmptyState reutilizable |
| Error handling en formularios | PASS (codigo) | Mensajes de error con Zod |
| Consistencia Google OAuth (login vs signup) | FAIL | Solo disponible en login |
| Search bar en header | PARCIAL | Visible pero funcionalidad limitada |
| Stats en homepage (3+ listings, 3+ roommates) | FAIL | Numeros muy bajos, se ven como placeholder |

---

## 9. FEATURES PENDIENTES / NO FUNCIONALES

| Feature | Estado | Ubicacion |
|---------|--------|-----------|
| Matches/Compatibilidad | PLACEHOLDER | `/matches` - dice "Coming soon" |
| Notificaciones (email/push) | NO EXISTE | No hay sistema de notificaciones |
| Verificacion de identidad | EN DESARROLLO | Mencionado en `/security` |
| Reportar usuario/listing | PARCIAL | Solo mailto a soporte |
| Sistema de reviews/calificaciones | NO EXISTE | No hay tabla ni UI |
| Dashboard analytics | BASICO | Solo muestra perfil y listings propios |

---

## 10. BUGS Y PROBLEMAS ENCONTRADOS

### Criticos
1. **URLs en espanol rotas** - `/registro`, `/anuncios`, `/roomies`, `/como-funciona` dan 404
2. **No hay rate limit en auth** - Login/signup vulnerables a brute force
3. **No hay CAPTCHA** - Bot protection ausente

### Importantes
4. **Google OAuth inconsistente** - Disponible en login pero no en signup
5. **No se pide nombre en registro** - El usuario no tiene nombre hasta onboarding
6. **Sin notificaciones** - Los usuarios no saben cuando reciben mensajes
7. **Sin sistema de reportes in-app** - Solo email manual

### Menores
8. **Datos de prueba en produccion** - Solo perfiles de "Miguel Pena"
9. **Normalizacion de nombres** - Inconsistencias en display_name
10. **Stats de homepage engañosas** - "3+" listings no inspira confianza

---

## 11. PLAN DE TESTING AGENTS

Para automatizar testing futuro, se proponen los siguientes agentes especializados:

### Agent 1: `auth-tester`
**Scope:** Registro, login, logout, password reset, OAuth
**Tests:**
- Registro con email valido/invalido
- Password requirements (min 8, mayuscula, numero)
- Login con credenciales correctas/incorrectas
- Google OAuth flow
- Forgot password flow
- Session persistence
- Redirect post-login

### Agent 2: `listings-tester`
**Scope:** CRUD de listings, filtros, busqueda
**Tests:**
- Crear listing con datos validos/invalidos
- Editar listing propio vs ajeno
- Eliminar listing
- Filtrar por ciudad, tipo, precio
- Paginacion
- Upload de imagenes
- Validacion de campos (titulo, descripcion, precio)

### Agent 3: `profiles-tester`
**Scope:** Onboarding, perfiles, explorar
**Tests:**
- Onboarding step 1 y 2
- Editar perfil
- Ver perfil publico
- Filtrar perfiles por lifestyle
- Avatar upload
- Validacion de campos

### Agent 4: `messaging-tester`
**Scope:** Threads, mensajes, contacto
**Tests:**
- Crear thread desde listing
- Crear thread desde perfil
- Enviar mensaje
- Rate limiting de mensajes
- Ver threads propios
- Seguridad (no ver threads ajenos)

### Agent 5: `api-tester`
**Scope:** Endpoints REST, geocoding, search
**Tests:**
- Forward geocoding con queries validas/invalidas
- Reverse geocoding
- Zone autocomplete
- Global search
- Rate limiting de APIs
- Respuestas de error

### Agent 6: `security-tester`
**Scope:** RLS, headers, injection, auth
**Tests:**
- RLS policies (acceso a datos ajenos)
- Security headers en responses
- SQL injection attempts
- XSS en inputs
- Open redirect attempts
- Image URL manipulation

### Agent 7: `validation-tester`
**Scope:** Schemas Zod, inputs, edge cases
**Tests:**
- Todos los schemas de validacion (profile, listing, search)
- Boundary values (min/max chars, precio)
- Caracteres especiales
- Unicode/emojis en campos de texto
- Campos opcionales vs requeridos

---

## 12. MATRIZ DE PRIORIDADES

| Prioridad | Issue | Esfuerzo |
|-----------|-------|----------|
| P0 | Rate limiting en auth (brute force) | Bajo |
| P0 | Redirects para URLs en espanol | Bajo |
| P1 | CAPTCHA en signup/login | Medio |
| P1 | Google OAuth en signup | Bajo |
| P1 | Sistema de notificaciones | Alto |
| P2 | Sistema de reportes in-app | Medio |
| P2 | Matches/compatibilidad | Alto |
| P2 | Verificacion de identidad | Alto |
| P3 | Reviews/calificaciones | Alto |
| P3 | Limpiar datos de prueba | Bajo |
