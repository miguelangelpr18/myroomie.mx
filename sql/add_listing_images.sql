-- =====================================================
-- TICKET E2.1: Agregar columna image_urls a listings
-- =====================================================

-- Agregar columna image_urls (array de texto) a la tabla listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS image_urls TEXT[] NOT NULL DEFAULT '{}';

-- =====================================================
-- Nota: Después de ejecutar este SQL, verifica que:
-- 1. La columna image_urls existe en la tabla listings
-- 2. El tipo es TEXT[] (array de texto)
-- 3. El default es '{}' (array vacío)
-- =====================================================

