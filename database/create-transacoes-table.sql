-- Criar tabela de transações/extrato
-- Execute este SQL no Supabase SQL Editor

CREATE TABLE ocar_transacoes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  valor DECIMAL(10,2) NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('deposito', 'gasto', 'estorno', 'bonus')),
  metodo_pagamento TEXT NOT NULL CHECK (metodo_pagamento IN ('pix', 'cartao', 'saldo', 'boleto', 'transferencia')),
  status TEXT NOT NULL DEFAULT 'aprovado' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'cancelado')),
  referencia_id TEXT, -- ID de referência (ex: ID do anúncio, ID do pagamento)
  observacoes TEXT,
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_posterior DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ocar_transacoes_usuario_id ON ocar_transacoes(usuario_id);
CREATE INDEX idx_ocar_transacoes_tipo ON ocar_transacoes(tipo);
CREATE INDEX idx_ocar_transacoes_status ON ocar_transacoes(status);
CREATE INDEX idx_ocar_transacoes_created_at ON ocar_transacoes(created_at DESC);

-- RLS (Row Level Security)
ALTER TABLE ocar_transacoes ENABLE ROW LEVEL SECURITY;

-- Política: usuários só podem ver suas próprias transações
CREATE POLICY "Usuários podem ver suas próprias transações" ON ocar_transacoes
  FOR SELECT USING (auth.uid() = usuario_id);

-- Política: usuários podem inserir suas próprias transações
CREATE POLICY "Usuários podem inserir suas próprias transações" ON ocar_transacoes
  FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Política: usuários podem atualizar suas próprias transações
CREATE POLICY "Usuários podem atualizar suas próprias transações" ON ocar_transacoes
  FOR UPDATE USING (auth.uid() = usuario_id);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para atualizar updated_at
CREATE TRIGGER update_ocar_transacoes_updated_at 
  BEFORE UPDATE ON ocar_transacoes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- Inserir algumas transações de exemplo (opcional)
INSERT INTO ocar_transacoes (usuario_id, valor, descricao, tipo, metodo_pagamento, saldo_anterior, saldo_posterior, referencia_id)
SELECT 
  u.id,
  100.00,
  'Depósito inicial',
  'deposito',
  'pix',
  0.00,
  100.00,
  'deposito_inicial'
FROM ocar_usuarios u
WHERE u.id = '091ef3dc-923b-467a-a4f6-a9660281494a' -- Substitua pelo ID do usuário de teste
LIMIT 1;
