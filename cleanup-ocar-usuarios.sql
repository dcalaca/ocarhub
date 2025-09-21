-- ========================================
-- LIMPEZA DA TABELA OCAR_USUARIOS
-- ========================================
-- Este script limpa APENAS a tabela ocar_usuarios
-- ⚠️  ATENÇÃO: Esta operação é IRREVERSÍVEL!

-- 1. Limpar tabela de usuários (dados do perfil)
DELETE FROM ocar_usuarios;

-- 2. Verificar se está vazia
SELECT 'ocar_usuarios' as tabela, COUNT(*) as registros FROM ocar_usuarios;

-- 3. Resetar sequência (se existir)
-- ALTER SEQUENCE ocar_usuarios_id_seq RESTART WITH 1;

-- 4. Verificar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_usuarios' 
ORDER BY ordinal_position;

-- 5. Verificar se há constraints
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'ocar_usuarios';

-- ========================================
-- COMENTÁRIOS
-- ========================================

-- ✅ Tabela ocar_usuarios limpa
-- ✅ Supabase Auth já foi limpo manualmente
-- ✅ Sistema pronto para novos cadastros
-- ⚠️  Esta operação é IRREVERSÍVEL
