-- Criar tabelas para persistir dados dos usuários

-- Tabela de veículos do usuário
CREATE TABLE IF NOT EXISTS user_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  plate VARCHAR(10) NOT NULL,
  brand VARCHAR(100),
  model VARCHAR(100),
  year INTEGER,
  color VARCHAR(50),
  chassis VARCHAR(50),
  renavam VARCHAR(20),
  vehicle_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de débitos dos veículos
CREATE TABLE IF NOT EXISTS vehicle_debts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  vehicle_id UUID REFERENCES user_vehicles(id) ON DELETE CASCADE,
  debt_type VARCHAR(20) NOT NULL, -- 'ipva', 'license', 'fine'
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'paid'
  payment_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de documentos baixados
CREATE TABLE IF NOT EXISTS downloaded_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES user_vehicles(id) ON DELETE CASCADE,
  document_type VARCHAR(50) NOT NULL, -- 'crlv', 'receipt', 'report'
  document_name VARCHAR(200) NOT NULL,
  file_path TEXT,
  metadata JSONB,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de consultas realizadas
CREATE TABLE IF NOT EXISTS vehicle_queries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  search_term VARCHAR(50) NOT NULL,
  vehicle_data JSONB,
  query_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_user_vehicles_user_id ON user_vehicles(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_debts_vehicle_id ON vehicle_debts(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_downloaded_documents_user_id ON downloaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_queries_user_id ON vehicle_queries(user_id);

-- RLS (Row Level Security) para garantir que usuários só vejam seus próprios dados
ALTER TABLE user_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE downloaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_queries ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
CREATE POLICY "Users can view own vehicles" ON user_vehicles
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own vehicle debts" ON vehicle_debts
  FOR ALL USING (auth.uid() = (SELECT user_id FROM user_vehicles WHERE id = vehicle_id));

CREATE POLICY "Users can view own documents" ON downloaded_documents
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view own queries" ON vehicle_queries
  FOR ALL USING (auth.uid() = user_id);
