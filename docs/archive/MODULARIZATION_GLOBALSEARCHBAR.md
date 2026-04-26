# MODULARIZACIÓN DE GlobalSearchBar

## Estructura creada

```
app/components/search/
├── GlobalSearchBar.tsx      # Contenedor limpio (coordinador)
├── SearchInput.tsx          # Input principal de búsqueda
├── LocationPicker.tsx       # Lógica de Mapbox y autocompletado
├── FilterPopovers.tsx       # Filtros de precio/tipo/presupuesto
└── validation.ts            # Schemas de Zod para validación
```

## Archivos creados

### 1. **SearchInput.tsx** (~80 líneas)
- Campo de texto principal con icono de búsqueda
- Contador de filtros activos
- Botón de limpiar ubicación
- Auto-focus opcional
- Manejo de Enter key

### 2. **LocationPicker.tsx** (~350 líneas)
- Toda la lógica de geolocalización
- Autocompletado de ciudades con Mapbox forward
- Reverse geocoding para obtener zona/colonia
- Gestión de ubicaciones recientes (localStorage)
- Upsert de locations en base de datos
- Estados de loading y errores separados
- Botón "Cerca de aquí"

### 3. **FilterPopovers.tsx** (~70 líneas)
- **ListingsFilters**: Tipo de propiedad + precio (min/max)
- **RoomiesFilters**: Presupuesto (min/max)
- Componentes controlados con callbacks
- Diseño consistente con las clases `brand`

### 4. **validation.ts** (~60 líneas)
- **listingsFiltersSchema**: Validación de filtros de listings
  - Valida que `min <= max`
  - Tipos de listing válidos
  - Orden de sort válido
- **roomiesFiltersSchema**: Validación de filtros de roomies
  - Valida que `budget_min <= budget_max`
- Schemas con `.refine()` para validaciones custom
- TypeScript types inferidos automáticamente

### 5. **GlobalSearchBar.tsx** (refactorizado, ~350 líneas)
**ANTES**: 929 líneas monolíticas
**DESPUÉS**: 350 líneas coordinando subcomponentes

**Responsabilidades**:
- Estado global de filtros
- Sincronización con URL params
- Validación con Zod antes de buscar
- Coordinación de subcomponentes
- Navegación y persistencia
- Overlay y cierre con ESC/click afuera

**Eliminado**:
- Lógica de Mapbox (→ LocationPicker)
- Lógica de geolocalización (→ LocationPicker)
- Renderizado de filtros (→ FilterPopovers)
- Validaciones inline (→ validation.ts)

## Mejoras técnicas

### ✅ Modularización
- **Separación de concerns**: Cada componente tiene una responsabilidad única
- **Reusabilidad**: LocationPicker puede usarse en otros lugares (ej: onboarding)
- **Testabilidad**: Cada módulo se puede testear independientemente

### ✅ Validación con Zod
- Validación tipada en tiempo de compilación
- Mensajes de error consistentes
- Validación de rangos de precio/presupuesto
- Previene búsquedas inválidas (min > max)

### ✅ TypeScript mejorado
- Types inferidos de schemas de Zod
- Interfaces claras para props
- Mejor autocompletado en el IDE

### ✅ Mantenibilidad
- Reducción de ~62% en líneas del componente principal
- Lógica aislada por feature
- Fácil agregar nuevos filtros

## Preparación para futuras features

### Budget columns (profiles)
El código ya está preparado para usar `budget_min` y `budget_max`:
- `RoomiesFilters` maneja estos campos
- `roomiesFiltersSchema` los valida
- `GlobalSearchBar` los incluye en la URL

**Pendiente**: Actualizar las queries en `/explore` para filtrar por estos campos cuando existan en la BD.

### Amenities array (listings)
Para filtrar por amenities (WiFi, etc.):
1. Agregar campo `amenities` a `ListingsFilters`
2. Añadir checkboxes en `FilterPopovers.tsx`
3. Actualizar `listingsFiltersSchema` con array de strings
4. Modificar query en `/listings` para usar `@>` (array contains)

Ejemplo:
```typescript
// En FilterPopovers.tsx
const AMENITIES = ['WiFi', 'Parking', 'Pet Friendly', 'Furnished']

<div className="flex flex-wrap gap-2">
  {AMENITIES.map(amenity => (
    <label key={amenity} className="inline-flex items-center gap-2">
      <input
        type="checkbox"
        checked={selectedAmenities.includes(amenity)}
        onChange={(e) => {
          if (e.target.checked) {
            onAmenitiesChange([...selectedAmenities, amenity])
          } else {
            onAmenitiesChange(selectedAmenities.filter(a => a !== amenity))
          }
        }}
      />
      <span>{amenity}</span>
    </label>
  ))}
</div>
```

## Testing

### Build
```bash
npm run build
# ✅ Exitoso sin errores ni warnings
```

### Import paths
- `app/Header.tsx` ✅ Importa correctamente desde `./components/search/GlobalSearchBar`
- No se rompieron imports en ninguna página

### Funcionalidad preservada
- ✅ Autocompletado de ciudades funciona
- ✅ Geolocalización funciona
- ✅ Filtros de precio/tipo funciona
- ✅ Persistencia en localStorage funciona
- ✅ Sincronización con URL funciona
- ✅ Diseño visual preservado (clases `brand`)

## Próximos pasos

1. ✅ **Instalar Zod**: `npm install zod` (completado)
2. ⏳ **Actualizar queries en `/explore`**: Filtrar por `budget_min`/`budget_max` cuando se agreguen las columnas a `profiles`
3. ⏳ **Actualizar queries en `/listings`**: Filtrar por `amenities` array cuando se agregue la columna
4. ⏳ **Añadir tests**: Unit tests para validación de Zod
5. ⏳ **Performance**: Considerar memoización de subcomponentes con `React.memo`

## Notas

- **No se rompió**: Imports, funcionalidad, diseño
- **Manteniendo backward compatibility**: Sigue soportando filtros legacy (`city` sin `location_id`)
- **Progressive enhancement**: Nuevo código preparado para features futuras sin breaking changes
