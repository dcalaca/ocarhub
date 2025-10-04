const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function createWishlistTable() {
  try {
    console.log('🔧 Criando tabela ocar_wishlist_veiculos...')
    
    // Primeiro, vamos verificar se a tabela já existe
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_name', 'ocar_wishlist_veiculos')

    if (checkError) {
      console.log('⚠️ Não foi possível verificar tabelas existentes:', checkError.message)
    } else if (existingTables && existingTables.length > 0) {
      console.log('✅ Tabela ocar_wishlist_veiculos já existe!')
      return
    }

    // Como não podemos executar DDL via Supabase client, vamos criar um endpoint API
    console.log('📝 Criando endpoint API para criar tabela...')
    
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS ocar_wishlist_veiculos (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
            marca VARCHAR(100) NOT NULL,
            modelo VARCHAR(100),
            versao VARCHAR(100),
            ano_min INTEGER,
            ano_max INTEGER,
            preco_min DECIMAL(12,2),
            preco_max DECIMAL(12,2),
            ativo BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    })

    if (response.ok) {
      console.log('✅ Tabela ocar_wishlist_veiculos criada com sucesso!')
    } else {
      const errorText = await response.text()
      console.log('⚠️ Resposta do servidor:', response.status, errorText)
      
      // Vamos tentar criar via inserção de teste para ver se a tabela já existe
      console.log('🧪 Testando se a tabela já existe...')
      const { data: testData, error: testError } = await supabase
        .from('ocar_wishlist_veiculos')
        .select('id')
        .limit(1)

      if (testError) {
        console.log('❌ Tabela não existe e não foi possível criar:', testError.message)
        console.log('💡 Execute o SQL manualmente no painel do Supabase:')
        console.log(`
CREATE TABLE IF NOT EXISTS ocar_wishlist_veiculos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES ocar_usuarios(id) ON DELETE CASCADE,
  marca VARCHAR(100) NOT NULL,
  modelo VARCHAR(100),
  versao VARCHAR(100),
  ano_min INTEGER,
  ano_max INTEGER,
  preco_min DECIMAL(12,2),
  preco_max DECIMAL(12,2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON ocar_wishlist_veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_marca ON ocar_wishlist_veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_wishlist_ativo ON ocar_wishlist_veiculos(ativo);
CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON ocar_wishlist_veiculos(created_at);
        `)
      } else {
        console.log('✅ Tabela ocar_wishlist_veiculos já existe e está funcionando!')
      }
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createWishlistTable()
