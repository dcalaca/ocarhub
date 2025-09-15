-- Script SIMPLES para verificar APENAS as tabelas do OcarHub
-- Execute este SQL no Supabase SQL Editor

-- =====================================================
-- VERIFICAR TABELAS DO OCARHUB
-- =====================================================

-- 1. Listar tabelas que JÁ estão organizadas (com prefixo ocar_)
SELECT 
    'TABELAS OCARHUB ORGANIZADAS' as categoria,
    table_name as tabela,
    '✅ Já organizada' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name LIKE 'ocar_%'
ORDER BY table_name;

-- 2. Listar tabelas que PODEM ser do OcarHub (sem prefixo ocar_)
SELECT 
    'TABELAS QUE PODEM SER DO OCARHUB' as categoria,
    table_name as tabela,
    CASE 
        WHEN table_name = 'users' THEN '⚠️ Pode ser ocar_usuarios'
        WHEN table_name = 'vehicles' THEN '⚠️ Pode ser ocar_vehicles'
        WHEN table_name = 'favorites' THEN '⚠️ Pode ser ocar_favorites'
        WHEN table_name = 'likes' THEN '⚠️ Pode ser ocar_likes'
        WHEN table_name = 'messages' THEN '⚠️ Pode ser ocar_messages'
        WHEN table_name = 'chats' THEN '⚠️ Pode ser ocar_chats'
        WHEN table_name = 'transactions' THEN '⚠️ Pode ser ocar_transactions'
        WHEN table_name = 'vehicle_history' THEN '⚠️ Pode ser ocar_vehicle_history'
        ELSE '❓ Nome não reconhecido'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%'
AND table_name IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history')
ORDER BY table_name;

-- 3. Listar tabelas de OUTROS PROJETOS (não serão alteradas)
SELECT 
    'TABELAS DE OUTROS PROJETOS' as categoria,
    table_name as tabela,
    '🔒 Preservada (não será alterada)' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%'
AND table_name NOT IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history')
ORDER BY table_name;

-- =====================================================
-- VERIFICAR ESTRUTURA DAS TABELAS SUSPEITAS (SEM LOOPS)
-- =====================================================

-- Verificar colunas da tabela 'users' (se existir)
SELECT 
    'ESTRUTURA DA TABELA "users"' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela 'vehicles' (se existir)
SELECT 
    'ESTRUTURA DA TABELA "vehicles"' as info,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'vehicles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO DA VERIFICAÇÃO' as titulo,
    '' as detalhes

UNION ALL

SELECT 
    'Tabelas OcarHub organizadas:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name LIKE 'ocar_%'

UNION ALL

SELECT 
    'Tabelas que podem ser do OcarHub:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%'
AND table_name IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history')

UNION ALL

SELECT 
    'Tabelas de outros projetos:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%'
AND table_name NOT IN ('users', 'vehicles', 'favorites', 'likes', 'messages', 'chats', 'transactions', 'vehicle_history')

UNION ALL

SELECT 
    'Total de tabelas:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
