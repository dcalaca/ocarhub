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
    console.log('🔧 Criando tabela wishlist_veiculos...')
    
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `
        -- Criar tabela para lista de desejos de veículos
        CREATE TABLE IF NOT EXISTS wishlist_veiculos (
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

        -- Criar índices para melhor performance
        CREATE INDEX IF NOT EXISTS idx_wishlist_user_id ON wishlist_veiculos(user_id);
        CREATE INDEX IF NOT EXISTS idx_wishlist_marca ON wishlist_veiculos(marca);
        CREATE INDEX IF NOT EXISTS idx_wishlist_ativo ON wishlist_veiculos(ativo);
        CREATE INDEX IF NOT EXISTS idx_wishlist_created_at ON wishlist_veiculos(created_at);

        -- Criar trigger para atualizar updated_at
        CREATE OR REPLACE FUNCTION update_wishlist_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        CREATE TRIGGER trigger_update_wishlist_updated_at
          BEFORE UPDATE ON wishlist_veiculos
          FOR EACH ROW
          EXECUTE FUNCTION update_wishlist_updated_at();
      `
    })

    if (error) {
      console.error('❌ Erro ao criar tabela:', error)
      return
    }

    console.log('✅ Tabela wishlist_veiculos criada com sucesso!')
    
    // Testar inserção
    console.log('🧪 Testando inserção...')
    const { data: testData, error: testError } = await supabase
      .from('wishlist_veiculos')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // UUID de teste
        marca: 'Teste',
        modelo: 'Teste Modelo',
        ativo: true
      })
      .select()

    if (testError) {
      console.log('⚠️ Erro no teste (esperado se não existir usuário de teste):', testError.message)
    } else {
      console.log('✅ Teste de inserção bem-sucedido!')
      // Limpar dados de teste
      await supabase
        .from('wishlist_veiculos')
        .delete()
        .eq('user_id', '00000000-0000-0000-0000-000000000000')
    }

  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

createWishlistTable()
