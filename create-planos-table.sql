-- Criar tabela de planos no Supabase
-- Execute este SQL no Supabase SQL Editor ANTES de executar insert-anuncio-plans.sql

-- Tabela de planos
CREATE TABLE ocar_planos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('anuncio', 'consulta')),
  preco DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  descricao TEXT NOT NULL,
  beneficios TEXT[] NOT NULL DEFAULT '{}',
  limite_anuncios INTEGER NOT NULL DEFAULT 0,
  limite_consultas INTEGER NOT NULL DEFAULT 0,
  duracao_dias INTEGER NULL, -- NULL indica vitalício
  destaque BOOLEAN NOT NULL DEFAULT false,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ocar_planos_tipo ON ocar_planos(tipo);
CREATE INDEX idx_ocar_planos_ativo ON ocar_planos(ativo);
CREATE INDEX idx_ocar_planos_preco ON ocar_planos(preco);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_planos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ocar_planos_updated_at
    BEFORE UPDATE ON ocar_planos
    FOR EACH ROW
    EXECUTE FUNCTION update_planos_updated_at();

-- Comentários para documentação
COMMENT ON TABLE ocar_planos IS 'Tabela de planos de anúncios e consultas';
COMMENT ON COLUMN ocar_planos.tipo IS 'Tipo do plano: anuncio ou consulta';
COMMENT ON COLUMN ocar_planos.duracao_dias IS 'Duração em dias, NULL indica vitalício';
COMMENT ON COLUMN ocar_planos.limite_anuncios IS 'Limite de anúncios (0 = ilimitado)';
COMMENT ON COLUMN ocar_planos.limite_consultas IS 'Limite de consultas (0 = ilimitado)';
COMMENT ON COLUMN ocar_planos.beneficios IS 'Array de benefícios do plano';
COMMENT ON COLUMN ocar_planos.destaque IS 'Se o plano tem destaque especial';
COMMENT ON COLUMN ocar_planos.ativo IS 'Se o plano está ativo e disponível';
