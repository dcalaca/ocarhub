-- Migração SIMPLES - APENAS MARCAS
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. LIMPAR TABELA DE MARCAS
-- ========================================

-- 1.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 1.2. Limpar tabela de marcas
DELETE FROM public.ocar_fipe_brands;

-- ========================================
-- 2. INSERIR APENAS MARCAS ÚNICAS
-- ========================================

-- 2.1. Inserir marcas únicas (sem duplicatas)
INSERT INTO ocar_fipe_brands(name, code)
SELECT DISTINCT 
  marca as name,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as code
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> ''
ORDER BY marca;

-- ========================================
-- 3. VERIFICAR RESULTADO
-- ========================================

-- 3.1. Contar marcas inseridas
SELECT 'MARCAS INSERIDAS' as status, COUNT(*) as total FROM ocar_fipe_brands;

-- 3.2. Listar todas as marcas
SELECT 'Lista de Marcas' as info, name, code FROM ocar_fipe_brands ORDER BY name;

-- ========================================
-- 4. REABILITAR RLS
-- ========================================

-- 4.1. Reabilitar RLS
ALTER TABLE public.ocar_fipe_brands ENABLE ROW LEVEL SECURITY;
