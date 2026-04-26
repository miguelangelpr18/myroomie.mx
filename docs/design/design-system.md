# MyRoomie.mx — Design System

> Última actualización: abril 2026
> Este documento define las reglas visuales del producto. Todo componente nuevo debe seguir estas guías.

---

## Principios de diseño

1. **Limpio y legible** — Fondo blanco, mucho whitespace, tipografía clara. Nada de fondos oscuros ni gradientes pesados.
2. **Mobile-first** — Diseño pensado primero para móvil (Tailwind breakpoints: sm, md, lg).
3. **Consistente** — Mismos colores, bordes, sombras y espaciados en toda la app. Sin excepciones.
4. **Accesible** — Contraste suficiente, aria-labels en botones de solo icono, HTML semántico.
5. **En español** — Todo texto es en es-MX. Sin spanglish excepto términos técnicos universales (roomie, listing).

---

## Tipografía

| Propiedad | Valor |
|-----------|-------|
| **Font family** | Inter (Google Fonts) con fallback a system-ui |
| **Variable CSS** | `--font-inter` |
| **Display** | `swap` (evita FOIT) |
| **Peso base** | 400 (regular) |

### Escala tipográfica

| Uso | Clase Tailwind | Tamaño | Peso | Tracking |
|-----|---------------|--------|------|----------|
| H1 (hero) | `text-4xl md:text-5xl xl:text-6xl` | 36/48/60px | 500 (semibold) | -0.01em |
| H1 (página) | `text-2xl md:text-3xl` | 24/30px | 500 | -0.01em |
| H2 (sección) | `text-2xl` | 24px | 500 | -0.005em |
| H3 (subsección) | `text-base` | 16px | 600 | normal |
| Body | `text-sm` | 14px | 400 | normal |
| Caption / label | `text-xs` | 12px | 400-500 | normal |

### Reglas de tipografía

