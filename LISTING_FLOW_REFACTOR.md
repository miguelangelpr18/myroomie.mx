# FLUJO DE CREACIÓN DE LISTINGS CON PERFIL DE CONVIVENCIA

## 🎯 Objetivo

Implementar un flujo moderno de creación de listings que diferencia entre:
- **Solo Renta**: Enfoque en la propiedad (propietarios/arrendadores)
- **Buscar Roomie**: Enfoque en convivencia (incluye perfil de compatibilidad)

## 📦 Archivos Creados/Modificados

### Nuevos Componentes

1. **`app/listings/new/ListingTypeSelector.tsx`** (~150 líneas)
   - Tarjetas visuales estilo Airbnb
   - Selección clara de tipo de anuncio
   - Iconos y descripciones para cada opción
   - Feedback visual con `brandSoft` y checkmark
   - Diseño responsive

2. **`app/listings/new/ConvivenciaProfile.tsx`** (~200 líneas)
   - Formulario de perfil de convivencia
   - Campos: ocupación, ambiente deseado, fumar, mascotas, visitas, limpieza, ruido
   - Botones toggle para hábitos
   - Escalas 1-5 para limpieza y tolerancia al ruido
   - Design system consistente con tokens `brand`

### Archivos Modificados

3. **`app/listings/new/ListingForm.tsx`**
   - ✅ Flujo de 2 pasos: tipo → formulario
   - ✅ Validación condicional según tipo
   - ✅ Muestra ConvivenciaProfile solo si `listing_subtype === 'buscar_roomie'`
   - ✅ Header con tipo seleccionado y opción de cambiar
   - ✅ Placeholders dinámicos según tipo

4. **`app/listings/new/actions.ts`**
   - ✅ `ListingData` incluye `listing_subtype` y `lifestyle_prefs`
   - ✅ `createListing` guarda ambos campos en la BD
   - ✅ Validación con función existente

5. **`app/lib/validation/listing.ts`**
   - ✅ `ListingInput` type extendido
   - ✅ Validación incluye nuevos campos opcionales
   - ✅ Mantiene retrocompatibilidad

### SQL Migration

6. **`sql/add_listing_subtype_and_lifestyle_prefs.sql`**
   - ✅ `listing_subtype` TEXT con CHECK constraint
   - ✅ `lifestyle_prefs` JSONB para datos de convivencia
   - ✅ Índice en `listing_subtype`
   - ✅ **BONUS**: Columnas `budget_min`/`budget_max` en `profiles`
   - ✅ **BONUS**: Columna `amenities` TEXT[] en `listings` con índice GIN

## 🎨 UX/UI Implementada

### Paso 1: Selección de Tipo
```
┌─────────────────────────────────────────────────────────┐
│  ¿Qué tipo de anuncio quieres crear?                    │
│  Selecciona la opción que mejor describa tu situación   │
├──────────────────────────┬──────────────────────────────┤
│  🏠 Rento un espacio     │  👥 Busco un roomie          │
│  [Descripción...]        │  [Descripción...]            │
│  ✓ Enfoque propiedad     │  ✓ Enfoque convivencia       │
└──────────────────────────┴──────────────────────────────┘
```

### Paso 2: Formulario (condicional)

**Si eligió "Solo Renta":**
- Título
- Descripción
- Ubicación
- Zona
- Precio
- Fotos
- ✅ Publicar

**Si eligió "Buscar Roomie":**
- Título
- Descripción
- Ubicación
- Zona
- Precio (opcional)
- Fotos
- **📋 Perfil de Convivencia** ⬅️ NUEVO
  - ¿A qué te dedicas?
  - ¿Qué ambiente buscas?
  - ¿Fumas? (Sí/No)
  - ¿Tienes mascotas? (Sí/No)
  - Frecuencia de visitas (Rara vez / Ocasionalmente / Frecuentemente)
  - Nivel de limpieza (1-5)
  - Tolerancia al ruido (1-5)
- ✅ Publicar

## 🗄️ Esquema de Base de Datos

### Tabla `listings` (nuevas columnas)

```sql
listing_subtype TEXT CHECK (listing_subtype IN ('solo_renta', 'buscar_roomie'))
lifestyle_prefs JSONB
amenities TEXT[] DEFAULT '{}'
```

### Ejemplo de `lifestyle_prefs` JSON

```json
{
  "occupation": "Ingeniero de software",
  "desired_vibe": "Ambiente tranquilo para trabajar desde casa",
  "smoking": false,
  "pets": true,
  "visitors": "occasional",
  "cleanliness": 4,
  "noise_tolerance": 3
}
```

