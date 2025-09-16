-- Inserir planos de anúncios na tabela ocar_planos do Supabase
-- Execute este SQL no Supabase SQL Editor
-- 
-- IMPORTANTE: Execute primeiro o arquivo create-planos-table.sql
-- para criar a tabela antes de inserir os dados

-- Plano Gratuito
INSERT INTO ocar_planos (
  nome, 
  tipo, 
  preco, 
  descricao, 
  beneficios, 
  limite_anuncios, 
  limite_consultas, 
  duracao_dias,
  destaque, 
  ativo
) VALUES (
  'Gratuito',
  'anuncio',
  0.00,
  'Anúncio básico gratuito com limitações',
  '[
    "Anúncio básico por 30 dias",
    "Até 5 fotos",
    "Aparece na busca normal",
    "Sem destaque especial",
    "Limite: 3 anúncios por CPF"
  ]'::jsonb,
  3,
  0,
  30,
  false,
  true
);

-- Plano Destaque
INSERT INTO ocar_planos (
  nome, 
  tipo, 
  preco, 
  descricao, 
  beneficios, 
  limite_anuncios, 
  limite_consultas, 
  duracao_dias,
  destaque, 
  ativo
) VALUES (
  'Destaque',
  'anuncio',
  80.00,
  'Anúncio destacado com maior visibilidade',
  '[
    "Anúncio destacado por 60 dias",
    "Até 10 fotos",
    "Aparece no topo da busca",
    "Selo de destaque",
    "3x mais visualizações",
    "Renovação: +45 dias por R$ 30 (sem destaque)"
  ]'::jsonb,
  0,
  0,
  60,
  true,
  true
);

-- Plano Premium
INSERT INTO ocar_planos (
  nome, 
  tipo, 
  preco, 
  descricao, 
  beneficios, 
  limite_anuncios, 
  limite_consultas, 
  duracao_dias,
  destaque, 
  ativo
) VALUES (
  'Premium',
  'anuncio',
  150.00,
  'Anúncio premium vitalício com máximo destaque',
  '[
    "Anúncio vitalício até vender",
    "Destaque por 120 dias",
    "Fotos ilimitadas",
    "Prioridade máxima na busca",
    "Selo premium dourado",
    "Histórico veicular gratuito",
    "5x mais visualizações"
  ]'::jsonb,
  0,
  0,
  NULL, -- NULL indica vitalício
  true,
  true
);
