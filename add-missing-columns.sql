-- Adicionar colunas que faltam na tabela ocar_planos
-- Execute este SQL no Supabase SQL Editor

-- Adicionar coluna duracao_dias (para planos com duração específica)
ALTER TABLE ocar_planos 
ADD COLUMN IF NOT EXISTS duracao_dias INTEGER NULL;

-- Comentário para documentação
COMMENT ON COLUMN ocar_planos.duracao_dias IS 'Duração em dias, NULL indica vitalício';

-- Verificar se as colunas foram adicionadas
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_planos' 
ORDER BY ordinal_position;
