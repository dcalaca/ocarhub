-- ============================================
-- CORRIGIR TRIGGER PARA SALVAR TELEFONE E CPF
-- Execute este código no SQL Editor do Supabase
-- ============================================

-- 1. Verificar se a função está funcionando corretamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Log para debug
  RAISE LOG 'Trigger executado para usuário: %', NEW.id;
  RAISE LOG 'Dados recebidos: %', NEW.raw_user_meta_data;
  
  -- Inserir dados na tabela user_profiles
  INSERT INTO public.user_profiles (
    id, 
    full_name, 
    phone, 
    cpf,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'cpf', ''),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', user_profiles.full_name),
    phone = COALESCE(NEW.raw_user_meta_data->>'phone', user_profiles.phone),
    cpf = COALESCE(NEW.raw_user_meta_data->>'cpf', user_profiles.cpf),
    updated_at = NOW();
    
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Recriar o trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Verificar dados existentes na tabela user_profiles
SELECT 
  up.id,
  up.full_name,
  up.phone,
  up.cpf,
  au.email,
  au.raw_user_meta_data
FROM user_profiles up
RIGHT JOIN auth.users au ON up.id = au.id
ORDER BY au.created_at DESC;
