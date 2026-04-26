# MyRoomie.mx — Visión del Producto

> Última actualización: abril 2026
> Este documento es la fuente de verdad sobre qué es MyRoomie, para quién, y hacia dónde va.

---

## Qué es MyRoomie.mx

MyRoomie.mx es un marketplace web para México que conecta personas que buscan roomie o cuarto en renta. Funciona como punto de encuentro entre quienes ofrecen un espacio y quienes buscan dónde vivir o con quién compartir.

Nace como alternativa moderna a grupos de Facebook, Marketplace y sitios con UX anticuada. La propuesta es ofrecer un flujo limpio (perfil → búsqueda → filtros → contacto), mensajería dentro de la app, perfiles estructurados, validados por ID card y señales de compatibilidad por estilo de vida.

---

## Problema que resuelve

Hoy en México, buscar roomie o cuarto se hace principalmente por:

- **Grupos de Facebook** — Posts desordenados, sin filtros, sin verificación, información inconsistente. Hay que scrollear infinito y confiar en fotos borrosas.
- **Marketplace de Facebook** — Mezclado con muebles, autos y todo lo demás. No está diseñado para roomies.
- **Inmobiliarias/portales tradicionales** — Enfocados en rentas completas, no en compartir. Precios altos, sin matching de estilo de vida.
- **Boca en boca / WhatsApp** — Funciona pero no escala. Depende de tu red de contactos.

Ninguna opción ofrece: perfiles con preferencias de convivencia, filtros por estilo de vida, mensajería integrada, y enfoque específico en el mercado mexicano de cuartos compartidos.

---

## Para quién es

### Personas principales (usuarios directos)

| Persona | Edad típica | Situación | Qué busca |
|---------|-------------|-----------|-----------|
| **Estudiante** | 18-24 | Se muda por universidad o beca | Cuarto cerca de campus, roomie compatible, precio accesible |
| **Joven profesionista** | 25-35 | Primer empleo o cambio de ciudad | Depa compartido, zona céntrica, roomie con horarios similares |
| **Persona en mudanza** | Cualquier edad | Cambio de ciudad por trabajo/familia | Explorar opciones antes de llegar, publicar espacio que deja |
| **Propietario/arrendador** | Cualquier edad | Tiene un inmueble con cuartos | Publicar anuncio con fotos, recibir contactos cualificados |

### Mercado geográfico

Enfoque inicial en ciudades urbanas principales de México:

- **Monterrey** — Alta demanda por universidades y sector tech
- **Ciudad de México** — Mayor mercado, mayor competencia
- **Guadalajara** — Crecimiento tech, universidades
- **Puebla** — Mercado universitario fuerte
- **Tijuana** — Mercado transfronterizo, manufactura
- **León** — Mercado automotriz, universities
- **Querétaro** — Crecimiento industrial, universidades
- **San Luis Potosí** — Crecimiento industrial, universidades
- **Hermosillo** — Crecimiento industrial, universidades
- **Mérida** — Crecimiento industrial, universidades
- **Aguascalientes** — Crecimiento industrial, universidades
- **Xalapa** — Crecimiento industrial, universidades
- **Cancún** — Crecimiento industrial, universidades
- **Toluca** — Crecimiento industrial, universidades
- **Culiacán** — Crecimiento industrial, universidades
- **Saltillo** — Crecimiento industrial, universidades
- **Torreón** — Crecimiento industrial, universidades
- **Chihuahua** — Crecimiento industrial, universidades
- **Pachuca** — Crecimiento industrial, universidades
- **Morelia** — Crecimiento industrial, universidades
- **Veracruz** — Crecimiento industrial, universidades
- **Oaxaca** — Crecimiento industrial, universidades
- **Tampico** — Crecimiento industrial, universidades
- **Juárez** — Crecimiento industrial, universidades

Expansión orgánica a otras ciudades conforme crezca la base de usuarios.

---

## Propuesta de valor (diferenciadores)

1. **Matching por estilo de vida** — Filtros y badges de compatibilidad: mascotas, fuma, limpieza, horarios, fiestas. Sabes si alguien es compatible antes de escribirle.

2. **Perfiles estructurados** — Información clara y comparable (no posts caóticos en redes sociales). Avatar, ciudad, zona, bio, preferencias de convivencia.

3. **Mensajería integrada** — Chat directo sin compartir WhatsApp prematuramente. El contacto se da dentro de la plataforma primero.

