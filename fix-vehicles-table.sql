-- Corrigir estrutura da tabela ocar_vehicles
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar estrutura atual da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_vehicles' 
ORDER BY ordinal_position;

-- 2. Adicionar coluna estado se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'estado'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN estado TEXT;
        RAISE NOTICE 'Coluna estado adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna estado já existe.';
    END IF;
END $$;

-- 3. Adicionar outras colunas que podem estar faltando
DO $$
BEGIN
    -- Adicionar versao se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'versao'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN versao TEXT DEFAULT '';
        RAISE NOTICE 'Coluna versao adicionada com sucesso!';
    END IF;
    
    -- Adicionar motor se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'motor'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN motor TEXT DEFAULT '';
        RAISE NOTICE 'Coluna motor adicionada com sucesso!';
    END IF;
    
    -- Adicionar opcionais se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'opcionais'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN opcionais TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Coluna opcionais adicionada com sucesso!';
    END IF;
    
    -- Adicionar fipe se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'fipe'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN fipe DECIMAL(10,2);
        RAISE NOTICE 'Coluna fipe adicionada com sucesso!';
    END IF;
    
    -- Adicionar placa_parcial se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'placa_parcial'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN placa_parcial TEXT;
        RAISE NOTICE 'Coluna placa_parcial adicionada com sucesso!';
    END IF;
    
    -- Adicionar numero_proprietarios se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'numero_proprietarios'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN numero_proprietarios INTEGER DEFAULT 1;
        RAISE NOTICE 'Coluna numero_proprietarios adicionada com sucesso!';
    END IF;
    
    -- Adicionar observacoes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'observacoes'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN observacoes TEXT;
        RAISE NOTICE 'Coluna observacoes adicionada com sucesso!';
    END IF;
    
    -- Adicionar fotos se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'fotos'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN fotos TEXT[] DEFAULT ARRAY[]::TEXT[];
        RAISE NOTICE 'Coluna fotos adicionada com sucesso!';
    END IF;
    
    -- Adicionar verificado se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'verificado'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN verificado BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna verificado adicionada com sucesso!';
    END IF;
    
    -- Adicionar views se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'views'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN views INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna views adicionada com sucesso!';
    END IF;
    
    -- Adicionar likes se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'likes'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN likes INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna likes adicionada com sucesso!';
    END IF;
    
    -- Adicionar shares se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ocar_vehicles' 
        AND column_name = 'shares'
    ) THEN
        ALTER TABLE ocar_vehicles ADD COLUMN shares INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna shares adicionada com sucesso!';
    END IF;
END $$;

-- 4. Verificar estrutura final
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'ocar_vehicles' 
ORDER BY ordinal_position;
