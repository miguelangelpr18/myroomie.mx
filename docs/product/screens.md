# MyRoomie.mx — Inventario de Pantallas

> Última actualización: abril 2026
> Registro de todas las pantallas de la app, su propósito, estado y prioridad.

---

## Resumen

| Estado | Cantidad |
|--------|----------|
| Lista para producción | 16 |
| Funcional pero necesita mejoras | 7 |
| Placeholder / próximamente | 3 |
| Redirect / utility | 2 |
| **Total** | **28** |

---

## Pantallas públicas (sin auth)

### 1. Landing — `/`

- **Propósito:** Primera impresión. Convertir visitantes en usuarios. Mostrar valor del producto.
- **Contenido:** Hero con CTAs, estadísticas en vivo (listings/profiles), pills de ciudades, anuncios recientes, roomies recientes, "Cómo funciona", features grid.
- **Estado:** ✅ Lista
- **Datos:** Server Component con stats desde Supabase + Suspense para featured content
- **Mejoras pendientes:**
  - [ ] Agregar testimoniales o social proof real
  - [ ] OG image personalizada para compartir en redes

### 2. Catálogo de anuncios — `/listings`

- **Propósito:** Explorar y filtrar cuartos en renta.
- **Contenido:** Grid de ListingCards con filtros (ciudad, precio, tipo), pills de ciudades, paginación (24/página), ordenamiento (recientes, precio asc/desc, featured first).
- **Estado:** ✅ Lista
- **Datos:** Server Component con query parametrizada a Supabase
- **Mejoras pendientes:**
  - [ ] Migrar imágenes a next/image
  - [ ] Agregar vista de mapa (Mapbox)

### 3. Detalle de anuncio — `/listings/[id]`

- **Propósito:** Ver toda la información de un anuncio y contactar al anunciante.
- **Contenido:** Galería de fotos, precio/ubicación/fecha, descripción, amenidades, perfil del anunciante con badges, botones Contactar/Guardar, JSON-LD para SEO.
- **Estado:** ✅ Lista
- **Datos:** Server Component + generateMetadata dinámica + OG tags
- **Mejoras pendientes:**
  - [ ] Migrar galería a next/image
  - [ ] Agregar mapa de ubicación
  - [ ] Agregar listings similares al final

### 4. Explorar roomies — `/explore`

- **Propósito:** Descubrir roomies compatibles por estilo de vida.
- **Contenido:** Grid de RoomieCards con filtros (ciudad, featured, mascotas, no fumador, tranquilo), pills de ciudades, paginación.
- **Estado:** ✅ Lista
- **Datos:** Server Component con filtros booleanos de lifestyle
- **Mejoras pendientes:**
  - [ ] Agregar más filtros (presupuesto, edad, horario)
  - [ ] Score de compatibilidad visual

### 5. Perfil público — `/profiles/[user_id]`

- **Propósito:** Ver perfil completo de un roomie y sus anuncios.
- **Contenido:** Avatar, nombre, ciudad/zona, badges de lifestyle, bio, anuncios publicados, botón contactar, panel de confianza, botón reportar.
- **Estado:** ✅ Lista
- **Datos:** Server Component + generateMetadata dinámica

### 6. Seguridad — `/security`

- **Propósito:** Guías de seguridad para meetups y uso de la plataforma.
- **Contenido:** Recomendaciones de seguridad (verificar identidad, lugar público, avisar a alguien, confiar en instinto).
- **Estado:** ✅ Lista (contenido estático)

### 7. Legal — `/legal/terms`, `/legal/privacy`, `/legal/safety`

- **Propósito:** Páginas legales obligatorias.
- **Estado:** ✅ Listas (contenido estático)

---

## Pantallas de autenticación

### 8. Login — `/login`

- **Propósito:** Iniciar sesión con email/password o Google OAuth.
- **Estado:** ✅ Lista, pendiente Google OAuth. (Ya está implementado pero aparece: {"code":400,"error_code":"validation_failed","msg":"Unsupported provider: provider is not enabled"})
- **Mejoras pendientes:**
  - [ ] Agregar rate limiting a intentos fallidos

### 9. Signup — `/signup`

- **Propósito:** Registro de nueva cuenta.
- **Estado:** ✅ Lista

### 10. Intent de signup — `/signup/intent`

- **Propósito:** Pregunta post-signup: "¿Buscas roomie o rentas un espacio?" para personalizar onboarding.
- **Estado:** ✅ Lista

### 11. Forgot password — `/forgot-password`

- **Propósito:** Enviar email de recuperación de contraseña.
- **Estado:** ✅ Lista (usa Supabase Auth)

### 12. Reset password — `/reset-password`

- **Propósito:** Formulario para establecer nueva contraseña.
- **Estado:** ✅ Lista

---

## Pantallas autenticadas (requieren login)

### 13. Onboarding paso 1 — `/onboarding/step-1`

- **Propósito:** Crear perfil básico (nombre, ciudad, zona, avatar).
- **Estado:** ✅ Lista
- **Datos:** Server Action con validación Zod

### 14. Onboarding paso 2 — `/onboarding/step-2`

- **Propósito:** Configurar preferencias de estilo de vida (mascotas, fumar, limpieza, horario, fiestas).
- **Estado:** ✅ Lista (opcional, se puede saltar)

### 15. Dashboard — `/dashboard`