4. **100% gratis para usar** — Publicar y buscar es gratuito. Sin comisiones ni intermediarios.

5. **Enfoque México** — Precios en MXN, ciudades mexicanas, español es-MX, contexto cultural local.

6. **Búsqueda por zona** — Filtrado por colonia/zona con autocomplete de Mapbox, no solo por ciudad.

---

## Modelo de negocio

### Monetización actual (v1)

- **Uso principal:** Gratuito (crear perfil, publicar anuncios, buscar, contactar, mensajear)
- **Promoción opcional:** Pago para destacar un anuncio o perfil (aparece primero en resultados con badge "Destacado")
  - El backend ya marca `featured_until` en la DB
  - **Pendiente:** Integrar gateway de pago (Stripe o Conekta) para cobrar

### Monetización futura (ideas por validar)

- Verificación premium (ID, teléfono, referencias)
- Anuncios patrocinados por inmobiliarias
- Suscripción para propietarios con múltiples espacios
- Comisión por mudanza/servicios conectados

### Métricas clave a trackear

- Usuarios registrados (profiles)
- Anuncios activos (listings con is_active = true)
- Mensajes enviados (engagement)
- Conversión: visita → registro → publicación/contacto
- Retención: usuarios que regresan en 7/30 días

---

## Tipos de anuncios (listings)

| Tipo | listing_type | Subtipo | Descripción |
|------|-------------|---------|-------------|
| **Rento un espacio** | `room` | `solo_renta` | "Tengo un cuarto/depa disponible, busco inquilino" |
| **Busco roomie** | `roommate` | `buscar_roomie` | "Busco con quién compartir un espacio que ya tengo o voy a rentar" |

Cada listing incluye: título, descripción, ciudad, zona/colonia, precio en MXN (opcional), hasta 10 fotos, amenidades (WiFi, cocina, mascotas, etc.), y preferencias de convivencia.

---

## Flujos de usuario principales

### Flujo 1: "Busco un cuarto para rentar"

```
Landing (/) → Ver anuncios (/listings) → Filtrar por ciudad/precio/tipo
→ Click en listing → Ver detalle, fotos, perfil del anunciante
→ Contactar por mensaje → Conversación en /messages
→ Acordar visita presencial
```

### Flujo 2: "Quiero rentar mi cuarto"

```
Landing (/) → Registrarse (/signup) → Onboarding (perfil + preferencias)
→ Publicar anuncio (/listings/new) → Subir fotos, descripción, precio
→ Anuncio aparece en /listings y en /dashboard
→ Recibir mensajes de interesados → Responder y coordinar
```

### Flujo 3: "Busco roomie compatible"

```
Landing (/) → Buscar roomie (/explore) → Filtrar por ciudad + estilo de vida
→ Ver perfiles con badges de compatibilidad
→ Contactar a quien coincida → Conversación en /messages
→ Videollamada (recomendado) → Visita presencial
```

---

## Metas y Visión:

- Basarnos mucho en la funcionalidad de AirBnb como por ejemplo, que sea muy fácil subir anuncios, que sea fácil buscar y encontrar cuartos o roomies, que sea fácil contactar y coordinar visitas, etc. Filtros completos al publicar listing o roomie, tener buen buscador, que sea un flujo muy similar pero enfocado en roomies en México.
- Llegar a tener un sitio web que tenga todas las características de las otras plataformas de roomies existentes en el mercado y aun adicional tener un mayor nivel de confianza, mayor facilidad de uso y una experiencia de usuario superior.


---

## Lo que NO es MyRoomie (alcance)

- **No es una inmobiliaria** — No intermediamos rentas completas ni cobramos comisión sobre la renta.
- **No es una red social** — No hay feed, likes, stories. Es transaccional: encuentra, contacta, coordina.
- **No es solo CDMX** — Es para todo México, con enfoque en ciudades urbanas principales.
- **No es un servicio de mudanza** — No ofrecemos servicios físicos (aún).

---

## Estado actual (abril 2026)

- **MVP funcional** desplegado en producción: https://www.myroomie.mx/
- **Auth funcionando** (email/password + Google OAuth)
- **28 pantallas** implementadas (ver docs/product/screens.md)
- **Mensajería** funcional pero sin tiempo real (requiere refresh)
- **Promoción** con UI pero sin gateway de pago integrado
- **Verificación** con placeholders pero sin implementación
- **Score de production-readiness:** 7.5/10 (post auditoría de seguridad abril 2026)
