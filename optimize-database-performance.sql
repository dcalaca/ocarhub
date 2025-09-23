-- Script para otimizar performance do banco de dados
-- Execute este SQL no Supabase SQL Editor

-- 1. Índices compostos para consultas frequentes
CREATE INDEX IF NOT EXISTS idx_vehicles_status_plano_created_at 
ON ocar_vehicles(status, plano, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_vehicles_marca_modelo_ano 
ON ocar_vehicles(marca, modelo, ano);

CREATE INDEX IF NOT EXISTS idx_vehicles_preco_range 
ON ocar_vehicles(preco) WHERE status = 'ativo';

CREATE INDEX IF NOT EXISTS idx_vehicles_cidade_status 
ON ocar_vehicles(cidade, status) WHERE status = 'ativo';

-- 2. Índices para filtros de busca
CREATE INDEX IF NOT EXISTS idx_vehicles_combustivel 
ON ocar_vehicles USING GIN(combustivel) WHERE status = 'ativo';

CREATE INDEX IF NOT EXISTS idx_vehicles_opcionais 
ON ocar_vehicles USING GIN(opcionais) WHERE status = 'ativo';

-- 3. Índices para planos
CREATE INDEX IF NOT EXISTS idx_planos_tipo_ativo_preco 
ON ocar_planos(tipo, ativo, preco);

-- 4. Índices para usuários
CREATE INDEX IF NOT EXISTS idx_usuarios_verificado_ativo 
ON ocar_usuarios(verificado, ativo) WHERE ativo = true;

-- 5. Estatísticas atualizadas
ANALYZE ocar_vehicles;
ANALYZE ocar_planos;
ANALYZE ocar_usuarios;

-- 6. Configurações de performance
-- Aumentar work_mem para consultas complexas (apenas para sessão atual)
SET work_mem = '256MB';

-- Configurar effective_cache_size (ajustar conforme disponível)
SET effective_cache_size = '1GB';

-- 7. Comentários para documentação
COMMENT ON INDEX idx_vehicles_status_plano_created_at IS 'Índice para listagem otimizada de veículos por status, plano e data';
COMMENT ON INDEX idx_vehicles_marca_modelo_ano IS 'Índice para busca por marca, modelo e ano';
COMMENT ON INDEX idx_vehicles_preco_range IS 'Índice para filtros de preço em veículos ativos';
COMMENT ON INDEX idx_vehicles_cidade_status IS 'Índice para busca por cidade em veículos ativos';
COMMENT ON INDEX idx_vehicles_combustivel IS 'Índice GIN para busca em array de combustível';
COMMENT ON INDEX idx_vehicles_opcionais IS 'Índice GIN para busca em array de opcionais';
COMMENT ON INDEX idx_planos_tipo_ativo_preco IS 'Índice para busca de planos por tipo, status e preço';
COMMENT ON INDEX idx_usuarios_verificado_ativo IS 'Índice para usuários verificados e ativos';
