-- Agregar columna featured_until a listings
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.listings
ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Nota: No se modifican políticas RLS



