-- =====================================================
-- SISTEMA DE ESTADOS E MUNICÍPIOS
-- =====================================================
-- Este script cria as tabelas para armazenar estados e municípios
-- Baseado no CSV: municipios.csv (287 KB)

-- 1. Tabela de Estados
CREATE TABLE IF NOT EXISTS ocar_estados (
  id BIGSERIAL PRIMARY KEY,
  codigo_ibge VARCHAR(2) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  sigla VARCHAR(2) NOT NULL UNIQUE,
  regiao VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Municípios
CREATE TABLE IF NOT EXISTS ocar_municipios (
  id BIGSERIAL PRIMARY KEY,
  codigo_ibge VARCHAR(7) NOT NULL UNIQUE,
  nome VARCHAR(100) NOT NULL,
  estado_id BIGINT NOT NULL REFERENCES ocar_estados(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_estados_codigo_ibge ON ocar_estados(codigo_ibge);
CREATE INDEX IF NOT EXISTS idx_estados_sigla ON ocar_estados(sigla);
CREATE INDEX IF NOT EXISTS idx_estados_regiao ON ocar_estados(regiao);
CREATE INDEX IF NOT EXISTS idx_estados_nome ON ocar_estados(nome);

CREATE INDEX IF NOT EXISTS idx_municipios_codigo_ibge ON ocar_municipios(codigo_ibge);
CREATE INDEX IF NOT EXISTS idx_municipios_nome ON ocar_municipios(nome);
CREATE INDEX IF NOT EXISTS idx_municipios_estado_id ON ocar_municipios(estado_id);
CREATE INDEX IF NOT EXISTS idx_municipios_nome_estado ON ocar_municipios(nome, estado_id);

-- 4. Função para inserir estado
CREATE OR REPLACE FUNCTION inserir_estado(
  p_codigo_ibge VARCHAR(2),
  p_nome VARCHAR(100),
  p_sigla VARCHAR(2),
  p_regiao VARCHAR(20)
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_estado_id BIGINT;
BEGIN
  INSERT INTO ocar_estados (codigo_ibge, nome, sigla, regiao)
  VALUES (p_codigo_ibge, p_nome, p_sigla, p_regiao)
  ON CONFLICT (codigo_ibge) DO UPDATE SET
    nome = EXCLUDED.nome,
    sigla = EXCLUDED.sigla,
    regiao = EXCLUDED.regiao,
    updated_at = NOW()
  RETURNING id INTO v_estado_id;
  
  RETURN v_estado_id;
END;
$$;

-- 5. Função para inserir município
CREATE OR REPLACE FUNCTION inserir_municipio(
  p_codigo_ibge VARCHAR(7),
  p_nome VARCHAR(100),
  p_estado_codigo VARCHAR(2),
  p_latitude DECIMAL(10, 8) DEFAULT NULL,
  p_longitude DECIMAL(11, 8) DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  v_municipio_id BIGINT;
  v_estado_id BIGINT;
BEGIN
  -- Buscar ID do estado
  SELECT id INTO v_estado_id 
  FROM ocar_estados 
  WHERE codigo_ibge = p_estado_codigo;
  
  IF v_estado_id IS NULL THEN
    RAISE EXCEPTION 'Estado com código % não encontrado', p_estado_codigo;
  END IF;
  
  INSERT INTO ocar_municipios (codigo_ibge, nome, estado_id, latitude, longitude)
  VALUES (p_codigo_ibge, p_nome, v_estado_id, p_latitude, p_longitude)
  ON CONFLICT (codigo_ibge) DO UPDATE SET
    nome = EXCLUDED.nome,
    estado_id = EXCLUDED.estado_id,
    latitude = EXCLUDED.latitude,
    longitude = EXCLUDED.longitude,
    updated_at = NOW()
  RETURNING id INTO v_municipio_id;
  
  RETURN v_municipio_id;
END;
$$;

-- 6. Função para buscar municípios por estado
CREATE OR REPLACE FUNCTION buscar_municipios_por_estado(
  p_estado_sigla VARCHAR(2) DEFAULT NULL,
  p_estado_codigo VARCHAR(2) DEFAULT NULL
)
RETURNS TABLE (
  municipio_id BIGINT,
  municipio_nome VARCHAR(100),
  municipio_codigo VARCHAR(7),
  estado_nome VARCHAR(100),
  estado_sigla VARCHAR(2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as municipio_id,
    m.nome as municipio_nome,
    m.codigo_ibge as municipio_codigo,
    e.nome as estado_nome,
    e.sigla as estado_sigla,
    m.latitude,
    m.longitude
  FROM ocar_municipios m
  JOIN ocar_estados e ON e.id = m.estado_id
  WHERE 
    (p_estado_sigla IS NULL OR e.sigla = UPPER(p_estado_sigla))
    AND (p_estado_codigo IS NULL OR e.codigo_ibge = p_estado_codigo)
  ORDER BY m.nome;
END;
$$;

-- 7. Função para buscar municípios por nome (busca inteligente)
CREATE OR REPLACE FUNCTION buscar_municipios_por_nome(
  p_nome VARCHAR(100),
  p_estado_sigla VARCHAR(2) DEFAULT NULL
)
RETURNS TABLE (
  municipio_id BIGINT,
  municipio_nome VARCHAR(100),
  municipio_codigo VARCHAR(7),
  estado_nome VARCHAR(100),
  estado_sigla VARCHAR(2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8)
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id as municipio_id,
    m.nome as municipio_nome,
    m.codigo_ibge as municipio_codigo,
    e.nome as estado_nome,
    e.sigla as estado_sigla,
    m.latitude,
    m.longitude
  FROM ocar_municipios m
  JOIN ocar_estados e ON e.id = m.estado_id
  WHERE 
    LOWER(m.nome) LIKE LOWER('%' || p_nome || '%')
    AND (p_estado_sigla IS NULL OR e.sigla = UPPER(p_estado_sigla))
  ORDER BY 
    CASE 
      WHEN LOWER(m.nome) = LOWER(p_nome) THEN 1
      WHEN LOWER(m.nome) LIKE LOWER(p_nome || '%') THEN 2
      ELSE 3
    END,
    m.nome
  LIMIT 50;
END;
$$;

-- 8. Função para listar todos os estados
CREATE OR REPLACE FUNCTION listar_estados()
RETURNS TABLE (
  estado_id BIGINT,
  estado_nome VARCHAR(100),
  estado_sigla VARCHAR(2),
  estado_codigo VARCHAR(2),
  regiao VARCHAR(20),
  total_municipios BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.id as estado_id,
    e.nome as estado_nome,
    e.sigla as estado_sigla,
    e.codigo_ibge as estado_codigo,
    e.regiao,
    COUNT(m.id) as total_municipios
  FROM ocar_estados e
  LEFT JOIN ocar_municipios m ON m.estado_id = e.id
  GROUP BY e.id, e.nome, e.sigla, e.codigo_ibge, e.regiao
  ORDER BY e.nome;
END;
$$;

-- 9. Função para estatísticas gerais
CREATE OR REPLACE FUNCTION estatisticas_estados_municipios()
RETURNS TABLE (
  total_estados BIGINT,
  total_municipios BIGINT,
  estado_mais_municipios VARCHAR(100),
  max_municipios BIGINT,
  regiao_mais_municipios VARCHAR(20),
  regiao_total_municipios BIGINT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT 
      COUNT(DISTINCT e.id) as total_estados,
      COUNT(m.id) as total_municipios
    FROM ocar_estados e
    LEFT JOIN ocar_municipios m ON m.estado_id = e.id
  ),
  estado_stats AS (
    SELECT 
      e.nome as estado_nome,
      COUNT(m.id) as municipios_count
    FROM ocar_estados e
    LEFT JOIN ocar_municipios m ON m.estado_id = e.id
    GROUP BY e.id, e.nome
    ORDER BY COUNT(m.id) DESC
    LIMIT 1
  ),
  regiao_stats AS (
    SELECT 
      e.regiao,
      COUNT(m.id) as municipios_count
    FROM ocar_estados e
    LEFT JOIN ocar_municipios m ON m.estado_id = e.id
    GROUP BY e.regiao
    ORDER BY COUNT(m.id) DESC
    LIMIT 1
  )
  SELECT 
    s.total_estados,
    s.total_municipios,
    es.estado_nome,
    es.municipios_count,
    rs.regiao,
    rs.municipios_count
  FROM stats s
  CROSS JOIN estado_stats es
  CROSS JOIN regiao_stats rs;
END;
$$;

-- 10. Comentários das tabelas
COMMENT ON TABLE ocar_estados IS 'Tabela de estados brasileiros com códigos IBGE';
COMMENT ON TABLE ocar_municipios IS 'Tabela de municípios brasileiros com códigos IBGE e coordenadas';

COMMENT ON COLUMN ocar_estados.codigo_ibge IS 'Código IBGE do estado (2 dígitos)';
COMMENT ON COLUMN ocar_estados.nome IS 'Nome completo do estado';
COMMENT ON COLUMN ocar_estados.sigla IS 'Sigla do estado (ex: SP, RJ)';
COMMENT ON COLUMN ocar_estados.regiao IS 'Região do Brasil (Norte, Nordeste, etc.)';

COMMENT ON COLUMN ocar_municipios.codigo_ibge IS 'Código IBGE do município (7 dígitos)';
COMMENT ON COLUMN ocar_municipios.nome IS 'Nome do município';
COMMENT ON COLUMN ocar_municipios.estado_id IS 'ID do estado (FK)';
COMMENT ON COLUMN ocar_municipios.latitude IS 'Latitude do município';
COMMENT ON COLUMN ocar_municipios.longitude IS 'Longitude do município';

-- 11. Exemplo de uso das funções
/*
-- Inserir estado
SELECT inserir_estado('35', 'São Paulo', 'SP', 'Sudeste');

-- Inserir município
SELECT inserir_municipio('3550308', 'São Paulo', '35', -23.5505, -46.6333);

-- Buscar municípios por estado
SELECT * FROM buscar_municipios_por_estado('SP');

-- Buscar municípios por nome
SELECT * FROM buscar_municipios_por_nome('São Paulo');

-- Listar todos os estados
SELECT * FROM listar_estados();

-- Estatísticas gerais
SELECT * FROM estatisticas_estados_municipios();
*/
