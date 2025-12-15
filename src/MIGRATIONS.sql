-- ============================================
-- MIGRATIONS DO BANCO DE DADOS
-- Execute no SQL Editor do Supabase
-- ============================================

-- ============================================
-- 1. ADICIONAR COLUNA EMAIL
-- ============================================
ALTER TABLE public.form_data 
ADD COLUMN IF NOT EXISTS email VARCHAR(255);

UPDATE public.form_data 
SET email = '' 
WHERE email IS NULL;

ALTER TABLE public.form_data 
ALTER COLUMN email SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_form_data_email ON public.form_data(email);

-- ============================================
-- 2. CONFIGURAR RLS PARA PERMITIR INSERT
-- ============================================
-- Remover políticas antigas
DROP POLICY IF EXISTS "Anyone can insert form_data" ON public.form_data;
DROP POLICY IF EXISTS "Anyone can insert form_data with email" ON public.form_data;
DROP POLICY IF EXISTS "Allow all inserts to form_data" ON public.form_data;
DROP POLICY IF EXISTS "Public insert form_data" ON public.form_data;

-- Criar política permissiva para INSERT
CREATE POLICY "insert_form_data_policy" 
ON public.form_data 
FOR INSERT 
WITH CHECK (true);

-- Garantir que RLS está habilitado
ALTER TABLE public.form_data ENABLE ROW LEVEL SECURITY;

-- Verificar políticas criadas
SELECT policyname, cmd 
FROM pg_policies 
WHERE tablename = 'form_data' AND cmd = 'INSERT';

