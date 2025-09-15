-- Adicionar dados de teste simples à tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- Verificar estrutura atual
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ocar_vehicles' 
ORDER BY ordinal_position;

-- Inserir dados de teste usando apenas as colunas que existem
INSERT INTO ocar_vehicles (
  dono_id, marca, modelo, ano, cor, quilometragem, 
  combustivel, cambio, preco, plano, status, cidade, 
  views, likes, shares
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Toyota',
  'Corolla',
  2022,
  'Prata',
  25000,
  ARRAY['Flex'],
  'Automático',
  95000.00,
  'destaque',
  'ativo',
  'São Paulo',
  1250,
  23,
  5
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Honda',
  'Civic',
  2021,
  'Branco',
  35000,
  ARRAY['Flex'],
  'Manual',
  85000.00,
  'gratuito',
  'pausado',
  'São Paulo',
  680,
  12,
  2
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Volkswagen',
  'Jetta',
  2020,
  'Preto',
  45000,
  ARRAY['Flex'],
  'Automático',
  75000.00,
  'gratuito',
  'expirado',
  'São Paulo',
  420,
  5,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Verificar se os dados foram inseridos
SELECT 
    'Total de veículos' as info,
    COUNT(*) as quantidade
FROM ocar_vehicles
UNION ALL
SELECT 
    'Veículos do usuário teste' as info,
    COUNT(*) as quantidade
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001';
