-- Script de verificação final da organização das tabelas
-- Execute este SQL no Supabase SQL Editor após a organização

-- =====================================================
-- VERIFICAÇÃO COMPLETA DA ORGANIZAÇÃO
-- =====================================================

-- 1. VERIFICAR TODAS AS TABELAS
SELECT 
    'TABELAS' as categoria,
    table_name as nome,
    CASE 
        WHEN table_name LIKE 'ocar_%' THEN '✅ Organizada'
        ELSE '❌ NÃO ORGANIZADA'
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

-- 2. VERIFICAR ÍNDICES
SELECT 
    'ÍNDICES' as categoria,
    indexname as nome,
    tablename as tabela,
    CASE 
        WHEN indexname LIKE 'ocar_%' THEN '✅ Organizado'
        ELSE '❌ NÃO ORGANIZADO'
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

-- 3. VERIFICAR POLÍTICAS RLS
SELECT 
    'POLÍTICAS RLS' as categoria,
    policyname as nome,
    tablename as tabela,
    CASE 
        WHEN policyname LIKE 'ocar_%' THEN '✅ Organizada'
        ELSE '❌ NÃO ORGANIZADA'
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

-- 4. VERIFICAR FOREIGN KEYS
SELECT 
    'FOREIGN KEYS' as categoria,
    tc.constraint_name as nome,
    tc.table_name as tabela_origem,
    ccu.table_name as tabela_destino,
    CASE 
        WHEN tc.table_name LIKE 'ocar_%' AND ccu.table_name LIKE 'ocar_%' THEN '✅ Organizada'
        ELSE '❌ NÃO ORGANIZADA'
    END as status
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_schema = 'public'
ORDER BY 
    CASE 
        WHEN tc.table_name LIKE 'ocar_%' AND ccu.table_name LIKE 'ocar_%' THEN 0
        ELSE 1
    END,
    tc.table_name;

-- 5. RELATÓRIO FINAL
SELECT 
    'RELATÓRIO FINAL' as titulo,
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
    'Índices organizados:',
    CAST(COUNT(*) as TEXT)
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname LIKE 'ocar_%'

UNION ALL

SELECT 
    'Índices não organizados:',
    CAST(COUNT(*) as TEXT)
FROM pg_indexes 
WHERE schemaname = 'public'
AND indexname NOT LIKE 'ocar_%'

UNION ALL

SELECT 
    'Políticas RLS organizadas:',
    CAST(COUNT(*) as TEXT)
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname LIKE 'ocar_%'

UNION ALL

SELECT 
    'Políticas RLS não organizadas:',
    CAST(COUNT(*) as TEXT)
FROM pg_policies 
WHERE schemaname = 'public'
AND policyname NOT LIKE 'ocar_%';

-- 6. VERIFICAÇÃO DE INTEGRIDADE
SELECT 
    'VERIFICAÇÃO DE INTEGRIDADE' as titulo,
    '' as detalhes

UNION ALL

SELECT 
    'Tabelas com dados:',
    CAST(COUNT(*) as TEXT)
FROM information_schema.tables t
WHERE t.table_schema = 'public' 
AND t.table_type = 'BASE TABLE'
AND t.table_name LIKE 'ocar_%'
AND EXISTS (
    SELECT 1 
    FROM information_schema.columns c 
    WHERE c.table_name = t.table_name 
    AND c.table_schema = t.table_schema
);

-- 7. SUGESTÕES DE MELHORIA
SELECT 
    'SUGESTÕES' as categoria,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Todas as tabelas estão organizadas!'
        ELSE '❌ Execute o script de organização para ' || COUNT(*) || ' tabelas'
    END as sugestao
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
AND table_name NOT LIKE 'ocar_%';
