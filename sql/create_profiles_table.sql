-- =====================================================
-- TICKET #4A: Tabla profiles + RLS básico (MVP)
-- =====================================================

-- 1. Crear tabla profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  city TEXT NOT NULL,
  zone TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Habilitar Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS

-- Política SELECT: Público (todos pueden leer perfiles para explorar)
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Política INSERT: Solo el dueño puede insertar su propio perfil
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Política UPDATE: Solo el dueño puede actualizar su perfil
CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Política DELETE: Solo el dueño puede eliminar su perfil
CREATE POLICY "Users can delete their own profile"
ON public.profiles
FOR DELETE
USING (auth.uid() = user_id);

-- 4. Crear trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- 5. Crear índices para mejorar búsquedas por ciudad y zona
CREATE INDEX IF NOT EXISTS profiles_city_idx ON public.profiles(city);
CREATE INDEX IF NOT EXISTS profiles_zone_idx ON public.profiles(zone);
CREATE INDEX IF NOT EXISTS profiles_city_zone_idx ON public.profiles(city, zone);

-- =====================================================
-- Nota: Después de ejecutar este SQL, verifica que:
-- 1. La tabla profiles existe en el esquema public
-- 2. RLS está habilitado
-- 3. Las políticas aparecen en Authentication > Policies
-- 4. Los índices están creados
-- =====================================================

