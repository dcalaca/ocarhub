-- Script para corrigir o schema das tabelas FIPE
-- Execute no Supabase SQL Editor

-- 1. Corrigir tabela de modelos (aumentar tamanho do campo code)
ALTER TABLE ocar_fipe_models 
ALTER COLUMN code TYPE VARCHAR(100);

-- 2. Adicionar campo version_name na tabela de anos
ALTER TABLE ocar_fipe_years 
ADD COLUMN version_name VARCHAR(200);

-- 3. Adicionar campo version_name na tabela de marcas (para consistência)
ALTER TABLE ocar_fipe_brands 
ALTER COLUMN code TYPE VARCHAR(100);

-- 4. Verificar se as tabelas foram corrigidas
SELECT 
  table_name,
  column_name,
  data_type,
  character_maximum_length
FROM information_schema.columns 
WHERE table_name IN ('ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_years')
  AND column_name IN ('code', 'version_name')
ORDER BY table_name, column_name;

