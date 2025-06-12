-- Criar tabelas para o sistema de carteira real

-- Tabela de carteiras dos usuários
CREATE TABLE IF NOT EXISTS user_wallets (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  balance DECIMAL(10,2) DEFAULT 0.00,
  total_received DECIMAL(10,2) DEFAULT 0.00,
  total_spent DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'purchase', 'refund', 'withdrawal')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method VARCHAR(20) CHECK (payment_method IN ('pix', 'credit_card', 'boleto')),
  external_payment_id VARCHAR(100), -- ID do pagamento no Mercado Pago/PagSeguro
  metadata JSONB, -- Dados extras (QR code, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_external_payment_id ON transactions(external_payment_id);

-- Habilitar RLS
ALTER TABLE user_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own wallet" ON user_wallets
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR ALL USING (auth.uid() = user_id);

-- Função para atualizar saldo automaticamente
CREATE OR REPLACE FUNCTION update_wallet_balance()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualizar saldo quando transação for completada
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    INSERT INTO user_wallets (user_id, balance, total_received, total_spent)
    VALUES (NEW.user_id, 0, 0, 0)
    ON CONFLICT (user_id) DO NOTHING;
    
    IF NEW.type IN ('deposit', 'refund') THEN
      UPDATE user_wallets 
      SET 
        balance = balance + NEW.amount,
        total_received = total_received + NEW.amount,
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    ELSIF NEW.type IN ('purchase', 'withdrawal') THEN
      UPDATE user_wallets 
      SET 
        balance = balance - ABS(NEW.amount),
        total_spent = total_spent + ABS(NEW.amount),
        updated_at = NOW()
      WHERE user_id = NEW.user_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar saldo automaticamente
DROP TRIGGER IF EXISTS trigger_update_wallet_balance ON transactions;
CREATE TRIGGER trigger_update_wallet_balance
  AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_wallet_balance();

-- Verificação
SELECT 'Tabelas de carteira criadas com sucesso!' as resultado;
