-- =====================================================
-- TICKET #9: Tablas threads + messages + RLS (MVP)
-- =====================================================

-- 1. Crear tabla threads
CREATE TABLE IF NOT EXISTS public.threads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES public.listings(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Crear tabla messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id UUID NOT NULL REFERENCES public.threads(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Crear índices
CREATE INDEX IF NOT EXISTS threads_users_idx ON public.threads(user1_id, user2_id);
CREATE INDEX IF NOT EXISTS messages_thread_created_idx ON public.messages(thread_id, created_at);

-- 4. Índice único para prevenir duplicados de threads
-- (mismo par de usuarios + mismo listing = solo un thread)
CREATE UNIQUE INDEX IF NOT EXISTS threads_unique_idx 
ON public.threads(
  LEAST(user1_id, user2_id),
  GREATEST(user1_id, user2_id),
  COALESCE(listing_id, '00000000-0000-0000-0000-000000000000'::uuid)
);

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE public.threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS para threads

-- SELECT: Solo participantes pueden ver threads
CREATE POLICY "Threads are viewable by participants"
ON public.threads
FOR SELECT
USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- INSERT: Solo participantes pueden crear threads
CREATE POLICY "Users can create threads where they are participants"
ON public.threads
FOR INSERT
WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);

-- UPDATE/DELETE: Denegado (MVP: no se pueden editar/eliminar threads)
-- Si quieres permitir, usar: USING (auth.uid() = user1_id OR auth.uid() = user2_id)

-- 7. Políticas RLS para messages

-- SELECT: Solo si auth.uid() es participant del thread
CREATE POLICY "Messages are viewable by thread participants"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.threads
    WHERE threads.id = messages.thread_id
    AND (threads.user1_id = auth.uid() OR threads.user2_id = auth.uid())
  )
);

-- INSERT: sender debe ser auth.uid() y participant del thread
CREATE POLICY "Users can send messages in their threads"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.threads
    WHERE threads.id = messages.thread_id
    AND (threads.user1_id = auth.uid() OR threads.user2_id = auth.uid())
  )
);

-- UPDATE/DELETE: Denegado (MVP: no se pueden editar/eliminar mensajes)

-- =====================================================
-- Nota: Después de ejecutar este SQL, verifica que:
-- 1. Las tablas threads y messages existen
-- 2. RLS está habilitado en ambas tablas
-- 3. Las políticas aparecen en Authentication > Policies
-- 4. Los índices están creados
-- =====================================================


