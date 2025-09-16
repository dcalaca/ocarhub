-- Script para limpar planos duplicados
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar planos duplicados
SELECT 
  nome, 
  tipo, 
  preco, 
  COUNT(*) as quantidade
FROM ocar_planos 
WHERE tipo = 'anuncio'
GROUP BY nome, tipo, preco
HAVING COUNT(*) > 1
ORDER BY nome, preco;

-- 2. Manter apenas o primeiro plano de cada tipo e deletar os duplicados
WITH ranked_plans AS (
  SELECT 
    id,
    nome,
    tipo,
    preco,
    ROW_NUMBER() OVER (
      PARTITION BY nome, tipo, preco 
      ORDER BY created_at ASC
    ) as rn
  FROM ocar_planos 
  WHERE tipo = 'anuncio'
)
DELETE FROM ocar_planos 
WHERE id IN (
  SELECT id 
  FROM ranked_plans 
  WHERE rn > 1
);

-- 3. Verificar se ainda há duplicados
SELECT 
  nome, 
  tipo, 
  preco, 
  COUNT(*) as quantidade
FROM ocar_planos 
WHERE tipo = 'anuncio'
GROUP BY nome, tipo, preco
HAVING COUNT(*) > 1
ORDER BY nome, preco;

-- 4. Mostrar planos finais
SELECT 
  id,
  nome, 
  tipo, 
  preco, 
  duracao_dias,
  destaque, 
  ativo,
  created_at
FROM ocar_planos 
WHERE tipo = 'anuncio'
ORDER BY preco;