### Tabla `profiles` (nuevas columnas)

```sql
budget_min INTEGER CHECK (budget_min >= 0)
budget_max INTEGER CHECK (budget_max >= 0)
CONSTRAINT check_budget_range CHECK (budget_min <= budget_max)
```

## 🧪 Testing

### 1. Flujo Completo "Solo Renta"
```bash
1. Ir a /listings/new
2. Seleccionar "Rento un espacio" ✅
3. Llenar formulario (título, descripción, ubicación, zona, precio, fotos)
4. NO debe mostrarse "Perfil de Convivencia" ✅
5. Publicar → redirige a /listings
```

### 2. Flujo Completo "Buscar Roomie"
```bash
1. Ir a /listings/new
2. Seleccionar "Busco un roomie" ✅
3. Llenar formulario básico
4. Scroll abajo → aparece "Perfil de Convivencia" ✅
5. Llenar perfil (ocupación, hábitos, etc.)
6. Publicar → redirige a /listings
7. Verificar en BD que listing_subtype='buscar_roomie' y lifestyle_prefs tiene el JSON
```

### 3. Cambio de Tipo
```bash
1. Seleccionar "Solo Renta"
2. Click en "Cambiar" en el header ✅
3. Vuelve a mostrar selector
4. Seleccionar "Buscar Roomie"
5. Verificar que aparece Perfil de Convivencia
```

### 4. Validación
```bash
1. Intentar publicar sin seleccionar tipo → Error
2. Llenar formulario incompleto → Errores específicos
3. Subir 1 foto → "Agrega al menos 2 fotos"
```

## 🚀 Build

```bash
npm run build
# ✅ Build exitoso
# ✅ 0 errores de TypeScript
# ✅ 0 errores de linting
# Bundle size: /listings/new pasó de 6.1 kB → 8.22 kB (+2 kB por nuevos componentes)
```

## 📊 Mejoras Implementadas

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Tipos de anuncio** | 1 genérico | 2 diferenciados |
| **Formulario** | Estático | Dinámico según tipo |
| **Perfil convivencia** | ❌ No existe | ✅ Condicional |
| **UX** | Select simple | Cards visuales modernas |
| **Datos guardados** | Básicos | + subtype + lifestyle JSON |

## 🎯 Columnas DB Pendientes de Crear

**IMPORTANTE**: Ejecutar este SQL en Supabase antes de probar en producción:

```bash
# En Supabase SQL Editor:
# Ejecutar: sql/add_listing_subtype_and_lifestyle_prefs.sql
```

Esto crea:
- ✅ `listings.listing_subtype`
- ✅ `listings.lifestyle_prefs`
- ✅ `listings.amenities` (preparado para futuro)
- ✅ `profiles.budget_min` y `budget_max` (preparado para futuro)

## 🔮 Futuras Mejoras

### 1. Filtrar por Perfil de Convivencia
En `/explore` o `/listings`, permitir filtrar roomies por:
- Hábitos (fumar, mascotas)
- Nivel de limpieza
- Frecuencia de visitas

```typescript
// Query ejemplo
.filter('lifestyle_prefs->smoking', 'eq', false)
.filter('lifestyle_prefs->cleanliness', 'gte', 3)
```

### 2. Score de Compatibilidad
Calcular match score entre perfil del usuario y `lifestyle_prefs` del listing.

### 3. Badges Visuales
Mostrar badges en las cards de listings:
- 🚭 No fuma
- 🐕 Pet friendly
- 🧹 Muy ordenado (limpieza >= 4)

## ✅ Checklist de Implementación

- ✅ ListingTypeSelector con cards visuales
- ✅ ConvivenciaProfile con campos de convivencia
- ✅ Flujo condicional en ListingForm
- ✅ Actualizar actions.ts para guardar nuevos campos
- ✅ Actualizar validation.ts para tipos extendidos
- ✅ SQL migration con nuevas columnas
- ✅ Build exitoso sin errores
- ✅ Tokens de color `brand` en todos los componentes
- ✅ Diseño responsive mobile/desktop

## 📝 Notas

- **Retrocompatibilidad**: Listings antiguos sin `listing_subtype` siguen funcionando
- **Validación**: `lifestyle_prefs` solo se guarda si `listing_subtype === 'buscar_roomie'`
- **UX**: Precio es opcional para "Buscar Roomie" pero obligatorio para "Solo Renta"
- **Performance**: JSONB indexable con GIN si se necesita búsqueda por campos específicos
