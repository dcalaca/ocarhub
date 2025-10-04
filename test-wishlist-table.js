const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWishlistTable() {
  try {
    console.log('🔍 Testando se a tabela ocar_wishlist_veiculos existe...')
    
    // Tentar fazer uma consulta simples na tabela
    const { data, error } = await supabase
      .from('ocar_wishlist_veiculos')
      .select('id')
      .limit(1)

    if (error) {
      console.log('❌ Tabela não existe ou erro:', error.message)
      console.log('💡 Execute o SQL no painel do Supabase:')
      console.log(`
-- Execute este SQL no painel do Supabase:

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
  unico_dono BOOLEAN DEFAULT false,
  km_min INTEGER,
  km_max INTEGER,
  estado VARCHAR(2),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_user_id ON ocar_wishlist_veiculos(user_id);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_marca ON ocar_wishlist_veiculos(marca);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_ativo ON ocar_wishlist_veiculos(ativo);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_created_at ON ocar_wishlist_veiculos(created_at);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_estado ON ocar_wishlist_veiculos(estado);
CREATE INDEX IF NOT EXISTS idx_ocar_wishlist_unico_dono ON ocar_wishlist_veiculos(unico_dono);
      `)
      return
    }

    console.log('✅ Tabela ocar_wishlist_veiculos existe e está funcionando!')
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros')
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testWishlistTable()
