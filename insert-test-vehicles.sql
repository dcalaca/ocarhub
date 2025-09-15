-- Inserir dados de teste na tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- Verificar se já existem dados de teste
SELECT COUNT(*) as existing_test_data 
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001';

-- Inserir dados de teste
INSERT INTO ocar_vehicles (
  dono_id, marca, modelo, versao, ano, cor, quilometragem, motor, 
  combustivel, cambio, opcionais, preco, fipe, placa_parcial, 
  numero_proprietarios, observacoes, fotos, plano, verificado, 
  status, cidade, estado, views, likes, shares
) VALUES 
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Toyota',
  'Corolla',
  'XEI',
  2022,
  'Prata',
  25000,
  '2.0 Flex',
  ARRAY['Flex'],
  'Automático',
  ARRAY['Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Airbag'],
  95000.00,
  98000.00,
  'ABC-1D34',
  1,
  'Corolla XEI 2022 em excelente estado, único dono, todas as revisões em dia.',
  ARRAY['/placeholder.svg?height=200&width=300'],
  'destaque',
  true,
  'ativo',
  'São Paulo',
  'SP',
  1250,
  23,
  5
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Honda',
  'Civic',
  'LX',
  2021,
  'Branco',
  35000,
  '1.5 Turbo',
  ARRAY['Flex'],
  'Manual',
  ARRAY['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos'],
  85000.00,
  87000.00,
  'DEF-2E45',
  2,
  'Civic LX 2021, segundo dono, bem conservado.',
  ARRAY['/placeholder.svg?height=200&width=300'],
  'gratuito',
  false,
  'pausado',
  'São Paulo',
  'SP',
  680,
  12,
  2
),
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Volkswagen',
  'Jetta',
  'Comfortline',
  2020,
  'Preto',
  45000,
  '1.4 TSI',
  ARRAY['Flex'],
  'Automático',
  ARRAY['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos', 'Teto Solar'],
  75000.00,
  78000.00,
  'GHI-3F56',
  1,
  'Jetta Comfortline 2020, muito bem cuidado.',
  ARRAY['/placeholder.svg?height=200&width=300'],
  'gratuito',
  false,
  'expirado',
  'São Paulo',
  'SP',
  420,
  5,
  1
)
ON CONFLICT (id) DO NOTHING;

-- Verificar resultado final
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

-- Mostrar os veículos inseridos
SELECT id, marca, modelo, ano, preco, plano, status, cidade, estado
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC;
