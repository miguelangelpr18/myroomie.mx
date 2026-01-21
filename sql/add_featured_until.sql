-- Agregar columna featured_until a profiles
-- Ejecutar en Supabase SQL Editor

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS featured_until timestamptz;

-- Nota: No se modifican políticas RLS


