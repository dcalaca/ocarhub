import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugVarchar10Specific() {
  console.log('🔍 Verificando especificamente campos VARCHAR(10)...\n')

  try {
    // Verificar referência_mes com caracteres especiais ou longos
    console.log('📅 Verificando referência_mes problemática:')
    const { data: refData, error: refError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .limit(100)

    if (refError) {
      console.log('   Erro:', refError.message)
    } else {
      const problematicRefs = refData.filter(r => r.referencia_mes && r.referencia_mes.length > 10)
      console.log(`   Encontrados ${problematicRefs.length} registros com referência_mes > 10 chars:`)
      problematicRefs.slice(0, 10).forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

    // Verificar se há referência_mes com caracteres especiais
    console.log('\n🔍 Verificando referência_mes com caracteres especiais:')
    const { data: specialRefs, error: specialError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .not('referencia_mes', 'like', '____-__') // Não no formato YYYY-MM
      .limit(20)

    if (specialError) {
      console.log('   Erro:', specialError.message)
    } else {
      console.log(`   Encontrados ${specialRefs.length} registros com formato estranho:`)
      specialRefs.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

    // Verificar se há referência_mes NULL ou vazia
    console.log('\n🔍 Verificando referência_mes NULL ou vazia:')
    const { data: nullRefs, error: nullError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .or('referencia_mes.is.null,referencia_mes.eq.')
      .limit(10)

    if (nullError) {
      console.log('   Erro:', nullError.message)
    } else {
      console.log(`   Encontrados ${nullRefs.length} registros com referência_mes NULL ou vazia:`)
      nullRefs.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes?.length || 0})`)
      })
    }

    // Verificar se há referência_mes com espaços ou caracteres invisíveis
    console.log('\n🔍 Verificando referência_mes com espaços:')
    const { data: spaceRefs, error: spaceError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .like('referencia_mes', '% %') // Contém espaços
      .limit(10)

    if (spaceError) {
      console.log('   Erro:', spaceError.message)
    } else {
      console.log(`   Encontrados ${spaceRefs.length} registros com espaços:`)
      spaceRefs.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

  } catch (error) {
    console.error('Erro ao debugar VARCHAR(10):', error.message)
  }
}

debugVarchar10Specific()
