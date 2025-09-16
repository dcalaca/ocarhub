-- Teste final de inserção dos planos de anúncios
-- Execute este SQL no Supabase SQL Editor

-- Verificar se a tabela tem todas as colunas necessárias
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_planos' 
ORDER BY ordinal_position;

-- Inserir os 3 planos de anúncios
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
) VALUES 
-- Plano Gratuito
(
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
),
-- Plano Destaque
(
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
),
-- Plano Premium
(
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

-- Verificar se os planos foram inseridos corretamente
SELECT 
  id,
  nome, 
  tipo, 
  preco, 
  duracao_dias,
  destaque, 
  ativo,
  beneficios
FROM ocar_planos 
WHERE tipo = 'anuncio'
ORDER BY preco;
