-- =====================================================
-- TICKET FASE 4O.2: Migrar thread_participants a usar profile_id
-- =====================================================

-- 1. Si la tabla ya existe con user_id, renombrar columna y cambiar FK
-- Si no existe, crear directamente con profile_id

-- Opción A: Si la tabla ya existe con user_id
DO $$
BEGIN
  -- Verificar si existe la columna user_id
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'thread_participants' 
    AND column_name = 'user_id'
  ) THEN
    -- Renombrar user_id a profile_id
    ALTER TABLE public.thread_participants RENAME COLUMN user_id TO profile_id;
    
    -- Eliminar FK antigua (si existe)
    ALTER TABLE public.thread_participants 
    DROP CONSTRAINT IF EXISTS thread_participants_user_id_fkey;
    
    -- Agregar nueva FK a profiles
    ALTER TABLE public.thread_participants
    ADD CONSTRAINT thread_participants_profile_id_fkey
    FOREIGN KEY (profile_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;
    
    -- Eliminar PK antigua y crear nueva
    ALTER TABLE public.thread_participants DROP CONSTRAINT IF EXISTS thread_participants_pkey;
    ALTER TABLE public.thread_participants
    ADD CONSTRAINT thread_participants_pkey PRIMARY KEY (thread_id, profile_id);
    
    -- Renombrar índices si existen
    DROP INDEX IF EXISTS thread_participants_user_idx;
    CREATE INDEX IF NOT EXISTS thread_participants_profile_idx ON public.thread_participants(profile_id);
  END IF;
END $$;

-- Opción B: Si la tabla no existe, crear con profile_id directamente
CREATE TABLE IF NOT EXISTS public.thread_participants (
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, profile_id)
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS thread_participants_profile_idx ON public.thread_participants(profile_id);
CREATE INDEX IF NOT EXISTS thread_participants_thread_idx ON public.thread_participants(thread_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;

-- 4. Eliminar políticas antiguas si existen
DROP POLICY IF EXISTS "Users can view their own thread participants" ON public.thread_participants;
DROP POLICY IF EXISTS "Users can insert their own thread participants" ON public.thread_participants;
DROP POLICY IF EXISTS "Users can update their own thread participants" ON public.thread_participants;
DROP POLICY IF EXISTS "Users can delete their own thread participants" ON public.thread_participants;

-- 5. Crear nuevas políticas RLS basadas en profiles

-- SELECT: Solo puedes leer tus propias filas (donde profile_id pertenece a tu auth.uid())
CREATE POLICY "Users can view their own thread participants"
ON public.thread_participants
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = thread_participants.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- INSERT: Solo puedes insertar filas donde profile_id pertenece a tu auth.uid()
CREATE POLICY "Users can insert their own thread participants"
ON public.thread_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = thread_participants.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- UPDATE: Solo puedes actualizar tus propias filas
CREATE POLICY "Users can update their own thread participants"
ON public.thread_participants
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = thread_participants.profile_id
    AND profiles.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = thread_participants.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- DELETE: Solo puedes eliminar tus propias filas
CREATE POLICY "Users can delete their own thread participants"
ON public.thread_participants
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.user_id = thread_participants.profile_id
    AND profiles.user_id = auth.uid()
  )
);

-- =====================================================
-- Nota: Después de ejecutar este SQL, verifica que:
-- 1. La columna se llama profile_id (no user_id)
-- 2. FK apunta a profiles(user_id)
-- 3. RLS está habilitado
-- 4. Las políticas nuevas aparecen en Authentication > Policies
-- 5. Los índices están creados
-- =====================================================




