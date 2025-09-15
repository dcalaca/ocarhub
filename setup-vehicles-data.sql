-- Script simples para configurar dados de veículos
-- Execute este SQL no Supabase SQL Editor

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'ocar_vehicles') THEN
        -- Criar tabela se não existir
        CREATE TABLE ocar_vehicles (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          dono_id UUID REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
          marca TEXT NOT NULL,
          modelo TEXT NOT NULL,
          versao TEXT NOT NULL,
          ano INTEGER NOT NULL,
          cor TEXT NOT NULL,
          quilometragem INTEGER NOT NULL,
          motor TEXT NOT NULL,
          combustivel TEXT[] NOT NULL,
          cambio TEXT NOT NULL,
          opcionais TEXT[],
          preco DECIMAL(10,2) NOT NULL,
          fipe DECIMAL(10,2),
          placa_parcial TEXT,
          numero_proprietarios INTEGER DEFAULT 1,
          observacoes TEXT,
          fotos TEXT[],
          plano TEXT NOT NULL CHECK (plano IN ('gratuito', 'destaque', 'premium')),
          verificado BOOLEAN DEFAULT FALSE,
          status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'pausado', 'expirado')),
          cidade TEXT NOT NULL,
          estado TEXT NOT NULL,
          views INTEGER DEFAULT 0,
          likes INTEGER DEFAULT 0,
          shares INTEGER DEFAULT 0,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Criar índices
        CREATE INDEX idx_ocar_vehicles_marca ON ocar_vehicles(marca);
        CREATE INDEX idx_ocar_vehicles_modelo ON ocar_vehicles(modelo);
        CREATE INDEX idx_ocar_vehicles_ano ON ocar_vehicles(ano);
        CREATE INDEX idx_ocar_vehicles_preco ON ocar_vehicles(preco);
        CREATE INDEX idx_ocar_vehicles_cidade ON ocar_vehicles(cidade);
        CREATE INDEX idx_ocar_vehicles_status ON ocar_vehicles(status);
        CREATE INDEX idx_ocar_vehicles_dono_id ON ocar_vehicles(dono_id);
        CREATE INDEX idx_ocar_vehicles_plano ON ocar_vehicles(plano);
        
        -- Desabilitar RLS temporariamente
        ALTER TABLE ocar_vehicles DISABLE ROW LEVEL SECURITY;
        
        RAISE NOTICE 'Tabela ocar_vehicles criada com sucesso!';
    ELSE
        RAISE NOTICE 'Tabela ocar_vehicles já existe.';
    END IF;
END $$;

-- 2. Verificar se já existem dados de teste
DO $$
DECLARE
    test_data_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO test_data_count 
    FROM ocar_vehicles 
    WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001';
    
    IF test_data_count = 0 THEN
        -- Inserir dados de teste
        INSERT INTO ocar_vehicles (
          dono_id, marca, modelo, versao, ano, cor, quilometragem, motor, 
          combustivel, cambio, opcionais, preco, fipe, placa_parcial, 
          numero_proprietarios, observacoes, fotos, plano, verificado, 
          status, cidade, estado, views, likes, shares
        ) VALUES 
        (
          '550e8400-e29b-41d4-a716-446655440001',
          'Toyota',
          'Corolla',
          'XEI',
          2022,
          'Prata',
          25000,
          '2.0 Flex',
          ARRAY['Flex'],
          'Automático',
          ARRAY['Ar Condicionado', 'Direção Hidráulica', 'Vidros Elétricos', 'Airbag'],
          95000.00,
          98000.00,
          'ABC-1D34',
          1,
          'Corolla XEI 2022 em excelente estado, único dono, todas as revisões em dia.',
          ARRAY['/placeholder.svg?height=200&width=300'],
          'destaque',
          true,
          'ativo',
          'São Paulo',
          'SP',
          1250,
          23,
          5
        ),
        (
          '550e8400-e29b-41d4-a716-446655440001',
          'Honda',
          'Civic',
          'LX',
          2021,
          'Branco',
          35000,
          '1.5 Turbo',
          ARRAY['Flex'],
          'Manual',
          ARRAY['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos'],
          85000.00,
          87000.00,
          'DEF-2E45',
          2,
          'Civic LX 2021, segundo dono, bem conservado.',
          ARRAY['/placeholder.svg?height=200&width=300'],
          'gratuito',
          false,
          'pausado',
          'São Paulo',
          'SP',
          680,
          12,
          2
        ),
        (
          '550e8400-e29b-41d4-a716-446655440001',
          'Volkswagen',
          'Jetta',
          'Comfortline',
          2020,
          'Preto',
          45000,
          '1.4 TSI',
          ARRAY['Flex'],
          'Automático',
          ARRAY['Ar Condicionado', 'Direção Elétrica', 'Vidros Elétricos', 'Teto Solar'],
          75000.00,
          78000.00,
          'GHI-3F56',
          1,
          'Jetta Comfortline 2020, muito bem cuidado.',
          ARRAY['/placeholder.svg?height=200&width=300'],
          'gratuito',
          false,
          'expirado',
          'São Paulo',
          'SP',
          420,
          5,
          1
        );
        
        RAISE NOTICE 'Dados de teste inseridos com sucesso!';
    ELSE
        RAISE NOTICE 'Dados de teste já existem (% registros).', test_data_count;
    END IF;
END $$;

-- 3. Verificar resultado final
SELECT 
    'Total de veículos' as info,
    COUNT(*) as quantidade
FROM ocar_vehicles
UNION ALL
SELECT 
    'Veículos do usuário teste' as info,
    COUNT(*) as quantidade
FROM ocar_vehicles 
WHERE dono_id = '550e8400-e29b-41d4-a716-446655440001';
