import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTransbordoData() {
  console.log('🔍 Verificando dados na ocar_transbordo...\n')

  try {
    // Verificar contagem
    const { data: count, error: countError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Erro ao verificar contagem:', countError.message)
    } else {
      console.log(`📊 ocar_transbordo: ${count?.length || 0} registros`)
    }

    // Verificar amostra de dados
    const { data: sample, error: sampleError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe, referencia_mes, preco')
      .limit(5)

    if (sampleError) {
      console.log('❌ Erro ao verificar amostra:', sampleError.message)
    } else {
      console.log(`\n📋 Amostra de dados:`)
      sample.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.marca} ${row.modelo} ${row.ano} - R$ ${row.preco}`)
      })
    }

    // Verificar se há dados processados
    const { data: processed, error: processedError } = await supabase
      .from('ocar_transbordo')
      .select('processado')
      .eq('processado', true)
      .limit(1)

    if (processedError) {
      console.log('❌ Erro ao verificar processados:', processedError.message)
    } else {
      console.log(`\n🔄 Registros processados: ${processed?.length || 0}`)
    }

    // Verificar se há dados não processados
    const { data: unprocessed, error: unprocessedError } = await supabase
      .from('ocar_transbordo')
      .select('processado')
      .eq('processado', false)
      .limit(1)

    if (unprocessedError) {
      console.log('❌ Erro ao verificar não processados:', unprocessedError.message)
    } else {
      console.log(`🔄 Registros não processados: ${unprocessed?.length || 0}`)
    }

    if ((count?.length || 0) === 0) {
      console.log('\n⚠️ ATENÇÃO: ocar_transbordo está vazia!')
      console.log('   Você precisa importar dados primeiro.')
      console.log('   Use o script de importação CSV que criamos anteriormente.')
    }

  } catch (error) {
    console.error('Erro ao verificar dados:', error.message)
  }
}

checkTransbordoData()
