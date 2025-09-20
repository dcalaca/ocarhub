import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkVarchar10Limit() {
  console.log('🔍 Verificando campos com limite VARCHAR(10)...\n')

  try {
    // Verificar referência_mes (que tem VARCHAR(10))
    console.log('📅 Verificando referência_mes:')
    const { data: refData, error: refError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .limit(100)

    if (refError) {
      console.log('   Erro:', refError.message)
    } else {
      const longRefs = refData.filter(r => r.referencia_mes && r.referencia_mes.length > 10)
      console.log(`   Encontrados ${longRefs.length} registros com referência_mes > 10 chars:`)
      longRefs.slice(0, 10).forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
      
      // Verificar formato típico
      const uniqueRefs = [...new Set(refData.map(r => r.referencia_mes))]
      console.log(`\n   Formatos únicos encontrados (${uniqueRefs.length}):`)
      uniqueRefs.slice(0, 10).forEach((ref, index) => {
        console.log(`   ${index + 1}. "${ref}" (length: ${ref.length})`)
      })
    }

    // Verificar se há caracteres especiais ou espaços
    console.log('\n🔍 Verificando caracteres especiais:')
    const { data: specialData, error: specialError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .not('referencia_mes', 'like', '____-__') // Não no formato YYYY-MM
      .limit(20)

    if (specialError) {
      console.log('   Erro:', specialError.message)
    } else {
      console.log(`   Encontrados ${specialData.length} registros com formato estranho:`)
      specialData.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

    // Verificar se há referência_mes com espaços
    console.log('\n🔍 Verificando espaços em referência_mes:')
    const { data: spaceData, error: spaceError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .like('referencia_mes', '% %') // Contém espaços
      .limit(10)

    if (spaceError) {
      console.log('   Erro:', spaceError.message)
    } else {
      console.log(`   Encontrados ${spaceData.length} registros com espaços:`)
      spaceData.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

    // Verificar se há referência_mes NULL ou vazia
    console.log('\n🔍 Verificando referência_mes NULL ou vazia:')
    const { data: nullData, error: nullError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .or('referencia_mes.is.null,referencia_mes.eq.')
      .limit(10)

    if (nullError) {
      console.log('   Erro:', nullError.message)
    } else {
      console.log(`   Encontrados ${nullData.length} registros com referência_mes NULL ou vazia:`)
      nullData.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes?.length || 0})`)
      })
    }

  } catch (error) {
    console.error('Erro ao verificar VARCHAR(10):', error.message)
  }
}

checkVarchar10Limit()
