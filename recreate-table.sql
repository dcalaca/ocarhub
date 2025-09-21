-- SQL para deletar e recriar a tabela ocar_transbordo
-- Execute este SQL no Supabase SQL Editor

-- 1. Deletar a tabela existente (isso remove todos os dados e a estrutura)
DROP TABLE IF EXISTS ocar_transbordo CASCADE;

-- 2. Criar a tabela novamente com a estrutura correta
CREATE TABLE ocar_transbordo (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(200) NOT NULL,
  ano INTEGER NOT NULL,
  codigo_fipe VARCHAR(20) NOT NULL,
  referencia_mes VARCHAR(7),
  preco DECIMAL(10,2),
  processado BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar índice para melhor performance
CREATE INDEX idx_ocar_transbordo_marca ON ocar_transbordo(marca);
CREATE INDEX idx_ocar_transbordo_modelo ON ocar_transbordo(modelo);
CREATE INDEX idx_ocar_transbordo_ano ON ocar_transbordo(ano);
CREATE INDEX idx_ocar_transbordo_codigo_fipe ON ocar_transbordo(codigo_fipe);

-- 4. Verificar se a tabela foi criada
SELECT COUNT(*) as total_registros FROM ocar_transbordo;
