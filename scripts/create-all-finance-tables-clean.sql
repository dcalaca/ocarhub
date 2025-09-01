-- Script completo para criar todas as tabelas do FinanceHub
-- Este script remove políticas existentes antes de criar novas
-- Execute este script uma vez no Supabase SQL Editor

-- 1. Criar tabela de usuários do FinanceHub
CREATE TABLE IF NOT EXISTS public.finance_users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  birth_date DATE,
  document_number TEXT, -- CPF/CNPJ
  address JSONB,
  preferences JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de cálculos financeiros
CREATE TABLE IF NOT EXISTS public.finance_calculations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.finance_users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('juros_compostos', 'conversor_moedas', 'financiamento', 'aposentadoria', 'inflacao', 'orcamento', 'valor_presente_futuro', 'investimentos')),
  title TEXT NOT NULL,
  inputs JSONB NOT NULL,
  results JSONB NOT NULL,
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de preferências específicas do FinanceHub
CREATE TABLE IF NOT EXISTS public.finance_user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.finance_users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  notifications_enabled BOOLEAN DEFAULT true,
  email_notifications BOOLEAN DEFAULT true,
  preferred_currency TEXT DEFAULT 'BRL',
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  language TEXT DEFAULT 'pt-BR',
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  dashboard_layout JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de alertas financeiros
CREATE TABLE IF NOT EXISTS public.finance_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.finance_users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('currency_rate', 'stock_price', 'interest_rate', 'inflation', 'custom')),
  conditions JSONB NOT NULL,
  notification_type TEXT DEFAULT 'email' CHECK (notification_type IN ('email', 'push', 'both')),
  frequency TEXT DEFAULT 'daily' CHECK (frequency IN ('realtime', 'hourly', 'daily', 'weekly')),
  is_active BOOLEAN DEFAULT true,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar tabela de histórico de cotações (para o conversor)
CREATE TABLE IF NOT EXISTS public.currency_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC(15,6) NOT NULL,
  rate_date DATE DEFAULT CURRENT_DATE,
  source TEXT DEFAULT 'api',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Criar tabela de templates de cálculo
