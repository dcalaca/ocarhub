-- ============================================
-- MIGRAR USUÁRIOS EXISTENTES PARA user_profiles
-- Execute este código no SQL Editor do Supabase
-- ============================================

-- Inserir perfis para usuários que ainda não têm
INSERT INTO public.user_profiles (id, full_name, phone, cpf, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  COALESCE(au.raw_user_meta_data->>'phone', '') as phone,
  COALESCE(au.raw_user_meta_data->>'cpf', '') as cpf,
  au.created_at,
  NOW()
FROM auth.users au
LEFT JOIN user_profiles up ON au.id = up.id
WHERE up.id IS NULL;

-- Verificar resultado
SELECT 
  'Migração concluída! Total de perfis:' as status,
  COUNT(*) as total_perfis
FROM user_profiles;
