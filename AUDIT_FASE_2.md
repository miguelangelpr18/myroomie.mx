# Auditoría FASE 2 — Rediseño de /messages (Split View)

**Fecha:** 2024  
**Fase completada:** FASE 2 (ThreadPanel SSR)  
**Estado:** ✅ Completado

---

## 1. ARCHIVOS CREADOS

### 1.1. `app/messages/ThreadPanel.tsx`

**Ruta completa:** `/Users/miguelangelpenar/myroomie.mx/app/messages/ThreadPanel.tsx`

**Responsabilidad:**
- Renderiza el panel derecho del split view en desktop
- Muestra la conversación completa (header, mensajes, formulario) dentro del panel
- Maneja la lógica de carga de datos del thread seleccionado

**Tipo de componente:**
- **Server Component** (NO tiene `'use client'`)
- Función `async` que hace queries directamente con Supabase

**Lógica reutilizada:**
- **Origen:** `app/messages/[thread_id]/page.tsx`
- **Qué se copió:**
  - `requireProfileOrRedirect()` para verificar perfil
  - Query de thread por `threadId` (campos: `id, user1_id, user2_id, listing_id`)
  - Validación de participante (`isParticipant`)
  - Query de perfil del otro usuario (campos: `display_name, avatar_url, pets, smoker, cleanliness, parties, schedule`)
  - Query de mensajes (campos: `id, sender_id, body, created_at`, ordenado por `created_at` ASC, límite 100)
  - Lógica de identificación del otro usuario (`otherUserId`)

**Diferencias con el original:**
- **UI adaptada:** Layout flex column (header fijo, body scroll, footer fijo) en lugar de página completa
- **Error handling:** Muestra error dentro del panel (sin botón "Volver") en lugar de página completa
- **Estilos:** Burbujas con `rounded-2xl` en lugar de `rounded-lg`, `max-w-[75%]` en lugar de `max-w-[70%]`
- **Header compacto:** Avatar más pequeño (12x12 vs 16x16), título más pequeño (`text-lg` vs `text-2xl`)
- **Body con fondo:** `bg-neutral-50` en el área de mensajes
- **Footer integrado:** `MessageForm` dentro del panel con border-top

**Dependencias:**
- `createServerSupabaseClient()` de `@/lib/supabase/server`
- `requireProfileOrRedirect()` de `@/lib/requireProfile`
- `MessageForm` de `./[thread_id]/MessageForm` (Client Component)
- `LifestyleBadges` de `../components/LifestyleBadges` (Server Component)
- `Link` de `next/link`

---

## 2. ARCHIVOS MODIFICADOS

### 2.1. `app/messages/page.tsx`

**Ruta completa:** `/Users/miguelangelpenar/myroomie.mx/app/messages/page.tsx`

**Qué hacía ANTES (FASE 1):**
- Renderizaba lista vertical de threads como Cards
- Cada Card linkeaba a `/messages/${thread.id}`
- Layout de una sola columna (`max-w-4xl`)
- No tenía split view
- No leía `searchParams` para thread seleccionado

**Qué hace AHORA (FASE 2):**
- Renderiza split view en desktop (grid 2 columnas: sidebar 380px + panel flexible)
- Sidebar con lista de threads estilo Airbnb (rows, no Cards)
- Panel derecho que muestra `ThreadPanel` cuando hay `selectedThreadId`
- Lee `searchParams?.thread` para obtener thread seleccionado
- Links condicionales por breakpoint:
  - Mobile: `/messages/${thread.id}` (navegación completa)
  - Desktop: `/messages?thread=${thread.id}` (query param, sin navegación)

**Partes que NO se tocaron:**
- ✅ **Queries de threads:** Misma lógica de `Promise.all` para obtener threads, perfiles y últimos mensajes
- ✅ **Validación de sesión:** `requireProfileOrRedirect()` sin cambios
- ✅ **Límites y ordenamiento:** `.limit(50)`, `.order('created_at', { ascending: false })` sin cambios
- ✅ **EmptyState:** Se mantiene igual, solo se agregó `variant="compact"`
- ✅ **Manejo de errores:** Misma lógica de error display
- ✅ **Componente interno `ThreadRow`:** Creado en FASE 1, no modificado en FASE 2

