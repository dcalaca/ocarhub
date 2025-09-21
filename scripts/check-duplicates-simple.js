// Script simples para verificar duplicatas na tabela
// Execute: node scripts/check-duplicates-simple.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkDuplicates() {
  try {
    console.log('🔍 Verificando status da tabela...')
    
    // Contar total de registros
    const { count, error: countError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Erro ao contar registros:', countError.message)
      return
    }

    console.log(`📊 Total de registros na tabela: ${count}`)

    if (count === 0) {
      console.log('✅ Tabela vazia - sem duplicatas!')
      return
    }

    // Buscar alguns registros para verificar duplicatas manualmente
    console.log('🔍 Verificando amostras de duplicatas...')
    const { data: samples, error: samplesError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe')
      .order('marca, modelo, ano')
      .limit(100)

    if (samplesError) {
      console.log('❌ Erro ao buscar amostras:', samplesError.message)
      return
    }

    // Verificar duplicatas nas amostras
    const seen = new Set()
    const duplicates = []
    
    samples.forEach(record => {
      const key = `${record.marca}|${record.modelo}|${record.ano}|${record.codigo_fipe}`
      if (seen.has(key)) {
        duplicates.push(record)
      } else {
        seen.add(key)
      }
    })

    if (duplicates.length > 0) {
      console.log(`⚠️  Encontradas ${duplicates.length} duplicatas nas primeiras 100 amostras:`)
      duplicates.slice(0, 10).forEach((dup, index) => {
        console.log(`   ${index + 1}. ${dup.marca} ${dup.modelo} ${dup.ano} - ${dup.codigo_fipe}`)
      })
    } else {
      console.log('✅ Nenhuma duplicata encontrada nas primeiras 100 amostras!')
    }

    // Mostrar algumas amostras
    console.log('\n🔍 Amostras dos dados:')
    samples.slice(0, 5).forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.marca} ${item.modelo} ${item.ano} - ${item.codigo_fipe}`)
    })

    // Verificar se temos registros únicos
    const uniqueCount = seen.size
    console.log(`\n📈 Registros únicos nas amostras: ${uniqueCount}`)
    console.log(`📊 Total de registros verificados: ${samples.length}`)

  } catch (error) {
    console.log('❌ Erro fatal:', error.message)
  }
}

checkDuplicates()
