-- =====================================================
-- TICKET FASE 4O: Tabla thread_participants para tracking de lectura
-- =====================================================

-- 1. Crear tabla thread_participants
CREATE TABLE IF NOT EXISTS public.thread_participants (
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (thread_id, user_id)
);

-- 2. Crear índices
CREATE INDEX IF NOT EXISTS thread_participants_user_idx ON public.thread_participants(user_id);
CREATE INDEX IF NOT EXISTS thread_participants_thread_idx ON public.thread_participants(thread_id);

-- 3. Habilitar Row Level Security (RLS)
ALTER TABLE public.thread_participants ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para thread_participants

-- SELECT: Solo puedes leer tus propias filas
CREATE POLICY "Users can view their own thread participants"
ON public.thread_participants
FOR SELECT
USING (auth.uid() = user_id);

-- INSERT: Solo puedes insertar filas donde user_id = auth.uid()
CREATE POLICY "Users can insert their own thread participants"
ON public.thread_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE: Solo puedes actualizar tus propias filas
CREATE POLICY "Users can update their own thread participants"
ON public.thread_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- DELETE: Solo puedes eliminar tus propias filas
CREATE POLICY "Users can delete their own thread participants"
ON public.thread_participants
FOR DELETE
USING (auth.uid() = user_id);

-- =====================================================
-- Nota: Después de ejecutar este SQL, verifica que:
-- 1. La tabla thread_participants existe
-- 2. RLS está habilitado
-- 3. Las políticas aparecen en Authentication > Policies
-- 4. Los índices están creados
-- =====================================================