- **Propósito:** Panel del usuario. Ver su perfil, sus anuncios publicados, acciones rápidas.
- **Contenido:** Resumen de perfil, lista de mis listings con estado (activo/inactivo), placeholders de verificación.
- **Estado:** ⚠️ Funcional, necesita mejoras
- **Mejoras pendientes:**
  - [ ] Implementar sistema de verificación real (email, teléfono)
  - [ ] Agregar estadísticas (vistas de mis anuncios, mensajes recibidos)
  - [ ] Mejorar UI del panel de verificación (hoy son placeholders)

### 16. Crear anuncio — `/listings/new`

- **Propósito:** Formulario para publicar un nuevo listing.
- **Contenido:** Selector de tipo, formulario con título/descripción/precio/ciudad/zona, subida de fotos (ImageUploader), amenidades (AmenitiesSelector), preferencias de convivencia.
- **Estado:** ✅ Lista
- **Datos:** Server Action con validación Zod + rate limiting

### 17. Editar anuncio — `/listings/[id]/edit`

- **Propósito:** Modificar un listing existente.
- **Estado:** ✅ Lista
- **Datos:** Server Action con ownership check atómico

### 18. Mensajes (inbox) — `/messages`

- **Propósito:** Lista de conversaciones del usuario.
- **Contenido:** ThreadList con nombre del otro usuario, último mensaje, fecha, indicador de no leído.
- **Estado:** ⚠️ Funcional, necesita mejoras importantes
- **Mejoras pendientes:**
  - [ ] **PRIORITARIO: Mensajería en tiempo real** (Supabase Realtime) — hoy requiere refresh para ver nuevos mensajes
  - [ ] Indicador de "escribiendo..."
  - [ ] Notificación push o badge en header cuando hay mensajes nuevos
  - [ ] Búsqueda dentro de conversaciones

### 19. Conversación — `/messages/[thread_id]`

- **Propósito:** Ver y enviar mensajes en un thread específico.
- **Contenido:** ThreadPanel con historial de mensajes, formulario de envío (MessageForm), auto-scroll.
- **Estado:** ⚠️ Funcional, necesita tiempo real
- **Mejoras pendientes:**
  - [ ] Tiempo real (mismo que inbox)
  - [ ] Mostrar info del listing asociado al thread
  - [ ] Indicador de lectura (leído/no leído)

### 20. Guardados — `/saved`

- **Propósito:** Lista de anuncios que el usuario guardó como favoritos.
- **Estado:** ✅ Lista

### 21. Editar perfil — `/profiles/edit`

- **Propósito:** Modificar perfil público (nombre, ciudad, zona, bio, avatar).
- **Estado:** ✅ Lista

### 22. Cuenta — `/account`

- **Propósito:** Configuración de cuenta (nombre, avatar). Separado de perfil público.
- **Estado:** ✅ Lista

### 23. Promover perfil — `/promote/profile`

- **Propósito:** Comprar promoción para destacar perfil en /explore.
- **Estado:** ⚠️ UI existe, backend deshabilitado
- **Bloqueo:** Necesita integración de gateway de pago
- **Mejoras pendientes:**
  - [ ] Integrar Stripe o Conekta
  - [ ] Diseñar planes y precios
  - [ ] Flujo de pago completo

### 24. Promover anuncio — `/promote/listing/[id]`

- **Propósito:** Comprar promoción para destacar un listing.
- **Estado:** ⚠️ UI existe, backend deshabilitado (mismo bloqueo que perfil)

### 25. Compatibles — `/matches`

- **Propósito:** Matching inteligente entre roomies.
- **Estado:** 🔮 Placeholder — muestra "Próximamente" con descripción de la feature
- **Nota:** Feature de roadmap futuro. No es necesaria para v1.

---

## Pantallas utility

### 26. Shortlist — `/shortlist`

- **Propósito:** Redirect a `/saved` (alias legacy)
- **Estado:** ✅ Redirect

### 27. Auth callback — `/auth/callback`

- **Propósito:** Route handler para OAuth callback de Supabase.
- **Estado:** ✅ Funcional (no es una página visible)

### 28. Logout — `/logout`

- **Propósito:** Server Action para cerrar sesión.
- **Estado:** ✅ Funcional (no es una página visible)

---

## Pantallas que faltan (no implementadas)

| Pantalla | Prioridad | Descripción |
|----------|-----------|-------------|
| Admin dashboard | Media | Panel para moderación de reportes y métricas |
| Notificaciones | Alta | Centro de notificaciones (in-app y email) |
| Configuración de notificaciones | Media | Preferencias de qué notificar y cómo |
| Verificación de identidad | Media | Flujo para verificar email, teléfono, ID |
| Página de pricing | Baja | Mostrar planes de promoción y precios |

---

## Prioridad de mejoras por pantalla

### Impacto alto (hacer primero)

1. `/messages` + `/messages/[thread_id]` — Tiempo real (afecta retención)
2. `/listings` + `/listings/[id]` — Migrar a next/image (afecta primera impresión)
3. `/dashboard` — Verificación real + estadísticas (afecta confianza)

### Impacto medio

4. `/explore` — Más filtros + score de compatibilidad
5. `/listings/[id]` — Mapa de ubicación + listings similares
6. `/promote/*` — Integrar pagos

### Impacto bajo (puede esperar)

7. `/matches` — Matching inteligente
8. `/listings` — Vista de mapa
9. Admin dashboard
