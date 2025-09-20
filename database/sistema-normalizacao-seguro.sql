-- =============================================
-- SISTEMA DE NORMALIZAÇÃO FIPE - SEGURO
-- =============================================
-- Este script NÃO modifica a tabela transbordo existente
-- Apenas lê os dados e popula as 3 tabelas normalizadas
-- Execute no Supabase SQL Editor

-- =============================================
-- 1. BACKUP DE SEGURANÇA (OPCIONAL)
-- =============================================

-- Descomente a linha abaixo se quiser criar um backup
-- CREATE TABLE ocar_transbordo_backup AS SELECT * FROM ocar_transbordo;

-- =============================================
-- 2. VERIFICAR SE AS TABELAS NORMALIZADAS JÁ EXISTEM
-- =============================================

-- Verificar se as tabelas já existem
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ocar_fipe_brands') 
    THEN 'Tabela ocar_fipe_brands já existe'
    ELSE 'Tabela ocar_fipe_brands não existe'
  END as status_brands;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ocar_fipe_models') 
    THEN 'Tabela ocar_fipe_models já existe'
    ELSE 'Tabela ocar_fipe_models não existe'
  END as status_models;

SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ocar_fipe_prices') 
    THEN 'Tabela ocar_fipe_prices já existe'
    ELSE 'Tabela ocar_fipe_prices não existe'
  END as status_prices;

-- =============================================
-- 3. CRIAR TABELAS NORMALIZADAS (SE NÃO EXISTIREM)
-- =============================================

