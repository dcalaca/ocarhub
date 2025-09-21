import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kfsteismyqpekbaqwuez.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtmc3RlaXNteXFwZWtiYXF3dWV6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0ODU4NDMsImV4cCI6MjA2NTA2MTg0M30.nuHieAbGz65Lm5KlNamxO_HS_SFy0DGm6tIIbty7Z8A'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function debugVarchar10Error() {
  console.log('🔍 Verificando campos que podem causar erro VARCHAR(10)...\n')

  try {
    // Verificar referência_mes (que tem VARCHAR(10))
    console.log('📅 Verificando referência_mes > 10 caracteres:')
    const { data: refMonthData, error: refMonthError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .filter('LENGTH(referencia_mes)', 'gt', 10)
      .limit(10)

    if (refMonthError) {
      console.log('   Erro:', refMonthError.message)
    } else {
      console.log(`   Encontrados ${refMonthData.length} registros com referência_mes > 10 chars:`)
      refMonthData.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

    // Verificar códigos FIPE (que tem VARCHAR(20))
    console.log('\n🔢 Verificando códigos FIPE > 20 caracteres:')
    const { data: fipeData, error: fipeError } = await supabase
      .from('ocar_transbordo')
      .select('codigo_fipe')
      .filter('LENGTH(codigo_fipe)', 'gt', 20)
      .limit(10)

    if (fipeError) {
      console.log('   Erro:', fipeError.message)
    } else {
      console.log(`   Encontrados ${fipeData.length} registros com codigo_fipe > 20 chars:`)
      fipeData.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.codigo_fipe}" (length: ${row.codigo_fipe.length})`)
      })
    }

    // Verificar códigos de marca (que tem VARCHAR(20))
    console.log('\n🏷️ Verificando códigos de marca que seriam gerados:')
    const { data: brandData, error: brandError } = await supabase
      .from('ocar_transbordo')
      .select('marca')
      .limit(10)

    if (brandError) {
      console.log('   Erro:', brandError.message)
    } else {
      brandData.forEach((row, index) => {
        const generatedCode = row.marca.toLowerCase().replace(/\s+/g, '-').substring(0, 20)
        console.log(`   ${index + 1}. "${row.marca}" → "${generatedCode}" (length: ${generatedCode.length})`)
      })
    }

    // Verificar códigos de modelo (que tem VARCHAR(50))
    console.log('\n🚗 Verificando códigos de modelo que seriam gerados:')
    const { data: modelData, error: modelError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo')
      .limit(5)

    if (modelError) {
      console.log('   Erro:', modelError.message)
    } else {
      modelData.forEach((row, index) => {
        const brandCode = row.marca.toLowerCase().replace(/\s+/g, '-').substring(0, 20)
        const modelCode = `${brandCode}-${row.modelo.toLowerCase().replace(/\s+/g, '-')}`.substring(0, 50)
        console.log(`   ${index + 1}. "${row.marca} ${row.modelo}" → "${modelCode}" (length: ${modelCode.length})`)
      })
    }

    // Verificar se há campos com caracteres especiais que podem causar problemas
    console.log('\n🔍 Verificando caracteres especiais em referência_mes:')
    const { data: specialChars, error: specialError } = await supabase
      .from('ocar_transbordo')
      .select('referencia_mes')
      .filter('referencia_mes', 'like', '%[^0-9-]%')
      .limit(10)

    if (specialError) {
      console.log('   Erro:', specialError.message)
    } else {
      console.log(`   Encontrados ${specialChars.length} registros com caracteres especiais:`)
      specialChars.forEach((row, index) => {
        console.log(`   ${index + 1}. "${row.referencia_mes}" (length: ${row.referencia_mes.length})`)
      })
    }

  } catch (error) {
    console.error('Erro ao debugar campos VARCHAR:', error.message)
  }
}

debugVarchar10Error()
