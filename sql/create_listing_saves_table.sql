-- =====================================================
-- TICKET F: Tabla listing_saves (wishlist) + RLS
-- =====================================================

-- 1. Crear tabla listing_saves
CREATE TABLE IF NOT EXISTS public.listing_saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.listing_saves ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS

-- Política SELECT: Solo el dueño puede ver sus saves
CREATE POLICY "Users can view their own saves"
ON public.listing_saves
FOR SELECT
USING (auth.uid() = user_id);

-- Política INSERT: Solo el dueño puede crear sus saves
CREATE POLICY "Users can insert their own saves"
ON public.listing_saves
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política DELETE: Solo el dueño puede eliminar sus saves
CREATE POLICY "Users can delete their own saves"
ON public.listing_saves
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Crear índices para mejorar búsquedas
CREATE INDEX IF NOT EXISTS listing_saves_user_id_idx ON public.listing_saves(user_id);
CREATE INDEX IF NOT EXISTS listing_saves_listing_id_idx ON public.listing_saves(listing_id);

-- =====================================================
-- Nota: No se permite UPDATE (no hace falta)
-- =====================================================

