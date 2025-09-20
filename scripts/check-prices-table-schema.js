import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkPricesTableSchema() {
  console.log('🔍 Verificando schema da tabela ocar_fipe_prices...\n')

  try {
    // Usar RPC para obter informações da tabela
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('exec_sql', {
        sql: `
          SELECT column_name, data_type, character_maximum_length, is_nullable
          FROM information_schema.columns 
          WHERE table_name = 'ocar_fipe_prices' 
          AND table_schema = 'public'
          ORDER BY ordinal_position;
        `
      })

    if (tableError) {
      console.log('   Erro ao buscar schema:', tableError.message)
      
      // Tentar método alternativo
      console.log('\n🔄 Tentando método alternativo...')
      const { data: altInfo, error: altError } = await supabase
        .from('ocar_fipe_prices')
        .select('*')
        .limit(0)

      if (altError) {
        console.log('   Erro alternativo:', altError.message)
      } else {
        console.log('   Tabela existe mas está vazia')
      }
    } else {
      console.log('   📋 Colunas da tabela ocar_fipe_prices:')
      tableInfo.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.column_name} (${col.data_type}${col.character_maximum_length ? `(${col.character_maximum_length})` : ''}) - ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'}`)
      })
    }

  } catch (error) {
    console.error('Erro ao verificar schema:', error.message)
  }
}

checkPricesTableSchema()
