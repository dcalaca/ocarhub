// Script para testar a tabela de transbordo
// Execute: node test-transbordo.js

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function testTransbordo() {
  console.log('🧪 Testando tabela de transbordo...\n')

  try {
    // 1. Verificar se a tabela existe
    console.log('1️⃣ Verificando se a tabela existe...')
    
    // Verificar se a tabela existe tentando fazer uma consulta simples
    const { data: testData, error: tablesError } = await supabase
      .from('ocar_transbordo')
      .select('id')
      .limit(1)

    if (tablesError) {
      console.log('❌ Tabela ocar_transbordo não existe!')
      console.log('Execute o script: database/create-transbordo-simple.sql')
      return
    }

    console.log('✅ Tabela ocar_transbordo existe')

    // 2. Verificar se tem dados
    console.log('\n2️⃣ Verificando dados na tabela...')
    
    const { data: count, error: countError } = await supabase
      .from('ocar_transbordo')
      .select('*', { count: 'exact', head: true })

    if (countError) {
      console.log('❌ Erro ao contar registros:', countError.message)
      return
    }

    console.log(`✅ ${count} registros na tabela de transbordo`)

    // 3. Mostrar alguns exemplos
    if (count > 0) {
      console.log('\n3️⃣ Exemplos de dados:')
      
      const { data: examples, error: examplesError } = await supabase
        .from('ocar_transbordo')
        .select('marca, modelo, ano, codigo_fipe, processado')
        .limit(10)

      if (examplesError) {
        console.log('❌ Erro ao buscar exemplos:', examplesError.message)
        return
      }

      examples.forEach((example, index) => {
        console.log(`  ${index + 1}. ${example.marca} ${example.modelo} ${example.ano} (${example.codigo_fipe}) - ${example.processado ? 'Processado' : 'Pendente'}`)
      })
    }

    // 4. Verificar se as tabelas organizadas foram populadas
    console.log('\n4️⃣ Verificando tabelas organizadas...')
    
    const [brandsResult, modelsResult, yearsResult] = await Promise.all([
      supabase.from('ocar_fipe_brands').select('*', { count: 'exact', head: true }),
      supabase.from('ocar_fipe_models').select('*', { count: 'exact', head: true }),
      supabase.from('ocar_fipe_years').select('*', { count: 'exact', head: true })
    ])

    console.log(`  - Marcas: ${brandsResult.count}`)
    console.log(`  - Modelos: ${modelsResult.count}`)
    console.log(`  - Anos/Versões: ${yearsResult.count}`)

    // 5. Testar consulta específica
    console.log('\n5️⃣ Testando consulta específica...')
    
    const { data: hondaCivic, error: hondaError } = await supabase
      .from('ocar_transbordo')
      .select('marca, modelo, ano, codigo_fipe')
      .eq('marca', 'Honda')
      .eq('modelo', 'Civic')
      .limit(5)

    if (hondaError) {
      console.log('❌ Erro ao buscar Honda Civic:', hondaError.message)
    } else {
      console.log(`✅ ${hondaCivic.length} registros de Honda Civic encontrados:`)
      hondaCivic.forEach(record => {
        console.log(`  - ${record.ano}: ${record.codigo_fipe}`)
      })
    }

    console.log('\n🎉 Teste concluído!')

  } catch (error) {
    console.error('❌ Erro fatal:', error.message)
  }
}

testTransbordo()
