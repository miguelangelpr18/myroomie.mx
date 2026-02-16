-- Migración: Agregar listing_subtype y lifestyle_prefs a listings
-- Fecha: 2026-02-16
-- Fase: Flujo de creación de listings con perfil de convivencia

-- 1. Agregar columna listing_subtype (solo_renta | buscar_roomie)
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS listing_subtype TEXT
CHECK (listing_subtype IN ('solo_renta', 'buscar_roomie'));

COMMENT ON COLUMN public.listings.listing_subtype IS 
'Subtipo del anuncio: solo_renta (enfoque en propiedad) o buscar_roomie (enfoque en convivencia)';

-- 2. Agregar columna lifestyle_prefs como JSONB para datos de convivencia
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS lifestyle_prefs JSONB;

COMMENT ON COLUMN public.listings.lifestyle_prefs IS 
'Preferencias de estilo de vida cuando listing_subtype=buscar_roomie (occupation, desired_vibe, smoking, pets, visitors, cleanliness, noise_tolerance)';

-- 3. Índice para búsquedas por listing_subtype
CREATE INDEX IF NOT EXISTS idx_listings_subtype ON public.listings(listing_subtype)
WHERE listing_subtype IS NOT NULL;

-- 4. (Futuro) Agregar columnas budget_min y budget_max a profiles
-- Estas columnas son para búsqueda de roomies (presupuesto del usuario)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS budget_min INTEGER CHECK (budget_min >= 0),
ADD COLUMN IF NOT EXISTS budget_max INTEGER CHECK (budget_max >= 0),
ADD CONSTRAINT check_budget_range CHECK (
  budget_min IS NULL OR 
  budget_max IS NULL OR 
  budget_min <= budget_max
);

COMMENT ON COLUMN public.profiles.budget_min IS 'Presupuesto mínimo mensual que el usuario está dispuesto a pagar (MXN)';
COMMENT ON COLUMN public.profiles.budget_max IS 'Presupuesto máximo mensual que el usuario está dispuesto a pagar (MXN)';

-- 5. (Futuro) Agregar columna amenities a listings como array de strings
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}';

COMMENT ON COLUMN public.listings.amenities IS 'Amenidades disponibles: WiFi, Parking, Pet Friendly, Furnished, etc.';

-- Índice GIN para búsquedas eficientes en amenities array
CREATE INDEX IF NOT EXISTS idx_listings_amenities ON public.listings USING GIN(amenities);
