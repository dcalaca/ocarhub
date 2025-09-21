-- Script para criar tabelas da FIPE no Supabase
-- Execute este script no Supabase SQL Editor

-- =============================================
-- TABELAS DA FIPE
-- =============================================

-- 1. Tabela de Marcas
CREATE TABLE IF NOT EXISTS ocar_fipe_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Modelos
CREATE TABLE IF NOT EXISTS ocar_fipe_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_code, code)
);

-- 3. Tabela de Anos/Versões
CREATE TABLE IF NOT EXISTS ocar_fipe_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL,
  model_code VARCHAR(20) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_code, model_code, code)
);

-- 4. Tabela de Preços FIPE
CREATE TABLE IF NOT EXISTS ocar_fipe_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL,
  model_code VARCHAR(20) NOT NULL,
  year_code VARCHAR(20) NOT NULL,
  fipe_code VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  fuel VARCHAR(50),
  reference_month VARCHAR(7), -- YYYY-MM
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_code, model_code, year_code, reference_month)
);

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================

-- Índices para Marcas
CREATE INDEX IF NOT EXISTS idx_fipe_brands_code ON ocar_fipe_brands(code);
CREATE INDEX IF NOT EXISTS idx_fipe_brands_active ON ocar_fipe_brands(active);

-- Índices para Modelos
CREATE INDEX IF NOT EXISTS idx_fipe_models_brand ON ocar_fipe_models(brand_code);
CREATE INDEX IF NOT EXISTS idx_fipe_models_active ON ocar_fipe_models(active);
CREATE INDEX IF NOT EXISTS idx_fipe_models_name ON ocar_fipe_models(name);

-- Índices para Anos/Versões
CREATE INDEX IF NOT EXISTS idx_fipe_years_brand_model ON ocar_fipe_years(brand_code, model_code);
CREATE INDEX IF NOT EXISTS idx_fipe_years_year ON ocar_fipe_years(year);
CREATE INDEX IF NOT EXISTS idx_fipe_years_active ON ocar_fipe_years(active);
CREATE INDEX IF NOT EXISTS idx_fipe_years_fuel ON ocar_fipe_years(fuel_type);

-- Índices para Preços
CREATE INDEX IF NOT EXISTS idx_fipe_prices_fipe_code ON ocar_fipe_prices(fipe_code);
CREATE INDEX IF NOT EXISTS idx_fipe_prices_reference ON ocar_fipe_prices(reference_month);
CREATE INDEX IF NOT EXISTS idx_fipe_prices_brand_model ON ocar_fipe_prices(brand_code, model_code);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE ocar_fipe_brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_fipe_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_fipe_years ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_fipe_prices ENABLE ROW LEVEL SECURITY;

-- Políticas: Todos podem ler dados FIPE (dados públicos)
CREATE POLICY "FIPE brands are publicly readable" ON ocar_fipe_brands
FOR SELECT USING (true);

CREATE POLICY "FIPE models are publicly readable" ON ocar_fipe_models
FOR SELECT USING (true);

CREATE POLICY "FIPE years are publicly readable" ON ocar_fipe_years
FOR SELECT USING (true);

CREATE POLICY "FIPE prices are publicly readable" ON ocar_fipe_prices
FOR SELECT USING (true);

-- Políticas: Apenas service role pode inserir/atualizar (para sincronização)
CREATE POLICY "Service role can manage FIPE brands" ON ocar_fipe_brands
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage FIPE models" ON ocar_fipe_models
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage FIPE years" ON ocar_fipe_years
FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role can manage FIPE prices" ON ocar_fipe_prices
FOR ALL USING (auth.role() = 'service_role');

-- =============================================
-- FUNÇÕES AUXILIARES
-- =============================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_fipe_brands_updated_at 
    BEFORE UPDATE ON ocar_fipe_brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fipe_models_updated_at 
    BEFORE UPDATE ON ocar_fipe_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fipe_years_updated_at 
    BEFORE UPDATE ON ocar_fipe_years 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fipe_prices_updated_at 
    BEFORE UPDATE ON ocar_fipe_prices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- DADOS INICIAIS (OPCIONAL)
-- =============================================

-- Inserir algumas marcas principais para teste
INSERT INTO ocar_fipe_brands (code, name) VALUES
('25', 'Honda'),
('23', 'VW - VolksWagen'),
('21', 'Fiat'),
('59', 'Chevrolet'),
('26', 'Hyundai')
ON CONFLICT (code) DO NOTHING;

-- =============================================
-- VERIFICAÇÃO
-- =============================================

-- Verificar se as tabelas foram criadas
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'ocar_fipe_%'
ORDER BY table_name;
