-- Tabelas adicionais para a plataforma Ocar
-- Execute este SQL no Supabase SQL Editor após criar a tabela ocar_usuarios

-- Tabela de veículos
CREATE TABLE ocar_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dono_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  marca TEXT NOT NULL,
  modelo TEXT NOT NULL,
  versao TEXT NOT NULL,
  ano INTEGER NOT NULL,
  cor TEXT NOT NULL,
  quilometragem INTEGER NOT NULL,
  motor TEXT NOT NULL,
  combustivel TEXT[] NOT NULL,
  cambio TEXT NOT NULL,
  opcionais TEXT[],
  preco DECIMAL(10,2) NOT NULL,
  fipe DECIMAL(10,2),
  placa_parcial TEXT,
  numero_proprietarios INTEGER DEFAULT 1,
  observacoes TEXT,
  fotos TEXT[],
  plano TEXT NOT NULL CHECK (plano IN ('gratuito', 'destaque')),
  verificado BOOLEAN DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'expirado')),
  cidade TEXT NOT NULL,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de favoritos
CREATE TABLE ocar_favorites (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES ocar_vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

-- Tabela de curtidas
CREATE TABLE ocar_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES ocar_vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vehicle_id)
);

-- Tabela de mensagens
CREATE TABLE ocar_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  sender_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  receiver_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES ocar_vehicles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de transações
CREATE TABLE ocar_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  payment_method TEXT,
  payment_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de histórico veicular
CREATE TABLE ocar_vehicle_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  placa TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('clean', 'issues', 'severe')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  resumo TEXT NOT NULL,
  acidentes INTEGER DEFAULT 0,
  multas INTEGER DEFAULT 0,
  leiloes BOOLEAN DEFAULT FALSE,
  roubo_furto BOOLEAN DEFAULT FALSE,
  proprietarios INTEGER DEFAULT 1,
  recomendacao TEXT,
  valor_fipe DECIMAL(10,2),
  valor_mercado DECIMAL(10,2),
  variacao DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_ocar_vehicles_marca ON ocar_vehicles(marca);
CREATE INDEX idx_ocar_vehicles_modelo ON ocar_vehicles(modelo);
CREATE INDEX idx_ocar_vehicles_ano ON ocar_vehicles(ano);
CREATE INDEX idx_ocar_vehicles_preco ON ocar_vehicles(preco);
CREATE INDEX idx_ocar_vehicles_cidade ON ocar_vehicles(cidade);
CREATE INDEX idx_ocar_vehicles_status ON ocar_vehicles(status);
CREATE INDEX idx_ocar_vehicles_dono_id ON ocar_vehicles(dono_id);

CREATE INDEX idx_ocar_favorites_user_id ON ocar_favorites(user_id);
CREATE INDEX idx_ocar_favorites_vehicle_id ON ocar_favorites(vehicle_id);

CREATE INDEX idx_ocar_likes_user_id ON ocar_likes(user_id);
CREATE INDEX idx_ocar_likes_vehicle_id ON ocar_likes(vehicle_id);

CREATE INDEX idx_ocar_messages_sender_id ON ocar_messages(sender_id);
CREATE INDEX idx_ocar_messages_receiver_id ON ocar_messages(receiver_id);
CREATE INDEX idx_ocar_messages_vehicle_id ON ocar_messages(vehicle_id);

CREATE INDEX idx_ocar_transactions_user_id ON ocar_transactions(user_id);
CREATE INDEX idx_ocar_transactions_status ON ocar_transactions(status);

-- RLS (Row Level Security) Policies
ALTER TABLE ocar_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ocar_vehicle_history ENABLE ROW LEVEL SECURITY;

-- Políticas para veículos
CREATE POLICY "Anyone can view active vehicles" ON ocar_vehicles
  FOR SELECT USING (status = 'ativo');

CREATE POLICY "Users can view their own vehicles" ON ocar_vehicles
  FOR SELECT USING (auth.uid() = dono_id);

CREATE POLICY "Users can insert their own vehicles" ON ocar_vehicles
  FOR INSERT WITH CHECK (auth.uid() = dono_id);

CREATE POLICY "Users can update their own vehicles" ON ocar_vehicles
  FOR UPDATE USING (auth.uid() = dono_id);

CREATE POLICY "Users can delete their own vehicles" ON ocar_vehicles
  FOR DELETE USING (auth.uid() = dono_id);

-- Políticas para favoritos
CREATE POLICY "Users can manage their own favorites" ON ocar_favorites
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para curtidas
CREATE POLICY "Users can manage their own likes" ON ocar_likes
  FOR ALL USING (auth.uid() = user_id);

-- Políticas para mensagens
CREATE POLICY "Users can view their own messages" ON ocar_messages
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can send messages" ON ocar_messages
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Políticas para transações
CREATE POLICY "Users can view their own transactions" ON ocar_transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Políticas para histórico veicular (público para leitura)
CREATE POLICY "Anyone can view vehicle history" ON ocar_vehicle_history
  FOR SELECT USING (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_ocar_vehicles_updated_at BEFORE UPDATE ON ocar_vehicles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocar_transactions_updated_at BEFORE UPDATE ON ocar_transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ocar_vehicle_history_updated_at BEFORE UPDATE ON ocar_vehicle_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_views(vehicle_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE ocar_vehicles 
    SET views = views + 1 
    WHERE id = vehicle_id;
END;
$$ LANGUAGE plpgsql;