**Cambios específicos:**
1. **Firma de función:** Agregado `searchParams?: { thread?: string }` como prop
2. **Import:** Agregado `import ThreadPanel from './ThreadPanel'`
3. **Layout:** Cambiado de `max-w-4xl` a `max-w-7xl`, de `py-16` a `py-8`
4. **Grid:** Agregado `grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-4`
5. **Sidebar:** Envuelto en `<aside>` con `rounded-2xl border bg-white`
6. **Panel derecho:** Nuevo `<section>` con `hidden lg:flex` que renderiza `ThreadPanel` o estado vacío

---

## 3. FLUJO ACTUAL DE MESSAGES (Estado Final Tras FASE 2)

### 3.1. Desktop (≥1024px)

**Al entrar a `/messages`:**
1. Server Component `MessagesPage` se ejecuta
2. `requireProfileOrRedirect()` verifica sesión + perfil
3. Query de threads del usuario (donde es `user1_id` o `user2_id`)
4. Para cada thread, query de perfil del otro usuario y último mensaje
5. Renderiza split view:
   - **Sidebar izquierdo:** Lista de threads con preview
   - **Panel derecho:** Estado vacío "Selecciona una conversación"
6. URL: `/messages` (sin query params)

**Al seleccionar un thread (click en sidebar):**
1. Navegación a `/messages?thread={threadId}` (query param, NO navegación completa)
2. Server Component se re-ejecuta con `searchParams.thread`
3. `selectedThreadId = searchParams?.thread ?? null`
4. Sidebar muestra thread seleccionado con `bg-orange-50` y barra naranja izquierda
5. Panel derecho renderiza `<ThreadPanel threadId={selectedThreadId} />`
6. `ThreadPanel` hace queries independientes:
   - Thread por ID
   - Perfil del otro usuario
   - Mensajes del thread
7. Panel muestra conversación completa (header, mensajes, formulario)
8. URL: `/messages?thread={threadId}`

**Comportamiento:**
- ✅ Split view persistente (no navega, solo cambia query param)
- ✅ Thread seleccionado se mantiene visible en sidebar
- ✅ Panel derecho se actualiza con la conversación

### 3.2. Mobile (<1024px)

**Al entrar a `/messages`:**
1. Mismo flujo de queries que desktop
2. Renderiza solo sidebar (panel derecho está `hidden lg:flex`)
3. Lista de threads como rows (no Cards)
4. URL: `/messages`

**Al seleccionar un thread (click en row):**
1. Navegación completa a `/messages/${threadId}` (NO query param)
2. Se renderiza `app/messages/[thread_id]/page.tsx` (página completa)
3. Comportamiento idéntico al anterior (antes de FASE 1)
4. URL: `/messages/{threadId}`

**Comportamiento:**
- ✅ No cambió respecto al comportamiento anterior
- ✅ Sigue navegando a página completa
- ✅ Mobile no usa split view (por diseño)

---

## 4. ARQUITECTURA SSR / CLIENT

### 4.1. Server Components

**Componentes que SON Server Components (sin `'use client'`):**

1. **`app/messages/page.tsx`**
   - Función `async`
   - Hace queries con `createServerSupabaseClient()`
   - Renderiza directamente JSX

2. **`app/messages/ThreadPanel.tsx`**
   - Función `async`
   - Hace queries con `createServerSupabaseClient()`
   - Renderiza directamente JSX

3. **`app/messages/[thread_id]/page.tsx`**
   - Función `async`
   - Hace queries con `createServerSupabaseClient()`
   - **NO se modificó en FASE 2**

4. **`app/components/LifestyleBadges.tsx`**
   - Server Component (sin `'use client'`)
   - **NO se modificó en FASE 2**

5. **`app/components/ui/EmptyState.tsx`**
   - Server Component (sin `'use client'`)
   - **NO se modificó en FASE 2**

### 4.2. Client Components

**Componentes que SON Client Components (con `'use client'`):**

