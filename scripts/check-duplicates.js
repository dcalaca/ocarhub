// Script para verificar duplicatas na tabela
// Execute: node scripts/check-duplicates.js

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

    // Buscar duplicatas
    console.log('🔍 Verificando duplicatas...')
    const { data: duplicates, error: dupError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe, count(*)')
      .group('marca, modelo, ano, codigo_fipe')
      .having('count(*) > 1')

    if (dupError) {
      console.log('❌ Erro ao verificar duplicatas:', dupError.message)
      return
    }

    if (duplicates && duplicates.length > 0) {
      console.log(`⚠️  Encontradas ${duplicates.length} combinações duplicadas:`)
      duplicates.slice(0, 10).forEach((dup, index) => {
        console.log(`   ${index + 1}. ${dup.marca} ${dup.modelo} ${dup.ano} - ${dup.codigo_fipe}`)
      })
      if (duplicates.length > 10) {
        console.log(`   ... e mais ${duplicates.length - 10} duplicatas`)
      }
    } else {
      console.log('✅ Nenhuma duplicata encontrada!')
    }

    // Mostrar algumas amostras
    console.log('\n🔍 Amostras dos dados:')
    const { data: samples } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe, preco')
      .order('marca, modelo, ano')
      .limit(5)

    if (samples && samples.length > 0) {
      samples.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.marca} ${item.modelo} ${item.ano} - R$ ${item.preco?.toLocaleString('pt-BR') || 'N/A'}`)
      })
    }

  } catch (error) {
    console.log('❌ Erro fatal:', error.message)
  }
}

checkDuplicates()
