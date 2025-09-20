-- Limpeza ultra agressiva e migração final
-- Execute no Supabase SQL Editor

-- 1. Desabilitar RLS temporariamente
ALTER TABLE public.ocar_fipe_prices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_models DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ocar_fipe_brands DISABLE ROW LEVEL SECURITY;

-- 2. Limpeza ultra agressiva - usar CASCADE para forçar limpeza
DELETE FROM public.ocar_fipe_prices CASCADE;
DELETE FROM public.ocar_fipe_models CASCADE;
DELETE FROM public.ocar_fipe_brands CASCADE;

-- 3. Verificar se as tabelas estão realmente vazias
SELECT 'ocar_fipe_brands' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 'ocar_fipe_models' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 'ocar_fipe_prices' as tabela, COUNT(*) as total FROM ocar_fipe_prices;

-- 4. Verificar dados na ocar_transbordo
SELECT 'ocar_transbordo' as tabela, COUNT(*) as total FROM ocar_transbordo WHERE processado = false;

-- 5. Inserir marcas únicas (apenas nome, sem códigos FIPE)
INSERT INTO ocar_fipe_brands (name, code, active)
SELECT DISTINCT
  marca as name,
  LEFT(LOWER(REPLACE(marca, ' ', '-')), 10) as code,
  true as active
FROM ocar_transbordo
WHERE processado = false
ORDER BY marca;

-- 6. Inserir modelos únicos (apenas nome base, sem versão)
INSERT INTO ocar_fipe_models (brand_code, name, code, active)
SELECT DISTINCT
  b.code as brand_code,
  -- Extrair apenas o primeiro nome do modelo (ex: "Civic" de "Civic Sedan 1.8")
  CASE
    WHEN t.modelo ~ '^([A-Za-z]+)' THEN
      (REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1]
    ELSE t.modelo
  END as name,
  CONCAT(b.code, '-',
    CASE
      WHEN t.modelo ~ '^([A-Za-z]+)' THEN
        LOWER((REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1])
      ELSE LOWER(t.modelo)
    END
  ) as code,
  true as active
FROM ocar_transbordo t
JOIN ocar_fipe_brands b ON t.marca = b.name
WHERE t.processado = false;

-- 7. Inserir preços (usando modelo completo como versão)
INSERT INTO ocar_fipe_prices (model_id, version, year, fipe_code, reference_month, price)
SELECT
  m.id as model_id,
  t.modelo as version, -- Modelo completo como versão
  t.ano as year,
  t.codigo_fipe as fipe_code,
  t.referencia_mes as reference_month,
  t.preco as price
FROM ocar_transbordo t
JOIN ocar_fipe_models m ON
  CASE
    WHEN t.modelo ~ '^([A-Za-z]+)' THEN
      (REGEXP_MATCH(t.modelo, '^([A-Za-z]+)'))[1] = m.name
    ELSE t.modelo = m.name
  END
JOIN ocar_fipe_brands b ON m.brand_code = b.code AND t.marca = b.name
WHERE t.processado = false
ORDER BY t.marca, t.modelo, t.ano;

-- 8. Marcar registros como processados
UPDATE ocar_transbordo 
SET processado = true, updated_at = NOW()
WHERE processado = false;

-- 9. Verificar contagem final
SELECT
  'Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT
  'Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT
  'Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices;

-- 10. Verificar amostra de dados
SELECT
  'Amostra de Marcas' as tipo,
  name as valor
FROM ocar_fipe_brands
LIMIT 5;

SELECT
  'Amostra de Modelos' as tipo,
  name as valor
FROM ocar_fipe_models
LIMIT 5;

SELECT
  'Amostra de Preços' as tipo,
  CONCAT(version, ' - ', year, ' - R$ ', price) as valor
FROM ocar_fipe_prices
LIMIT 5;
