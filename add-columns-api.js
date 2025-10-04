const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variáveis de ambiente do Supabase não encontradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function addColumns() {
  try {
    console.log('🔧 Adicionando colunas que faltam na tabela ocar_wishlist_veiculos...')
    
    // Tentar adicionar as colunas uma por uma
    const columns = [
      { name: 'unico_dono', type: 'BOOLEAN DEFAULT false' },
      { name: 'km_min', type: 'INTEGER' },
      { name: 'km_max', type: 'INTEGER' },
      { name: 'estado', type: 'VARCHAR(2)' }
    ]

    for (const column of columns) {
      try {
        console.log(`➕ Adicionando coluna ${column.name}...`)
        
        const { data, error } = await supabase.rpc('exec', {
          sql: `ALTER TABLE ocar_wishlist_veiculos ADD COLUMN IF NOT EXISTS ${column.name} ${column.type};`
        })

        if (error) {
          console.log(`⚠️ Erro ao adicionar ${column.name}:`, error.message)
        } else {
          console.log(`✅ Coluna ${column.name} adicionada com sucesso!`)
        }
      } catch (err) {
        console.log(`⚠️ Erro ao adicionar ${column.name}:`, err.message)
      }
    }

    // Testar inserção novamente
    console.log('🧪 Testando inserção após adicionar colunas...')
    
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

    const { data, error } = await supabase
      .from('ocar_wishlist_veiculos')
      .insert(testData)
      .select()

    if (error) {
      console.error('❌ Ainda há erro na inserção:', error)
      console.log('💡 Execute o SQL manualmente no painel do Supabase:')
      console.log(`
ALTER TABLE ocar_wishlist_veiculos 
ADD COLUMN IF NOT EXISTS unico_dono BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS km_min INTEGER,
ADD COLUMN IF NOT EXISTS km_max INTEGER,
ADD COLUMN IF NOT EXISTS estado VARCHAR(2);
      `)
    } else {
      console.log('✅ Inserção funcionando! Dados inseridos:', data)
      
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

addColumns()
