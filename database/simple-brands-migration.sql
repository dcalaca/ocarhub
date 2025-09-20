-- Migração simples de marcas - agrupa e sobe para brands
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. MIGRAÇÃO SIMPLES DE MARCAS
-- ========================================

-- 1.1. Limpar tabela de marcas
DELETE FROM ocar_fipe_brands;

-- 1.2. Inserir marcas únicas (agrupadas)
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

-- 1.3. Verificar marcas inseridas
SELECT 'MARCAS INSERIDAS' as status, COUNT(*) as total FROM ocar_fipe_brands;
SELECT 'Amostra Marcas' as tipo, name, code FROM ocar_fipe_brands ORDER BY name LIMIT 20;

-- ========================================
-- 2. VERIFICAÇÃO FINAL
-- ========================================

-- 2.1. Contagem de marcas
SELECT 'Total de Marcas' as info, COUNT(*) as total FROM ocar_fipe_brands;

-- 2.2. Lista completa de marcas
SELECT 'Lista Completa' as info, name, code FROM ocar_fipe_brands ORDER BY name;
