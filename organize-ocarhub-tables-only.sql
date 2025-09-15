-- Script SEGURO para organizar APENAS as tabelas do OcarHub
-- Este script NÃO mexe em tabelas de outros projetos
-- Execute este SQL no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR TABELAS EXISTENTES DO OCARHUB
-- =====================================================

-- Listar apenas tabelas que podem ser do OcarHub
SELECT 
    table_name as tabela_atual,
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN '✅ Já organizada'
        WHEN table_name IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history') THEN '⚠️ Pode ser do OcarHub'
        ELSE '❌ Não é do OcarHub'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN 0
        WHEN table_name IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history') THEN 1
        ELSE 2
    END,
    table_name;

-- =====================================================
-- 2. RENOMEAR APENAS TABELAS DO OCARHUB (SE EXISTIREM)
-- =====================================================

-- Renomear 'users' para 'ocar_usuarios' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND table_schema = 'public'
            AND column_name IN ('tipo_usuario', 'cpf', 'telefone', 'endereco')
        ) THEN
            ALTER TABLE users RENAME TO ocar_usuarios;
            RAISE NOTICE '✅ Tabela "users" do OcarHub renomeada para "ocar_usuarios"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "users" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "users" não encontrada';
    END IF;
END $$;

-- Renomear 'vehicles' para 'ocar_vehicles' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vehicles' 
            AND table_schema = 'public'
            AND column_name IN ('marca', 'modelo', 'dono_id', 'plano')
        ) THEN
            ALTER TABLE vehicles RENAME TO ocar_vehicles;
            RAISE NOTICE '✅ Tabela "vehicles" do OcarHub renomeada para "ocar_vehicles"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "vehicles" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "vehicles" não encontrada';
    END IF;
END $$;

-- Renomear 'favorites' para 'ocar_favorites' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'favorites' 
            AND table_schema = 'public'
            AND column_name IN ('user_id', 'vehicle_id')
        ) THEN
            ALTER TABLE favorites RENAME TO ocar_favorites;
            RAISE NOTICE '✅ Tabela "favorites" do OcarHub renomeada para "ocar_favorites"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "favorites" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "favorites" não encontrada';
    END IF;
END $$;

-- Renomear 'likes' para 'ocar_likes' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'likes' 
            AND table_schema = 'public'
            AND column_name IN ('user_id', 'vehicle_id')
        ) THEN
            ALTER TABLE likes RENAME TO ocar_likes;
            RAISE NOTICE '✅ Tabela "likes" do OcarHub renomeada para "ocar_likes"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "likes" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "likes" não encontrada';
    END IF;
END $$;

-- Renomear 'messages' para 'ocar_messages' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'messages' 
            AND table_schema = 'public'
            AND column_name IN ('sender_id', 'receiver_id', 'vehicle_id', 'content')
        ) THEN
            ALTER TABLE messages RENAME TO ocar_messages;
            RAISE NOTICE '✅ Tabela "messages" do OcarHub renomeada para "ocar_messages"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "messages" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "messages" não encontrada';
    END IF;
END $$;

-- Renomear 'chats' para 'ocar_chats' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'chats' 
            AND table_schema = 'public'
            AND column_name IN ('participant1', 'participant2', 'vehicle_id')
        ) THEN
            ALTER TABLE chats RENAME TO ocar_chats;
            RAISE NOTICE '✅ Tabela "chats" do OcarHub renomeada para "ocar_chats"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "chats" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "chats" não encontrada';
    END IF;
END $$;

-- Renomear 'transactions' para 'ocar_transactions' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'transactions' 
            AND table_schema = 'public'
            AND column_name IN ('user_id', 'type', 'amount', 'status')
        ) THEN
            ALTER TABLE transactions RENAME TO ocar_transactions;
            RAISE NOTICE '✅ Tabela "transactions" do OcarHub renomeada para "ocar_transactions"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "transactions" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "transactions" não encontrada';
    END IF;
END $$;

-- Renomear 'vehicle_history' para 'ocar_vehicle_history' (APENAS se existir e for do OcarHub)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicle_history' AND table_schema = 'public') THEN
        -- Verificar se tem as colunas típicas do OcarHub
        IF EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'vehicle_history' 
            AND table_schema = 'public'
            AND column_name IN ('placa', 'status', 'score', 'resumo')
        ) THEN
            ALTER TABLE vehicle_history RENAME TO ocar_vehicle_history;
            RAISE NOTICE '✅ Tabela "vehicle_history" do OcarHub renomeada para "ocar_vehicle_history"';
        ELSE
            RAISE NOTICE '⚠️ Tabela "vehicle_history" existe mas não parece ser do OcarHub - IGNORADA';
        END IF;
    ELSE
        RAISE NOTICE 'ℹ️ Tabela "vehicle_history" não encontrada';
    END IF;
END $$;

-- =====================================================
-- 3. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Listar todas as tabelas após a organização
SELECT 
    'RESULTADO FINAL' as titulo,
    '' as detalhes

UNION ALL

SELECT 
    'Tabelas do OcarHub organizadas:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name LIKE 'ocar_%'

UNION ALL

SELECT 
    'Tabelas de outros projetos (não alteradas):',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%'
AND table_name NOT IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history');

-- =====================================================
-- 4. LISTAR TABELAS FINAIS
-- =====================================================

SELECT 
    table_name as tabela,
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN '✅ OcarHub (Organizada)'
        ELSE '🔒 Outro Projeto (Preservada)'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY 
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN 0
        ELSE 1
    END,
    table_name;
