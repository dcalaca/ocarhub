-- Tabelas para armazenar dados da FIPE
-- Execute este SQL no Supabase SQL Editor

-- 1. Tabela de marcas da FIPE
CREATE TABLE ocar_fipe_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de modelos da FIPE
CREATE TABLE ocar_fipe_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL REFERENCES ocar_fipe_brands(code) ON DELETE CASCADE,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(200) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_code, code)
);

-- 3. Tabela de anos da FIPE
CREATE TABLE ocar_fipe_years (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL REFERENCES ocar_fipe_brands(code) ON DELETE CASCADE,
  model_code VARCHAR(20) NOT NULL,
  code VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  year INTEGER NOT NULL,
  fuel_type VARCHAR(50),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_code, model_code, code)
);

-- 4. Tabela de preços FIPE
CREATE TABLE ocar_fipe_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_code VARCHAR(10) NOT NULL,
  model_code VARCHAR(20) NOT NULL,
  year_code VARCHAR(20) NOT NULL,
  fipe_code VARCHAR(20) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  fuel VARCHAR(50),
  reference_month VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_code, model_code, year_code, reference_month)
);

-- Índices para performance
CREATE INDEX idx_fipe_brands_code ON ocar_fipe_brands(code);
CREATE INDEX idx_fipe_brands_name ON ocar_fipe_brands(name);
CREATE INDEX idx_fipe_brands_active ON ocar_fipe_brands(active);

CREATE INDEX idx_fipe_models_brand_code ON ocar_fipe_models(brand_code);
CREATE INDEX idx_fipe_models_code ON ocar_fipe_models(code);
CREATE INDEX idx_fipe_models_name ON ocar_fipe_models(name);
CREATE INDEX idx_fipe_models_active ON ocar_fipe_models(active);

CREATE INDEX idx_fipe_years_brand_model ON ocar_fipe_years(brand_code, model_code);
CREATE INDEX idx_fipe_years_code ON ocar_fipe_years(code);
CREATE INDEX idx_fipe_years_year ON ocar_fipe_years(year);
CREATE INDEX idx_fipe_years_active ON ocar_fipe_years(active);

CREATE INDEX idx_fipe_prices_brand_model_year ON ocar_fipe_prices(brand_code, model_code, year_code);
CREATE INDEX idx_fipe_prices_fipe_code ON ocar_fipe_prices(fipe_code);
CREATE INDEX idx_fipe_prices_reference_month ON ocar_fipe_prices(reference_month);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ocar_fipe_brands_updated_at 
    BEFORE UPDATE ON ocar_fipe_brands 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocar_fipe_models_updated_at 
    BEFORE UPDATE ON ocar_fipe_models 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocar_fipe_years_updated_at 
    BEFORE UPDATE ON ocar_fipe_years 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocar_fipe_prices_updated_at 
    BEFORE UPDATE ON ocar_fipe_prices 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários para documentação
COMMENT ON TABLE ocar_fipe_brands IS 'Marcas de veículos da tabela FIPE';
COMMENT ON TABLE ocar_fipe_models IS 'Modelos de veículos da tabela FIPE por marca';
COMMENT ON TABLE ocar_fipe_years IS 'Anos de veículos da tabela FIPE por modelo';
COMMENT ON TABLE ocar_fipe_prices IS 'Preços FIPE por veículo e mês de referência';

COMMENT ON COLUMN ocar_fipe_brands.code IS 'Código único da marca na API FIPE';
COMMENT ON COLUMN ocar_fipe_brands.name IS 'Nome da marca';
COMMENT ON COLUMN ocar_fipe_models.brand_code IS 'Código da marca referenciada';
COMMENT ON COLUMN ocar_fipe_models.code IS 'Código único do modelo na API FIPE';
COMMENT ON COLUMN ocar_fipe_models.name IS 'Nome do modelo';
COMMENT ON COLUMN ocar_fipe_years.year IS 'Ano do veículo extraído do nome';
COMMENT ON COLUMN ocar_fipe_years.fuel_type IS 'Tipo de combustível extraído do nome';
COMMENT ON COLUMN ocar_fipe_prices.fipe_code IS 'Código FIPE único do veículo';
COMMENT ON COLUMN ocar_fipe_prices.reference_month IS 'Mês de referência da tabela FIPE';
