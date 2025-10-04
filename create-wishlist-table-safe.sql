-- Script seguro para criar tabela de lista de desejos
-- Este script pode ser executado múltiplas vezes sem erros

-- Criar tabela para lista de desejos de veículos
CREATE TABLE IF NOT EXISTS ocar_wishlist_veiculos (
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

-- Criar índices para melhor performance (IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_user_id ON ocar_wishlist_veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_marca ON ocar_wishlist_veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_ativo ON ocar_wishlist_veiculos(ativo);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_created_at ON ocar_wishlist_veiculos(created_at);

-- Criar função para atualizar updated_at (CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION update_ocar_wishlist_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Remover trigger existente se houver e criar novo
DROP TRIGGER IF EXISTS trigger_update_ocar_wishlist_updated_at ON ocar_wishlist_veiculos;
CREATE TRIGGER trigger_update_ocar_wishlist_updated_at
  BEFORE UPDATE ON ocar_wishlist_veiculos
  FOR EACH ROW
  EXECUTE FUNCTION update_ocar_wishlist_updated_at();

-- Comentários para documentação
COMMENT ON TABLE ocar_wishlist_veiculos IS 'Lista de desejos de veículos dos usuários';
COMMENT ON COLUMN ocar_wishlist_veiculos.user_id IS 'ID do usuário proprietário da lista';
COMMENT ON COLUMN ocar_wishlist_veiculos.marca IS 'Marca do veículo (obrigatório)';
COMMENT ON COLUMN ocar_wishlist_veiculos.modelo IS 'Modelo do veículo (opcional)';
COMMENT ON COLUMN ocar_wishlist_veiculos.versao IS 'Versão do veículo (opcional)';
COMMENT ON COLUMN ocar_wishlist_veiculos.ano_min IS 'Ano mínimo do veículo (opcional)';
COMMENT ON COLUMN ocar_wishlist_veiculos.ano_max IS 'Ano máximo do veículo (opcional)';
COMMENT ON COLUMN ocar_wishlist_veiculos.preco_min IS 'Preço mínimo do veículo (opcional)';
COMMENT ON COLUMN ocar_wishlist_veiculos.preco_max IS 'Preço máximo do veículo (opcional)';
COMMENT ON COLUMN ocar_wishlist_veiculos.ativo IS 'Se o alerta está ativo';

-- Verificar se a tabela foi criada com sucesso
SELECT 'Tabela ocar_wishlist_veiculos criada com sucesso!' as status;