1. **`app/messages/[thread_id]/MessageForm.tsx`**
   - Tiene `'use client'`
   - Usa `useState`, `FormEvent`
   - Llama `sendMessage()` server action
   - **NO se modificó en FASE 2**
   - **Usado por:** `ThreadPanel` y `app/messages/[thread_id]/page.tsx`

2. **`app/components/HeaderModeTabs.tsx`**
   - Client Component
   - **NO relacionado con FASE 2**

3. **`app/components/UserMenu.tsx`**
   - Client Component
   - **NO relacionado con FASE 2**

### 4.3. Confirmación: No hay fetch de datos en Client Components

✅ **Verificado:**
- `MessageForm` NO hace queries (solo llama server action `sendMessage()`)
- Todos los datos se fetchean en Server Components
- `ThreadPanel` es Server Component y hace todas las queries
- `MessagesPage` es Server Component y hace todas las queries

**Flujo de datos:**
```
Server Component (MessagesPage)
  ↓ queries threads
  ↓ renderiza ThreadRow (Server Component interno)
  ↓ renderiza ThreadPanel (Server Component)
      ↓ queries thread, profile, messages
      ↓ renderiza MessageForm (Client Component)
          ↓ solo llama sendMessage() server action
```

---

## 5. COSAS QUE EXPLÍCITAMENTE NO SE TOCARON

### 5.1. Base de Datos

✅ **No se modificó:**
- Tabla `threads` (estructura, índices, RLS)
- Tabla `messages` (estructura, índices, RLS)
- Tabla `profiles` (estructura, índices, RLS)
- No se agregaron columnas nuevas
- No se modificaron relaciones

### 5.2. Server Actions

✅ **No se modificó:**
- `app/messages/actions.ts` (sin cambios)
  - `findOrCreateThread()` (sin cambios)
  - `sendMessage()` (sin cambios)
- No se crearon nuevas server actions
- No se modificaron validaciones en server actions

### 5.3. RLS / Permisos

✅ **No se modificó:**
- Políticas RLS de `threads` (sin cambios)
- Políticas RLS de `messages` (sin cambios)
- Políticas RLS de `profiles` (sin cambios)
- Validaciones de participante en código (sin cambios)

### 5.4. `app/messages/[thread_id]/page.tsx`

✅ **NO se modificó:**
- Archivo completo sin cambios
- Sigue funcionando igual que antes
- Sigue siendo la ruta para mobile y para acceso directo
- Queries idénticas
- UI idéntica
- Validaciones idénticas

**Confirmación:**
- Líneas de código: 169 líneas (sin cambios)
- Queries: Mismas queries que `ThreadPanel` (pero en página completa)
- UI: Layout de página completa (no panel)
- `MessageForm`: Mismo componente, mismo comportamiento

### 5.5. Otros archivos no relacionados

✅ **No se modificó:**
- `app/messages/[thread_id]/MessageForm.tsx` (sin cambios)
- `app/messages/actions.ts` (sin cambios)
- `lib/requireProfile.ts` (sin cambios)
- `lib/supabase/server.ts` (sin cambios)
- Cualquier otro archivo del proyecto

---

## 6. RIESGOS CONOCIDOS O PUNTOS A VIGILAR

### 6.1. MessageForm hace `window.location.reload()`

**Riesgo:**
- `MessageForm` (línea 40) hace `window.location.reload()` después de enviar mensaje
- Esto recarga toda la página, perdiendo estado y scroll position
- En desktop split view, esto recarga `/messages?thread={id}` (mantiene thread seleccionado)
- En mobile, recarga `/messages/{id}` (página completa)

**Impacto:**
- UX no ideal (recarga completa)
- Pérdida de scroll position en panel
- No hay feedback inmediato (espera recarga)

**Solución pendiente (FASE 3):**
- Reemplazar `window.location.reload()` por `router.refresh()` o optimistic updates
- Agregar scroll automático al final después de enviar

### 6.2. No hay scroll automático en ThreadPanel

**Riesgo:**
- Al cargar `ThreadPanel`, los mensajes no scrollan automáticamente al final
- Usuario ve mensajes antiguos en lugar del último mensaje
- En desktop split view, esto es más notorio

**Impacto:**
- UX confusa (usuario no ve el último mensaje inmediatamente)
- Requiere scroll manual

