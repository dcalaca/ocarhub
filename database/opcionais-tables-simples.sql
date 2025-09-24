-- ========================================
-- VERSÃO SIMPLIFICADA - EXECUTE NO SUPABASE
-- ========================================

-- 1. Criar tabelas básicas
CREATE TABLE IF NOT EXISTS ocar_combustiveis (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_cores (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_carrocerias (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_opcionais (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  categoria VARCHAR(50) DEFAULT 'geral',
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_tipos_vendedor (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(50) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_caracteristicas (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(100) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_finais_placa (
  id SERIAL PRIMARY KEY,
  numero INTEGER NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_blindagem (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(20) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS ocar_leilao (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(20) NOT NULL UNIQUE,
  ativo BOOLEAN DEFAULT TRUE
);

-- 2. Inserir dados básicos
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

INSERT INTO ocar_tipos_vendedor (nome) VALUES
('Particular'),
('Loja'),
('Concessionária'),
('Revenda')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO ocar_caracteristicas (nome) VALUES
('Aceita Troca'),
('Alienado'),
('Garantia de Fábrica'),
('IPVA Pago'),
('Licenciado'),
('Revisões na Concessionária'),
('Único Dono')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO ocar_finais_placa (numero) VALUES
(0), (1), (2), (3), (4), (5), (6), (7), (8), (9)
ON CONFLICT (numero) DO NOTHING;

INSERT INTO ocar_blindagem (nome) VALUES
('Sim'),
('Não')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO ocar_leilao (nome) VALUES
('Sim'),
('Não')
ON CONFLICT (nome) DO NOTHING;

-- 3. Adicionar colunas na tabela de veículos (se não existirem)
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS carroceria VARCHAR(50);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS tipo_vendedor VARCHAR(50);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS final_placa INTEGER;
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS blindagem VARCHAR(20);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS leilao VARCHAR(20);
ALTER TABLE ocar_vehicles ADD COLUMN IF NOT EXISTS caracteristicas TEXT[];

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_carroceria ON ocar_vehicles(carroceria);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_tipo_vendedor ON ocar_vehicles(tipo_vendedor);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_final_placa ON ocar_vehicles(final_placa);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_blindagem ON ocar_vehicles(blindagem);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_leilao ON ocar_vehicles(leilao);
CREATE INDEX IF NOT EXISTS idx_ocar_vehicles_caracteristicas ON ocar_vehicles USING GIN(caracteristicas);
