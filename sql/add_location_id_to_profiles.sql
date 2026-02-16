-- =====================================================
-- FASE E1.1: Agregar location_id a profiles (nullable, FK, índice)
-- =====================================================
-- Requiere: public.locations existente (create_locations_table.sql).
-- No elimina city/zone; no modifica RLS ni policies.

-- 1) Columna nullable para compatibilidad (profiles sin ubicación normalizada)
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS location_id uuid NULL;

-- 2) FK a public.locations (idempotente: solo si no existe la constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'profiles_location_id_fkey'
  ) THEN
    ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_location_id_fkey
    FOREIGN KEY (location_id)
    REFERENCES public.locations (id) ON DELETE SET NULL;
  END IF;
END $$;

-- 3) Índice para filtros por ubicación
CREATE INDEX IF NOT EXISTS profiles_location_id_idx
ON public.profiles (location_id);

-- =====================================================
-- Nota: Después de ejecutar, verifica que:
-- 1. public.profiles.location_id existe, tipo uuid, NULL permitido
-- 2. La FK profiles_location_id_fkey apunta a public.locations(id)
-- 3. El índice profiles_location_id_idx existe
-- =====================================================
