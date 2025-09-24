-- ========================================
-- TABELAS PARA SISTEMA DE OPCIONAIS
-- ========================================
-- Execute este SQL no Supabase SQL Editor

-- 1. Tabela de combustíveis
CREATE TABLE IF NOT EXISTS ocar_combustiveis (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de cores
CREATE TABLE IF NOT EXISTS ocar_cores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de carrocerias
CREATE TABLE IF NOT EXISTS ocar_carrocerias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de opcionais
CREATE TABLE IF NOT EXISTS ocar_opcionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(50) DEFAULT 'geral',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de tipos de vendedor
CREATE TABLE IF NOT EXISTS ocar_tipos_vendedor (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Tabela de características do veículo
CREATE TABLE IF NOT EXISTS ocar_caracteristicas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de finais de placa
CREATE TABLE IF NOT EXISTS ocar_finais_placa (
  id SERIAL PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de blindagem
CREATE TABLE IF NOT EXISTS ocar_blindagem (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(20) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de leilão
CREATE TABLE IF NOT EXISTS ocar_leilao (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(20) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INSERIR DADOS INICIAIS
-- ========================================

-- Inserir combustíveis
INSERT INTO ocar_combustiveis (nome) VALUES
('Flex (Gasolina/Álcool)'),
('Gasolina'),
('Álcool/Etanol'),
('Diesel'),
('Diesel S-10'),
('Elétrico'),
('Híbrido'),
('Híbrido Flex'),
('GNV'),
('GNV/Gasolina'),
('Gasolina/GNV'),
('Plug-in Hybrid')
ON CONFLICT (nome) DO NOTHING;

-- Inserir cores
INSERT INTO ocar_cores (nome) VALUES
('Branco'),
('Prata'),
('Preto'),
('Cinza'),
('Vermelho'),
('Azul'),
('Verde'),
('Amarelo'),
('Bege'),
('Marrom'),
('Dourado'),
('Laranja'),
('Rosa'),
('Roxo'),
('Vinho')
ON CONFLICT (nome) DO NOTHING;

-- Inserir carrocerias
INSERT INTO ocar_carrocerias (nome) VALUES
('Buggy'),
('Conversível'),
('Cupê'),
('Hatch'),
('Minivan'),
('Perua/SW'),
('Picape'),
('Sedã'),
('SUV'),
('Van/Utilitário')
ON CONFLICT (nome) DO NOTHING;

-- Inserir opcionais
INSERT INTO ocar_opcionais (nome, categoria) VALUES
('Ar Condicionado', 'conforto'),
('Vidros Elétricos', 'conforto'),
('Teto Solar', 'conforto'),
('Travas Elétricas', 'conforto'),
('Direção Hidráulica', 'conforto'),
('Direção Elétrica', 'conforto'),
('Bancos de Couro', 'conforto'),
('Rodas de Liga Leve', 'estetica'),
('Airbag', 'seguranca'),
('ABS', 'seguranca'),
('Alarme', 'seguranca'),
('Som', 'entretenimento'),
('DVD', 'entretenimento'),
('GPS', 'navegacao'),
('Câmera de Ré', 'seguranca'),
('Sensor de Estacionamento', 'seguranca'),
('Controle de Estabilidade', 'seguranca'),
('Controle de Tração', 'seguranca'),
('Freios ABS', 'seguranca'),
('Computador de Bordo', 'conforto')
ON CONFLICT (nome) DO NOTHING;

-- Inserir tipos de vendedor
INSERT INTO ocar_tipos_vendedor (nome) VALUES
('Particular'),
('Loja'),
('Concessionária'),
('Revenda')
ON CONFLICT (nome) DO NOTHING;

-- Inserir características
INSERT INTO ocar_caracteristicas (nome) VALUES
('Aceita Troca'),
('Alienado'),
('Garantia de Fábrica'),
('IPVA Pago'),
('Licenciado'),
('Revisões na Concessionária'),
('Único Dono')
ON CONFLICT (nome) DO NOTHING;

-- Inserir finais de placa
INSERT INTO ocar_finais_placa (numero) VALUES
(0), (1), (2), (3), (4), (5), (6), (7), (8), (9)
ON CONFLICT (numero) DO NOTHING;

-- Inserir blindagem
INSERT INTO ocar_blindagem (nome) VALUES
('Sim'),
('Não')
ON CONFLICT (nome) DO NOTHING;

-- Inserir leilão
INSERT INTO ocar_leilao (nome) VALUES
('Sim'),
('Não')
ON CONFLICT (nome) DO NOTHING;

-- ========================================
-- ATUALIZAR TABELA DE VEÍCULOS
-- ========================================

-- Adicionar colunas para novos campos na tabela ocar_vehicles
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS carroceria VARCHAR(50);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS tipo_vendedor VARCHAR(50);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS final_placa INTEGER;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS blindagem VARCHAR(20);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS leilao VARCHAR(20);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS caracteristicas TEXT[];

-- ========================================
-- CRIAR ÍNDICES PARA PERFORMANCE
-- ========================================

CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_carroceria ON ocar_vehicles(carroceria);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_tipo_vendedor ON ocar_vehicles(tipo_vendedor);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_final_placa ON ocar_vehicles(final_placa);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_blindagem ON ocar_vehicles(blindagem);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_leilao ON ocar_vehicles(leilao);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_caracteristicas ON ocar_vehicles USING GIN(caracteristicas);

-- ========================================
-- CRIAR TRIGGERS PARA UPDATED_AT
-- ========================================

-- Trigger para ocar_combustiveis
CREATE OR REPLACE FUNCTION update_ocar_combustiveis_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_combustiveis_updated_at
    BEFORE UPDATE ON ocar_combustiveis
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_combustiveis_updated_at();

-- Trigger para ocar_cores
CREATE OR REPLACE FUNCTION update_ocar_cores_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_cores_updated_at
    BEFORE UPDATE ON ocar_cores
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_cores_updated_at();

-- Trigger para ocar_carrocerias
CREATE OR REPLACE FUNCTION update_ocar_carrocerias_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_carrocerias_updated_at
    BEFORE UPDATE ON ocar_carrocerias
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_carrocerias_updated_at();

-- Trigger para ocar_opcionais
CREATE OR REPLACE FUNCTION update_ocar_opcionais_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_opcionais_updated_at
    BEFORE UPDATE ON ocar_opcionais
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_opcionais_updated_at();

-- Trigger para ocar_tipos_vendedor
CREATE OR REPLACE FUNCTION update_ocar_tipos_vendedor_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_tipos_vendedor_updated_at
    BEFORE UPDATE ON ocar_tipos_vendedor
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_tipos_vendedor_updated_at();

-- Trigger para ocar_caracteristicas
CREATE OR REPLACE FUNCTION update_ocar_caracteristicas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_caracteristicas_updated_at
    BEFORE UPDATE ON ocar_caracteristicas
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_caracteristicas_updated_at();

-- Trigger para ocar_finais_placa
CREATE OR REPLACE FUNCTION update_ocar_finais_placa_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_finais_placa_updated_at
    BEFORE UPDATE ON ocar_finais_placa
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_finais_placa_updated_at();

-- Trigger para ocar_blindagem
CREATE OR REPLACE FUNCTION update_ocar_blindagem_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_blindagem_updated_at
    BEFORE UPDATE ON ocar_blindagem
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_blindagem_updated_at();

-- Trigger para ocar_leilao
CREATE OR REPLACE FUNCTION update_ocar_leilao_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ocar_leilao_updated_at
    BEFORE UPDATE ON ocar_leilao
    FOR EACH ROW
    EXECUTE FUNCTION update_ocar_leilao_updated_at();
