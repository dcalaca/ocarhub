-- =============================================
-- CONSULTAS FIPE - RELACIONAMENTOS DAS 3 TABELAS
-- =============================================
-- Execute no Supabase SQL Editor

-- =============================================
-- 1. CONSULTA BÁSICA - BUSCAR PREÇO FIPE
-- =============================================

-- Buscar preço FIPE por marca, modelo e ano
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.reference_month,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE LOWER(b.name) = LOWER('Honda')
  AND LOWER(m.name) = LOWER('Civic')
  AND p.year = 2020
ORDER BY p.reference_month DESC, p.price ASC;

-- =============================================
-- 2. CONSULTA COMPLETA - TODOS OS RELACIONAMENTOS
-- =============================================

-- Mostrar como os dados se relacionam
SELECT 
  b.id as brand_id,
  b.name as marca,
  m.id as model_id,
  m.name as modelo,
  p.id as price_id,
  p.year as ano,
  p.fipe_code,
  p.reference_month,
  p.price as preco_fipe,
  p.created_at as data_criacao
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
ORDER BY b.name, m.name, p.year DESC
LIMIT 10;

-- =============================================
-- 3. CONSULTA POR CÓDIGO FIPE
-- =============================================

-- Buscar por código FIPE específico
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.reference_month,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE p.fipe_code = '009011-5'  -- Substitua pelo código desejado
ORDER BY p.reference_month DESC;

-- =============================================
-- 4. CONSULTA POR MARCA
-- =============================================

-- Listar todos os modelos e preços de uma marca
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE LOWER(b.name) = LOWER('Honda')
ORDER BY m.name, p.year DESC
LIMIT 20;

-- =============================================
-- 5. CONSULTA POR ANO
-- =============================================

-- Buscar todos os veículos de um ano específico
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE p.year = 2020
ORDER BY p.price DESC
LIMIT 20;

-- =============================================
-- 6. CONSULTA POR FAIXA DE PREÇO
-- =============================================

-- Buscar veículos em uma faixa de preço
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE p.price BETWEEN 30000 AND 50000
ORDER BY p.price ASC
LIMIT 20;

-- =============================================
-- 7. CONSULTA ESTATÍSTICAS
-- =============================================

-- Estatísticas gerais
SELECT 
  'Total de Marcas' as tipo,
  COUNT(DISTINCT b.id)::TEXT as quantidade
FROM ocar_fipe_brands b
UNION ALL
SELECT 
  'Total de Modelos' as tipo,
  COUNT(DISTINCT m.id)::TEXT as quantidade
FROM ocar_fipe_models m
UNION ALL
SELECT 
  'Total de Preços' as tipo,
  COUNT(*)::TEXT as quantidade
FROM ocar_fipe_prices p
UNION ALL
SELECT 
  'Faixa de Anos' as tipo,
  CONCAT(MIN(p.year), ' - ', MAX(p.year)) as quantidade
FROM ocar_fipe_prices p;

-- =============================================
-- 8. CONSULTA POR MÊS DE REFERÊNCIA
-- =============================================

-- Buscar preços de um mês específico
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.reference_month,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE p.reference_month = '2025-09'
ORDER BY p.price DESC
LIMIT 20;

-- =============================================
-- 9. CONSULTA DE PREÇOS MAIS RECENTES
-- =============================================

-- Buscar os preços mais recentes de cada modelo
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.reference_month,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE p.reference_month = (
  SELECT MAX(reference_month) 
  FROM ocar_fipe_prices
)
ORDER BY p.price DESC
LIMIT 20;

-- =============================================
-- 10. CONSULTA DE BUSCA LIVRE
-- =============================================

-- Busca livre por qualquer termo
SELECT 
  b.name as marca,
  m.name as modelo,
  p.year as ano,
  p.fipe_code,
  p.price as preco_fipe
FROM ocar_fipe_prices p
JOIN ocar_fipe_models m ON m.id = p.model_id
JOIN ocar_fipe_brands b ON b.id = m.brand_id
WHERE 
  LOWER(b.name) LIKE LOWER('%honda%') OR
  LOWER(m.name) LIKE LOWER('%civic%') OR
  p.fipe_code LIKE '%009011%'
ORDER BY p.price DESC
LIMIT 20;
