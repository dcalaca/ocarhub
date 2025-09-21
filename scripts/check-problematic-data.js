import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkProblematicData() {
  console.log('🔍 Verificando dados problemáticos...\n')

  try {
    // Buscar amostra de dados para verificar tamanhos
    console.log('📋 Amostra de dados da ocar_transbordo:')
    const { data: sampleData, error: sampleError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, codigo_fipe, referencia_mes, preco')
      .limit(20)

    if (sampleError) {
      console.log('   Erro:', sampleError.message)
    } else {
      sampleData.forEach((row, index) => {
        console.log(`   ${index + 1}. Marca: "${row.marca}" (${row.marca.length})`)
        console.log(`      Modelo: "${row.modelo}" (${row.modelo.length})`)
        console.log(`      Código FIPE: "${row.codigo_fipe}" (${row.codigo_fipe.length})`)
        console.log(`      Referência: "${row.referencia_mes}" (${row.referencia_mes.length})`)
        console.log(`      Preço: ${row.preco}`)
        console.log('   ---')
      })
    }

    // Verificar se há referência_mes com formato estranho
    console.log('\n🔍 Verificando formatos de referência_mes:')
    const { data: refFormats, error: refFormatsError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .limit(50)

    if (refFormatsError) {
      console.log('   Erro:', refFormatsError.message)
    } else {
      const uniqueRefs = [...new Set(refFormats.map(r => r.referencia_mes))]
      console.log(`   Formatos únicos encontrados (${uniqueRefs.length}):`)
      uniqueRefs.slice(0, 20).forEach((ref, index) => {
        console.log(`   ${index + 1}. "${ref}" (length: ${ref.length})`)
      })
    }

    // Verificar se há códigos FIPE com formato estranho
    console.log('\n🔍 Verificando formatos de códigos FIPE:')
    const { data: fipeFormats, error: fipeFormatsError } = await supabase
      .from('ocar_transbordo')
      .select('codigo_fipe')
      .limit(50)

    if (fipeFormatsError) {
      console.log('   Erro:', fipeFormatsError.message)
    } else {
      const uniqueFipes = [...new Set(fipeFormats.map(r => r.codigo_fipe))]
      console.log(`   Códigos FIPE únicos encontrados (${uniqueFipes.length}):`)
      uniqueFipes.slice(0, 20).forEach((fipe, index) => {
        console.log(`   ${index + 1}. "${fipe}" (length: ${fipe.length})`)
      })
    }

  } catch (error) {
    console.error('Erro ao verificar dados problemáticos:', error.message)
  }
}

checkProblematicData()
