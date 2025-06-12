-- Adicionar campos de telefone e outras informações de segurança na tabela de usuários
-- Isso é seguro e não afeta dados existentes

-- Criar uma tabela de perfis de usuário para armazenar informações adicionais
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  phone VARCHAR(20),
  phone_verified BOOLEAN DEFAULT FALSE,
  phone_verification_token VARCHAR(10),
  phone_verification_expires_at TIMESTAMP WITH TIME ZONE,
  cpf VARCHAR(14),
  cpf_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Adicionar constraint única para CPF (evita CPFs duplicados)
ALTER TABLE user_profiles ADD CONSTRAINT unique_cpf UNIQUE (cpf);

-- Índice adicional para CPF
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_cpf_unique ON user_profiles(cpf) WHERE cpf IS NOT NULL;

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_phone ON user_profiles(phone);
CREATE INDEX IF NOT EXISTS idx_user_profiles_cpf ON user_profiles(cpf);

-- RLS (Row Level Security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Política de segurança - usuários só podem ver/editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR ALL USING (auth.uid() = id);

-- Função para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para criar perfil automaticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
