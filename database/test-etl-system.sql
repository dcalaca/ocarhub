-- Teste do sistema ETL
-- Execute no Supabase SQL Editor após instalar o sistema ETL

-- ========================================
-- 1. VERIFICAR ESTRUTURA DAS TABELAS
-- ========================================

-- Verificar se as tabelas foram criadas corretamente
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name IN ('ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_prices')
  AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ========================================
-- 2. VERIFICAR CONSTRAINTS E ÍNDICES
-- ========================================

-- Verificar constraints únicas
SELECT 
  tc.table_name,
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name IN ('ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_prices')
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- Verificar índices
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename IN ('ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_prices')
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- ========================================
-- 3. VERIFICAR TRIGGER
-- ========================================

-- Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'tg_refresh_from_transbordo'
  AND event_object_table = 'ocar_transbordo';

-- ========================================
-- 4. TESTAR FUNÇÕES AUXILIARES
-- ========================================

-- Testar função de busca de preço
SELECT * FROM get_fipe_price('Honda', 'Civic', 2020, '2025-09') LIMIT 5;

-- Testar função de marcas disponíveis
SELECT * FROM get_available_brands() LIMIT 10;

-- Testar função de modelos por marca
SELECT * FROM get_models_by_brand('Honda') LIMIT 10;

-- ========================================
-- 5. TESTAR SISTEMA ETL COM DADOS DE TESTE
-- ========================================

-- Inserir dados de teste no transbordo
INSERT INTO ocar_transbordo (marca, modelo, ano, codigo_fipe, referencia_mes, preco, processado)
VALUES 
  ('TESTE MARCA', 'TESTE MODELO', 2024, 'TESTE-001', '2025-09', 50000.00, false),
  ('TESTE MARCA', 'TESTE MODELO 2', 2024, 'TESTE-002', '2025-09', 60000.00, false);

-- Verificar se os dados foram processados automaticamente
SELECT 'Marcas após teste' as status, COUNT(*) as total FROM ocar_fipe_brands WHERE name LIKE 'TESTE%';
SELECT 'Modelos após teste' as status, COUNT(*) as total FROM ocar_fipe_models WHERE name LIKE 'TESTE%';
SELECT 'Preços após teste' as status, COUNT(*) as total FROM ocar_fipe_prices WHERE fipe_code LIKE 'TESTE%';

-- Limpar dados de teste
DELETE FROM ocar_transbordo WHERE marca = 'TESTE MARCA';
DELETE FROM ocar_fipe_prices WHERE fipe_code LIKE 'TESTE%';
DELETE FROM ocar_fipe_models WHERE name LIKE 'TESTE%';
DELETE FROM ocar_fipe_brands WHERE name = 'TESTE MARCA';

-- ========================================
-- 6. VERIFICAÇÃO FINAL DO SISTEMA
-- ========================================

-- Contagem final de registros
SELECT 'FINAL - Marcas' as tabela, COUNT(*) as total FROM ocar_fipe_brands
UNION ALL
SELECT 'FINAL - Modelos' as tabela, COUNT(*) as total FROM ocar_fipe_models
UNION ALL
SELECT 'FINAL - Preços' as tabela, COUNT(*) as total FROM ocar_fipe_prices
UNION ALL
SELECT 'FINAL - Transbordo' as tabela, COUNT(*) as total FROM ocar_transbordo;

-- Amostra de dados finais
SELECT 'Amostra Marcas' as tipo, name as valor FROM ocar_fipe_brands ORDER BY name LIMIT 5;
SELECT 'Amostra Modelos' as tipo, name as valor FROM ocar_fipe_models ORDER BY name LIMIT 5;
SELECT 'Amostra Preços' as tipo, CONCAT(year, ' - R$ ', price) as valor FROM ocar_fipe_prices ORDER BY price LIMIT 5;
