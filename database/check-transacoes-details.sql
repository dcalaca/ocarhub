-- Verificar detalhes das transações e saldo
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a tabela de transações existe
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'ocar_transacoes';

-- 2. Se a tabela existir, verificar transações do usuário
SELECT 
    id,
    valor,
    descricao,
    tipo,
    metodo_pagamento,
    status,
    referencia_id,
    saldo_anterior,
    saldo_posterior,
    created_at
FROM ocar_transacoes 
WHERE usuario_id = '091ef3dc-923b-467a-a4f6-a9660281494a'
ORDER BY created_at DESC
LIMIT 10;

-- 3. Verificar saldo atual do usuário
SELECT 
    id, 
    nome, 
    saldo, 
    updated_at,
    created_at
FROM ocar_usuarios 
WHERE id = '091ef3dc-923b-467a-a4f6-a9660281494a';

-- 4. Verificar se há veículos criados recentemente
SELECT 
    id,
    marca,
    modelo,
    versao,
    ano,
    preco,
    plano,
    created_at
FROM ocar_vehicles 
WHERE dono_id = '091ef3dc-923b-467a-a4f6-a9660281494a'
ORDER BY created_at DESC
LIMIT 5;
