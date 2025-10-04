-- Criar tabela para lista de desejos de veículos
CREATE TABLE IF NOT EXISTS wishlist_veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100),
  versao VARCHAR(100),
  ano_min INTEGER,
  ano_max INTEGER,
  preco_min DECIMAL(12,2),
  preco_max DECIMAL(12,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_marca ON wishlist_veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_wishlist_ativo ON wishlist_veiculos(ativo);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist_veiculos(created_at);

-- Criar trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_wishlist_updated_at
  BEFORE UPDATE ON wishlist_veiculos
  FOR EACH ROW
  EXECUTE FUNCTION update_wishlist_updated_at();

-- Comentários para documentação
COMMENT ON TABLE wishlist_veiculos IS 'Lista de desejos de veículos dos usuários';
COMMENT ON COLUMN wishlist_veiculos.user_id IS 'ID do usuário proprietário da lista';
COMMENT ON COLUMN wishlist_veiculos.marca IS 'Marca do veículo (obrigatório)';
COMMENT ON COLUMN wishlist_veiculos.modelo IS 'Modelo do veículo (opcional)';
COMMENT ON COLUMN wishlist_veiculos.versao IS 'Versão do veículo (opcional)';
COMMENT ON COLUMN wishlist_veiculos.ano_min IS 'Ano mínimo do veículo (opcional)';
COMMENT ON COLUMN wishlist_veiculos.ano_max IS 'Ano máximo do veículo (opcional)';
COMMENT ON COLUMN wishlist_veiculos.preco_min IS 'Preço mínimo do veículo (opcional)';
COMMENT ON COLUMN wishlist_veiculos.preco_max IS 'Preço máximo do veículo (opcional)';
COMMENT ON COLUMN wishlist_veiculos.ativo IS 'Se o alerta está ativo';