CREATE TABLE IF NOT EXISTS public.calculation_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.finance_users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  template_data JSONB NOT NULL,
  is_public BOOLEAN DEFAULT false,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_finance_calculations_user_id ON public.finance_calculations(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_calculations_type ON public.finance_calculations(type);
CREATE INDEX IF NOT EXISTS idx_finance_calculations_created_at ON public.finance_calculations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_finance_calculations_favorite ON public.finance_calculations(user_id, is_favorite) WHERE is_favorite = true;

CREATE INDEX IF NOT EXISTS idx_finance_alerts_user_id ON public.finance_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_finance_alerts_active ON public.finance_alerts(user_id, is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_currency_rates_pair ON public.currency_rates(from_currency, to_currency);
CREATE INDEX IF NOT EXISTS idx_currency_rates_date ON public.currency_rates(rate_date DESC);

-- Criar constraint única para evitar duplicatas de cotação no mesmo dia
CREATE UNIQUE INDEX IF NOT EXISTS idx_currency_rates_unique_daily 
ON public.currency_rates(from_currency, to_currency, rate_date);

-- 8. Habilitar RLS (Row Level Security)
ALTER TABLE public.finance_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calculation_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.currency_rates ENABLE ROW LEVEL SECURITY;

-- 9. Remover políticas existentes antes de criar novas
DROP POLICY IF EXISTS "finance_users_select_own" ON public.finance_users;
DROP POLICY IF EXISTS "finance_users_update_own" ON public.finance_users;
DROP POLICY IF EXISTS "finance_users_insert_own" ON public.finance_users;

DROP POLICY IF EXISTS "finance_calculations_select_own" ON public.finance_calculations;
DROP POLICY IF EXISTS "finance_calculations_insert_own" ON public.finance_calculations;
DROP POLICY IF EXISTS "finance_calculations_update_own" ON public.finance_calculations;
DROP POLICY IF EXISTS "finance_calculations_delete_own" ON public.finance_calculations;

DROP POLICY IF EXISTS "finance_preferences_select_own" ON public.finance_user_preferences;
DROP POLICY IF EXISTS "finance_preferences_insert_own" ON public.finance_user_preferences;
DROP POLICY IF EXISTS "finance_preferences_update_own" ON public.finance_user_preferences;

DROP POLICY IF EXISTS "finance_alerts_select_own" ON public.finance_alerts;
DROP POLICY IF EXISTS "finance_alerts_insert_own" ON public.finance_alerts;
DROP POLICY IF EXISTS "finance_alerts_update_own" ON public.finance_alerts;
DROP POLICY IF EXISTS "finance_alerts_delete_own" ON public.finance_alerts;

DROP POLICY IF EXISTS "templates_select_own_or_public" ON public.calculation_templates;
DROP POLICY IF EXISTS "templates_insert_own" ON public.calculation_templates;
DROP POLICY IF EXISTS "templates_update_own" ON public.calculation_templates;
DROP POLICY IF EXISTS "templates_delete_own" ON public.calculation_templates;

DROP POLICY IF EXISTS "currency_rates_select_all" ON public.currency_rates;

-- 10. Criar políticas de segurança para finance_users
CREATE POLICY "finance_users_select_own" ON public.finance_users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "finance_users_update_own" ON public.finance_users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "finance_users_insert_own" ON public.finance_users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 11. Criar políticas de segurança para finance_calculations
CREATE POLICY "finance_calculations_select_own" ON public.finance_calculations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "finance_calculations_insert_own" ON public.finance_calculations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "finance_calculations_update_own" ON public.finance_calculations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "finance_calculations_delete_own" ON public.finance_calculations
  FOR DELETE USING (auth.uid() = user_id);

-- 12. Criar políticas de segurança para finance_user_preferences
CREATE POLICY "finance_preferences_select_own" ON public.finance_user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "finance_preferences_insert_own" ON public.finance_user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "finance_preferences_update_own" ON public.finance_user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- 13. Criar políticas de segurança para finance_alerts
CREATE POLICY "finance_alerts_select_own" ON public.finance_alerts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "finance_alerts_insert_own" ON public.finance_alerts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "finance_alerts_update_own" ON public.finance_alerts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "finance_alerts_delete_own" ON public.finance_alerts
  FOR DELETE USING (auth.uid() = user_id);

-- 14. Criar políticas para calculation_templates
CREATE POLICY "templates_select_own_or_public" ON public.calculation_templates
  FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "templates_insert_own" ON public.calculation_templates
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "templates_update_own" ON public.calculation_templates
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "templates_delete_own" ON public.calculation_templates
  FOR DELETE USING (auth.uid() = user_id);

-- 15. Criar política para currency_rates (leitura pública)
CREATE POLICY "currency_rates_select_all" ON public.currency_rates
  FOR SELECT USING (true);

-- 16. Remover função e trigger existentes antes de criar novos
DROP TRIGGER IF EXISTS on_auth_finance_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_finance_user();

-- 17. Criar função para criar perfil automaticamente após signup
CREATE OR REPLACE FUNCTION public.handle_new_finance_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.finance_users (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  INSERT INTO public.finance_user_preferences (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 18. Criar trigger para executar a função após inserção de novo usuário
CREATE TRIGGER on_auth_finance_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_finance_user();

-- 19. Remover função de updated_at existente antes de criar nova
DROP FUNCTION IF EXISTS public.handle_finance_updated_at() CASCADE;

-- 20. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_finance_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 21. Criar triggers para updated_at
CREATE TRIGGER handle_updated_at_finance_users
  BEFORE UPDATE ON public.finance_users
  FOR EACH ROW EXECUTE FUNCTION public.handle_finance_updated_at();

CREATE TRIGGER handle_updated_at_finance_calculations
  BEFORE UPDATE ON public.finance_calculations
  FOR EACH ROW EXECUTE FUNCTION public.handle_finance_updated_at();

CREATE TRIGGER handle_updated_at_finance_preferences
  BEFORE UPDATE ON public.finance_user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_finance_updated_at();

CREATE TRIGGER handle_updated_at_finance_alerts
  BEFORE UPDATE ON public.finance_alerts
  FOR EACH ROW EXECUTE FUNCTION public.handle_finance_updated_at();

CREATE TRIGGER handle_updated_at_calculation_templates
  BEFORE UPDATE ON public.calculation_templates
  FOR EACH ROW EXECUTE FUNCTION public.handle_finance_updated_at();

-- 22. Inserir algumas cotações iniciais para teste
INSERT INTO public.currency_rates (from_currency, to_currency, rate, rate_date) VALUES
('USD', 'BRL', 5.85, CURRENT_DATE),
('EUR', 'BRL', 6.35, CURRENT_DATE),
('GBP', 'BRL', 7.25, CURRENT_DATE),
('BRL', 'USD', 0.171, CURRENT_DATE),
('BRL', 'EUR', 0.157, CURRENT_DATE),
('BRL', 'GBP', 0.138, CURRENT_DATE)
ON CONFLICT (from_currency, to_currency, rate_date) DO NOTHING;