**Solución pendiente (FASE 3):**
- Agregar `useEffect` en Client Component wrapper o usar `scrollIntoView` en Server Component con `useEffect` hook

### 6.3. Duplicación de queries entre ThreadPanel y MessagesPage

**Riesgo:**
- `MessagesPage` hace query de threads + perfiles + últimos mensajes
- `ThreadPanel` hace query del mismo thread + perfil + mensajes completos
- Hay overlap: perfil del otro usuario se consulta dos veces

**Impacto:**
- Performance: queries duplicadas (no crítico, pero ineficiente)
- No es un bug, solo optimización pendiente

**Solución pendiente (Futuro):**
- Considerar pasar datos del sidebar al panel (pero complica arquitectura SSR)
- O aceptar duplicación como trade-off de SSR simple

### 6.4. No hay ordenamiento por último mensaje en sidebar

**Riesgo:**
- Sidebar ordena threads por `thread.created_at` (fecha de creación del thread)
- No ordena por fecha del último mensaje
- Threads antiguos con mensajes recientes aparecen abajo

**Impacto:**
- UX confusa (conversaciones activas no aparecen primero)
- No es un bug, solo mejora pendiente

**Solución pendiente (Futuro):**
- Ordenar threads por `MAX(messages.created_at)` o subquery
- O ordenar en código después de obtener datos

### 6.5. ThreadPanel no maneja estados de carga

**Riesgo:**
- `ThreadPanel` es Server Component, no tiene loading states
- Si queries son lentas, usuario ve panel vacío o error
- No hay skeletons o spinners

**Impacto:**
- UX no ideal (no hay feedback de carga)
- No es crítico (SSR es rápido normalmente)

**Solución pendiente (Futuro):**
- Agregar `loading.tsx` en Next.js App Router
- O agregar skeletons en el componente

### 6.6. Validación de participante se hace dos veces

**Riesgo:**
- `MessagesPage` ya filtra threads donde usuario es participante (RLS)
- `ThreadPanel` valida participante nuevamente
- Redundante pero seguro (defense in depth)

**Impacto:**
- No es un problema, es una práctica segura
- RLS ya previene acceso no autorizado

**No requiere solución:** Es una buena práctica mantener validación en aplicación además de RLS.

---

## 7. RESUMEN DE CAMBIOS

### 7.1. Archivos creados: 1
- `app/messages/ThreadPanel.tsx`

### 7.2. Archivos modificados: 1
- `app/messages/page.tsx`

### 7.3. Archivos sin cambios: Todos los demás
- `app/messages/[thread_id]/page.tsx` (sin cambios)
- `app/messages/[thread_id]/MessageForm.tsx` (sin cambios)
- `app/messages/actions.ts` (sin cambios)
- Base de datos (sin cambios)
- Server actions (sin cambios)
- RLS (sin cambios)

### 7.4. Funcionalidad nueva
- ✅ Split view en desktop (`/messages?thread={id}`)
- ✅ Panel derecho con conversación completa
- ✅ Links condicionales por breakpoint
- ✅ Estado seleccionado en sidebar

### 7.5. Funcionalidad preservada
- ✅ Mobile sigue navegando a `/messages/{id}` (sin cambios)
- ✅ `app/messages/[thread_id]/page.tsx` sigue funcionando igual
- ✅ Queries y validaciones sin cambios
- ✅ Server Components mantenidos (SSR friendly)

---

## 8. ESTADO ACTUAL PARA FASE 3

**Listo para continuar:**
- ✅ Split view funcional en desktop
- ✅ ThreadPanel SSR funcionando
- ✅ Mobile sin cambios (comportamiento preservado)
- ✅ Arquitectura SSR mantenida

**Pendiente para FASE 3:**
- ⏳ Eliminar `window.location.reload()` en `MessageForm`
- ⏳ Agregar scroll automático al final
- ⏳ Mejorar feedback de envío de mensajes
- ⏳ Posiblemente agregar optimistic updates

**No bloqueante:**
- Optimizaciones de queries (duplicación)
- Ordenamiento por último mensaje
- Estados de carga (skeletons)

---

**Fin de la auditoría FASE 2**




