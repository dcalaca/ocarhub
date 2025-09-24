-- Verificar se a tabela de transações existe e tem dados
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a tabela existe
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_name = 'ocar_transacoes';

-- 2. Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'ocar_transacoes'
ORDER BY ordinal_position;

-- 3. Verificar se há transações para o usuário
SELECT * FROM ocar_transacoes 
WHERE usuario_id = '091ef3dc-923b-467a-a4f6-a9660281494a'
ORDER BY created_at DESC;

-- 4. Verificar saldo atual do usuário
SELECT id, nome, saldo, updated_at 
FROM ocar_usuarios 
WHERE id = '091ef3dc-923b-467a-a4f6-a9660281494a';
