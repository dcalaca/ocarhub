-- Tabela de transbordo para dados brutos da FIPE
-- Esta tabela espelha exatamente a estrutura da API FIPE
-- Execute este script no Supabase SQL Editor

-- =============================================
-- TABELA DE TRANSBORDO (DADOS BRUTOS DA FIPE)
-- =============================================

CREATE TABLE IF NOT EXISTS ocar_transbordo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados da marca
  brand_code VARCHAR(10) NOT NULL,
  brand_name VARCHAR(100) NOT NULL,
  
  -- Dados do modelo (descrição completa da FIPE)
  model_code VARCHAR(20) NOT NULL,
  model_name VARCHAR(200) NOT NULL,
  model_full_name TEXT NOT NULL, -- Nome completo como vem da FIPE
  
  -- Dados do ano/versão
  year_code VARCHAR(20) NOT NULL,
  year_name VARCHAR(200) NOT NULL,
  year_number INTEGER,
  fuel_type VARCHAR(50),
  
  -- Código FIPE completo
  fipe_code VARCHAR(20) NOT NULL,
  
  -- Metadados
  reference_month VARCHAR(7), -- YYYY-MM
  price DECIMAL(10,2),
  
  -- Controle
  processed BOOLEAN DEFAULT false, -- Se já foi processado para as tabelas organizadas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices únicos
  UNIQUE(brand_code, model_code, year_code, reference_month)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transbordo_brand ON ocar_transbordo(brand_code);
CREATE INDEX IF NOT EXISTS idx_transbordo_model ON ocar_transbordo(model_code);
CREATE INDEX IF NOT EXISTS idx_transbordo_year ON ocar_transbordo(year_number);
CREATE INDEX IF NOT EXISTS idx_transbordo_fuel ON ocar_transbordo(fuel_type);
CREATE INDEX IF NOT EXISTS idx_transbordo_processed ON ocar_transbordo(processed);
CREATE INDEX IF NOT EXISTS idx_transbordo_reference ON ocar_transbordo(reference_month);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE ocar_transbordo ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler dados FIPE
CREATE POLICY "FIPE raw data is publicly readable" ON ocar_transbordo
FOR SELECT USING (true);

-- Política: Apenas service role pode inserir/atualizar (para sincronização)
CREATE POLICY "Service role can manage FIPE raw data" ON ocar_transbordo
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_transbordo_updated_at 
    BEFORE UPDATE ON ocar_transbordo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA PROCESSAR DADOS BRUTOS
-- =============================================

CREATE OR REPLACE FUNCTION process_fipe_raw_data()
RETURNS void AS $$
BEGIN
  -- 1. Processar marcas
  INSERT INTO ocar_fipe_brands (code, name, active)
  SELECT DISTINCT 
    brand_code, 
    brand_name, 
    true
  FROM ocar_transbordo 
  WHERE NOT processed
  ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

  -- 2. Processar modelos
  INSERT INTO ocar_fipe_models (brand_code, code, name, active)
  SELECT DISTINCT 
    brand_code,
    model_code,
    model_name,
    true
  FROM ocar_transbordo 
  WHERE NOT processed
  ON CONFLICT (brand_code, code) DO UPDATE SET
    name = EXCLUDED.name,
    updated_at = NOW();

  -- 3. Processar anos/versões
  INSERT INTO ocar_fipe_years (brand_code, model_code, code, name, year, fuel_type, active)
  SELECT DISTINCT 
    brand_code,
    model_code,
    year_code,
    year_name,
    year_number,
    fuel_type,
    true
  FROM ocar_transbordo 
  WHERE NOT processed
  ON CONFLICT (brand_code, model_code, code) DO UPDATE SET
    name = EXCLUDED.name,
    year = EXCLUDED.year,
    fuel_type = EXCLUDED.fuel_type,
    updated_at = NOW();

  -- 4. Processar preços
  INSERT INTO ocar_fipe_prices (brand_code, model_code, year_code, fipe_code, price, fuel, reference_month)
  SELECT DISTINCT 
    brand_code,
    model_code,
    year_code,
    fipe_code,
    price,
    fuel_type,
    reference_month
  FROM ocar_transbordo 
  WHERE NOT processed
    AND price IS NOT NULL
  ON CONFLICT (brand_code, model_code, year_code, reference_month) DO UPDATE SET
    fipe_code = EXCLUDED.fipe_code,
    price = EXCLUDED.price,
    fuel = EXCLUDED.fuel,
    updated_at = NOW();

  -- 5. Marcar como processado
  UPDATE ocar_transbordo 
  SET processed = true, updated_at = NOW()
  WHERE NOT processed;

  RAISE NOTICE 'Dados FIPE processados com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNÇÃO PARA LIMPAR DADOS ANTIGOS
-- =============================================

CREATE OR REPLACE FUNCTION clean_old_fipe_data()
RETURNS void AS $$
BEGIN
  -- Limpar dados antigos (manter apenas últimos 3 meses)
  DELETE FROM ocar_transbordo 
  WHERE reference_month < TO_CHAR(CURRENT_DATE - INTERVAL '3 months', 'YYYY-MM');
  
  -- Limpar preços antigos
  DELETE FROM ocar_fipe_prices 
  WHERE reference_month < TO_CHAR(CURRENT_DATE - INTERVAL '3 months', 'YYYY-MM');
  
  RAISE NOTICE 'Dados antigos limpos com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- VERIFICAÇÃO
-- =============================================

-- Verificar se a tabela foi criada
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'ocar_transbordo'
ORDER BY table_name;
