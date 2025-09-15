-- Script para verificar quais tabelas precisam ser organizadas
-- Execute este SQL no Supabase SQL Editor

-- =====================================================
-- VERIFICAR TABELAS EXISTENTES
-- =====================================================

-- Listar todas as tabelas do schema public
SELECT 
    table_name,
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN '✅ Já organizada'
        ELSE '❌ Precisa organização'
    END as status,
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN 'Verde'
        ELSE 'Vermelho'
    END as cor
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
-- CONTAR TABELAS POR STATUS
-- =====================================================

SELECT 
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN 'Organizadas'
        ELSE 'Não organizadas'
    END as categoria,
    COUNT(*) as quantidade
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
GROUP BY 
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN 'Organizadas'
        ELSE 'Não organizadas'
    END
ORDER BY categoria;

-- =====================================================
-- VERIFICAR FOREIGN KEYS
-- =====================================================

-- Listar foreign keys que podem precisar de atualização
SELECT 
    tc.table_name as tabela_origem,
    kcu.column_name as coluna_origem,
    ccu.table_name as tabela_destino,
    ccu.column_name as coluna_destino,
    tc.constraint_name as nome_constraint
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY tc.table_name;

-- =====================================================
-- VERIFICAR ÍNDICES
-- =====================================================

-- Listar índices que podem precisar de renomeação
SELECT 
    indexname as nome_indice,
    tablename as tabela,
    CASE 
        WHEN indexname LIKE 'ocar_%' THEN '✅ Organizado'
        ELSE '❌ Precisa organização'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY 
    CASE 
        WHEN indexname LIKE 'ocar_%' THEN 0
        ELSE 1
    END,
    tablename,
    indexname;

-- =====================================================
-- VERIFICAR POLÍTICAS RLS
-- =====================================================

-- Listar políticas RLS que podem precisar de renomeação
SELECT 
    tablename as tabela,
    policyname as nome_politica,
    CASE 
        WHEN policyname LIKE 'ocar_%' THEN '✅ Organizada'
        ELSE '❌ Precisa organização'
    END as status
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY 
    CASE 
        WHEN policyname LIKE 'ocar_%' THEN 0
        ELSE 1
    END,
    tablename,
    policyname;

-- =====================================================
-- RESUMO FINAL
-- =====================================================

SELECT 
    'RESUMO DA ORGANIZAÇÃO' as titulo,
    '' as detalhes

UNION ALL

SELECT 
    'Tabelas organizadas:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name LIKE 'ocar_%'

UNION ALL

SELECT 
    'Tabelas não organizadas:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%'

UNION ALL

SELECT 
    'Total de tabelas:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE';
