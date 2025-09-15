-- Adicionar dados de teste à tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- Verificar se já existem dados de teste
SELECT COUNT(*) as existing_test_data 
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001';

-- Inserir dados de teste apenas se não existirem
INSERT INTO ocar_vehicles (
  dono_id, marca, modelo, versao, ano, cor, quilometragem, motor, 
  combustivel, cambio, opcionais, preco, fipe, placa_parcial, 
  numero_proprietarios, observacoes, fotos, plano, verificado, 
  status, cidade, estado, views, likes, shares
) 
SELECT * FROM (
  VALUES 
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid, -- ID do usuário teste
    'Toyota'::text,
    'Corolla'::text,
    'XEI'::text,
    2022::integer,
    'Prata'::text,
    25000::integer,
    '2.0 Flex'::text,
    ARRAY['Flex']::text[],
    'Automático'::text,
    ARRAY['Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Airbag']::text[],
    95000.00::decimal,
    98000.00::decimal,
    'ABC-1D34'::text,
    1::integer,
    'Corolla XEI 2022 em excelente estado, único dono, todas as revisões em dia.'::text,
    ARRAY['/placeholder.svg?height=200&width=300']::text[],
    'destaque'::text,
    true::boolean,
    'ativo'::text,
    'São Paulo'::text,
    'SP'::text,
    1250::integer,
    23::integer,
    5::integer
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Honda'::text,
    'Civic'::text,
    'LX'::text,
    2021::integer,
    'Branco'::text,
    35000::integer,
    '1.5 Turbo'::text,
    ARRAY['Flex']::text[],
    'Manual'::text,
    ARRAY['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos']::text[],
    85000.00::decimal,
    87000.00::decimal,
    'DEF-2E45'::text,
    2::integer,
    'Civic LX 2021, segundo dono, bem conservado.'::text,
    ARRAY['/placeholder.svg?height=200&width=300']::text[],
    'gratuito'::text,
    false::boolean,
    'pausado'::text,
    'São Paulo'::text,
    'SP'::text,
    680::integer,
    12::integer,
    2::integer
  ),
  (
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'Volkswagen'::text,
    'Jetta'::text,
    'Comfortline'::text,
    2020::integer,
    'Preto'::text,
    45000::integer,
    '1.4 TSI'::text,
    ARRAY['Flex']::text[],
    'Automático'::text,
    ARRAY['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos', 'Teto Solar']::text[],
    75000.00::decimal,
    78000.00::decimal,
    'GHI-3F56'::text,
    1::integer,
    'Jetta Comfortline 2020, muito bem cuidado.'::text,
    ARRAY['/placeholder.svg?height=200&width=300']::text[],
    'gratuito'::text,
    false::boolean,
    'expirado'::text,
    'São Paulo'::text,
    'SP'::text,
    420::integer,
    5::integer,
    1::integer
  )
) AS new_vehicles(dono_id, marca, modelo, versao, ano, cor, quilometragem, motor, combustivel, cambio, opcionais, preco, fipe, placa_parcial, numero_proprietarios, observacoes, fotos, plano, verificado, status, cidade, estado, views, likes, shares)
WHERE NOT EXISTS (
  SELECT 1 FROM ocar_vehicles 
  WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001'
);

-- Verificar se os dados foram inseridos
SELECT COUNT(*) as total_vehicles_after_insert 
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001';
