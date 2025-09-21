-- Tabela de transbordo simplificada para dados da FIPE
-- Estrutura: marca, modelo, ano, codigo_fipe
-- Execute este script no Supabase SQL Editor

-- =============================================
-- TABELA DE TRANSBORDO SIMPLIFICADA
-- =============================================

CREATE TABLE IF NOT EXISTS ocar_transbordo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Dados essenciais da FIPE
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(200) NOT NULL,
  ano INTEGER NOT NULL,
  codigo_fipe VARCHAR(20) NOT NULL,
  
  -- Metadados opcionais
  referencia_mes VARCHAR(7), -- YYYY-MM
  preco DECIMAL(10,2),
  
  -- Controle
  processado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

CREATE INDEX IF NOT EXISTS idx_transbordo_marca ON ocar_transbordo(marca);
CREATE INDEX IF NOT EXISTS idx_transbordo_modelo ON ocar_transbordo(modelo);
CREATE INDEX IF NOT EXISTS idx_transbordo_ano ON ocar_transbordo(ano);
CREATE INDEX IF NOT EXISTS idx_transbordo_codigo ON ocar_transbordo(codigo_fipe);
CREATE INDEX IF NOT EXISTS idx_transbordo_processado ON ocar_transbordo(processado);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

ALTER TABLE ocar_transbordo ENABLE ROW LEVEL SECURITY;

-- Política: Todos podem ler dados FIPE
CREATE POLICY "Transbordo is publicly readable" ON ocar_transbordo
FOR SELECT USING (true);

-- Política: Apenas service role pode inserir/atualizar
CREATE POLICY "Service role can manage transbordo" ON ocar_transbordo
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- TRIGGER PARA UPDATED_AT
-- =============================================

CREATE TRIGGER update_transbordo_updated_at 
    BEFORE UPDATE ON ocar_transbordo 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- FUNÇÃO PARA PROCESSAR DADOS DE TRANSBORDO
-- =============================================

CREATE OR REPLACE FUNCTION processar_transbordo()
RETURNS void AS $$
BEGIN
  -- 1. Processar marcas (extrair marcas únicas)
  INSERT INTO ocar_fipe_brands (code, name, active)
  SELECT DISTINCT 
    ROW_NUMBER() OVER (ORDER BY marca)::text as code,
    marca as name,
    true as active
  FROM ocar_transbordo 
  WHERE NOT processado
  ON CONFLICT (name) DO UPDATE SET
    updated_at = NOW();

  -- 2. Processar modelos (extrair modelos únicos por marca)
  INSERT INTO ocar_fipe_models (brand_code, code, name, active)
  SELECT DISTINCT 
    b.code as brand_code,
    ROW_NUMBER() OVER (PARTITION BY t.marca ORDER BY t.modelo)::text as code,
    t.modelo as name,
    true as active
  FROM ocar_transbordo t
  JOIN ocar_fipe_brands b ON b.name = t.marca
  WHERE NOT t.processado
  ON CONFLICT (brand_code, name) DO UPDATE SET
    updated_at = NOW();

  -- 3. Processar anos/versões (extrair anos únicos por modelo)
  INSERT INTO ocar_fipe_years (brand_code, model_code, code, name, year, fuel_type, active)
  SELECT DISTINCT 
    b.code as brand_code,
    m.code as model_code,
    t.codigo_fipe as code,
    CONCAT(t.ano, ' - ', t.modelo) as name,
    t.ano as year,
    'Gasolina' as fuel_type, -- Default, pode ser extraído do modelo depois
    true as active
  FROM ocar_transbordo t
  JOIN ocar_fipe_brands b ON b.name = t.marca
  JOIN ocar_fipe_models m ON m.name = t.modelo AND m.brand_code = b.code
  WHERE NOT t.processado
  ON CONFLICT (brand_code, model_code, code) DO UPDATE SET
    updated_at = NOW();

  -- 4. Processar preços (se houver)
  INSERT INTO ocar_fipe_prices (brand_code, model_code, year_code, fipe_code, price, fuel, reference_month)
  SELECT DISTINCT 
    b.code as brand_code,
    m.code as model_code,
    y.code as year_code,
    t.codigo_fipe as fipe_code,
    t.preco as price,
    'Gasolina' as fuel,
    t.referencia_mes as reference_month
  FROM ocar_transbordo t
  JOIN ocar_fipe_brands b ON b.name = t.marca
  JOIN ocar_fipe_models m ON m.name = t.modelo AND m.brand_code = b.code
  JOIN ocar_fipe_years y ON y.codigo_fipe = t.codigo_fipe
  WHERE NOT t.processado
    AND t.preco IS NOT NULL
  ON CONFLICT (brand_code, model_code, year_code, reference_month) DO UPDATE SET
    price = EXCLUDED.price,
    updated_at = NOW();

  -- 5. Marcar como processado
  UPDATE ocar_transbordo 
  SET processado = true, updated_at = NOW()
  WHERE NOT processado;

  RAISE NOTICE 'Dados de transbordo processados com sucesso!';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FUNÇÃO PARA LIMPAR DADOS ANTIGOS
-- =============================================

CREATE OR REPLACE FUNCTION limpar_dados_antigos()
RETURNS void AS $$
BEGIN
  -- Limpar dados antigos (manter apenas últimos 3 meses)
  DELETE FROM ocar_transbordo 
  WHERE referencia_mes < TO_CHAR(CURRENT_DATE - INTERVAL '3 months', 'YYYY-MM');
  
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