- Los headings usan `font-weight: 500` (medium), NO bold (700).
- Color de headings: `neutral-900` (#171717)
- Color de body: `neutral-600` (#525252) o `neutral-500` (#737373)
- Line height ajustada en headings (1.1 a 1.2), relajada en body (1.5+)
- Definido en `globals.css` como `@layer base`

---

## Colores

### Paleta brand

| Token Tailwind | Hex | Uso |
|---------------|-----|-----|
| `brand` | `#FF7A18` | Color primario — CTAs, badges, acentos, iconos activos |
| `brandHover` | `#E96A0F` | Hover state del primario |
| `brandSoft` | `#FFF1E8` | Fondo suave brand (badges, pills, highlights) |
| `brandBorder` | `#FFD6BD` | Bordes brand suaves |
| `brandText` | `#A63C00` | Texto sobre fondo brandSoft |

### Paleta neutral

| Token Tailwind | Hex | Uso |
|---------------|-----|-----|
| `neutral-900` | `#171717` | Headings, texto principal fuerte |
| `neutral-700` | `#404040` | Texto secundario fuerte |
| `neutral-600` | `#525252` | Texto body |
| `neutral-500` | `#737373` | Texto terciario, captions |
| `neutral-400` | `#A3A3A3` | Placeholders, texto muy ligero |
| `neutral-200` | `#E5E5E5` | Bordes |
| `neutral-100` | `#F5F5F5` | Divisores, bordes sutiles |
| `neutral-50` | `#FAFAFA` | Fondos secundarios |
| `white` | `#FFFFFF` | Fondo principal |

### Paleta semántica

| Uso | Color | Clase |
|-----|-------|-------|
| Error | Rojo | `bg-red-50 text-red-700 border-red-200` |
| Éxito | Verde | `bg-green-50 text-green-700` |
| Featured badge | Brand | `bg-brand text-white` |

### Regla principal

**NUNCA usar colores hardcodeados.** Siempre usar los tokens de Tailwind definidos arriba. Si necesitas `#FF7A18`, usa `text-brand` o `bg-brand`. Esto permite cambiar toda la paleta desde `tailwind.config.ts`.

---

## Espaciado y layout

### Contenedores

| Contexto | Clase | Max width |
|----------|-------|-----------|
| Layout general | `max-w-7xl mx-auto` | 1280px |
| Contenido centrado (landing) | `max-w-5xl mx-auto` | 1024px |
| Formularios, detalle | `max-w-4xl mx-auto` | 896px |
| Texto estrecho | `max-w-3xl mx-auto` | 768px |

### Padding horizontal

| Breakpoint | Clase |
|-----------|-------|
| Mobile | `px-4` (16px) |
| Desktop | `md:px-8` (32px) |

### Padding vertical (páginas)

| Tipo | Clase |
|------|-------|
| Página estándar | `py-10 md:py-12` o `py-16` |
| Hero | `pt-16 pb-14 md:pt-24 md:pb-20` |
| Sección | `py-16` |

### Grid

| Contexto | Clase |
|----------|-------|
| Cards de listings | `grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6` |
| Cards de roomies | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6` |
| Features grid | `grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6` |

---

## Componentes base

### Botones

| Variante | Clases | Uso |
|----------|--------|-----|
| **Primary** | `bg-brand text-white hover:bg-brandHover rounded-xl h-11 px-6 text-sm font-semibold` | CTA principal (Buscar, Publicar, Contactar) |
| **Secondary** | `border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50 rounded-xl h-11 px-6 text-sm font-semibold` | Acción secundaria (Ver anuncios, Cancelar) |
| **Small** | `h-10 px-4 rounded-lg text-sm font-medium` | Botones en contextos compactos |
| **Link** | `text-brand hover:text-brandHover text-sm font-medium` | Navegación inline |

### Cards

| Propiedad | Valor |
|-----------|-------|
| Background | `bg-white` |
| Border | `border border-neutral-200` o sin borde con sombra |
| Border radius | `rounded-xl` (12px) o `rounded-2xl` (16px) |
| Shadow | `shadow-sm` (reposo), `shadow-md` (hover) |
| Padding | `p-4` o `p-6` |

### Badges / Pills

| Variante | Clases |
|----------|--------|
| **Brand pill** | `bg-brand/10 text-brand rounded-full px-3 py-1 text-xs font-medium` |
| **Featured** | `bg-brand text-white rounded-full px-3 py-1 text-sm font-semibold` |
| **City pill** | `border border-neutral-200 rounded-full px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-50` |
| **Filter chip** | `border rounded-full px-3 py-1.5 text-xs font-medium` (active: `bg-brand/10 text-brand border-brand/20`) |

### Inputs / Forms

| Propiedad | Valor |
|-----------|-------|
| Border | `border border-neutral-200` |
| Border radius | `rounded-lg` (8px) |
| Focus | `focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30` |
| Height | `h-10` o `h-11` |
| Padding | `px-3` o `px-4` |
| Placeholder color | `neutral-400` |

### Avatars

| Tamaño | Clase | Uso |
|--------|-------|-----|
| sm | `w-8 h-8` | Header, listas compactas |
| md | `w-10 h-10` | Cards de roomie |
| lg | `w-14 h-14` o `w-16 h-16` | Perfil, detalle de listing |
| Fallback | Iniciales en `bg-brand/10 text-brand rounded-full` |

### Empty states

- Icono en `w-20 h-20 rounded-full bg-brand/10 text-brand`
- Título en `text-xl font-semibold`
- Descripción en `text-neutral-500 text-sm`
- CTA primary button

---

## Iconos

- **Librería:** SVG inline (no librería de iconos externa)
- **Estilo:** Outlined (`fill="none" stroke="currentColor" strokeWidth={2}`)
- **Tamaño estándar:** `w-5 h-5` (20px)
- **Color:** Hereda del padre (`currentColor`)

---

## Patrones de interacción

### Transiciones

- Botones: `transition-colors` (solo color, no todo)
- Cards hover: `hover:shadow-md transition-shadow`
- Links: `hover:underline` o `hover:opacity-80 transition-opacity`

### Focus visible

Todas las interacciones deben tener `focus-visible:ring-2 focus-visible:ring-brand/30`. Esto asegura accesibilidad por teclado sin afectar clicks de mouse.

### Loading states

Cada página con datos dinámicos debe tener un `loading.tsx` con skeleton que refleje el layout real.

### Error states

- Inline errors: `bg-red-50 text-red-700 border border-red-200 rounded-lg p-4 text-sm`
- Página de error: `app/error.tsx` (ya implementada)
- 404: `app/not-found.tsx` (ya implementada)

---

## Archivo de configuración

### tailwind.config.ts

```typescript
colors: {
  brand: '#FF7A18',
  brandHover: '#E96A0F',
  brandSoft: '#FFF1E8',
  brandBorder: '#FFD6BD',
  brandText: '#A63C00',
  ink: '#111827',
  muted: '#6B7280',
}
```

### globals.css

Headings con pesos y tracking definidos en `@layer base`. Utility `.scrollbar-hide` para ocultar scrollbars.

---

## Checklist para componentes nuevos

Antes de crear un componente, verifica:

- [ ] Usa tokens de Tailwind, no colores hardcodeados
- [ ] Es Server Component por defecto (solo `'use client'` si necesita hooks/eventos)
- [ ] Props tipadas con `interface` (nunca `any`)
- [ ] Texto en español (es-MX)
- [ ] Accesible: `aria-label` en botones de solo icono, `alt` en imágenes
- [ ] Responsive: mobile-first con breakpoints sm/md/lg
- [ ] Tiene loading state si hace fetch
- [ ] Tiene empty state si puede no tener datos
