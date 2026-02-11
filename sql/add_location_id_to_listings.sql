-- =====================================================
-- FASE C1.2a: Agregar location_id a listings (nullable, FK, índice)
-- =====================================================
-- Requiere: public.locations existente (create_locations_table.sql).
-- No elimina city/zone; compatible con RLS existente.

-- 1) Columna nullable para legacy (listings sin ubicación normalizada)
ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS location_id uuid NULL;

-- 2) FK a public.locations (idempotente: solo si no existe la constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'listings_location_id_fkey'
  ) THEN
    ALTER TABLE public.listings
    ADD CONSTRAINT listings_location_id_fkey
    FOREIGN KEY (location_id)
    REFERENCES public.locations (id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Índice para filtros por ubicación
CREATE INDEX IF NOT EXISTS listings_location_id_idx
ON public.listings (location_id);

-- =====================================================
-- Nota: Después de ejecutar, verifica que:
-- 1. public.listings.location_id existe, tipo uuid, NULL permitido
-- 2. La FK listings_location_id_fkey apunta a public.locations(id)
-- 3. El índice listings_location_id_idx existe
-- =====================================================
