-- Teste direto de inserção na tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- Primeiro, verificar se o RLS está desabilitado
SELECT 
    schemaname, 
    tablename, 
    rowsecurity as rls_habilitado,
    CASE 
        WHEN rowsecurity THEN 'SIM' 
        ELSE 'NÃO' 
    END as status_rls
FROM pg_tables 
WHERE tablename = 'ocar_vehicles';

-- Tentar inserir um veículo de teste
INSERT INTO ocar_vehicles (
  dono_id, marca, modelo, versao, ano, cor, quilometragem, motor, 
  combustivel, cambio, opcionais, preco, fipe, placa_parcial, 
  numero_proprietarios, observacoes, fotos, plano, verificado, 
  status, cidade, estado, views, likes, shares
) VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  'Teste',
  'Modelo Teste',
  'Versão Teste',
  2024,
  'Azul',
  1000,
  '1.0 Teste',
  ARRAY['Flex'],
  'Manual',
  ARRAY['Ar Condicionado'],
  50000.00,
  48000.00,
  'TEST-123',
  1,
  'Veículo de teste para verificar RLS',
  ARRAY['/placeholder.svg'],
  'gratuito',
  false,
  'ativo',
  'São Paulo',
  'SP',
  0,
  0,
  0
);

-- Verificar se foi inserido
SELECT id, marca, modelo, ano, preco, status, cidade, estado
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001'
ORDER BY created_at DESC
LIMIT 5;
