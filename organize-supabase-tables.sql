-- Script para organizar todas as tabelas do Supabase com prefixo "ocar_"
-- Execute este SQL no Supabase SQL Editor

-- =====================================================
-- 1. VERIFICAR TABELAS EXISTENTES
-- =====================================================

-- Listar todas as tabelas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- =====================================================
-- 2. RENOMEAR TABELAS QUE NÃO COMEÇAM COM "ocar_"
-- =====================================================

-- Renomear tabela 'vehicles' para 'ocar_vehicles' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicles' AND table_schema = 'public') THEN
        ALTER TABLE vehicles RENAME TO ocar_vehicles;
        RAISE NOTICE 'Tabela "vehicles" renomeada para "ocar_vehicles"';
    ELSE
        RAISE NOTICE 'Tabela "vehicles" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'users' para 'ocar_users' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users' AND table_schema = 'public') THEN
        ALTER TABLE users RENAME TO ocar_users;
        RAISE NOTICE 'Tabela "users" renomeada para "ocar_users"';
    ELSE
        RAISE NOTICE 'Tabela "users" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'favorites' para 'ocar_favorites' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'favorites' AND table_schema = 'public') THEN
        ALTER TABLE favorites RENAME TO ocar_favorites;
        RAISE NOTICE 'Tabela "favorites" renomeada para "ocar_favorites"';
    ELSE
        RAISE NOTICE 'Tabela "favorites" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'likes' para 'ocar_likes' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'likes' AND table_schema = 'public') THEN
        ALTER TABLE likes RENAME TO ocar_likes;
        RAISE NOTICE 'Tabela "likes" renomeada para "ocar_likes"';
    ELSE
        RAISE NOTICE 'Tabela "likes" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'messages' para 'ocar_messages' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'messages' AND table_schema = 'public') THEN
        ALTER TABLE messages RENAME TO ocar_messages;
        RAISE NOTICE 'Tabela "messages" renomeada para "ocar_messages"';
    ELSE
        RAISE NOTICE 'Tabela "messages" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'chats' para 'ocar_chats' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'chats' AND table_schema = 'public') THEN
        ALTER TABLE chats RENAME TO ocar_chats;
        RAISE NOTICE 'Tabela "chats" renomeada para "ocar_chats"';
    ELSE
        RAISE NOTICE 'Tabela "chats" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'transactions' para 'ocar_transactions' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'transactions' AND table_schema = 'public') THEN
        ALTER TABLE transactions RENAME TO ocar_transactions;
        RAISE NOTICE 'Tabela "transactions" renomeada para "ocar_transactions"';
    ELSE
        RAISE NOTICE 'Tabela "transactions" não encontrada';
    END IF;
END $$;

-- Renomear tabela 'vehicle_history' para 'ocar_vehicle_history' (se existir)
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehicle_history' AND table_schema = 'public') THEN
        ALTER TABLE vehicle_history RENAME TO ocar_vehicle_history;
        RAISE NOTICE 'Tabela "vehicle_history" renomeada para "ocar_vehicle_history"';
    ELSE
        RAISE NOTICE 'Tabela "vehicle_history" não encontrada';
    END IF;
END $$;

-- =====================================================
-- 3. ATUALIZAR FOREIGN KEYS E REFERÊNCIAS
-- =====================================================

-- Atualizar foreign keys que referenciam tabelas renomeadas
-- (O PostgreSQL geralmente atualiza automaticamente, mas vamos verificar)

-- =====================================================
-- 4. ATUALIZAR ÍNDICES
-- =====================================================

-- Renomear índices para manter consistência
DO $$ 
DECLARE
    idx_record RECORD;
BEGIN
    FOR idx_record IN 
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public' 
        AND indexname NOT LIKE 'ocar_%'
    LOOP
        EXECUTE 'ALTER INDEX ' || idx_record.indexname || ' RENAME TO ocar_' || idx_record.indexname;
        RAISE NOTICE 'Índice "%" renomeado para "ocar_%"', idx_record.indexname, idx_record.indexname;
    END LOOP;
END $$;

-- =====================================================
-- 5. ATUALIZAR POLÍTICAS RLS
-- =====================================================

-- Renomear políticas RLS para manter consistência
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND policyname NOT LIKE 'ocar_%'
    LOOP
        EXECUTE 'ALTER POLICY ' || policy_record.policyname || ' ON ' || policy_record.tablename || ' RENAME TO ocar_' || policy_record.policyname;
        RAISE NOTICE 'Política "%" renomeada para "ocar_%"', policy_record.policyname, policy_record.policyname;
    END LOOP;
END $$;

-- =====================================================
-- 6. VERIFICAR RESULTADO FINAL
-- =====================================================

-- Listar todas as tabelas após a organização
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN '✅ Organizada'
        ELSE '❌ Precisa organização'
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

-- =====================================================
-- 7. RELATÓRIO DE ORGANIZAÇÃO
-- =====================================================

SELECT 
    'Tabelas organizadas' as categoria,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name LIKE 'ocar_%'

UNION ALL

SELECT 
    'Tabelas não organizadas' as categoria,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%';

-- =====================================================
-- FIM DO SCRIPT DE ORGANIZAÇÃO
-- =====================================================
