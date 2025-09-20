-- Limpeza ultra agressiva de marcas
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. LIMPEZA ULTRA AGRESSIVA
-- ========================================

-- 1.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 1.2. Limpeza ultra agressiva com CASCADE
DELETE FROM public.ocar_fipe_brands CASCADE;

-- 1.3. Verificar se a tabela está vazia
SELECT 'APÓS LIMPEZA - ocar_fipe_brands' as status, COUNT(*) as total FROM ocar_fipe_brands;

-- ========================================
-- 2. MIGRAÇÃO SIMPLES DE MARCAS
-- ========================================

-- 2.1. Inserir marcas únicas (agrupadas)
INSERT INTO ocar_fipe_brands(name, code)
SELECT 
  marca as name,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as code
FROM (
  SELECT DISTINCT marca
  FROM ocar_transbordo
  WHERE COALESCE(marca,'') <> ''
) t
ORDER BY marca;

-- 2.2. Verificar marcas inseridas
SELECT 'MARCAS INSERIDAS' as status, COUNT(*) as total FROM ocar_fipe_brands;
SELECT 'Amostra Marcas' as tipo, name, code FROM ocar_fipe_brands ORDER BY name LIMIT 20;

-- ========================================
-- 3. REABILITAR RLS
-- ========================================

-- 3.1. Reabilitar RLS
ALTER TABLE public.ocar_fipe_brands ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 4. VERIFICAÇÃO FINAL
-- ========================================

-- 4.1. Contagem de marcas
SELECT 'Total de Marcas' as info, COUNT(*) as total FROM ocar_fipe_brands;

-- 4.2. Lista completa de marcas
SELECT 'Lista Completa' as info, name, code FROM ocar_fipe_brands ORDER BY name;
