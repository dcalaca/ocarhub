-- Verificar se a tabela ocar_vehicles existe e sua estrutura
-- Execute este SQL no Supabase SQL Editor

-- Verificar se a tabela existe
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'ocar_vehicles'
);

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_vehicles' 
ORDER BY ordinal_position;

-- Verificar se há dados na tabela
SELECT COUNT(*) as total_vehicles FROM ocar_vehicles;

-- Verificar dados existentes
SELECT id, marca, modelo, ano, preco, plano, status, dono_id 
FROM ocar_vehicles 
LIMIT 5;
