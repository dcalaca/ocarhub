-- Debug e correção definitiva de modelos
-- Execute no Supabase SQL Editor

-- ========================================
-- 1. DEBUG - VERIFICAR O QUE ESTÁ ACONTECENDO
-- ========================================

-- 1.1. Verificar duplicatas na ocar_transbordo
SELECT 'DUPLICATAS NA OCAR_TRANSBORDO' as info, marca, modelo, COUNT(*) as total
FROM ocar_transbordo 
WHERE marca = 'Honda' AND modelo LIKE '%City%'
GROUP BY marca, modelo
HAVING COUNT(*) > 1
ORDER BY total DESC;

-- 1.2. Verificar quantos registros únicos temos
SELECT 'REGISTROS ÚNICOS' as info, COUNT(DISTINCT CONCAT(marca, '|', modelo)) as total
FROM ocar_transbordo
WHERE COALESCE(marca,'') <> '' AND COALESCE(modelo,'') <> '';

-- ========================================
-- 2. DROPAR E RECRIAR TABELA
-- ========================================

-- 2.1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;

-- 2.2. Dropar tabela completamente
DROP TABLE IF EXISTS public.ocar_fipe_models CASCADE;

-- 2.3. Recriar tabela de modelos
CREATE TABLE ocar_fipe_models (
  id BIGSERIAL PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL REFERENCES ocar_fipe_brands(code) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code VARCHAR(50) NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_fipe_model UNIQUE (brand_code, code)
);

-- 1.4. Criar índices
CREATE INDEX idx_models_brand ON ocar_fipe_models(brand_code);

-- ========================================
-- 3. MIGRAÇÃO COM DISTINCT ABSOLUTO
-- ========================================

-- 3.1. Inserir modelos únicos (com DISTINCT absoluto)
INSERT INTO ocar_fipe_models(brand_code, name, code)
SELECT DISTINCT
  b.code as brand_code,
  t.modelo as name,
  CONCAT(b.code, '-', LEFT(LOWER(REPLACE(t.modelo, ' ', '-')), 20)) as code
FROM (
  SELECT DISTINCT marca, modelo
  FROM ocar_transbordo
  WHERE COALESCE(marca,'') <> '' AND COALESCE(modelo,'') <> ''
) t
JOIN ocar_fipe_brands b ON b.name = t.marca;

-- 3.2. Verificar modelos inseridos
SELECT 'MODELOS INSERIDOS' as status, COUNT(*) as total FROM ocar_fipe_models;
SELECT 'Amostra Modelos' as tipo, name, code, brand_code FROM ocar_fipe_models ORDER BY name LIMIT 20;

-- ========================================
-- 4. REABILITAR RLS
-- ========================================

-- 4.1. Reabilitar RLS
ALTER TABLE public.ocar_fipe_models ENABLE ROW LEVEL SECURITY;

-- ========================================
-- 5. VERIFICAÇÃO FINAL
-- ========================================

-- 5.1. Contagem de modelos
SELECT 'Total de Modelos' as info, COUNT(*) as total FROM ocar_fipe_models;

-- 5.2. Lista completa de modelos
SELECT 'Lista Completa' as info, name, code, brand_code FROM ocar_fipe_models ORDER BY name;
