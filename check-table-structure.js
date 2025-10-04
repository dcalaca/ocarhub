const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela ocar_wishlist_veiculos...')
    
    // Tentar inserir apenas com campos básicos primeiro
    const basicData = {
      user_id: '091ef3dc-923b-467a-a4f6-a9660281494a',
      marca: 'Honda',
      modelo: 'Civic',
      versao: 'EXL 1.5',
      ano_min: 2020,
      ano_max: 2024,
      preco_min: 50000.00,
      preco_max: 100000.00,
      ativo: true
    }

    console.log('🧪 Testando inserção com campos básicos...')
    console.log('📝 Dados:', basicData)
    
    const { data, error } = await supabase
      .from('ocar_wishlist_veiculos')
      .insert(basicData)
      .select()

    if (error) {
      console.error('❌ Erro com campos básicos:', error)
      console.log('🔍 Detalhes:', JSON.stringify(error, null, 2))
      
      // Tentar inserir apenas com campos obrigatórios
      const minimalData = {
        user_id: '091ef3dc-923b-467a-a4f6-a9660281494a',
        marca: 'Honda',
        ativo: true
      }
      
      console.log('🧪 Testando inserção com campos mínimos...')
      console.log('📝 Dados:', minimalData)
      
      const { data: minimalResult, error: minimalError } = await supabase
        .from('ocar_wishlist_veiculos')
        .insert(minimalData)
        .select()
      
      if (minimalError) {
        console.error('❌ Erro mesmo com campos mínimos:', minimalError)
      } else {
        console.log('✅ Inserção mínima funcionou!')
        console.log('📊 Dados inseridos:', minimalResult)
        
        // Limpar dados de teste
        if (minimalResult && minimalResult.length > 0) {
          await supabase
            .from('ocar_wishlist_veiculos')
            .delete()
            .eq('id', minimalResult[0].id)
          console.log('🧹 Dados de teste removidos')
        }
      }
    } else {
      console.log('✅ Inserção básica funcionou!')
      console.log('📊 Dados inseridos:', data)
      
      // Limpar dados de teste
      if (data && data.length > 0) {
        await supabase
          .from('ocar_wishlist_veiculos')
          .delete()
          .eq('id', data[0].id)
        console.log('🧹 Dados de teste removidos')
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error)
  }
}

checkTableStructure()
