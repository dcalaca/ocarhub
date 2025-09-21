-- Sistema de tabelas normalizadas para FIPE
-- Execute no Supabase SQL Editor

-- 1. Tabela de Marcas
CREATE TABLE IF NOT EXISTS ocar_fipe_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  code VARCHAR(20),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Modelos Base
CREATE TABLE IF NOT EXISTS ocar_fipe_models (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID NOT NULL REFERENCES ocar_fipe_brands(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL, -- Ex: "Civic", "Accord", "City"
  full_name VARCHAR(200), -- Ex: "Civic Sedan 1.8 EX"
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(brand_id, name)
);

-- 3. Tabela de Preços FIPE
CREATE TABLE IF NOT EXISTS ocar_fipe_prices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_id UUID NOT NULL REFERENCES ocar_fipe_models(id) ON DELETE CASCADE,
  version VARCHAR(200) NOT NULL, -- Ex: "Sedan 1.8 EX", "Hatchback Touring"
  year INTEGER NOT NULL,
  fipe_code VARCHAR(20) NOT NULL,
  reference_month VARCHAR(7) NOT NULL, -- Ex: "2025-09"
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(model_id, version, year, reference_month)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_fipe_brands_name ON ocar_fipe_brands(name);
CREATE INDEX IF NOT EXISTS idx_fipe_brands_active ON ocar_fipe_brands(active);

CREATE INDEX IF NOT EXISTS idx_fipe_models_brand_id ON ocar_fipe_models(brand_id);
CREATE INDEX IF NOT EXISTS idx_fipe_models_name ON ocar_fipe_models(name);
CREATE INDEX IF NOT EXISTS idx_fipe_models_active ON ocar_fipe_models(active);

CREATE INDEX IF NOT EXISTS idx_fipe_prices_model_id ON ocar_fipe_prices(model_id);
CREATE INDEX IF NOT EXISTS idx_fipe_prices_year ON ocar_fipe_prices(year);
CREATE INDEX IF NOT EXISTS idx_fipe_prices_reference_month ON ocar_fipe_prices(reference_month);
CREATE INDEX IF NOT EXISTS idx_fipe_prices_fipe_code ON ocar_fipe_prices(fipe_code);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_fipe_brands_updated_at BEFORE UPDATE ON ocar_fipe_brands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fipe_models_updated_at BEFORE UPDATE ON ocar_fipe_models
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_fipe_prices_updated_at BEFORE UPDATE ON ocar_fipe_prices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comentários das tabelas
COMMENT ON TABLE ocar_fipe_brands IS 'Tabela de marcas de veículos FIPE';
COMMENT ON TABLE ocar_fipe_models IS 'Tabela de modelos base de veículos FIPE';
COMMENT ON TABLE ocar_fipe_prices IS 'Tabela de preços FIPE por modelo, versão, ano e mês de referência';
