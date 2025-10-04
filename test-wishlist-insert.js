const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testWishlistInsert() {
  try {
    console.log('🧪 Testando inserção na tabela ocar_wishlist_veiculos...')
    
    const testData = {
      user_id: '091ef3dc-923b-467a-a4f6-a9660281494a',
      marca: 'Honda',
      modelo: 'Civic',
      versao: 'EXL 1.5',
      ano_min: 2020,
      ano_max: 2024,
      preco_min: 50000.00,
      preco_max: 100000.00,
      unico_dono: false,
      km_min: 10000,
      km_max: 50000,
      estado: 'SP',
      ativo: true
    }

    console.log('📝 Dados de teste:', testData)
    
    const { data, error } = await supabase
      .from('ocar_wishlist_veiculos')
      .insert(testData)
      .select()

    if (error) {
      console.error('❌ Erro ao inserir:', error)
      console.log('🔍 Detalhes do erro:', JSON.stringify(error, null, 2))
      return
    }

    console.log('✅ Inserção bem-sucedida!')
    console.log('📊 Dados inseridos:', data)
    
    // Limpar dados de teste
    if (data && data.length > 0) {
      const { error: deleteError } = await supabase
        .from('ocar_wishlist_veiculos')
        .delete()
        .eq('id', data[0].id)
      
      if (deleteError) {
        console.log('⚠️ Erro ao limpar dados de teste:', deleteError.message)
      } else {
        console.log('🧹 Dados de teste removidos')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

testWishlistInsert()