-- 3.1. Tabela de Marcas (sem duplicidade)
CREATE TABLE IF NOT EXISTS ocar_fipe_brands (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2. Tabela de Modelos (único por marca)
CREATE TABLE IF NOT EXISTS ocar_fipe_models (
  id BIGSERIAL PRIMARY KEY,
  brand_id BIGINT NOT NULL REFERENCES ocar_fipe_brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_fipe_model UNIQUE (brand_id, name)
);

-- 3.3. Tabela de Preços FIPE
CREATE TABLE IF NOT EXISTS ocar_fipe_prices (
  id BIGSERIAL PRIMARY KEY,
  model_id BIGINT NOT NULL REFERENCES ocar_fipe_models(id) ON DELETE CASCADE,
  year INT NOT NULL,
  reference_month TEXT NOT NULL,
  fipe_code TEXT NOT NULL,
  price NUMERIC NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT uq_fipe_price UNIQUE (model_id, year, reference_month, fipe_code)
);

-- =============================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_models_brand ON ocar_fipe_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_prices_model ON ocar_fipe_prices(model_id);
CREATE INDEX IF NOT EXISTS idx_prices_year ON ocar_fipe_prices(year);
CREATE INDEX IF NOT EXISTS idx_prices_reference ON ocar_fipe_prices(reference_month);
CREATE INDEX IF NOT EXISTS idx_prices_fipe_code ON ocar_fipe_prices(fipe_code);

-- =============================================
-- 5. FUNÇÃO SEGURA PARA NORMALIZAR DADOS
-- =============================================

CREATE OR REPLACE FUNCTION normalizar_dados_fipe_seguro()
RETURNS TABLE (
  marcas_processadas BIGINT,
  modelos_processados BIGINT,
  precos_processados BIGINT
) 
LANGUAGE plpgsql
AS $$
DECLARE
  v_marcas BIGINT := 0;
  v_modelos BIGINT := 0;
  v_precos BIGINT := 0;
BEGIN
  -- 1. Processar MARCAS (sem duplicidade) - APENAS LEITURA da transbordo
  WITH marcas_inseridas AS (
    INSERT INTO ocar_fipe_brands(name)
    SELECT DISTINCT 
      TRIM(marca) as name
    FROM ocar_transbordo 
    WHERE marca IS NOT NULL 
      AND TRIM(marca) <> ''
    ON CONFLICT (name) DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*) INTO v_marcas FROM marcas_inseridas;

  -- 2. Processar MODELOS (único por marca) - APENAS LEITURA da transbordo
  WITH modelos_inseridos AS (
    INSERT INTO ocar_fipe_models(brand_id, name)
    SELECT DISTINCT 
      b.id as brand_id,
      TRIM(t.modelo) as name
    FROM ocar_transbordo t
    JOIN ocar_fipe_brands b ON b.name = TRIM(t.marca)
    WHERE t.modelo IS NOT NULL 
      AND TRIM(t.modelo) <> ''
      AND t.marca IS NOT NULL
      AND TRIM(t.marca) <> ''
    ON CONFLICT (brand_id, name) DO NOTHING
    RETURNING id
  )
  SELECT COUNT(*) INTO v_modelos FROM modelos_inseridos;

  -- 3. Processar PREÇOS FIPE - APENAS LEITURA da transbordo
  WITH precos_inseridos AS (
    INSERT INTO ocar_fipe_prices(model_id, year, reference_month, fipe_code, price)
    SELECT DISTINCT 
      m.id as model_id,
      t.ano as year,
      COALESCE(t.referencia_mes, TO_CHAR(CURRENT_DATE, 'YYYY-MM')) as reference_month,
      t.codigo_fipe,
      t.preco
    FROM ocar_transbordo t
    JOIN ocar_fipe_brands b ON b.name = TRIM(t.marca)
    JOIN ocar_fipe_models m ON m.brand_id = b.id AND m.name = TRIM(t.modelo)
    WHERE t.preco IS NOT NULL 
      AND t.codigo_fipe IS NOT NULL
      AND t.ano IS NOT NULL
      AND t.preco > 0
    ON CONFLICT (model_id, year, reference_month, fipe_code)
    DO UPDATE SET 
      price = EXCLUDED.price,
      updated_at = NOW()
    RETURNING id
  )
  SELECT COUNT(*) INTO v_precos FROM precos_inseridos;

  -- Retornar estatísticas
  RETURN QUERY SELECT v_marcas, v_modelos, v_precos;
END;
$$;

-- =============================================
-- 6. FUNÇÃO PARA PROCESSAR CSV (SEM MODIFICAR TRANSBORDO)
-- =============================================

CREATE OR REPLACE FUNCTION processar_csv_fipe_seguro(
  p_dados_csv JSONB
)
RETURNS TABLE (
  registros_inseridos BIGINT,
  marcas_novas BIGINT,
  modelos_novos BIGINT,
  precos_atualizados BIGINT
)
LANGUAGE plpgsql
AS $$
DECLARE
  v_registros BIGINT := 0;
  v_marcas BIGINT := 0;
  v_modelos BIGINT := 0;
  v_precos BIGINT := 0;
  item JSONB;
BEGIN
  -- Inserir dados do CSV na tabela de transbordo (apenas novos dados)
  FOR item IN SELECT * FROM jsonb_array_elements(p_dados_csv)
  LOOP
    INSERT INTO ocar_transbordo (
      marca,
      modelo,
      ano,
      codigo_fipe,
      referencia_mes,
      preco
    ) VALUES (
      COALESCE(item->>'marca', ''),
      COALESCE(item->>'modelo', ''),
      (item->>'ano')::INTEGER,
      COALESCE(item->>'codigo_fipe', ''),
      COALESCE(item->>'referencia_mes', TO_CHAR(CURRENT_DATE, 'YYYY-MM')),
      (item->>'preco')::DECIMAL(10,2)
    )
    ON CONFLICT (marca, modelo, ano, codigo_fipe) DO NOTHING;
    
    v_registros := v_registros + 1;
  END LOOP;

  -- Normalizar dados (apenas leitura)
  SELECT marcas_processadas, modelos_processados, precos_processados
  INTO v_marcas, v_modelos, v_precos
  FROM normalizar_dados_fipe_seguro();

  -- Retornar estatísticas
  RETURN QUERY SELECT v_registros, v_marcas, v_modelos, v_precos;
END;
$$;

-- =============================================
-- 7. FUNÇÕES DE CONSULTA OTIMIZADAS
-- =============================================

-- 7.1. Buscar preço FIPE por marca, modelo e ano
CREATE OR REPLACE FUNCTION buscar_preco_fipe(
  p_marca TEXT,
  p_modelo TEXT,
  p_ano INT,
  p_referencia_mes TEXT DEFAULT NULL
)
RETURNS TABLE (
  marca TEXT,
  modelo TEXT,
  ano INT,
  fipe_code TEXT,
  reference_month TEXT,
  price NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.name as marca,
    m.name as modelo,
    p.year as ano,
    p.fipe_code,
    p.reference_month,
    p.price
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(m.name) = LOWER(p_modelo)
    AND p.year = p_ano
    AND (p_referencia_mes IS NULL OR p.reference_month = p_referencia_mes)
  ORDER BY p.reference_month DESC, p.price ASC;
END;
$$;

-- 7.2. Listar todas as marcas disponíveis
CREATE OR REPLACE FUNCTION listar_marcas()
RETURNS TABLE (id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT b.id, b.name
  FROM ocar_fipe_brands b
  ORDER BY b.name;
END;
$$;

-- 7.3. Listar modelos por marca
CREATE OR REPLACE FUNCTION listar_modelos_por_marca(p_marca TEXT)
RETURNS TABLE (id BIGINT, name TEXT)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT m.id, m.name
  FROM ocar_fipe_models m
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
  ORDER BY m.name;
END;
$$;

-- 7.4. Listar anos disponíveis para um modelo
CREATE OR REPLACE FUNCTION listar_anos_por_modelo(p_marca TEXT, p_modelo TEXT)
RETURNS TABLE (ano INT, reference_month TEXT, price NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT p.year, p.reference_month, p.price
  FROM ocar_fipe_prices p
  JOIN ocar_fipe_models m ON m.id = p.model_id
  JOIN ocar_fipe_brands b ON b.id = m.brand_id
  WHERE LOWER(b.name) = LOWER(p_marca)
    AND LOWER(m.name) = LOWER(p_modelo)
  ORDER BY p.year DESC, p.reference_month DESC;
END;
$$;

-- =============================================
-- 8. TRIGGER PARA ATUALIZAÇÃO AUTOMÁTICA
-- =============================================

-- Função de trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas 3 tabelas
DROP TRIGGER IF EXISTS update_brands_updated_at ON ocar_fipe_brands;
CREATE TRIGGER update_brands_updated_at 
  BEFORE UPDATE ON ocar_fipe_brands 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_models_updated_at ON ocar_fipe_models;
CREATE TRIGGER update_models_updated_at 
  BEFORE UPDATE ON ocar_fipe_models 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prices_updated_at ON ocar_fipe_prices;
CREATE TRIGGER update_prices_updated_at 
  BEFORE UPDATE ON ocar_fipe_prices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS nas tabelas
ALTER TABLE ocar_fipe_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_fipe_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_fipe_prices ENABLE ROW LEVEL SECURITY;

-- Políticas de leitura pública
DROP POLICY IF EXISTS "FIPE brands are publicly readable" ON ocar_fipe_brands;
CREATE POLICY "FIPE brands are publicly readable" ON ocar_fipe_brands
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "FIPE models are publicly readable" ON ocar_fipe_models;
CREATE POLICY "FIPE models are publicly readable" ON ocar_fipe_models
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "FIPE prices are publicly readable" ON ocar_fipe_prices;
CREATE POLICY "FIPE prices are publicly readable" ON ocar_fipe_prices
  FOR SELECT USING (true);

-- Políticas de escrita apenas para service role
DROP POLICY IF EXISTS "Service role can manage FIPE brands" ON ocar_fipe_brands;
CREATE POLICY "Service role can manage FIPE brands" ON ocar_fipe_brands
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage FIPE models" ON ocar_fipe_models;
CREATE POLICY "Service role can manage FIPE models" ON ocar_fipe_models
  FOR ALL USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role can manage FIPE prices" ON ocar_fipe_prices;
CREATE POLICY "Service role can manage FIPE prices" ON ocar_fipe_prices
  FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- 10. VERIFICAÇÃO INICIAL
-- =============================================

-- Verificar se as tabelas foram criadas
SELECT 
  'Tabelas criadas' as status,
  COUNT(*) as total
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('ocar_fipe_brands', 'ocar_fipe_models', 'ocar_fipe_prices');

-- Verificar funções criadas
SELECT 
  'Funções criadas' as status,
  COUNT(*) as total
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN (
    'normalizar_dados_fipe_seguro',
    'processar_csv_fipe_seguro',
    'buscar_preco_fipe',
    'listar_marcas',
    'listar_modelos_por_marca',
    'listar_anos_por_modelo'
  );
